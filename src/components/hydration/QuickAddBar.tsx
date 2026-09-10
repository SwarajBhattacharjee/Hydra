'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, CheckCircle2 } from 'lucide-react';
import { getRandomFeedbackQuote } from '@/lib/voicePacks';

interface QuickAddBarProps {
  onLogWater: (amountMl: number, feedback: string) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onLogWater }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('350');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickAdd = (amountMl: number) => {
    const feedback = getRandomFeedbackQuote();
    onLogWater(amountMl, feedback);

    // Show temporary feedback toast
    setToastMessage(`+${amountMl} ml logged! ${feedback}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      handleQuickAdd(val);
      setShowCustomModal(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center max-w-md px-4 select-none">
      {/* Toast Feedback Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-emerald-900/90 text-emerald-100 text-xs sm:text-sm font-semibold rounded-full border border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-2 max-w-[90vw] text-center"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main CTA: Massive +250ml Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handleQuickAdd(250)}
        className="w-full py-4 sm:py-5 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-extrabold text-xl sm:text-2xl rounded-2xl shadow-[0_8px_25px_rgba(2,132,199,0.5)] border border-sky-300/40 flex items-center justify-center gap-3 transition-all cursor-pointer active:shadow-inner"
      >
        <Droplets className="w-7 h-7 animate-bounce-subtle" />
        <span>+250 ml 💧</span>
      </motion.button>

      {/* Secondary Quick-Add Chips */}
      <div className="flex items-center justify-center gap-2 mt-3 w-full">
        <button
          onClick={() => handleQuickAdd(100)}
          className="flex-1 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-sky-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700/60 shadow-sm transition-all active:scale-95"
        >
          +100 ml
        </button>
        <button
          onClick={() => handleQuickAdd(250)}
          className="flex-1 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-sky-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700/60 shadow-sm transition-all active:scale-95"
        >
          +250 ml
        </button>
        <button
          onClick={() => handleQuickAdd(500)}
          className="flex-1 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-sky-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700/60 shadow-sm transition-all active:scale-95"
        >
          +500 ml
        </button>
        <button
          onClick={() => setShowCustomModal(true)}
          className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700/60 flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {/* Custom Amount Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center"
            >
              <h3 className="text-lg font-bold text-white mb-2">Custom Amount 💧</h3>
              <p className="text-xs text-slate-400 mb-4">Enter how much water you just drank in ml</p>
              
              <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="3000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full text-center text-3xl font-extrabold py-3 bg-slate-950 border border-sky-500/50 rounded-xl text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ml</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 shadow-md transition"
                  >
                    Log Water
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
