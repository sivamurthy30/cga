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
    """Create users table with all required fields if it doesn't exist."""
    with _conn() as con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                email                TEXT    UNIQUE NOT NULL,
                password_hash        TEXT    NOT NULL,
                name                 TEXT    DEFAULT '',
                onboarding_complete  INTEGER DEFAULT 0,
                assessment_complete  INTEGER DEFAULT 0,
                profile_complete     INTEGER DEFAULT 0,
                is_pro               INTEGER DEFAULT 0,
                subscription_status  TEXT    DEFAULT 'free',
                created_at           TEXT    DEFAULT '',
                updated_at           TEXT    DEFAULT '',
                last_login           TEXT    DEFAULT ''
            )
        """)
        # Migrate existing tables — add columns that may be missing
        _add_column_if_missing(con, "users", "assessment_complete",  "INTEGER DEFAULT 0")
        _add_column_if_missing(con, "users", "profile_complete",     "INTEGER DEFAULT 0")
        _add_column_if_missing(con, "users", "subscription_status",  "TEXT DEFAULT 'free'")
        _add_column_if_missing(con, "users", "updated_at",           "TEXT DEFAULT ''")
        _add_column_if_missing(con, "users", "last_login",           "TEXT DEFAULT ''")
        con.commit()
    logger.info("✅ SQLite users table ready")


def _add_column_if_missing(con, table: str, column: str, definition: str):
    """Safely add a column to an existing table (no-op if already present)."""
    existing = [r[1] for r in con.execute(f"PRAGMA table_info({table})").fetchall()]
    if column not in existing:
        con.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        logger.info(f"  Migrated: added {table}.{column}")


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
