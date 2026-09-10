'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Share, PlusSquare, Smartphone, CheckCircle, Info } from 'lucide-react';
import { detectPlatformCapabilities, requestNotificationPermission, PlatformCapabilities } from '@/lib/webPush';

interface PushNotificationPromptProps {
  onPermissionChange?: (enabled: boolean) => void;
}

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({ onPermissionChange }) => {
  const [caps, setCaps] = useState<PlatformCapabilities | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = detectPlatformCapabilities();
    setCaps(detected);
  }, []);

  if (!caps) return null;

  const handleEnableClick = async () => {
    if (caps.needsIOSHomeInstall) {
      setShowIOSModal(true);
      return;
    }

    setLoading(true);
    const permission = await requestNotificationPermission();
    setLoading(false);

    const updatedCaps = detectPlatformCapabilities();
    setCaps(updatedCaps);

    if (onPermissionChange) {
      onPermissionChange(permission === 'granted');
    }
  };

  return (
    <div className="w-full max-w-md my-4 px-4 select-none">
      {/* Banner Container */}
      <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl shrink-0 mt-0.5">
            {caps.permissionState === 'granted' ? (
              <Bell className="w-5 h-5" />
            ) : caps.permissionState === 'denied' ? (
              <BellOff className="w-5 h-5 text-rose-400" />
            ) : (
              <Bell className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Smart Hydration Reminders</span>
              {caps.permissionState === 'granted' && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Active
                </span>
              )}
            </h4>
            
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {caps.permissionState === 'granted' ? (
                "I'll try to remind you during your active hours — keep the app installed for best results."
              ) : caps.permissionState === 'denied' ? (
                "Notifications are blocked in your browser settings. You can still use the app freely!"
              ) : caps.needsIOSHomeInstall ? (
                "On iPhones, iOS requires adding Hydra to your Home Screen first before enabling notifications."
              ) : (
                "Get gentle (and funny) hydration nudges right on your lock screen!"
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {caps.permissionState !== 'granted' && caps.permissionState !== 'denied' && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              No spam guarantee
            </span>

            <button
              onClick={handleEnableClick}
              disabled={loading}
              className="py-2 px-4 bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Enabling...' : caps.needsIOSHomeInstall ? 'iOS Setup Instructions 📱' : 'Enable Reminders 🔔'}
            </button>
          </div>
        )}
      </div>

      {/* iOS Installation Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-sky-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Hydra to Home Screen</h3>
                  <p className="text-xs text-sky-300">Required by Apple for Web Push</p>
                </div>
              </div>

              <div className="space-y-3 my-4 text-xs text-slate-300">
                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="p-1.5 bg-slate-700 rounded-lg text-sky-400">
                    <Share className="w-4 h-4" />
                  </div>
                  <span>1. Tap the <strong>Share</strong> button in Safari toolbar.</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="p-1.5 bg-slate-700 rounded-lg text-sky-400">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="p-1.5 bg-slate-700 rounded-lg text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>3. Open Hydra from your Home Screen to get reminders!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-sky-400 transition"
              >
                Got It 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
