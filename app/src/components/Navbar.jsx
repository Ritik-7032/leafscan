import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogIn, 
  Wifi, 
  WifiOff, 
  Info, 
  History, 
  Camera, 
  Layers,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentScreen, setScreen, onOpenLiveCamera }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navLinks = [
    { id: 'home', label: 'Scanner', icon: <Camera className="w-4 h-4" /> },
    { id: 'history', label: 'Scan History', icon: <History className="w-4 h-4" /> },
    { id: 'about', label: 'AI Model & About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (screenId) => {
    setScreen(screenId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-leaf-600 to-emerald-400 flex items-center justify-center shadow-md shadow-leaf-500/20 group-hover:scale-105 transition-transform duration-300">
            <Leaf className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-leaf-700 via-emerald-600 to-teal-600 dark:from-leaf-400 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                LeafScan
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-leaf-100 text-leaf-800 dark:bg-leaf-900/60 dark:text-leaf-300 border border-leaf-300/40 dark:border-leaf-700/40">
                AI
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden xs:block">
              Vegetable Disease Scanner
            </p>
          </div>
        </button>

        {/* Primary Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800/80">
          {navLinks.map((tab) => {
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-leaf-600 to-emerald-600 text-white shadow-sm shadow-leaf-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline status pill */}
          <div 
            title={isOnline ? 'Online - Cloud Sync Active' : 'Offline - On-Device AI Active'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Profile / Login */}
          {isLoggedIn ? (
            <button
              onClick={() => handleNavClick('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                currentScreen === 'profile'
                  ? 'bg-leaf-500/10 border-leaf-500/40 text-leaf-700 dark:text-leaf-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-leaf-400'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-leaf-600 to-teal-500 text-white flex items-center justify-center text-xs uppercase font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <span className="hidden sm:inline max-w-[80px] truncate">{user?.name || 'Account'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-leaf-600 to-teal-600 hover:from-leaf-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm shadow-leaf-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((tab) => {
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-leaf-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
          {isLoggedIn ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile & Account</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-leaf-600 dark:text-leaf-400 hover:bg-leaf-50 dark:hover:bg-leaf-950/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
