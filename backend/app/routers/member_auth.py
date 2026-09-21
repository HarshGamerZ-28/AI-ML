from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_member
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/member-auth", tags=["member-auth"])


@router.post("/signup", response_model=schemas.MemberToken)
def signup(payload: schemas.MemberSignup, db: Session = Depends(get_db)):
    existing = db.query(models.Member).filter(models.Member.email == payload.email).first()
    if existing and existing.password_hash:
        raise HTTPException(400, "An account with this email already exists — log in instead.")

    if existing:
        # A member record was added by an admin (e.g. from the team roster) but has no login yet.
        existing.password_hash = hash_password(payload.password)
        existing.name = existing.name or payload.name
        member = existing
    else:
        member = models.Member(
            name=payload.name, email=payload.email, branch=payload.branch, year=payload.year,
            role="Member", password_hash=hash_password(payload.password),
        )
        db.add(member)
    db.commit()
    db.refresh(member)

    token = create_access_token({"sub": str(member.id), "role": "member"})
    return {"access_token": token, "token_type": "bearer", "member": member}


@router.post("/login", response_model=schemas.MemberToken)
def login(payload: schemas.MemberLogin, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.email == payload.email).first()
    if not member or not member.password_hash or not verify_password(payload.password, member.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    token = create_access_token({"sub": str(member.id), "role": "member"})
    return {"access_token": token, "token_type": "bearer", "member": member}


@router.get("/me", response_model=schemas.MemberOut)
def me(member: models.Member = Depends(get_current_member)):
    return member
