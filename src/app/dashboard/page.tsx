'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { HydroMascot } from '@/components/mascot/HydroMascot';
import { FillingBottle } from '@/components/hydration/FillingBottle';
import { QuickAddBar } from '@/components/hydration/QuickAddBar';
import { StreakCard } from '@/components/streaks/StreakCard';
import { PushNotificationPrompt } from '@/components/notifications/PushNotificationPrompt';
import { HydrationStore } from '@/lib/hydrationStore';
import { UserProfile, WaterLog, StreakInfo, Achievement } from '@/lib/types';
import { registerServiceWorker } from '@/lib/webPush';

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({ currentStreak: 0, longestStreak: 0, lastCompletedDate: null });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [xpData, setXpData] = useState({ totalXP: 0, levelName: 'Hydration Rookie', currentLevelXP: 0, nextLevelXP: 200 });
  const [eventReaction, setEventReaction] = useState<'firstDrink' | 'goalCompleted' | 'streakBroken' | null>(null);

  // Load state on mount
  useEffect(() => {
    const p = HydrationStore.getProfile();
    setProfile(p);
    refreshData();

    // Register PWA service worker
    registerServiceWorker();

    // Listen for service worker notification button actions (e.g. Drank 💧)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'LOG_WATER_ACTION') {
          handleLogWater(event.data.amountMl || 250);
        }
      });
    }
  }, []);

  const refreshData = () => {
    const l = HydrationStore.getLogs();
    setLogs(l);

    const total = HydrationStore.getTodayTotalMl();
    setTodayTotal(total);

    const s = HydrationStore.getStreakInfo();
    setStreakInfo(s);

    const a = HydrationStore.getAchievements();
    setAchievements(a);

    const xp = HydrationStore.calculateXP();
    setXpData(xp);
  };

  const handleLogWater = (amountMl: number, feedbackQuote?: string) => {
    const isFirstDrink = todayTotal === 0;
    const previousTotal = todayTotal;
    const currentGoal = profile?.dailyGoalMl || 2500;

    const result = HydrationStore.addWaterLog(amountMl);
    refreshData();

    const newTotal = previousTotal + amountMl;

    // Trigger celebration effects & reactions
    if (isFirstDrink) {
      setEventReaction('firstDrink');
      setTimeout(() => setEventReaction(null), 4000);
    } else if (newTotal >= currentGoal && previousTotal < currentGoal) {
      // Goal achieved celebration!
      setEventReaction('goalCompleted');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setEventReaction(null), 6000);
    }
  };

  if (!profile) return null;

  const percentage = Math.round((todayTotal / profile.dailyGoalMl) * 100);

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-4 pb-8 select-none">
      {/* Header Greeting */}
      <div className="w-full text-center mt-2 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hey, {profile.name} 👋
        </h1>
        <p className="text-xs sm:text-sm text-sky-300 font-medium">
          Let's get you hydrated.
        </p>
      </div>

      {/* Mascot Section */}
      <div className="w-full flex justify-center my-1">
        <HydroMascot
          percentage={percentage}
          streakDays={streakInfo.currentStreak}
          eventReaction={eventReaction}
          size="md"
        />
      </div>

      {/* Animated Water Bottle Meter */}
      <div className="w-full flex justify-center my-2">
        <FillingBottle
          currentMl={todayTotal}
          goalMl={profile.dailyGoalMl}
          size="md"
        />
      </div>

      {/* Primary Logging CTA & Quick-Add Bar */}
      <QuickAddBar onLogWater={handleLogWater} />

      {/* Streak & XP Card */}
      <StreakCard
        streakInfo={streakInfo}
        xpData={xpData}
        achievements={achievements}
        friendName={profile.friendName}
      />

      {/* Notification Banner */}
      <PushNotificationPrompt />
    </div>
  );
}
