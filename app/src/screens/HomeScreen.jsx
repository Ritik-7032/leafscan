import React, { useRef, useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { 
  Camera, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight,
  Activity,
  Layers,
  CheckCircle2,
  X,
  Cpu,
  Zap,
  UploadCloud,
  FileCheck2
} from 'lucide-react';
import Leaf3DHero from '../components/Leaf3DHero';
import { BroccoliIcon, CabbageIcon, CauliflowerIcon, TurnipIcon } from '../components/VegetableIcons';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ onImageSelected, isAnalyzing, analyzingImage, onOpenLiveCamera }) {
  const { isDark } = useTheme();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [selectedVegDetails, setSelectedVegDetails] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      onImageSelected(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const vegetables = [
    {
      id: 'broccoli',
      name: 'Broccoli',
      count: '3 Conditions',
      tag: 'Brassica oleracea',
      icon: <BroccoliIcon className="w-14 h-14" />,
      diseases: ['Alternaria leaf spot', 'Black rot', 'Healthy leaf'],
      accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'cabbage',
      name: 'Cabbage',
      count: '5 Conditions',
      tag: 'Capitata group',
      icon: <CabbageIcon className="w-14 h-14" />,
      diseases: ['Black rot', 'Grey mould', 'Healthy leaf', 'Leaf spots', 'Tip burn'],
      accent: 'from-green-500/20 to-emerald-500/10 border-green-500/40 text-green-600 dark:text-green-400'
    },
    {
      id: 'cauliflower',
      name: 'Cauliflower',
      count: '5 Conditions',
      tag: 'Botrytis group',
      icon: <CauliflowerIcon className="w-14 h-14" />,
      diseases: ['Alternaria leaf spot', 'Bacterial soft rot', 'Black rot', 'Healthy leaf', 'Yellow virus'],
      accent: 'from-teal-500/20 to-cyan-500/10 border-teal-500/40 text-teal-600 dark:text-teal-400'
    },
    {
      id: 'turnip',
      name: 'Turnip',
      count: '4 Conditions',
      tag: 'Brassica rapa',
      icon: <TurnipIcon className="w-14 h-14" />,
      diseases: ['Alternaria leaf spot', 'Black rot', 'Healthy leaf', 'Leaf spots'],
      accent: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400'
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Hidden Native File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Analyzing / Scanning State Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="glass-card-neo rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center border border-emerald-500/40 shadow-2xl neon-glow-emerald">
            <div className="relative w-52 h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/60 mb-5 bg-slate-900">
              {analyzingImage && (
                <img
                  src={analyzingImage}
                  alt="Analyzing Leaf"
                  className="w-full h-full object-cover brightness-90"
                />
              )}
              {/* Glowing Green Scan Line Animation */}
              <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_20px_#34d399] animate-scan-line" />
              <div className="absolute inset-0 bg-emerald-500/15 pointer-events-none" />
              {/* Reticle brackets */}
              <div className="absolute inset-3 border border-dashed border-emerald-400/50 rounded-xl pointer-events-none" />
            </div>
            <div className="flex items-center gap-2 text-leaf-600 dark:text-leaf-400 font-extrabold text-base animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="text-shimmer">Deep Neural Diagnosis...</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Running MobileNetV3 Dual-Head & Grad-CAM Spatial Activation
            </p>
          </div>
        </div>
      )}

      {/* Hero 3D Stage Section */}
      <div className="glass-card-neo rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-slate-200/80 dark:border-emerald-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-shimmer font-black">AI Crop Doctor • MobileNetV3</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-xl leading-tight">
            Vegetable Leaf Disease <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Instant AI Diagnosis
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mt-3 leading-relaxed font-medium">
            Fast, on-device neural diagnosis across Broccoli, Cabbage, Cauliflower & Turnip. Identify 17 leaf conditions with visual Grad-CAM interpretability.
          </p>

          {/* Interactive 3D Bio-Sphere Leaf Canvas */}
          <div className="w-full my-4">
            <Leaf3DHero isDark={isDark} />
          </div>

          {/* Drag & Drop Leaf Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full max-w-lg p-5 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 mb-4 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-500/15 scale-102 shadow-lg shadow-emerald-500/20'
                : 'border-slate-300 dark:border-slate-700/80 hover:border-emerald-500/60 bg-white/40 dark:bg-slate-900/40'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Drag & drop a leaf image here, or use the buttons below
            </p>
            <span className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP (Instant offline classification)</span>
          </div>

          {/* Action Trigger Buttons */}
          <div className="w-full max-w-lg grid grid-cols-1 xs:grid-cols-2 gap-3.5">
            {/* Live Camera Viewfinder */}
            <button
              onClick={onOpenLiveCamera}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 neon-border"
            >
              <Camera className="w-5 h-5 animate-pulse" />
              <span>Open Live Camera</span>
            </button>

            {/* Gallery / File Upload */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="py-4 px-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <span>Select File</span>
            </button>
          </div>

          {/* Native Mobile Camera Option */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1.5 transition"
          >
            <Video className="w-3.5 h-3.5 text-emerald-500" />
            <span>Or open system camera app</span>
          </button>
        </div>
      </div>

      {/* Live AI Neural Stats Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card-neo rounded-2xl p-4 text-center border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Vegetable Accuracy</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">97.4%</p>
        </div>
        <div className="glass-card-neo rounded-2xl p-4 text-center border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Disease Accuracy</span>
          <p className="text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5">91.8%</p>
        </div>
        <div className="glass-card-neo rounded-2xl p-4 text-center border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Inference Latency</span>
          <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">~42 ms</p>
        </div>
        <div className="glass-card-neo rounded-2xl p-4 text-center border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Model Size</span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">&lt; 3.8 MB</p>
        </div>
      </div>

      {/* Supported Crops Showcase (3D Parallax Tilt Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Supported Vegetable Crops</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any vegetable to view all detectable diseases and agronomic treatments
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-sm">
            17 Classes Total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {vegetables.map((veg) => (
            <Tilt
              key={veg.id}
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              scale={1.03}
              transitionSpeed={800}
              className="transform-gpu"
            >
              <div
                onClick={() => setSelectedVegDetails(veg)}
                className="h-full glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center hover:border-emerald-500/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Background ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-115 transition-transform duration-300 drop-shadow-md">
                  {veg.icon}
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {veg.name}
                </h3>
                <span className="text-[10px] text-slate-400 italic">
                  {veg.tag}
                </span>

                <div className="mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                  {veg.count}
                </div>

                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-0.5 group-hover:text-emerald-500 font-bold transition">
                  <span>Explore Diseases</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Tilt>
          ))}
        </div>
      </div>

      {/* Vegetable Disease Detail Modal */}
      {selectedVegDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-card-neo rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedVegDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 shadow-inner">
                {selectedVegDetails.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedVegDetails.name}
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedVegDetails.count} In Deep Learning Model
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Targeted Disease Conditions:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedVegDetails.diseases.map((dis) => {
                  const isHealthy = dis.toLowerCase().includes('healthy');
                  return (
                    <div
                      key={dis}
                      className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-between ${
                        isHealthy
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isHealthy ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{selectedVegDetails.name} {dis}</span>
                      </span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/30">
                        {isHealthy ? 'Healthy' : 'Pathogen'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedVegDetails(null);
                onOpenLiveCamera();
              }}
              className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Scan {selectedVegDetails.name} Leaf Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Novelty Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-emerald-500/40 transition">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Two-Head Architecture</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              One shared MobileNetV3 backbone simultaneously predicts Crop species and Disease pathogen.
            </p>
          </div>
        </div>

        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-teal-500/40 transition">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Grad-CAM Heatmap</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Transparent gradient overlay shows exactly which leaf regions drove the disease prediction.
            </p>
          </div>
        </div>

        <div className="glass-card-neo rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-amber-500/40 transition">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">60% Safety Threshold</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Prevents hallucinated predictions on non-plant objects, faces, or ambiguous leaf captures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
