import React from 'react';
import { Home, Camera, History, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ currentScreen, setScreen, onOpenScanMenu }) {
  const { isLoggedIn } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden pointer-events-none pb-safe">
      <div className="max-w-md mx-auto px-4 pb-3">
        <div className="pointer-events-auto glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl px-3 py-2 flex items-center justify-around backdrop-blur-xl">
          {/* Home */}
          <button
            onClick={() => setScreen('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              currentScreen === 'home'
                ? 'text-leaf-600 dark:text-leaf-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* Floating Thumb Scan Trigger Button */}
          <button
            onClick={onOpenScanMenu}
            className="relative -top-5 flex flex-col items-center group focus:outline-none"
            aria-label="Scan leaf"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-leaf-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-leaf-500/40 border-4 border-slate-50 dark:border-slate-900 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-leaf-600 dark:text-leaf-400 mt-0.5">
              Scan
            </span>
          </button>

          {/* History */}
          <button
            onClick={() => setScreen('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              currentScreen === 'history'
                ? 'text-leaf-600 dark:text-leaf-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>

          {/* Account */}
          <button
            onClick={() => setScreen(isLoggedIn ? 'profile' : 'login')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              ['profile', 'login', 'register'].includes(currentScreen)
                ? 'text-leaf-600 dark:text-leaf-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">{isLoggedIn ? 'Profile' : 'Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
