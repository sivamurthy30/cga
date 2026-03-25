/**
 * Local AI Assistant - Knowledge-based system for DEVA Career Guidance Platform
 * No external API required - uses pattern matching and knowledge base
 */

// Knowledge base for career guidance
const KNOWLEDGE_BASE = {
  roles: {
    'frontend': {
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'UI/UX', 'Responsive Design', 'Webpack', 'Git'],
      description: 'Frontend developers build user interfaces and create engaging web experiences.',
      salary: '$70k-$130k',
      timeToLearn: '6-12 months',
      difficulty: 'Beginner-friendly',
      tips: [
        'Start with HTML, CSS, and JavaScript fundamentals',
        'Learn React or Vue.js for modern web development',
        'Practice building responsive designs with Flexbox and Grid',
        'Study UI/UX principles for better user experiences',
        'Build a portfolio with 3-5 high-quality projects',
        'Learn browser DevTools for debugging and performance profiling',
        'Master CSS preprocessors like Sass or PostCSS',
        'Understand Semantic HTML and Accessibility (a11y)'
      ],
      projects: [
        'Personal portfolio website with animations',
        'Todo app with complex state management',
        'Weather app using real-time APIs',
        'E-commerce product page with shopping cart',
        'Interactive dashboard with charts and data viz'
      ],
      resources: [
        'FreeCodeCamp Responsive Web Design',
        'React Beta Docs (react.dev)',
        'CSS-Tricks for layout techniques',
        'Frontend Mentor for UI challenges',
        'Frontend Masters for deep dives'
      ]
    },
    'backend': {
      skills: ['Python', 'Node.js', 'SQL', 'REST APIs', 'Docker', 'PostgreSQL', 'MongoDB', 'Authentication', 'Testing'],
      description: 'Backend developers build server-side logic, databases, and APIs.',
      salary: '$75k-$140k',
      timeToLearn: '8-14 months',
      difficulty: 'Intermediate',
      tips: [
        'Master a backend language like Python, Node.js, or Go',
        'Learn database design, normalization, and SQL',
        'Understand REST and GraphQL API principles',
        'Practice with secure authentication (JWT, OAuth2)',
        'Learn about caching (Redis), queues (RabbitMQ), and optimization',
        'Study system design and architecture patterns',
        'Master unit and integration testing',
        'Understand serverless and cloud functions'
      ],
      projects: [
        'Scalable RESTful API for a marketplace',
        'Authentication microservice with MFA',
        'Real-time chat with WebSockets',
        'File storage and management system',
        'Web scraper with data processing pipeline'
      ],
      resources: [
        'FastAPI/Express.js documentation',
        'PostgreSQL Exercises (pgexercises.com)',
        'System Design Primer (GitHub)',
        'Real World Backend (roadmap.sh)',
        'Architecting for Scale (book)'
      ]
    },
    'fullstack': {
      skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Docker', 'Git', 'REST APIs', 'Testing', 'Deployment'],
      description: 'Full stack developers work on both frontend and backend.',
      salary: '$80k-$150k',
      timeToLearn: '12-18 months',
      difficulty: 'Intermediate to Advanced',
      tips: [
        'Learn both frontend and backend technologies',
        'Understand how client and server communicate',
        'Practice building complete applications',
        'Focus on one stack first, then expand',
        'Learn deployment and DevOps basics',
        'Master Git and version control'
      ],
      projects: [
        'Full-stack social media app',
        'E-commerce platform',
        'Project management tool',
        'Real-time collaboration app',
        'SaaS application with subscriptions'
      ],
      resources: [
        'Full Stack Open course',
        'MERN/MEAN stack tutorials',
        'Deployment guides (Vercel, Heroku)',
        'Full-stack project ideas'
      ]
    },
    'data': {
      skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow', 'Scikit-learn', 'Data Visualization'],
      description: 'Data scientists analyze data and build ML models.',
      salary: '$85k-$160k',
      timeToLearn: '10-16 months',
      difficulty: 'Advanced',
      tips: [
        'Master Python and data analysis libraries',
        'Learn statistics and probability',
        'Practice with real datasets from Kaggle',
        'Understand machine learning algorithms',
        'Learn data visualization with Matplotlib/Seaborn',
        'Study feature engineering techniques'
      ],
      projects: [
        'Predictive model for house prices',
        'Customer segmentation analysis',
        'Sentiment analysis on tweets',
        'Image classification with CNN',
        'Time series forecasting'
      ],
      resources: [
        'Kaggle for datasets and competitions',
        'Fast.ai for deep learning',
        'Scikit-learn documentation',
        'StatQuest YouTube channel'
      ]
    },
    'devops': {
      skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Jenkins', 'Monitoring', 'Bash'],
      description: 'DevOps engineers automate deployment and manage infrastructure.',
      salary: '$90k-$160k',
      timeToLearn: '10-15 months',
      difficulty: 'Advanced',
      tips: [
        'Learn Linux command line and scripting',
        'Master containerization with Docker',
        'Understand CI/CD pipelines',
        'Practice with cloud platforms like AWS',
        'Learn infrastructure as code (Terraform)',
        'Study monitoring and logging tools'
      ],
      projects: [
        'CI/CD pipeline for a web app',
        'Kubernetes cluster setup',
        'Infrastructure automation with Terraform',
        'Monitoring dashboard with Prometheus',
        'Auto-scaling web application'
      ],
      resources: [
        'AWS free tier for practice',
        'Docker official documentation',
        'Kubernetes tutorials',
        'DevOps Roadmap on roadmap.sh'
      ]
    },
    'mobile': {
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'JavaScript', 'REST APIs', 'Mobile UI/UX', 'App Store'],
      description: 'Mobile developers build applications for iOS and Android.',
      salary: '$75k-$145k',
      timeToLearn: '8-14 months',
      difficulty: 'Intermediate',
      tips: [
        'Choose React Native or Flutter for cross-platform',
        'Learn native development for better performance',
        'Study mobile UI/UX patterns',
        'Practice with device APIs and sensors',
        'Understand app store submission process',
        'Learn mobile-specific optimization'
      ],
      projects: [
        'Todo app with local storage',
        'Weather app with geolocation',
        'Social media feed clone',
        'E-commerce mobile app',
        'Fitness tracking application'
      ],
      resources: [
        'React Native documentation',
        'Flutter official tutorials',
        'iOS Human Interface Guidelines',
        'Material Design for Android'
      ]
    },
    'security': {
      skills: ['Cybersecurity', 'OWASP', 'Linux', 'Python', 'Network Security', 'Penetration Testing', 'Cryptography'],
      description: 'Security engineers protect systems and find vulnerabilities.',
      salary: '$85k-$155k',
      timeToLearn: '12-18 months',
      difficulty: 'Advanced',
      tips: [
        'Learn networking fundamentals',
        'Study OWASP Top 10 vulnerabilities',
        'Practice with CTF challenges',
        'Understand cryptography basics',
        'Learn penetration testing tools',
        'Get security certifications (CEH, OSCP)'
      ],
      projects: [
        'Vulnerability scanner',
        'Password strength checker',
        'Network traffic analyzer',
        'Web application firewall',
        'Security audit tool'
      ],
      resources: [
        'OWASP documentation',
        'HackTheBox for practice',
        'TryHackMe for beginners',
        'Security certifications'
      ]
    }
  },
  
  topics: {
    'roadmap': {
      keywords: ['roadmap', 'road map', 'path', 'learning path', 'journey', 'plan', 'route', 'guide', 'step by step', 'one by one', 'give me', 'show me', 'tell me'],
      response: `🗺️ Ready to see your roadmap?

Click the "Roadmap" button in the navigation bar at the top of the page to view your personalized learning path!

Your roadmap includes:
• Step-by-step learning nodes
• Topics organized from beginner to advanced
• Progress tracking
• Interactive visualization

💡 Tip: You can mark topics as complete as you learn them!`
    },
    'skills': {
      keywords: ['skill', 'learn', 'practice', 'improve', 'master', 'technology', 'language'],
      response: `Building skills takes time and practice!

📚 Learning Strategy:
• Start with fundamentals - don't skip basics
• Build small projects to practice
• Learn by doing, not just reading
• Get feedback from others
• Join coding communities

⏱️ Time Management:
• Set aside dedicated learning time daily (1-2 hours)
• Focus on one skill at a time
• Take breaks to avoid burnout
• Track your progress weekly

🎯 Skill Levels:
• Beginner: 0-3 months of practice
• Intermediate: 3-12 months
• Advanced: 1-3 years
• Expert: 3+ years with real projects`
    },
    'assessment': {
      keywords: ['quiz', 'test', 'assessment', 'evaluate', 'score', 'exam'],
      response: `Assessments help identify your strengths and gaps!

✅ How to approach:
• Answer honestly - it's for your benefit
• Don't worry about perfect scores
• Use results to guide your learning
• Retake periodically to track improvement

📊 Understanding Results:
• 80-100%: Strong foundation, ready for advanced topics
• 60-79%: Good understanding, practice more
• 40-59%: Basic knowledge, need more study
• Below 40%: Start with fundamentals

💡 After Assessment:
• Focus on weak areas first
• Review incorrect answers
• Practice with similar questions
• Build projects using those skills`
    },
    'career': {
      keywords: ['career', 'job', 'work', 'profession', 'role', 'position', 'employment'],
      response: `Choosing the right career path is important!

� Consider:
• What interests you most?
• What are your strengths?
• What's the job market like?
• What lifestyle do you want?
• What's the salary range?

💼 Career Paths:
• Frontend: Visual, creative, user-focused ($70k-$130k)
• Backend: Logic, data, system design ($75k-$140k)
• Full Stack: Versatile, end-to-end ($80k-$150k)
• Data Science: Analysis, ML, insights ($85k-$160k)
• DevOps: Automation, infrastructure ($90k-$160k)
• Mobile: iOS/Android apps ($75k-$145k)
• Security: Protect systems, find vulnerabilities ($85k-$155k)

📈 Career Growth:
• Junior: 0-2 years experience
• Mid-level: 2-5 years
• Senior: 5-10 years
• Lead/Architect: 10+ years`
    },
    'stuck': {
      keywords: ['stuck', 'confused', 'confuesd', 'help', 'don\'t understand', 'difficult', 'hard', 'problem', 'lost', 'where', 'what to do'],
      response: `No worries, I'm here to help! 🤝

If you're looking for something:
• Say "roadmap" to see your learning path
• Say "dashboard" to go to your main page
• Say "advanced" for tutorials

If you're stuck on learning:
• Break problems into smaller parts
• Review the basics again
• Take a break and come back fresh
• Try a different learning resource
• Build small projects to practice

💪 Remember: Everyone struggles sometimes - that's how we learn!

What specifically can I help you with?`
    },
    'projects': {
      keywords: ['project', 'build', 'create', 'practice', 'portfolio', 'app', 'website'],
      response: `Building projects is the best way to learn!

🛠️ Project Ideas by Level:
Beginner:
• Personal portfolio website
• Todo list app
• Calculator
• Weather app

Intermediate:
• Blog with CMS
• E-commerce site
• Chat application
• Task management tool

Advanced:
• Social media platform
• Video streaming service
• Real-time collaboration tool
• SaaS application

📁 Portfolio Tips:
• Quality over quantity (3-5 best projects)
• Include live demos and GitHub links
• Write clear README files
• Show your problem-solving process
• Add screenshots and descriptions
• Deploy projects online (Vercel, Netlify)

💡 Project Best Practices:
• Start small, add features gradually
• Use Git for version control
• Write clean, commented code
• Test your application
• Make it responsive
• Add error handling`
    },
    'interview': {
      keywords: ['interview', 'job interview', 'technical interview', 'coding interview', 'prepare'],
      response: `Preparing for interviews is crucial!

📝 Interview Types:
• Technical screening (1 hour)
• Coding challenges (2-3 hours)
• System design (1-2 hours)
• Behavioral questions (30-60 min)

💻 Technical Prep:
• Practice on LeetCode/HackerRank
• Study data structures & algorithms
• Review your projects thoroughly
• Practice explaining your code
• Mock interviews with friends

🎯 Common Questions:
• "Tell me about yourself"
• "Walk me through your project"
• "What's your biggest weakness?"
• "Why do you want this role?"
• "Where do you see yourself in 5 years?"

✅ Interview Tips:
• Research the company beforehand
• Prepare questions to ask them
• Think out loud during coding
• Ask clarifying questions
• Be honest about what you don't know
• Follow up with a thank you email`
    },
    'resume': {
      keywords: ['resume', 'cv', 'portfolio', 'linkedin', 'profile'],
      response: `A strong resume opens doors!

📄 Resume Structure:
• Contact info & links (GitHub, LinkedIn)
• Professional summary (2-3 sentences)
• Technical skills (organized by category)
• Work experience (most recent first)
• Projects (3-5 best ones)
• Education

💡 Resume Tips:
• Keep it to 1-2 pages
• Use action verbs (Built, Developed, Implemented)
• Quantify achievements (Improved performance by 40%)
• Tailor it to each job
• No typos or grammar errors
• Use a clean, professional format

🎯 What to Include:
• Programming languages you know
• Frameworks and tools
• Project descriptions with tech stack
• Impact of your work
• Relevant certifications

❌ What to Avoid:
• Irrelevant work experience
• Generic descriptions
• Lies or exaggerations
• Poor formatting
• Personal photos (unless required)`
    },
    'salary': {
      keywords: ['salary', 'pay', 'compensation', 'money', 'income', 'wage'],
      response: `Understanding salary ranges helps set expectations!

💰 Average Salaries (US, 2024):
• Frontend Developer: $70k-$130k
• Backend Developer: $75k-$140k
• Full Stack Developer: $80k-$150k
• Data Scientist: $85k-$160k
• DevOps Engineer: $90k-$160k
• Mobile Developer: $75k-$145k
• Security Engineer: $85k-$155k

📊 Factors Affecting Salary:
• Experience level (Junior vs Senior)
• Location (SF/NY vs smaller cities)
• Company size (Startup vs Big Tech)
• Industry (Finance vs Non-profit)
• Skills and specializations

📈 Salary Growth:
• Junior (0-2 years): Entry level
• Mid (2-5 years): +30-50%
• Senior (5-10 years): +50-100%
• Lead/Principal (10+ years): +100-200%

💡 Negotiation Tips:
• Research market rates
• Know your worth
• Consider total compensation (benefits, equity)
• Be prepared to justify your ask
• Don't accept the first offer immediately`
    },
    'time': {
      keywords: ['how long', 'time', 'duration', 'months', 'years', 'when'],
      response: `Learning timelines vary by path and dedication!

⏱️ Typical Learning Times:
• Frontend: 6-12 months
• Backend: 8-14 months
• Full Stack: 12-18 months
• Data Science: 10-16 months
• DevOps: 10-15 months
• Mobile: 8-14 months

📅 Study Schedule Examples:
Full-time (40 hrs/week):
• 3-6 months to job-ready

Part-time (15-20 hrs/week):
• 6-12 months to job-ready

Casual (5-10 hrs/week):
• 12-24 months to job-ready

🎯 Milestones:
• Month 1-2: Basics and fundamentals
• Month 3-4: First projects
• Month 5-6: Intermediate concepts
• Month 7-9: Advanced topics
• Month 10-12: Portfolio and job prep

💡 Remember:
• Quality over speed
• Consistency is key
• Everyone learns at their own pace
• Real projects accelerate learning`
    },
    'resources': {
      keywords: ['resource', 'course', 'tutorial', 'book', 'website', 'learn from'],
      response: `Great resources accelerate your learning!

🆓 Free Resources:
• FreeCodeCamp - Full curriculum
• The Odin Project - Full stack web dev
• CS50 - Computer science foundations
• YouTube - Traversy Media, Fireship, Web Dev Simplified
• MDN Web Docs - Technical reference
• W3Schools - Beginners reference

💻 Practice Platforms:
• LeetCode - Algorithmic challenges
• HackerRank - Interview preparation
• Codewars - Skill leveling
• Frontend Mentor - Real-world UI designs
• Kaggle - Data science and ML datasets

📚 Paid Resources (Worth it):
• Udemy courses (Wait for sales!)
• Pluralsight - Deep technical paths
• Coursera - Specializations from universities
• Boot.dev - Backend-focused gamified learning

🎓 Certifications:
• AWS Certified Cloud Practitioner
• Google Cloud Digital Leader
• CompTIA Security+ or Network+
• Meta Front-End/Back-End Certificates`
    },
    'soft_skills': {
      keywords: ['soft skill', 'communication', 'teamwork', 'leadership', 'presentation', 'collaboration'],
      response: `Technical skills get you the interview, soft skills get you the job!

🤝 Key Soft Skills:
• Communication: Explain complex ideas simply
• Problem Solving: Approach challenges logically
• Teamwork: Be someone others want to work with
• Adaptability: Learn new things quickly
• Empathy: Understand user and teammate needs

📈 How to improve:
• Practice public speaking (even just to a mirror)
• Write documentation for your projects
• Contribute to Open Source projects
• Participate in hackathons
• Ask for and give constructive feedback`
    },
    'mentorship': {
      keywords: ['mentor', 'guidance', 'advisor', 'coach', 'help from experts'],
      response: `Mentorship can 10x your growth speed!

🔍 Where to find mentors:
• ADPList: Free mentorship from experts
• LinkedIn: Network with people in your target role
• Tech Communities: Discord servers, Slack channels
• Local Meetups: Use Meetup.com to find local groups
• Company programs: Many firms have internal programs

💡 Tips for mentees:
• Have specific questions ready
• Be respectful of their time
• Implement their advice and report back
• Don't just ask for a job—ask for knowledge`
    }
  },
  
  general: {
    greetings: ['hi', 'hello', 'hey', 'greetings'],
    thanks: ['thank', 'thanks', 'appreciate'],
    motivation: ['motivate', 'inspire', 'encourage', 'give up']
  }
};

