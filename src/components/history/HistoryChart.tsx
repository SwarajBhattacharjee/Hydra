'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DailyProgress } from '@/lib/types';
import { formatFriendlyDate } from '@/lib/timezone';

interface HistoryChartProps {
  history: DailyProgress[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  const [range, setRange] = useState<7 | 30>(7);

  const displayItems = [...history].slice(0, range).reverse();
  const maxGoal = Math.max(...displayItems.map(d => d.goalMl), 2500);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-white">Hydration History 📊</h3>
        
        {/* Toggle Range */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setRange(7)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              range === 7 ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRange(30)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              range === 30 ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Bar Chart Visualizer */}
      <div className="h-44 flex items-end justify-between gap-1.5 pt-6 pb-2 px-1 border-b border-slate-800/80">
        {displayItems.map((item, idx) => {
          const heightPercent = Math.min(Math.round((item.totalMl / maxGoal) * 100), 100);
          const isTargetMet = item.completed;

          return (
            <div key={item.date || idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition bg-slate-950 text-sky-200 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-700 pointer-events-none whitespace-nowrap shadow-lg z-20">
                {item.totalMl} ml ({Math.round((item.totalMl / item.goalMl) * 100)}%)
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                  isTargetMet
                    ? 'bg-gradient-to-t from-sky-600 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                    : item.totalMl > 0
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-slate-850'
                }`}
              />

              {/* Date Label */}
              <span className="text-[10px] text-slate-400 font-semibold mt-2 truncate w-full text-center">
                {range === 7 ? formatFriendlyDate(item.date).split(',')[0] : item.date.slice(8)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span>Goal Met ({displayItems.filter(d => d.completed).length}/{displayItems.length} days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <span>Partial</span>
        </div>
      </div>
    </div>
  );
};
