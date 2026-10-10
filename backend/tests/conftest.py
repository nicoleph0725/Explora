import uuid
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

import models  # Registers SQLModel tables in metadata
from main import app
from database import get_session
from auth.sign_up import get_password_hash, create_access_token
from models import User

# In-memory SQLite database for isolated, fast test execution
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture(name="session")
def session_fixture():
    """Provides a fresh, isolated database session for each test."""
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Provides a FastAPI TestClient configured to use the in-memory SQLite database.
    Bypasses production database connections during startup lifespan.
    """
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    # Patch database startup/shutdown in lifespan so tests don't require PostgreSQL running
    with patch("main.init_db"), patch("main.engine.dispose"):
        with TestClient(app) as client:
            yield client

    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session) -> User:
    """Creates and persists a standard test user in the test database."""
    user = User(
        id=uuid.uuid4(),
        email="testuser@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword123"),
        created_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(test_user: User) -> dict:
    """Returns valid Authorization Bearer headers for the test_user."""
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="auth_client")
def auth_client_fixture(client: TestClient, auth_headers: dict) -> TestClient:
    """Provides a TestClient pre-authenticated with the test_user's bearer token."""
    client.headers.update(auth_headers)
    return client
