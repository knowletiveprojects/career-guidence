from services.career_service import get_career_by_stream
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.db import get_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://career-guidence-delta.vercel.app",
        "https://career-guidence-topaz.vercel.app",
        "https://career-guidence-alo1ifsk9-akash-gaikwad-s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# rest of your code continues below...
# ──────────────────────────────────────────────
#  AUTH
# ──────────────────────────────────────────────

@app.post("/login")
def login(data: dict):
    try:
        db = get_db()
        cursor = db.cursor()

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        cursor.execute(
            "SELECT id, name, email FROM users WHERE email=%s AND password=%s",
            (email, password)
        )

        row = cursor.fetchone()

        db.close()

        if row:
            user = {
                "id": row[0],
                "name": row[1],
                "email": row[2]
            }

            return {"status": "success", "user": user}

        return {"status": "failed", "message": "Invalid credentials"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/register")
def register(data: dict):
    try:
        db = get_db()
        cursor = db.cursor()
        name     = data.get("name")
        email    = data.get("email")
        password = data.get("password")
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return {"status": "failed", "message": "User already exists"}
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, password)
        )
        db.commit()
        db.close()
        return {"status": "success", "message": "Registered successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ──────────────────────────────────────────────
#  STUDENT
# ──────────────────────────────────────────────

@app.post("/student")
def save_student(data: dict):
    try:
        if not data.get("name"):
            return {"status": "error", "message": "Name required"}
        if not data.get("mobile"):
            return {"status": "error", "message": "Mobile required"}
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO students (user_id, name, stream, mobile, state, drafted_careers, custom_careers)
            VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                data.get("user_id"),
                data.get("name"),
                data.get("stream"),
                data.get("mobile"),
                data.get("state"),
                data.get("drafted_careers"),
                data.get("custom_careers"),
            )
        )
        db.commit()
        db.close()
        return {"status": "success", "message": "Student saved successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/students")
def get_students():
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

        students = []

        for row in rows:
            students.append({
                "id": row[0],
                "user_id": row[1],
                "name": row[2],
                "stream": row[3],
                "mobile": row[4],
                "state": row[5],
                "drafted_careers": row[6],
                "custom_careers": row[7],
                "created_at": str(row[8])
            })

        db.close()

        return {"status": "success", "data": students}

    except Exception as e:
        return {"status": "error", "message": str(e)}

# ──────────────────────────────────────────────
#  ROADMAP  –  supports all 6 stream keys
# ──────────────────────────────────────────────

STREAM_MAP = {
    "science":    "science",
    "commerce":   "commerce",
    "arts":       "arts",
    "vocational": "vocational",
    "government": "government",
    "other":      "other",
}


@app.post("/roadmap")
def roadmap(data: dict):
    raw_stream = data.get("stream", "").lower().strip()
    stream_key = STREAM_MAP.get(raw_stream, raw_stream)
    careers    = get_career_by_stream(stream_key)
    return {"status": "success", "data": careers}