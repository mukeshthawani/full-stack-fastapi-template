# Google Calendar Integration

This document explains how the backend was extended using the **Full Stack FastAPI Template** to fetch calendar events from Google.

## 1. Install Google API dependencies

Add the required packages in `backend/pyproject.toml` under `[project.dependencies]`:

```toml
"google-api-python-client<3.0.0,>=2.120.0",
"google-auth<3.0.0,>=2.29.0",
"google-auth-oauthlib<2.0.0,>=1.1.0",
```

Sync the environment:

```bash
cd backend
uv sync
```

## 2. Create a model to store OAuth credentials

Add a new table in `backend/app/models.py`:

```python
class GoogleCredentials(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", unique=True, nullable=False, ondelete="CASCADE"
    )
    credentials_json: str
    expiry: datetime | None = None

    user: User | None = Relationship(back_populates="google_credentials")
```

Generate and apply an Alembic revision after editing the models:

```bash
docker compose exec backend alembic revision --autogenerate -m "Add Google credentials"
docker compose exec backend alembic upgrade head
```

The migration for this guide is stored in `backend/app/alembic/versions/847d7a4df0ea_add_google_credentials.py`.

## 3. CRUD helpers

Create helper functions in `backend/app/crud.py` to read and write the credentials:

```python
 def get_google_credentials(session: Session, user_id: uuid.UUID) -> GoogleCredentials | None:
     statement = select(GoogleCredentials).where(GoogleCredentials.user_id == user_id)
     return session.exec(statement).first()

 def upsert_google_credentials(session: Session, user_id: uuid.UUID, credentials_json: str) -> GoogleCredentials:
     creds = get_google_credentials(session, user_id)
     if creds:
         creds.credentials_json = credentials_json
     else:
         creds = GoogleCredentials(user_id=user_id, credentials_json=credentials_json)
     session.add(creds)
     session.commit()
     session.refresh(creds)
     return creds
```

## 4. API routes

Create `backend/app/api/routes/google.py` with endpoints to save credentials and read events:

```python
router = APIRouter(prefix="/google", tags=["google"])

@router.post("/credentials", response_model=Message)
def save_credentials(*, session: SessionDep, current_user: CurrentUser, credentials_json: str) -> Message:
    crud.upsert_google_credentials(session, current_user.id, credentials_json)
    return Message(message="Credentials saved")

@router.get("/events/next-hour")
def get_events_next_hour(session: SessionDep, current_user: CurrentUser) -> Any:
    creds = crud.get_google_credentials(session, current_user.id)
    if not creds:
        raise HTTPException(status_code=404, detail="Google credentials not found")
    data = json.loads(creds.credentials_json)
    credentials = Credentials.from_authorized_user_info(data)
    service = build("calendar", "v3", credentials=credentials)
    now = datetime.now(timezone.utc)
    time_max = (now + timedelta(hours=1)).isoformat()
    events_result = (
        service.events()
        .list(calendarId="primary", timeMin=now.isoformat(), timeMax=time_max, singleEvents=True, orderBy="startTime")
        .execute()
    )
    return {"events": events_result.get("items", [])}
```

Register this router in `backend/app/api/main.py`:

```python
from app.api.routes import google
api_router.include_router(google.router)
```

## 5. Testing

After making the modifications run the linters and the tests:

```bash
pre-commit run --files backend/app/models.py backend/app/crud.py backend/app/api/routes/google.py backend/app/api/main.py backend/app/alembic/versions/847d7a4df0ea_add_google_credentials.py backend/pyproject.toml
bash backend/scripts/test.sh
```

The tests require the database and other services to be running with Docker Compose.

## 6. File overview

- **backend/app/models.py** – Pydantic/SQLModel models and database tables.
- **backend/app/crud.py** – Helper functions to create and retrieve data.
- **backend/app/api/routes/** – FastAPI routers grouped by feature. `google.py` contains the new endpoints.
- **backend/app/api/main.py** – Main router where feature routers are included.
- **backend/app/alembic/** – Database migrations.
- **backend/pyproject.toml** – Backend dependencies and Python settings.

This should give you an idea of how the project was extended from the template to add Google Calendar support. You can use the same approach to integrate other external services.
