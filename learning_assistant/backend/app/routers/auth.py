from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, security

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Registers a new user after verifying their email exists in 
    the Admin Pre-Authorized Email directory.
    """
    # 1. Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email is already registered"
        )
    
    # 2. Check if email exists in PreAuthorizedEmail directory
    pre_auth: models.PreAuthorizedEmail | None = db.query(
        models.PreAuthorizedEmail
    ).filter(models.PreAuthorizedEmail.email == user.email).first()
    
    if not pre_auth:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address is not in the pre-authorized school directory. Contact Admin."
        )
    
    # 3. Hash password using direct bcrypt
    hashed_password = security.get_password_hash(user.password)
    
    # 4. Teachers require manual admin approval; students/admins auto-approve
    is_approved = (pre_auth.role != models.UserRole.TEACHER)

    # 5. Create new user account matching pre-authorized role
    new_user = models.User(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
        phone=user.phone or pre_auth.phone,
        role=pre_auth.role,
        is_approved=is_approved
    )
    
    # 6. Update pre-authorization status
    setattr(pre_auth, "is_registered", True)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """
    Authenticates a user via email or username and password, 
    returning a JWT bearer token.
    """
    # Search by email OR username (case-insensitive)
    user: models.User | None = db.query(models.User).filter(
        (models.User.email == user_credentials.email) | 
        (models.User.username == user_credentials.email)
    ).first()
    
    if not user or not security.verify_password(user_credentials.password, str(user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
    # Issue JWT access token containing role and user_id claims
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role.value, "user_id": user.id}
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": user
    }