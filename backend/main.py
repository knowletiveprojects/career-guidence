import os
import re
import hmac
import json
import time
import base64
import hashlib
import logging
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash

from db.db import get_db
from services.career_service import get_career_by_stream

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="Knowletive Career Guidance API")
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
    allow_headers=["Content-Type", "Authorization", "X-Admin-Key"],
)

STREAM_MAP = {
    "science": "science", "commerce": "commerce", "arts": "arts",
    "vocational": "vocational", "government": "government", "creative": "other",
    "other": "other",
}


def close_db(db):
    if db is not None:
        try:
            db.close()
        except Exception:
            logger.exception("Database connection close failed")


def get_admin_access(x_admin_key: Optional[str]):
    expected_key = os.getenv("ADMIN_API_KEY")
    if not expected_key:
        raise HTTPException(status_code=503, detail="Admin endpoint is not configured")
    if not x_admin_key or not hmac.compare_digest(x_admin_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _auth_secret():
    secret = os.getenv("AUTH_SECRET")
    if not secret or len(secret) < 32:
        raise HTTPException(status_code=503, detail="Authentication is not configured. Set AUTH_SECRET to a random secret of at least 32 characters.")
    return secret.encode("utf-8")


def make_token(user_id: int):
    payload = {"sub": int(user_id), "exp": int(time.time()) + 60 * 60 * 24 * 7}
    encoded = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(_auth_secret(), encoded.encode(), hashlib.sha256).digest()
    sig = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{encoded}.{sig}"


def get_token_user_id(authorization: Optional[str]):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please log in to continue")
    token = authorization[7:].strip()
    try:
        encoded, supplied_sig = token.split(".", 1)
        expected_sig = base64.urlsafe_b64encode(hmac.new(_auth_secret(), encoded.encode(), hashlib.sha256).digest()).decode().rstrip("=")
        if not hmac.compare_digest(supplied_sig, expected_sig):
            raise ValueError("Invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
        if int(payload["exp"]) < int(time.time()):
            raise ValueError("Expired token")
        return int(payload["sub"])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Session is invalid or expired. Please log in again")


def _profile_from_row(row, student_row=None):
    # users columns: id, name, email, password, mobile, state, stream
    profile = {"name": row[1], "email": row[2], "mobile": row[4] or "", "state": row[5] or "", "stream": row[6] or "Science", "drafted_careers": [], "custom_careers": []}
    if student_row:
        profile.update({"mobile": student_row[0] or profile["mobile"], "state": student_row[1] or profile["state"], "stream": student_row[2] or profile["stream"]})
        try:
            value = student_row[3]
            profile["drafted_careers"] = json.loads(value) if isinstance(value, str) and value else (value or [])
        except (ValueError, TypeError):
            profile["drafted_careers"] = []
        try:
            value = student_row[4]
            profile["custom_careers"] = json.loads(value) if isinstance(value, str) and value else (value or [])
        except (ValueError, TypeError):
            profile["custom_careers"] = []
    return profile


def _fetch_user_and_student(cursor, user_id):
    cursor.execute("SELECT id, name, email, password, mobile, state, stream FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Account not found")
    cursor.execute("""SELECT mobile, state, stream, drafted_careers, custom_careers
                      FROM students WHERE user_id = %s ORDER BY created_at DESC, id DESC LIMIT 1""", (user_id,))
    student = cursor.fetchone()
    return user, student


@app.post("/register")
def register(data: dict):
    name, email, password = data.get("name"), data.get("email"), data.get("password")
    mobile, state, stream = data.get("mobile"), data.get("state"), data.get("stream", "Science")
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 100:
        raise HTTPException(status_code=422, detail="Enter a valid full name")
    if not isinstance(email, str) or len(email) > 254:
        raise HTTPException(status_code=422, detail="Enter a valid email")
    email = email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise HTTPException(status_code=422, detail="Enter a valid email")
    if not isinstance(password, str) or not 8 <= len(password) <= 128:
        raise HTTPException(status_code=422, detail="Password must contain 8 to 128 characters")
    if not isinstance(mobile, str) or not re.fullmatch(r"[6-9]\d{9}", mobile):
        raise HTTPException(status_code=422, detail="Enter a valid 10-digit mobile number")
    if not isinstance(state, str) or not state.strip() or len(state) > 100:
        raise HTTPException(status_code=422, detail="Select a valid state")
    if not isinstance(stream, str) or stream.strip().lower() not in STREAM_MAP:
        raise HTTPException(status_code=422, detail="Select a valid stream")

    db = None
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="An account with this email already exists")
        cursor.execute("""INSERT INTO users (name, email, password, mobile, state, stream)
                          VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                       (name.strip(), email, password_hash.hash(password), mobile, state.strip(), stream.strip()))
        user_id = cursor.fetchone()[0]
        cursor.execute("""INSERT INTO students (user_id, name, stream, mobile, state, drafted_careers, custom_careers)
                          VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                       (user_id, name.strip(), stream.strip().lower(), mobile, state.strip(), "[]", "[]"))
        db.commit()
        return {"status": "success", "message": "Registered successfully. Please log in."}
    except HTTPException:
        if db is not None: db.rollback()
        raise
    except Exception:
        if db is not None: db.rollback()
        logger.exception("Registration failed")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")
    finally:
        close_db(db)


@app.post("/login")
def login(data: dict):
    email, password = data.get("email"), data.get("password")
    if not isinstance(email, str) or not isinstance(password, str) or len(email) > 254 or len(password) > 128:
        raise HTTPException(status_code=422, detail="Email and password are required")
    db = None
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("SELECT id, name, email, password, mobile, state, stream FROM users WHERE LOWER(email) = %s", (email.strip().lower(),))
        row = cursor.fetchone()
        if not row or not isinstance(row[3], str):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        stored = row[3]
        try:
            if stored.startswith("$argon2"):
                valid = password_hash.verify(password, stored)
            else:
                valid = hmac.compare_digest(password, stored)
                if valid:
                    cursor.execute("UPDATE users SET password = %s WHERE id = %s", (password_hash.hash(password), row[0]))
                    db.commit()
        except Exception:
            valid = False
        if not valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user, student = _fetch_user_and_student(cursor, row[0])
        return {"status": "success", "access_token": make_token(user[0]), "token_type": "bearer", "user": {"id": user[0], "name": user[1], "email": user[2]}, "profile": _profile_from_row(user, student)}
    except HTTPException:
        raise
    except Exception:
        if db is not None: db.rollback()
        logger.exception("Login failed")
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")
    finally:
        close_db(db)


@app.get("/me")
def me(authorization: Optional[str] = Header(default=None)):
    user_id = get_token_user_id(authorization)
    db = None
    try:
        db = get_db(); cursor = db.cursor()
        user, student = _fetch_user_and_student(cursor, user_id)
        return {"user": {"id": user[0], "name": user[1], "email": user[2]}, "profile": _profile_from_row(user, student)}
    except HTTPException: raise
    except Exception:
        logger.exception("Profile retrieval failed")
        raise HTTPException(status_code=500, detail="Unable to load profile")
    finally: close_db(db)


@app.post("/student")
def save_student(data: dict, authorization: Optional[str] = Header(default=None)):
    """Save each public form submission as a new student row.

    Logged-in profile submissions continue to update the authenticated user's
    latest student row. Public submissions intentionally preserve every attempt
    as a separate database record, even when the mobile number repeats.
    """
    name = data.get("name")
    mobile = data.get("mobile")
    stream = data.get("stream")
    state = data.get("state")

    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 100:
        raise HTTPException(status_code=422, detail="Enter a valid full name")
    if not isinstance(mobile, str) or not re.fullmatch(r"[6-9]\d{9}", mobile.strip()):
        raise HTTPException(status_code=422, detail="Enter a valid 10-digit mobile number")
    mobile = mobile.strip()
    if not isinstance(stream, str) or stream.strip().lower() not in STREAM_MAP:
        raise HTTPException(status_code=422, detail="Select a valid stream")
    if not isinstance(state, str) or not state.strip() or len(state.strip()) > 100:
        raise HTTPException(status_code=422, detail="Select a valid state")

    stream_value = stream.strip().lower()
    state_value = state.strip()
    name_value = name.strip()
    drafted = data.get("drafted_careers")
    custom = data.get("custom_careers")
    if drafted is None:
        drafted = "[]"
    if custom is None:
        custom = "[]"
    for field, value in (("drafted_careers", drafted), ("custom_careers", custom)):
        if not isinstance(value, str):
            raise HTTPException(status_code=422, detail=f"{field} must be text")
        if len(value) > 50000:
            raise HTTPException(status_code=422, detail=f"{field} is too long")

    user_id = get_token_user_id(authorization) if authorization else None
    db = None
    try:
        db = get_db()
        cursor = db.cursor()

        if user_id is not None:
            cursor.execute(
                "UPDATE users SET name=%s, mobile=%s, state=%s, stream=%s WHERE id=%s",
                (name_value, mobile, state_value, stream.strip(), user_id),
            )
            cursor.execute(
                "SELECT id FROM students WHERE user_id=%s ORDER BY created_at DESC, id DESC LIMIT 1",
                (user_id,),
            )
            existing = cursor.fetchone()
            if existing:
                cursor.execute(
                    """UPDATE students
                       SET name=%s, stream=%s, mobile=%s, state=%s,
                           drafted_careers=%s, custom_careers=%s
                       WHERE id=%s AND user_id=%s""",
                    (name_value, stream_value, mobile, state_value, drafted, custom, existing[0], user_id),
                )
            else:
                cursor.execute(
                    """INSERT INTO students
                       (user_id, name, stream, mobile, state, drafted_careers, custom_careers)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (user_id, name_value, stream_value, mobile, state_value, drafted, custom),
                )
            db.commit()
            return {"status": "success", "message": "Student profile saved successfully", "updated": bool(existing)}

        # Public form: always insert a new row, matching the original behaviour.
        # Repeated submissions with the same mobile number remain visible in DB.
        cursor.execute(
            """INSERT INTO students
               (user_id, name, stream, mobile, state, drafted_careers, custom_careers)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (None, name_value, stream_value, mobile, state_value, drafted, custom),
        )
        db.commit()
        return {"status": "success", "message": "Student saved successfully", "updated": False}
    except HTTPException:
        if db is not None:
            db.rollback()
        raise
    except Exception:
        if db is not None:
            db.rollback()
        logger.exception("Saving student profile failed")
        raise HTTPException(status_code=500, detail="Unable to save student profile")
    finally:
        close_db(db)

@app.get("/students")
def get_students(x_admin_key: Optional[str] = Header(default=None)):
    get_admin_access(x_admin_key)
    db = None
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("""SELECT id, user_id, name, stream, mobile, state, drafted_careers,
                          custom_careers, created_at FROM students ORDER BY created_at DESC""")
        rows = cursor.fetchall()
        return {"status": "success", "data": [{"id": r[0], "user_id": r[1], "name": r[2], "stream": r[3], "mobile": r[4], "state": r[5], "drafted_careers": r[6], "custom_careers": r[7], "created_at": str(r[8])} for r in rows]}
    except HTTPException: raise
    except Exception:
        logger.exception("Retrieving students failed")
        raise HTTPException(status_code=500, detail="Unable to retrieve student records")
    finally: close_db(db)


@app.post("/roadmap")
def roadmap(data: dict):
    stream = data.get("stream")
    if not isinstance(stream, str) or len(stream) > 50:
        raise HTTPException(status_code=422, detail="Invalid stream")
    stream_key = STREAM_MAP.get(stream.strip().lower())
    if not stream_key:
        raise HTTPException(status_code=422, detail="Unsupported stream")
    try:
        return {"status": "success", "data": get_career_by_stream(stream_key)}
    except Exception:
        logger.exception("Generating roadmap failed")
        raise HTTPException(status_code=500, detail="Unable to generate roadmap. Please try again.")
