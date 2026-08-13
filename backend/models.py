import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON, Relationship


# ==========================================
# 1. USER MODEL
# ==========================================
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: Optional[str] = Field(default=None, unique=True, index=True)
    full_name: Optional[str] = Field(default=None)
    hashed_password: str
    avatar_url: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now(timezone.utc))

    # Relationships
    journals: List["Journal"] = Relationship(back_populates="user")
    media_assets: List["MediaAsset"] = Relationship(back_populates="user")


# ==========================================
# 2. JOURNAL MODEL
# ==========================================
class Journal(SQLModel, table=True):
    __tablename__ = "journals"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    destination: Optional[str] = None  # e.g., "Kyoto, Japan"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_public: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="journals")
    pages: List["Page"] = Relationship(
        back_populates="journal",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "Page.page_number"}
    )


# ==========================================
# 3. PAGE MODEL (Core Canvas & Slideshow Page)
# ==========================================
class Page(SQLModel, table=True):
    __tablename__ = "pages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    journal_id: uuid.UUID = Field(foreign_key="journals.id", index=True)
    page_number: int = Field(index=True)  # Order of page in the slideshow

    # Template tracking (e.g. "blank", "polaroid_grid", "trip_recap", "video_focus")
    template_id: Optional[str] = Field(default="freeform")

    # Canvas background styling
    background_color: str = Field(default="#ffffff")
    background_image_url: Optional[str] = None

    # Array of canvas elements (text, photo, video, pen drawing paths)
    # Stored as JSON / JSONB for flexible layout & fast loading
    elements: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    journal: Optional[Journal] = Relationship(back_populates="pages")


# ==========================================
# 4. MEDIA ASSET MODEL (For Photo/Video Storage)
# ==========================================
class MediaAsset(SQLModel, table=True):
    __tablename__ = "media_assets"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    journal_id: Optional[uuid.UUID] = Field(foreign_key="journals.id", default=None, index=True)
    
    file_url: str
    file_type: str  # "image" or "video"
    mime_type: str  # e.g., "image/jpeg", "video/mp4"
    file_size: int  # File size in bytes
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="media_assets")
