"""
Agent tools layer.

TOOL_DECLARATIONS   : JSON schema the LLM sees, describing what it can call.
dispatch_tool_call() : takes the LLM's chosen tool name + args, runs the real
                        crud.py function against MySQL, and returns both a
                        plain-text result (for the LLM to summarize back to
                        the user) and a "ui_event" dict (for the frontend to
                        render/patch live).

This is the ONLY place that translates "LLM wants to do X" into "run real
SQL". Nothing here talks to Gemini directly, and nothing in agent.py talks
to the database directly — keeps the boundary clean.
"""

from sqlalchemy.orm import Session
from app import crud, schemas, models

TOOL_DECLARATIONS = [
    {
        "name": "list_students",
        "description": "List students, optionally filtered by department id. Use this when the user asks to see, view, or list students.",
        "parameters": {
            "type": "object",
            "properties": {
                "dept_id": {"type": "integer", "description": "Optional department id to filter by"},
                "limit": {"type": "integer", "description": "Max rows to return, default 50"},
            },
            "required": [],
        },
    },
    {
        "name": "get_student",
        "description": "Get full details for a single student by their student_id.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_id": {"type": "string", "description": "e.g. STU00001"},
            },
            "required": ["student_id"],
        },
    },
    {
        "name": "create_student",
        "description": "Add a new student record. Auto-generates student_id if not given.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_name": {"type": "string"},
                "roll_no": {"type": "string"},
                "dept_id": {"type": "integer", "description": "1=CSE, 2=ECE, 3=EEE, 4=MECH, 5=IT, 6=CIVIL"},
                "batch": {"type": "string", "description": "e.g. 2022-2026"},
                "year_of_joining": {"type": "integer"},
                "year_of_completion": {"type": "integer"},
                "gender": {"type": "string"},
                "staff_id": {"type": "string"},
                "gcpa": {"type": "number", "description": "Starting GCPA, default 0"},
            },
            "required": ["student_name", "roll_no", "dept_id", "batch",
                         "year_of_joining", "year_of_completion", "gender", "staff_id"],
        },
    },
    {
        "name": "update_student",
        "description": "Update one or more fields on an existing student. Only include fields that should change.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_id": {"type": "string"},
                "student_name": {"type": "string"},
                "roll_no": {"type": "string"},
                "dept_id": {"type": "integer"},
                "batch": {"type": "string"},
                "gender": {"type": "string"},
                "staff_id": {"type": "string"},
                "gcpa": {"type": "number"},
            },
            "required": ["student_id"],
        },
    },
    {
        "name": "delete_student",
        "description": "Permanently delete a student and their related attendance/academic records.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_id": {"type": "string"},
            },
            "required": ["student_id"],
        },
    },
    {
        "name": "get_academic_records",
        "description": "Get all 4 years of academic records (marks, grade, sgpa) for a student.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_id": {"type": "string"},
            },
            "required": ["student_id"],
        },
    },
    {
        "name": "get_attendance",
        "description": "Get a single student's leave/attendance numbers by student_id.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_id": {"type": "string"},
            },
            "required": ["student_id"],
        },
    },
    {
        "name": "list_attendance",
        "description": "List attendance/leave records for students, optionally filtered by department. Use this when the user asks to see or show attendance for a department or group of students (not just one student).",
        "parameters": {
            "type": "object",
            "properties": {
                "dept_id": {"type": "integer", "description": "Optional department id to filter by, e.g. 1=CSE"},
                "limit": {"type": "integer", "description": "Max rows to return, default 50"},
            },
            "required": [],
        },
    },
    {
        "name": "update_attendance",
        "description": "Update a student's leave/on-duty numbers.",
        "parameters": {
            "type": "object",
            "properties": {
                "student_id": {"type": "string"},
                "leave": {"type": "integer", "description": "Total leave allotted"},
                "leave_taken_so_far": {"type": "integer"},
                "on_duty": {"type": "integer"},
            },
            "required": ["student_id"],
        },
    },
]


def _student_to_dict(s: models.Student) -> dict:
    return {
        "student_id": s.student_id, "roll_no": s.roll_no, "student_name": s.student_name,
        "dept_id": s.dept_id, "batch": s.batch, "year_of_joining": s.year_of_joining,
        "year_of_completion": s.year_of_completion, "gender": s.gender,
        "staff_id": s.staff_id, "gcpa": float(s.gcpa),
    }


