"""
Generate synthetic training data for Resume Tip Recommender
Creates 100+ diverse training samples
"""
import json
import random

# Role templates with typical characteristics - ALL 33 ROLES
ROLE_TEMPLATES = {
    # Web Development (3)
    "Frontend Developer": {
        "skills": [
            ["HTML", "CSS", "JavaScript"],
            ["React", "Vue.js", "TypeScript"],
            ["HTML", "CSS", "JavaScript", "React", "Redux"],
            ["Angular", "TypeScript", "SCSS"],
            ["Vue.js", "Nuxt.js", "Tailwind CSS"]
        ],
        "project_types": ["Portfolio Website", "E-commerce Frontend", "Dashboard UI", "Landing Page", "SPA Application"],
        "typical_tips": [1, 2, 6, 7, 10, 11]
    },
    "Backend Developer": {
        "skills": [
            ["Python", "Django", "PostgreSQL"],
            ["Node.js", "Express", "MongoDB"],
            ["Java", "Spring Boot", "MySQL"],
            ["Python", "FastAPI", "Redis"],
            ["Go", "Gin", "PostgreSQL"]
        ],
        "project_types": ["REST API", "Microservices", "Authentication System", "Payment Gateway", "Real-time Chat"],
        "typical_tips": [1, 4, 7, 10, 11]
    },
    "Full Stack Developer": {
        "skills": [
            ["React", "Node.js", "MongoDB", "Express"],
            ["Vue.js", "Python", "Django", "PostgreSQL"],
            ["Angular", "Java", "Spring Boot", "MySQL"],
            ["Next.js", "Node.js", "PostgreSQL", "Redis"],
            ["React", "Python", "FastAPI", "MongoDB"]
        ],
        "project_types": ["Social Media App", "E-commerce Platform", "Project Management Tool", "Blog Platform", "Booking System"],
        "typical_tips": [1, 4, 6, 9, 11]
    },
    
    # Data & AI (4)
    "Data Scientist": {
        "skills": [
            ["Python", "Pandas", "NumPy", "Scikit-learn"],
            ["Python", "TensorFlow", "Keras", "Matplotlib"],
            ["R", "ggplot2", "dplyr", "Machine Learning"],
            ["Python", "PyTorch", "OpenCV", "Deep Learning"],
            ["Python", "Spark", "SQL", "Data Visualization"]
        ],
        "project_types": ["Sentiment Analysis", "Recommendation System", "Image Classification", "Time Series Forecasting", "Customer Segmentation"],
        "typical_tips": [1, 3, 5, 12]
    },
    "Machine Learning Engineer": {
        "skills": [
            ["Python", "TensorFlow", "PyTorch", "MLOps"],
            ["Python", "Scikit-learn", "Docker", "Kubernetes"],
            ["Python", "Deep Learning", "AWS", "SageMaker"],
            ["TensorFlow", "Keras", "Flask", "Docker"],
            ["PyTorch", "FastAPI", "MLflow", "Cloud"]
        ],
        "project_types": ["ML Model Deployment", "Computer Vision System", "NLP Application", "Recommendation Engine", "AutoML Pipeline"],
        "typical_tips": [1, 3, 4, 7, 12]
    },
    "Data Engineer": {
        "skills": [
            ["Python", "SQL", "Spark", "Airflow"],
            ["Python", "Kafka", "ETL", "Data Warehousing"],
            ["Scala", "Spark", "Hadoop", "Hive"],
            ["Python", "AWS", "Redshift", "S3"],
            ["SQL", "dbt", "Snowflake", "Python"]
        ],
        "project_types": ["Data Pipeline", "ETL System", "Data Warehouse", "Real-time Processing", "Data Lake"],
        "typical_tips": [1, 4, 7, 10]
    },
    "AI Researcher": {
        "skills": [
            ["Python", "PyTorch", "Research", "Mathematics"],
            ["TensorFlow", "Deep Learning", "NLP", "Papers"],
            ["Python", "Computer Vision", "GANs", "Research"],
            ["PyTorch", "Reinforcement Learning", "Research", "Mathematics"],
            ["Python", "Transformers", "BERT", "Research"]
        ],
        "project_types": ["Research Paper Implementation", "Novel Algorithm", "Benchmark Study", "Model Architecture", "AI Experiment"],
        "typical_tips": [1, 3, 5, 12]
    },
    
    # Infrastructure & Cloud (4)
    "DevOps Engineer": {
        "skills": [
            ["Docker", "Kubernetes", "AWS", "Terraform"],
            ["Jenkins", "GitLab CI", "Ansible", "Linux"],
            ["Azure", "Docker", "CI/CD", "Monitoring"],
            ["AWS", "CloudFormation", "Python", "Bash"],
            ["GCP", "Kubernetes", "Helm", "Prometheus"]
        ],
        "project_types": ["CI/CD Pipeline", "Infrastructure as Code", "Container Orchestration", "Monitoring System", "Auto-scaling Setup"],
        "typical_tips": [1, 4, 7, 10]
    },
    "Cloud Architect": {
        "skills": [
            ["AWS", "Azure", "GCP", "Terraform"],
            ["Cloud Architecture", "Kubernetes", "Networking", "Security"],
            ["AWS", "Serverless", "Lambda", "API Gateway"],
            ["Azure", "ARM Templates", "DevOps", "Security"],
            ["Multi-cloud", "Cost Optimization", "Architecture", "Monitoring"]
        ],
        "project_types": ["Cloud Migration", "Multi-cloud Architecture", "Serverless Application", "Cloud Security", "Cost Optimization"],
        "typical_tips": [1, 3, 4, 9]
    },
    "Site Reliability Engineer": {
        "skills": [
            ["Linux", "Kubernetes", "Monitoring", "Python"],
            ["SLOs", "Incident Response", "Automation", "Observability"],
            ["Prometheus", "Grafana", "Kubernetes", "Terraform"],
            ["Performance", "Reliability", "Monitoring", "Scripting"],
            ["On-call", "Debugging", "Distributed Systems", "Automation"]
        ],
        "project_types": ["Monitoring System", "Incident Response", "Performance Optimization", "SLO Implementation", "Reliability Improvement"],
        "typical_tips": [1, 4, 7, 10]
    },
    "Platform Engineer": {
        "skills": [
            ["Kubernetes", "Docker", "CI/CD", "Infrastructure as Code"],
            ["Developer Tools", "Automation", "Cloud", "APIs"],
            ["Internal Platforms", "Self-service", "Kubernetes", "Terraform"],
            ["GitOps", "ArgoCD", "Kubernetes", "Monitoring"],
            ["Platform APIs", "Developer Experience", "Automation", "Cloud"]
        ],
        "project_types": ["Internal Platform", "Developer Portal", "Self-service Infrastructure", "Platform API", "Automation Framework"],
        "typical_tips": [1, 4, 7, 10]
    },
    
    # Mobile & Desktop (4)
    "Mobile Developer": {
        "skills": [
            ["React Native", "JavaScript", "Redux"],
            ["Flutter", "Dart", "Firebase"],
            ["Swift", "iOS", "UIKit"],
            ["Kotlin", "Android", "Jetpack Compose"],
            ["React Native", "TypeScript", "Expo"]
        ],
        "project_types": ["Social Media App", "E-commerce App", "Fitness Tracker", "Chat Application", "Food Delivery App"],
        "typical_tips": [1, 6, 11]
    },
    "iOS Developer": {
        "skills": [
            ["Swift", "SwiftUI", "UIKit", "Xcode"],
            ["iOS SDK", "Core Data", "Combine", "Swift"],
            ["SwiftUI", "MVVM", "REST APIs", "Git"],
            ["Objective-C", "Swift", "iOS", "CocoaPods"],
            ["Swift", "ARKit", "Core ML", "iOS"]
        ],
        "project_types": ["iOS App", "SwiftUI App", "AR Experience", "Core ML App", "iOS Game"],
        "typical_tips": [1, 6, 11]
    },
    "Android Developer": {
        "skills": [
            ["Kotlin", "Java", "Android SDK", "Jetpack Compose"],
            ["Android", "Room", "Retrofit", "MVVM"],
            ["Kotlin", "Coroutines", "Flow", "Android"],
            ["Java", "Android", "Firebase", "Material Design"],
            ["Kotlin", "Jetpack", "Compose", "Testing"]
        ],
        "project_types": ["Android App", "Jetpack Compose App", "Material Design App", "Firebase App", "Android Game"],
        "typical_tips": [1, 6, 11]
    },
    "Desktop Application Developer": {
        "skills": [
            ["Electron", "JavaScript", "Node.js", "React"],
            ["C#", ".NET", "WPF", "XAML"],
            ["Qt", "C++", "Cross-platform", "GUI"],
            ["Java", "JavaFX", "Swing", "Desktop"],
            ["Python", "PyQt", "Tkinter", "Desktop"]
        ],
        "project_types": ["Desktop App", "Cross-platform Tool", "System Utility", "Desktop Dashboard", "Native Application"],
        "typical_tips": [1, 6, 11]
    },
    
    # Security & Testing (4)
    "Security Engineer": {
        "skills": [
            ["Cybersecurity", "Penetration Testing", "OWASP", "Linux"],
            ["Network Security", "Cryptography", "Python", "Security Tools"],
            ["Security Auditing", "Compliance", "Incident Response", "SIEM"],
            ["Web Security", "API Security", "Cloud Security", "DevSecOps"],
            ["Threat Modeling", "Security Testing", "Vulnerability Assessment", "Python"]
        ],
        "project_types": ["Security Audit", "Penetration Test", "Security Tool", "Compliance Implementation", "Incident Response"],
        "typical_tips": [1, 3, 4, 7]
    },
    "Penetration Tester": {
        "skills": [
            ["Ethical Hacking", "Kali Linux", "Metasploit", "Burp Suite"],
            ["OWASP", "Network Security", "Web Security", "Scripting"],
            ["Penetration Testing", "Vulnerability Assessment", "Reporting", "Python"],
            ["Red Team", "Social Engineering", "Exploitation", "Tools"],
            ["Bug Bounty", "Web Hacking", "Network Hacking", "Certifications"]
        ],
        "project_types": ["Penetration Test", "Security Assessment", "Vulnerability Report", "Red Team Exercise", "Bug Bounty"],
        "typical_tips": [1, 3, 4, 8]
    },
    "QA Engineer": {
        "skills": [
            ["Testing", "Selenium", "Jest", "Cypress"],
            ["Test Automation", "Bug Tracking", "CI/CD", "API Testing"],
            ["Manual Testing", "Test Cases", "Jira", "Agile"],
            ["Performance Testing", "Load Testing", "JMeter", "Testing"],
            ["Mobile Testing", "Appium", "Test Automation", "CI/CD"]
        ],
        "project_types": ["Test Automation Framework", "API Testing Suite", "Performance Test", "Mobile Testing", "CI/CD Integration"],
        "typical_tips": [1, 4, 7, 10]
    },
    "SDET (Test Automation)": {
        "skills": [
            ["Java", "Python", "Selenium", "TestNG"],
            ["Test Automation", "CI/CD", "API Testing", "Git"],
            ["Python", "Pytest", "REST APIs", "Docker"],
            ["Java", "Cucumber", "BDD", "Automation"],
            ["JavaScript", "Cypress", "Jest", "Testing"]
        ],
        "project_types": ["Test Framework", "API Automation", "E2E Testing", "Performance Testing", "CI/CD Pipeline"],
        "typical_tips": [1, 4, 7, 10]
    },
    
    # Design & Product (3)
    "UI/UX Designer": {
        "skills": [
            ["Figma", "Adobe XD", "User Research", "Prototyping"],
            ["Sketch", "Wireframing", "Design Systems", "Accessibility"],
            ["Figma", "User Testing", "Design Thinking", "HTML/CSS"],
            ["Adobe XD", "Prototyping", "User Flows", "Visual Design"],
            ["Figma", "Design Systems", "Component Libraries", "Collaboration"]
        ],
        "project_types": ["UI Design", "UX Research", "Design System", "Prototype", "User Testing"],
        "typical_tips": [1, 6, 8, 11]
    },
    "Product Designer": {
        "skills": [
            ["Figma", "User Research", "Prototyping", "Design Thinking"],
            ["User Testing", "Design Systems", "Interaction Design", "Metrics"],
            ["Product Strategy", "User Flows", "Visual Design", "Collaboration"],
            ["Design Thinking", "A/B Testing", "Analytics", "Figma"],
            ["End-to-end Design", "User Research", "Prototyping", "Testing"]
        ],
        "project_types": ["Product Design", "User Research Study", "Design System", "Product Strategy", "User Testing"],
        "typical_tips": [1, 6, 8, 9]
    },
    "Technical Product Manager": {
        "skills": [
            ["Product Strategy", "Roadmapping", "Agile", "SQL"],
            ["User Stories", "Analytics", "Technical Knowledge", "Communication"],
            ["Product Management", "Prioritization", "Stakeholder Management", "Data"],
            ["Agile", "Scrum", "Product Vision", "Technical Skills"],
            ["Roadmapping", "Metrics", "User Research", "Technical Communication"]
        ],
        "project_types": ["Product Launch", "Feature Roadmap", "User Research", "Product Strategy", "Stakeholder Management"],
        "typical_tips": [1, 4, 8, 9]
    },
    
    # Specialized Development (5)
    "Game Developer": {
        "skills": [
            ["Unity", "C#", "Game Physics", "3D Modeling"],
            ["Unreal Engine", "C++", "Blueprints", "Game Design"],
            ["Unity", "Game Design", "Animation", "Multiplayer"],
            ["Godot", "GDScript", "2D Games", "Game Mechanics"],
            ["Unity", "VR", "AR", "Game Development"]
        ],
        "project_types": ["2D Game", "3D Game", "Mobile Game", "VR Game", "Multiplayer Game"],
        "typical_tips": [1, 6, 8, 11]
    },
    "Blockchain Developer": {
        "skills": [
            ["Solidity", "Ethereum", "Smart Contracts", "Web3"],
            ["Blockchain", "DeFi", "JavaScript", "Node.js"],
            ["Solidity", "Truffle", "Hardhat", "Testing"],
            ["Web3.js", "Ethers.js", "React", "Blockchain"],
            ["Smart Contracts", "Security", "Auditing", "Solidity"]
        ],
        "project_types": ["Smart Contract", "DApp", "DeFi Protocol", "NFT Platform", "Blockchain Integration"],
        "typical_tips": [1, 3, 6, 11]
    },
    "Embedded Systems Engineer": {
        "skills": [
            ["C", "C++", "Embedded C", "Microcontrollers"],
            ["RTOS", "Hardware", "Debugging", "Protocols"],
            ["ARM", "Embedded Linux", "Device Drivers", "C"],
            ["IoT", "Sensors", "Communication Protocols", "C++"],
            ["Firmware", "Hardware Integration", "Testing", "C"]
        ],
        "project_types": ["Embedded System", "IoT Device", "Firmware", "Hardware Integration", "Real-time System"],
        "typical_tips": [1, 4, 7, 11]
    },
    "AR/VR Developer": {
        "skills": [
            ["Unity", "C#", "ARKit", "ARCore"],
            ["Unreal Engine", "VR SDKs", "3D Graphics", "C++"],
            ["Unity", "Spatial Computing", "VR", "Optimization"],
            ["AR Foundation", "Unity", "Mobile AR", "3D"],
            ["VR Development", "Oculus", "SteamVR", "Unity"]
        ],
        "project_types": ["AR Application", "VR Experience", "Mixed Reality", "AR Game", "VR Training"],
        "typical_tips": [1, 6, 8, 11]
    },
    "Robotics Engineer": {
        "skills": [
            ["ROS", "Python", "C++", "Computer Vision"],
            ["Control Systems", "Sensors", "Kinematics", "Machine Learning"],
            ["ROS2", "Simulation", "Hardware", "Python"],
            ["Robotics", "Path Planning", "SLAM", "C++"],
            ["Robot Programming", "Sensors", "Actuators", "Control"]
        ],
        "project_types": ["Robot System", "Autonomous Navigation", "Computer Vision", "Simulation", "Hardware Integration"],
        "typical_tips": [1, 4, 7, 11]
    },
    
    # Database & Backend Specialized (3)
    "Database Administrator": {
        "skills": [
            ["SQL", "PostgreSQL", "MySQL", "Performance Tuning"],
            ["Database Design", "Backup & Recovery", "Security", "Monitoring"],
            ["Oracle", "SQL Server", "Administration", "Optimization"],
            ["MongoDB", "NoSQL", "Replication", "Sharding"],
            ["Database Security", "High Availability", "Disaster Recovery", "SQL"]
        ],
        "project_types": ["Database Optimization", "Migration", "Backup System", "High Availability", "Performance Tuning"],
        "typical_tips": [1, 4, 7, 10]
    },
    "API Developer": {
        "skills": [
            ["REST", "GraphQL", "Node.js", "API Design"],
            ["Python", "FastAPI", "Authentication", "Documentation"],
            ["API Gateway", "Microservices", "Security", "Testing"],
            ["OpenAPI", "Swagger", "API Versioning", "Node.js"],
            ["REST APIs", "Rate Limiting", "Caching", "Monitoring"]
        ],
        "project_types": ["REST API", "GraphQL API", "API Gateway", "Microservices", "API Documentation"],
        "typical_tips": [1, 4, 7, 10, 11]
    },
    "Microservices Architect": {
        "skills": [
            ["Microservices", "Docker", "Kubernetes", "API Gateway"],
            ["Service Mesh", "Event-Driven", "Distributed Systems", "Monitoring"],
            ["Architecture Patterns", "Docker", "Kubernetes", "Security"],
            ["Microservices Design", "Communication", "Resilience", "Observability"],
            ["Distributed Systems", "Scalability", "Reliability", "Architecture"]
        ],
        "project_types": ["Microservices Architecture", "Service Mesh", "Event-Driven System", "API Gateway", "Distributed System"],
        "typical_tips": [1, 4, 7, 9]
    },
    
    # Emerging Technologies (3)
    "IoT Developer": {
        "skills": [
            ["Embedded Systems", "MQTT", "IoT Protocols", "Python"],
            ["Sensors", "Cloud", "Edge Computing", "C"],
            ["IoT Platforms", "AWS IoT", "Azure IoT", "Data Processing"],
            ["Arduino", "Raspberry Pi", "IoT", "Networking"],
            ["IoT Security", "Device Management", "Data Analytics", "Cloud"]
        ],
        "project_types": ["IoT System", "Smart Device", "Sensor Network", "IoT Platform", "Edge Computing"],
        "typical_tips": [1, 4, 7, 11]
    },
    "Quantum Computing Engineer": {
        "skills": [
            ["Quantum Algorithms", "Qiskit", "Linear Algebra", "Python"],
            ["Quantum Gates", "Quantum Circuits", "Mathematics", "Physics"],
            ["Quantum Programming", "Optimization", "Research", "Python"],
            ["Quantum Machine Learning", "Qiskit", "Algorithms", "Mathematics"],
            ["Quantum Computing", "Cirq", "Research", "Physics"]
        ],
        "project_types": ["Quantum Algorithm", "Quantum Circuit", "Research Project", "Quantum Optimization", "QML Application"],
        "typical_tips": [1, 3, 5, 12]
    },
    "Edge Computing Engineer": {
        "skills": [
            ["Edge Computing", "IoT", "Distributed Systems", "Docker"],
            ["Low Latency", "Kubernetes", "Networking", "Cloud"],
            ["Edge Platforms", "5G", "Real-time Processing", "Security"],
            ["Edge AI", "TensorFlow Lite", "Optimization", "IoT"],
            ["Distributed Computing", "Edge Orchestration", "Monitoring", "Security"]
        ],
        "project_types": ["Edge Platform", "Edge AI", "Distributed System", "Real-time Processing", "Edge Orchestration"],
        "typical_tips": [1, 4, 7, 11]
    }
}

