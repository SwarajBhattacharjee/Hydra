'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FillingBottleProps {
  currentMl: number;
  goalMl: number;
  size?: 'sm' | 'md' | 'lg';
}

export const FillingBottle: React.FC<FillingBottleProps> = ({
  currentMl,
  goalMl,
  size = 'md'
}) => {
  const percentage = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const remainingMl = Math.max(goalMl - currentMl, 0);

  const bottleHeightMap = {
    sm: 'h-48 w-28',
    md: 'h-64 w-36',
    lg: 'h-80 w-44'
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Outer Glass Bottle Frame */}
      <div className={`relative ${bottleHeightMap[size]} rounded-[40px] border-4 border-slate-700/60 bg-slate-950/40 shadow-[0_0_35px_rgba(2,132,199,0.2)] backdrop-blur-md overflow-hidden flex flex-col justify-end p-1`}>
        
        {/* Bottle Cap & Neck */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-600 rounded-b-md border-x-2 border-b-2 border-slate-500 shadow-md" />

        {/* Measurement Grid Marks */}
        <div className="absolute inset-y-8 left-2 flex flex-col justify-between z-20 pointer-events-none opacity-40">
          <div className="w-3 h-0.5 bg-slate-300" />
          <div className="w-2 h-0.5 bg-slate-400" />
          <div className="w-3 h-0.5 bg-slate-300" />
          <div className="w-2 h-0.5 bg-slate-400" />
          <div className="w-3 h-0.5 bg-slate-300" />
        </div>

        {/* Water Liquid Filling Level */}
        <motion.div
          initial={{ height: '0%' }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="w-full relative rounded-b-[32px] overflow-hidden bg-gradient-to-t from-sky-700 via-sky-500 to-cyan-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]"
        >
          {/* Wave Animation Header */}
          <div className="absolute top-0 left-0 right-0 h-4 -translate-y-full overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, -100] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="w-[200%] h-full flex"
            >
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-cyan-300 fill-current opacity-70">
                <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,-20 1200,40 L1200,120 L0,120 Z" />
              </svg>
            </motion.div>
          </div>

          {/* Bubbles in Water */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: ['100%', '-20%'], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
              className="absolute left-1/4 w-2 h-2 rounded-full bg-white/40"
            />
            <motion.div
              animate={{ y: ['100%', '-20%'], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
              className="absolute left-2/3 w-3 h-3 rounded-full bg-white/50"
            />
          </div>
        </motion.div>

        {/* Center Overlay Stats */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
          <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">
            {percentage}%
          </span>
          <span className="text-xs font-bold text-sky-100/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] mt-0.5">
            {currentMl.toLocaleString()} / {goalMl.toLocaleString()} ml
          </span>
        </div>
      </div>

      {/* Subtext info */}
      <div className="mt-3 text-center">
        {remainingMl > 0 ? (
          <span className="text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700/50 shadow-sm">
            💧 {remainingMl.toLocaleString()} ml to go
          </span>
        ) : (
          <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/50 shadow-sm">
            ✨ Daily Goal Reached!
          </span>
        )}
      </div>
    </div>
  );
};
