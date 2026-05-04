"""Coding, DSA, and tech skills knowledge chunks"""

CODING_CHUNKS = [
  {
    "intents": ["learn_coding"],
    "tags": ["start coding", "learn programming", "beginner", "how to code", "first language"],
    "content": "how to start coding learn programming beginner first language",
    "response": """How to start coding from scratch:

🚀 **Step 1: Choose your first language**
• **Python** — easiest syntax, best for beginners, used in web + AI
• **JavaScript** — if you want web development immediately
• **Recommendation: Python first**

📅 **30-day beginner plan:**
• Week 1: Variables, data types, if/else, loops
• Week 2: Functions, lists, dictionaries
• Week 3: File handling, error handling, OOP basics
• Week 4: Build a small project (calculator, to-do list)

🆓 **Free resources:**
• CS50P (Harvard Python course — free on edX)
• Python.org official tutorial
• FreeCodeCamp Python course (YouTube, 4 hrs)
• Replit.com — code in browser, no setup

⚠️ **Avoid these mistakes:**
• Don't watch tutorials without coding along
• Don't switch languages every week
• Don't skip building projects

**The secret:** Code every day, even 30 minutes. Consistency > intensity."""
  },
  {
    "intents": ["learn_coding"],
    "tags": ["python vs java", "which language", "best language", "python better"],
    "content": "python vs java which language best for beginners",
    "response": """Python vs Java — which to learn first?

🐍 **Python:**
• Syntax: `print("Hello")` — clean and readable
• Used for: Web (Django/FastAPI), Data Science, ML, Automation, Scripting
• Job market: Huge demand, especially in AI/ML
• Learning curve: Gentle — beginners love it
• Best for: Data science, ML, backend, scripting

☕ **Java:**
• Syntax: More verbose, strict typing
• Used for: Android apps, enterprise software, Spring Boot
• Job market: Strong in enterprise/banking sector
• Learning curve: Steeper
• Best for: Android dev, enterprise backend

**My recommendation:**
• Want AI/ML/Data Science → **Python**
• Want Android development → **Java or Kotlin**
• Want web development → **JavaScript**
• Want general programming → **Python**

**Start with Python.** You can always learn Java later. Python skills transfer everywhere."""
  },
  {
    "intents": ["learn_coding"],
    "tags": ["how long", "time to learn", "months", "coding timeline"],
    "content": "how long does it take to learn coding programming months",
    "response": """Realistic coding learning timelines:

⏱️ **With 2-3 hours/day:**
• Python basics: 4-6 weeks
• Web dev basics (HTML/CSS/JS): 6-8 weeks
• React or Django: 8-12 weeks
• Job-ready (with projects): 6-12 months

📅 **Milestones:**
• Month 1: Write basic programs, understand logic
• Month 2-3: Build small projects
• Month 4-6: Intermediate concepts + frameworks
• Month 7-9: Real projects + DSA basics
• Month 10-12: Portfolio + job applications

🔑 **What speeds it up:**
• Building projects (not just tutorials)
• Solving problems daily (LeetCode Easy)
• Getting code reviewed
• Working on real problems

**The honest truth:** Most people take 12-18 months to get their first job. But with focused effort, 6-9 months is achievable."""
  },
  {
    "intents": ["dsa"],
    "tags": ["dsa", "data structures", "algorithms", "how to prepare", "important topics"],
    "content": "how to prepare dsa data structures algorithms important topics",
    "response": """DSA preparation guide:

📚 **Core topics (in order):**
1. Arrays & Strings
2. Hashmaps & Sets
3. Two Pointers & Sliding Window
4. Stack & Queue
5. Linked Lists
6. Binary Search
7. Recursion & Backtracking
8. Trees (BFS, DFS)
9. Graphs (BFS, DFS, Dijkstra)
10. Dynamic Programming

📅 **Study plan:**
• Month 1: Arrays, Strings, Hashmaps (50 Easy problems)
• Month 2: Trees, Graphs, Recursion (30 Medium)
• Month 3: DP, Advanced (20 Medium + 10 Hard)

🎯 **Daily target:**
• Beginner: 1-2 problems/day
• Intermediate: 2-3 problems/day
• Interview prep: 3-5 problems/day

🔧 **Resources:**
• LeetCode (primary)
• Striver's A2Z DSA Sheet (free, structured)
• NeetCode.io (video explanations)
• GeeksForGeeks (theory)

**Key insight:** Understand patterns, not memorize solutions. The same 20 patterns cover 80% of interview questions."""
  },
  {
    "intents": ["dsa"],
    "tags": ["time complexity", "big o", "space complexity", "complexity analysis"],
    "content": "time complexity space complexity big o notation analysis",
    "response": """Time & Space Complexity explained:

📊 **Big O — from best to worst:**
• O(1) — Constant: `arr[0]`, hashmap lookup
• O(log n) — Logarithmic: Binary search
• O(n) — Linear: Single loop
• O(n log n) — Linearithmic: Merge sort, heap sort
• O(n²) — Quadratic: Nested loops
• O(2ⁿ) — Exponential: Recursive fibonacci (naive)

🧮 **How to calculate:**
```
for i in range(n):        # O(n)
    for j in range(n):    # O(n)
        print(i, j)       # O(n²) total
```

**Rules:**
• Drop constants: O(2n) → O(n)
• Drop lower terms: O(n² + n) → O(n²)
• Nested loops multiply: O(n) × O(n) = O(n²)

🎯 **Interview tip:**
Always state time AND space complexity. Interviewers expect both.

**Common interview question:** "Can you optimize this from O(n²) to O(n)?"
→ Answer: Use a hashmap to trade space for time."""
  },
  {
    "intents": ["dsa"],
    "tags": ["leetcode", "how many problems", "daily problems", "crack interview"],
    "content": "leetcode how many problems daily crack coding interview faang",
    "response": """LeetCode strategy to crack interviews:

🎯 **Minimum to crack product companies:**
• 100-150 problems (70% Easy, 30% Medium)
• Focus on patterns, not count

🎯 **For FAANG/top companies:**
• 200-300 problems
• 50% Easy, 40% Medium, 10% Hard
• System design knowledge

📅 **Realistic schedule:**
• 3 months before interview: 2-3 problems/day
• 1 month before: 4-5 problems/day + mock interviews

🔑 **The right approach:**
1. Spend 20-30 min trying yourself
2. If stuck, look at hint (not full solution)
3. Code the solution
4. Understand time/space complexity
5. Review after 3 days (spaced repetition)

📋 **Must-do problem lists:**
• Blind 75 (classic list)
• NeetCode 150 (updated, with videos)
• Striver's SDE Sheet (Indian companies)

**Don't grind randomly.** Follow a structured list and understand each pattern."""
  },
  {
    "intents": ["web_dev"],
    "tags": ["web development", "frontend", "backend", "full stack", "what is"],
    "content": "what is web development frontend backend full stack",
    "response": """Web Development explained:

🎨 **Frontend (what users see):**
• HTML — structure
• CSS — styling
• JavaScript — interactivity
• React/Vue/Angular — modern frameworks
• Tools: VS Code, Chrome DevTools, Figma

⚙️ **Backend (server logic):**
• Python (FastAPI/Django) or Node.js (Express)
• Databases: PostgreSQL, MongoDB
• APIs: REST, GraphQL
• Authentication: JWT, OAuth

🚀 **Full Stack = Frontend + Backend**
• Most in-demand role
• MERN: MongoDB + Express + React + Node
• PERN: PostgreSQL + Express + React + Node

📅 **Learning path:**
1. HTML + CSS (3 weeks)
2. JavaScript (6 weeks)
3. React (6 weeks)
4. Node.js + Express (4 weeks)
5. Database (3 weeks)
6. Build full project (4 weeks)

**Total: ~6 months to job-ready full stack developer**"""
  },
  {
    "intents": ["ai_ml"],
    "tags": ["machine learning", "ai", "data science", "how to start", "career"],
    "content": "how to start machine learning ai data science career",
    "response": """Starting AI/ML/Data Science:

🗺️ **Roadmap:**

**Phase 1 — Math & Python (2 months):**
• Python: NumPy, Pandas, Matplotlib
• Math: Linear algebra, statistics, probability
• Resource: Khan Academy (math), CS50P (Python)

**Phase 2 — ML Basics (2 months):**
• Supervised learning: regression, classification
• Unsupervised: clustering, dimensionality reduction
• Scikit-learn library
• Kaggle beginner competitions

**Phase 3 — Deep Learning (2 months):**
• Neural networks, CNNs, RNNs
• TensorFlow or PyTorch
• Fast.ai course (free, practical)

**Phase 4 — Specialization (2 months):**
• NLP (text) or Computer Vision (images)
• LLMs and fine-tuning
• MLOps: deploying models

💰 **Salary:**
• Fresher: ₹6-15 LPA
• 2-3 years: ₹15-40 LPA
• Senior ML: ₹40-100+ LPA

**Is AI a good career?** Yes — it's the fastest growing field. But it requires strong math + coding foundation."""
  },
]
