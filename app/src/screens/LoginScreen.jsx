import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function LoginScreen({ setScreen }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('singhritik7032@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password mode state
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isResetMode) {
      if (!email || !newPassword) {
        setError('Please enter your email and a new password.');
        return;
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
      }

      setIsSubmitting(true);
      try {
        await authAPI.resetPassword(email, newPassword);
        setSuccessMsg('Password updated successfully! You can now sign in.');
        setIsResetMode(false);
        setPassword(newPassword);
      } catch (err) {
        setError(err.message || 'Could not reset password. Ensure the email is registered.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      setScreen('home');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6 pb-24 animate-in fade-in duration-200">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isResetMode ? 'Reset Your Password' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isResetMode
            ? 'Enter your registered email and choose a new password'
            : 'Login to sync your leaf scans and view agronomic history'}
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agronomist@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500 transition"
              />
            </div>
          </div>

          {!isResetMode ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setIsResetMode(true);
                  }}
                  className="text-[11px] font-bold text-leaf-600 dark:text-leaf-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-leaf-600 to-emerald-600 hover:from-leaf-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-leaf-600/25 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : isResetMode ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Save New Password</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {isResetMode && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsResetMode(false);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Cancel & Back to Sign In
            </button>
          )}
        </form>

        {!isResetMode && (
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Don't have an account? </span>
            <button
              onClick={() => setScreen('register')}
              className="font-bold text-leaf-600 dark:text-leaf-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Register</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
