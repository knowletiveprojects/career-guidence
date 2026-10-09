import os
import re
import hmac
import logging

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash

from db.db import get_db
from services.career_service import get_career_by_stream

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
password_hash = PasswordHash.recommended()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://career-guidence-delta.vercel.app",
        "https://career-guidence-topaz.vercel.app",
        "https://career-guidence-alo1ifsk9-akash-gaikwad-s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)

STREAM_MAP = {
    "science": "science",
    "commerce": "commerce",
    "arts": "arts",
    "vocational": "vocational",
    "government": "government",
    "other": "other",
}


def close_db(db):
    if db is not None:
        try:
            db.close()
        except Exception:
            logger.exception("Database connection close failed")


def get_admin_access(x_admin_key: str | None):
    expected_key = os.getenv("ADMIN_API_KEY")

    if not expected_key:
        raise HTTPException(
            status_code=503,
            detail="Admin endpoint is not configured"
        )

    if not x_admin_key or not hmac.compare_digest(
        x_admin_key, expected_key
    ):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/register")
def register(data: dict):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not isinstance(name, str) or not name.strip() or len(name) > 100:
        raise HTTPException(status_code=422, detail="Invalid name")

    if not isinstance(email, str) or len(email) > 254:
        raise HTTPException(status_code=422, detail="Invalid email")

    email = email.strip().lower()

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise HTTPException(status_code=422, detail="Invalid email")

    if not isinstance(password, str) or not 8 <= len(password) <= 128:
        raise HTTPException(
            status_code=422,
            detail="Password must contain 8 to 128 characters"
        )

    db = None
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE LOWER(email) = %s",
            (email,)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="User already exists"
            )

        hashed_password = password_hash.hash(password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name.strip(), email, hashed_password)
        )

        db.commit()
        return {
            "status": "success",
            "message": "Registered successfully"
        }

    except HTTPException:
        raise
    except Exception:
        if db is not None:
            db.rollback()
        logger.exception("Registration failed")
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again."
        )
    finally:
        close_db(db)


@app.post("/login")
def login(data: dict):
    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        raise HTTPException(
            status_code=422,
            detail="Email and password are required"
        )

    email = email.strip().lower()

    if len(email) > 254 or len(password) > 128:
        raise HTTPException(status_code=422, detail="Invalid credentials")

    db = None
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            """
            SELECT id, name, email, password
            FROM users
            WHERE LOWER(email) = %s
            """,
            (email,)
        )

        row = cursor.fetchone()

        if not row:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        stored_password = row[3]
        if not isinstance(stored_password, str):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        if stored_password.startswith("$argon2"):
            valid_password = password_hash.verify(
                password, stored_password
            )
        else:
            # Compatibility with existing plain-text passwords.
            # Upgrade the stored password after a successful login.
            valid_password = hmac.compare_digest(
                password, stored_password
            )

            if valid_password:
                new_hash = password_hash.hash(password)
                cursor.execute(
                    "UPDATE users SET password = %s WHERE id = %s",
                    (new_hash, row[0])
                )
                db.commit()

        if not valid_password:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        return {
            "status": "success",
            "user": {
                "id": row[0],
                "name": row[1],
                "email": row[2]
            }
        }

    except HTTPException:
        raise
    except Exception:
        if db is not None:
            db.rollback()
        logger.exception("Login failed")
        raise HTTPException(
            status_code=500,
            detail="Login failed. Please try again."
        )
    finally:
        close_db(db)


@app.post("/student")
def save_student(data: dict):
    name = data.get("name")
    mobile = data.get("mobile")
    stream = data.get("stream")
    state = data.get("state")

    if not isinstance(name, str) or not name.strip() or len(name) > 100:
        raise HTTPException(status_code=422, detail="Invalid name")

    if not isinstance(mobile, str) or not re.fullmatch(
        r"[6-9]\d{9}", mobile
    ):
        raise HTTPException(status_code=422, detail="Invalid mobile number")

    if not isinstance(stream, str) or stream.strip().lower() not in STREAM_MAP:
        raise HTTPException(status_code=422, detail="Invalid stream")

    if not isinstance(state, str) or not state.strip() or len(state) > 100:
        raise HTTPException(status_code=422, detail="Invalid state")

    drafted_careers = data.get("drafted_careers")
    custom_careers = data.get("custom_careers")

    for field_name, value in (
        ("drafted_careers", drafted_careers),
        ("custom_careers", custom_careers),
    ):
        if value is not None and not isinstance(value, str):
            raise HTTPException(
                status_code=422,
                detail=f"{field_name} must be text"
            )
        if isinstance(value, str) and len(value) > 50000:
            raise HTTPException(
                status_code=422,
                detail=f"{field_name} is too long"
            )

    db = None
    try:
        db = get_db()
        cursor = db.cursor()

        # Anonymous dashboard: do not trust user_id from the client.
        cursor.execute(
            """
            INSERT INTO students
                (user_id, name, stream, mobile, state,
                 drafted_careers, custom_careers)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                None,
                name.strip(),
                stream.strip().lower(),
                mobile,
                state.strip(),
                drafted_careers,
                custom_careers,
            )
        )

        db.commit()
        return {
            "status": "success",
            "message": "Student saved successfully"
        }

    except Exception:
        if db is not None:
            db.rollback()
        logger.exception("Saving student failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to save student. Please try again."
        )
    finally:
        close_db(db)


@app.get("/students")
def get_students(x_admin_key: str | None = Header(default=None)):
    get_admin_access(x_admin_key)

    db = None
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            SELECT id, user_id, name, stream, mobile,
                   state, drafted_careers,
                   custom_careers, created_at
            FROM students
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        students = [
            {
                "id": row[0],
                "user_id": row[1],
                "name": row[2],
                "stream": row[3],
                "mobile": row[4],
                "state": row[5],
                "drafted_careers": row[6],
                "custom_careers": row[7],
                "created_at": str(row[8]),
            }
            for row in rows
        ]

        return {"status": "success", "data": students}

    except HTTPException:
        raise
    except Exception:
        logger.exception("Retrieving students failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve student records"
        )
    finally:
        close_db(db)


@app.post("/roadmap")
def roadmap(data: dict):
    stream = data.get("stream")

    if not isinstance(stream, str) or len(stream) > 50:
        raise HTTPException(status_code=422, detail="Invalid stream")

    stream_key = STREAM_MAP.get(stream.strip().lower())

    if not stream_key:
        raise HTTPException(status_code=422, detail="Unsupported stream")

    try:
        careers = get_career_by_stream(stream_key)
        return {"status": "success", "data": careers}
    except Exception:
        logger.exception("Generating roadmap failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate roadmap. Please try again."
        )
