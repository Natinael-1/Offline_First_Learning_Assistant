import datetime
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship, backref
from .database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    courses_taught = relationship("Course", back_populates="teacher", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    discussions = relationship("Discussion", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("StudentNote", back_populates="student", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")


class PreAuthorizedEmail(Base):
    __tablename__ = "pre_authorized_emails"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    phone = Column(String, nullable=True)
    is_registered = Column(Boolean, default=False)


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject = Column(String)
    description = Column(String)
    teacher_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    teacher = relationship("User", back_populates="courses_taught")
    materials = relationship("Material", back_populates="course", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="course", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="course", cascade="all, delete-orphan")
    discussions = relationship("Discussion", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    worksheets = relationship("Worksheet", back_populates="course", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="course", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, nullable=False)
    file_type = Column(String)
    size = Column(String)
    read_time = Column(String, default="15 min")  # Added to match DocumentReaderModal & ContentPublisher
    content = Column(String)  # Reading guide text or Base64 file payload

    course = relationship("Course", back_populates="materials")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, nullable=False)
    time_limit = Column(String)
    questions_json = Column(JSON)  # Stores question text, options, and correct index keys

    course = relationship("Course", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    attempt_uuid = Column(String, unique=True, index=True, nullable=True)  # Client UUID for idempotent sync
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    status = Column(String, default="synced")  # 'synced' or 'pending_sync'
    answers_json = Column(JSON)  # Detailed question-by-question student selections
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="quiz_attempts")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(String)
    sent_via_sms = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("Course", back_populates="announcements")


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("discussions.id"), nullable=True)  # Threaded Q&A replies
    text = Column(String, nullable=False)
    status = Column(String, default="synced")  # 'synced' or 'pending_sync'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("Course", back_populates="discussions")
    user = relationship("User", back_populates="discussions")
    replies = relationship("Discussion", backref=backref("parent", remote_side=[id]), cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class SMSLog(Base):
    __tablename__ = "sms_logs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    course_id = Column(Integer, ForeignKey("courses.id"))
    recipient_count = Column(Integer)
    segments_per_msg = Column(Integer, default=1)  # Added to match AdminSMSGatewayTab broadcast log table
    credits_deducted = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class StudentNote(Base):
    __tablename__ = "student_notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    material_id = Column(Integer, ForeignKey("materials.id"))
    note_content = Column(String)

    student = relationship("User", back_populates="notes")


class Worksheet(Base):
    __tablename__ = "worksheets"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    due_date = Column(DateTime)
    status = Column(String, default="Active")

    course = relationship("Course", back_populates="worksheets")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)  # e.g., 'APPROVE_TEACHER', 'PRE_AUTHORIZE_USERS'
    target = Column(String)
    details = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    actor = relationship("User")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    front = Column(String, nullable=False)
    back = Column(String, nullable=False)

    course = relationship("Course", back_populates="flashcards")