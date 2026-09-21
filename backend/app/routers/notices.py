import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_admin
from .gallery import UPLOAD_DIR

router = APIRouter(prefix="/notices", tags=["notices"])


@router.post("/upload-attachment", dependencies=[Depends(get_current_admin)])
def upload_attachment(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(400, "Only PDF attachments are supported")
    fname = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, fname)
    with open(dest, "wb") as f:
        f.write(file.file.read())
    return {"url": f"/uploads/{fname}"}


@router.get("", response_model=list[schemas.NoticeOut])
def list_notices(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Notice)
    if status:
        q = q.filter(models.Notice.status == status)
    return q.order_by(models.Notice.created_at.desc()).all()


@router.get("/{notice_id}", response_model=schemas.NoticeOut)
def get_notice(notice_id: int, db: Session = Depends(get_db)):
    notice = db.query(models.Notice).get(notice_id)
    if not notice:
        raise HTTPException(404, "Notice not found")
    return notice


@router.post("", response_model=schemas.NoticeOut, dependencies=[Depends(get_current_admin)])
def create_notice(payload: schemas.NoticeCreate, db: Session = Depends(get_db)):
    notice = models.Notice(**payload.model_dump())
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice


@router.patch("/{notice_id}", response_model=schemas.NoticeOut, dependencies=[Depends(get_current_admin)])
def update_notice(notice_id: int, payload: schemas.NoticeUpdate, db: Session = Depends(get_db)):
    notice = db.query(models.Notice).get(notice_id)
    if not notice:
        raise HTTPException(404, "Notice not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(notice, k, v)
    db.commit()
    db.refresh(notice)
    return notice


@router.delete("/{notice_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_notice(notice_id: int, db: Session = Depends(get_db)):
    notice = db.query(models.Notice).get(notice_id)
    if not notice:
        raise HTTPException(404, "Notice not found")
    db.delete(notice)
    db.commit()
