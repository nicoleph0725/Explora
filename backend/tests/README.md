# Explora Backend Testing Guide

This test suite uses **pytest** and FastAPI's **TestClient** (powered by `httpx`).

Tests run against an **isolated in-memory SQLite database** using `StaticPool`. They do **not** touch your production PostgreSQL database and do **not** require PostgreSQL/Docker to be running.

---

## How to Run Tests

From the `backend` directory:

```powershell
# Run all tests
.\venv\Scripts\pytest.exe

# Run with verbose output
.\venv\Scripts\pytest.exe -v

# Run only a specific test file
.\venv\Scripts\pytest.exe tests/test_auth.py

# Run a specific test function
.\venv\Scripts\pytest.exe tests/test_auth.py -k "test_signup_success"
```

If you activate your virtual environment (`.\venv\Scripts\Activate.ps1`), you can simply run:
```powershell
pytest
```

---

## Available Fixtures (Defined in `conftest.py`)

You can include any of these fixtures as parameters in your test functions:

1. **`client`** (`TestClient`):
   - A FastAPI `TestClient` wired to the temporary in-memory database.
   - Use for unauthenticated requests or when you want to test the signup/login flow yourself.

2. **`session`** (`sqlmodel.Session`):
   - Direct access to the test database session.
   - Useful if you want to inspect rows in the database, insert sample data directly, etc.

3. **`test_user`** (`models.User`):
   - A pre-created user already saved into the test database:
     - `email`: `"testuser@example.com"`
     - `password`: `"testpassword123"`
     - `full_name`: `"Test User"`

4. **`auth_headers`** (`dict`):
   - Returns valid headers: `{"Authorization": "Bearer <jwt_token>"}` for `test_user`.

5. **`auth_client`** (`TestClient`):
   - A `TestClient` that **already has the authorization header attached**.
   - Use this whenever you want to test protected endpoints (e.g. `auth_client.get("/journals/")`) without manually signing up or logging in first.

---

## Writing Tests

Check out:
- `tests/test_health.py` – Minimal working smoke test.
- `tests/test_auth.py` – Skeletons and hints for authentication endpoints.
- `tests/test_journals.py` – Skeletons and hints for journal & scrapbook endpoints.
