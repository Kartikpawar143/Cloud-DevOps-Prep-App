export type ExperienceLevel = 'fresher' | 'mid' | 'senior';

export type ModuleId = 
  | 'cloud-fundamentals'
  | 'aws'
  | 'azure'
  | 'linux'
  | 'networking'
  | 'docker'
  | 'kubernetes'
  | 'terraform'
  | 'monitoring'
  | 'security'
  | string;

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'scenario'
  | 'troubleshooting'
  | 'architecture';

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;
  questionCount: number;
}

export interface Question {
  id: string;
  moduleId: ModuleId;
  difficulty: DifficultyLevel;
  question: string;
  explanation: string;
  example: string;
  productionUseCase: string;
  commonMistakes: string[];
  interviewerExpects: string[];
  followUpQuestions: string[];
  keywords: string[];
  isUserCreated?: boolean;
  userId?: string;
  createdAt?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  questionId: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  completedAt?: string;
  skippedCount?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  experienceLevel: ExperienceLevel;
  preferredCloud: 'aws' | 'azure' | 'gcp' | 'all';
  createdAt: string;
}

export interface CaseStudy {
  id: string;
  moduleId: ModuleId;
  title: string;
  problemStatement: string;
  architectureExplanation: string;
  componentBreakdown: string[];
  tradeOffs: string[];
  scalabilityStrategy: string;
  failureScenarios: string[];
  costConsiderations: string[];
  targetLevel: 'senior' | 'staff' | 'principal';
}

export interface MockInterviewConfig {
  duration: 30 | 45 | 60;
  moduleIds: ModuleId[];
  experienceLevel: ExperienceLevel;
}

export interface MockInterviewSession {
  id: string;
  config: MockInterviewConfig;
  questions: Question[];
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  answeredCount: number;
  skippedCount: number;
}

export type WeakAreaStatus = 'strong' | 'needs_work' | 'weak';

export interface ModuleReadiness {
  moduleId: ModuleId;
  status: WeakAreaStatus;
  completionRate: number;
  bookmarkRate: number;
  skippedCount: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  practiceHistory: string[];
}
