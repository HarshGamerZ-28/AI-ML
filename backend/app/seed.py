from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models
from .auth import hash_password
from .routers.events import unique_slug


def run(db: Session):
    if db.query(models.AdminUser).count() > 0:
        return  # already seeded

    # --- admin account ---
    db.add(models.AdminUser(
        username="admin",
        display_name="Club Admin",
        hashed_password=hash_password("admin123"),
    ))

    # --- members ---
    members = [
        dict(name="Aarav Mehta", role="President", branch="Computer Science", year="4th year",
             bio="Runs project reviews and keeps the semester on schedule.",
             skills="Leadership, PyTorch, System Design", is_core=True, is_admin=True),
        dict(name="Priya Sharma", role="Vice President", branch="Information Technology", year="3rd year",
             bio="Handles the workshop calendar and onboarding for new members.",
             skills="Event Ops, NLP, Public Speaking", is_core=True, is_admin=True),
        dict(name="Rohan Verma", role="Technical Lead", branch="Computer Science", year="4th year",
             bio="Owns the club's GitHub org, review standards and infrastructure.",
             skills="FastAPI, DevOps, React", is_core=True, is_admin=True),
        dict(name="Ishita Jain", role="Research Lead", branch="Computer Science", year="3rd year",
             bio="Picks the papers and runs the reading circle every fortnight.",
             skills="Deep Learning, Research Writing", is_core=True),
        dict(name="Kabir Singh", role="Events Lead", branch="Electronics & Comm.", year="2nd year",
             bio="Books halls, chases sponsors, keeps hackathons from falling apart.",
             skills="Logistics, Sponsorship", is_core=True),
        dict(name="Ananya Gupta", role="Design Lead", branch="Information Technology", year="3rd year",
             bio="Posters, slide decks and the club's visual language.",
             skills="Figma, Motion Design", is_core=True),
        dict(name="Devansh Rathore", role="Outreach Lead", branch="Computer Science", year="2nd year",
             bio="Alumni network, inter-college tie-ups and the newsletter.",
             skills="Community, Writing", is_core=True),
        dict(name="Sanya Kapoor", role="Treasurer", branch="Computer Science", year="3rd year",
             bio="Budgets, reimbursements and the departmental paperwork nobody else wants.",
             skills="Finance, Excel", is_core=True),
        dict(name="Meera Nair", role="Member", branch="Computer Science", year="2nd year",
             bio="Building a crop-disease classifier for her semester project.",
             skills="Python, OpenCV"),
        dict(name="Yash Poddar", role="Member", branch="Information Technology", year="1st year",
             bio="New to the club, working through the ML foundations track.",
             skills="Python, NumPy"),
    ]
    for m in members:
        db.add(models.Member(**m))

    # --- events ---
    now = datetime.utcnow()
    events_data = [
        dict(title="Intro to Neural Networks", description=(
                "Build a two-layer network from scratch in NumPy, then the same thing in PyTorch in ten lines. "
                "Bring a laptop — this is a hands-on lab, not a lecture."),
             event_date=now + timedelta(days=9), location="Lab 3, CS Block", status="upcoming", is_featured=True,
             schedule=[("2:30 PM", "Doors open, setup check"), ("3:00 PM", "NumPy from scratch"),
                       ("3:45 PM", "Same network in PyTorch"), ("4:30 PM", "Q&A and stretch goals")]),
        dict(title="Paper Circle: Attention Is All You Need", description=(
                "We read the transformer paper together, section by section. No prep needed — come as you are."),
             event_date=now + timedelta(days=22), location="Seminar Hall", status="upcoming",
             schedule=[("5:00 PM", "Recap of last session"), ("5:15 PM", "Section-by-section read"),
                       ("6:00 PM", "Open discussion")]),
        dict(title="InferAI Hackathon", description=(
                "Inter-college build sprint. Teams of four, three problem tracks, mentors on call through the night."),
             event_date=now + timedelta(days=44), location="Main Auditorium", status="upcoming",
             schedule=[("9:00 AM", "Check-in and team formation"), ("10:00 AM", "Problem statements released"),
                       ("Overnight", "Build"), ("10:00 AM +1", "Demos and judging")]),
        dict(title="Orientation & Squad Draft", description=(
                "180 first-years turned up. Squads were drafted on the spot and project themes locked by the end of the week."),
             event_date=now - timedelta(days=36), location="Main Auditorium", status="past",
             schedule=[("11:00 AM", "Club introduction"), ("11:30 AM", "Squad draft"), ("12:30 PM", "Lunch and mixer")]),
        dict(title="Kaggle Bootcamp", description=(
                "Two-day sprint on the Titanic and House Prices sets. Twelve members made their first submission."),
             event_date=now - timedelta(days=53), location="Lab 3, CS Block", status="past",
             schedule=[("Day 1", "Titanic dataset walkthrough"), ("Day 2", "House Prices + first submissions")]),
        dict(title="Semester Demo Day", description=(
                "Nine squads demoed. The crop-disease detector and the campus chatbot took the top two spots."),
             event_date=now - timedelta(days=150), location="Main Auditorium", status="past",
             schedule=[("3:00 PM", "Demo round 1"), ("4:00 PM", "Demo round 2"), ("5:00 PM", "Judging and awards")]),
    ]
    events = []
    for e in events_data:
        sched = e.pop("schedule")
        slug = unique_slug(db, e["title"])
        ev = models.Event(**e, slug=slug)
        db.add(ev)
        db.flush()
        for i, (t, title) in enumerate(sched):
            db.add(models.ScheduleItem(event_id=ev.id, time_label=t, title=title, order=i))
        events.append(ev)

    # --- gallery (placeholder images) ---
    placeholders = [
        "https://picsum.photos/seed/aiml1/640/440",
        "https://picsum.photos/seed/aiml2/640/440",
        "https://picsum.photos/seed/aiml3/640/440",
        "https://picsum.photos/seed/aiml4/640/440",
        "https://picsum.photos/seed/aiml5/640/440",
        "https://picsum.photos/seed/aiml6/640/440",
    ]
    for i, url in enumerate(placeholders):
        db.add(models.GalleryItem(
            event_id=events[i % len(events)].id, type="image", url=url,
            caption="From the club archive", year=str((now - timedelta(days=30 * i)).year)
        ))

    # --- achievements ---
    achievements = [
        dict(member_name="Rohan Verma", title="1st place, InferAI Hackathon 2025", category="Hackathon",
             badge_icon="🏆", year="2025", status="approved",
             description="Led a team of four to build a real-time attendance system in 36 hours."),
        dict(member_name="Ishita Jain", title="Paper accepted at a student research symposium", category="Research",
             badge_icon="📄", year="2025", status="approved",
             description="Work on low-resource Hindi speech recognition, presented at the regional symposium."),
        dict(member_name="Meera Nair", title="Summer ML internship, mid-size startup", category="Placement",
             badge_icon="💼", year="2026", status="approved",
             description="Offered a summer internship on the strength of her crop-disease project."),
        dict(member_name="Yash Poddar", title="Kaggle bronze medal, first competition", category="Competition",
             badge_icon="🥉", year="2026", status="pending",
             description="Top 8% finish in his very first Kaggle competition."),
    ]
    for a in achievements:
        db.add(models.Achievement(**a))

    # --- projects ---
    projects = [
        dict(title="Crop Disease Detector", category="Vision",
             description="Mobile-first classifier for leaf disease across six local crops, trained on field photos collected around Ajmer.",
             tech_stack="PyTorch, ResNet, FastAPI", is_live=True),
        dict(title="Campus Query Bot", category="NLP",
             description="Retrieval bot over the handbook, exam circulars and academic calendar. Runs on the club's own server.",
             tech_stack="LangChain, FAISS, Flask", is_live=True),
        dict(title="Attendance from Faces", category="Vision",
             description="Classroom attendance from a single wide shot. Built as a study in how badly lighting breaks face recognition.",
             tech_stack="OpenCV, dlib, SQLite", is_live=False),
        dict(title="Placement Predictor", category="Data",
             description="Boosted model on five years of anonymised placement data, with a write-up on why accuracy misleads here.",
             tech_stack="XGBoost, pandas, Streamlit", is_live=False),
        dict(title="Hindi Speech to Text", category="NLP",
             description="Whisper small fine-tuned on Rajasthani-accented Hindi from volunteers. Word error rate dropped by a third.",
             tech_stack="Whisper, HuggingFace", is_live=True),
        dict(title="Traffic Flow Forecast", category="Data",
             description="Short-horizon congestion forecast for three Ajmer junctions using loop-counter data from the municipal office.",
             tech_stack="LSTM, Keras, Plotly", is_live=False),
        dict(title="Sign Language Trainer", category="Vision",
             description="Webcam app that scores ISL fingerspelling in real time and drills the letters you keep missing.",
             tech_stack="MediaPipe, TF.js", is_live=True),
        dict(title="Notes Summariser", category="NLP",
             description="Upload a lecture PDF, get a structured revision sheet. Built in a weekend, used by half the third year.",
             tech_stack="Transformers, Next.js", is_live=True),
        dict(title="Club Recommender", category="Data",
             description="Matches new members to project squads from their interest form. Small model, surprisingly good hit rate.",
             tech_stack="scikit-learn, Node.js", is_live=False),
    ]
    for p in projects:
        db.add(models.Project(**p))

    # --- notices ---
    notices = [
        dict(title="Annual General Meeting — 28 Sept", category="Meeting",
             body="All core team members are expected to attend. We'll cover the semester budget, "
                  "upcoming hackathon logistics, and open leadership roles for next year."),
        dict(title="Scholarship Applications Open", category="Announcement",
             body="The department is accepting applications for the AI/ML research scholarship. "
                  "Deadline is the end of next month — reach out to the Research Lead for guidance."),
        dict(title="Lab 3 Booking Change", category="Deadline",
             body="Lab 3 is unavailable on the 30th due to a department audit. The Saturday workshop "
                  "that week moves to the Seminar Hall — same time."),
    ]
    for n in notices:
        db.add(models.Notice(**n))

    db.commit()
