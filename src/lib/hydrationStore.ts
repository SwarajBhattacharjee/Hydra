import { UserProfile, WaterLog, DailyProgress, StreakInfo, Achievement } from './types';
import { getTodayLocalDateString, calculateConsecutiveDays } from './timezone';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const PROFILE_KEY = 'hydra_user_profile';
const LOGS_KEY = 'hydra_water_logs';
const ACHIEVEMENTS_KEY = 'hydra_achievements';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'local_user',
  name: 'Hydrator',
  dailyGoalMl: 2500,
  reminderIntervalMinutes: 60,
  wakeTime: '08:00',
  sleepTime: '22:00',
  personality: 'friendly',
  friendName: '',
  notificationsEnabled: false,
  notificationChannel: 'all',
  email: '',
  phone: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_sip',
    title: 'First Sip',
    description: 'Logged your very first glass of water!',
    badgeIcon: '💧',
    unlockedAt: null,
    category: 'firsts'
  },
  {
    id: 'goal_hitter',
    title: 'Goal Crusher',
    description: 'Reached 100% of your daily water target.',
    badgeIcon: '🎯',
    unlockedAt: null,
    category: 'volume'
  },
  {
    id: 'week_wonder',
    title: 'One Week Wonder',
    description: 'Maintained a 7-day hydration streak!',
    badgeIcon: '⭐',
    unlockedAt: null,
    category: 'streak'
  },
  {
    id: 'fish_status',
    title: 'Basically Aquatic',
    description: 'Achieved a 14-day hydration streak!',
    badgeIcon: '🐟',
    unlockedAt: null,
    category: 'streak'
  },
  {
    id: 'month_master',
    title: 'Hydration Legend',
    description: 'Achieved a 30-day hydration streak!',
    badgeIcon: '👑',
    unlockedAt: null,
    category: 'level'
  }
];

