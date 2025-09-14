// Onboarding Questionnaire Types - Matching Backend Schema

export interface OnboardingQuestionOption {
  id: string;
  text: string;
  value: string;
}

export interface OnboardingQuestion {
  questionId: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  category: string;
  ageGroup: '3-5' | '6-8' | '9-12' | '13-15' | '16-18';
  learningDomain: string;
  options?: OnboardingQuestionOption[];
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingResponse {
  questionId: string;
  answer: string;
  optionId?: string; // For multiple choice questions
  answeredAt: Date;
}

export interface Child {
  id: string; // Changed from childId to id to match backend
  displayName: string;
  age: number;
  gender: string;
  dateOfBirth: { seconds: number; nanoseconds: number }; // Firestore Timestamp
  imageUrl?: string;
  chosenCareer?: string;
  meta?: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface OnboardingQuestionnaire {
  questionnaireId: string;
  parentId: string;
  childId: string;
  child: Child;
  questions: OnboardingQuestion[];
  responses: OnboardingResponse[];
  status: 'pending' | 'in_progress' | 'completed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalQuestions: number;
  completedQuestions: number;
  maxQuestions: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Onboarding Answer Submission
export interface OnboardingAnswerData {
  questionId: string;
  answer: string;
  optionId?: string;
}

// Next Question Response (when auto-generated)
export interface NextQuestionResponse {
  questionId: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  category: string;
  ageGroup: '3-5' | '6-8' | '9-12' | '13-15' | '16-18';
  learningDomain: string;
  options?: OnboardingQuestionOption[];
  required: boolean;
  order: number;
}

// Onboarding Answer Response
export interface OnboardingAnswerResponse {
  questionnaireId: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  completedQuestions: number;
  totalQuestions: number;
  isCompleted: boolean;
  lastResponse: any;
  nextQuestion?: NextQuestionResponse;
  questionnaireCompleted: boolean;
  childOnboarded: boolean;
}

// Weekly Interest Types - Matching Backend Schema
export interface WeeklyInterestQuestion {
  id: string;
  question: string;
  options: string[];
  selectedAnswer?: string;
  selectedIndex?: number;
}

export interface WeeklyInterestResponse {
  questionId: string;
  selectedAnswer: string;
  selectedIndex: number;
}

export interface WeeklyInterestData {
  interestId: string;
  week: string;
  title: string;
  description: string;
  questions: WeeklyInterestQuestion[];
  status: 'pending' | 'in_progress' | 'completed';
  childId: string;
  parentId: string;
  responses?: WeeklyInterestResponse[];
  completedAt?: string;
  updatedAt?: string;
}

// Weekly Quiz Types - Matching Backend Schema
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: {
    value: string;
    index: number;
  };
  selectedAnswer?: string;
  topic?: string;
  explanation?: string;
  mappedDomain?: string;
}

export interface WeeklyQuizData {
  quizId: string;
  week: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  childId: string;
  parentId: string;
  completedAt?: string;
  timeRemaining?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Weekly Potential Types - Matching Backend Schema
export interface WeeklyPotentialQuestion {
  id: string;
  question: string;
  context: string;
  options: string[];
  selectedAnswer?: string;
  selectedIndex?: number;
}

export interface WeeklyPotentialData {
  potentialId: string;
  week: string;
  title: string;
  description: string;
  questions: WeeklyPotentialQuestion[];
  status: 'pending' | 'in_progress' | 'completed';
  childId: string;
  parentId: string;
  completedAt?: string;
  updatedAt?: string;
}

// Daily Task Types - Matching Backend Schema
export interface DailyTaskData {
  activityType: string;
  description: string;
  difficulty: string;
  domain: string;
  duration: number;
  instructions: string[];
  learningObjective: string;
  materials: string[];
  title: string;
  longTermPathway: string;
}

export interface DailyTask {
  taskId: string;
  date: Date;
  data: DailyTaskData;
  status: 'pending' | 'completed' | 'skipped';
  childId: string;
  parentId: string;
}

// API Response for Daily Task
export interface DailyTaskResponse {
  taskId: string;
  date: string;
  data: DailyTaskData;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  childId: string;
  parentId: string;
  response?: string;
  completedAt?: string;
  updatedAt?: string;
}

// Spark Interest Types - Matching Backend Schema
export interface CareerPath {
  id: string;
  name: string;
  category: string;
  description: string;
  skills: string[];
  activities: string[];
}

export interface SparkInterestData {
  selectedCareer?: CareerPath;
  customGoal?: string;
}

export interface SparkInterest {
  id: string;
  childId: string;
  parentId: string;
  data: SparkInterestData;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface ActivityStatus {
  status: 'completed' | 'pending' | 'available' | 'coming-soon';
  lastCompleted?: string;
  streak?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ChildStreak {
  current: number;
  longest: number;
  lastActivityDate?: string;
}

export interface DashboardChild {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  imageURL?: string;
  streak: ChildStreak;
}

export interface DashboardActivities {
  dailyTask: ActivityStatus;
  weeklyInterest: ActivityStatus;
  weeklyPotential: ActivityStatus;
  weeklyQuiz: ActivityStatus;
  careerInsights: ActivityStatus;
  sparkInterest: ActivityStatus;
}

export interface DashboardData {
  child: DashboardChild;
  activities: DashboardActivities;
}
