/**
 * Adaptive Quiz Engine for DEVA
 * 
 * Features:
 * 1. Difficulty adaptation based on user's existing skills
 * 2. Randomized question selection
 * 3. Large question bank to prevent repetition
 * 4. Skill gap analysis
 */

/**
 * Determine user's proficiency level based on their existing skills
 * @param {string} targetRole - The role user wants to learn
 * @param {Array} knownSkills - Skills user already knows
 * @param {string} assessmentSkill - The skill being assessed
 * @returns {string} - 'beginner', 'intermediate', or 'advanced'
 */
export const determineUserLevel = (targetRole, knownSkills, assessmentSkill) => {
  const normalizedKnownSkills = knownSkills.map(s => s.toLowerCase());
  const normalizedAssessmentSkill = assessmentSkill.toLowerCase();
  
  // Check if user already knows this skill
  const hasSkill = normalizedKnownSkills.some(skill => 
    skill.includes(normalizedAssessmentSkill) || 
    normalizedAssessmentSkill.includes(skill)
  );
  
  if (hasSkill) {
    // User claims to know this skill - give advanced questions
    return 'advanced';
  }
  
  // Check if skill is related to user's target role
  const roleSkillMap = {
    'frontend': ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'typescript'],
    'backend': ['python', 'node', 'java', 'sql', 'mongodb', 'postgresql', 'api'],
    'fullstack': ['javascript', 'react', 'node', 'sql', 'mongodb', 'api', 'html', 'css'],
    'data': ['python', 'pandas', 'numpy', 'sql', 'machine learning', 'tensorflow'],
    'devops': ['linux', 'docker', 'kubernetes', 'aws', 'terraform', 'ci/cd'],
    'mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'],
    'security': ['cybersecurity', 'owasp', 'penetration testing', 'network security']
  };
  
  const normalizedRole = targetRole.toLowerCase();
  const roleSkills = Object.keys(roleSkillMap).find(role => 
    normalizedRole.includes(role)
  );
  
  if (roleSkills && roleSkillMap[roleSkills]) {
    const isRoleRelated = roleSkillMap[roleSkills].some(skill => 
      normalizedAssessmentSkill.includes(skill) || 
      skill.includes(normalizedAssessmentSkill)
    );
    
    if (isRoleRelated) {
      // Skill is related to target role - give intermediate questions
      return 'intermediate';
    }
  }
  
  // Skill is new to user - give beginner questions
  return 'beginner';
};

/**
 * Select random questions based on difficulty level
 * @param {Array} allQuestions - All available questions for a skill
 * @param {string} difficultyLevel - 'beginner', 'intermediate', or 'advanced'
 * @param {number} count - Number of questions to select
 * @returns {Array} - Selected questions
 */
export const selectAdaptiveQuestions = (allQuestions, difficultyLevel, count = 5) => {
  // Filter questions by difficulty
  let filteredQuestions = [];
  
  if (difficultyLevel === 'beginner') {
    // 60% easy, 30% medium, 10% hard
    const easy = allQuestions.filter(q => q.difficulty === 'easy');
    const medium = allQuestions.filter(q => q.difficulty === 'medium');
    const hard = allQuestions.filter(q => q.difficulty === 'hard');
    
    filteredQuestions = [
      ...shuffleArray(easy).slice(0, Math.ceil(count * 0.6)),
      ...shuffleArray(medium).slice(0, Math.ceil(count * 0.3)),
      ...shuffleArray(hard).slice(0, Math.ceil(count * 0.1))
    ];
  } else if (difficultyLevel === 'intermediate') {
    // 20% easy, 50% medium, 30% hard
    const easy = allQuestions.filter(q => q.difficulty === 'easy');
    const medium = allQuestions.filter(q => q.difficulty === 'medium');
    const hard = allQuestions.filter(q => q.difficulty === 'hard');
    
    filteredQuestions = [
      ...shuffleArray(easy).slice(0, Math.ceil(count * 0.2)),
      ...shuffleArray(medium).slice(0, Math.ceil(count * 0.5)),
      ...shuffleArray(hard).slice(0, Math.ceil(count * 0.3))
    ];
  } else {
    // Advanced: 10% easy, 30% medium, 60% hard
    const easy = allQuestions.filter(q => q.difficulty === 'easy');
    const medium = allQuestions.filter(q => q.difficulty === 'medium');
    const hard = allQuestions.filter(q => q.difficulty === 'hard');
    
    filteredQuestions = [
      ...shuffleArray(easy).slice(0, Math.ceil(count * 0.1)),
      ...shuffleArray(medium).slice(0, Math.ceil(count * 0.3)),
      ...shuffleArray(hard).slice(0, Math.ceil(count * 0.6))
    ];
  }
  
  // Shuffle and limit to requested count
  return shuffleArray(filteredQuestions).slice(0, count);
};

