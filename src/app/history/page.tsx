'use client';

import React, { useState, useEffect } from 'react';
import { HistoryChart } from '@/components/history/HistoryChart';
import { HistoryList } from '@/components/history/HistoryList';
import { HydrationStore } from '@/lib/hydrationStore';
import { DailyProgress, WaterLog } from '@/lib/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [logs, setLogs] = useState<WaterLog[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setHistory(HydrationStore.getDailyProgressHistory(30));
    setLogs(HydrationStore.getLogs());
  };

  const handleDeleteLog = (logId: string) => {
    HydrationStore.deleteWaterLog(logId);
    refreshData();
  };

  const totalAllTimeMl = logs.reduce((sum, l) => sum + l.amountMl, 0);
  const daysTracked = history.filter(h => h.totalMl > 0).length;
  const avgMl = daysTracked > 0 ? Math.round(totalAllTimeMl / daysTracked) : 0;

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-5 pb-8 select-none">
      <div className="w-full text-center mt-2 space-y-1">
        <h1 className="text-2xl font-extrabold text-white">Hydration History 📈</h1>
        <p className="text-xs text-sky-300">Track your consistency and progress</p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
          <span className="text-2xl font-black text-sky-400">{(totalAllTimeMl / 1000).toFixed(1)} L</span>
          <span className="text-xs text-slate-400 block font-medium mt-0.5">Total Water Logged</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
          <span className="text-2xl font-black text-cyan-400">{avgMl} ml</span>
          <span className="text-xs text-slate-400 block font-medium mt-0.5">Daily Average</span>
        </div>
      </div>

      {/* 7 / 30 Day Bar Chart */}
      <HistoryChart history={history} />

      {/* Log History Timeline */}
      <HistoryList logs={logs} onDeleteLog={handleDeleteLog} />
    </div>
  );
}
