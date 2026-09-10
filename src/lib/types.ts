export type Personality = 'friendly' | 'motivational' | 'chaotic' | 'passive-aggressive' | 'dramatic';

export type MascotMood = 'worried' | 'flat' | 'pleased' | 'excited' | 'thrilled' | 'streak';

export interface UserProfile {
  id: string;
  name: string;
  dailyGoalMl: number; // e.g., 2500
  reminderIntervalMinutes: number; // 30, 45, 60, 90, 120
  wakeTime: string; // e.g. "08:00"
  sleepTime: string; // e.g. "22:00"
  personality: Personality;
  friendName?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WaterLog {
  id: string;
  amountMl: number;
  loggedAt: string; // ISO string
  date: string; // YYYY-MM-DD local user date
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD local user date
  totalMl: number;
  goalMl: number;
  completed: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string; // Icon identifier
  unlockedAt: string | null;
  category: 'streak' | 'volume' | 'firsts' | 'level';
}

export interface VoiceLinePool {
  routine: string[];
  fallingBehind: string[];
  escalatedSilence: string[];
  goalReached: string[];
  streakMilestone: string[];
  firstDrinkOfDay: string[];
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