/**
 * Fisher-Yates shuffle algorithm for randomization
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Shuffle options within a question
 * @param {Object} question - Question object
 * @returns {Object} - Question with shuffled options
 */
export const shuffleQuestionOptions = (question) => {
  if (!question.options || question.correct === -1) {
    // Don't shuffle self-assessment questions
    return question;
  }
  
  const correctAnswer = question.options[question.correct];
  const shuffledOptions = shuffleArray(question.options);
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
  
  return {
    ...question,
    options: shuffledOptions,
    correct: newCorrectIndex
  };
};

/**
 * Generate personalized quiz for a user
 * @param {Array} skills - Skills to assess
 * @param {string} targetRole - User's target role
 * @param {Array} knownSkills - User's existing skills
 * @param {Object} questionBank - All available questions
 * @returns {Object} - Personalized quiz questions
 */
export const generatePersonalizedQuiz = (skills, targetRole, knownSkills, questionBank) => {
  const personalizedQuiz = {};
  
  skills.forEach(skill => {
    // Determine user's level for this skill
    const userLevel = determineUserLevel(targetRole, knownSkills, skill);
    
    // Get all questions for this skill
    const allQuestions = questionBank[skill] || questionBank.default;
    
    // Select adaptive questions based on level
    const selectedQuestions = selectAdaptiveQuestions(allQuestions, userLevel, 5);
    
    // Shuffle options within each question
    const shuffledQuestions = selectedQuestions.map(shuffleQuestionOptions);
    
    personalizedQuiz[skill] = {
      questions: shuffledQuestions,
      userLevel: userLevel,
      totalQuestions: shuffledQuestions.length
    };
  });
  
  return personalizedQuiz;
};

/**
 * Calculate adaptive score with difficulty weighting
 * @param {Object} answers - User's answers
 * @param {Object} questions - Quiz questions
 * @returns {Object} - Detailed scores
 */
export const calculateAdaptiveScore = (answers, questions) => {
  const scores = {};
  
  Object.keys(questions).forEach(skill => {
    const skillQuestions = questions[skill].questions;
    let correct = 0;
    let total = 0;
    let weightedScore = 0;
    let maxWeight = 0;
    
    skillQuestions.forEach((q, index) => {
      const answerKey = `${skill}_${index}`;
      const answer = answers[answerKey];
      
      // Calculate weight based on difficulty
      const weight = q.difficulty === 'easy' ? 1 : 
                    q.difficulty === 'medium' ? 1.5 : 2;
      maxWeight += weight;
      
      if (answer) {
        total++;
        if (answer.selected === answer.correct || answer.correct === -1) {
          correct++;
          weightedScore += weight;
        }
      }
    });
    
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const weightedPercentage = maxWeight > 0 ? (weightedScore / maxWeight) * 100 : 0;
    
    scores[skill] = {
      correct,
      total,
      percentage: Math.round(percentage),
      weightedPercentage: Math.round(weightedPercentage),
      userLevel: questions[skill].userLevel,
      level: getSkillLevel(weightedPercentage)
    };
  });
  
  return scores;
};

/**
 * Determine skill level from percentage
 * @param {number} percentage - Score percentage
 * @returns {string} - Skill level
 */
const getSkillLevel = (percentage) => {
  if (percentage >= 80) return 'expert';
  if (percentage >= 60) return 'advanced';
  if (percentage >= 40) return 'intermediate';
  return 'beginner';
};

/**
 * Analyze skill gaps and provide recommendations
 * @param {Object} scores - User's scores
 * @param {string} targetRole - User's target role
 * @returns {Object} - Gap analysis and recommendations
 */
