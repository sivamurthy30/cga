"""
PostgreSQL Database Implementation
Production-ready database for user profiles and learning data
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from datetime import datetime
import os
from contextlib import contextmanager

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class PostgresDB:
    def __init__(self, 
                 host='localhost',
                 port=5432,
                 database='career_guidance',
                 user='postgres',
                 password='postgres',
                 min_conn=1,
                 max_conn=10):
        """
        Initialize PostgreSQL connection pool
        
        Args:
            host: Database host
            port: Database port
            database: Database name
            user: Database user
            password: Database password
            min_conn: Minimum connections in pool
            max_conn: Maximum connections in pool
        """
        try:
            self.pool = SimpleConnectionPool(
                min_conn,
                max_conn,
                host=host,
                port=port,
                database=database,
                user=user,
                password=password
            )
            print(f"✅ PostgreSQL connection pool created successfully")
            self._create_tables()
        except Exception as e:
            print(f"❌ Failed to connect to PostgreSQL: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            self.pool.putconn(conn)
    
    def _create_tables(self):
        """Create all required tables"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Users/Learners table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS learners (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    password_hash VARCHAR(255),
                    target_role VARCHAR(100),
                    learning_speed VARCHAR(20) DEFAULT 'medium',
                    onboarding_complete BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Skills table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS learner_skills (
                    id SERIAL PRIMARY KEY,
                    learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
                    skill VARCHAR(100) NOT NULL,
                    proficiency_level VARCHAR(20) DEFAULT 'beginner',
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(learner_id, skill)
                )
            """)
            
            # Quiz results table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id SERIAL PRIMARY KEY,
                    learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
                    quiz_type VARCHAR(50),
                    score INTEGER,
                    total_questions INTEGER,
                    category VARCHAR(50),
                    results_data JSONB,
                    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Learning progress table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS learning_progress (
                    id SERIAL PRIMARY KEY,
                    learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
                    skill VARCHAR(100) NOT NULL,
                    status VARCHAR(20) DEFAULT 'in_progress',
                    progress_percentage INTEGER DEFAULT 0,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    UNIQUE(learner_id, skill)
                )
            """)
            
            # Recommendations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS recommendations (
                    id SERIAL PRIMARY KEY,
                    learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
                    skill VARCHAR(100) NOT NULL,
                    algorithm VARCHAR(50),
                    confidence FLOAT,
                    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Profile analysis table (resume/github)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS profile_analysis (
                    id SERIAL PRIMARY KEY,
                    learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
                    analysis_type VARCHAR(20),
                    skills_found TEXT[],
                    metadata JSONB,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Bandit state table (for ML model)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bandit_state (
                    id SERIAL PRIMARY KEY,
                    learner_id INTEGER REFERENCES learners(id) ON DELETE CASCADE,
                    skill VARCHAR(100) NOT NULL,
                    arm_data JSONB,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(learner_id, skill)
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email);
                CREATE INDEX IF NOT EXISTS idx_learner_skills_learner_id ON learner_skills(learner_id);
                CREATE INDEX IF NOT EXISTS idx_quiz_results_learner_id ON quiz_results(learner_id);
                CREATE INDEX IF NOT EXISTS idx_learning_progress_learner_id ON learning_progress(learner_id);
                CREATE INDEX IF NOT EXISTS idx_recommendations_learner_id ON recommendations(learner_id);
            """)
            
            print("✅ All tables created successfully")
    
    # ============================================
    # LEARNER OPERATIONS
    # ============================================
    
    def create_learner(self, email, name, target_role='', learning_speed='medium', phone=None):
        """Create new learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO learners (email, name, phone, target_role, learning_speed)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (email, name, phone, target_role, learning_speed))
            learner_id = cursor.fetchone()[0]
            return learner_id
    
    def get_learner(self, learner_id):
        """Get learner by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("SELECT * FROM learners WHERE id = %s", (learner_id,))
            return cursor.fetchone()
    
    def get_learner_by_email(self, email):
        """Get learner by email"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("SELECT * FROM learners WHERE email = %s", (email,))
            return cursor.fetchone()
    
    def update_learner(self, learner_id, **kwargs):
        """Update learner fields"""
        if not kwargs:
            return
        
        # Build dynamic UPDATE query
        set_clause = ", ".join([f"{key} = %s" for key in kwargs.keys()])
        values = list(kwargs.values())
        values.append(learner_id)
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"""
                UPDATE learners 
                SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, values)
    
    def delete_learner(self, learner_id):
        """Delete learner (cascades to all related data)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM learners WHERE id = %s", (learner_id,))
    
    # ============================================
    # SKILLS OPERATIONS
    # ============================================
    
    def add_skill(self, learner_id, skill, proficiency_level='beginner'):
        """Add skill to learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO learner_skills (learner_id, skill, proficiency_level)
                VALUES (%s, %s, %s)
                ON CONFLICT (learner_id, skill) 
                DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level
                RETURNING id
            """, (learner_id, skill, proficiency_level))
            return cursor.fetchone()[0]
    
    def get_learner_skills(self, learner_id):
        """Get all skills for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT skill, proficiency_level, added_at 
                FROM learner_skills 
                WHERE learner_id = %s
                ORDER BY added_at DESC
            """, (learner_id,))
            return cursor.fetchall()
    
    def remove_skill(self, learner_id, skill):
        """Remove skill from learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM learner_skills 
                WHERE learner_id = %s AND skill = %s
            """, (learner_id, skill))
    
    # ============================================
    # QUIZ OPERATIONS
    # ============================================
    
    def save_quiz_result(self, learner_id, quiz_type, score, total_questions, category, results_data):
        """Save quiz result"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO quiz_results 
                (learner_id, quiz_type, score, total_questions, category, results_data)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (learner_id, quiz_type, score, total_questions, category, 
                  psycopg2.extras.Json(results_data)))
            return cursor.fetchone()[0]
    
    def get_quiz_results(self, learner_id, limit=10):
        """Get quiz results for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT * FROM quiz_results 
                WHERE learner_id = %s
                ORDER BY taken_at DESC
                LIMIT %s
            """, (learner_id, limit))
            return cursor.fetchall()
    
    # ============================================
    # LEARNING PROGRESS OPERATIONS
    # ============================================
    
    def update_progress(self, learner_id, skill, progress_percentage, status='in_progress'):
        """Update learning progress for a skill"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            completed_at = datetime.now() if status == 'completed' else None
            
            cursor.execute("""
                INSERT INTO learning_progress 
                (learner_id, skill, status, progress_percentage, completed_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (learner_id, skill)
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    progress_percentage = EXCLUDED.progress_percentage,
                    completed_at = EXCLUDED.completed_at
                RETURNING id
            """, (learner_id, skill, status, progress_percentage, completed_at))
            return cursor.fetchone()[0]
    
    def get_learning_progress(self, learner_id):
        """Get all learning progress for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT * FROM learning_progress 
                WHERE learner_id = %s
                ORDER BY started_at DESC
            """, (learner_id,))
            return cursor.fetchall()
    
    # ============================================
    # RECOMMENDATIONS OPERATIONS
    # ============================================
    
    def save_recommendation(self, learner_id, skill, algorithm, confidence):
        """Save recommendation"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO recommendations 
                (learner_id, skill, algorithm, confidence)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (learner_id, skill, algorithm, confidence))
            return cursor.fetchone()[0]
    
    def get_recommendations(self, learner_id, limit=10):
        """Get recommendations for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT * FROM recommendations 
                WHERE learner_id = %s
                ORDER BY recommended_at DESC
                LIMIT %s
            """, (learner_id, limit))
            return cursor.fetchall()
    
    # ============================================
    # PROFILE ANALYSIS OPERATIONS
    # ============================================
    
    def save_profile_analysis(self, learner_id, analysis_type, skills_found, metadata):
        """Save profile analysis (resume/github)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO profile_analysis 
                (learner_id, analysis_type, skills_found, metadata)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (learner_id, analysis_type, skills_found, 
                  psycopg2.extras.Json(metadata)))
            return cursor.fetchone()[0]
    
    def get_profile_analyses(self, learner_id):
        """Get all profile analyses for learner"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT * FROM profile_analysis 
                WHERE learner_id = %s
                ORDER BY analyzed_at DESC
            """, (learner_id,))
            return cursor.fetchall()
    
    # ============================================
    # USER STATS OPERATIONS
    # ============================================
    
    def get_user_stats(self, learner_id):
        """Get XP, badges, streak for a user"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Get total completed skills
            cursor.execute("""
                SELECT COUNT(*) as completed_skills
                FROM learning_progress
                WHERE learner_id = %s AND status = 'completed'
            """, (learner_id,))
            completed_skills = cursor.fetchone()['completed_skills']
            
            # Get total quiz score
            cursor.execute("""
                SELECT COALESCE(SUM(score), 0) as total_score,
                       COUNT(*) as total_quizzes
                FROM quiz_results
                WHERE learner_id = %s
            """, (learner_id,))
            quiz_stats = cursor.fetchone()
            
            # Calculate XP (simple formula)
            xp = (completed_skills * 100) + (quiz_stats['total_score'] * 10)
            
            # Get streak (days with activity)
            cursor.execute("""
                SELECT COUNT(DISTINCT DATE(taken_at)) as active_days
                FROM quiz_results
                WHERE learner_id = %s
                  AND taken_at >= CURRENT_DATE - INTERVAL '7 days'
            """, (learner_id,))
            streak = cursor.fetchone()['active_days']
            
            # Get badges (achievements)
            badges = []
            if completed_skills >= 5:
                badges.append('Skill Master')
            if quiz_stats['total_quizzes'] >= 3:
                badges.append('Quiz Champion')
            if streak >= 3:
                badges.append('Consistent Learner')
            
            return {
                'xp': xp,
                'streak': streak,
                'badges': badges,
                'completed_skills': completed_skills,
                'total_quizzes': quiz_stats['total_quizzes']
            }
    
    def close(self):
        """Close all connections in pool"""
        if self.pool:
            self.pool.closeall()
            print("✅ PostgreSQL connection pool closed")


# Singleton instance
_db_instance = None

def get_db():
    """Get database instance (singleton)"""
    global _db_instance
    
    if _db_instance is None:
        # Get database config from environment variables
        host = os.getenv('POSTGRES_HOST', 'localhost')
        port = int(os.getenv('POSTGRES_PORT', 5432))
        database = os.getenv('POSTGRES_DB', 'career_guidance')
        user = os.getenv('POSTGRES_USER', 'postgres')
        password = os.getenv('POSTGRES_PASSWORD', 'postgres')
        
        _db_instance = PostgresDB(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
    
    return _db_instance
