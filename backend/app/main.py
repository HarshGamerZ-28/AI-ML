import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine, SessionLocal
from . import seed
from .routers import auth, members, join, events, gallery, achievements, notices, admin, member_auth, update_requests, projects

app = FastAPI(title="AIML Club API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://ai-ml-hazel.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(members.router)
app.include_router(join.router)
app.include_router(events.router)
app.include_router(gallery.router)
app.include_router(achievements.router)
app.include_router(notices.router)
app.include_router(admin.router)
app.include_router(member_auth.router)
app.include_router(update_requests.router)
app.include_router(projects.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed.run(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "service": "AIML Club API"}
