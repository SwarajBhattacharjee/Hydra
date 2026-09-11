'use client';

import { useEffect } from 'react';
import { HydrationStore } from '@/lib/hydrationStore';
import { sendLocalNotification } from '@/lib/webPush';

export function ReminderScheduler() {
  useEffect(() => {
    const checkAndSendReminder = async () => {
      const profile = HydrationStore.getProfile();
      if (!profile || !profile.notificationsEnabled) return;

      // Active Hours Check
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const wake = profile.wakeTime || '08:00';
      const sleep = profile.sleepTime || '22:00';

      if (wake <= sleep) {
        if (currentHHMM < wake || currentHHMM > sleep) return;
      } else { // Overnight window (e.g. 22:00 to 06:00)
        if (currentHHMM < wake && currentHHMM > sleep) return;
      }

      // Interval Check
      const lastSentStr = localStorage.getItem('hydra_last_reminder_time');
      const lastSent = lastSentStr ? parseInt(lastSentStr, 10) : 0;
      const intervalMs = (profile.reminderIntervalMinutes || 60) * 60 * 1000;

      if (Date.now() - lastSent >= intervalMs) {
        localStorage.setItem('hydra_last_reminder_time', String(Date.now()));

        const title = 'Hydra Hydration Reminder! 💧';
        const body = `Hey ${profile.name}! Time to take a sip of water. Stay hydrated!`;

        // 1. Dispatch Multi-channel API (Email / Phone SMS / Push)
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send',
              channel: profile.notificationChannel || 'all',
              email: profile.email,
              phone: profile.phone,
              payload: { title, body }
            })
          });
        } catch (err) {
          console.error('Failed to trigger background reminder:', err);
        }

        // 2. Dispatch Local Browser Push Notification if granted
        sendLocalNotification(title, { body, tag: 'routine-reminder' });
      }
    };

    // Run check immediately on mount and every 60 seconds
    checkAndSendReminder();
    const interval = setInterval(checkAndSendReminder, 60000);

    return () => clearInterval(interval);
  }, []);

  return null; // Silent background helper
}
