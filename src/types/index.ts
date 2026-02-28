// ─── AI Review Types ─────────────────────────────────────────────────────────

export interface ReviewBreakdown {
  code_structure: number;
  architecture: number;
  clean_code: number;
  scalability: number;
  documentation: number;
  error_handling: number;
  product_thinking: number;
  performance: number;
}

export interface Improvement {
  problem: string;
  why: string;
  how: string;
}

export interface AIReviewResult {
  total_score: number;
  breakdown: ReviewBreakdown;
  strengths: string[];
  improvements: Improvement[];
  growth_focus: string[];
}

// ─── Attempt & Task State ─────────────────────────────────────────────────────

export interface TaskAttempt {
  score: number;
  timestamp: string; // ISO string
  repoUrl: string;
  reviewResult?: AIReviewResult;
}

export interface TaskState {
  attempts: TaskAttempt[];
  best_score: number;
}

// ─── User State (Firestore) ───────────────────────────────────────────────────

export type LevelTitle = 'Intern' | 'Junior Dev' | 'Engineer' | 'Product Engineer';

export interface UserState {
  currentWeek: number;
  unlockedWeeks: number[];
  xp: number;
  level: LevelTitle;
  userName?: string;
  email?: string;
  photoURL?: string;
  lastSeen?: string;      // ISO timestamp
  taskAttempts: {
    [key: string]: TaskState;
  };
  badgesEarned: string[];
}

// ─── Mission / Week Definitions ───────────────────────────────────────────────

export interface TaskDefinition {
  id: string;           // "a" or "b"
  label: string;        // "Task A – Flutter Architecture Refactor"
  technology: string;   // "Flutter" | "SwiftUI"
  description: string;
  requirements: string[];
}

export interface WeekDefinition {
  id: number;           // 1–4
  title: string;
  theme: string;
  badge: string;
  badgeIcon: string;
  unlockThreshold: number;
  taskA: TaskDefinition;
  taskB: TaskDefinition;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ReviewRequest {
  repoUrl: string;
  weekId: number;
  taskId: 'a' | 'b';
}

export interface ReviewResponse {
  success: boolean;
  result?: AIReviewResult;
  updatedState?: UserState;
  unlocked?: boolean;   // true if this submission unlocked the next week
  error?: string;
}

export interface StateResponse {
  success: boolean;
  state?: UserState;
  error?: string;
}
