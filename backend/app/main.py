"""
FastAPI entrypoint.

Run locally:
    uvicorn app.main:app --reload --port 8000

Then open http://localhost:8000/docs for interactive Swagger UI to test
every endpoint before wiring the agent to it.

This file ONLY handles plain REST CRUD against the dataset for now.
The agent + WebSocket/dynamic-UI layer (Track 04's actual requirement)
gets added on top of this in the next step — see crud.py docstring.
"""

import json

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, get_db, Base, SessionLocal
from app import models, schemas, crud
from app.agent import run_agent_turn

# Creates tables if they don't already exist (no-op if you already ran student_dataset.sql)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Records API", version="1.0.0")

# Allow your frontend (React/Next dev server etc.) to call this API during the hackathon.
# Tighten this before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "student-records-api"}


# ---------- Departments / Counsellors (read-only reference data) ----------

@app.get("/departments", response_model=list[schemas.DepartmentRead])
def list_departments(db: Session = Depends(get_db)):
    return crud.get_departments(db)


@app.get("/counsellors", response_model=list[schemas.CounsellorRead])
def list_counsellors(db: Session = Depends(get_db)):
    return crud.get_counsellors(db)


# ---------- Students ----------

@app.get("/students", response_model=list[schemas.StudentRead])
def list_students(skip: int = 0, limit: int = 100, dept_id: int | None = None,
                   db: Session = Depends(get_db)):
    return crud.get_students(db, skip=skip, limit=limit, dept_id=dept_id)


@app.get("/students/{student_id}", response_model=schemas.StudentRead)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/students", response_model=schemas.StudentRead, status_code=201)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    if crud.get_student(db, student.student_id):
        raise HTTPException(status_code=409, detail="student_id already exists")
    return crud.create_student(db, student)


@app.patch("/students/{student_id}", response_model=schemas.StudentRead)
def update_student(student_id: str, updates: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = crud.update_student(db, student_id, updates)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.delete_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return None


# ---------- Attendance ----------

@app.get("/students/{student_id}/attendance", response_model=schemas.AttendanceRead)
def get_attendance(student_id: str, db: Session = Depends(get_db)):
    att = crud.get_attendance(db, student_id)
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return att


@app.patch("/students/{student_id}/attendance", response_model=schemas.AttendanceRead)
def update_attendance(student_id: str, updates: schemas.AttendanceUpdate, db: Session = Depends(get_db)):
    att = crud.update_attendance(db, student_id, updates)
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return att


# ---------- Academic records ----------

@app.get("/students/{student_id}/academic-records", response_model=list[schemas.AcademicRecordRead])
def get_academic_records(student_id: str, db: Session = Depends(get_db)):
    records = crud.get_academic_records(db, student_id)
    if not records:
        raise HTTPException(status_code=404, detail="No academic records for this student")
    return records


# ---------- Agent chat (Track 04 core requirement) ----------
#
# One WebSocket connection per chat session. The frontend sends plain text
# user messages; the server runs the agent loop (Gemini + tool-calling
# against real MySQL data via crud.py) and pushes back a JSON envelope:
#
#   {"reply": "...",  ui_events": [ {"type": "render_table", ...}, ... ]}
#
# The frontend's job: render `reply` in the chat feed, and for each
# ui_event, mount/patch the matching component (table/form/modal) based on
# its `type` — this is what satisfies "no refresh, no manual re-query".

@app.websocket("/ws/chat/{session_id}")
async def chat_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    db = SessionLocal()  # one DB session for the life of this connection
    try:
        while True:
            user_text = await websocket.receive_text()
            try:
                result = run_agent_turn(db, session_id, user_text)
                await websocket.send_text(json.dumps(result))
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "reply": f"Something went wrong: {e}",
                    "ui_events": [],
                }))
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
