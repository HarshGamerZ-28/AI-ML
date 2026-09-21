import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..deps import get_db, get_current_admin

router = APIRouter(prefix="/events", tags=["events"])


def slugify(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return base or "event"


def unique_slug(db: Session, title: str, exclude_id: int | None = None) -> str:
    base = slugify(title)
    slug = base
    i = 2
    q = db.query(models.Event).filter(models.Event.slug == slug)
    if exclude_id:
        q = q.filter(models.Event.id != exclude_id)
    while q.first():
        slug = f"{base}-{i}"
        i += 1
        q = db.query(models.Event).filter(models.Event.slug == slug)
        if exclude_id:
            q = q.filter(models.Event.id != exclude_id)
    return slug


@router.get("", response_model=list[schemas.EventOut])
def list_events(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Event)
    if status:
        q = q.filter(models.Event.status == status)
    return q.order_by(models.Event.event_date.asc()).all()


@router.get("/next", response_model=schemas.EventOut | None)
def next_event(db: Session = Depends(get_db)):
    return (
        db.query(models.Event)
        .filter(models.Event.event_date >= datetime.utcnow())
        .order_by(models.Event.event_date.asc())
        .first()
    )


@router.get("/{id_or_slug}", response_model=schemas.EventDetailOut)
def get_event(id_or_slug: str, db: Session = Depends(get_db)):
    q = db.query(models.Event).options(joinedload(models.Event.schedule))
    event = q.filter(models.Event.slug == id_or_slug).first()
    if not event and id_or_slug.isdigit():
        event = q.filter(models.Event.id == int(id_or_slug)).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return event


@router.post("", response_model=schemas.EventDetailOut, dependencies=[Depends(get_current_admin)])
def create_event(payload: schemas.EventCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"schedule", "slug"})
    event = models.Event(**data, slug=unique_slug(db, payload.slug or payload.title))
    db.add(event)
    db.flush()
    for item in payload.schedule:
        db.add(models.ScheduleItem(event_id=event.id, **item.model_dump()))
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=schemas.EventDetailOut, dependencies=[Depends(get_current_admin)])
def update_event(event_id: int, payload: schemas.EventUpdate, db: Session = Depends(get_db)):
    event = db.query(models.Event).get(event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    data = payload.model_dump(exclude_unset=True, exclude={"schedule"})
    if "title" in data:
        event.slug = unique_slug(db, data["title"], exclude_id=event.id)
    for k, v in data.items():
        setattr(event, k, v)
    if payload.schedule is not None:
        db.query(models.ScheduleItem).filter(models.ScheduleItem.event_id == event.id).delete()
        for item in payload.schedule:
            db.add(models.ScheduleItem(event_id=event.id, **item.model_dump()))
    db.commit()
    db.refresh(event)
    return event


@router.post("/{event_id}/register", response_model=schemas.EventRegistrationOut)
def register_for_event(event_id: int, payload: schemas.EventRegistrationCreate, db: Session = Depends(get_db)):
    event = db.query(models.Event).get(event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    reg = models.EventRegistration(event_id=event_id, **payload.model_dump())
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.get(
    "/{event_id}/registrations",
    response_model=list[schemas.EventRegistrationOut],
    dependencies=[Depends(get_current_admin)],
)
def list_registrations(event_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.EventRegistration)
        .filter(models.EventRegistration.event_id == event_id)
        .order_by(models.EventRegistration.created_at.desc())
        .all()
    )


@router.delete("/{event_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).get(event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    db.delete(event)
    db.commit()
