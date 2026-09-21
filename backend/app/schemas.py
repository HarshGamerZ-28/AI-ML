from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    display_name: str


# ---------- Member ----------
class MemberBase(BaseModel):
    name: str
    role: str = "Member"
    branch: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    email: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_core: bool = False


class MemberCreate(MemberBase):
    is_admin: bool = False


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    email: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_core: Optional[bool] = None
    is_admin: Optional[bool] = None


class MemberOut(MemberBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_admin: bool
    created_at: datetime


# ---------- Join Request ----------
class JoinRequestCreate(BaseModel):
    name: str
    email: EmailStr
    branch: Optional[str] = None
    year: Optional[str] = None
    interests: Optional[str] = None
    message: Optional[str] = None


class JoinRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    branch: Optional[str]
    year: Optional[str]
    interests: Optional[str]
    message: Optional[str]
    status: str
    created_at: datetime


class JoinRequestStatusUpdate(BaseModel):
    status: str  # approved | rejected


# ---------- Schedule ----------
class ScheduleItemIn(BaseModel):
    time_label: str
    title: str
    order: int = 0


class ScheduleItemOut(ScheduleItemIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Event ----------
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    location: Optional[str] = None
    status: str = "upcoming"
    is_featured: bool = False
    cover_image_url: Optional[str] = None


class EventCreate(EventBase):
    slug: Optional[str] = None
    schedule: List[ScheduleItemIn] = []


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    cover_image_url: Optional[str] = None
    schedule: Optional[List[ScheduleItemIn]] = None


class EventOut(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    created_at: datetime


class EventDetailOut(EventOut):
    schedule: List[ScheduleItemOut] = []


# ---------- Gallery ----------
class GalleryItemCreate(BaseModel):
    event_id: Optional[int] = None
    caption: Optional[str] = None
    year: Optional[str] = None


class GalleryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: Optional[int]
    type: str
    url: str
    caption: Optional[str]
    year: Optional[str]
    created_at: datetime


# ---------- Achievement ----------
class AchievementCreate(BaseModel):
    member_name: str
    title: str
    description: Optional[str] = None
    category: str = "General"
    badge_icon: str = "🏆"
    year: Optional[str] = None


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    badge_icon: Optional[str] = None
    year: Optional[str] = None
    status: Optional[str] = None


class AchievementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    member_name: str
    title: str
    description: Optional[str]
    category: str
    badge_icon: str
    year: Optional[str]
    status: str
    created_at: datetime


# ---------- Notice ----------
class NoticeCreate(BaseModel):
    title: str
    body: str
    category: str = "Announcement"
    status: str = "open"
    attachment_url: Optional[str] = None


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    attachment_url: Optional[str] = None


class NoticeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    body: str
    category: str
    status: str
    attachment_url: Optional[str] = None
    created_at: datetime


# ---------- Project ----------
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "General"
    tech_stack: Optional[str] = None
    is_live: bool = False
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    cover_image_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None
    is_live: Optional[bool] = None
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    cover_image_url: Optional[str] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str]
    category: str
    tech_stack: Optional[str]
    is_live: bool
    repo_url: Optional[str]
    demo_url: Optional[str]
    cover_image_url: Optional[str]
    created_at: datetime


# ---------- Bulk gallery import ----------
class GalleryBulkFromUrl(BaseModel):
    url: str
    event_id: Optional[int] = None
    year: Optional[str] = None


class GalleryBulkResult(BaseModel):
    imported: int
    skipped: int
    items: list[GalleryItemOut]


# ---------- Admin stats ----------
class AdminStats(BaseModel):
    total_members: int
    pending_join_requests: int
    pending_achievements: int
    total_events: int
    gallery_count: int
    open_notices: int
    pending_update_requests: int


# ---------- Member self-service auth ----------
class MemberSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch: Optional[str] = None
    year: Optional[str] = None


class MemberLogin(BaseModel):
    email: EmailStr
    password: str


class MemberToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    member: MemberOut


# ---------- Update requests (member -> admin) ----------
class UpdateRequestCreate(BaseModel):
    payload: dict
    note: Optional[str] = None


class UpdateRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    member_id: int
    payload_json: str
    note: Optional[str]
    status: str
    created_at: datetime


class UpdateRequestStatus(BaseModel):
    status: str  # approved | rejected


# ---------- Event registration (shareable page) ----------
class EventRegistrationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None


class EventRegistrationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    name: str
    email: str
    phone: Optional[str]
    branch: Optional[str]
    year: Optional[str]
    created_at: datetime


# ---------- Broadcast email ----------
class BroadcastEmailIn(BaseModel):
    subject: str
    body: str


class BroadcastEmailResult(BaseModel):
    recipients: int
    sent: int
    failed: int
    configured: bool
    detail: Optional[str] = None
