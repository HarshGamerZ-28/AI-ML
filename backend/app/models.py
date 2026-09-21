from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from .database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    display_name = Column(String(120), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    role = Column(String(80), nullable=False, default="Member")   # President, Technical Lead, Member...
    branch = Column(String(80), nullable=True)
    year = Column(String(40), nullable=True)                       # "3rd year"
    bio = Column(Text, nullable=True)
    skills = Column(String(300), nullable=True)                    # comma-separated
    email = Column(String(160), nullable=True)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)     # shows an "Admin" tag, visible to admins only
    is_core = Column(Boolean, default=False)       # core team vs general member
    password_hash = Column(String(255), nullable=True)  # set once a member creates a self-service account
    created_at = Column(DateTime, default=datetime.utcnow)


class JoinRequest(Base):
    __tablename__ = "join_requests"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    branch = Column(String(80), nullable=True)
    year = Column(String(40), nullable=True)
    interests = Column(String(300), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(160), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False)
    location = Column(String(200), nullable=True)
    status = Column(String(20), default="upcoming")  # upcoming, past, live
    is_featured = Column(Boolean, default=False)      # drives the countdown banner
    cover_image_url = Column(String(400), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    schedule = relationship("ScheduleItem", back_populates="event", cascade="all, delete-orphan", order_by="ScheduleItem.order")
    gallery_items = relationship("GalleryItem", back_populates="event", cascade="all, delete-orphan")


class ScheduleItem(Base):
    __tablename__ = "schedule_items"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    time_label = Column(String(40), nullable=False)
    title = Column(String(200), nullable=False)
    order = Column(Integer, default=0)

    event = relationship("Event", back_populates="schedule")


class GalleryItem(Base):
    __tablename__ = "gallery_items"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    type = Column(String(10), default="image")  # image, video
    url = Column(String(400), nullable=False)
    caption = Column(String(200), nullable=True)
    year = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="gallery_items")


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    member_name = Column(String(120), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(60), default="General")  # Hackathon, Research, Placement, Competition, Open Source
    badge_icon = Column(String(10), default="\U0001F3C6")
    year = Column(String(10), nullable=True)
    status = Column(String(20), default="pending")  # pending, approved
    created_at = Column(DateTime, default=datetime.utcnow)


class Notice(Base):
    __tablename__ = "notices"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(String(40), default="Announcement")  # Meeting, Deadline, Workshop, Announcement
    status = Column(String(20), default="open")  # open, closed
    attachment_url = Column(String(400), nullable=True)  # optional PDF
    created_at = Column(DateTime, default=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(60), default="General")  # Vision, NLP, Data, MLOps...
    tech_stack = Column(String(300), nullable=True)     # comma-separated
    is_live = Column(Boolean, default=False)
    repo_url = Column(String(400), nullable=True)
    demo_url = Column(String(400), nullable=True)
    cover_image_url = Column(String(400), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UpdateRequest(Base):
    """A member-submitted request to change their own profile fields. Admin approves or rejects."""
    __tablename__ = "update_requests"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    payload_json = Column(Text, nullable=False)   # JSON-encoded dict of proposed field changes
    note = Column(String(300), nullable=True)      # optional message from the member
    status = Column(String(20), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member")


class EventRegistration(Base):
    """A registration submitted through the shareable /register/[slug] page."""
    __tablename__ = "event_registrations"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    phone = Column(String(30), nullable=True)
    branch = Column(String(80), nullable=True)
    year = Column(String(40), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event")
