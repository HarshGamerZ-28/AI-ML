from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_admin

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("", response_model=list[schemas.AchievementOut])
def list_achievements(
    category: str | None = None,
    status: str = "approved",
    db: Session = Depends(get_db),
):
    q = db.query(models.Achievement)
    if status != "all":
        q = q.filter(models.Achievement.status == status)
    if category:
        q = q.filter(models.Achievement.category == category)
    return q.order_by(models.Achievement.created_at.desc()).all()


@router.post("", response_model=schemas.AchievementOut)
def submit_achievement(payload: schemas.AchievementCreate, db: Session = Depends(get_db)):
    ach = models.Achievement(**payload.model_dump(), status="pending")
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach


@router.patch("/{achievement_id}", response_model=schemas.AchievementOut, dependencies=[Depends(get_current_admin)])
def update_achievement(achievement_id: int, payload: schemas.AchievementUpdate, db: Session = Depends(get_db)):
    ach = db.query(models.Achievement).get(achievement_id)
    if not ach:
        raise HTTPException(404, "Achievement not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(ach, k, v)
    db.commit()
    db.refresh(ach)
    return ach


@router.delete("/{achievement_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_achievement(achievement_id: int, db: Session = Depends(get_db)):
    ach = db.query(models.Achievement).get(achievement_id)
    if not ach:
        raise HTTPException(404, "Achievement not found")
    db.delete(ach)
    db.commit()
