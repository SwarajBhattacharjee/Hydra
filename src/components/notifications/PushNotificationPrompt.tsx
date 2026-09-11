'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Share, PlusSquare, Smartphone, CheckCircle, Info, Mail, Phone, Settings } from 'lucide-react';
import { detectPlatformCapabilities, requestNotificationPermission, PlatformCapabilities } from '@/lib/webPush';
import { HydrationStore } from '@/lib/hydrationStore';
import { UserProfile } from '@/lib/types';

interface PushNotificationPromptProps {
  onPermissionChange?: (enabled: boolean) => void;
}

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({ onPermissionChange }) => {
  const [caps, setCaps] = useState<PlatformCapabilities | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = detectPlatformCapabilities();
    setCaps(detected);
    setProfile(HydrationStore.getProfile());
  }, []);

  if (!caps || !profile) return null;

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

    if (permission === 'granted') {
      const p = { ...profile, notificationsEnabled: true };
      HydrationStore.saveProfile(p);
      setProfile(p);
    }

    if (onPermissionChange) {
      onPermissionChange(permission === 'granted');
    }
  };

  const hasEmail = Boolean(profile.email);
  const hasPhone = Boolean(profile.phone);
  const activeChannel = profile.notificationChannel || 'all';

  return (
    <div className="w-full max-w-md my-4 px-4 select-none">
      {/* Banner Container */}
      <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl shrink-0 mt-0.5">
            {profile.notificationsEnabled ? (
              <Bell className="w-5 h-5 text-sky-400" />
            ) : (
              <BellOff className="w-5 h-5 text-slate-500" />
            )}
          </div>

          <div className="flex-1 text-left space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Multi-Channel Reminders</span>
                {profile.notificationsEnabled && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Active 🔔
                  </span>
                )}
              </h4>
              <Link href="/settings" className="text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" />
                <span>Configure</span>
              </Link>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.notificationsEnabled ? (
                <>
                  Nudges delivered via <strong>{activeChannel.toUpperCase()}</strong>:
                  {hasEmail && <span className="block text-[11px] text-sky-300">📧 Mail: {profile.email}</span>}
                  {hasPhone && <span className="block text-[11px] text-sky-300">📱 Phone SMS: {profile.phone}</span>}
                  {!hasEmail && !hasPhone && <span className="block text-[11px] text-slate-400">Add Mail or Phone in Settings for direct SMS/Email delivery!</span>}
                </>
              ) : (
                "Never miss hydration! Set up Email, Phone SMS, or Web Push reminders."
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!profile.notificationsEnabled && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              Mail & SMS supported
            </span>

            <button
              onClick={handleEnableClick}
              disabled={loading}
              className="py-2 px-4 bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Enabling...' : caps.needsIOSHomeInstall ? 'iOS Instructions 📱' : 'Enable Reminders 🔔'}
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
