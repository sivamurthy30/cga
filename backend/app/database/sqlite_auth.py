"""
SQLite fallback for auth when MongoDB is unavailable.
Uses the existing SQLite DB (data/career_guidance.db) with a simple users table.
"""
import sqlite3
import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

# Resolve DB path relative to project root
_DB_PATH = Path(__file__).resolve().parents[3] / "data" / "career_guidance.db"


def _conn():
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(_DB_PATH))
    con.row_factory = sqlite3.Row
    return con


def init_sqlite_users():
    """Create users table if it doesn't exist."""
    with _conn() as con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                email            TEXT    UNIQUE NOT NULL,
                password_hash    TEXT    NOT NULL,
                name             TEXT    DEFAULT '',
                onboarding_complete INTEGER DEFAULT 0,
                assessment_complete INTEGER DEFAULT 0,
                is_pro           INTEGER DEFAULT 0,
                created_at       TEXT    DEFAULT ''
            )
        """)
        con.commit()
    logger.info("✅ SQLite users table ready")


def sqlite_find_user(email: str) -> dict | None:
    with _conn() as con:
        row = con.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
    return dict(row) if row else None


def sqlite_create_user(email: str, password_hash: str, name: str = "",
                        is_pro: bool = False) -> str:
    with _conn() as con:
        cur = con.execute(
            """INSERT INTO users (email, password_hash, name, is_pro, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (email, password_hash, name, int(is_pro), datetime.utcnow().isoformat()),
        )
        con.commit()
        return str(cur.lastrowid)


def sqlite_update_user(email: str, **fields):
    if not fields:
        return
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [email]
    with _conn() as con:
        con.execute(f"UPDATE users SET {set_clause} WHERE email = ?", values)
        con.commit()