export const analyzeSkillGaps = (scores, targetRole) => {
  const gaps = {
    strong: [],
    needsWork: [],
    critical: [],
    recommendations: []
  };
  
  Object.entries(scores).forEach(([skill, score]) => {
    if (score.weightedPercentage >= 70) {
      gaps.strong.push({ skill, score: score.weightedPercentage });
    } else if (score.weightedPercentage >= 40) {
      gaps.needsWork.push({ skill, score: score.weightedPercentage });
    } else {
      gaps.critical.push({ skill, score: score.weightedPercentage });
    }
  });
  
  // Generate recommendations
  if (gaps.critical.length > 0) {
    gaps.recommendations.push({
      priority: 'high',
      message: `Focus on ${gaps.critical.map(g => g.skill).join(', ')} first. These are critical for ${targetRole}.`,
      action: 'Start with fundamentals and build projects'
    });
  }
  
  if (gaps.needsWork.length > 0) {
    gaps.recommendations.push({
      priority: 'medium',
      message: `Improve ${gaps.needsWork.map(g => g.skill).join(', ')} through practice.`,
      action: 'Complete intermediate tutorials and challenges'
    });
  }
  
  if (gaps.strong.length > 0) {
    gaps.recommendations.push({
      priority: 'low',
      message: `Great job on ${gaps.strong.map(g => g.skill).join(', ')}! Keep practicing.`,
      action: 'Work on advanced projects and contribute to open source'
    });
  }
  
  return gaps;
};

/**
 * SENTIMENT ANALYSIS & MOTIVATION ENGINE
 * Monitors user performance and provides encouragement to prevent demotivation
 */

/**
 * Analyze user's emotional state based on performance patterns
 * @param {Object} answerHistory - History of user's answers
 * @param {number} currentQuestionIndex - Current question number
 * @returns {Object} - Sentiment analysis result
 */
export const analyzeSentiment = (answerHistory, currentQuestionIndex) => {
  const recentAnswers = answerHistory.slice(-5); // Last 5 answers
  const correctCount = recentAnswers.filter(a => a.isCorrect).length;
  const incorrectStreak = getIncorrectStreak(answerHistory);
  const correctStreak = getCorrectStreak(answerHistory);
  
  // Calculate confidence score (0-100)
  const confidenceScore = (correctCount / Math.min(5, recentAnswers.length)) * 100;
  
  // Determine emotional state
  let sentiment = 'neutral';
  let needsEncouragement = false;
  let shouldEaseUp = false;
  let shouldChallenge = false;
  
  if (incorrectStreak >= 3) {
    sentiment = 'struggling';
    needsEncouragement = true;
    shouldEaseUp = true;
  } else if (incorrectStreak >= 2) {
    sentiment = 'challenged';
    needsEncouragement = true;
  } else if (correctStreak >= 3) {
    sentiment = 'confident';
    shouldChallenge = true;
  } else if (confidenceScore >= 80) {
    sentiment = 'excelling';
    shouldChallenge = true;
  } else if (confidenceScore <= 40) {
    sentiment = 'uncertain';
    needsEncouragement = true;
  }
  
  return {
    sentiment,
    confidenceScore: Math.round(confidenceScore),
    incorrectStreak,
    correctStreak,
    needsEncouragement,
    shouldEaseUp,
    shouldChallenge,
    recentPerformance: {
      correct: correctCount,
      total: recentAnswers.length
    }
  };
};

/**
 * Get current streak of incorrect answers
 * @param {Array} answerHistory - History of answers
 * @returns {number} - Streak count
 */
