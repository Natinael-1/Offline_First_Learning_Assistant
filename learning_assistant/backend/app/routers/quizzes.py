from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()


@router.post("/", response_model=schemas.QuizResponse)
def create_quiz(
    course_id: int, 
    quiz: schemas.QuizCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Creates a new self-grading quiz with multiple-choice questions stored in JSON format.
    """
    new_quiz = models.Quiz(
        course_id=course_id,
        title=quiz.title,
        time_limit=quiz.time_limit,
        questions_json=quiz.questions_json
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return new_quiz


@router.get("/{quiz_id}", response_model=schemas.QuizResponse)
def get_quiz_by_id(quiz_id: int, db: Session = Depends(database.get_db)):
    """
    Fetches quiz details and questions by ID.
    """
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Quiz not found"
        )
    return quiz


@router.post("/sync", response_model=List[schemas.QuizAttemptResponse])
def sync_offline_quiz_attempts(
    batch: schemas.QuizSyncBatch, 
    student_id: int,
    db: Session = Depends(database.get_db)
):
    """
    Processes a batch of offline quiz attempts submitted by a student device.
    Uses 'attempt_uuid' for idempotency to prevent duplicate score entries on re-connection.
    """
    synced_attempts = []

    for item in batch.attempts:
        # 1. Idempotency Check: Skip if UUID was already saved
        existing = db.query(models.QuizAttempt).filter(
            models.QuizAttempt.attempt_uuid == item.attempt_uuid
        ).first()

        if existing:
            synced_attempts.append(existing)
            continue

        # 2. Insert new attempt record
        new_attempt = models.QuizAttempt(
            attempt_uuid=item.attempt_uuid,
            quiz_id=item.quiz_id,
            student_id=student_id,
            score=item.score,
            answers_json=item.answers_json,
            status="synced"
        )
        db.add(new_attempt)
        synced_attempts.append(new_attempt)

    db.commit()
    for attempt in synced_attempts:
        db.refresh(attempt)

    return synced_attempts