def dispatch_tool_call(name: str, args: dict, db: Session) -> tuple[dict, dict | None]:
    """
    Returns (result_for_llm, ui_event_for_frontend).
    ui_event is None for read-only calls that don't need to patch the UI
    beyond the normal chat response (kept simple — expand as needed).
    """

    if name == "list_students":
        limit = args.get("limit", 50)
        rows = crud.get_students(db, limit=limit, dept_id=args.get("dept_id"))
        data = [_student_to_dict(r) for r in rows]
        return (
            {"count": len(data), "students": data},
            {"type": "render_table", "table": "students", "rows": data},
        )

    if name == "get_student":
        s = crud.get_student(db, args["student_id"])
        if not s:
            return {"error": "not found"}, None
        data = _student_to_dict(s)
        return data, {"type": "render_table", "table": "students", "rows": [data]}

    if name == "create_student":
        student_id = args.get("student_id") or crud.next_student_id(db)
        payload = schemas.StudentCreate(
            student_id=student_id,
            student_name=args["student_name"], roll_no=args["roll_no"],
            dept_id=args["dept_id"], batch=args["batch"],
            year_of_joining=args["year_of_joining"], year_of_completion=args["year_of_completion"],
            gender=args["gender"], staff_id=args["staff_id"], gcpa=args.get("gcpa", 0.0),
        )
        s = crud.create_student(db, payload)
        data = _student_to_dict(s)
        return data, {"type": "row_created", "table": "students", "data": data}

    if name == "update_student":
        student_id = args.pop("student_id")
        updates = schemas.StudentUpdate(**{k: v for k, v in args.items() if v is not None})
        s = crud.update_student(db, student_id, updates)
        if not s:
            return {"error": "not found"}, None
        data = _student_to_dict(s)
        return data, {"type": "row_updated", "table": "students", "id": student_id, "data": data}

    if name == "delete_student":
        s = crud.delete_student(db, args["student_id"])
        if not s:
            return {"error": "not found"}, None
        return (
            {"deleted": args["student_id"]},
            {"type": "row_deleted", "table": "students", "id": args["student_id"]},
        )

    if name == "get_academic_records":
        records = crud.get_academic_records(db, args["student_id"])
        data = [
            {
                "record_id": r.record_id, "year_level": r.year_level,
                "subject_1_name": r.subject_1_name, "subject_1_marks": r.subject_1_marks,
                "subject_2_name": r.subject_2_name, "subject_2_marks": r.subject_2_marks,
                "subject_3_name": r.subject_3_name, "subject_3_marks": r.subject_3_marks,
                "total": r.total, "grade": r.grade, "sgpa": float(r.sgpa),
            } for r in records
        ]
        return (
            {"student_id": args["student_id"], "records": data},
            {"type": "render_table", "table": "academic_records", "rows": data},
        )

    if name == "get_attendance":
        att = crud.get_attendance(db, args["student_id"])
        if not att:
            return {"error": "not found"}, None
        data = {
            "attendance_id": att.attendance_id, "student_id": att.student_id,
            "leave": att.leave, "leave_taken_so_far": att.leave_taken_so_far, "on_duty": att.on_duty,
        }
        return data, {"type": "render_table", "table": "attendance", "rows": [data]}

    if name == "list_attendance":
        limit = args.get("limit", 50)
        pairs = crud.get_attendance_by_dept(db, dept_id=args.get("dept_id"), limit=limit)
        data = [
            {
                "attendance_id": att.attendance_id, "student_id": att.student_id,
                "student_name": student.student_name, "dept_id": student.dept_id,
                "leave": att.leave, "leave_taken_so_far": att.leave_taken_so_far, "on_duty": att.on_duty,
            }
            for att, student in pairs
        ]
        return (
            {"count": len(data), "attendance": data},
            {"type": "render_table", "table": "attendance", "rows": data},
        )

    if name == "update_attendance":
        student_id = args.pop("student_id")
        updates = schemas.AttendanceUpdate(**{k: v for k, v in args.items() if v is not None})
        att = crud.update_attendance(db, student_id, updates)
        if not att:
            return {"error": "not found"}, None
        data = {
            "attendance_id": att.attendance_id, "student_id": att.student_id,
            "leave": att.leave, "leave_taken_so_far": att.leave_taken_so_far, "on_duty": att.on_duty,
        }
        return data, {"type": "row_updated", "table": "attendance", "id": student_id, "data": data}

    return {"error": f"unknown tool {name}"}, None
