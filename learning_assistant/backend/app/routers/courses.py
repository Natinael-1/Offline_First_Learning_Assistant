from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()


@router.get("/", response_model=List[schemas.CourseResponse])
def get_all_courses(db: Session = Depends(database.get_db)):
    """
    Returns the catalog of all published course modules with their nested materials, 
    quizzes, worksheets, flashcards, announcements, and Q&A discussions.
    """
    return db.query(models.Course).all()


@router.post("/", response_model=schemas.CourseResponse)
def create_course(
    course: schemas.CourseCreate, 
    teacher_id: int, 
    db: Session = Depends(database.get_db)
):
    """
    Creates a new course module assigned to a verified instructor.
    """
    teacher: models.User | None = db.query(models.User).filter(
        models.User.id == teacher_id,
        models.User.role == models.UserRole.TEACHER
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Specified instructor ID does not exist"
        )

    if not getattr(teacher, "is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Instructor account is pending admin approval and cannot publish modules"
        )

    new_course = models.Course(
        title=course.title,
        subject=course.subject,
        description=course.description,
        teacher_id=teacher_id
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(database.get_db)):
    """
    Deletes a course module and all its associated materials, quizzes, and announcements.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course module not found"
        )
    
    db.delete(course)
    db.commit()
    return None


@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course_by_id(course_id: int, db: Session = Depends(database.get_db)):
    """
    Fetches a single course module by ID.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course module not found"
        )
    return course


@router.post("/{course_id}/materials", response_model=schemas.MaterialResponse)
def add_material(
    course_id: int, 
    material: schemas.MaterialCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Attaches a PDF reading guide or file to a course workspace.
    """
    new_mat = models.Material(
        course_id=course_id,
        title=material.title,
        file_type=material.file_type,
        size=material.size,
        read_time=material.read_time,
        content=material.content,
        file_data=material.file_data
    )
    db.add(new_mat)
    db.commit()
    db.refresh(new_mat)
    return new_mat


@router.post("/{course_id}/worksheets", response_model=schemas.WorksheetResponse)
def add_worksheet(
    course_id: int, 
    worksheet: schemas.WorksheetCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Adds a practice worksheet to a course.
    """
    new_ws = models.Worksheet(
        course_id=course_id,
        title=worksheet.title,
        due_date=worksheet.due_date,
        status=worksheet.status
    )
    db.add(new_ws)
    db.commit()
    db.refresh(new_ws)
    return new_ws


@router.post("/{course_id}/flashcards", response_model=schemas.FlashcardResponse)
def add_flashcard(
    course_id: int, 
    flashcard: schemas.FlashcardCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Adds an active recall study flashcard to a course deck.
    """
    new_card = models.Flashcard(
        course_id=course_id,
        front=flashcard.front,
        back=flashcard.back
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card


@router.post("/{course_id}/announcements", response_model=schemas.AnnouncementResponse)
def post_announcement(
    course_id: int, 
    teacher_id: int,
    announcement: schemas.AnnouncementCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Posts a digital notice and optionally logs an SMS broadcast dispatch.
    """
    new_ann = models.Announcement(
        course_id=course_id,
        teacher_id=teacher_id,
        title=announcement.title,
        content=announcement.content,
        sent_via_sms=announcement.sent_via_sms
    )
    db.add(new_ann)

    if announcement.sent_via_sms:
        sms_log = models.SMSLog(
            title=announcement.title,
            course_id=course_id,
            recipient_count=28,
            segments_per_msg=1,
            credits_deducted=28
        )
        db.add(sms_log)

    db.commit()
    db.refresh(new_ann)
    return new_ann


@router.post("/{course_id}/discussions", response_model=schemas.DiscussionResponse)
def post_discussion(
    course_id: int, 
    user_id: int,
    discussion: schemas.DiscussionCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Posts a new Q&A question or threaded reply to a discussion topic.
    """
    new_disc = models.Discussion(
        course_id=course_id,
        user_id=user_id,
        parent_id=discussion.parent_id,
        text=discussion.text,
        status="synced"
    )
    db.add(new_disc)
    db.commit()
    db.refresh(new_disc)
    return new_disc