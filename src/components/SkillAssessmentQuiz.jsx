import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import '../styles/SkillAssessment.css';

const SkillAssessmentQuiz = ({ skills, onComplete, onClose }) => {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skillScores, setSkillScores] = useState({});
  const [quizQuestions, setQuizQuestions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Generate questions for all skills
    generateQuestionsForSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQuestionsForSkills = async () => {
    setIsLoading(true);
    const questionsMap = {};
    
    for (const skill of skills) {
      // Try to fetch questions from backend
      try {
        const response = await fetch('http://localhost:5001/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill, count: 4 })
        });
        
        if (response.ok) {
          const data = await response.json();
          questionsMap[skill] = data.questions;
        } else {
          // Fallback to default questions
          questionsMap[skill] = getDefaultQuestions(skill);
        }
      } catch (error) {
        // Fallback to default questions
        questionsMap[skill] = getDefaultQuestions(skill);
      }
    }
    
    setQuizQuestions(questionsMap);
    setIsLoading(false);
  };

  const getDefaultQuestions = (skill) => {
    const skillLower = skill.toLowerCase();
    
    // Default question templates for common skills
    const questionBank = {
      python: [
        {
          question: "What is the time complexity of dict.get() in Python?",
          options: ["O(1) average case", "O(n)", "O(log n)", "O(n²)"],
          correct: 0,
          difficulty: "medium",
          explanation: "Dictionary lookups in Python use hash tables with O(1) average case complexity"
        },
        {
          question: "What does the GIL (Global Interpreter Lock) prevent in CPython?",
          options: [
            "Multiple threads from executing Python bytecode simultaneously",
            "Memory leaks in long-running processes",
            "Race conditions in multiprocessing",
            "Deadlocks in async operations"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "The GIL prevents multiple threads from executing Python bytecode at once, limiting true parallelism"
        },
        {
          question: "What is the output of: [x for x in range(3)] * 2?",
          options: [
            "[0, 1, 2, 0, 1, 2]",
            "[0, 0, 1, 1, 2, 2]",
            "[[0, 1, 2], [0, 1, 2]]",
            "TypeError"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "List multiplication repeats the entire list, not individual elements"
        },
        {
          question: "Which statement about Python's memory management is TRUE?",
          options: [
            "Uses reference counting with cycle detection",
            "Uses mark-and-sweep garbage collection only",
            "Requires manual memory deallocation",
            "Has no garbage collection mechanism"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Python uses reference counting as primary mechanism with generational garbage collection for cycles"
        }
      ],
      javascript: [
        {
          question: "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
          options: ["false", "true", "undefined", "NaN"],
          correct: 0,
          difficulty: "medium",
          explanation: "Floating point precision issues cause 0.1 + 0.2 to equal 0.30000000000000004"
        },
        {
          question: "What happens when you call Promise.all() with an empty array?",
          options: [
            "Returns a resolved promise immediately",
            "Returns a rejected promise",
            "Throws a TypeError",
            "Returns undefined"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Promise.all([]) resolves immediately with an empty array"
        },
        {
          question: "What is the difference between Map and WeakMap?",
          options: [
            "WeakMap keys must be objects and allow garbage collection",
            "Map is faster than WeakMap",
            "WeakMap can only store strings",
            "Map is deprecated in favor of WeakMap"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "WeakMap only accepts objects as keys and doesn't prevent garbage collection of those keys"
        },
        {
          question: "What does the 'async' keyword do to a function's return value?",
          options: [
            "Wraps the return value in a Promise",
            "Makes the function run faster",
            "Converts it to a callback",
            "Prevents the function from returning"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Async functions always return a Promise, wrapping non-Promise values automatically"
        }
      ],
      sql: [
        {
          question: "What is the time complexity of a B-tree index lookup?",
          options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
          correct: 0,
          difficulty: "hard",
          explanation: "B-tree indexes provide O(log n) lookup time due to their balanced tree structure"
        },
        {
          question: "What does ACID stand for in database transactions?",
          options: [
            "Atomicity, Consistency, Isolation, Durability",
            "Access, Control, Integrity, Data",
            "Automatic, Concurrent, Indexed, Distributed",
            "Asynchronous, Cached, Isolated, Durable"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "ACID properties ensure reliable database transactions"
        },
        {
          question: "What is the difference between UNION and UNION ALL?",
          options: [
            "UNION removes duplicates, UNION ALL keeps them",
            "UNION is faster than UNION ALL",
            "UNION ALL sorts results, UNION doesn't",
            "They are exactly the same"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "UNION performs a DISTINCT operation to remove duplicates, UNION ALL doesn't"
        },
        {
          question: "What isolation level prevents phantom reads?",
          options: [
            "SERIALIZABLE",
            "READ COMMITTED",
            "READ UNCOMMITTED",
            "REPEATABLE READ"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "SERIALIZABLE is the highest isolation level and prevents phantom reads"
        }
      ],
      react: [
        {
          question: "What is the purpose of React.memo()?",
          options: [
            "Prevents re-renders if props haven't changed",
            "Stores component state in memory",
            "Caches API responses",
            "Optimizes bundle size"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "React.memo is a higher-order component that memoizes the result to prevent unnecessary re-renders"
        },
        {
          question: "What happens if you call setState() in componentWillUnmount()?",
          options: [
            "React will warn about memory leaks",
            "State updates normally",
            "Component re-mounts",
            "Nothing happens"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Calling setState in componentWillUnmount causes memory leaks as the component is being destroyed"
        },
        {
          question: "What is the difference between useEffect and useLayoutEffect?",
          options: [
            "useLayoutEffect runs synchronously after DOM mutations",
            "useEffect is deprecated",
            "useLayoutEffect is for class components only",
            "They are exactly the same"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "useLayoutEffect fires synchronously after DOM mutations but before browser paint"
        },
        {
          question: "What does the 'key' prop do in React lists?",
          options: [
            "Helps React identify which items changed",
            "Encrypts component data",
            "Sets CSS class names",
            "Defines component hierarchy"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Keys help React identify which items have changed, been added, or removed for efficient updates"
        }
      ],
      java: [
        {
          question: "What is the difference between == and .equals() in Java?",
          options: [
            "== compares references, .equals() compares values",
            "They are exactly the same",
            "== is faster than .equals()",
            ".equals() is deprecated"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "== checks reference equality while .equals() checks value equality"
        },
        {
          question: "What is the purpose of the volatile keyword?",
          options: [
            "Ensures visibility of changes across threads",
            "Makes variables immutable",
            "Increases performance",
            "Prevents null pointer exceptions"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "volatile ensures that changes to a variable are visible to all threads immediately"
        },
        {
          question: "What is the time complexity of HashMap.get()?",
          options: ["O(1) average case", "O(n)", "O(log n)", "O(n²)"],
          correct: 0,
          difficulty: "medium",
          explanation: "HashMap uses hashing for O(1) average case lookup time"
        },
        {
          question: "What happens if you don't override hashCode() when overriding equals()?",
          options: [
            "Objects won't work correctly in hash-based collections",
            "Compilation error",
            "Runtime exception",
            "Nothing, it's optional"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Equal objects must have equal hash codes for hash-based collections to work correctly"
        }
      ],
      nodejs: [
        {
          question: "What is the event loop in Node.js?",
          options: [
            "Mechanism that handles async operations using phases",
            "A loop that runs forever",
            "A debugging tool",
            "A package manager"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "The event loop processes callbacks in different phases: timers, I/O, setImmediate, close callbacks"
        },
        {
          question: "What is the difference between process.nextTick() and setImmediate()?",
          options: [
            "nextTick executes before I/O, setImmediate after",
            "They are exactly the same",
            "setImmediate is deprecated",
            "nextTick is slower"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "process.nextTick() executes before the event loop continues, setImmediate() in the check phase"
        },
        {
          question: "What does the cluster module do?",
          options: [
            "Creates child processes to utilize multiple CPU cores",
            "Groups related modules together",
            "Manages database connections",
            "Handles file system operations"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "The cluster module allows creating child processes that share server ports to utilize multi-core systems"
        },
        {
          question: "What is a stream in Node.js?",
          options: [
            "An abstract interface for working with streaming data",
            "A type of database connection",
            "A network protocol",
            "A file format"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Streams are collections of data that might not be available all at once and don't fit in memory"
        }
      ],
      docker: [
        {
          question: "What is the difference between CMD and ENTRYPOINT?",
          options: [
            "ENTRYPOINT sets the main command, CMD provides default arguments",
            "They are exactly the same",
            "CMD is deprecated",
            "ENTRYPOINT is only for debugging"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "ENTRYPOINT defines the executable, CMD provides default arguments that can be overridden"
        },
        {
          question: "What is a multi-stage build?",
          options: [
            "Uses multiple FROM statements to reduce image size",
            "Builds multiple containers at once",
            "A deprecated feature",
            "A type of network configuration"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Multi-stage builds use multiple FROM statements to copy artifacts between stages, reducing final image size"
        },
        {
          question: "What does the --rm flag do in docker run?",
          options: [
            "Automatically removes container when it exits",
            "Removes all images",
            "Restarts the container",
            "Runs in read-only mode"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "The --rm flag automatically removes the container when it exits to save disk space"
        },
        {
          question: "What is the purpose of .dockerignore?",
          options: [
            "Excludes files from build context",
            "Ignores container logs",
            "Disables security warnings",
            "Hides containers from docker ps"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: ".dockerignore excludes files from the build context to reduce build time and image size"
        }
      ],
      git: [
        {
          question: "What is the difference between git merge and git rebase?",
          options: [
            "Merge creates a merge commit, rebase rewrites history",
            "They are exactly the same",
            "Rebase is deprecated",
            "Merge is faster"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Merge preserves history with a merge commit, rebase rewrites commit history linearly"
        },
        {
          question: "What does git cherry-pick do?",
          options: [
            "Applies a specific commit to current branch",
            "Deletes selected commits",
            "Merges all branches",
            "Creates a new branch"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Cherry-pick applies the changes from a specific commit to your current branch"
        },
        {
          question: "What is the purpose of git reflog?",
          options: [
            "Shows history of HEAD movements",
            "Logs remote operations",
            "Displays file changes",
            "Shows branch structure"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Reflog records when the tips of branches and other references were updated in the local repository"
        },
        {
          question: "What does git reset --hard do?",
          options: [
            "Resets index and working directory to specified commit",
            "Only resets the index",
            "Creates a backup",
            "Deletes the repository"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "git reset --hard discards all changes and resets both index and working directory"
        }
      ],
      // Mobile Development
      swift: [
        {
          question: "What is the difference between struct and class in Swift?",
          options: [
            "Structs are value types, classes are reference types",
            "They are exactly the same",
            "Structs are deprecated",
            "Classes are faster"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Structs are value types (copied), classes are reference types (shared)"
        },
        {
          question: "What is optional chaining in Swift?",
          options: [
            "Safely accessing properties of optional values",
            "Creating linked lists",
            "Method overloading",
            "Memory management"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Optional chaining allows safe access to properties, methods, and subscripts on optional values"
        },
        {
          question: "What does the 'guard' statement do?",
          options: [
            "Early exit if condition is not met",
            "Protects against crashes",
            "Encrypts data",
            "Validates user input"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Guard provides early exit from a function if conditions aren't met"
        },
        {
          question: "What is ARC in Swift?",
          options: [
            "Automatic Reference Counting for memory management",
            "Array Reference Container",
            "Asynchronous Request Controller",
            "Application Runtime Compiler"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "ARC automatically manages memory by tracking and managing references to class instances"
        }
      ],
      kotlin: [
        {
          question: "What is the difference between val and var in Kotlin?",
          options: [
            "val is immutable, var is mutable",
            "They are the same",
            "val is faster",
            "var is deprecated"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "val declares read-only (immutable) variables, var declares mutable variables"
        },
        {
          question: "What are data classes in Kotlin?",
          options: [
            "Classes that automatically generate equals, hashCode, toString",
            "Classes for database operations",
            "Abstract classes",
            "Deprecated feature"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Data classes automatically provide equals(), hashCode(), toString(), copy() methods"
        },
        {
          question: "What is null safety in Kotlin?",
          options: [
            "Type system that eliminates null pointer exceptions",
            "Security feature",
            "Memory protection",
            "Error handling mechanism"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Kotlin's type system distinguishes nullable and non-nullable types to prevent NPEs"
        },
        {
          question: "What are coroutines in Kotlin?",
          options: [
            "Lightweight threads for asynchronous programming",
            "Data structures",
            "Design patterns",
            "Testing frameworks"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Coroutines provide a way to write asynchronous code sequentially"
        }
      ],
      // Blockchain
      solidity: [
        {
          question: "What is a smart contract?",
          options: [
            "Self-executing code on blockchain",
            "Legal document",
            "API endpoint",
            "Database schema"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Smart contracts are self-executing programs stored on blockchain"
        },
        {
          question: "What is gas in Ethereum?",
          options: [
            "Computational cost for executing operations",
            "Cryptocurrency",
            "Storage unit",
            "Network protocol"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Gas measures computational effort required to execute operations on Ethereum"
        },
        {
          question: "What is the purpose of the 'payable' modifier?",
          options: [
            "Allows function to receive Ether",
            "Makes function public",
            "Optimizes gas usage",
            "Validates input"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Payable modifier allows a function to receive Ether during calls"
        },
        {
          question: "What is a reentrancy attack?",
          options: [
            "Exploiting external calls to drain funds",
            "DDoS attack",
            "SQL injection",
            "XSS vulnerability"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Reentrancy occurs when external calls allow malicious contracts to re-enter and drain funds"
        }
      ],
      // Game Development
      unity: [
        {
          question: "What is a GameObject in Unity?",
          options: [
            "Base class for all entities in Unity scenes",
            "Game controller",
            "Physics engine",
            "Rendering system"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "GameObject is the fundamental object in Unity scenes that represents characters, props, scenery"
        },
        {
          question: "What is the difference between Update() and FixedUpdate()?",
          options: [
            "Update runs per frame, FixedUpdate runs at fixed intervals",
            "They are the same",
            "FixedUpdate is deprecated",
            "Update is faster"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Update is called every frame, FixedUpdate is called at fixed time intervals for physics"
        },
        {
          question: "What are Prefabs in Unity?",
          options: [
            "Reusable GameObject templates",
            "3D models",
            "Scripts",
            "Textures"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Prefabs are reusable GameObject templates that can be instantiated multiple times"
        },
        {
          question: "What is a Coroutine?",
          options: [
            "Function that can pause execution and resume later",
            "Threading mechanism",
            "Animation system",
            "Physics calculation"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Coroutines allow you to spread tasks across multiple frames"
        }
      ],
      // Cloud & DevOps
      aws: [
        {
          question: "What is EC2?",
          options: [
            "Elastic Compute Cloud - virtual servers",
            "Storage service",
            "Database service",
            "CDN service"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "EC2 provides resizable compute capacity in the cloud"
        },
        {
          question: "What is the difference between S3 and EBS?",
          options: [
            "S3 is object storage, EBS is block storage",
            "They are the same",
            "S3 is faster",
            "EBS is deprecated"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "S3 stores objects, EBS provides block-level storage volumes for EC2"
        },
        {
          question: "What is Lambda?",
          options: [
            "Serverless compute service",
            "Database service",
            "Load balancer",
            "Monitoring tool"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Lambda runs code without provisioning servers"
        },
        {
          question: "What is VPC?",
          options: [
            "Virtual Private Cloud - isolated network",
            "Virtual Processing Center",
            "Version Control Protocol",
            "Virtual Performance Cache"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "VPC lets you provision a logically isolated section of AWS cloud"
        }
      ],
      kubernetes: [
        {
          question: "What is a Pod in Kubernetes?",
          options: [
            "Smallest deployable unit containing one or more containers",
            "Cluster node",
            "Storage volume",
            "Network policy"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Pod is the smallest deployable unit that can contain one or more containers"
        },
        {
          question: "What is the difference between Deployment and StatefulSet?",
          options: [
            "StatefulSet maintains pod identity, Deployment doesn't",
            "They are the same",
            "Deployment is newer",
            "StatefulSet is deprecated"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "StatefulSet provides guarantees about ordering and uniqueness of Pods"
        },
        {
          question: "What is a Service in Kubernetes?",
          options: [
            "Abstraction to expose applications running on Pods",
            "Container runtime",
            "Storage class",
            "Monitoring tool"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Service is an abstract way to expose an application running on Pods"
        },
        {
          question: "What is kubectl?",
          options: [
            "Command-line tool for Kubernetes",
            "Container runtime",
            "Orchestration engine",
            "Monitoring dashboard"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "kubectl is the command-line tool for interacting with Kubernetes clusters"
        }
      ],
      terraform: [
        {
          question: "What is Infrastructure as Code (IaC)?",
          options: [
            "Managing infrastructure through code files",
            "Writing application code",
            "Database migrations",
            "API development"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "IaC manages and provisions infrastructure through machine-readable files"
        },
        {
          question: "What is terraform plan?",
          options: [
            "Shows what changes will be made",
            "Applies changes immediately",
            "Destroys infrastructure",
            "Validates syntax only"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "terraform plan creates an execution plan showing what actions Terraform will take"
        },
        {
          question: "What is a Terraform state file?",
          options: [
            "Tracks current infrastructure state",
            "Configuration file",
            "Log file",
            "Backup file"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "State file maps real-world resources to your configuration"
        },
        {
          question: "What are Terraform modules?",
          options: [
            "Reusable infrastructure components",
            "Plugins",
            "Providers",
            "Variables"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Modules are containers for multiple resources used together"
        }
      ],
      // Security
      cybersecurity: [
        {
          question: "What is the OWASP Top 10?",
          options: [
            "List of most critical web application security risks",
            "Top 10 hackers",
            "Security tools",
            "Programming languages"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "OWASP Top 10 is a standard awareness document for web application security"
        },
        {
          question: "What is SQL injection?",
          options: [
            "Inserting malicious SQL code into queries",
            "Database optimization",
            "Data migration",
            "Query caching"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "SQL injection is a code injection technique that exploits security vulnerabilities"
        },
        {
          question: "What is XSS (Cross-Site Scripting)?",
          options: [
            "Injecting malicious scripts into web pages",
            "Cross-platform development",
            "Server-side rendering",
            "CSS framework"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "XSS allows attackers to inject client-side scripts into web pages viewed by others"
        },
        {
          question: "What is a zero-day vulnerability?",
          options: [
            "Unknown vulnerability with no patch available",
            "Bug found on day zero",
            "Expired security certificate",
            "Outdated software"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Zero-day is a vulnerability unknown to those who should be interested in mitigating it"
        }
      ],
      // Design
      figma: [
        {
          question: "What are components in Figma?",
          options: [
            "Reusable design elements",
            "Plugins",
            "Color palettes",
            "Export formats"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Components are reusable design elements that can be instanced across designs"
        },
        {
          question: "What is Auto Layout?",
          options: [
            "Dynamic resizing and spacing of elements",
            "Automatic color matching",
            "AI-powered design",
            "Grid system"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Auto Layout creates designs that grow to fill or hug content"
        },
        {
          question: "What are variants in Figma?",
          options: [
            "Different states of a component",
            "Color schemes",
            "Font styles",
            "Export options"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Variants group similar components and let you switch between them"
        },
        {
          question: "What is prototyping in Figma?",
          options: [
            "Creating interactive mockups with transitions",
            "Writing code",
            "Exporting assets",
            "Version control"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Prototyping creates interactive flows to demonstrate user experience"
        }
      ],
      // Data Science & ML
      pandas: [
        {
          question: "What is a DataFrame?",
          options: [
            "2D labeled data structure with columns",
            "Database table",
            "JSON object",
            "Array type"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "DataFrame is a 2D labeled data structure with columns of potentially different types"
        },
        {
          question: "What does df.groupby() do?",
          options: [
            "Groups data by specified columns for aggregation",
            "Sorts data",
            "Filters rows",
            "Joins tables"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "groupby() splits data into groups based on criteria for aggregation"
        },
        {
          question: "What is the difference between loc and iloc?",
          options: [
            "loc uses labels, iloc uses integer positions",
            "They are the same",
            "loc is faster",
            "iloc is deprecated"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "loc accesses by labels, iloc accesses by integer position"
        },
        {
          question: "What does df.merge() do?",
          options: [
            "Combines DataFrames based on common columns",
            "Concatenates rows",
            "Removes duplicates",
            "Sorts data"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "merge() combines DataFrames using database-style joins"
        }
      ],
      tensorflow: [
        {
          question: "What is a tensor?",
          options: [
            "Multi-dimensional array",
            "Neural network layer",
            "Activation function",
            "Loss function"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Tensor is a multi-dimensional array, the fundamental data structure in TensorFlow"
        },
        {
          question: "What is backpropagation?",
          options: [
            "Algorithm for computing gradients in neural networks",
            "Forward pass through network",
            "Data preprocessing",
            "Model deployment"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Backpropagation computes gradients of loss with respect to weights"
        },
        {
          question: "What is overfitting?",
          options: [
            "Model performs well on training but poorly on test data",
            "Model is too simple",
            "Training takes too long",
            "Model has too few parameters"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Overfitting occurs when model learns training data too well including noise"
        },
        {
          question: "What is a learning rate?",
          options: [
            "Step size for updating model weights",
            "Training speed",
            "Model accuracy",
            "Batch size"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Learning rate controls how much to adjust weights during training"
        }
      ],
      // Testing
      selenium: [
        {
          question: "What is Selenium WebDriver?",
          options: [
            "Tool for automating web browser interactions",
            "Database driver",
            "Web server",
            "API testing tool"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "WebDriver is a tool for automating web application testing"
        },
        {
          question: "What are locators in Selenium?",
          options: [
            "Methods to identify web elements",
            "Browser drivers",
            "Test cases",
            "Assertions"
          ],
          correct: 0,
          difficulty: "medium",
          explanation: "Locators are used to identify web elements on a page"
        },
        {
          question: "What is implicit wait?",
          options: [
            "Global wait time for elements to appear",
            "Explicit delay",
            "Page load timeout",
            "Script timeout"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "Implicit wait tells WebDriver to poll DOM for a certain time when finding elements"
        },
        {
          question: "What is Page Object Model?",
          options: [
            "Design pattern for organizing test code",
            "Browser model",
            "DOM structure",
            "Testing framework"
          ],
          correct: 0,
          difficulty: "hard",
          explanation: "POM creates object repository for web UI elements"
        }
      ],
      // Generic questions for unknown skills
      default: [
        {
          question: `What is your experience level with ${skill}?`,
          options: ["Beginner", "Intermediate", "Advanced", "Expert"],
          correct: -1, // No correct answer
          difficulty: "easy",
          explanation: "Self-assessment question"
        },
        {
          question: `Have you used ${skill} in production projects?`,
          options: ["Never", "Once or twice", "Multiple times", "Regularly"],
          correct: -1,
          difficulty: "easy",
          explanation: "Experience question"
        },
        {
          question: `How comfortable are you with ${skill} best practices?`,
          options: ["Not comfortable", "Somewhat comfortable", "Very comfortable", "Expert level"],
          correct: -1,
          difficulty: "medium",
          explanation: "Proficiency question"
        },
        {
          question: `Can you explain advanced concepts in ${skill}?`,
          options: ["No", "With help", "Yes, confidently", "Yes, and can teach others"],
          correct: -1,
          difficulty: "hard",
          explanation: "Mastery question"
        }
      ]
    };

    // Map skill variations to question banks
    const skillMapping = {
      // Mobile
      'ios': 'swift',
      'swift': 'swift',
      'swiftui': 'swift',
      'android': 'kotlin',
      'kotlin': 'kotlin',
      'java': 'java',
      
      // Blockchain
      'blockchain': 'solidity',
      'solidity': 'solidity',
      'ethereum': 'solidity',
      'web3': 'solidity',
      'smart contracts': 'solidity',
      
      // Game Dev
      'unity': 'unity',
      'game development': 'unity',
      'unreal': 'unity',
      'c#': 'unity',
      
      // Cloud
      'aws': 'aws',
      'cloud': 'aws',
      'ec2': 'aws',
      's3': 'aws',
      'lambda': 'aws',
      
      // DevOps
      'kubernetes': 'kubernetes',
      'k8s': 'kubernetes',
      'docker': 'docker',
      'terraform': 'terraform',
      'infrastructure as code': 'terraform',
      
      // Security
      'security': 'cybersecurity',
      'cybersecurity': 'cybersecurity',
      'penetration testing': 'cybersecurity',
      'ethical hacking': 'cybersecurity',
      'owasp': 'cybersecurity',
      
      // Design
      'figma': 'figma',
      'ui/ux': 'figma',
      'design': 'figma',
      'adobe xd': 'figma',
      
      // Data Science
      'pandas': 'pandas',
      'numpy': 'pandas',
      'data analysis': 'pandas',
      'tensorflow': 'tensorflow',
      'pytorch': 'tensorflow',
      'machine learning': 'tensorflow',
      'ml': 'tensorflow',
      
      // Testing
      'selenium': 'selenium',
      'testing': 'selenium',
      'test automation': 'selenium',
      'qa': 'selenium'
    };
    
    // Try to find matching question bank
    const mappedSkill = skillMapping[skillLower];
    if (mappedSkill && questionBank[mappedSkill]) {
      return questionBank[mappedSkill];
    }
    
    // Return questions for the skill or default questions
    return questionBank[skillLower] || questionBank.default.map(q => ({
      ...q,
      question: q.question.replace('${skill}', skill)
    }));
  };

  const handleAnswer = (optionIndex) => {
    const currentSkill = skills[currentSkillIndex];
    const questions = quizQuestions[currentSkill];
    const currentQuestion = questions[currentQuestionIndex];

    // Store answer
    const answerKey = `${currentSkill}_${currentQuestionIndex}`;
    setAnswers(prev => ({
      ...prev,
      [answerKey]: {
        selected: optionIndex,
        correct: currentQuestion.correct,
        difficulty: currentQuestion.difficulty
      }
    }));

    // Animate transition
    gsap.to('.question-card', {
      x: -50,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        // Move to next question or skill
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (currentSkillIndex < skills.length - 1) {
          setCurrentSkillIndex(currentSkillIndex + 1);
          setCurrentQuestionIndex(0);
        } else {
          // Quiz complete
          calculateScores();
        }

        gsap.fromTo('.question-card',
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3 }
        );
      }
    });
  };

  const calculateScores = () => {
    const scores = {};

    skills.forEach(skill => {
      const questions = quizQuestions[skill];
      let correct = 0;
      let total = 0;
      let weightedScore = 0;

      questions.forEach((q, index) => {
        const answerKey = `${skill}_${index}`;
        const answer = answers[answerKey];

        if (answer) {
          total++;
          if (answer.selected === answer.correct || answer.correct === -1) {
            correct++;
            // Weight by difficulty
            const weight = q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 1.5 : 2;
            weightedScore += weight;
          }
        }
      });

      const percentage = total > 0 ? (correct / total) * 100 : 0;
      const maxWeight = questions.reduce((sum, q) => 
        sum + (q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 1.5 : 2), 0
      );
      const weightedPercentage = maxWeight > 0 ? (weightedScore / maxWeight) * 100 : 0;

      scores[skill] = {
        correct,
        total,
        percentage: Math.round(percentage),
        weightedPercentage: Math.round(weightedPercentage),
        level: getSkillLevel(weightedPercentage)
      };
    });

    setSkillScores(scores);
    setShowResults(true);
  };

  const getSkillLevel = (percentage) => {
    if (percentage >= 80) return 'expert';
    if (percentage >= 60) return 'advanced';
    if (percentage >= 40) return 'intermediate';
    return 'beginner';
  };

  const getRecommendation = (skill, score) => {
    const level = score.level;

    if (level === 'beginner') {
      return {
        title: '📚 Start Learning',
        message: `You're just getting started with ${skill}. Focus on fundamentals first.`,
        resources: [
          { type: 'course', name: `${skill} Basics`, platform: 'freeCodeCamp', link: `https://www.freecodecamp.org/learn` },
          { type: 'video', name: `${skill} Tutorial`, platform: 'YouTube', link: `https://www.youtube.com/results?search_query=${skill}+tutorial` },
          { type: 'article', name: `${skill} Guide`, platform: 'GeeksforGeeks', link: `https://www.geeksforgeeks.org/${skill.toLowerCase()}-tutorial/` }
        ],
        tracker: {
          phase: 'Foundation',
          tasks: [
            `Complete ${skill} basics course`,
            `Build 2-3 simple projects`,
            `Practice daily for 30 minutes`,
            `Join ${skill} community`
          ]
        }
      };
    } else if (level === 'intermediate') {
      return {
        title: '📈 Keep Improving',
        message: `You have a good foundation in ${skill}. Time to level up!`,
        resources: [
          { type: 'course', name: `Advanced ${skill}`, platform: 'Udemy', link: `https://www.udemy.com/courses/search/?q=${skill}+advanced` },
          { type: 'video', name: `${skill} Best Practices`, platform: 'YouTube', link: `https://www.youtube.com/results?search_query=${skill}+best+practices` },
          { type: 'article', name: `${skill} Design Patterns`, platform: 'Medium', link: `https://medium.com/search?q=${skill}+design+patterns` }
        ],
        tracker: {
          phase: 'Intermediate',
          tasks: [
            `Learn ${skill} advanced concepts`,
            `Build 3-5 medium projects`,
            `Contribute to open source`,
            `Read ${skill} documentation thoroughly`
          ]
        }
      };
    } else if (level === 'advanced') {
      return {
        title: '🎯 Almost There!',
        message: `You're proficient in ${skill}. Polish your skills for interviews!`,
        resources: [
          { type: 'practice', name: `${skill} Interview Questions`, platform: 'LeetCode', link: `https://leetcode.com/problemset/` },
          { type: 'video', name: `${skill} Interview Prep`, platform: 'YouTube', link: `https://www.youtube.com/results?search_query=${skill}+interview+questions` },
          { type: 'article', name: `${skill} Interview Guide`, platform: 'InterviewBit', link: `https://www.interviewbit.com/` }
        ],
        tracker: {
          phase: 'Interview Prep',
          tasks: [
            `Solve 50+ ${skill} problems`,
            `Review common interview questions`,
            `Practice system design`,
            `Mock interviews`
          ]
        }
      };
    } else {
      return {
        title: '🏆 Interview Ready!',
        message: `Excellent! You're ready for ${skill} interviews.`,
        interviewChecklist: [
          `✓ Core ${skill} concepts mastered`,
          `✓ Can explain advanced topics`,
          `✓ Problem-solving skills strong`,
          `✓ Best practices understood`,
          `✓ Real-world experience demonstrated`
        ],
        resources: [
          { type: 'practice', name: 'Mock Interviews', platform: 'Pramp', link: 'https://www.pramp.com/' },
          { type: 'questions', name: 'Top Interview Questions', platform: 'GitHub', link: `https://github.com/search?q=${skill}+interview+questions` },
          { type: 'article', name: 'Interview Tips', platform: 'Medium', link: `https://medium.com/search?q=${skill}+interview+tips` }
        ],
        tracker: {
          phase: 'Expert',
          tasks: [
            `Practice mock interviews`,
            `Review system design patterns`,
            `Prepare behavioral questions`,
            `Update resume with ${skill} projects`
          ]
        }
      };
    }
  };

  if (isLoading) {
    return (
      <div className="skill-assessment-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Generating personalized quiz questions...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const totalSteps = 4; // Overview, Skills, Roadmap, Action Plan

    return (
      <div className="skill-assessment-container">
        <div className="assessment-results">
          {/* Progress Stepper */}
          <div className="results-stepper">
            <div className="stepper-line" style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} />
            {['Overview', 'Skills Analysis', 'Learning Roadmap', 'Action Plan'].map((step, index) => (
              <div 
                key={index}
                className={`stepper-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="step-circle">
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>

          {/* Step 1: Overview */}
          {currentStep === 0 && (
            <div className="results-step">
              <div className="results-header">
                <h2>Your Assessment Results</h2>
                <p>You've completed the skill assessment. Here's your performance summary.</p>
              </div>

              <div className="results-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <div className="stat-value">{skills.length}</div>
                      <div className="stat-label">Skills Tested</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {Object.values(skillScores).reduce((sum, s) => sum + s.correct, 0)}
                      </div>
                      <div className="stat-label">Correct Answers</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {Math.round(Object.values(skillScores).reduce((sum, s) => sum + s.weightedPercentage, 0) / skills.length)}%
                      </div>
                      <div className="stat-label">Average Score</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {Object.values(skillScores).filter(s => s.level === 'expert' || s.level === 'advanced').length}
                      </div>
                      <div className="stat-label">Strong Skills</div>
                    </div>
                  </div>
                </div>

                <div className="skills-summary-grid">
                  {skills.map(skill => {
                    const score = skillScores[skill];
                    return (
                      <div key={skill} className="skill-summary-card" data-level={score.level}>
                        <div className="skill-summary-header">
                          <h4>{skill}</h4>
                          <span className="skill-level-badge" data-level={score.level}>
                            {score.level}
                          </span>
                        </div>
                        <div className="skill-summary-score">
                          <div className="score-circle">
                            <svg width="60" height="60">
                              <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
                              <circle 
                                cx="30" 
                                cy="30" 
                                r="25" 
                                fill="none" 
                                stroke="#f59e0b" 
                                strokeWidth="5"
                                strokeDasharray={`${2 * Math.PI * 25}`}
                                strokeDashoffset={`${2 * Math.PI * 25 * (1 - score.weightedPercentage / 100)}`}
                                transform="rotate(-90 30 30)"
                              />
                              <text x="30" y="35" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">
                                {score.weightedPercentage}%
                              </text>
                            </svg>
                          </div>
                          <div className="score-details">
                            <span>{score.correct}/{score.total} correct</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="step-navigation">
                <button className="btn btn-primary" onClick={() => setCurrentStep(1)}>
                  Next: Skills Analysis →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Skills Analysis */}
          {currentStep === 1 && (
            <div className="results-step">
              <div className="results-header">
                <h2>Detailed Skills Analysis</h2>
                <p>Deep dive into each skill with personalized recommendations</p>
              </div>

              <div className="skills-results-grid">
                {skills.map(skill => {
                  const score = skillScores[skill];
                  const recommendation = getRecommendation(skill, score);

                  return (
                    <div key={skill} className="skill-result-card">
                      <div className="skill-result-header">
                        <h3>{skill}</h3>
                        <div className="skill-score-badge" data-level={score.level}>
                          {score.weightedPercentage}%
                        </div>
                      </div>

                      <div className="skill-progress-bar">
                        <div 
                          className="skill-progress-fill"
                          style={{ width: `${score.weightedPercentage}%` }}
                          data-level={score.level}
                        />
                      </div>

                      <div className="skill-stats">
                        <span>Correct: {score.correct}/{score.total}</span>
                        <span className="skill-level-badge" data-level={score.level}>
                          {score.level.toUpperCase()}
                        </span>
                      </div>

                      <div className="skill-recommendation">
                        <h4>{recommendation.title}</h4>
                        <p>{recommendation.message}</p>

                        {recommendation.interviewChecklist && (
                          <div className="interview-checklist">
                            <h5>Interview Checklist:</h5>
                            <ul>
                              {recommendation.interviewChecklist.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="recommended-resources">
                          <h5>Recommended Resources:</h5>
                          {recommendation.resources.map((resource, i) => (
                            <a 
                              key={i}
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-link"
                            >
                              <span className="resource-type">{resource.type}</span>
                              <span className="resource-name">{resource.name}</span>
                              <span className="resource-platform">{resource.platform}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="step-navigation">
                <button className="btn btn-secondary" onClick={() => setCurrentStep(0)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                  Next: Learning Roadmap →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Learning Roadmap */}
          {currentStep === 2 && (
            <div className="results-step">
              <div className="results-header">
                <h2>Your Learning Roadmap</h2>
                <p>Interactive flowchart showing your learning path</p>
              </div>

              <div className="roadmap-section">
                <div className="roadmap-controls">
                  <button className="roadmap-control-btn" onClick={() => {
                    const roadmap = document.querySelector('.interactive-roadmap-canvas');
                    if (roadmap) roadmap.style.transform = 'scale(1)';
                  }}>
                    Reset Zoom
                  </button>
                  <span className="roadmap-hint">💡 Click nodes for details • Scroll to zoom</span>
                </div>

                {/* Interactive Roadmap Canvas */}
                <div className="interactive-roadmap-container">
                  <div className="interactive-roadmap-canvas">
                    {/* Start Node */}
                    <div className="roadmap-node start-node" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                      <div className="node-content">
                        <div className="node-icon">🎯</div>
                        <div className="node-title">Start Here</div>
                      </div>
                    </div>

                    {/* Vertical connector */}
                    <svg className="roadmap-connector" style={{ top: '80px', left: '50%', transform: 'translateX(-50%)' }}>
                      <line x1="0" y1="0" x2="0" y2="60" stroke="#475569" strokeWidth="3" strokeDasharray="5,5">
                        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                      </line>
                    </svg>

                    {/* Foundation Level */}
                    <div className="roadmap-level-group" style={{ top: '160px' }}>
                      <div className="level-label">Foundation</div>
                      <div className="roadmap-nodes-row">
                        {skills.slice(0, 2).map((skill, index) => {
                          const score = skillScores[skill];
                          const isComplete = score.level === 'expert' || score.level === 'advanced';
                          return (
                            <div 
                              key={index}
                              className={`roadmap-node skill-node ${isComplete ? 'completed' : ''}`}
                              style={{ left: `${30 + index * 40}%` }}
                              onClick={() => {
                                alert(`${skill}\n\nYour Score: ${score.weightedPercentage}%\nLevel: ${score.level}\n\nRecommendation: ${getRecommendation(skill, score).message}`);
                              }}
                            >
                              <div className="node-status">{isComplete ? '✅' : '⬜'}</div>
                              <div className="node-content">
                                <div className="node-title">{skill}</div>
                                <div className="node-score">{score.weightedPercentage}%</div>
                                <div className="node-level">{score.level}</div>
                              </div>
                              {!isComplete && <div className="node-pulse"></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connectors to Intermediate */}
                    <svg className="roadmap-connector" style={{ top: '320px', left: '40%' }}>
                      <line x1="0" y1="0" x2="0" y2="60" stroke="#475569" strokeWidth="3" strokeDasharray="5,5">
                        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                      </line>
                    </svg>
                    <svg className="roadmap-connector" style={{ top: '320px', left: '60%' }}>
                      <line x1="0" y1="0" x2="0" y2="60" stroke="#475569" strokeWidth="3" strokeDasharray="5,5">
                        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                      </line>
                    </svg>

                    {/* Intermediate Level */}
                    <div className="roadmap-level-group" style={{ top: '400px' }}>
                      <div className="level-label">Intermediate</div>
                      <div className="roadmap-nodes-row">
                        {skills.slice(2, 4).map((skill, index) => {
                          const score = skillScores[skill];
                          const isComplete = score.level === 'expert' || score.level === 'advanced';
                          return (
                            <div 
                              key={index}
                              className={`roadmap-node skill-node ${isComplete ? 'completed' : ''}`}
                              style={{ left: `${30 + index * 40}%` }}
                              onClick={() => {
                                alert(`${skill}\n\nYour Score: ${score.weightedPercentage}%\nLevel: ${score.level}\n\nRecommendation: ${getRecommendation(skill, score).message}`);
                              }}
                            >
                              <div className="node-status">{isComplete ? '✅' : '⬜'}</div>
                              <div className="node-content">
                                <div className="node-title">{skill}</div>
                                <div className="node-score">{score.weightedPercentage}%</div>
                                <div className="node-level">{score.level}</div>
                              </div>
                              {!isComplete && <div className="node-pulse"></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connectors to Advanced */}
                    {skills.length > 4 && (
                      <>
                        <svg className="roadmap-connector" style={{ top: '560px', left: '40%' }}>
                          <line x1="0" y1="0" x2="0" y2="60" stroke="#475569" strokeWidth="3" strokeDasharray="5,5">
                            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                          </line>
                        </svg>
                        <svg className="roadmap-connector" style={{ top: '560px', left: '60%' }}>
                          <line x1="0" y1="0" x2="0" y2="60" stroke="#475569" strokeWidth="3" strokeDasharray="5,5">
                            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                          </line>
                        </svg>

                        {/* Advanced Level */}
                        <div className="roadmap-level-group" style={{ top: '640px' }}>
                          <div className="level-label">Advanced</div>
                          <div className="roadmap-nodes-row">
                            {skills.slice(4).map((skill, index) => {
                              const score = skillScores[skill];
                              const isComplete = score.level === 'expert' || score.level === 'advanced';
                              return (
                                <div 
                                  key={index}
                                  className={`roadmap-node skill-node ${isComplete ? 'completed' : ''}`}
                                  style={{ left: `${20 + index * 30}%` }}
                                  onClick={() => {
                                    alert(`${skill}\n\nYour Score: ${score.weightedPercentage}%\nLevel: ${score.level}\n\nRecommendation: ${getRecommendation(skill, score).message}`);
                                  }}
                                >
                                  <div className="node-status">{isComplete ? '✅' : '⬜'}</div>
                                  <div className="node-content">
                                    <div className="node-title">{skill}</div>
                                    <div className="node-score">{score.weightedPercentage}%</div>
                                    <div className="node-level">{score.level}</div>
                                  </div>
                                  {!isComplete && <div className="node-pulse"></div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Final connector to goal */}
                        <svg className="roadmap-connector" style={{ top: '800px', left: '50%', transform: 'translateX(-50%)' }}>
                          <line x1="0" y1="0" x2="0" y2="60" stroke="#475569" strokeWidth="3" strokeDasharray="5,5">
                            <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                          </line>
                        </svg>

                        {/* Goal Node */}
                        <div className="roadmap-node goal-node" style={{ top: '880px', left: '50%', transform: 'translateX(-50%)' }}>
                          <div className="node-content">
                            <div className="node-icon">🏆</div>
                            <div className="node-title">Interview Ready!</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="roadmap-legend">
                  <h4>Legend:</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="legend-icon completed">✅</span>
                      <span>Mastered (Advanced/Expert)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-icon">⬜</span>
                      <span>Needs Practice</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-icon pulse">●</span>
                      <span>Focus Area</span>
                    </div>
                  </div>
                </div>

                <div className="roadmap-external-links">
                  <h3>📚 Detailed Roadmaps</h3>
                  <p>Visit roadmap.sh for comprehensive guides:</p>
                  <div className="external-links-grid">
                    <a href="https://roadmap.sh/frontend" target="_blank" rel="noopener noreferrer" className="external-link-card">
                      <div className="link-icon">🎨</div>
                      <div className="link-content">
                        <h4>Frontend Roadmap</h4>
                        <p>Complete guide to frontend development</p>
                      </div>
                      <span className="link-arrow">→</span>
                    </a>
                    <a href="https://roadmap.sh/backend" target="_blank" rel="noopener noreferrer" className="external-link-card">
                      <div className="link-icon">⚙️</div>
                      <div className="link-content">
                        <h4>Backend Roadmap</h4>
                        <p>Complete guide to backend development</p>
                      </div>
                      <span className="link-arrow">→</span>
                    </a>
                    <a href="https://roadmap.sh/devops" target="_blank" rel="noopener noreferrer" className="external-link-card">
                      <div className="link-icon">🚀</div>
                      <div className="link-content">
                        <h4>DevOps Roadmap</h4>
                        <p>Complete guide to DevOps practices</p>
                      </div>
                      <span className="link-arrow">→</span>
                    </a>
                    <a href="https://roadmap.sh/python" target="_blank" rel="noopener noreferrer" className="external-link-card">
                      <div className="link-icon">🐍</div>
                      <div className="link-content">
                        <h4>Python Roadmap</h4>
                        <p>Complete guide to Python development</p>
                      </div>
                      <span className="link-arrow">→</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="step-navigation">
                <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  Next: Action Plan →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Action Plan */}
          {currentStep === 3 && (
            <div className="results-step">
              <div className="results-header">
                <h2>Your Action Plan</h2>
                <p>Concrete steps to improve your skills</p>
              </div>

              <div className="action-plan">
                <div className="plan-section">
                  <h3>Immediate Actions (This Week)</h3>
                  <div className="action-cards">
                    {skills.slice(0, 2).map((skill, index) => {
                      const score = skillScores[skill];
                      const recommendation = getRecommendation(skill, score);
                      return (
                        <div key={index} className="action-card">
                          <div className="action-number">{index + 1}</div>
                          <div className="action-content">
                            <h4>Focus on {skill}</h4>
                            <p>{recommendation.message}</p>
                            <div className="action-tasks">
                              {recommendation.tracker.tasks.slice(0, 2).map((task, i) => (
                                <label key={i} className="task-item">
                                  <input type="checkbox" />
                                  <span>{task}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="plan-section">
                  <h3>Short-term Goals (This Month)</h3>
                  <ul className="goals-list">
                    <li>Complete 3-5 projects using your target skills</li>
                    <li>Solve 20+ coding problems on LeetCode/HackerRank</li>
                    <li>Read documentation for all tested technologies</li>
                    <li>Join developer communities and contribute</li>
                  </ul>
                </div>

                <div className="plan-section">
                  <h3>Long-term Goals (Next 3 Months)</h3>
                  <ul className="goals-list">
                    <li>Build a portfolio with 5+ substantial projects</li>
                    <li>Contribute to open-source projects</li>
                    <li>Practice mock interviews weekly</li>
                    <li>Network with professionals in your field</li>
                  </ul>
                </div>
              </div>

              <div className="step-navigation">
                <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                  ← Back
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => onComplete(skillScores)}
                >
                  Save Results & Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentSkill = skills[currentSkillIndex];
  const questions = quizQuestions[currentSkill];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentSkillIndex * 4 + currentQuestionIndex) / (skills.length * 4)) * 100;

  return (
    <div className="skill-assessment-container">
      <div className="assessment-header">
        <h2>Skill Assessment Quiz</h2>
        <p>Testing: <strong>{currentSkill}</strong></p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-text">
          Question {currentQuestionIndex + 1} of {questions.length} | 
          Skill {currentSkillIndex + 1} of {skills.length}
        </p>
      </div>

      <div className="question-card">
        <div className="question-difficulty" data-difficulty={currentQuestion.difficulty}>
          {currentQuestion.difficulty.toUpperCase()}
        </div>
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => handleAnswer(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentQuiz;
