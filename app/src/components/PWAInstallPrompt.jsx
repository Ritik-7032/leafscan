import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if user hasn't dismissed in this session
      if (!sessionStorage.getItem('leafscan_pwa_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('leafscan_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top duration-300">
      <div className="glass-card rounded-2xl p-4 shadow-xl border border-leaf-500/30 flex items-start gap-3 bg-white/95 dark:bg-slate-900/95">
        <div className="w-10 h-10 rounded-xl bg-leaf-500/10 text-leaf-600 dark:text-leaf-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Install LeafScan App</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Add to home screen for instant offline scanning & camera access.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-leaf-600 hover:bg-leaf-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition"
            >
              Later
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