const getIncorrectStreak = (answerHistory) => {
  let streak = 0;
  for (let i = answerHistory.length - 1; i >= 0; i--) {
    if (!answerHistory[i].isCorrect) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Get current streak of correct answers
 * @param {Array} answerHistory - History of answers
 * @returns {number} - Streak count
 */
const getCorrectStreak = (answerHistory) => {
  let streak = 0;
  for (let i = answerHistory.length - 1; i >= 0; i--) {
    if (answerHistory[i].isCorrect) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Generate motivational message based on sentiment
 * @param {Object} sentimentData - Sentiment analysis result
 * @param {string} currentSkill - Current skill being assessed
 * @returns {Object} - Motivational message with styling
 */
export const getMotivationalMessage = (sentimentData, currentSkill) => {
  const { sentiment, correctStreak, incorrectStreak, confidenceScore } = sentimentData;
  
  const messages = {
    struggling: [
      {
        icon: '💪',
        title: 'Keep Going!',
        message: `${currentSkill} can be tricky, but you're learning! Every expert was once a beginner.`,
        tip: 'Take a deep breath. Focus on understanding, not just answering.',
        color: 'blue',
        encouragement: 'high'
      },
      {
        icon: '🌟',
        title: 'You\'re Doing Great!',
        message: 'These questions are challenging, but that means you\'re growing!',
        tip: 'Remember: Mistakes are proof you\'re trying. Keep it up!',
        color: 'purple',
        encouragement: 'high'
      },
      {
        icon: '🎯',
        title: 'Progress Over Perfection',
        message: `Learning ${currentSkill} takes time. You're on the right path!`,
        tip: 'Focus on learning, not just scores. You\'re building valuable skills.',
        color: 'green',
        encouragement: 'high'
      }
    ],
    challenged: [
      {
        icon: '🚀',
        title: 'You\'ve Got This!',
        message: 'These questions are testing your knowledge. Stay focused!',
        tip: 'Read each question carefully. You know more than you think!',
        color: 'blue',
        encouragement: 'medium'
      },
      {
        icon: '💡',
        title: 'Think It Through',
        message: 'Take your time. There\'s no rush to finish.',
        tip: 'Eliminate obviously wrong answers first, then choose the best option.',
        color: 'amber',
        encouragement: 'medium'
      }
    ],
    uncertain: [
      {
        icon: '🎓',
        title: 'Learning Mode Activated',
        message: `${currentSkill} is a journey, not a destination. You're making progress!`,
        tip: 'Every question teaches you something new.',
        color: 'indigo',
        encouragement: 'medium'
      }
    ],
    confident: [
      {
        icon: '🔥',
        title: `${correctStreak} in a Row!`,
        message: 'You\'re on fire! Keep up the excellent work!',
        tip: 'Your understanding of this topic is solid.',
        color: 'green',
        encouragement: 'low'
      },
      {
        icon: '⭐',
        title: 'Impressive!',
        message: `You're showing strong knowledge of ${currentSkill}!`,
        tip: 'Maintain this momentum!',
        color: 'yellow',
        encouragement: 'low'
      }
    ],
    excelling: [
      {
        icon: '🏆',
        title: 'Outstanding Performance!',
        message: `You're crushing it! ${confidenceScore}% confidence score!`,
        tip: 'You\'re ready for more advanced challenges.',
        color: 'gold',
        encouragement: 'low'
      },
      {
        icon: '🎖️',
        title: 'Expert Level!',
        message: 'Your mastery of this skill is evident. Excellent work!',
        tip: 'Consider helping others learn this skill!',
        color: 'gold',
        encouragement: 'low'
      }
    ],
    neutral: [
      {
        icon: '📚',
        title: 'Keep Learning!',
        message: 'You\'re making steady progress. Stay focused!',
        tip: 'Consistency is key to mastery.',
        color: 'blue',
        encouragement: 'low'
      }
    ]
  };
  
  const sentimentMessages = messages[sentiment] || messages.neutral;
  const randomMessage = sentimentMessages[Math.floor(Math.random() * sentimentMessages.length)];
  
  return randomMessage;
};

/**
 * Adjust question difficulty dynamically based on sentiment
 * @param {Array} remainingQuestions - Questions not yet asked
 * @param {Object} sentimentData - Sentiment analysis result
 * @returns {Object} - Next question to ask
 */
export const selectNextQuestionBySentiment = (remainingQuestions, sentimentData) => {
  if (remainingQuestions.length === 0) return null;
  
  const { shouldEaseUp, shouldChallenge } = sentimentData;
  
  if (shouldEaseUp) {
    // User is struggling - give easier question
    const easyQuestions = remainingQuestions.filter(q => q.difficulty === 'easy');
    const mediumQuestions = remainingQuestions.filter(q => q.difficulty === 'medium');
    
    if (easyQuestions.length > 0) {
      return easyQuestions[Math.floor(Math.random() * easyQuestions.length)];
    } else if (mediumQuestions.length > 0) {
      return mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)];
    }
  } else if (shouldChallenge) {
    // User is doing well - give harder question
    const hardQuestions = remainingQuestions.filter(q => q.difficulty === 'hard');
    const mediumQuestions = remainingQuestions.filter(q => q.difficulty === 'medium');
    
    if (hardQuestions.length > 0) {
      return hardQuestions[Math.floor(Math.random() * hardQuestions.length)];
    } else if (mediumQuestions.length > 0) {
      return mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)];
    }
  }
  
  // Default: return random question
  return remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
};

