def test_setup_smoke_check(client):
    """
    Verifies that the test client and FastAPI app setup works properly.
    """
    response = client.get("/test/healthcheck/")
    assert response.status_code == 200
    assert response.json() == {"hello": "healthcheck"}
