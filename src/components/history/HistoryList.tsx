'use client';

import React from 'react';
import { Trash2, Droplets } from 'lucide-react';
import { WaterLog } from '@/lib/types';
import { formatFriendlyTime, formatFriendlyDate } from '@/lib/timezone';

interface HistoryListProps {
  logs: WaterLog[];
  onDeleteLog: (logId: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ logs, onDeleteLog }) => {
  if (logs.length === 0) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        <Droplets className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-semibold">No water logged yet today.</p>
        <p className="text-xs text-slate-500 mt-1">Tap +250ml on the dashboard to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
      <h4 className="text-sm font-bold text-white mb-1">Recent Water Logs ({logs.length})</h4>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white">+{log.amountMl} ml</span>
                <div className="text-[11px] text-slate-400 font-medium">
                  {formatFriendlyDate(log.date)} • {formatFriendlyTime(log.loggedAt)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteLog(log.id)}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition opacity-70 group-hover:opacity-100"
              title="Delete log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
