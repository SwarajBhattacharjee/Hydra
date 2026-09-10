'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MascotMood } from '@/lib/types';

interface HydroMascotProps {
  percentage: number;
  streakDays?: number;
  eventReaction?: 'firstDrink' | 'goalCompleted' | 'streakBroken' | null;
  customMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function getMascotMood(percentage: number, streakDays: number = 0): MascotMood {
  if (streakDays >= 3 && percentage >= 100) return 'streak';
  if (percentage >= 100) return 'thrilled';
  if (percentage >= 80) return 'excited';
  if (percentage >= 50) return 'pleased';
  if (percentage >= 20) return 'flat';
  return 'worried';
}

export function getMascotLine(
  mood: MascotMood,
  eventReaction?: 'firstDrink' | 'goalCompleted' | 'streakBroken' | null
): string {
  if (eventReaction === 'firstDrink') return 'YES. WE HAVE WATER.';
  if (eventReaction === 'goalCompleted') return 'WE DID IT!';
  if (eventReaction === 'streakBroken') return 'We had a good thing going...';

  switch (mood) {
    case 'worried':
      return "I'm worried.";
    case 'flat':
      return "Okay... we're working on it.";
    case 'pleased':
      return 'Now we\'re talking.';
    case 'excited':
      return 'So close!';
    case 'thrilled':
      return 'H Y D R A T E D.';
    case 'streak':
      return 'At this point you\'re basically part fish.';
    default:
      return 'Drink water!';
  }
}

export const HydroMascot: React.FC<HydroMascotProps> = ({
  percentage,
  streakDays = 0,
  eventReaction = null,
  customMessage,
  size = 'md'
}) => {
  const mood = getMascotMood(percentage, streakDays);
  const speechLine = customMessage || getMascotLine(mood, eventReaction);

  const dimensionMap = {
    sm: 'w-20 h-24',
    md: 'w-32 h-36',
    lg: 'w-44 h-48'
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        key={speechLine}
        transition={{ duration: 0.3 }}
        className="mb-3 px-4 py-2 bg-slate-900/90 text-sky-100 text-xs sm:text-sm font-semibold rounded-2xl border border-sky-400/30 shadow-lg backdrop-blur-md relative max-w-[240px] text-center"
      >
        <span>{speechLine}</span>
        {/* Triangle pointer */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900/90" />
      </motion.div>

      {/* Mascot Body */}
      <motion.div
        animate={{
          y: mood === 'thrilled' || mood === 'streak' ? [-4, 6, -4] : [-2, 2, -2],
          rotate: mood === 'excited' ? [-2, 2, -2] : [0, 0, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: mood === 'thrilled' || mood === 'streak' ? 1.5 : 3,
          ease: 'easeInOut'
        }}
        className={`relative ${dimensionMap[size]}`}
      >
        <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_10px_20px_rgba(2,132,199,0.3)]">
          <defs>
            <linearGradient id="hydroBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <linearGradient id="hydroHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main Water Drop Shape */}
          <path
            d="M100 20 C100 20, 25 110, 25 160 C25 201.4 58.6 235 100 235 C141.4 235 175 201.4 175 160 C175 110, 100 20, 100 20 Z"
            fill="url(#hydroBodyGrad)"
          />

          {/* Liquid Shine Highlight */}
          <path
            d="M100 38 C100 38, 42 118, 42 155 C42 175 55 198 75 208 C62 192 60 162 78 128 C90 102 100 38 100 38 Z"
            fill="url(#hydroHighlight)"
          />

          {/* Expressive Eyes */}
          {mood === 'worried' && (
            <g>
              {/* Spiral/Worried Eyes */}
              <circle cx="75" cy="145" r="10" fill="#0f172a" />
              <circle cx="125" cy="145" r="10" fill="#0f172a" />
              <path d="M68 135 L82 140" stroke="#38bdf8" strokeWidth="2" />
              <path d="M118 140 L132 135" stroke="#38bdf8" strokeWidth="2" />
              {/* Worried Eyebrows */}
              <path d="M65 128 Q75 136 85 128" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <path d="M115 128 Q125 136 135 128" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {mood === 'flat' && (
            <g>
              {/* Flat Neutral Eyes */}
              <ellipse cx="75" cy="145" rx="8" ry="10" fill="#0f172a" />
              <ellipse cx="125" cy="145" rx="8" ry="10" fill="#0f172a" />
              <circle cx="77" cy="142" r="3" fill="#ffffff" />
              <circle cx="127" cy="142" r="3" fill="#ffffff" />
            </g>
          )}

          {(mood === 'pleased' || mood === 'excited') && (
            <g>
              {/* Happy Big Eyes */}
              <circle cx="75" cy="145" r="12" fill="#0f172a" />
              <circle cx="125" cy="145" r="12" fill="#0f172a" />
              <circle cx="79" cy="141" r="4.5" fill="#ffffff" />
              <circle cx="129" cy="141" r="4.5" fill="#ffffff" />
            </g>
          )}

          {(mood === 'thrilled' || mood === 'streak') && (
            <g>
              {/* Star / Sunglasses / Super Happy Eyes */}
              {mood === 'streak' ? (
                // Cool Sunglasses
                <g>
                  <path d="M55 136 L145 136 L135 156 L65 156 Z" fill="#0f172a" />
                  <path d="M55 136 Q100 130 145 136" stroke="#0f172a" strokeWidth="6" />
                  <line x1="68" y1="140" x2="85" y2="152" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
                  <line x1="115" y1="140" x2="132" y2="152" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
                </g>
              ) : (
                // Thrilled Happy Arcs
                <g>
                  <path d="M63 145 Q75 130 87 145" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                  <path d="M113 145 Q125 130 137 145" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                </g>
              )}
            </g>
          )}

          {/* Mouth States */}
          {mood === 'worried' && (
            <path d="M85 180 Q100 170 115 180" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          )}

          {mood === 'flat' && (
            <line x1="85" y1="175" x2="115" y2="175" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          )}

          {mood === 'pleased' && (
            <path d="M80 172 Q100 190 120 172" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          )}

          {(mood === 'excited' || mood === 'thrilled' || mood === 'streak') && (
            <path d="M76 168 Q100 198 124 168 Z" fill="#0f172a" />
          )}

          {/* Cheek Blushes */}
          <ellipse cx="58" cy="158" rx="10" ry="6" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="142" cy="158" rx="10" ry="6" fill="#f43f5e" opacity="0.4" />

          {/* Streak Flame Effect */}
          {mood === 'streak' && (
            <motion.g
              animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <path d="M100 0 C85 20, 75 40, 85 55 C90 40, 100 30, 100 30 C100 30, 110 40, 115 55 C125 40, 115 20, 100 0 Z" fill="#f97316" filter="url(#glow)" />
              <path d="M100 10 C92 25, 88 38, 93 48 C96 38, 100 32, 100 32 C100 32, 104 38, 107 48 C112 38, 108 25, 100 10 Z" fill="#facc15" />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
