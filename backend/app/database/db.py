import sys
import os

# Add the parent directory to sys.path so we can import the existing database module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from database import get_db

db = get_db()
