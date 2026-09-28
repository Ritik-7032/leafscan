import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Sparkles } from '@react-three/drei';
import { 
  GraduationCap, 
  UserCheck, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  Calendar, 
  Layers, 
  Award,
  BookOpen,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Tilt from 'react-parallax-tilt';

/* -------------------------------------------------------------
   3D Holographic Crest Component
------------------------------------------------------------- */
function HolographicCrest() {
  const innerRingRef = useRef();
  const outerRingRef = useRef();
  const coreRef = useRef();

  useFrame((state, delta) => {
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x += delta * 0.7;
      innerRingRef.current.rotation.y += delta * 0.5;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y -= delta * 0.4;
      outerRingRef.current.rotation.z += delta * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={1.2} />
      <pointLight position={[5, 5, 5]} intensity={3} color="#10b981" />
      <pointLight position={[-5, -5, -5]} intensity={2.5} color="#06b6d4" />
      <directionalLight position={[0, 4, 2]} intensity={2} color="#ffffff" />

      <Sparkles count={35} scale={2.5} size={2.5} speed={0.6} color="#34d399" />

      <Float speed={2.5} rotationIntensity={1} floatIntensity={1.2}>
        <Sphere ref={coreRef} args={[0.7, 64, 64]} scale={1}>
          <MeshDistortMaterial
            color="#059669"
            attach="material"
            distort={0.35}
            speed={2}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Sphere>
      </Float>

      <Torus ref={innerRingRef} args={[1.15, 0.03, 16, 64]}>
        <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.9} wireframe />
      </Torus>

      <Torus ref={outerRingRef} args={[1.4, 0.025, 16, 64]}>
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.8} wireframe />
      </Torus>
    </group>
  );
}

/* -------------------------------------------------------------
   High-Contrast, Ultra-Readable 3D Project Modal
------------------------------------------------------------- */
export default function ProjectCreditsModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.55 },
          colors: ['#10b981', '#06b6d4', '#34d399', '#38bdf8', '#fbbf24']
        });
      } catch (e) {}
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      {/* 3D Parallax Tilt Container */}
      <Tilt
        tiltMaxAngleX={4}
        tiltMaxAngleY={4}
        perspective={1000}
        glareEnable={false}
        className="w-full max-w-xl my-auto"
      >
        <div className="relative bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/80 text-white transition-all duration-300">
          
          {/* Close X Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Header Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-extrabold border border-emerald-500/40">
              <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>B.Tech Minor Project Presentation</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
              Semester 7 • 2026
            </span>
          </div>

          {/* 3D Holographic Crest Stage */}
          <div className="relative h-36 sm:h-40 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 mb-4 flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
              <HolographicCrest />
            </Canvas>

            {/* Bottom Overlay Label */}
            <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none px-2">
              <span className="text-xs font-mono tracking-wider text-emerald-300 uppercase font-black bg-slate-900/90 px-4 py-1 rounded-full border border-emerald-500/50 shadow-md">
                LeafScan AI • Edge Diagnostic System
              </span>
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="text-center sm:text-left space-y-1 mb-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              <span className="text-emerald-400">LeafScan</span>
              <span className="text-white">AI Platform</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              On-Device Dual-Head Neural Crop Pathology & Agronomic Prescription Engine
            </p>
          </div>

          {/* High-Contrast Info Cards: Developer & Supervisor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
            
            {/* Student / Developer Card */}
            <div className="rounded-2xl bg-slate-800/90 p-4 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src="/ritik_profile.jpg"
                    alt="Ritik Kumar"
                    className="w-16 h-20 rounded-xl object-cover object-[center_18%] border-2 border-emerald-400 shadow-lg shadow-emerald-950/80"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-slate-950 stroke-[3]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Lead Developer
                  </span>
                  <h3 className="font-black text-base text-white leading-tight">
                    Ritik Kumar
                  </h3>
                  <p className="text-[11px] font-mono font-bold text-emerald-300 mt-0.5">
                    2023UG2062
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-700 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Roll No:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">
                    2023UG2062
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Batch:</span>
                  <span className="font-bold text-white">2023 – 2027</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Semester:</span>
                  <span className="font-bold text-white">Semester 7</span>
                </div>
              </div>
            </div>

            {/* Supervisor & Institute Card */}
            <div className="rounded-2xl bg-slate-800/90 p-4 border border-teal-500/30 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-teal-700/50">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wide block">
                    Project Supervisor
                  </span>
                  <h3 className="font-extrabold text-base text-white leading-tight">
                    Dr. Rashmi Panda
                  </h3>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-700 text-xs">
                <div className="flex items-center gap-1.5 text-teal-300 font-bold">
                  <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>IIIT Ranchi</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-tight font-medium">
                  Indian Institute of Information Technology, Ranchi
                </p>
              </div>
            </div>

          </div>

          {/* Tech Matrix Pill Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-700 text-center mb-5">
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">AI Backbone</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400">MobileNetV3</span>
            </div>
            <div className="border-x border-slate-700">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Pathologies</span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-400">17 Classes</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Inference</span>
              <span className="text-xs sm:text-sm font-extrabold text-cyan-400">&lt; 45ms Edge</span>
            </div>
          </div>

          {/* Large Action Button */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform active:scale-95 cursor-pointer"
          >
            <span>Launch LeafScan AI Platform</span>
            <ArrowRight className="w-5 h-5 text-slate-950 font-black" />
          </button>

        </div>
      </Tilt>
    </div>
  );
}