def generate_project(role, has_metrics):
    """Generate a project based on role"""
    project_type = random.choice(ROLE_TEMPLATES[role]["project_types"])
    
    metrics = [
        "serving 10,000+ users",
        "with 99.9% uptime",
        "processing 1M+ requests/day",
        "reducing load time by 40%",
        "handling 50K concurrent users",
        "achieving 95% accuracy",
        "increasing conversion by 25%",
        "deployed on AWS with auto-scaling"
    ]
    
    if has_metrics:
        metric = random.choice(metrics)
        description = f"{project_type} {metric}"
    else:
        description = f"Built a {project_type}"
    
    return {"name": project_type, "description": description}

def generate_training_sample(role, experience_level):
    """Generate a single training sample"""
    template = ROLE_TEMPLATES[role]
    
    # Select skills
    skills = random.choice(template["skills"])
    
    # Experience-based characteristics
    if experience_level == "junior":
        exp_years = random.randint(0, 1)
        num_projects = random.randint(1, 2)
        has_github = random.choice([True, False])
        has_portfolio = False
        has_certifications = False
        has_metrics = False
    elif experience_level == "mid":
        exp_years = random.randint(2, 4)
        num_projects = random.randint(2, 4)
        has_github = True
        has_portfolio = random.choice([True, False])
        has_certifications = random.choice([True, False])
        has_metrics = True
    else:  # senior
        exp_years = random.randint(5, 10)
        num_projects = random.randint(4, 6)
        has_github = True
        has_portfolio = True
        has_certifications = True
        has_metrics = True
    
    # Generate projects
    projects = [generate_project(role, has_metrics) for _ in range(num_projects)]
    
    # Determine recommended tips based on profile
    recommended_tips = []
    priority_tips = []
    
    # Rule-based tip selection
    if num_projects > 0 and not has_metrics:
        recommended_tips.extend([1, 11])  # Add metrics, deploy projects
        priority_tips.append(1)
    
    if not has_github:
        recommended_tips.append(2)  # Open source
        priority_tips.append(2)
    
    if not has_certifications:
        recommended_tips.append(3)  # Certifications
    
    if exp_years > 0 or num_projects > 0:
        recommended_tips.append(4)  # Action verbs
        if exp_years > 0:
            priority_tips.append(4)
    
    if role in ["Data Scientist", "Machine Learning Engineer"]:
        recommended_tips.append(12)  # AI/ML
        priority_tips.append(12)
    
    if not has_portfolio and role in ["Frontend Developer", "Full Stack Developer", "Mobile Developer"]:
        recommended_tips.append(6)  # Portfolio
        priority_tips.append(6)
    
    if len(skills) > 0:
        recommended_tips.append(7)  # Specific tools
    
    if exp_years > 1:
        recommended_tips.append(9)  # Leadership
    
    if has_github:
        recommended_tips.append(10)  # GitHub stats
    
    recommended_tips.append(5)  # Technical blog
    recommended_tips.append(8)  # Hackathons
    
    # Remove duplicates and limit
    recommended_tips = list(set(recommended_tips))[:6]
    priority_tips = list(set(priority_tips))[:3]
    
    # Calculate effectiveness score
    effectiveness = 0.7 + (exp_years * 0.02) + (num_projects * 0.03)
    if has_github:
        effectiveness += 0.05
    if has_portfolio:
        effectiveness += 0.05
    if has_certifications:
        effectiveness += 0.03
    effectiveness = min(effectiveness, 0.98)
    
    return {
        "resume_features": {
            "role": role,
            "skills": skills,
            "projects": projects,
            "experience_years": exp_years,
            "has_github": has_github,
            "has_portfolio": has_portfolio,
            "has_certifications": has_certifications,
            "has_quantifiable_metrics": has_metrics
        },
        "recommended_tips": recommended_tips,
        "priority_tips": priority_tips,
        "effectiveness_score": round(effectiveness, 2)
    }