/**
 * Extract page context for AI understanding
 */
export const getPageContext = () => {
  const title = document.title || 'DEVA - Career Development Platform';
  
  // Try to get main content from various selectors
  const contentSelectors = ['article', 'main', '[role="main"]', '.content', '.main-content', '.dashboard'];
  let content = '';
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.innerText;
      break;
    }
  }
  
  // Fallback to all paragraphs if no main content found
  if (!content) {
    const paragraphs = Array.from(document.querySelectorAll('p, h1, h2, h3'));
    content = paragraphs.map(p => p.innerText).join(' ');
  }
  
  // Limit content to ~2000 characters
  content = content.slice(0, 2000);
  
  return { title, content };
};

/**
 * Check if question is within scope (career/learning related)
 */
const isWithinScope = (question) => {
  const q = question.toLowerCase();
  
  // Off-topic keywords that indicate out-of-scope questions
  const offTopicKeywords = [
    // Politics & Religion
    'politics', 'political', 'election', 'vote', 'president', 'government', 'congress',
    'religion', 'religious', 'god', 'church', 'mosque', 'temple', 'prayer',
    
    // Entertainment (unless related to learning)
    'movie', 'film', 'actor', 'actress', 'celebrity', 'music', 'song', 'album', 'concert',
    'game', 'gaming', 'sport', 'football', 'basketball', 'cricket', 'soccer',
    
    // Personal advice (non-career)
    'relationship', 'dating', 'marriage', 'divorce', 'boyfriend', 'girlfriend', 'love',
    'health', 'medical', 'doctor', 'medicine', 'disease', 'symptom', 'therapy',
    
    // Finance (unless career salary)
    'stock', 'crypto', 'bitcoin', 'investment', 'trading', 'forex', 'nft',
    
    // Other random topics
    'weather', 'recipe', 'cooking', 'food', 'restaurant', 'menu',
    'travel', 'vacation', 'hotel', 'flight', 'tourism',
    'shopping', 'fashion', 'clothes', 'shoes'
  ];
  
  const matchesKeyword = (text, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'i');
    return regex.test(text);
  };
  
  // Career/learning keywords that indicate in-scope questions
  const inScopeKeywords = [
    // Learning & Education
    'learn', 'skill', 'study', 'education', 'training', 'course', 'tutorial',
    'practice', 'exercise', 'homework', 'assignment', 'certification', 'bootcamp',
    
    // Career & Jobs
    'career', 'job', 'work', 'profession', 'employment', 'hire', 'interview',
    'resume', 'cv', 'portfolio', 'salary', 'compensation', 'promotion',
    
    // Tech Roles
    'developer', 'engineer', 'programmer', 'coder', 'architect', 'analyst',
    'designer', 'tester', 'devops', 'frontend', 'backend', 'fullstack', 'full stack',
    
    // Programming & Tech
    'programming', 'code', 'coding', 'software', 'web', 'app', 'application',
    'website', 'development', 'tech', 'technology', 'computer', 'digital',
    
    // Specific Technologies
    'html', 'css', 'javascript', 'python', 'java', 'react', 'node', 'sql',
    'typescript', 'angular', 'vue', 'django', 'flask', 'express', 'mongodb',
    'postgresql', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'github',
    
    // Concepts
    'algorithm', 'data structure', 'database', 'api', 'rest', 'graphql',
    'framework', 'library', 'tool', 'testing', 'debugging', 'deployment',
    'security', 'authentication', 'authorization', 'encryption',
    
    // Learning Process
    'roadmap', 'path', 'guide', 'tutorial', 'documentation', 'resource',
    'project', 'build', 'create', 'implement', 'design', 'architecture'
  ];
  
  // Check if question contains off-topic keywords
  const hasOffTopicKeyword = offTopicKeywords.some(keyword => matchesKeyword(q, keyword));
  
  // Check if question contains in-scope keywords
  const hasInScopeKeyword = inScopeKeywords.some(keyword => matchesKeyword(q, keyword));
  
  // If it has off-topic keywords and no in-scope keywords, it's out of scope
  if (hasOffTopicKeyword && !hasInScopeKeyword) {
    return false;
  }
  
  // If question is very short (< 3 words) and has no in-scope keywords, might be off-topic
  const wordCount = q.trim().split(/\s+/).length;
  if (wordCount < 3 && !hasInScopeKeyword && !KNOWLEDGE_BASE.general.greetings.some(g => matchesKeyword(q, g))) {
    // Allow short greetings, but be cautious with other short questions
    return hasInScopeKeyword;
  }
  
  return true;
};

