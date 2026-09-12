'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, X, Bell } from 'lucide-react';
import { HydrationStore } from '@/lib/hydrationStore';
import { sendLocalNotification, registerServiceWorker, subscribeUserToPush } from '@/lib/webPush';

export function ReminderScheduler() {
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    // 1. Register ServiceWorker & auto subscribe push if permission granted
    registerServiceWorker().then(() => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        subscribeUserToPush();
      }
    });

    // 2. Listen for custom In-App notification events
    const handleInAppNotif = (e: Event) => {
      const customEvt = e as CustomEvent<{ title: string; body: string }>;
      if (customEvt.detail) {
        setActiveToast({
          title: customEvt.detail.title || 'Hydra Reminder 💧',
          body: customEvt.detail.body || 'Time for a glass of water!'
        });
      }
    };

    window.addEventListener('HYDRA_INAPP_NOTIFICATION', handleInAppNotif);

    // 3. Interval Checker for Reminders
    const checkAndSendReminder = async () => {
      const profile = HydrationStore.getProfile();
      if (!profile || !profile.notificationsEnabled) return;

      // Active Hours Window Check
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

        // Get saved push subscription if available
        let subscription = null;
        try {
          subscription = JSON.parse(localStorage.getItem('hydra_push_subscription') || 'null');
        } catch {}

        // Dispatch API
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send',
              channel: profile.notificationChannel || 'all',
              email: profile.email,
              phone: profile.phone,
              subscription,
              payload: { title, body }
            })
          });
        } catch (err) {
          console.error('Failed to trigger background reminder:', err);
        }

        // Trigger Local Notification & In-App Banner
        sendLocalNotification(title, { body, tag: 'routine-reminder' });
      }
    };

    checkAndSendReminder();
    const interval = setInterval(checkAndSendReminder, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('HYDRA_INAPP_NOTIFICATION', handleInAppNotif);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 select-none"
        >
          <div className="bg-slate-900/95 border-2 border-sky-400/60 text-white rounded-2xl p-4 shadow-[0_10px_30px_rgba(2,132,199,0.4)] backdrop-blur-md flex items-start gap-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl shrink-0 mt-0.5 animate-bounce">
              <Droplet className="w-6 h-6 fill-sky-400" />
            </div>

            <div className="flex-1 text-left">
              <h4 className="font-extrabold text-sm text-sky-300 flex items-center gap-1.5">
                <span>{activeToast.title}</span>
              </h4>
              <p className="text-xs text-slate-200 mt-1 leading-snug font-medium">
                {activeToast.body}
              </p>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
