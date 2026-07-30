
"""from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from . import models
from .routers import auth, admin, courses, quizzes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduSync Backend API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_preauthorized_directory():
    ""
    Automatically populates the school's pre-authorized email directory on initial boot
    so registration works out of the box during testing.
    ""
    db: Session = SessionLocal()
    try:
        initial_emails = [
            ("admin@admin.edu", models.UserRole.ADMIN, "+250788000111"),
            ("amina@teacher.edu", models.UserRole.TEACHER, "+250788123456"),
            ("joshua@teacher.edu", models.UserRole.TEACHER, "+250788234567"),
            ("kwame@teacher.edu", models.UserRole.TEACHER, "+250788345678"),
            ("student1@student.edu", models.UserRole.STUDENT, "+250788111222"),
            ("student2@student.edu", models.UserRole.STUDENT, "+250788333444"),
            ("natinael@student.edu", models.UserRole.STUDENT, "+250788555666"),
            ("abebe@student.edu", models.UserRole.STUDENT, "+250788777888"),
            ("keza@student.edu", models.UserRole.STUDENT, "+250788999000"),
        ]

        for email, role, phone in initial_emails:
            existing = db.query(models.PreAuthorizedEmail).filter(
                models.PreAuthorizedEmail.email == email
            ).first()
            
            if not existing:
                pre_auth = models.PreAuthorizedEmail(
                    email=email,
                    role=role,
                    phone=phone,
                    is_registered=False
                )
                db.add(pre_auth)
        
        db.commit()
    finally:
        db.close()

# Execute automatic database seeding on startup
seed_preauthorized_directory()


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])


@app.get("/")
def read_root():
    return {
        "message": "EduSync API is running",
        "docs": "Visit /docs for Interactive Swagger Documentation"
    }
@app.get("/api/health")
def health_check():
    return {"status": "ok"}
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from . import models
from .routers import auth, admin, courses, quizzes

# Create database tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduSync Backend API",
    description="Zero-Data Learning Platform API",
    version="1.0.0"
)

# 💡 1. Standard local development origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://localhost:3000",
]

# Read dynamic FRONTEND_URL from environment variables if set on Render
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    # Allow local origins OR allow all origins if RENDER environment variable exists
    allow_origins=origins if not os.getenv("RENDER") else ["*"],
    # 💡 2. Regex pattern matching matches ANY Vercel deployment URL automatically!
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_preauthorized_directory():
    """
    Automatically populates the school's pre-authorized email directory on initial boot
    so registration works out of the box during testing.
    """
    db: Session = SessionLocal()
    try:
        initial_emails = [
            ("admin@admin.edu", models.UserRole.ADMIN, "+250788000111"),
            ("amina@teacher.edu", models.UserRole.TEACHER, "+250788123456"),
            ("joshua@teacher.edu", models.UserRole.TEACHER, "+250788234567"),
            ("kwame@teacher.edu", models.UserRole.TEACHER, "+250788345678"),
            ("student1@student.edu", models.UserRole.STUDENT, "+250788111222"),
            ("student2@student.edu", models.UserRole.STUDENT, "+250788333444"),
            ("natinael@student.edu", models.UserRole.STUDENT, "+250788555666"),
            ("abebe@student.edu", models.UserRole.STUDENT, "+250788777888"),
            ("keza@student.edu", models.UserRole.STUDENT, "+250788999000"),
        ]

        for email, role, phone in initial_emails:
            existing = db.query(models.PreAuthorizedEmail).filter(
                models.PreAuthorizedEmail.email == email
            ).first()
            
            if not existing:
                pre_auth = models.PreAuthorizedEmail(
                    email=email,
                    role=role,
                    phone=phone,
                    is_registered=False
                )
                db.add(pre_auth)
        
        db.commit()
    except Exception as e:
        print(f"⚠️ Initial database seeding warning: {e}")
        db.rollback()
    finally:
        db.close()

# Execute automatic database seeding on startup
seed_preauthorized_directory()


# Register API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])


@app.get("/")
def read_root():
    return {
        "message": "EduSync API is running",
        "docs": "Visit /docs for Interactive Swagger Documentation"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}