def generate_dataset(num_samples=100):
    """Generate complete training dataset"""
    training_data = []
    
    roles = list(ROLE_TEMPLATES.keys())
    experience_levels = ["junior", "mid", "senior"]
    
    # Distribute samples across roles and experience levels
    samples_per_combo = num_samples // (len(roles) * len(experience_levels))
    
    for role in roles:
        for exp_level in experience_levels:
            for _ in range(samples_per_combo):
                sample = generate_training_sample(role, exp_level)
                training_data.append(sample)
    
    # Add remaining samples randomly
    remaining = num_samples - len(training_data)
    for _ in range(remaining):
        role = random.choice(roles)
        exp_level = random.choice(experience_levels)
        sample = generate_training_sample(role, exp_level)
        training_data.append(sample)
    
    return training_data

# Generate dataset
print("Generating large training dataset (this may take 2-3 minutes)...")
training_data = generate_dataset(50000)  # 50,000 samples for production-grade ML training

# Tip metadata
tip_metadata = {
    "1": {"category": "Projects", "impact_score": 0.95, "applicable_roles": ["all"]},
    "2": {"category": "Projects", "impact_score": 0.90, "applicable_roles": ["all"]},
    "3": {"category": "Skills", "impact_score": 0.85, "applicable_roles": ["all"]},
    "4": {"category": "Experience", "impact_score": 0.92, "applicable_roles": ["all"]},
    "5": {"category": "Technical", "impact_score": 0.80, "applicable_roles": ["all"]},
    "6": {"category": "Projects", "impact_score": 0.93, "applicable_roles": ["Frontend Developer", "Backend Developer", "Full Stack Developer"]},
    "7": {"category": "Skills", "impact_score": 0.82, "applicable_roles": ["all"]},
    "8": {"category": "Achievement", "impact_score": 0.78, "applicable_roles": ["all"]},
    "9": {"category": "Leadership", "impact_score": 0.88, "applicable_roles": ["all"]},
    "10": {"category": "Technical", "impact_score": 0.91, "applicable_roles": ["all"]},
    "11": {"category": "Projects", "impact_score": 0.94, "applicable_roles": ["all"]},
    "12": {"category": "Skills", "impact_score": 0.96, "applicable_roles": ["Data Scientist", "Machine Learning Engineer"]}
}

# Save to file
output = {
    "training_data": training_data,
    "tip_metadata": tip_metadata,
    "dataset_info": {
        "total_samples": len(training_data),
        "roles": list(ROLE_TEMPLATES.keys()),
        "generated_date": "2026-02-16"
    }
}

with open('resume_tips_training_data.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✅ Generated {len(training_data)} training samples")
print(f"✅ Saved to resume_tips_training_data.json")
