"""
Dev utility — seed a fully-onboarded Pro test account.

Run once (or any time) from the backend folder:
    python seed_pro_user.py

Credentials:
    Email:    pro@deva.dev
    Password: DevaPro123!
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database.sqlite_db import SQLiteDB
from app.utils.security import get_password_hash

EMAIL    = "pro@deva.dev"
PASSWORD = "DevaPro123!"
NAME     = "Pro Tester"

db = SQLiteDB(db_path="data/career_guidance.db")

existing = db.get_learner_by_email(EMAIL)
if existing:
    user_id = existing["id"]
    print(f"User already exists (id={user_id}), updating...")
else:
    user_id = db.create_learner(
        email=EMAIL,
        name=NAME,
        target_role="Full Stack Developer",
        learning_speed="fast",
    )
    print(f"Created new user (id={user_id})")

db.update_learner(
    user_id,
    password_hash=get_password_hash(PASSWORD),
    onboarding_complete=1,
    is_pro=1,
    target_role="Full Stack Developer",
    learning_speed="fast",
)

db.add_skills_batch(user_id, [
    "JavaScript", "React", "Node.js", "Python", "SQL",
    "Docker", "TypeScript", "AWS", "Machine Learning",
])

print("\n✅ Pro test user ready")
print(f"   Email:    {EMAIL}")
print(f"   Password: {PASSWORD}")
print(f"   is_pro:   True")
print(f"   onboarding_complete: True")
