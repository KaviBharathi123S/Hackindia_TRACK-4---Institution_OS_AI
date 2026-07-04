"""
CRUD functions — plain Python functions wrapping DB operations.
Keeping these separate from main.py matters for Track 04: later, your
agent's "tools" (create_student, update_student, delete_student, ...)
will call these exact same functions instead of duplicating logic.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas


# ---------- Students ----------

def get_students(db: Session, skip: int = 0, limit: int = 100, dept_id: int | None = None):
    query = db.query(models.Student)
    if dept_id is not None:
        query = query.filter(models.Student.dept_id == dept_id)
    return query.offset(skip).limit(limit).all()


def get_student(db: Session, student_id: str):
    return db.query(models.Student).filter(models.Student.student_id == student_id).first()


def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: str, updates: schemas.StudentUpdate):
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_student, field, value)
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: str):
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    db.delete(db_student)  # cascades to attendance + academic_records
    db.commit()
    return db_student


def next_student_id(db: Session) -> str:
    """Generate the next STUxxxxx id, so the agent doesn't have to invent one."""
    count = db.query(func.count(models.Student.student_id)).scalar() or 0
    return f"STU{str(count + 1).zfill(5)}"


# ---------- Attendance ----------

def get_attendance(db: Session, student_id: str):
    return db.query(models.Attendance).filter(models.Attendance.student_id == student_id).first()


def get_attendance_by_dept(db: Session, dept_id: int | None = None, limit: int = 100):
    """Join attendance with students so callers get names/dept alongside numbers."""
    query = db.query(models.Attendance, models.Student).join(
        models.Student, models.Attendance.student_id == models.Student.student_id
    )
    if dept_id is not None:
        query = query.filter(models.Student.dept_id == dept_id)
    return query.limit(limit).all()


def update_attendance(db: Session, student_id: str, updates: schemas.AttendanceUpdate):
    db_att = get_attendance(db, student_id)
    if not db_att:
        return None
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_att, field, value)
    db.commit()
    db.refresh(db_att)
    return db_att


# ---------- Academic records ----------

def get_academic_records(db: Session, student_id: str):
    return db.query(models.AcademicRecord).filter(
        models.AcademicRecord.student_id == student_id
    ).order_by(models.AcademicRecord.year_level).all()


# ---------- Departments / Counsellors (reference data) ----------

def get_departments(db: Session):
    return db.query(models.Department).all()


def get_counsellors(db: Session):
    return db.query(models.Counsellor).all()
