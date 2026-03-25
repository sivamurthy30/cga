import uuid
import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.main import app


client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    payload = res.json()
    assert payload["status"] == "healthy"
    assert payload["mode"] == "fastapi"


def test_quiz_generate_contract():
    res = client.post("/api/quiz/generate", json={"skill": "python", "count": 4})
    assert res.status_code == 200
    payload = res.json()
    assert payload["skill"] == "python"
    assert "questions" in payload
    assert len(payload["questions"]) >= 1
    first = payload["questions"][0]
    assert {"question", "options", "correct", "difficulty", "explanation"} <= set(first.keys())


def test_auth_signup_login_verify():
    email = f"smoke-{uuid.uuid4().hex[:10]}@example.com"
    password = "StrongPass123!"
    name = "Smoke User"

    signup = client.post(
        "/api/auth/signup",
        json={"email": email, "password": password, "name": name},
    )
    assert signup.status_code == 200, signup.text
    signup_payload = signup.json()
    assert "token" in signup_payload
    assert signup_payload["user"]["email"] == email

    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, login.text
    token = login.json()["token"]

    verify = client.get("/api/auth/verify", headers={"Authorization": f"Bearer {token}"})
    assert verify.status_code == 200
    verify_payload = verify.json()
    assert verify_payload["user"]["email"] == email
