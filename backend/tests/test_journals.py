"""
Journal & Page API Tests

"""

import pytest


def test_create_journal(auth_client):
    """
    Test creating a new journal.
    Hint: Use auth_client to POST to /journals/ with json payload:
      {"title": "Tokyo Trip 2026", "destination": "Tokyo, Japan"}
    Assert status_code == 200 and data["title"] == "Tokyo Trip 2026".
    """
    pass


def test_get_user_journals(auth_client):
    """
    Test retrieving all journals for the logged-in user.
    GET /journals/
    """
    pass


def test_get_journal_by_id(auth_client):
    """
    Test fetching a specific journal by UUID.
    GET /journals/{journal_id}
    """
    pass


def test_update_journal(auth_client):
    """
    Test updating journal metadata (e.g., title, destination).
    PUT /journals/{journal_id}
    """
    pass


def test_delete_journal(auth_client):
    """
    Test deleting a journal.
    DELETE /journals/{journal_id}
    """
    pass


def test_sync_pages(auth_client):
    """
    Test saving/syncing scrapbook pages.
    POST /journals/{journal_id}/pages/sync
    """
    pass


def test_access_journal_unauthorized(client):
    """
    Test that an unauthenticated client cannot access journals (returns 401).
    """
    pass
