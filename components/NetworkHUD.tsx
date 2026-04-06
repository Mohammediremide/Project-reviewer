'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function NetworkHUD() {
  const [isOnline, setIsOnline] = useState(true);
  const [ping, setPing] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setPing(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ping measurement logic
    const measurePing = async () => {
      if (!navigator.onLine) return;
      
      const start = performance.now();
      try {
        // Append random query to bypass aggressive browser caching just in case
        await fetch(`/api/ping?t=${Date.now()}`, { cache: 'no-store' });
        const end = performance.now();
        setPing(Math.round(end - start));
      } catch (error) {
        // If the fetch fails entirely despite claiming to be online, consider it offline/high latency
        setPing(999); 
      }
    };

    measurePing(); // Initial ping
    const interval = setInterval(measurePing, 5000); // Check every 5s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  const getPingColor = () => {
    if (ping === null) return 'text-slate-500';
    if (ping < 100) return 'text-emerald-400';
    if (ping < 300) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getPingBgColor = () => {
    if (ping === null) return 'bg-slate-500/20';
    if (ping < 100) return 'bg-emerald-500/20';
    if (ping < 300) return 'bg-amber-500/20';
    return 'bg-rose-500/20';
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="glass-card shadow-2xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl pointer-events-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 blur-md opacity-50 animate-pulse"></div>
              <WifiOff className="text-rose-400 relative z-10" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-white leading-none">Connection Lost</span>
              <span className="text-[10px] text-rose-300/80 font-bold tracking-widest uppercase mt-1">Neural Sync Offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOnline && ping !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`glass-card shadow-lg ${getPingBgColor()} border border-white/5 px-3 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md pointer-events-auto transition-colors duration-500`}
          >
            <Activity className={getPingColor()} size={14} />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${getPingColor()}`}>
              {ping}ms
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
