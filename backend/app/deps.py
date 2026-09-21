from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import SessionLocal
from . import models
from .auth import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.AdminUser:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated as admin",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise unauthorized
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin" or "sub" not in payload:
        raise unauthorized
    admin = db.query(models.AdminUser).filter(models.AdminUser.username == payload["sub"]).first()
    if not admin:
        raise unauthorized
    return admin


def get_current_member(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Member:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated as member",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise unauthorized
    payload = decode_token(token)
    if not payload or payload.get("role") != "member" or "sub" not in payload:
        raise unauthorized
    member = db.query(models.Member).filter(models.Member.id == int(payload["sub"])).first()
    if not member:
        raise unauthorized
    return member
