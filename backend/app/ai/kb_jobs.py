"""Jobs, resume, projects, soft skills, productivity knowledge chunks"""

JOBS_CHUNKS = [
  {
    "intents": ["resume"],
    "tags": ["resume", "build resume", "ats", "what to include", "resume tips"],
    "content": "how to build resume ats friendly what to include tips",
    "response": """Building a resume that gets callbacks:

📄 **Structure (1 page for freshers):**
```
Name | Email | Phone | GitHub | LinkedIn | Portfolio
─────────────────────────────────────────────────────
SKILLS
Languages: Python, JavaScript, Java
Frameworks: React, FastAPI, Node.js
Tools: Git, Docker, PostgreSQL

PROJECTS (most important for freshers)
Project Name | Tech Stack | GitHub Link
• What it does (1 line)
• Key feature or metric (e.g., "handles 1000 req/sec")

EXPERIENCE (if any)
Company | Role | Duration
• Action verb + what you did + impact

EDUCATION
College | Degree | CGPA | Year
```

✅ **ATS tips:**
• Use keywords from job description
• No tables, no images, no columns
• Standard fonts (Arial, Calibri)
• Save as PDF

✅ **Writing tips:**
• Start bullets with action verbs: Built, Designed, Reduced, Improved
• Quantify: "Reduced load time by 40%" not "improved performance"
• Tailor for each job

❌ **Avoid:**
• Objective statement (outdated)
• Personal photo
• References
• Irrelevant hobbies"""
  },
  {
    "intents": ["resume"],
    "tags": ["no experience", "fresher resume", "no projects", "first resume"],
    "content": "fresher resume no experience no projects first resume",
    "response": """Fresher resume with no experience — here's what to do:

🎯 **The truth:** Companies hire freshers for potential, not experience.

**What to put instead of experience:**

1. **Projects (most important)**
   • Build 2-3 projects this week
   • Even simple ones: Todo app, Weather app, Calculator
   • Deploy them on Vercel/Netlify
   • Add to GitHub with good README

2. **Coursework / Certifications**
   • FreeCodeCamp certificates (free)
   • Google/Meta certificates on Coursera
   • Relevant college courses

3. **Open Source Contributions**
   • Fix a bug in any GitHub project
   • Even documentation improvements count

4. **Hackathons / Competitions**
   • Participate in any hackathon
   • Even participation shows initiative

**The 2-week plan:**
• Week 1: Build 2 projects
• Week 2: Deploy + write resume + apply

**Remember:** A resume with 2 deployed projects beats a resume with 0 projects and a 9 CGPA."""
  },
  {
    "intents": ["projects"],
    "tags": ["project ideas", "what to build", "beginner projects", "portfolio projects"],
    "content": "project ideas what to build beginner portfolio projects",
    "response": """Project ideas by level:

🟢 **Beginner (build these first):**
• Todo app with CRUD operations
• Weather app (OpenWeather API)
• Calculator
• Quiz app
• Personal portfolio website

🟡 **Intermediate (for resume):**
• Blog with user authentication
• E-commerce product page with cart
• Chat application (WebSockets)
• URL shortener
• Expense tracker with charts

🔴 **Advanced (stand out):**
• Full-stack social media app
• Real-time collaborative editor
• Job board with search/filter
• AI-powered resume analyzer
• SaaS with subscription payments

🤖 **AI/ML Projects:**
• Sentiment analysis on tweets
• Image classifier (cats vs dogs)
• Movie recommendation system
• Fake news detector
• Resume parser

📌 **Project tips:**
• Deploy everything (Vercel, Netlify, Railway)
• Write a good README with screenshots
• Add a live demo link
• Explain your tech choices

**Quality > Quantity.** 2 great projects > 10 tutorial clones."""
  },
  {
    "intents": ["jobs_internships"],
    "tags": ["get first job", "how to get job", "placement", "job search", "apply"],
    "content": "how to get first job placement job search apply internship",
    "response": """Getting your first developer job:

🗺️ **The complete strategy:**

**Step 1: Build the foundation (3-6 months)**
• 3 deployed projects on GitHub
• 50+ LeetCode Easy problems
• Basic DSA knowledge
• Clean resume

**Step 2: Apply strategically**
• LinkedIn: Apply to 10-15 jobs/day
• Naukri.com: Set job alerts
• AngelList/Wellfound: Startups
• Company career pages directly
• Referrals: Ask seniors/alumni

**Step 3: Interview prep**
• DSA: 2-3 problems/day
• System design basics
• Behavioral: STAR method
• Know your projects inside-out

**Step 4: Network**
• Connect with 5 developers/week on LinkedIn
• Comment on posts, share your projects
• Attend tech meetups

📊 **Realistic numbers:**
• Apply to 100+ companies
• Get 10-15 interviews
• Convert 1-3 offers
• Timeline: 3-6 months of active applying

**The #1 mistake:** Waiting until you're "ready." Apply now, learn as you go."""
  },
  {
    "intents": ["jobs_internships"],
    "tags": ["internship", "how to get internship", "first internship", "intern"],
    "content": "how to get internship first internship apply",
    "response": """Getting your first internship:

🎯 **Where to find internships:**
• LinkedIn (filter: Internship)
• Internshala (India's best for internships)
• LetsIntern
• AngelList (startups)
• Company websites directly
• College placement cell

📅 **When to apply:**
• 3rd year: Start applying in semester 5-6
• 2nd year: Apply for summer internships in Feb-March
• 1st year: Contribute to open source instead

✅ **What you need:**
• 1-2 projects (even simple ones)
• Basic coding skills
• Clean LinkedIn profile
• Resume (1 page)

📧 **Cold email template:**
```
Subject: Internship Application — [Your Name]

Hi [Name],
I'm a [year] CSE student at [college].
I've built [project] using [tech stack].
I'd love to contribute to [company] as an intern.
My GitHub: [link]
Available for a quick call?
```

**Pro tip:** Apply to 50+ internships. Response rate is ~5-10%. Numbers game."""
  },
  {
    "intents": ["jobs_internships"],
    "tags": ["salary negotiation", "negotiate", "how much to ask", "salary hike"],
    "content": "salary negotiation how much to ask negotiate offer",
    "response": """Salary negotiation — don't leave money on the table:

💰 **India fresher ranges (2024-25):**
• Service companies (TCS, Infosys, Wipro): ₹3.5-7 LPA
• Product startups: ₹6-15 LPA
• Mid-size product: ₹8-20 LPA
• FAANG/top companies: ₹20-50+ LPA

🎯 **Negotiation tactics:**

1. **Never give a number first**
   "What's the budget for this role?"

2. **Counter 15-20% above their offer**
   They offer ₹8L → You ask ₹9.5L

3. **Use competing offers**
   "I have another offer for ₹X, can you match?"

4. **Negotiate total comp**
   Base + bonus + equity + WFH + learning budget

5. **Get it in writing**
   Don't resign current job until offer letter received

📊 **Research tools:**
• Glassdoor, AmbitionBox (India)
• Levels.fyi (for top companies)
• LinkedIn Salary

**Remember:** The worst they can say is no. Always negotiate."""
  },
  {
    "intents": ["soft_skills"],
    "tags": ["communication", "soft skills", "speak confident", "english", "presentation"],
    "content": "communication skills soft skills speak confidently english improve",
    "response": """Improving communication and soft skills:

🗣️ **Communication (most important soft skill):**
• Practice explaining technical concepts simply
• Record yourself speaking — watch it back
• Join Toastmasters or a speaking club
• Teach what you learn (blog, YouTube, Twitter)

📝 **Written communication:**
• Write clear commit messages
• Write good README files
• Practice writing emails professionally
• Document your code

🤝 **Interview communication:**
• Think out loud during coding
• Ask clarifying questions
• Structure answers: Situation → Action → Result
• It's okay to say "I don't know, but here's how I'd find out"

🌍 **Improving English:**
• Watch tech talks on YouTube (no subtitles)
• Read tech blogs daily (Medium, Dev.to)
• Write in English daily (even a journal)
• Speak English with friends/colleagues

💡 **The real secret:**
Communication improves through practice, not theory.
Start a tech blog. Explain one concept per week. Your communication will transform in 3 months."""
  },
  {
    "intents": ["productivity"],
    "tags": ["motivation", "procrastination", "focus", "discipline", "burnout", "consistency"],
    "content": "motivation procrastination focus discipline burnout consistency productivity",
    "response": """Staying consistent and productive:

🧠 **Why you procrastinate:**
• Task feels too big → Break it into 25-min chunks
• Fear of failure → Done is better than perfect
• No clear goal → Set a specific daily target

⚡ **Productivity system that works:**

**Morning (30 min):**
• Review today's goal (1 specific thing to finish)
• No phone for first 30 min

**Work blocks:**
• Pomodoro: 25 min focus + 5 min break
• 4 blocks = 2 hours of deep work
• That's enough to make real progress

**Evening (10 min):**
• Write what you did today
• Plan tomorrow's 1 goal

🔋 **Beating burnout:**
• Take 1 full day off per week
• Exercise 3x/week (seriously helps focus)
• Sleep 7-8 hours (non-negotiable)
• Celebrate small wins

💪 **Motivation truth:**
Motivation is unreliable. Build systems instead.
"I will code for 30 minutes after dinner" > "I'll code when I feel motivated"

**The 1% rule:** Get 1% better every day. In 1 year, you're 37x better."""
  },
  {
    "intents": ["skill_gap"],
    "tags": ["skill gap", "what skills", "missing skills", "skills needed", "which skills"],
    "content": "skill gap what skills missing needed for job web ml data",
    "response": """Skills needed by role (2025-26):

🎨 **Frontend Developer:**
Must: HTML, CSS, JavaScript, React, Git
Good to have: TypeScript, Next.js, Testing, Figma

⚙️ **Backend Developer:**
Must: Python or Node.js, SQL, REST APIs, Git, Docker
Good to have: Redis, Message queues, Cloud basics

🚀 **Full Stack:**
Must: React + Node.js/Python, SQL, Git, Docker
Good to have: TypeScript, CI/CD, AWS basics

🤖 **ML Engineer:**
Must: Python, NumPy, Pandas, Scikit-learn, SQL
Good to have: TensorFlow/PyTorch, MLOps, Cloud

☁️ **DevOps/Cloud:**
Must: Linux, Docker, Git, CI/CD, AWS basics
Good to have: Kubernetes, Terraform, Monitoring

📊 **Data Engineer:**
Must: Python, SQL, Spark, ETL pipelines
Good to have: Airflow, dbt, Kafka, Cloud

**How to identify YOUR gap:**
1. Find 5 job descriptions for your target role
2. List all required skills
3. Mark what you know vs don't know
4. That's your learning list"""
  },
]
