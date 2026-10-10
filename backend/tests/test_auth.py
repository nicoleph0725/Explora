"""
Authentication & User API Tests

"""

import pytest


def test_signup_success(client):
    response = client.post(                                                                                                                       
            "/auth/sign-up",                                                                                                                          
            json={
                "email": "tester@example.com",
                "full_name": "Test User",
                "password": "securepassword123"
            }     
    )   
    # Checking that the server return HTTP 200 OK
    # e.g. if backend returns HTTP 500 the assert catches it immediately
    assert response.status_code == 200    

    data = response.json()

    # Checks that the JSON dictionary contains the key "access_token"
    assert "access_token" in data 
    assert data["token_type"] == "bearer"  

         
                     


def test_signup_duplicate_email(client):
    """
    Test that signing up with an already registered email returns 400.
    """
    pass


def test_login_success(client):
    """
    Test logging in with form data.
    Hint: POST to /auth/token with data:
      {"username": "<registered_email>", "password": "<password>"}
    Assert status_code == 200 and 'access_token' in response.json().
    """
    pass


def test_login_invalid_password(client):
    """
    Test that incorrect credentials return 401 Unauthorized.
    """
    pass


def test_get_current_user_profile(auth_client, test_user):
    """
    Test fetching the authenticated user's profile using the auth_client fixture.
    Hint: auth_client is already authenticated as test_user!
    GET /auth/users/me/
    Assert response.status_code == 200 and data["email"] == test_user.email
    """
    pass


def test_get_current_user_unauthorized(client):
    """
    Test that accessing /auth/users/me/ without an Authorization header returns 401.
    """
    pass
