# FastAPI Runbook

This runbook is the single source of truth for running and validating the FastAPI backend.

## 1) Local setup

From repo root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Start FastAPI backend

```bash
cd backend
python run_api.py
```

Server runs on `http://localhost:8000`.

## 3) Frontend integration contract

Frontend uses these endpoints:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `POST /api/auth/logout`
- `GET /api/user/profile`
- `POST /api/user/complete-onboarding`
- `POST /api/user/quiz/save`
- `POST /api/quiz/generate`
- `GET /api/roadmap/complete`

## 4) Smoke tests (local)

```bash
cd backend
bash run_smoke_tests.sh
```

or:

```bash
cd backend
pytest -q tests/test_api_smoke.py
```

## 5) CI smoke tests

GitHub Actions workflow:

- `.github/workflows/backend-fastapi-smoke.yml`

It runs on backend changes and executes:

```bash
pytest -q tests/test_api_smoke.py
```

## 6) Security baseline

- Passwords use `bcrypt` (via `passlib`).
- Legacy SHA-256 hashes are accepted only for login migration and upgraded to `bcrypt` on successful login.
- JWT verification is required for protected profile/user routes.
- CORS origins are restricted by `CORS_ORIGINS` in `.env`.

## 7) Required `.env` values

Set at least:

- `SECRET_KEY` (strong random value)
- `CORS_ORIGINS` (comma-separated origins; default localhost entries are provided)

Optional:

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `FAST2SMS_API_KEY`
