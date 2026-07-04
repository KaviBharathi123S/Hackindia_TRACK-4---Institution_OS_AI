"""
SQLAlchemy ORM models — mirror the tables created by student_dataset.sql exactly.
If you run student_dataset.sql first, these classes map straight onto the
existing tables (no migration needed). If the tables don't exist yet,
Base.metadata.create_all() in main.py will create them from these definitions.
"""

from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True)
    dept_name = Column(String(100), nullable=False)
    dept_code = Column(String(10), nullable=False)
    hod_name = Column(String(50), nullable=False)

    students = relationship("Student", back_populates="department")


class Counsellor(Base):
    __tablename__ = "counsellors"

    counsellor_id = Column(Integer, primary_key=True)
    year_level = Column(Integer, nullable=False)
    counsellor_name = Column(String(50), nullable=False)

    academic_records = relationship("AcademicRecord", back_populates="counsellor")


class Student(Base):
    __tablename__ = "students"

    student_id = Column(String(10), primary_key=True)
    roll_no = Column(String(20), nullable=False, unique=True)
    student_name = Column(String(100), nullable=False)
    dept_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=False)
    batch = Column(String(15), nullable=False)
    year_of_joining = Column(Integer, nullable=False)
    year_of_completion = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    staff_id = Column(String(10), nullable=False)
    gcpa = Column(DECIMAL(4, 2), nullable=False)

    department = relationship("Department", back_populates="students")
    attendance = relationship("Attendance", back_populates="student", uselist=False,
                               cascade="all, delete-orphan")
    academic_records = relationship("AcademicRecord", back_populates="student",
                                     cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(String(10), primary_key=True)
    student_id = Column(String(10), ForeignKey("students.student_id"), nullable=False)
    leave = Column(Integer, nullable=False)
    leave_taken_so_far = Column(Integer, nullable=False)
    on_duty = Column(Integer, nullable=False)

    student = relationship("Student", back_populates="attendance")


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    record_id = Column(String(10), primary_key=True)
    student_id = Column(String(10), ForeignKey("students.student_id"), nullable=False)
    year_level = Column(Integer, nullable=False)
    counsellor_id = Column(Integer, ForeignKey("counsellors.counsellor_id"), nullable=False)
    subject_1_name = Column(String(100), nullable=False)
    subject_1_marks = Column(Integer, nullable=False)
    subject_2_name = Column(String(100), nullable=False)
    subject_2_marks = Column(Integer, nullable=False)
    subject_3_name = Column(String(100), nullable=False)
    subject_3_marks = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    grade = Column(String(5), nullable=False)
    sgpa = Column(DECIMAL(4, 2), nullable=False)

    student = relationship("Student", back_populates="academic_records")
    counsellor = relationship("Counsellor", back_populates="academic_records")
