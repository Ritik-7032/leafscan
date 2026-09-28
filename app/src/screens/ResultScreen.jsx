import React, { useState, useEffect } from 'react';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck, 
  Info, 
  Sparkles, 
  HelpCircle,
  ShieldCheck,
  Droplets,
  HeartPulse,
  Share2,
  Download,
  Activity,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scanAPI } from '../services/api';

export default function ResultScreen({ result, imageSrc, onScanAgain, onNavigateToLogin }) {
  const { isLoggedIn } = useAuth();
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.60);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    vegetable = 'Vegetable',
    disease = 'Condition',
    confidence = 0,
    isHealthy = false,
    isUncertain = false,
    isNotLeaf = false,
    heatmapUrl,
    tips
  } = result || {};

  useEffect(() => {
    // Celebrate healthy crops with confetti
    if (isHealthy && !isUncertain && !isNotLeaf) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#22d3ee']
      });
    }

    // Auto-save to history when logged in
    if (isLoggedIn && result && !isSaved && !isNotLeaf) {
      handleSave();
    }
  }, [result]);

  const handleSave = async () => {
    if (isSaving || isSaved || isNotLeaf) return;
    setIsSaving(true);
    try {
      await scanAPI.saveScan({
        vegetable,
        disease,
        confidence,
        isHealthy,
        thumbnail: result.thumbnail || imageSrc,
        createdAt: new Date().toISOString()
      });
      setIsSaved(true);
    } catch (err) {
      console.warn('Scan save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine status color styling
  let statusBadge = {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-emerald-500/20',
    ringColor: '#10b981',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    label: 'Healthy Foliage',
    severity: 'None'
  };

  if (isNotLeaf) {
    statusBadge = {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-rose-500/20',
      ringColor: '#ef4444',
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      label: 'Non-Plant Object',
      severity: 'Invalid'
    };
  } else if (isUncertain) {
    statusBadge = {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-amber-500/20',
      ringColor: '#f59e0b',
      icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
      label: 'Low Confidence (< 60%)',
      severity: 'Uncertain'
    };
  } else if (!isHealthy) {
    statusBadge = {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-rose-500/20',
      ringColor: '#ef4444',
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      label: 'Pathogen Detected',
      severity: tips?.severity || 'High'
    };
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* 3D Parallax Tilt Diagnosis Card */}
      <Tilt
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        perspective={1000}
        scale={1.01}
        transitionSpeed={1000}
        className="transform-gpu"
      >
        <div className="glass-card-neo rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200 dark:border-emerald-500/25 shadow-2xl">
          {/* Header Status */}
          <div className="flex items-center justify-between gap-2 mb-5">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black border shadow-md ${statusBadge.bg}`}>
              {statusBadge.icon}
              <span>{statusBadge.label}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                {isNotLeaf ? 'Scan Target' : 'Identified Crop'}
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-white leading-none">
                {isNotLeaf ? 'Non-Plant Object' : vegetable}
              </h4>
            </div>
          </div>

          {/* Dual Visualizer: Original Leaf & Grad-CAM Heatmap Layer */}
          <div className="relative aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-950 group">
            {/* Base Image */}
            <img
              src={imageSrc}
              alt="Scanned Photo"
              className="w-full h-full object-cover"
            />

            {/* Grad-CAM Heatmap Layer */}
            {heatmapUrl && !isNotLeaf && (
              <img
                src={heatmapUrl}
                alt="Grad-CAM Heatmap"
                style={{ opacity: heatmapOpacity }}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 mix-blend-screen pointer-events-none"
              />
            )}

            {/* Confidence Circular Radar Gauge */}
            <div className="absolute top-4 right-4 glass-panel rounded-2xl px-3 py-2 flex items-center gap-2 shadow-2xl border border-white/40">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-300 dark:text-slate-700 stroke-current"
                    strokeWidth="3.8"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    style={{ stroke: statusBadge.ringColor }}
                    strokeDasharray={`${confidence}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.8"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800 dark:text-white">
                  {confidence}%
                </span>
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">
                  Neural Score
                </span>
                <span className="text-[11px] font-extrabold text-slate-800 dark:text-white">
                  {isNotLeaf ? 'Invalid' : `${confidence}% Match`}
                </span>
              </div>
            </div>
          </div>

          {/* Grad-CAM Opacity Slider Control */}
          {heatmapUrl && !isNotLeaf && (
            <div className="mt-5 p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Grad-CAM Spatial Attention Heatmap</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{Math.round(heatmapOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-semibold">
                <span>0% (Original Leaf Photo)</span>
                <span>100% (Full Lesion Activation Heatmap)</span>
              </div>
            </div>
          )}

          {/* Disease Title */}
          <div className="mt-5 text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isNotLeaf ? 'No Leaf Detected' : isUncertain ? 'Uncertain Diagnosis' : disease}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isNotLeaf
                ? 'Face / Background Object Detected'
                : `${vegetable} • ${isHealthy ? 'Healthy Specimen' : 'Pathogenic Disease Detected'}`}
            </p>
          </div>
        </div>
      </Tilt>

      {/* Uncertainty Notice or Non-Leaf Detection Notice */}
      {isNotLeaf ? (
        <div className="glass-card-neo rounded-3xl p-6 border-2 border-rose-500/40 bg-rose-500/5 dark:bg-rose-500/10">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-rose-200">
                Non-Plant Photo Detected
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                The camera captured a non-leaf object (e.g. human face, skin, wall, or room). LeafScan is specialized strictly for **vegetable leaves**.
              </p>
              <ul className="mt-2.5 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside font-medium">
                <li>Point your camera directly at a single <strong>Broccoli, Cabbage, Cauliflower, or Turnip</strong> leaf.</li>
                <li>Fill at least 50% of the frame with the leaf blade.</li>
                <li>Avoid faces, hands, or cluttered indoor backgrounds.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : isUncertain ? (
        <div className="glass-card-neo rounded-3xl p-6 border-2 border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-amber-200">
                Not sure - please retake the photo
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                The model confidence is below the 60% safety threshold. For an accurate diagnosis, please ensure:
              </p>
              <ul className="mt-2.5 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside font-medium">
                <li>Capture under bright, indirect natural sunlight.</li>
                <li>Center a single vegetable leaf clearly in the camera viewfinder.</li>
                <li>Avoid blurry captures, glare, or shadows across the leaf surface.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* Agronomic Recommendations & Prescription Cards */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 px-1 uppercase tracking-wider flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-500" />
          <span>Agronomic Prescription & Treatment</span>
        </h3>

        {/* Cause / Pathogen */}
        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Pathogen & Cause</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                {tips?.cause || 'Natural biological factors or environmental stress.'}
              </p>
            </div>
          </div>
        </div>

        {/* Immediate Treatment */}
        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {isHealthy ? 'Crop Maintenance Guideline' : 'Immediate Remediation & Spray Treatment'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                {tips?.treatment || 'Keep monitoring and water properly at the plant base.'}
              </p>
            </div>
          </div>
        </div>

        {/* Cultural Prevention */}
        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Long-Term Field Prevention</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                {tips?.prevention || 'Ensure good spacing, sanitary garden tools, and 3-year crop rotation.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3.5 pt-3">
        <button
          onClick={onScanAgain}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-98 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan Another Leaf</span>
        </button>

        {!isLoggedIn ? (
          <button
            onClick={onNavigateToLogin}
            className="py-4 px-6 rounded-2xl glass-card border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-black text-sm flex items-center justify-center gap-2 transition"
          >
            <Bookmark className="w-4 h-4" />
            <span>Login to Sync Scan History</span>
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaved || isSaving || isNotLeaf}
            className="py-4 px-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-black text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-emerald-500" />
                <span>Saved to Cloud Archive</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Scan Record'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
