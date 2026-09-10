'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Settings, Droplets } from 'lucide-react';

export const NavBar: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/onboarding') return null;

  const navItems = [
    { label: 'Hydrate', href: '/dashboard', icon: Home },
    { label: 'History', href: '/history', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-lg select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all ${
                isActive
                  ? 'text-sky-400 bg-sky-950/60 font-bold border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