/**
 * Generate encouraging feedback after wrong answer
 * @param {string} skill - Current skill
 * @param {Object} question - The question that was answered incorrectly
 * @returns {Object} - Encouraging feedback
 */
export const getEncouragingFeedback = (skill, question) => {
  const feedbackOptions = [
    {
      message: 'Not quite, but you\'re learning!',
      tip: 'This is a tricky concept. Let\'s review it in your learning path.',
      icon: '💡'
    },
    {
      message: 'Close! This one catches many people.',
      tip: 'Understanding this will make you stronger in the long run.',
      icon: '🎯'
    },
    {
      message: 'That\'s okay! Even experts get these wrong sometimes.',
      tip: 'The fact that you\'re trying means you\'re growing.',
      icon: '🌱'
    },
    {
      message: 'Good attempt! This is an advanced concept.',
      tip: 'We\'ll make sure to cover this in your personalized roadmap.',
      icon: '📚'
    },
    {
      message: 'Don\'t worry! This is why we assess.',
      tip: 'Now we know exactly what to focus on in your learning journey.',
      icon: '🗺️'
    }
  ];
  
  return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
};

/**
 * Generate celebrating feedback after correct answer
 * @param {string} skill - Current skill
 * @param {Object} question - The question that was answered correctly
 * @returns {Object} - Celebrating feedback
 */
export const getCelebratingFeedback = (skill, question) => {
  const difficulty = question.difficulty;
  
  const feedbackByDifficulty = {
    easy: [
      { message: 'Correct! Nice work!', icon: '✅' },
      { message: 'That\'s right! You\'ve got the basics down!', icon: '👍' },
      { message: 'Perfect! Keep it up!', icon: '⭐' }
    ],
    medium: [
      { message: 'Excellent! You really know your stuff!', icon: '🎯' },
      { message: 'Great job! That was a solid answer!', icon: '💪' },
      { message: 'Impressive! You\'re showing strong understanding!', icon: '🌟' }
    ],
    hard: [
      { message: 'Wow! That was a tough one and you nailed it!', icon: '🏆' },
      { message: 'Outstanding! That\'s expert-level knowledge!', icon: '🎖️' },
      { message: 'Brilliant! You\'re mastering this skill!', icon: '🔥' }
    ]
  };
  
  const options = feedbackByDifficulty[difficulty] || feedbackByDifficulty.easy;
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Calculate motivation score (0-100) based on overall performance
 * @param {Object} scores - User's scores across all skills
 * @returns {Object} - Motivation analysis
 */
export const calculateMotivationScore = (scores) => {
  const skillScores = Object.values(scores);
  const avgScore = skillScores.reduce((sum, s) => sum + s.weightedPercentage, 0) / skillScores.length;
  
  // Count skills by level
  const expertCount = skillScores.filter(s => s.level === 'expert').length;
  const advancedCount = skillScores.filter(s => s.level === 'advanced').length;
  const intermediateCount = skillScores.filter(s => s.level === 'intermediate').length;
  const beginnerCount = skillScores.filter(s => s.level === 'beginner').length;
  
  // Calculate motivation score
  let motivationScore = avgScore;
  
  // Boost for having any strong skills
  if (expertCount > 0 || advancedCount > 0) {
    motivationScore += 10;
  }
  
  // Ensure score is between 0-100
  motivationScore = Math.min(100, Math.max(0, motivationScore));
  
  // Generate motivational summary
  let summary = '';
  let encouragement = '';
  
  if (motivationScore >= 80) {
    summary = 'You\'re doing amazing! Your skills are interview-ready!';
    encouragement = 'Keep practicing and you\'ll be unstoppable!';
  } else if (motivationScore >= 60) {
    summary = 'Great progress! You\'re well on your way to mastery!';
    encouragement = 'Focus on your weaker areas and you\'ll reach expert level soon!';
  } else if (motivationScore >= 40) {
    summary = 'You\'re building a solid foundation!';
    encouragement = 'Keep learning consistently and you\'ll see rapid improvement!';
  } else {
    summary = 'You\'re at the start of an exciting journey!';
    encouragement = 'Every expert was once a beginner. You\'ve got this!';
  }
  
  return {
    motivationScore: Math.round(motivationScore),
    summary,
    encouragement,
    strengths: {
      expert: expertCount,
      advanced: advancedCount,
      intermediate: intermediateCount,
      beginner: beginnerCount
    },
    totalSkills: skillScores.length
  };
};
