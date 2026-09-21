import os
import smtplib
from email.mime.text import MIMEText
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.AdminStats, dependencies=[Depends(get_current_admin)])
def stats(db: Session = Depends(get_db)):
    return schemas.AdminStats(
        total_members=db.query(models.Member).count(),
        pending_join_requests=db.query(models.JoinRequest).filter(models.JoinRequest.status == "pending").count(),
        pending_achievements=db.query(models.Achievement).filter(models.Achievement.status == "pending").count(),
        total_events=db.query(models.Event).count(),
        gallery_count=db.query(models.GalleryItem).count(),
        open_notices=db.query(models.Notice).filter(models.Notice.status == "open").count(),
        pending_update_requests=db.query(models.UpdateRequest).filter(models.UpdateRequest.status == "pending").count(),
    )


@router.post(
    "/broadcast-email",
    response_model=schemas.BroadcastEmailResult,
    dependencies=[Depends(get_current_admin)],
)
def broadcast_email(payload: schemas.BroadcastEmailIn, db: Session = Depends(get_db)):
    emails = set()
    for m in db.query(models.Member.email).filter(models.Member.email.isnot(None)):
        emails.add(m[0])
    for j in db.query(models.JoinRequest.email):
        emails.add(j[0])
    for r in db.query(models.EventRegistration.email):
        emails.add(r[0])
    emails.discard(None)
    emails.discard("")

    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("SMTP_FROM", user or "")

    if not host or not user or not password:
        return schemas.BroadcastEmailResult(
            recipients=len(emails), sent=0, failed=0, configured=False,
            detail="SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD (and optionally "
                   "SMTP_PORT, SMTP_FROM) in the backend .env file to enable sending.",
        )

    sent, failed = 0, 0
    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            server.login(user, password)
            for addr in emails:
                try:
                    msg = MIMEText(payload.body)
                    msg["Subject"] = payload.subject
                    msg["From"] = from_addr
                    msg["To"] = addr
                    server.sendmail(from_addr, [addr], msg.as_string())
                    sent += 1
                except Exception:
                    failed += 1
    except Exception as exc:
        return schemas.BroadcastEmailResult(
            recipients=len(emails), sent=sent, failed=len(emails) - sent, configured=True,
            detail=f"Could not connect to the SMTP server: {exc}",
        )

    return schemas.BroadcastEmailResult(recipients=len(emails), sent=sent, failed=failed, configured=True)
