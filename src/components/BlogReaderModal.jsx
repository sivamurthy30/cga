import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BlogReaderModal = ({ resource, onClose, onComplete }) => {
  const [mode, setMode] = useState(resource.type === 'video-quiz' ? 'quiz' : 'reading'); // 'reading' | 'quiz' | 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  if (!resource) return null;

  // Mock content generation based on resource name and type
  const getMockContent = () => {
    return `
      # The Ultimate Guide to ${resource.name}
      
      Welcome to this comprehensive, deep-dive reading material on **${resource.name}**.
      
      This premium content is curated directly by DEV<sup>A</sup> to ensure you get the absolute highest quality learning experience without having to leave the platform. Our goal is to take you from a basic understanding to an advanced, battle-tested perspective that you can immediately apply in production.
      
      ## 1. Introduction & Core Philosophy
      Before we dive into the advanced concepts, let's establish a foundational understanding. When working with modern technology stacks, it's crucial to understand the underlying principles rather than just memorizing syntax. Industry leaders emphasize that the best engineers focus on the "Why" and "How", mapping new tools to timeless engineering patterns.
      
      ## 2. The Golden Triangle of Architecture
      When mastering this concept, always evaluate it through three primary lenses:
      - **Scalability**: How does this approach handle 10x or 100x traffic? Architect your solution expecting immense growth.
      - **Maintainability**: Can a junior developer join your team and understand your code without a 4-hour onboarding? Readability is a feature.
      - **Performance**: Optimizations you can implement immediately to cut down response times and memory footprints. Micro-optimizations matter at scale.
      
      ## 3. Advanced Implementation Strategies
      Transitioning from simple tutorials to enterprise applications requires shifting how you manage state, handle errors, and structure your code securely. Consider the difference between tightly-coupled procedural coding and decoupled, modular architecture.
      
      ## 4. Practical Real-World Example
      Here is how you might apply this in a highly optimized scenario. Notice how we prioritize defensive programming:
      
      \`\`\`javascript
      // Advanced enterprise-grade implementation pattern
      async function optimizedDataProcessing(payload, contextConfig) {
        try {
          // 1. Validate payload early to fail fast
          if (!payload || !payload.items?.length) {
            console.warn("Empty payload received, aborting process.", { contextConfig });
            return { status: 'idle', count: 0, results: [] };
          }
          
          // 2. Map data efficiently utilizing functional methodologies
          const processedResults = payload.items.map(item => {
            const normalizedValue = Math.max(0, Number(item.value) || 0);
            return {
              id: item.id || crypto.randomUUID(),
              computedScore: normalizedValue * contextConfig.multiplier,
              timestamp: Date.now()
            };
          });

          // 3. Return a consistent, predictable data structure
          return {
            status: 'success',
            count: processedResults.length,
            results: processedResults
          };
        } catch (error) {
          errorTracker.capture(error, { component: '${resource.name}' });
          throw new ProcessingError("Failed to process batch", { cause: error });
        }
      }
      \`\`\`
      
      ## 5. Security Implications
      When utilizing these concepts in a production environment, you must adhere to strict security protocols. 
      - **Sanitization**: Never trust incoming data. Cleanse your inputs immediately.
      - **Rate-Limiting**: Protect critical functions from overwhelming brute-force requests.
      - **Secrets Management**: Hardcoding configuration passwords is a major vulnerability.
      
      ## 6. Next Steps & Career Roadmap
      Now that you've completed this extensive deep-dive, the next logical step is building a real-world Micro-Project incorporating these ideas. Connect it with the other overarching skills on your roadmap to solidify your understanding. Reading creates the foundation, but building secures the knowledge.
      
      *Keep pushing forward, your senior engineering goals are well within reach!*
    `;
  };

  // Get senior developer insights and real-world experiences
  const getSeniorDeveloperInsights = () => {
    const topicName = resource.name.toLowerCase();
    
    const insightsMap = {
      // Frontend Development
      'react': {
        insights: [
          "Focus on understanding React's reconciliation algorithm and virtual DOM - it's the foundation of performance optimization.",
          "Master hooks thoroughly before jumping to advanced patterns. useState and useEffect are 80% of what you'll use daily.",
          "Component composition is more important than memorizing every library. Learn to break down complex UIs into reusable pieces.",
          "Don't over-optimize early. Profile first, then optimize. Premature optimization wastes more time than it saves."
        ],
        mistakes: [
          "Using too many useEffect hooks - often a sign of poor component design",
          "Not understanding when React re-renders - leads to performance issues",
          "Prop drilling instead of using Context or state management properly",
          "Ignoring accessibility - it's not optional in professional development"
        ],
        careerAdvice: "Build a strong portfolio with 3-5 production-quality projects. Contribute to open source React libraries. The React ecosystem values practical experience over certifications."
      },
      'javascript': {
        insights: [
          "Master closures, promises, and async/await - they're fundamental to modern JavaScript.",
          "Understand the event loop deeply. It's the key to debugging async issues.",
          "Learn functional programming concepts - map, filter, reduce are your daily tools.",
          "ES6+ features aren't just syntax sugar - they solve real problems. Learn why they exist."
        ],
        mistakes: [
          "Not understanding 'this' keyword context - causes 90% of beginner bugs",
          "Callback hell - learn promises and async/await early",
          "Mutating objects directly instead of using immutable patterns",
          "Ignoring error handling - always handle promise rejections"
        ],
        careerAdvice: "JavaScript is everywhere. Specialize in one area (frontend, backend, mobile) but understand the full stack. The best JS developers know when NOT to use JavaScript."
      },
      'typescript': {
        insights: [
          "TypeScript is about catching bugs at compile time, not just adding types everywhere.",
          "Start with strict mode from day one. Loose typing defeats the purpose.",
          "Generic types are powerful but don't over-engineer. Keep it simple and readable.",
          "Type inference is your friend - let TypeScript do the work when it can."
        ],
        mistakes: [
          "Using 'any' type too liberally - defeats the purpose of TypeScript",
          "Over-complicating types - simpler is often better",
          "Not configuring tsconfig.json properly from the start",
          "Fighting the type system instead of learning to work with it"
        ],
        careerAdvice: "TypeScript is becoming the standard for large-scale applications. Companies hiring for senior roles expect TypeScript proficiency. It's a career multiplier."
      },
      
      // Backend Development
      'python': {
        insights: [
          "Python's simplicity is deceptive - master list comprehensions, generators, and decorators for professional code.",
          "Virtual environments aren't optional - they're essential for any serious project.",
          "Learn to write Pythonic code - it's not just about syntax, it's about idioms and patterns.",
          "Async Python (asyncio) is crucial for modern web applications and APIs."
        ],
        mistakes: [
          "Not using virtual environments - leads to dependency hell",
          "Ignoring PEP 8 style guide - makes code hard to maintain",
          "Using mutable default arguments - classic Python gotcha",
          "Not understanding the GIL for multi-threading scenarios"
        ],
        careerAdvice: "Python dominates in data science, ML, and backend development. Specialize in one area but understand the ecosystem. Django and FastAPI are hot skills right now."
      },
      'node': {
        insights: [
          "Node.js is single-threaded - design your applications around this fact.",
          "Event-driven architecture is Node's strength - embrace it, don't fight it.",
          "Error handling in async code is critical - unhandled rejections crash your app.",
          "Streams are powerful for handling large data - learn them for production apps."
        ],
        mistakes: [
          "Blocking the event loop with CPU-intensive tasks",
          "Not handling promise rejections properly",
          "Callback hell - use async/await or promises",
          "Ignoring memory leaks - they're common in long-running Node apps"
        ],
        careerAdvice: "Node.js developers are in high demand for real-time applications and microservices. Learn Docker and Kubernetes alongside Node for DevOps-friendly development."
      },
      
      // DevOps & Cloud
      'docker': {
        insights: [
          "Docker isn't just about containers - it's about reproducible environments and consistency.",
          "Multi-stage builds are essential for production - keep images small and secure.",
          "Don't run containers as root - security should be built in from the start.",
          "Docker Compose is great for development, but learn Kubernetes for production."
        ],
        mistakes: [
          "Creating huge images - optimize layers and use .dockerignore",
          "Storing secrets in images - use environment variables or secret management",
          "Not understanding networking between containers",
          "Running everything in one container - defeats the purpose"
        ],
        careerAdvice: "Docker is a fundamental skill for modern development. Combined with Kubernetes, it opens doors to DevOps and cloud engineering roles. Certifications help but hands-on experience matters more."
      },
      'kubernetes': {
        insights: [
          "Start with understanding pods, services, and deployments - they're the foundation.",
          "Kubernetes is complex - don't try to learn everything at once. Focus on core concepts first.",
          "YAML configuration is tedious but critical - learn to write clean, maintainable manifests.",
          "Monitoring and logging are not optional - set them up from day one."
        ],
        mistakes: [
          "Not setting resource limits - leads to cluster instability",
          "Ignoring health checks and readiness probes",
          "Over-complicating deployments - start simple, add complexity as needed",
          "Not understanding networking and service discovery"
        ],
        careerAdvice: "Kubernetes skills command premium salaries. Get CKA or CKAD certified. Real-world experience managing production clusters is invaluable - contribute to open source or run personal projects."
      },
      
      // Data Science & ML
      'machine learning': {
        insights: [
          "80% of ML work is data cleaning and preparation - master pandas and data wrangling.",
          "Start with classical ML before deep learning - understand the fundamentals first.",
          "Feature engineering often matters more than model selection.",
          "Production ML is different from notebook ML - learn MLOps early."
        ],
        mistakes: [
          "Jumping to deep learning without understanding basics",
          "Not validating models properly - leads to overfitting",
          "Ignoring data quality - garbage in, garbage out",
          "Not considering model deployment and maintenance"
        ],
        careerAdvice: "ML roles require strong math and programming skills. Build a portfolio with end-to-end projects, not just Kaggle notebooks. Understanding business problems is as important as technical skills."
      },
      'tensorflow': {
        insights: [
          "TensorFlow 2.x with Keras is much easier than TensorFlow 1.x - start with the modern API.",
          "Understand computational graphs and eager execution - it helps with debugging.",
          "GPU utilization is critical for training - learn to optimize for hardware.",
          "Model serving and deployment are separate skills - learn TensorFlow Serving or TFLite."
        ],
        mistakes: [
          "Not using GPU acceleration properly - wastes training time",
          "Creating overly complex models when simple ones work better",
          "Ignoring model versioning and experiment tracking",
          "Not optimizing models for production deployment"
        ],
        careerAdvice: "TensorFlow is industry standard for production ML. Combine it with cloud platforms (GCP, AWS) for maximum career impact. Certifications from Google are valuable."
      },
      
      // Mobile Development
      'react native': {
        insights: [
          "React Native isn't just React for mobile - understand native modules and platform differences.",
          "Performance optimization is crucial - mobile devices have limited resources.",
          "Learn native development basics (iOS/Android) - you'll need to bridge to native code.",
          "Testing on real devices is essential - simulators don't catch everything."
        ],
        mistakes: [
          "Not optimizing for mobile performance - leads to janky UIs",
          "Ignoring platform-specific design guidelines",
          "Over-relying on third-party libraries - increases app size",
          "Not handling offline scenarios and poor connectivity"
        ],
        careerAdvice: "React Native developers are in demand for cross-platform development. Build and publish apps to app stores. Understanding both iOS and Android ecosystems is a huge advantage."
      },
      
      // Security
      'cybersecurity': {
        insights: [
          "Security is a mindset, not a checklist - think like an attacker to defend better.",
          "Stay updated constantly - new vulnerabilities emerge daily.",
          "Hands-on practice is essential - use platforms like HackTheBox and TryHackMe.",
          "Understanding networking deeply is fundamental to security work."
        ],
        mistakes: [
          "Focusing only on tools without understanding fundamentals",
          "Not keeping up with latest vulnerabilities and exploits",
          "Ignoring the human element - social engineering is powerful",
          "Not documenting findings properly - communication is key"
        ],
        careerAdvice: "Security roles are high-paying and in demand. Get certified (CEH, OSCP, CISSP). Build a home lab. Participate in bug bounty programs. Ethical hacking skills are valuable across all industries."
      }
    };

    // Find matching insights
    for (const [key, data] of Object.entries(insightsMap)) {
      if (topicName.includes(key)) {
        return data;
      }
    }

    // Default insights for unmapped topics
    return {
      insights: [
        "Focus on fundamentals before diving into frameworks and tools.",
        "Build real projects - theory alone won't land you a job.",
        "Join communities and learn from others' experiences.",
        "Stay curious and keep learning - technology evolves rapidly."
      ],
      mistakes: [
        "Tutorial hell - watching tutorials without building projects",
        "Not asking for help when stuck - community is there to help",
        "Ignoring best practices and code quality early on",
        "Not building a portfolio to showcase your skills"
      ],
      careerAdvice: "Build a strong foundation, create a portfolio, network with professionals, and never stop learning. The tech industry rewards continuous growth."
    };
  };

  // Get external learning resources based on the topic
  const getExternalResources = () => {
    const topicName = resource.name.toLowerCase();
    
    // Comprehensive map of topics to high-quality external resources
    const resourceMap = {
      // Frontend Development
      'html': [
        { title: 'MDN HTML Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'Documentation' },
        { title: 'HTML Tutorial (W3Schools)', url: 'https://www.w3schools.com/html/', type: 'Tutorial' },
        { title: 'Learn HTML (Codecademy)', url: 'https://www.codecademy.com/learn/learn-html', type: 'Course' }
      ],
      'css': [
        { title: 'MDN CSS Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', type: 'Documentation' },
        { title: 'CSS-Tricks', url: 'https://css-tricks.com/', type: 'Tutorial' },
        { title: 'Flexbox Froggy (Game)', url: 'https://flexboxfroggy.com/', type: 'Interactive' }
      ],
      'javascript': [
        { title: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'Documentation' },
        { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'Tutorial' },
        { title: 'Eloquent JavaScript (Free Book)', url: 'https://eloquentjavascript.net/', type: 'Book' }
      ],
      'typescript': [
        { title: 'TypeScript Official Docs', url: 'https://www.typescriptlang.org/docs/', type: 'Documentation' },
        { title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript/', type: 'Book' },
        { title: 'TypeScript Exercises', url: 'https://typescript-exercises.github.io/', type: 'Interactive' }
      ],
      'react': [
        { title: 'React Official Documentation', url: 'https://react.dev/', type: 'Documentation' },
        { title: 'React Tutorial for Beginners', url: 'https://react.dev/learn', type: 'Tutorial' },
        { title: 'Full Stack Open - React', url: 'https://fullstackopen.com/en/', type: 'Course' }
      ],
      'vue': [
        { title: 'Vue.js Official Guide', url: 'https://vuejs.org/guide/', type: 'Documentation' },
        { title: 'Vue Mastery', url: 'https://www.vuemastery.com/', type: 'Course' },
        { title: 'Vue School', url: 'https://vueschool.io/', type: 'Platform' }
      ],
      'angular': [
        { title: 'Angular Official Docs', url: 'https://angular.io/docs', type: 'Documentation' },
        { title: 'Angular Tutorial', url: 'https://angular.io/tutorial', type: 'Tutorial' },
        { title: 'Angular University', url: 'https://angular-university.io/', type: 'Course' }
      ],
      
      // Backend Development
      'python': [
        { title: 'Python Official Documentation', url: 'https://docs.python.org/3/', type: 'Documentation' },
        { title: 'Real Python Tutorials', url: 'https://realpython.com/', type: 'Tutorial' },
        { title: 'Python for Everybody (Coursera)', url: 'https://www.coursera.org/specializations/python', type: 'Course' }
      ],
      'node': [
        { title: 'Node.js Official Docs', url: 'https://nodejs.org/docs/latest/api/', type: 'Documentation' },
        { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', type: 'Guide' },
        { title: 'Learn Node.js', url: 'https://nodejs.dev/learn', type: 'Tutorial' }
      ],
      'express': [
        { title: 'Express.js Documentation', url: 'https://expressjs.com/', type: 'Documentation' },
        { title: 'Express.js Tutorial', url: 'https://expressjs.com/en/starter/installing.html', type: 'Tutorial' },
        { title: 'REST API with Express', url: 'https://www.robinwieruch.de/node-express-server-rest-api/', type: 'Guide' }
      ],
      'django': [
        { title: 'Django Official Documentation', url: 'https://docs.djangoproject.com/', type: 'Documentation' },
        { title: 'Django for Beginners', url: 'https://djangoforbeginners.com/', type: 'Book' },
        { title: 'Django Girls Tutorial', url: 'https://tutorial.djangogirls.org/', type: 'Tutorial' }
      ],
      'flask': [
        { title: 'Flask Official Documentation', url: 'https://flask.palletsprojects.com/', type: 'Documentation' },
        { title: 'Flask Mega-Tutorial', url: 'https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world', type: 'Tutorial' },
        { title: 'Flask by Example', url: 'https://realpython.com/tutorials/flask/', type: 'Course' }
      ],
      'fastapi': [
        { title: 'FastAPI Official Docs', url: 'https://fastapi.tiangolo.com/', type: 'Documentation' },
        { title: 'FastAPI Tutorial', url: 'https://fastapi.tiangolo.com/tutorial/', type: 'Tutorial' },
        { title: 'Building APIs with FastAPI', url: 'https://testdriven.io/blog/fastapi-crud/', type: 'Guide' }
      ],
      'java': [
        { title: 'Oracle Java Documentation', url: 'https://docs.oracle.com/en/java/', type: 'Documentation' },
        { title: 'Java Programming (MOOC)', url: 'https://java-programming.mooc.fi/', type: 'Course' },
        { title: 'Baeldung Java Tutorials', url: 'https://www.baeldung.com/', type: 'Tutorial' }
      ],
      'spring': [
        { title: 'Spring Framework Docs', url: 'https://spring.io/projects/spring-framework', type: 'Documentation' },
        { title: 'Spring Boot Tutorial', url: 'https://spring.io/guides', type: 'Tutorial' },
        { title: 'Spring Academy', url: 'https://spring.academy/', type: 'Course' }
      ],
      'go': [
        { title: 'Go Official Documentation', url: 'https://go.dev/doc/', type: 'Documentation' },
        { title: 'Tour of Go', url: 'https://go.dev/tour/', type: 'Interactive' },
        { title: 'Go by Example', url: 'https://gobyexample.com/', type: 'Tutorial' }
      ],
      'rust': [
        { title: 'The Rust Book', url: 'https://doc.rust-lang.org/book/', type: 'Book' },
        { title: 'Rust by Example', url: 'https://doc.rust-lang.org/rust-by-example/', type: 'Tutorial' },
        { title: 'Rustlings Exercises', url: 'https://github.com/rust-lang/rustlings', type: 'Interactive' }
      ],
      'php': [
        { title: 'PHP Official Manual', url: 'https://www.php.net/manual/en/', type: 'Documentation' },
        { title: 'PHP The Right Way', url: 'https://phptherightway.com/', type: 'Guide' },
        { title: 'Laravel Documentation', url: 'https://laravel.com/docs', type: 'Documentation' }
      ],
      'ruby': [
        { title: 'Ruby Official Documentation', url: 'https://www.ruby-lang.org/en/documentation/', type: 'Documentation' },
        { title: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/', type: 'Tutorial' },
        { title: 'The Odin Project - Ruby', url: 'https://www.theodinproject.com/paths/full-stack-ruby-on-rails', type: 'Course' }
      ],
      
      // Databases
      'sql': [
        { title: 'SQL Tutorial (W3Schools)', url: 'https://www.w3schools.com/sql/', type: 'Tutorial' },
        { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/', type: 'Documentation' },
        { title: 'SQLBolt Interactive Lessons', url: 'https://sqlbolt.com/', type: 'Interactive' }
      ],
      'mongodb': [
        { title: 'MongoDB Official Docs', url: 'https://www.mongodb.com/docs/', type: 'Documentation' },
        { title: 'MongoDB University', url: 'https://university.mongodb.com/', type: 'Course' },
        { title: 'MongoDB Tutorial', url: 'https://www.mongodb.com/docs/manual/tutorial/', type: 'Tutorial' }
      ],
      'redis': [
        { title: 'Redis Official Documentation', url: 'https://redis.io/docs/', type: 'Documentation' },
        { title: 'Redis University', url: 'https://university.redis.com/', type: 'Course' },
        { title: 'Try Redis', url: 'https://try.redis.io/', type: 'Interactive' }
      ],
      'postgresql': [
        { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/', type: 'Documentation' },
        { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'Tutorial' },
        { title: 'PostgreSQL Exercises', url: 'https://pgexercises.com/', type: 'Interactive' }
      ],
      'mysql': [
        { title: 'MySQL Documentation', url: 'https://dev.mysql.com/doc/', type: 'Documentation' },
        { title: 'MySQL Tutorial', url: 'https://www.mysqltutorial.org/', type: 'Tutorial' },
        { title: 'MySQL for Developers', url: 'https://planetscale.com/courses/mysql-for-developers', type: 'Course' }
      ],
      
      // DevOps & Cloud
      'docker': [
        { title: 'Docker Official Documentation', url: 'https://docs.docker.com/', type: 'Documentation' },
        { title: 'Docker Tutorial for Beginners', url: 'https://docker-curriculum.com/', type: 'Tutorial' },
        { title: 'Play with Docker', url: 'https://labs.play-with-docker.com/', type: 'Interactive' }
      ],
      'kubernetes': [
        { title: 'Kubernetes Official Docs', url: 'https://kubernetes.io/docs/home/', type: 'Documentation' },
        { title: 'Kubernetes Tutorial', url: 'https://kubernetes.io/docs/tutorials/', type: 'Tutorial' },
        { title: 'Kubernetes the Hard Way', url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way', type: 'Guide' }
      ],
      'aws': [
        { title: 'AWS Documentation', url: 'https://docs.aws.amazon.com/', type: 'Documentation' },
        { title: 'AWS Training', url: 'https://aws.amazon.com/training/', type: 'Course' },
        { title: 'AWS Workshops', url: 'https://workshops.aws/', type: 'Interactive' }
      ],
      'azure': [
        { title: 'Azure Documentation', url: 'https://docs.microsoft.com/en-us/azure/', type: 'Documentation' },
        { title: 'Microsoft Learn - Azure', url: 'https://learn.microsoft.com/en-us/training/azure/', type: 'Course' },
        { title: 'Azure Fundamentals', url: 'https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/', type: 'Tutorial' }
      ],
      'gcp': [
        { title: 'Google Cloud Documentation', url: 'https://cloud.google.com/docs', type: 'Documentation' },
        { title: 'Google Cloud Skills Boost', url: 'https://www.cloudskillsboost.google/', type: 'Course' },
        { title: 'GCP Tutorials', url: 'https://cloud.google.com/docs/tutorials', type: 'Tutorial' }
      ],
      'terraform': [
        { title: 'Terraform Documentation', url: 'https://www.terraform.io/docs', type: 'Documentation' },
        { title: 'Terraform Tutorial', url: 'https://learn.hashicorp.com/terraform', type: 'Tutorial' },
        { title: 'Terraform Best Practices', url: 'https://www.terraform-best-practices.com/', type: 'Guide' }
      ],
      'jenkins': [
        { title: 'Jenkins Documentation', url: 'https://www.jenkins.io/doc/', type: 'Documentation' },
        { title: 'Jenkins Tutorial', url: 'https://www.jenkins.io/doc/tutorials/', type: 'Tutorial' },
        { title: 'Jenkins Pipeline', url: 'https://www.jenkins.io/doc/book/pipeline/', type: 'Guide' }
      ],
      'git': [
        { title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', type: 'Book' },
        { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/', type: 'Interactive' },
        { title: 'GitHub Learning Lab', url: 'https://lab.github.com/', type: 'Course' }
      ],
      
      // Data Science & ML
      'machine learning': [
        { title: 'Machine Learning Course (Coursera)', url: 'https://www.coursera.org/learn/machine-learning', type: 'Course' },
        { title: 'Scikit-learn Documentation', url: 'https://scikit-learn.org/stable/', type: 'Documentation' },
        { title: 'Fast.ai Practical Deep Learning', url: 'https://course.fast.ai/', type: 'Course' }
      ],
      'tensorflow': [
        { title: 'TensorFlow Official Docs', url: 'https://www.tensorflow.org/learn', type: 'Documentation' },
        { title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials', type: 'Tutorial' },
        { title: 'TensorFlow in Practice', url: 'https://www.coursera.org/specializations/tensorflow-in-practice', type: 'Course' }
      ],
      'pytorch': [
        { title: 'PyTorch Documentation', url: 'https://pytorch.org/docs/', type: 'Documentation' },
        { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', type: 'Tutorial' },
        { title: 'Deep Learning with PyTorch', url: 'https://pytorch.org/deep-learning-with-pytorch', type: 'Book' }
      ],
      'pandas': [
        { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/', type: 'Documentation' },
        { title: 'Pandas Tutorial', url: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/', type: 'Tutorial' },
        { title: 'Python for Data Analysis', url: 'https://wesmckinney.com/book/', type: 'Book' }
      ],
      'numpy': [
        { title: 'NumPy Documentation', url: 'https://numpy.org/doc/', type: 'Documentation' },
        { title: 'NumPy Tutorial', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html', type: 'Tutorial' },
        { title: 'NumPy Exercises', url: 'https://github.com/rougier/numpy-100', type: 'Interactive' }
      ],
      
      // Mobile Development
      'react native': [
        { title: 'React Native Docs', url: 'https://reactnative.dev/docs/getting-started', type: 'Documentation' },
        { title: 'React Native Tutorial', url: 'https://reactnative.dev/docs/tutorial', type: 'Tutorial' },
        { title: 'React Native School', url: 'https://www.reactnativeschool.com/', type: 'Course' }
      ],
      'flutter': [
        { title: 'Flutter Documentation', url: 'https://docs.flutter.dev/', type: 'Documentation' },
        { title: 'Flutter Codelabs', url: 'https://docs.flutter.dev/codelabs', type: 'Interactive' },
        { title: 'Flutter Course', url: 'https://www.udacity.com/course/build-native-mobile-apps-with-flutter--ud905', type: 'Course' }
      ],
      'swift': [
        { title: 'Swift Documentation', url: 'https://swift.org/documentation/', type: 'Documentation' },
        { title: 'Swift Playgrounds', url: 'https://www.apple.com/swift/playgrounds/', type: 'Interactive' },
        { title: 'Hacking with Swift', url: 'https://www.hackingwithswift.com/', type: 'Tutorial' }
      ],
      'kotlin': [
        { title: 'Kotlin Documentation', url: 'https://kotlinlang.org/docs/home.html', type: 'Documentation' },
        { title: 'Kotlin Koans', url: 'https://play.kotlinlang.org/koans/', type: 'Interactive' },
        { title: 'Android Kotlin Fundamentals', url: 'https://developer.android.com/courses/kotlin-android-fundamentals/overview', type: 'Course' }
      ],
      
      // Testing
      'jest': [
        { title: 'Jest Documentation', url: 'https://jestjs.io/docs/getting-started', type: 'Documentation' },
        { title: 'Testing JavaScript', url: 'https://testingjavascript.com/', type: 'Course' },
        { title: 'Jest Tutorial', url: 'https://www.valentinog.com/blog/jest/', type: 'Tutorial' }
      ],
      'pytest': [
        { title: 'Pytest Documentation', url: 'https://docs.pytest.org/', type: 'Documentation' },
        { title: 'Pytest Tutorial', url: 'https://realpython.com/pytest-python-testing/', type: 'Tutorial' },
        { title: 'Test-Driven Development with Python', url: 'https://www.obeythetestinggoat.com/', type: 'Book' }
      ],
      'selenium': [
        { title: 'Selenium Documentation', url: 'https://www.selenium.dev/documentation/', type: 'Documentation' },
        { title: 'Selenium Tutorial', url: 'https://www.selenium.dev/documentation/webdriver/', type: 'Tutorial' },
        { title: 'Test Automation University', url: 'https://testautomationu.applitools.com/', type: 'Course' }
      ],
      
      // Security
      'cybersecurity': [
        { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'Guide' },
        { title: 'Cybrary', url: 'https://www.cybrary.it/', type: 'Platform' },
        { title: 'TryHackMe', url: 'https://tryhackme.com/', type: 'Interactive' }
      ],
      'penetration testing': [
        { title: 'Metasploit Unleashed', url: 'https://www.offensive-security.com/metasploit-unleashed/', type: 'Course' },
        { title: 'HackTheBox', url: 'https://www.hackthebox.com/', type: 'Interactive' },
        { title: 'PortSwigger Web Security', url: 'https://portswigger.net/web-security', type: 'Tutorial' }
      ],
      
      // Blockchain
      'blockchain': [
        { title: 'Blockchain Basics', url: 'https://www.coursera.org/learn/blockchain-basics', type: 'Course' },
        { title: 'Ethereum Documentation', url: 'https://ethereum.org/en/developers/docs/', type: 'Documentation' },
        { title: 'CryptoZombies', url: 'https://cryptozombies.io/', type: 'Interactive' }
      ],
      'solidity': [
        { title: 'Solidity Documentation', url: 'https://docs.soliditylang.org/', type: 'Documentation' },
        { title: 'Solidity by Example', url: 'https://solidity-by-example.org/', type: 'Tutorial' },
        { title: 'CryptoZombies', url: 'https://cryptozombies.io/', type: 'Interactive' }
      ],
      
      // Game Development
      'unity': [
        { title: 'Unity Learn', url: 'https://learn.unity.com/', type: 'Platform' },
        { title: 'Unity Documentation', url: 'https://docs.unity3d.com/', type: 'Documentation' },
        { title: 'Unity Tutorials', url: 'https://learn.unity.com/tutorials', type: 'Tutorial' }
      ],
      'unreal': [
        { title: 'Unreal Engine Documentation', url: 'https://docs.unrealengine.com/', type: 'Documentation' },
        { title: 'Unreal Online Learning', url: 'https://www.unrealengine.com/en-US/onlinelearning-courses', type: 'Course' },
        { title: 'Unreal Engine Tutorials', url: 'https://dev.epicgames.com/community/learning', type: 'Tutorial' }
      ]
    };

    // Find matching resources or return generic ones
    for (const [key, resources] of Object.entries(resourceMap)) {
      if (topicName.includes(key)) {
        return resources;
      }
    }

    // Default resources for topics not specifically mapped
    return [
      { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', type: 'Platform' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', type: 'Documentation' },
      { title: 'GitHub Learning Lab', url: 'https://lab.github.com/', type: 'Interactive' }
    ];
  };

  const renderMarkdown = (text) => {
    // Very basic markdown parser for the mock content
    const lines = text.trim().split('\n');
    let inCodeBlock = false;
    let codeContent = [];

    return lines.map((line, index) => {
      line = line.trim();
      
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock) {
          const code = codeContent.join('\n');
          codeContent = [];
          return (
            <pre key={index} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', overflowX: 'auto', margin: '1rem 0' }}>
              <code style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem' }}>{code}</code>
            </pre>
          );
        }
        return null;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      if (line.startsWith('# ')) {
        return <h1 key={index} style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1.5rem', marginTop: '1rem' }}>{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '1rem', marginTop: '2rem' }}>{line.substring(3)}</h2>;
      }
      if (line.startsWith('- ')) {
        const content = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <li key={index} style={{ marginBottom: '0.5rem', marginLeft: '1.5rem' }} dangerouslySetInnerHTML={{ __html: content }} />;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={index} style={{ fontStyle: 'italic', color: '#64748b', marginTop: '2rem', textAlign: 'center' }}>{line.substring(1, line.length - 1)}</p>;
      }
      if (line === '') {
        return <br key={index} />;
      }

      // Handle inline bold
      const pContent = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={index} style={{ marginBottom: '1rem', lineHeight: '1.6', color: '#334155' }} dangerouslySetInnerHTML={{ __html: pContent }} />;
    });
  };

  const getQuestions = () => {
    const name = resource.name;
    return [
      {
        question: `What is a primary goal of ${name}?`,
        options: ["Memorizing syntax", "Understanding underlying principles", "Ignoring best practices", "Creating unscalable code"],
        answer: 1
      },
      {
        question: `Which of the following is highlighted as a core concept in ${name}?`,
        options: ["Slow performance", "Scalability", "Manual processing", "Complexity over clarity"],
        answer: 1
      },
      {
        question: `Based on the example code, what does the implementation pattern do?`,
        options: ["Deletes data", "Processes items efficiently", "Slows down the loop", "Ignores input values"],
        answer: 1
      }
    ];
  };

  const questions = getQuestions();

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setMode('result');
    }
  };

  const isPassed = score >= 2;

  const handleFinish = () => {
    if (isPassed && onComplete) {
      onComplete(resource);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            padding: '1.5rem 2rem', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {resource.type === 'course' ? '🎓' : resource.type === 'video-quiz' ? '📺' : '📄'}
              </span>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>
                  {resource.type === 'video-quiz' ? 'Video Mastery Quiz' : <span>DEV<sup>A</sup> Reader</span>}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {resource.type === 'video-quiz' ? 'Verify your knowledge' : 'Exclusive Internal Content'}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {mode === 'reading' ? (
                <>
                  {renderMarkdown(getMockContent())}
                  
                  {/* Senior Developer Insights Section */}
                  {(() => {
                    const insights = getSeniorDeveloperInsights();
                    return (
                      <div style={{ 
                        marginTop: '3rem', 
                        padding: '2.5rem', 
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                        borderRadius: '16px',
                        border: '2px solid #f59e0b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                          <span style={{ fontSize: '2.5rem' }}>💡</span>
                          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>
                            Senior Developer Insights
                          </h3>
                        </div>
                        <p style={{ color: '#78350f', marginBottom: '2rem', fontSize: '1.05rem', fontStyle: 'italic' }}>
                          Real-world wisdom from experienced developers who've been in your shoes
                        </p>

                        {/* Key Insights */}
                        <div style={{ marginBottom: '2rem' }}>
                          <h4 style={{ 
                            color: '#0f172a', 
                            fontSize: '1.25rem', 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>🎯</span> What Senior Developers Wish They Knew Earlier
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {insights.insights.map((insight, index) => (
                              <div key={index} style={{
                                padding: '1.25rem',
                                background: '#ffffff',
                                borderRadius: '12px',
                                borderLeft: '4px solid #f59e0b',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.6', fontSize: '1rem' }}>
                                  "{insight}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Mistakes */}
                        <div style={{ marginBottom: '2rem' }}>
                          <h4 style={{ 
                            color: '#0f172a', 
                            fontSize: '1.25rem', 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>⚠️</span> Common Mistakes to Avoid
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {insights.mistakes.map((mistake, index) => (
                              <div key={index} style={{
                                padding: '1rem',
                                background: '#fff7ed',
                                borderRadius: '10px',
                                borderLeft: '3px solid #ea580c',
                                display: 'flex',
                                gap: '0.75rem',
                                alignItems: 'flex-start'
                              }}>
                                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>❌</span>
                                <p style={{ margin: 0, color: '#7c2d12', lineHeight: '1.5', fontSize: '0.95rem' }}>
                                  {mistake}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Career Advice */}
                        <div style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          borderRadius: '12px',
                          border: '2px solid #3b82f6'
                        }}>
                          <h4 style={{ 
                            color: '#0f172a', 
                            fontSize: '1.25rem', 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>🚀</span> Career Growth Advice
                          </h4>
                          <p style={{ 
                            margin: 0, 
                            color: '#1e3a8a', 
                            lineHeight: '1.7', 
                            fontSize: '1.05rem',
                            fontWeight: '500'
                          }}>
                            {insights.careerAdvice}
                          </p>
                        </div>

                        <p style={{ 
                          marginTop: '2rem', 
                          fontSize: '0.875rem', 
                          color: '#78350f',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          borderTop: '1px solid #fbbf24',
                          paddingTop: '1rem'
                        }}>
                          💬 These insights are compiled from Reddit discussions, Stack Overflow, and interviews with senior developers
                        </p>
                      </div>
                    );
                  })()}
                  
                  {/* External Learning Resources Section */}
                  <div style={{ 
                    marginTop: '3rem', 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                    borderRadius: '16px',
                    border: '2px solid #3b82f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '2rem' }}>🚀</span>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>
                        Want to Learn More?
                      </h3>
                    </div>
                    <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      Dive deeper with these curated external resources. Each link opens in a new tab so you can explore at your own pace.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {getExternalResources().map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            textDecoration: 'none',
                            color: '#0f172a',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateX(8px)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                              {resource.title}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              <span style={{ 
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                fontWeight: '500'
                              }}>
                                {resource.type}
                              </span>
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '1.5rem',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            →
                          </div>
                        </a>
                      ))}
                    </div>
                    <p style={{ 
                      marginTop: '1.5rem', 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}>
                      💡 Tip: Bookmark these resources for future reference
                    </p>
                  </div>
                </>
              ) : mode === 'quiz' ? (
                <div style={{ padding: '1rem 0' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>QUESTION {currentQuestion + 1} OF {questions.length}</span>
                    <h3 style={{ marginTop: '0.5rem', color: '#0f172a' }}>{questions[currentQuestion].question}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {questions[currentQuestion].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedAnswer(i)}
                        style={{
                          padding: '1.25rem',
                          textAlign: 'left',
                          borderRadius: '12px',
                          border: `2px solid ${selectedAnswer === i ? '#f59e0b' : '#e2e8f0'}`,
                          background: selectedAnswer === i ? '#fffbeb' : '#ffffff',
                          color: '#0f172a',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
                    {isPassed ? '🎉' : '❌'}
                  </div>
                  <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>
                    {isPassed ? 'You Mastered It!' : 'Keep Studying!'}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    You got <strong>{score} out of {questions.length}</strong> questions correct.
                  </p>
                  
                  {!isPassed && (
                    <button 
                      onClick={() => {
                        setMode('reading');
                        setScore(0);
                        setCurrentQuestion(0);
                        setSelectedAnswer(null);
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Try Reading Again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            {mode === 'reading' ? (
              <button 
                onClick={() => setMode('quiz')}
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Mark as Read & Start Quiz
              </button>
            ) : mode === 'quiz' ? (
              <button 
                disabled={selectedAnswer === null}
                onClick={handleNext}
                style={{
                  background: selectedAnswer === null ? '#cbd5e1' : '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: selectedAnswer === null ? 'not-allowed' : 'pointer'
                }}
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                style={{
                  background: isPassed ? '#10b981' : '#64748b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isPassed ? 'Complete Learning' : 'Close'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlogReaderModal;
