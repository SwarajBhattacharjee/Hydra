'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Target, Clock, Volume2, Users, Bell, Trash2, CheckCircle2, Send, Mail, Phone, ShieldCheck } from 'lucide-react';
import { HydrationStore } from '@/lib/hydrationStore';
import { UserProfile, Personality, NotificationChannel } from '@/lib/types';
import { sendLocalNotification, requestNotificationPermission, detectPlatformCapabilities } from '@/lib/webPush';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  useEffect(() => {
    setProfile(HydrationStore.getProfile());
  }, []);

  if (!profile) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    HydrationStore.saveProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    setTestLog('Dispatching test notification...');

    const title = 'Hydra Hydration Check! 💧';
    const body = `Hey ${profile.name}! Time for a glass of water. ${profile.friendName ? `(${profile.friendName} is watching)` : ''}`;

    // Also trigger browser push if enabled/supported
    const caps = detectPlatformCapabilities();
    if (caps.permissionState === 'granted') {
      sendLocalNotification(title, { body, tag: 'test-reminder' });
    }

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          channel: profile.notificationChannel || 'all',
          email: profile.email,
          phone: profile.phone,
          payload: { title, body }
        })
      });

      const data = await res.json();
      if (data.success) {
        const channels = data.channelsDispatched.join(', ') || 'browser';
        setTestLog(`Test sent successfully via [${channels}]! Check your inbox / phone / logs.`);
      } else {
        setTestLog(`Notification warning: ${data.error || 'Check channel details'}`);
      }
    } catch (err: unknown) {
      setTestLog(`Test notification dispatched locally.`);
    }

    setTimeout(() => {
      setTestSent(false);
    }, 4000);
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to clear all your hydration logs and reset your profile?")) {
      HydrationStore.clearAllData();
      localStorage.removeItem('hydra_onboarding_complete');
      router.push('/onboarding');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-5 pb-12 select-none">
      {/* Header */}
      <div className="w-full text-center mt-2 space-y-1">
        <h1 className="text-2xl font-extrabold text-white">Settings ⚙️</h1>
        <p className="text-xs text-sky-300">Customize your hydration companion</p>
      </div>

      <form onSubmit={handleSave} className="w-full max-w-md space-y-4">
        {/* Display Name Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <User className="w-4 h-4 text-sky-400" />
            <span>Display Name</span>
          </div>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* NOTIFICATION DESTINATIONS & CHANNELS CARD */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Hydration Reminder System</span>
            </div>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, notificationsEnabled: !profile.notificationsEnabled })}
              className={`py-1 px-3 rounded-full text-xs font-bold transition border ${
                profile.notificationsEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {profile.notificationsEnabled ? 'Active 🔔' : 'Disabled 🔕'}
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Receive hydration alerts directly via <strong>Mail</strong>, <strong>SMS Phone Number</strong>, or <strong>Browser Push</strong>.
          </p>

          {/* Preferred Channel Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-xs text-slate-400 font-semibold block">Notification Channel:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Channels ⚡' },
                { id: 'email', label: 'Email Only 📧' },
                { id: 'phone', label: 'Phone SMS 📱' },
                { id: 'push', label: 'Browser Push 🔔' }
              ].map((ch) => (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => setProfile({ ...profile, notificationChannel: ch.id as NotificationChannel })}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                    (profile.notificationChannel || 'all') === ch.id
                      ? 'bg-sky-500 text-white border-sky-300 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input Field */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Email Address (for Email Reminders)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. yourname@gmail.com"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-sky-400 placeholder-slate-600"
            />
          </div>

          {/* Phone Number Input Field */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Phone Number (for SMS Reminders)</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. +1234567890"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-sky-400 placeholder-slate-600"
            />
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Daily Goal Target</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[1500, 2000, 2500, 3000].map((goal) => (
              <button
                type="button"
                key={goal}
                onClick={() => setProfile({ ...profile, dailyGoalMl: goal })}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition ${
                  profile.dailyGoalMl === goal
                    ? 'bg-sky-500 text-white border-sky-300'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                {(goal / 1000).toFixed(1)} L ({goal} ml)
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-semibold">Custom:</span>
            <input
              type="number"
              min="500"
              max="6000"
              value={profile.dailyGoalMl}
              onChange={(e) => setProfile({ ...profile, dailyGoalMl: parseInt(e.target.value, 10) || 2500 })}
              className="w-28 text-center text-sm font-bold py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-sky-200"
            />
            <span className="text-xs text-slate-400">ml</span>
          </div>
        </div>

        {/* Reminders & Schedule */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Schedule & Interval</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">Reminder Interval:</span>
            <div className="flex flex-wrap gap-2">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setProfile({ ...profile, reminderIntervalMinutes: mins })}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs border transition ${
                    profile.reminderIntervalMinutes === mins
                      ? 'bg-sky-500 text-white border-sky-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Wake Time</span>
              <input
                type="time"
                value={profile.wakeTime}
                onChange={(e) => setProfile({ ...profile, wakeTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-sky-200"
              />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Sleep Time</span>
              <input
                type="time"
                value={profile.sleepTime}
                onChange={(e) => setProfile({ ...profile, sleepTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-sky-200"
              />
            </div>
          </div>
        </div>

        {/* Personality Voice Pack */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <Volume2 className="w-4 h-4 text-sky-400" />
            <span>Personality Voice Pack</span>
          </div>

          <select
            value={profile.personality}
            onChange={(e) => setProfile({ ...profile, personality: e.target.value as Personality })}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-sky-400"
          >
            <option value="friendly">Friendly 💖 (Warm & encouraging)</option>
            <option value="motivational">Motivational 💪 (Coach energy)</option>
            <option value="chaotic">Chaotic ⚡ (Unhinged emergency alerts)</option>
            <option value="passive-aggressive">Passive-Aggressive 😒 (Cheeky nagging)</option>
            <option value="dramatic">Dramatic 🎭 (Cinematic destiny)</option>
          </select>
        </div>

        {/* Friend Mode (V1 Personalization) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Friend Mode (V1 Personalization)</span>
          </div>
          <p className="text-xs text-slate-400">Enter a friend's name to occasionally weave them into notification copy!</p>
          <input
            type="text"
            placeholder="e.g. Alex"
            value={profile.friendName || ''}
            onChange={(e) => setProfile({ ...profile, friendName: e.target.value })}
            className="w-full py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Test Notification Action */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Test Multi-Channel Delivery</span>
            </div>
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testSent}
              className="py-2 px-3 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testSent ? 'Sending...' : 'Send Test Notification 🚀'}</span>
            </button>
          </div>

          {testLog && (
            <p className="text-[11px] text-sky-300 bg-slate-950 p-2.5 rounded-xl border border-sky-500/30">
              {testLog}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-base rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="w-full max-w-md pt-4">
        <button
          onClick={handleResetData}
          className="w-full py-3 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-900/50 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Data & Start Over</span>
        </button>
      </div>
    </div>
  );
}
