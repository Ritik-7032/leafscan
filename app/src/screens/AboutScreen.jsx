import React from 'react';
import { 
  Leaf, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  Database, 
  Activity, 
  Lock, 
  Zap, 
  Eye, 
  Server,
  ArrowRight
} from 'lucide-react';

export default function AboutScreen() {
  const steps = [
    {
      num: '01',
      title: 'MobileNetV3-Small Backbone',
      desc: 'ImageNet pre-trained feature extractor utilizing depthwise separable convolutions with hard-swish activation for mobile acceleration.',
      icon: <Cpu className="w-5 h-5 text-emerald-500" />
    },
    {
      num: '02',
      title: 'Dual-Head Multi-Task Prediction',
      desc: 'Shared deep feature representation branching into Head 1 (Vegetable category - 4 classes) and Head 2 (Disease condition - 17 classes).',
      icon: <Layers className="w-5 h-5 text-teal-500" />
    },
    {
      num: '03',
      title: 'Grad-CAM Attention Heatmap',
      desc: 'Calculates convolutional gradient activations (Conv_1) to render a spatial heat intensity map pinpointing necrotic lesion focal zones.',
      icon: <Activity className="w-5 h-5 text-cyan-500" />
    },
    {
      num: '04',
      title: '60% Confidence Safety Gate',
      desc: 'Suppresses hallucinated predictions on out-of-scope non-plant objects, faces, or ambiguous shots with photography tips.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 mb-4 animate-float-slow">
          <Leaf className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-500/20 mb-2">
          <span>Technical Architecture & Research Overview</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          About LeafScan AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto font-medium">
          A lightweight, on-device vegetable leaf disease detector powered by multi-task deep learning and WebGL acceleration.
        </p>
      </div>

      {/* Academic Minor Project & Developer Banner */}
      <div className="rounded-3xl p-6 bg-slate-900 border-2 border-emerald-500/50 shadow-xl relative overflow-hidden text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Developer Card */}
          <div className="flex items-start gap-4">
            <img
              src="/ritik_profile.jpg"
              alt="Ritik Kumar"
              className="w-16 h-20 rounded-xl object-cover object-[center_18%] border-2 border-emerald-400 shadow-lg shadow-emerald-950/80 shrink-0"
            />
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Project Developer
              </span>
              <h3 className="text-lg font-black text-white">
                Ritik Kumar
              </h3>
              <p className="text-sm font-mono font-bold text-emerald-300">
                Roll No: 2023UG2062
              </p>
              <p className="text-xs text-slate-300 font-medium">
                Batch 2023 – 2027 • Semester 7
              </p>
            </div>
          </div>

          {/* Supervisor Card */}
          <div className="flex items-start gap-3.5 border-t sm:border-t-0 sm:border-l border-slate-700 pt-4 sm:pt-0 sm:pl-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-teal-700/50 shrink-0">
              RP
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Project Supervisor
              </span>
              <h3 className="text-lg font-black text-white">
                Dr. Rashmi Panda
              </h3>
              <p className="text-sm font-bold text-teal-300">
                IIIT Ranchi
              </p>
              <p className="text-xs text-slate-300">
                Indian Institute of Information Technology, Ranchi
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Pipeline Architecture Walkthrough */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider px-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" />
          <span>Neural Pipeline Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {steps.map((step) => (
            <div
              key={step.num}
              className="glass-card-neo rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 shrink-0 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">
                  {step.num}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & Benchmark Metrics Table */}
      <div className="glass-card-neo rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Mendeley Vegetable Leaf Dataset
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              1,923 high-resolution field images across 17 disease and healthy classes
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-4">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Images</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">1,923</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Vegetable Crops</span>
            <p className="text-lg font-black text-emerald-500 mt-0.5">4 Species</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Disease Classes</span>
            <p className="text-lg font-black text-teal-500 mt-0.5">17 Total</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Stratified Split</span>
            <p className="text-lg font-black text-cyan-500 mt-0.5">70/15/15</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Class imbalance (ranging from 54 to 260 images per class) is addressed using **balanced inverse-frequency class weights** and real-time random rotation, flips, zoom, and contrast augmentations during two-stage transfer learning.
        </p>
      </div>

      {/* Privacy & Zero-Cloud Guarantee */}
      <div className="glass-card-neo rounded-3xl p-6 border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            100% Client-Side Privacy & Offline Independence
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
            Unlike cloud-based AI services that upload personal farm photos to third-party servers, LeafScan runs **fully inside your browser** using TensorFlow.js via WebGL shaders. No photos ever leave your device for classification.
          </p>
        </div>
      </div>
    </div>
  );
}