/**
 * Detect user intent from question
 */
const detectIntent = (question) => {
  const q = question.toLowerCase();
  
  const matchesKeyword = (text, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'i');
    return regex.test(text);
  };

  // First check if question is within scope
  if (!isWithinScope(question)) {
    return 'out_of_scope';
  }
  
  // Check for greetings
  if (KNOWLEDGE_BASE.general.greetings.some(g => matchesKeyword(q, g))) {
    return 'greeting';
  }
  
  // Check for thanks
  if (KNOWLEDGE_BASE.general.thanks.some(t => matchesKeyword(q, t))) {
    return 'thanks';
  }
  
  // Check for motivation
  if (KNOWLEDGE_BASE.general.motivation.some(m => matchesKeyword(q, m))) {
    return 'motivation';
  }
  
  // Check topics
  for (const [topic, data] of Object.entries(KNOWLEDGE_BASE.topics)) {
    if (data.keywords.some(keyword => matchesKeyword(q, keyword))) {
      return topic;
    }
  }
  
  // Check roles
  for (const role of Object.keys(KNOWLEDGE_BASE.roles)) {
    if (matchesKeyword(q, role)) {
      return `role_${role}`;
    }
  }
  
  return 'general';
};

/**
 * Generate response based on intent
 */
const generateResponse = (intent, question, context) => {
  // Handle out-of-scope questions
  if (intent === 'out_of_scope') {
    return `I appreciate your question, but I'm specifically designed to help with career development and learning on the DEVA platform. 🎯

I can only assist with topics like:
• Career paths (Frontend, Backend, Full Stack, Data Science, DevOps)
• Learning roadmaps and skill development
• Programming languages and technologies
• Job preparation and interviews
• Study strategies and motivation

Please ask me something related to your learning journey or career goals!`;
  }
  
  // Handle greetings
  if (intent === 'greeting') {
    return `Hey there! 👋 I'm your AI learning assistant.

Quick navigation:
• Say "show me roadmap" to view your learning path
• Say "dashboard" to go to your main page
• Say "advanced" for in-depth tutorials

I can also help with:
• Career guidance and learning tips
• Understanding skills and technologies
• Staying motivated

What would you like to do?`;
  }
  
  // Handle thanks
  if (intent === 'thanks') {
    return `You're welcome! 😊 I'm here to help anytime.

Feel free to ask more questions as you continue your learning journey!`;
  }
  
  // Handle motivation
  if (intent === 'motivation') {
    return `Don't give up! 💪 Every expert was once a beginner.

🌟 Remember:
• Learning takes time - be patient with yourself
• Small progress is still progress
• Mistakes are part of the learning process
• You're capable of more than you think

Keep going! You've got this! 🚀`;
  }
  
  // Handle topic-specific questions
  if (KNOWLEDGE_BASE.topics[intent]) {
    return KNOWLEDGE_BASE.topics[intent].response;
  }
  
  // Handle role-specific questions
  if (intent.startsWith('role_')) {
    const role = intent.replace('role_', '');
    const roleData = KNOWLEDGE_BASE.roles[role];
    
    if (roleData) {
      return `${roleData.description}

💰 Salary Range: ${roleData.salary}
⏱️ Time to Learn: ${roleData.timeToLearn}
📊 Difficulty: ${roleData.difficulty}

🎯 Key Skills:
${roleData.skills.map(s => `• ${s}`).join('\n')}

💡 Learning Tips:
${roleData.tips.map(t => `• ${t}`).join('\n')}

🛠️ Project Ideas:
${roleData.projects.slice(0, 3).map(p => `• ${p}`).join('\n')}

📚 Recommended Resources:
${roleData.resources.map(r => `• ${r}`).join('\n')}

Want to know more about any specific skill or topic?`;
    }
  }
  
  // General response based on context
  const pageTitle = context.title;
  const q = question.toLowerCase();
  
  // Check if user is asking for navigation
  if (q.includes('roadmap') || q.includes('road map') || q.includes('path')) {
    return `🗺️ To view your roadmap, click the "Roadmap" button in the navigation bar at the top!

Your roadmap shows:
• All topics you need to learn
• Your current progress
• What to focus on next
• Interactive learning path

Click "Roadmap" in the top navigation to get started!`;
  }
  
  if (q.includes('dashboard') || q.includes('home') || q.includes('main')) {
    return `📊 To go to your dashboard, click the "Dashboard" button in the navigation bar at the top!

Your dashboard shows:
• Learning progress overview
• Skill assessment results
• Recommended next steps
• Quick access to all features

Click "Dashboard" in the top navigation!`;
  }
  
  if (q.includes('advanced') || q.includes('concepts') || q.includes('learn more')) {
    return `🎓 To explore advanced concepts, click the "Advanced" button in the navigation bar at the top!

Advanced section includes:
• In-depth tutorials
• Real-world examples
• Best practices
• Expert-level content

Click "Advanced" in the top navigation to explore!`;
  }
  
  if (pageTitle.includes('Dashboard')) {
    return `You're on your dashboard! 📊

Quick actions:
• Click "Roadmap" in the top navigation to see your learning path
• Click "Advanced" to explore in-depth concepts
• Check your progress charts below
• Review your skill assessment results

What would you like to do next?`;
  }
  
  if (pageTitle.includes('Roadmap')) {
    return `You're viewing your learning roadmap! 🗺️

How to use it:
• Each node represents a topic to learn
• Click nodes to see details and resources
• Mark topics complete as you progress
• Follow the path from basics to advanced

💡 Tip: Focus on one topic at a time and build projects to practice!

Need help with a specific topic?`;
  }
  
  if (pageTitle.includes('Advanced')) {
    return `You're in the Advanced Concepts section! 🎓

Here you'll find:
• In-depth tutorials and guides
• Real-world examples
• Best practices and patterns
• Expert-level content

💡 Tip: Take your time with advanced topics and practice with real projects!

What topic interests you?`;
  }
  
  // Default helpful response
  return `I'm here to help with your learning journey! 🚀

Quick navigation:
• Click "Dashboard" at the top to see your progress
• Click "Roadmap" to view your learning path
• Click "Advanced" for in-depth concepts

🎯 I can also help with:
• Career path guidance
• Learning strategies
• Skill development tips
• Staying motivated

What would you like to know?`;
};

