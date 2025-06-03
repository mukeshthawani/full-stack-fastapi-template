# Google Calendar Frontend Walkthrough

This guide explains how to build a minimal Google Calendar page in the template's React frontend. It can be used as an example of how to extend the project with new pages and API helpers.

## 1. Editing the Template

All frontend source code lives in `frontend/src`.

* **Sidebar items** – The items rendered in the left navigation are defined in `src/components/Common/SidebarItems.tsx`.
* **Routes** – Pages are implemented in `src/routes`. The routing tree is generated into `routeTree.gen.ts` and must be updated whenever new pages are added.
* **API client** – The folder `src/client` contains the generated API client. Additional helper files can live here as well.

To add a new feature, create a React component under `src/routes/_layout` and add a matching entry in `SidebarItems.tsx`. After adding a page, run `npm run build` to regenerate `routeTree.gen.ts`.

## 2. Creating the Calendar Page

The calendar example adds four pieces:

1. `src/client/GoogleService.ts` – A small wrapper with `saveCredentials()` and `getEventsNextHour()` methods. These call the backend endpoints defined in `backend/app/api/routes/google.py`.
2. An extra menu item pointing to `/calendar` in `src/components/Common/SidebarItems.tsx`.
3. A React page component in `src/routes/_layout/calendar.tsx`. It lets you paste your OAuth token JSON, save it to the backend, and query upcoming events.
4. The automatically generated routing file `routeTree.gen.ts` was updated after adding the page.

## 3. Running the Frontend

Install dependencies and run the development server from the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Then visit <http://localhost:5173/> in your browser. Use the “Calendar” link in the sidebar to open the new page.
