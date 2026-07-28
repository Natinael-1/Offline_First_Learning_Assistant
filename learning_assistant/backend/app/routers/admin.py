from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()


@router.post("/preauthorize", response_model=List[schemas.PreAuthorizedEmailResponse])
def preauthorize_emails(
    entries: List[schemas.PreAuthorizedEmailCreate],
    db: Session = Depends(database.get_db)
):
    """
    Adds single or bulk email addresses and linked mobile phone numbers 
    to the pre-authorized school directory.
    """
    created_records = []
    for entry in entries:
        existing = db.query(models.PreAuthorizedEmail).filter(
            models.PreAuthorizedEmail.email == entry.email
        ).first()
        
        if not existing:
            new_preauth = models.PreAuthorizedEmail(
                email=entry.email,
                role=entry.role,
                phone=entry.phone
            )
            db.add(new_preauth)
            created_records.append(new_preauth)

    db.commit()
    for rec in created_records:
        db.refresh(rec)
        
    return created_records


@router.get("/preauthorized", response_model=List[schemas.PreAuthorizedEmailResponse])
def get_preauthorized_directory(db: Session = Depends(database.get_db)):
    """
    Returns the complete list of pre-authorized emails and their registration status.
    """
    return db.query(models.PreAuthorizedEmail).all()


@router.get("/pending-teachers", response_model=List[schemas.UserResponse])
def get_pending_teachers(db: Session = Depends(database.get_db)):
    """
    Returns all registered teacher accounts that are pending admin approval.
    """
    return db.query(models.User).filter(
        models.User.role == models.UserRole.TEACHER,
        models.User.is_approved == False
    ).all()


@router.post("/approve-teacher/{user_id}", response_model=schemas.UserResponse)
def approve_teacher(user_id: int, db: Session = Depends(database.get_db)):
    """
    Grants publishing privileges to a registered teacher account.
    """
    teacher: models.User | None = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.role == models.UserRole.TEACHER
    ).first()

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher account not found"
        )

    setattr(teacher, "is_approved", True)

    # Log action in AuditLog
    audit_entry = models.AuditLog(
        action="APPROVE_TEACHER",
        target=teacher.email,
        details=f"Granted publishing rights to instructor account ID {teacher.id} ({teacher.username})."
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(db: Session = Depends(database.get_db)):
    """
    Retrieves system activity and security audit trail logs.
    """
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()


@router.get("/sms-logs", response_model=List[schemas.SMSLogResponse])
def get_sms_logs(db: Session = Depends(database.get_db)):
    """
    Retrieves cellular SMS broadcast history logs.
    """
    return db.query(models.SMSLog).order_by(models.SMSLog.timestamp.desc()).all()