"""
SQLite Database for Career Guidance System
Lightweight, fast, and perfect for < 100K users
"""

import sqlite3
import json
from datetime import datetime
from contextlib import contextmanager
import os
import numpy as np

class SQLiteDB:
    """Lightweight SQLite database for career guidance system"""
    
    def __init__(self, db_path='data/career_guidance.db'):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        
        # Performance optimizations
        conn.execute('PRAGMA journal_mode=WAL')  # Write-Ahead Logging
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute('PRAGMA cache_size=-64000')  # 64MB cache
        conn.execute('PRAGMA temp_store=MEMORY')
        
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def init_database(self):
        """Initialize database with schema"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Create tables
            cursor.executescript('''
                -- Learners table
                CREATE TABLE IF NOT EXISTS learners (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE,
                    password_hash TEXT,
                    name TEXT,
                    phone TEXT,
                    target_role TEXT DEFAULT '',
                    learning_speed TEXT DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    onboarding_complete BOOLEAN DEFAULT 0,
                    quiz_score INTEGER,
                    quiz_category TEXT,
                    last_saved_step INTEGER DEFAULT 0,
                    is_pro BOOLEAN DEFAULT 0
                );
                
                -- Learner skills
                CREATE TABLE IF NOT EXISTS learner_skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    skill TEXT NOT NULL,
                    proficiency_level TEXT DEFAULT 'beginner',
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                    UNIQUE(learner_id, skill)
                );
                
                -- Recommendations
                CREATE TABLE IF NOT EXISTS recommendations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    skill TEXT NOT NULL,
                    importance REAL,
                    category TEXT,
                    confidence REAL,
                    algorithm TEXT DEFAULT 'LinUCB',
                    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    accepted BOOLEAN DEFAULT 0,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
                );
                
                -- Learning progress
                CREATE TABLE IF NOT EXISTS learning_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    skill TEXT NOT NULL,
                    status TEXT DEFAULT 'not_started',
                    progress_percentage INTEGER DEFAULT 0,
                    time_spent_hours REAL DEFAULT 0,
                    quiz_score INTEGER,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                    UNIQUE(learner_id, skill)
                );
                
                -- Bandit state
                CREATE TABLE IF NOT EXISTS bandit_state (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill TEXT UNIQUE NOT NULL,
                    pulls INTEGER DEFAULT 0,
                    total_reward REAL DEFAULT 0,
                    avg_reward REAL DEFAULT 0,
                    A_matrix TEXT,
                    b_vector TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                -- Quiz results
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    quiz_type TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    category TEXT,
                    results_data TEXT,
                    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
                );
                
                -- Profile analysis
                CREATE TABLE IF NOT EXISTS profile_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    analysis_type TEXT NOT NULL,
                    skills_found TEXT,
                    metadata TEXT,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
                );
                
                -- Roadmap node completion (one row per node per user)
                CREATE TABLE IF NOT EXISTS roadmap_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    roadmap_id TEXT NOT NULL DEFAULT 'frontend-developer',
                    node_id TEXT NOT NULL,
                    completed BOOLEAN DEFAULT 1,
                    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                    UNIQUE(learner_id, roadmap_id, node_id)
                );

                -- Per-user XP, badges, streak (one row per user)
                CREATE TABLE IF NOT EXISTS user_stats (
                    learner_id INTEGER PRIMARY KEY,
                    total_xp INTEGER DEFAULT 0,
                    badges TEXT DEFAULT '[]',
                    streak INTEGER DEFAULT 0,
                    last_completed_date TEXT,
                    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
                );

                -- Indexes for fast queries
                CREATE INDEX IF NOT EXISTS idx_learner_skills ON learner_skills(learner_id);
                CREATE INDEX IF NOT EXISTS idx_recommendations ON recommendations(learner_id, recommended_at);
                CREATE INDEX IF NOT EXISTS idx_progress ON learning_progress(learner_id, status);
                CREATE INDEX IF NOT EXISTS idx_quiz_results ON quiz_results(learner_id, quiz_type);
                CREATE INDEX IF NOT EXISTS idx_roadmap_progress ON roadmap_progress(learner_id, roadmap_id);
            ''')
            # Migrate existing databases — add columns if missing
            for col, definition in [
                ('last_saved_step', 'INTEGER DEFAULT 0'),
                ('is_pro', 'BOOLEAN DEFAULT 0'),
            ]:
                try:
                    cursor.execute(f'ALTER TABLE learners ADD COLUMN {col} {definition}')
                except Exception:
                    pass  # Column already exists
    
    # ==================== LEARNER OPERATIONS ====================
    
    def create_learner(self, email, name, target_role='', learning_speed='medium', 
                      phone=None, quiz_score=None, quiz_category=None):
        """Create a new learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO learners (email, name, phone, target_role, learning_speed, 
                                     quiz_score, quiz_category, onboarding_complete)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            ''', (email, name, phone, target_role, learning_speed, quiz_score, quiz_category))
            return cursor.lastrowid
    
    def update_learner(self, learner_id, **kwargs):
        """Update learner fields"""
        if not kwargs:
            return False
            
        fields = ', '.join([f'{k} = ?' for k in kwargs.keys()])
        values = list(kwargs.values()) + [learner_id]
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f'''
                UPDATE learners 
                SET {fields}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', values)
            return cursor.rowcount > 0
    
    def get_learner(self, learner_id):
        """Get learner by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM learners WHERE id = ?', (learner_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_learner_by_email(self, email):
        """Get learner by email"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM learners WHERE email = ?', (email,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    # ==================== SKILLS OPERATIONS ====================
    
    def add_skill(self, learner_id, skill, proficiency_level='beginner'):
        """Add skill to learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO learner_skills (learner_id, skill, proficiency_level)
                VALUES (?, ?, ?)
            ''', (learner_id, skill, proficiency_level))
            return cursor.lastrowid
    
    def add_skills_batch(self, learner_id, skills):
        """Add multiple skills at once (faster)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany('''
                INSERT OR IGNORE INTO learner_skills (learner_id, skill)
                VALUES (?, ?)
            ''', [(learner_id, skill) for skill in skills])
    
    def get_learner_skills(self, learner_id):
        """Get all skills for a learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT skill, proficiency_level, added_at 
                FROM learner_skills 
                WHERE learner_id = ?
                ORDER BY added_at DESC
            ''', (learner_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    # ==================== RECOMMENDATIONS ====================
    
    def save_recommendation(self, learner_id, skill, importance, category, 
                          confidence, algorithm='LinUCB'):
        """Save a recommendation"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO recommendations 
                (learner_id, skill, importance, category, confidence, algorithm)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (learner_id, skill, importance, category, confidence, algorithm))
            return cursor.lastrowid
    
    def get_recommendations(self, learner_id, limit=10):
        """Get recent recommendations"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM recommendations 
                WHERE learner_id = ?
                ORDER BY recommended_at DESC
                LIMIT ?
            ''', (learner_id, limit))
            return [dict(row) for row in cursor.fetchall()]
    
    # ==================== PROGRESS TRACKING ====================
    
    def update_progress(self, learner_id, skill, status, progress_percentage=0, 
                       time_spent_hours=0, quiz_score=None):
        """Update learning progress"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Check if progress exists
            cursor.execute('''
                SELECT id FROM learning_progress 
                WHERE learner_id = ? AND skill = ?
            ''', (learner_id, skill))
            
            if cursor.fetchone():
                # Update existing
                cursor.execute('''
                    UPDATE learning_progress 
                    SET status = ?, progress_percentage = ?, 
                        time_spent_hours = ?, quiz_score = ?,
                        completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
                    WHERE learner_id = ? AND skill = ?
                ''', (status, progress_percentage, time_spent_hours, quiz_score, 
                     status, learner_id, skill))
            else:
                # Insert new
                cursor.execute('''
                    INSERT INTO learning_progress 
                    (learner_id, skill, status, progress_percentage, time_spent_hours, 
                     quiz_score, started_at)
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ''', (learner_id, skill, status, progress_percentage, time_spent_hours, quiz_score))
            
            return cursor.lastrowid
    
    def get_progress(self, learner_id):
        """Get all progress for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM learning_progress 
                WHERE learner_id = ?
                ORDER BY started_at DESC
            ''', (learner_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    # ==================== QUIZ OPERATIONS ====================
    
    def save_quiz_result(self, learner_id, quiz_type, score, total_questions, category, results_data):
        """Save quiz result"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Store results_data as JSON string
            results_json = json.dumps(results_data) if results_data else None
            cursor.execute('''
                INSERT INTO quiz_results 
                (learner_id, quiz_type, score, total_questions, category, results_data)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (learner_id, quiz_type, score, total_questions, category, results_json))
            return cursor.lastrowid
    
    def get_quiz_results(self, learner_id, limit=10):
        """Get quiz results for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM quiz_results 
                WHERE learner_id = ?
                ORDER BY taken_at DESC
                LIMIT ?
            ''', (learner_id, limit))
            results = []
            for row in cursor.fetchall():
                result = dict(row)
                # Parse JSON results_data
                if result.get('results_data'):
                    try:
                        result['results_data'] = json.loads(result['results_data'])
                    except:
                        result['results_data'] = {}
                results.append(result)
            return results
    
    def save_profile_analysis(self, learner_id, analysis_type, skills_found, metadata):
        """Save profile analysis (resume/github)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Store as JSON strings
            skills_json = json.dumps(skills_found) if skills_found else None
            metadata_json = json.dumps(metadata) if metadata else None
            cursor.execute('''
                INSERT INTO profile_analysis 
                (learner_id, analysis_type, skills_found, metadata)
                VALUES (?, ?, ?, ?)
            ''', (learner_id, analysis_type, skills_json, metadata_json))
            return cursor.lastrowid
    
    def get_profile_analyses(self, learner_id):
        """Get all profile analyses for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM profile_analysis 
                WHERE learner_id = ?
                ORDER BY analyzed_at DESC
            ''', (learner_id,))
            results = []
            for row in cursor.fetchall():
                result = dict(row)
                # Parse JSON fields
                if result.get('skills_found'):
                    try:
                        result['skills_found'] = json.loads(result['skills_found'])
                    except:
                        result['skills_found'] = []
                if result.get('metadata'):
                    try:
                        result['metadata'] = json.loads(result['metadata'])
                    except:
                        result['metadata'] = {}
                results.append(result)
            return results
    
    def get_learning_progress(self, learner_id):
        """Get all learning progress for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM learning_progress 
                WHERE learner_id = ?
                ORDER BY started_at DESC
            ''', (learner_id,))
            return [dict(row) for row in cursor.fetchall()]

    # ==================== ROADMAP PROGRESS ====================

    def upsert_roadmap_node(self, learner_id, roadmap_id, node_id, completed):
        """Mark a roadmap node as completed or not"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if completed:
                cursor.execute('''
                    INSERT INTO roadmap_progress (learner_id, roadmap_id, node_id, completed)
                    VALUES (?, ?, ?, 1)
                    ON CONFLICT(learner_id, roadmap_id, node_id)
                    DO UPDATE SET completed=1, completed_at=CURRENT_TIMESTAMP
                ''', (learner_id, roadmap_id, node_id))
            else:
                cursor.execute('''
                    DELETE FROM roadmap_progress
                    WHERE learner_id=? AND roadmap_id=? AND node_id=?
                ''', (learner_id, roadmap_id, node_id))

    def get_roadmap_progress(self, learner_id, roadmap_id):
        """Return list of completed node IDs for a roadmap"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT node_id FROM roadmap_progress
                WHERE learner_id=? AND roadmap_id=? AND completed=1
            ''', (learner_id, roadmap_id))
            return [row['node_id'] for row in cursor.fetchall()]

    # ==================== USER STATS ====================

    def get_user_stats(self, learner_id):
        """Get XP, badges, streak for a user"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM user_stats WHERE learner_id=?', (learner_id,))
            row = cursor.fetchone()
            if row:
                result = dict(row)
                try:
                    result['badges'] = json.loads(result['badges'])
                except Exception:
                    result['badges'] = []
                return result
            return {'learner_id': learner_id, 'total_xp': 0, 'badges': [],
                    'streak': 0, 'last_completed_date': None}

    def upsert_user_stats(self, learner_id, total_xp, badges, streak, last_completed_date):
        """Save/update user XP, badges, streak"""
        badges_json = json.dumps(badges) if isinstance(badges, list) else badges
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO user_stats (learner_id, total_xp, badges, streak, last_completed_date)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(learner_id)
                DO UPDATE SET total_xp=excluded.total_xp,
                              badges=excluded.badges,
                              streak=excluded.streak,
                              last_completed_date=excluded.last_completed_date
            ''', (learner_id, total_xp, badges_json, streak, last_completed_date))

    # ==================== ANALYTICS ====================
    
    def get_learner_stats(self, learner_id):
        """Get comprehensive learner statistics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Total skills
            cursor.execute('SELECT COUNT(*) as count FROM learner_skills WHERE learner_id = ?', 
                          (learner_id,))
            total_skills = cursor.fetchone()['count']
            
            # Completed skills
            cursor.execute('''
                SELECT COUNT(*) as count FROM learning_progress 
                WHERE learner_id = ? AND status = 'completed'
            ''', (learner_id,))
            completed_skills = cursor.fetchone()['count']
            
            # Total time spent
            cursor.execute('''
                SELECT SUM(time_spent_hours) as total FROM learning_progress 
                WHERE learner_id = ?
            ''', (learner_id,))
            total_hours = cursor.fetchone()['total'] or 0
            
            return {
                'total_skills': total_skills,
                'completed_skills': completed_skills,
                'in_progress': total_skills - completed_skills,
                'total_hours': round(total_hours, 2)
            }


# Singleton instance
_db_instance = None

def get_db():
    """Get database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = SQLiteDB()
    return _db_instance
