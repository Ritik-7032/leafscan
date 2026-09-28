import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, LogOut, CheckCircle, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scanAPI } from '../services/api';

export default function ProfileScreen({ setScreen }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    scanAPI.getStats().then(setStats);
  }, []);

  const handleLogout = () => {
    logout();
    setScreen('home');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-md mx-auto py-4 space-y-6 pb-24">
      {/* Profile Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-leaf-600 to-teal-400 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-leaf-500/30 uppercase">
          {user?.name?.[0] || 'U'}
        </div>

        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">
          {user?.name || 'Guest User'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'Guest Mode'}</p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf-500/10 text-leaf-700 dark:text-leaf-300 text-xs font-semibold border border-leaf-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Agronomist Profile</span>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider px-1">
          Account Details
        </h3>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-leaf-500" />
              Email
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || 'N/A'}</span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-leaf-500" />
              Member Since
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{memberSince}</span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-leaf-500" />
              Total Scans
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{stats?.totalScans ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
