# Student Records API (FastAPI + MySQL)

Connects your `student_dataset.sql` dataset to a FastAPI backend with full REST
CRUD, ready to plug an AI agent's tool calls into next.

## 1. Load the dataset into MySQL

```bash
mysql -u root -p < student_dataset.sql
```
This creates the `student_records` database with 5 tables (departments,
counsellors, students, attendance, academic_records) already populated.

## 2. Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your real MySQL username/password
```

## 3. Run it

```bash
uvicorn app.main:app --reload --port 8000
```

Open **http://localhost:8000/docs** — Swagger UI lets you try every endpoint
(list students, get one, create, update, delete, view attendance/academic
records) directly in the browser before wiring up the agent.

## 4. Project layout

```
backend/
├── requirements.txt
├── .env.example
└── app/
    ├── database.py   # engine, session, get_db() dependency
    ├── models.py     # SQLAlchemy ORM models (mirrors the SQL schema exactly)
    ├── schemas.py     # Pydantic request/response shapes
    ├── crud.py         # DB operations — the agent's tools will call these directly
    └── main.py         # FastAPI app + REST routes
```

## Why this structure

`crud.py` is deliberately separated from `main.py`. When you build the agent
next, its tool functions (`create_student`, `update_student`,
`delete_student`, ...) should call the exact same functions in `crud.py`
that the REST routes call — so the agent and the REST API can never get out
of sync, and you don't write the DB logic twice.

## Endpoints available now

| Method | Path | Purpose |
|---|---|---|
| GET | `/departments` | list departments (incl. HOD) |
| GET | `/counsellors` | list counsellors |
| GET | `/students` | list students (`?dept_id=`, `?skip=`, `?limit=`) |
| GET | `/students/{id}` | get one student |
| POST | `/students` | create student |
| PATCH | `/students/{id}` | update student (partial) |
| DELETE | `/students/{id}` | delete student |
| GET | `/students/{id}/attendance` | get attendance |
| PATCH | `/students/{id}/attendance` | update attendance |
| GET | `/students/{id}/academic-records` | get all 4 years of records |

## Step 2: Agent + tool-calling (now included)

`app/agent_tools.py`, `app/session_store.py`, and `app/agent.py` add a
stateful conversational layer on top of the REST API above, using Google
Gemini (free tier, no credit card needed).

### Setup
1. Get a free key at https://aistudio.google.com/apikey
2. Add it to `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. `pip install -r requirements.txt` again (adds `google-genai`)
4. Restart the server: `uvicorn app.main:app --reload --port 8000`

### How it works
- `agent_tools.py` — defines the tools Gemini can call (`list_students`,
  `create_student`, `update_student`, `delete_student`, etc.), each one
  wrapping the exact same `crud.py` functions the REST routes use. Every
  tool call also returns a `ui_event` describing what the frontend should
  render (`render_table`, `row_created`, `row_updated`, `row_deleted`).
- `session_store.py` — tracks per-conversation state (last student
  viewed/created/updated) so "delete that one" resolves without repeating
  the exact ID every time. In-memory for the hackathon; swap for Redis if
  you need it to survive restarts.
- `agent.py` — the loop: send the message + tools to Gemini → if it wants
  to call a tool, run it for real against MySQL → feed the result back →
  Gemini writes a natural-language confirmation.
- `main.py` exposes `/ws/chat/{session_id}` — a WebSocket endpoint. Send
  it plain text messages, it replies with:
  ```json
  {"reply": "Added the new student.", "ui_events": [{"type": "row_created", "table": "students", "data": {...}}]}
  ```

### Quick test (without a frontend yet)
With the server running, test the WebSocket from a Python shell:
```python
import asyncio, websockets, json

async def test():
    async with websockets.connect("ws://localhost:8000/ws/chat/test1") as ws:
        await ws.send("List all students in department 1")
        print(await ws.recv())
        await ws.send("Now delete that student STU00005")
        print(await ws.recv())

asyncio.run(test())
```

⚠️ This agent code was written without live network/API access to test
against the real Gemini API — it follows the documented `google-genai`
manual function-calling pattern, but if you hit an SDK error on first run,
check `pip show google-genai` against the current docs at
https://github.com/googleapis/python-genai — the manual tool-calling
signatures shift slightly between minor SDK versions.

## Next step

Once the WebSocket chat is confirmed working (test above returns real
data), the final piece is the frontend: a chat UI + WebSocket listener that
mounts a table/form/modal component based on each incoming `ui_event.type`.