/**
 * Get AI response with context (main function)
 */
export const getAIResponse = async ({ context, question }) => {
  // Simulate thinking time for better UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const intent = detectIntent(question);
    const response = generateResponse(intent, question, context);
    return response;
  } catch (error) {
    console.error('AI response error:', error);
    return `I'm having a moment! 😅 Let me try to help anyway.

Based on your question about "${question}", here are some general tips:

• Break down complex topics into smaller parts
• Practice regularly with hands-on projects
• Don't hesitate to review fundamentals
• Use multiple learning resources

What specific aspect would you like to explore?`;
  }
};

/**
 * Generate welcome message based on page context
 */
export const getWelcomeMessage = (context) => {
  const pageTitle = context.title;
  
  if (pageTitle.includes('Dashboard')) {
    return `Hey 👋 Welcome to your dashboard!

Quick navigation:
• Click "Roadmap" at the top to see your learning path
• Click "Advanced" for in-depth tutorials
• Scroll down to see your progress and stats

I can help you navigate or answer questions about your learning journey!`;
  }
  
  if (pageTitle.includes('Roadmap')) {
    return `Hey 👋 You're viewing your roadmap!

💡 Tips:
• Click on nodes to see topic details
• Mark topics complete as you learn
• Follow the path from basics to advanced

Need help understanding any topic? Just ask!`;
  }
  
  if (pageTitle.includes('Advanced')) {
    return `Hey 👋 Welcome to Advanced Concepts!

Here you'll find:
• In-depth tutorials
• Real-world examples
• Best practices

What topic would you like to explore?`;
  }
  
  return `Hey 👋 I'm your AI learning assistant!

I can help you:
• Navigate to different sections (just ask!)
• Understand your learning path
• Answer questions about skills and careers
• Keep you motivated

Try asking: "Show me my roadmap" or "How do I navigate?"`;
};
