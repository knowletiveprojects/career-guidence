from pathlib import Path
import pandas as pd

excel_path = Path(__file__).resolve().parent.parent / "data" / "careers.xlsx"


def load_careers():
    df = pd.read_excel(excel_path, header=None)

    careers = {
        "science": [], "commerce": [], "arts": [],
        "vocational": [], "government": [], "other": [],
    }

    def safe(row, col):
        try:
            s = str(row[col]).strip()
            return s if s.lower() not in ("nan", "") else ""
        except:
            return ""

    def is_data_row(row):
        sr = str(row[0]).strip()
        return sr and sr.lower() != "nan" and sr.replace(".", "").isdigit()

    # ARTS (rows 1–145)
    # 0=sr 1=course 2=duration 3=exam 4=exam_fee 5=course_fee 6=jobs 7=salary
    for i in range(1, 146):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,1), "duration": safe(row,2), "exam": safe(row,3),
                "course_fee": safe(row,5), "jobs": safe(row,6), "salary": safe(row,7), "future": ""}
        if item["course"]: careers["arts"].append(item)

    # COMMERCE (rows 147–234)
    # 0=sr 1=career 2=program 3=duration 4=fee 5=eligibility 6=exam 7=jobs 8=salary 9=future
    for i in range(147, 235):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,1), "duration": safe(row,3), "exam": safe(row,6),
                "course_fee": safe(row,4), "jobs": safe(row,7), "salary": safe(row,8), "future": safe(row,9)}
        if item["course"]: careers["commerce"].append(item)

    # SCIENCE (rows 236–414)
    # 0=sr 1=course 2=duration 3=fees 4=exams 5=jobs 6=salary 7=future_scope
    for i in range(236, 415):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,1), "duration": safe(row,2), "exam": safe(row,4),
                "course_fee": safe(row,3), "jobs": safe(row,5), "salary": safe(row,6), "future": safe(row,7)}
        if item["course"]: careers["science"].append(item)

    # VOCATIONAL (rows 416–619)
    # 0=sr 1=course 2=field 3=eligibility 4=duration 5=fee 6=exam 7=jobs 8=salary 9=skills 10=future
    for i in range(416, 620):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,1), "duration": safe(row,4), "exam": safe(row,6),
                "course_fee": safe(row,5), "jobs": safe(row,7), "salary": safe(row,8), "future": safe(row,10)}
        if item["course"]: careers["vocational"].append(item)

    # STATE GOVT (rows 621–674)
    # 0=sr 1=sector 2=job 3=exam 4=age 5=fee 6=attempts 7=body 8=levels 9=training
    for i in range(621, 675):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,2), "duration": safe(row,9), "exam": safe(row,3),
                "course_fee": safe(row,5), "jobs": safe(row,1), "salary": "", "future": ""}
        if item["course"]: careers["government"].append(item)

    # CENTRAL GOVT (rows 676–729) — same layout as state
    for i in range(676, 730):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,2), "duration": safe(row,9), "exam": safe(row,3),
                "course_fee": safe(row,5), "jobs": safe(row,1), "salary": "", "future": ""}
        if item["course"]: careers["government"].append(item)

    # OTHER (rows 731–845) — same layout as vocational
    for i in range(731, 846):
        row = df.iloc[i]
        if not is_data_row(row): continue
        item = {"course": safe(row,1), "duration": safe(row,4), "exam": safe(row,6),
                "course_fee": safe(row,5), "jobs": safe(row,7), "salary": safe(row,8), "future": safe(row,10)}
        if item["course"]: careers["other"].append(item)

    return careers


all_careers = load_careers()

def get_career_by_stream(stream: str) -> list:
    return all_careers.get(stream.lower().strip(), [])