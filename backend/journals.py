import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import User, Journal, Page
from auth.sign_up import get_current_active_user

router = APIRouter(prefix="/journals", tags=["journals"])


# ==========================================
# Schemas (Data Transfer Objects)
# ==========================================

class PageData(BaseModel):
    id: Optional[str] = None
    page_number: Optional[int] = 1
    pageNumber: Optional[int] = None
    title: Optional[str] = None
    background_color: Optional[str] = None
    bgColor: Optional[str] = None
    bgPattern: Optional[str] = None
    template_id: Optional[str] = None
    elements: List[Dict[str, Any]] = []


class JournalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    destination: Optional[str] = None
    pages: Optional[List[PageData]] = None


class JournalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    destination: Optional[str] = None


class PagesSyncRequest(BaseModel):
    title: Optional[str] = None
    pages: List[Dict[str, Any]]


# ==========================================
# Helpers
# ==========================================

def format_page_response(page: Page) -> Dict[str, Any]:
    return {
        "id": str(page.id),
        "pageNumber": page.page_number,
        "page_number": page.page_number,
        "title": f"Page {page.page_number}",
        "bgColor": page.background_color or "#FAF6F0",
        "background_color": page.background_color or "#FAF6F0",
        "bgPattern": page.template_id or "plain",
        "template_id": page.template_id or "plain",
        "elements": page.elements or [],
    }


def format_journal_response(journal: Journal, include_pages: bool = True) -> Dict[str, Any]:
    pages_data = []
    if include_pages and journal.pages:
        # Sort pages by page_number
        sorted_pages = sorted(journal.pages, key=lambda p: p.page_number)
        pages_data = [format_page_response(p) for p in sorted_pages]

    return {
        "id": str(journal.id),
        "title": journal.title,
        "description": journal.description,
        "cover_image_url": journal.cover_image_url,
        "destination": journal.destination,
        "page_count": len(journal.pages) if journal.pages else 0,
        "pages": pages_data,
        "created_at": journal.created_at.isoformat() if journal.created_at else None,
        "updated_at": journal.updated_at.isoformat() if journal.updated_at else None,
    }


# ==========================================
# API Routes
# ==========================================

@router.get("/")
def list_journals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    List all journals for the authenticated user
    """
    statement = (
        select(Journal)
        .where(Journal.user_id == current_user.id)
        .order_by(Journal.updated_at.desc())
    )
    journals = db.exec(statement).all()
    return [format_journal_response(j, include_pages=True) for j in journals]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_journal(
    data: JournalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Create a new scrapbook journal with optional initial pages
    """
    new_journal = Journal(
        user_id=current_user.id,
        title=data.title or "New Travel Journal",
        description=data.description,
        cover_image_url=data.cover_image_url,
        destination=data.destination or "My Journey",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_journal)
    db.commit()
    db.refresh(new_journal)

    # Add initial pages if provided, or create 1 blank default page
    pages_to_add = data.pages if data.pages and len(data.pages) > 0 else [
        PageData(
            page_number=1,
            bgColor="#FAF6F0",
            bgPattern="dots",
            elements=[
                {
                    "id": "el-welcome-title",
                    "type": "text",
                    "x": 200,
                    "y": 80,
                    "width": 360,
                    "text": data.title or "My Travel Journal",
                    "fontFamily": "Playfair Display",
                    "fontSize": 32,
                    "fontWeight": "bold",
                    "color": "#722F37",
                    "textAlign": "center",
                    "rotation": 0,
                    "zIndex": 1
                }
            ]
        )
    ]

    for idx, p in enumerate(pages_to_add):
        p_num = p.pageNumber or p.page_number or (idx + 1)
        p_bg = p.bgColor or p.background_color or "#FAF6F0"
        p_pattern = p.bgPattern or p.template_id or "plain"

        page_record = Page(
            journal_id=new_journal.id,
            page_number=p_num,
            background_color=p_bg,
            template_id=p_pattern,
            elements=p.elements or [],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(page_record)

    db.commit()
    db.refresh(new_journal)

    return format_journal_response(new_journal, include_pages=True)


@router.get("/{journal_id}")
def get_journal(
    journal_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Fetch a single scrapbook journal and all of its pages & canvas elements
    """
    try:
        j_uuid = uuid.UUID(journal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid journal ID format")

    journal = db.get(Journal, j_uuid)
    if not journal or journal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Scrapbook journal not found")

    return format_journal_response(journal, include_pages=True)


@router.put("/{journal_id}")
def update_journal_metadata(
    journal_id: str,
    data: JournalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Update journal title, destination, description, or cover image
    """
    try:
        j_uuid = uuid.UUID(journal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid journal ID format")

    journal = db.get(Journal, j_uuid)
    if not journal or journal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Scrapbook journal not found")

    if data.title is not None:
        journal.title = data.title
    if data.destination is not None:
        journal.destination = data.destination
    if data.description is not None:
        journal.description = data.description
    if data.cover_image_url is not None:
        journal.cover_image_url = data.cover_image_url

    journal.updated_at = datetime.now(timezone.utc)
    db.add(journal)
    db.commit()
    db.refresh(journal)

    return format_journal_response(journal, include_pages=True)


@router.put("/{journal_id}/pages")
def sync_journal_pages(
    journal_id: str,
    data: PagesSyncRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Autosave & sync all pages and canvas elements for a scrapbook journal
    """
    try:
        j_uuid = uuid.UUID(journal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid journal ID format")

    journal = db.get(Journal, j_uuid)
    if not journal or journal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Scrapbook journal not found")

    # Update journal title if passed
    if data.title:
        journal.title = data.title

    journal.updated_at = datetime.now(timezone.utc)
    db.add(journal)

    # Delete existing pages and re-insert synchronized pages
    statement = select(Page).where(Page.journal_id == journal.id)
    existing_pages = db.exec(statement).all()
    for ep in existing_pages:
        db.delete(ep)

    # Insert incoming pages
    for idx, p in enumerate(data.pages):
        page_num = p.get("pageNumber") or p.get("page_number") or (idx + 1)
        bg_color = p.get("bgColor") or p.get("background_color") or "#FAF6F0"
        bg_pattern = p.get("bgPattern") or p.get("template_id") or "plain"
        elements = p.get("elements", [])

        # Try to parse or preserve page UUID if valid
        raw_id = p.get("id")
        page_uuid = None
        if raw_id:
            try:
                page_uuid = uuid.UUID(str(raw_id))
            except ValueError:
                page_uuid = uuid.uuid4()
        else:
            page_uuid = uuid.uuid4()

        page_record = Page(
            id=page_uuid,
            journal_id=journal.id,
            page_number=page_num,
            background_color=bg_color,
            template_id=bg_pattern,
            elements=elements,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(page_record)

    db.commit()
    db.refresh(journal)

    return {
        "status": "saved",
        "journal_id": str(journal.id),
        "updated_at": journal.updated_at.isoformat(),
        "pages_count": len(journal.pages)
    }


@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal(
    journal_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Delete a scrapbook journal and its pages
    """
    try:
        j_uuid = uuid.UUID(journal_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid journal ID format")

    journal = db.get(Journal, j_uuid)
    if not journal or journal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Scrapbook journal not found")

    db.delete(journal)
    db.commit()
    return None
