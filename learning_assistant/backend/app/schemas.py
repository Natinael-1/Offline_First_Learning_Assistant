from __future__ import annotations
import datetime
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from .models import UserRole




class UserBase(BaseModel):
    email: EmailStr
    username: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: str  # Allows logging in with email or username
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_approved: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PreAuthorizedEmailBase(BaseModel):
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None

class PreAuthorizedEmailCreate(PreAuthorizedEmailBase):
    pass

class PreAuthorizedEmailResponse(PreAuthorizedEmailBase):
    id: int
    is_registered: bool

    class Config:
        from_attributes = True



class MaterialBase(BaseModel):
    title: str
    file_type: Optional[str] = "pdf"
    size: Optional[str] = "0 MB"
    read_time: Optional[str] = "15 min"
    content: Optional[str] = None
    file_data: Optional[str] = None

class MaterialCreate(MaterialBase):
    pass

class MaterialResponse(MaterialBase):
    id: int
    course_id: int
    

    class Config:
        from_attributes = True


class WorksheetBase(BaseModel):
    title: str
    due_date: Optional[datetime.datetime] = None
    status: Optional[str] = "Active"

class WorksheetCreate(WorksheetBase):
    pass

class WorksheetResponse(WorksheetBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True


class FlashcardBase(BaseModel):
    front: str
    back: str

class FlashcardCreate(FlashcardBase):
    pass

class FlashcardResponse(FlashcardBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True




class QuizBase(BaseModel):
    title: str
    time_limit: Optional[str] = "15 mins"
    questions_json: Any  # List of questions, choices, and answer keys

class QuizCreate(QuizBase):
    pass

class QuizResponse(QuizBase):
    id: int
    course_id: int
    # 💡 ADD THIS: Exposes the parsed questions list to React
    questions: List[Any] = []

    class Config:
        from_attributes = True


class QuizAttemptBase(BaseModel):
    attempt_uuid: str
    quiz_id: int
    score: int
    answers_json: Any
    status: Optional[str] = "synced"

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttemptResponse(QuizAttemptBase):
    id: int
    student_id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class QuizSyncBatch(BaseModel):
    attempts: List[QuizAttemptCreate]




class AnnouncementBase(BaseModel):
    title: str
    content: Optional[str] = None
    sent_via_sms: bool = False

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    course_id: int
    teacher_id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class DiscussionBase(BaseModel):
    text: str
    parent_id: Optional[int] = None
    status: Optional[str] = "synced"

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionResponse(DiscussionBase):
    id: int
    course_id: int
    user_id: int
    timestamp: datetime.datetime
    user: UserResponse
    replies: List[DiscussionResponse] = []

    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    course_id: int

class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    enrolled_at: datetime.datetime

    class Config:
        from_attributes = True



class StudentNoteBase(BaseModel):
    course_id: int
    material_id: Optional[int] = None
    note_content: str

class StudentNoteCreate(StudentNoteBase):
    pass

class StudentNoteResponse(StudentNoteBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True


class SMSLogBase(BaseModel):
    title: str
    recipient_count: int
    segments_per_msg: int = 1
    credits_deducted: int

class SMSLogCreate(SMSLogBase):
    course_id: int

class SMSLogResponse(SMSLogBase):
    id: int
    course_id: Optional[int] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class AuditLogBase(BaseModel):
    action: str
    target: Optional[str] = None
    details: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogResponse(AuditLogBase):
    id: int
    actor_id: Optional[int] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True




class CourseBase(BaseModel):
    title: str
    subject: Optional[str] = "General"
    description: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    teacher_id: int
    teacher: Optional[UserResponse] = None
    materials: List[MaterialResponse] = []
    quizzes: List[QuizResponse] = []
    worksheets: List[WorksheetResponse] = []
    flashcards: List[FlashcardResponse] = []
    announcements: List[AnnouncementResponse] = []
    discussions: List[DiscussionResponse] = []

    class Config:
        from_attributes = True