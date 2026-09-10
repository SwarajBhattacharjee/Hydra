'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Award, Sparkles, ChevronRight } from 'lucide-react';
import { StreakInfo, Achievement } from '@/lib/types';

interface StreakCardProps {
  streakInfo: StreakInfo;
  xpData: { totalXP: number; levelName: string; currentLevelXP: number; nextLevelXP: number };
  achievements: Achievement[];
  friendName?: string;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streakInfo,
  xpData,
  achievements,
  friendName
}) => {
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const progressPercent = Math.min(Math.round((xpData.totalXP / xpData.nextLevelXP) * 100), 100);

  return (
    <div className="w-full max-w-md my-3 px-4 select-none">
      {/* Main Streak & Level Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
        {/* Top Streak Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-white">{streakInfo.currentStreak} Day Streak</span>
                {streakInfo.currentStreak > 0 && <span className="text-sm">🔥</span>}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Best: {streakInfo.longestStreak} days
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowBadgesModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 px-3 py-1.5 rounded-xl border border-sky-500/30 transition active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{unlockedCount}/{achievements.length} Badges</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Friend Mode Quote Banner */}
        {friendName && (
          <div className="bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 italic flex items-center gap-2">
            <span className="text-base">👀</span>
            <span>"{friendName} is watching your progress closely."</span>
          </div>
        )}

        {/* XP Level Progress Bar */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold text-sky-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {xpData.levelName}
            </span>
            <span className="text-slate-400 font-semibold">{xpData.totalXP} XP</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Badges & Achievements Modal */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Hydration Badges</h3>
                    <p className="text-xs text-slate-400">{unlockedCount} of {achievements.length} Unlocked</p>
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="space-y-3">
                {achievements.map((badge) => {
                  const isUnlocked = badge.unlockedAt !== null;
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                        isUnlocked
                          ? 'bg-slate-800/90 border-sky-500/40 shadow-md'
                          : 'bg-slate-950/50 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className={`text-2xl p-2.5 rounded-2xl ${isUnlocked ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                        {badge.badgeIcon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{badge.title}</span>
                          {isUnlocked && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                              Unlocked
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowBadgesModal(false)}
                className="w-full mt-5 py-3 bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-sky-400 transition"
              >
                Close Badges
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
