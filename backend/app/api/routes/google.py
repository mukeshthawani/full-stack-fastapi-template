import json
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Message

router = APIRouter(prefix="/google", tags=["google"])


@router.post("/credentials", response_model=Message)
def save_credentials(
    *, session: SessionDep, current_user: CurrentUser, credentials_json: str
) -> Message:
    """Save Google OAuth credentials for the current user."""
    crud.upsert_google_credentials(session, current_user.id, credentials_json)
    return Message(message="Credentials saved")


@router.get("/events/next-hour")
def get_events_next_hour(session: SessionDep, current_user: CurrentUser) -> Any:
    """Get Google Calendar events for the next hour."""
    creds = crud.get_google_credentials(session, current_user.id)
    if not creds:
        raise HTTPException(status_code=404, detail="Google credentials not found")
    data = json.loads(creds.credentials_json)
    credentials = Credentials.from_authorized_user_info(data)
    service = build("calendar", "v3", credentials=credentials)
    now = datetime.now(timezone.utc)
    time_min = now.isoformat()
    time_max = (now + timedelta(hours=1)).isoformat()
    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    return {"events": events_result.get("items", [])}
