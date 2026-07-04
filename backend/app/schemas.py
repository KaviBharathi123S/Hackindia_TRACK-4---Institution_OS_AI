"""
Pydantic schemas — define what goes IN (Create/Update) and what comes OUT
(Read) of the API. Keeping these separate from the ORM models means the
agent's tool calls later can validate against these same shapes.
"""

from pydantic import BaseModel, ConfigDict


class DepartmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dept_id: int
    dept_name: str
    dept_code: str
    hod_name: str


class CounsellorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    counsellor_id: int
    year_level: int
    counsellor_name: str


class StudentBase(BaseModel):
    roll_no: str
    student_name: str
    dept_id: int
    batch: str
    year_of_joining: int
    year_of_completion: int
    gender: str
    staff_id: str
    gcpa: float


class StudentCreate(StudentBase):
    student_id: str  # e.g. "STU00951" — caller supplies it (or agent auto-generates)


class StudentUpdate(BaseModel):
    """All fields optional — only send what you want to change (PATCH semantics)."""
    roll_no: str | None = None
    student_name: str | None = None
    dept_id: int | None = None
    batch: str | None = None
    year_of_joining: int | None = None
    year_of_completion: int | None = None
    gender: str | None = None
    staff_id: str | None = None
    gcpa: float | None = None


class StudentRead(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    student_id: str


class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    attendance_id: str
    student_id: str
    leave: int
    leave_taken_so_far: int
    on_duty: int


class AttendanceUpdate(BaseModel):
    leave: int | None = None
    leave_taken_so_far: int | None = None
    on_duty: int | None = None


class AcademicRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    record_id: str
    student_id: str
    year_level: int
    counsellor_id: int
    subject_1_name: str
    subject_1_marks: int
    subject_2_name: str
    subject_2_marks: int
    subject_3_name: str
    subject_3_marks: int
    total: int
    grade: str
    sgpa: float
