# Institution OS AI — Frontend

React + Vite + Tailwind + Framer Motion + Chart.js. Connects to your FastAPI
backend for real student data and a real AI Assistant (WebSocket to your
Gemini-powered agent) — no dummy chatbot, no simulated responses.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Your backend must be running at the same
time on `http://localhost:8000` (see the backend's own README) — this app
fetches real students from `/students` and chats over
`/ws/chat/{session_id}`.

If your backend runs on a different host/port, change the two constants at
the top of `src/config.js`:
```js
export const API_BASE = 'http://localhost:8000'
export const WS_BASE = 'ws://localhost:8000'
```

## Project structure

```
src/
├── config.js                    # backend URLs + department id→name map
├── App.jsx                       # routes
├── context/StudentsContext.jsx   # global student list — the thing that
│                                   makes pages update live when the AI
│                                   assistant changes data
├── hooks/useAgentSocket.js       # WebSocket connection + auto-reconnect
├── components/
│   ├── AIAssistantPanel.jsx      # the real chat UI, wired to the WebSocket
│   ├── InlineChatEvent.jsx       # renders ui_events INSIDE the chat feed
│   │                               (tables / created / updated / deleted)
│   ├── Sidebar.jsx, Navbar.jsx
│   ├── CircularStat.jsx, DepartmentStats.jsx, RecentActivityTable.jsx
│   ├── StatusBadge.jsx, LoginForm.jsx
└── pages/
    ├── Landing.jsx, LoginSelect.jsx, StaffLogin.jsx, StudentLogin.jsx
    ├── Dashboard.jsx              # sidebar + stats + AI assistant together
    ├── StudentDetails.jsx, Grades.jsx, Attendance.jsx
```

## How the "dynamic UI" actually works (the Track 04 requirement)

1. `AIAssistantPanel.jsx` opens `ws://localhost:8000/ws/chat/{sessionId}`
   via the `useAgentSocket` hook.
2. User sends a message → raw text goes over the socket.
3. Backend replies with `{"reply": "...", "ui_events": [...]}`.
4. `AIAssistantPanel` does two things with that:
   - Renders `reply` as a chat bubble, and each `ui_event` inline right
     below it via `InlineChatEvent` (this is the "renders UI mid-conversation"
     requirement — a live table/confirmation card appears IN the chat).
   - Calls `addStudent` / `updateStudent` / `removeStudent` on the shared
     `StudentsContext`. Since `Dashboard.jsx` and `StudentDetails.jsx` both
     read from that same context, they re-render automatically — no
     refresh, no re-fetch, no polling.

## Known gaps / things to verify once running

- **Icon names**: uses `lucide-react` icons like `ShieldCheck`, `GraduationCap`,
  `Bot`, `Send` — these are stable across recent versions, but if any fail
  to import, check `node_modules/lucide-react` for the exact export name.
- **Chart.js registration**: each chart page registers only the Chart.js
  elements it uses (`ArcElement` for doughnuts, `BarElement`/`LineElement`
  for bar/line). If you add a new chart type, remember to register its
  element too or Chart.js throws a runtime error.
- **This code was written without network access to actually run `npm install`
  or `npm run dev`** — every file passed a JS/JSX syntax check, but real
  dependency resolution and browser rendering haven't been verified. If you
  hit a runtime error on first run, paste it here and we'll fix it fast.
- **Attendance/grade numbers on the Dashboard and Department Stats cards are
  placeholders** (derived deterministically, not from a real attendance
  table) — your backend has real attendance data in the `attendance` table
  but no bulk endpoint for it yet. Say the word if you want that added.
