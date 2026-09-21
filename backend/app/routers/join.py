from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_admin

router = APIRouter(prefix="/join", tags=["join"])


@router.post("", response_model=schemas.JoinRequestOut)
def submit_join_request(payload: schemas.JoinRequestCreate, db: Session = Depends(get_db)):
    jr = models.JoinRequest(**payload.model_dump())
    db.add(jr)
    db.commit()
    db.refresh(jr)
    return jr


@router.get("", response_model=list[schemas.JoinRequestOut], dependencies=[Depends(get_current_admin)])
def list_join_requests(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.JoinRequest)
    if status:
        q = q.filter(models.JoinRequest.status == status)
    return q.order_by(models.JoinRequest.created_at.desc()).all()


@router.patch("/{request_id}", response_model=schemas.JoinRequestOut, dependencies=[Depends(get_current_admin)])
def update_join_status(request_id: int, payload: schemas.JoinRequestStatusUpdate, db: Session = Depends(get_db)):
    jr = db.query(models.JoinRequest).get(request_id)
    if not jr:
        raise HTTPException(404, "Join request not found")
    if payload.status not in ("approved", "rejected", "pending"):
        raise HTTPException(400, "Invalid status")
    jr.status = payload.status
    db.commit()
    db.refresh(jr)
    return jr
