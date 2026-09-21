import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_member, get_current_admin

router = APIRouter(prefix="/update-requests", tags=["update-requests"])

ALLOWED_FIELDS = {"name", "role", "branch", "year", "bio", "skills", "email", "github_url", "linkedin_url"}


@router.post("", response_model=schemas.UpdateRequestOut)
def submit_update_request(
    payload: schemas.UpdateRequestCreate,
    member: models.Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    clean = {k: v for k, v in payload.payload.items() if k in ALLOWED_FIELDS}
    if not clean:
        raise HTTPException(400, "No editable fields in that request")
    req = models.UpdateRequest(member_id=member.id, payload_json=json.dumps(clean), note=payload.note)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/mine", response_model=list[schemas.UpdateRequestOut])
def my_requests(member: models.Member = Depends(get_current_member), db: Session = Depends(get_db)):
    return (
        db.query(models.UpdateRequest)
        .filter(models.UpdateRequest.member_id == member.id)
        .order_by(models.UpdateRequest.created_at.desc())
        .all()
    )


@router.get("", response_model=list[schemas.UpdateRequestOut], dependencies=[Depends(get_current_admin)])
def list_update_requests(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.UpdateRequest)
    if status:
        q = q.filter(models.UpdateRequest.status == status)
    return q.order_by(models.UpdateRequest.created_at.desc()).all()


@router.patch("/{request_id}", response_model=schemas.UpdateRequestOut, dependencies=[Depends(get_current_admin)])
def review_update_request(request_id: int, payload: schemas.UpdateRequestStatus, db: Session = Depends(get_db)):
    req = db.query(models.UpdateRequest).get(request_id)
    if not req:
        raise HTTPException(404, "Update request not found")
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(400, "Invalid status")

    if payload.status == "approved" and req.status != "approved":
        member = db.query(models.Member).get(req.member_id)
        if member:
            changes = json.loads(req.payload_json)
            for k, v in changes.items():
                if k in ALLOWED_FIELDS:
                    setattr(member, k, v)

    req.status = payload.status
    db.commit()
    db.refresh(req)
    return req
