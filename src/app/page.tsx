'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HydrationStore } from '@/lib/hydrationStore';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const profile = HydrationStore.getProfile();
    // If user hasn't set up profile name yet or defaults, redirect to onboarding
    if (localStorage.getItem('hydra_onboarding_complete') !== 'true') {
      router.replace('/onboarding');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-sm font-semibold text-sky-200">Loading Hydra...</span>
    </div>
  );
}
