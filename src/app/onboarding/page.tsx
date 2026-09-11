'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Droplets, Sparkles, Bell, CheckCircle2 } from 'lucide-react';
import { HydroMascot } from '@/components/mascot/HydroMascot';
import { HydrationStore, DEFAULT_PROFILE } from '@/lib/hydrationStore';
import { Personality } from '@/lib/types';
import { requestNotificationPermission, detectPlatformCapabilities } from '@/lib/webPush';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [dailyGoalMl, setDailyGoalMl] = useState(2500);
  const [customGoalInput, setCustomGoalInput] = useState('2500');
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [wakeTime, setWakeTime] = useState('08:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [personality, setPersonality] = useState<Personality>('friendly');
  const [notifGranted, setNotifGranted] = useState(false);
  const [notificationChannel, setNotificationChannel] = useState<'all' | 'email' | 'phone' | 'push'>('all');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const totalSteps = 6;

  const handleGoalSelect = (goal: number) => {
    setDailyGoalMl(goal);
    setIsCustomGoal(false);
  };

  const handleRequestNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifGranted(perm === 'granted' || !!email || !!phone);
    handleFinish(perm === 'granted' || !!email || !!phone);
  };

  const handleFinish = (enableNotifs: boolean = true) => {
    const finalGoal = isCustomGoal ? parseInt(customGoalInput, 10) || 2500 : dailyGoalMl;
    const profile = {
      ...DEFAULT_PROFILE,
      name: name.trim() || 'Hydrator',
      dailyGoalMl: finalGoal,
      reminderIntervalMinutes: intervalMinutes,
      wakeTime,
      sleepTime,
      personality,
      notificationsEnabled: enableNotifs,
      notificationChannel,
      email: email.trim(),
      phone: phone.trim(),
      updatedAt: new Date().toISOString()
    };

    HydrationStore.saveProfile(profile);
    localStorage.setItem('hydra_onboarding_complete', 'true');
    router.push('/dashboard');
  };

  const personalitiesList: { id: Personality; title: string; desc: string; sample: string }[] = [
    {
      id: 'friendly',
      title: 'Friendly 💖',
      desc: 'Warm & encouraging reminders',
      sample: '"💧 Hey! Time for some water."'
    },
    {
      id: 'motivational',
      title: 'Motivational 💪',
      desc: 'High energy fitness coach vibe',
      sample: '"One glass closer to your goal 💪"'
    },
    {
      id: 'chaotic',
      title: 'Chaotic ⚡',
      desc: 'Wild, unhinged & funny emergency alerts',
      sample: '"🚨 WATER EMERGENCY 🚨"'
    },
    {
      id: 'passive-aggressive',
      title: 'Passive-Aggressive 😒',
      desc: 'Cheeky reverse-psychology nagging',
      sample: '"Oh, we\'re skipping water today?"'
    },
    {
      id: 'dramatic',
      title: 'Dramatic 🎭',
      desc: 'Epic cinematic storytelling',
      sample: '"THE WATER MUST FLOW."'
    }
  ];

  return (
    <div className="w-full max-w-md min-h-[90vh] flex flex-col justify-between py-6 px-2 select-none">
      {/* Top Header & Progress Dots */}
      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-sky-400" />
          <span className="font-extrabold text-lg text-white tracking-wide">HYDRA</span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step
                  ? 'w-6 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                  : idx < step
                  ? 'w-2 bg-sky-700'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Step Card */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {/* STEP 0: Welcome Screen */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-6 w-full"
            >
              <HydroMascot percentage={50} customMessage="Hey 👋 Let's get you hydrated!" size="lg" />

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  You forget to drink water, don't you?
                </h1>
                <p className="text-sm text-slate-300 max-w-xs mx-auto">
                  Don't worry. I'll annoy you about it — with humor, streaks, and a cute mascot.
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-extrabold text-lg rounded-2xl shadow-[0_8px_25px_rgba(2,132,199,0.5)] transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Let's get you hydrated 💧</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STEP 1: Name Question */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-6 w-full"
            >
              <HydroMascot percentage={30} customMessage="What should I call you?" size="md" />

              <div className="w-full space-y-4">
                <h2 className="text-xl font-bold text-white">What's your name?</h2>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-center text-2xl font-extrabold py-4 px-4 bg-slate-900 border-2 border-sky-500/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={() => setStep(0)}
                  className="p-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  className="flex-1 py-4 bg-sky-500 text-white font-bold text-base rounded-2xl shadow-lg hover:bg-sky-400 transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Daily Goal Presets */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-5 w-full"
            >
              <HydroMascot percentage={60} customMessage="Pick your daily water target." size="sm" />

              <div className="w-full space-y-3">
                <h2 className="text-xl font-bold text-white">Daily Target</h2>
                <p className="text-xs text-slate-400">Personal target (not medical advice)</p>

                <div className="grid grid-cols-2 gap-2.5 w-full">
                  {[1500, 2000, 2500, 3000].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => handleGoalSelect(goal)}
                      className={`py-3.5 px-4 rounded-2xl font-extrabold text-base border transition flex flex-col items-center justify-center gap-0.5 ${
                        !isCustomGoal && dailyGoalMl === goal
                          ? 'bg-sky-500 text-white border-sky-300 shadow-lg shadow-sky-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{(goal / 1000).toFixed(1)} Liters</span>
                      <span className="text-[11px] opacity-80 font-normal">({goal} ml)</span>
                    </button>
                  ))}
                </div>

                {/* Custom Goal Option */}
                <div className="pt-1">
                  <button
                    onClick={() => setIsCustomGoal(true)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm border transition ${
                      isCustomGoal
                        ? 'bg-sky-500 text-white border-sky-300 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Custom Target
                  </button>

                  {isCustomGoal && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="500"
                        max="6000"
                        value={customGoalInput}
                        onChange={(e) => setCustomGoalInput(e.target.value)}
                        className="w-32 text-center text-xl font-bold py-2 bg-slate-950 border border-sky-500 rounded-xl text-sky-200"
                      />
                      <span className="text-xs font-bold text-slate-400">ml</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="p-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-sky-500 text-white font-bold text-base rounded-2xl shadow-lg hover:bg-sky-400 transition flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Reminder Interval & Active Hours */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-5 w-full"
            >
              <HydroMascot percentage={75} customMessage="How often should I nudge you?" size="sm" />

              <div className="w-full space-y-4">
                <h2 className="text-lg font-bold text-white">Reminder Schedule</h2>

                {/* Interval presets */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block text-left">Every:</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setIntervalMinutes(mins)}
                        className={`py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm border transition ${
                          intervalMinutes === mins
                            ? 'bg-sky-500 text-white border-sky-300 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active hours window */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs text-slate-300 font-semibold block">Active Hours (reminders only fire in this window)</span>
                  <div className="flex items-center justify-around gap-4 text-xs font-bold">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 text-[10px] mb-1">Wake Time</span>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="bg-slate-950 text-sky-200 border border-slate-700 px-3 py-1.5 rounded-xl text-sm"
                      />
                    </div>

                    <span className="text-slate-600 text-base">to</span>

                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 text-[10px] mb-1">Sleep Time</span>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="bg-slate-950 text-sky-200 border border-slate-700 px-3 py-1.5 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="p-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 bg-sky-500 text-white font-bold text-base rounded-2xl shadow-lg hover:bg-sky-400 transition flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Personality Selection */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-4 w-full"
            >
              <h2 className="text-xl font-bold text-white">Choose Notification Voice</h2>
              <p className="text-xs text-slate-400">Pick Hydra's attitude when nagging you!</p>

              <div className="space-y-2 w-full max-h-[50vh] overflow-y-auto pr-1">
                {personalitiesList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPersonality(p.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 ${
                      personality === p.id
                        ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{p.title}</span>
                      {personality === p.id && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{p.desc}</span>
                    <span className="text-[11px] text-sky-300/80 italic mt-0.5">{p.sample}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="p-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-4 bg-sky-500 text-white font-bold text-base rounded-2xl shadow-lg hover:bg-sky-400 transition flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Notification Settings & Destinations */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-4 w-full"
            >
              <HydroMascot percentage={100} customMessage="Ready to get hydrated!" size="sm" />

              <div className="bg-slate-900/90 p-4 border border-sky-500/30 rounded-3xl space-y-3 text-left w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Where should Hydra nudge you?</h3>
                    <p className="text-xs text-sky-300">Set up Email, SMS or Push</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Email (for Mail Reminders)</label>
                    <input
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number (for SMS Reminders)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 w-full pt-1">
                <button
                  onClick={handleRequestNotif}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl shadow-[0_8px_25px_rgba(2,132,199,0.5)] transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enable Reminders & Launch 🚀</span>
                </button>

                <button
                  onClick={() => handleFinish(false)}
                  className="w-full py-2 text-slate-400 font-semibold text-xs hover:text-white transition"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