export class HydrationStore {
  // Local storage helpers
  static getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return DEFAULT_PROFILE;
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  static saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').upsert({
        display_name: profile.name,
        daily_goal_ml: profile.dailyGoalMl,
        reminder_interval_minutes: profile.reminderIntervalMinutes,
        wake_time: profile.wakeTime,
        sleep_time: profile.sleepTime,
        personality: profile.personality,
        friend_name: profile.friendName,
        notifications_enabled: profile.notificationsEnabled,
        notification_channel: profile.notificationChannel,
        email: profile.email,
        phone: profile.phone,
        updated_at: profile.updatedAt
      }).then();
    }
  }

  static getLogs(): WaterLog[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOGS_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static addWaterLog(amountMl: number): { log: WaterLog; newlyUnlocked: Achievement[]; feedback: string } {
    const logs = this.getLogs();
    const today = getTodayLocalDateString();
    
    const newLog: WaterLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      amountMl,
      loggedAt: new Date().toISOString(),
      date: today
    };

    const updatedLogs = [newLog, ...logs];
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('water_logs').insert({
        amount_ml: amountMl,
        date: today
      }).then();
    }

    // Check achievement unlocks
    const newlyUnlocked = this.evaluateAchievements(updatedLogs);

    return {
      log: newLog,
      newlyUnlocked,
      feedback: 'Hydration acquired!'
    };
  }

  static deleteWaterLog(logId: string): WaterLog[] {
    const logs = this.getLogs().filter(l => l.id !== logId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    }
    return logs;
  }

  static getTodayTotalMl(): number {
    const today = getTodayLocalDateString();
    return this.getLogs()
      .filter(l => l.date === today)
      .reduce((sum, l) => sum + l.amountMl, 0);
  }

  static getDailyProgressHistory(days: number = 30): DailyProgress[] {
    const profile = this.getProfile();
    const logs = this.getLogs();
    const history: DailyProgress[] = [];
    const todayObj = new Date();

    for (let i = 0; i < days; i++) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - i);
      const dateStr = getTodayLocalDateString(d);

      const dayLogs = logs.filter(l => l.date === dateStr);
      const totalMl = dayLogs.reduce((sum, l) => sum + l.amountMl, 0);
      const completed = totalMl >= profile.dailyGoalMl;

      history.push({
        date: dateStr,
        totalMl,
        goalMl: profile.dailyGoalMl,
        completed
      });
    }

    return history;
  }

  static getStreakInfo(): StreakInfo {
    const profile = this.getProfile();
    const history = this.getDailyProgressHistory(90);
    const completedDates = history.filter(h => h.completed).map(h => h.date);

    const currentStreak = calculateConsecutiveDays(completedDates);
    
    // Calculate longest streak historically
    let longestStreak = currentStreak;
    let tempStreak = 0;
    const allSortedDates = Array.from(new Set(completedDates)).sort();
    
    for (let i = 0; i < allSortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(allSortedDates[i - 1]);
        prev.setDate(prev.getDate() + 1);
        const expectedNext = getTodayLocalDateString(prev);
        if (allSortedDates[i] === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return {
      currentStreak,
      longestStreak,
      lastCompletedDate: completedDates.length > 0 ? completedDates[0] : null
    };
  }

  static getAchievements(): Achievement[] {
    if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!stored) return INITIAL_ACHIEVEMENTS;
    try {
      const parsed: Record<string, string> = JSON.parse(stored);
      return INITIAL_ACHIEVEMENTS.map(a => ({
        ...a,
        unlockedAt: parsed[a.id] || null
      }));
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  static evaluateAchievements(logs: WaterLog[]): Achievement[] {
    if (typeof window === 'undefined') return [];
    const currentAchievements = this.getAchievements();
    const unlockedMap: Record<string, string> = {};
    currentAchievements.forEach(a => {
      if (a.unlockedAt) unlockedMap[a.id] = a.unlockedAt;
    });

    const newlyUnlocked: Achievement[] = [];
    const nowISO = new Date().toISOString();
    const streakInfo = this.getStreakInfo();

    // 1. First Sip
    if (logs.length > 0 && !unlockedMap['first_sip']) {
      unlockedMap['first_sip'] = nowISO;
      const found = currentAchievements.find(a => a.id === 'first_sip');
      if (found) newlyUnlocked.push({ ...found, unlockedAt: nowISO });
    }

    // 2. Goal Crusher
    const todayTotal = this.getTodayTotalMl();
    const profile = this.getProfile();
    if (todayTotal >= profile.dailyGoalMl && !unlockedMap['goal_hitter']) {
      unlockedMap['goal_hitter'] = nowISO;
      const found = currentAchievements.find(a => a.id === 'goal_hitter');
      if (found) newlyUnlocked.push({ ...found, unlockedAt: nowISO });
    }

    // 3. Week Wonder (7-day streak)
    if (streakInfo.currentStreak >= 7 && !unlockedMap['week_wonder']) {
      unlockedMap['week_wonder'] = nowISO;
      const found = currentAchievements.find(a => a.id === 'week_wonder');
      if (found) newlyUnlocked.push({ ...found, unlockedAt: nowISO });
    }

    // 4. Fish Status (14-day streak)
    if (streakInfo.currentStreak >= 14 && !unlockedMap['fish_status']) {
      unlockedMap['fish_status'] = nowISO;
      const found = currentAchievements.find(a => a.id === 'fish_status');
      if (found) newlyUnlocked.push({ ...found, unlockedAt: nowISO });
    }

    // 5. Month Master (30-day streak)
    if (streakInfo.currentStreak >= 30 && !unlockedMap['month_master']) {
      unlockedMap['month_master'] = nowISO;
      const found = currentAchievements.find(a => a.id === 'month_master');
      if (found) newlyUnlocked.push({ ...found, unlockedAt: nowISO });
    }

    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedMap));
    return newlyUnlocked;
  }

  static calculateXP(): { totalXP: number; levelName: string; currentLevelXP: number; nextLevelXP: number } {
    const logs = this.getLogs();
    const history = this.getDailyProgressHistory(30);
    const achievements = this.getAchievements().filter(a => a.unlockedAt !== null);

    let xp = logs.length * 10; // +10 per log
    xp += history.filter(h => h.completed).length * 25; // +25 per goal completed
    xp += achievements.length * 50; // +50 per badge

    let levelName = 'Hydration Rookie 💧';
    let currentLevelXP = xp;
    let nextLevelXP = 200;

    if (xp >= 1000) {
      levelName = 'Hydration Legend 👑';
      nextLevelXP = 2500;
    } else if (xp >= 500) {
      levelName = 'Aquatic Master 🌊';
      nextLevelXP = 1000;
    } else if (xp >= 200) {
      levelName = 'Hydration Pro ⚡';
      nextLevelXP = 500;
    }

    return { totalXP: xp, levelName, currentLevelXP, nextLevelXP };
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  }
}
