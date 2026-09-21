import os
import re
import uuid
import zipfile
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_admin

router = APIRouter(prefix="/gallery", tags=["gallery"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

VIDEO_EXT = {".mp4", ".webm", ".mov"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MEDIA_EXT = VIDEO_EXT | IMAGE_EXT


def _google_drive_direct_url(url: str) -> str:
    """Turn a Google Drive share link into a direct-download link. Best-effort — Drive's
    virus-scan interstitial for large files isn't handled, so this works reliably for
    smaller zips (roughly under 25-100MB depending on file type)."""
    m = re.search(r"drive\.google\.com/file/d/([^/]+)", url)
    if m:
        return f"https://drive.google.com/uc?export=download&id={m.group(1)}"
    m = re.search(r"[?&]id=([^&]+)", url)
    if m and "drive.google.com" in url:
        return f"https://drive.google.com/uc?export=download&id={m.group(1)}"
    return url


def _extract_zip_to_gallery(
    zip_path: str, db: Session, event_id: int | None, year: str | None
) -> tuple[list[models.GalleryItem], int]:
    """Shared by both bulk-upload and bulk-from-url: walk a zip, save every image/video
    member as its own file under UPLOAD_DIR, and create a GalleryItem for each."""
    created: list[models.GalleryItem] = []
    skipped = 0

    with zipfile.ZipFile(zip_path) as zf:
        for member in zf.namelist():
            base = os.path.basename(member)
            if not base or base.startswith(".") or "__MACOSX" in member:
                continue
            ext = os.path.splitext(base)[1].lower()
            if ext not in MEDIA_EXT:
                skipped += 1
                continue

            file_type = "video" if ext in VIDEO_EXT else "image"
            fname = f"{uuid.uuid4().hex}{ext}"
            dest = os.path.join(UPLOAD_DIR, fname)
            with zf.open(member) as src, open(dest, "wb") as out:
                out.write(src.read())

            item = models.GalleryItem(
                event_id=event_id, type=file_type, url=f"/uploads/{fname}",
                caption=os.path.splitext(base)[0], year=year,
            )
            db.add(item)
            created.append(item)

    db.commit()
    for item in created:
        db.refresh(item)
    return created, skipped


@router.get("", response_model=list[schemas.GalleryItemOut])
def list_gallery(
    event_id: int | None = None,
    year: str | None = None,
    type: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.GalleryItem)
    if event_id:
        q = q.filter(models.GalleryItem.event_id == event_id)
    if year:
        q = q.filter(models.GalleryItem.year == year)
    if type:
        q = q.filter(models.GalleryItem.type == type)
    return q.order_by(models.GalleryItem.created_at.desc()).all()


@router.post("/upload", response_model=schemas.GalleryItemOut)
def upload_gallery_item(
    file: UploadFile = File(...),
    event_id: int | None = Form(None),
    caption: str | None = Form(None),
    year: str | None = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    ext = os.path.splitext(file.filename)[1].lower()
    file_type = "video" if ext in VIDEO_EXT else "image"
    fname = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, fname)
    with open(dest, "wb") as f:
        f.write(file.file.read())

    item = models.GalleryItem(
        event_id=event_id, type=file_type, url=f"/uploads/{fname}", caption=caption, year=year
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/bulk-upload", response_model=schemas.GalleryBulkResult)
def bulk_upload_zip(
    file: UploadFile = File(...),
    event_id: int | None = Form(None),
    year: str | None = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(400, "Expected a .zip file")

    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name
    try:
        created, skipped = _extract_zip_to_gallery(tmp_path, db, event_id, year)
    except zipfile.BadZipFile:
        raise HTTPException(400, "That file isn't a valid zip archive")
    finally:
        os.remove(tmp_path)

    if not created:
        raise HTTPException(400, "No images or videos found in that zip")
    return schemas.GalleryBulkResult(imported=len(created), skipped=skipped, items=created)


@router.post("/bulk-from-url", response_model=schemas.GalleryBulkResult)
def bulk_upload_from_url(
    payload: schemas.GalleryBulkFromUrl,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Download a zip of photos/videos from a direct link or a Google Drive share link
    and import everything inside it. Only works for a single shared zip file, not a
    Drive *folder* listing — that needs the Drive API and real OAuth credentials, which
    is out of scope here. Large Drive files can also hit Google's virus-scan interstitial
    instead of the raw file; if that happens, download the zip yourself and use the
    zip-upload option instead."""
    try:
        import requests
    except ImportError:
        raise HTTPException(500, "The 'requests' package isn't installed on the server")

    url = _google_drive_direct_url(payload.url)
    try:
        resp = requests.get(url, timeout=60, stream=True)
        resp.raise_for_status()
    except Exception as exc:
        raise HTTPException(400, f"Couldn't download that link: {exc}")

    content_type = resp.headers.get("content-type", "")
    if "text/html" in content_type:
        raise HTTPException(
            400,
            "That link returned a web page instead of a file — for Google Drive, make sure "
            "sharing is set to 'Anyone with the link', and that the file is small enough to "
            "skip Drive's virus-scan warning page.",
        )

    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        for chunk in resp.iter_content(chunk_size=1 << 16):
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        created, skipped = _extract_zip_to_gallery(tmp_path, db, payload.event_id, payload.year)
    except zipfile.BadZipFile:
        raise HTTPException(400, "The downloaded file isn't a valid zip archive")
    finally:
        os.remove(tmp_path)

    if not created:
        raise HTTPException(400, "No images or videos found in that zip")
    return schemas.GalleryBulkResult(imported=len(created), skipped=skipped, items=created)


@router.delete("/{item_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_gallery_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.GalleryItem).get(item_id)
    if not item:
        raise HTTPException(404, "Gallery item not found")
    path = os.path.join(UPLOAD_DIR, os.path.basename(item.url))
    if os.path.exists(path):
        os.remove(path)
    db.delete(item)
    db.commit()
