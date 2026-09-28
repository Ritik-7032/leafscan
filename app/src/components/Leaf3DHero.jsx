import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles, ContactShadows, MeshWobbleMaterial, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Rotate3d, Sparkles as SparkleIcon, Zap, Eye, ShieldCheck, Sun } from 'lucide-react';

// Ultra-realistic 3D Leaf with undulating organic motion & multi-modes
function OrganicLeafModel({ isDark, mode }) {
  const meshRef = useRef();
  const veinRef = useRef();

  // Create curved botanical shape
  const { leafGeometry, veinGeometry } = React.useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -2.4);
    // Smooth natural botanical curvature
    shape.bezierCurveTo(1.8, -1.2, 2.4, 0.7, 0, 2.6);
    shape.bezierCurveTo(-2.4, 0.7, -1.8, -1.2, 0, -2.4);

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 3,
      bevelSize: 0.06,
      bevelThickness: 0.05
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();

    // Central Midrib Vein Tube
    const veinCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2.5, 0.06),
      new THREE.Vector3(0, 0, 0.09),
      new THREE.Vector3(0, 2.5, 0.06)
    ]);
    const veinGeom = new THREE.TubeGeometry(veinCurve, 32, 0.05, 10, false);

    return { leafGeometry: geom, veinGeometry: veinGeom };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.45;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.09;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.09;
    }
  });

  const isWireframe = mode === 'wireframe';
  const isDiagnostic = mode === 'diagnostic';

  return (
    <group ref={meshRef}>
      {/* Primary Leaf Blade */}
      <mesh geometry={leafGeometry} castShadow receiveShadow>
        {isWireframe ? (
          <meshStandardMaterial
            color="#34d399"
            wireframe
            emissive="#10b981"
            emissiveIntensity={0.8}
          />
        ) : isDiagnostic ? (
          <meshPhysicalMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.3}
            opacity={0.9}
            transparent
            side={THREE.DoubleSide}
          />
        ) : (
          <meshPhysicalMaterial
            color={isDark ? "#10b981" : "#059669"}
            emissive={isDark ? "#064e3b" : "#047857"}
            emissiveIntensity={0.3}
            roughness={0.28}
            metalness={0.12}
            clearcoat={0.7}
            clearcoatRoughness={0.2}
            reflectivity={0.9}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Central Botanical Vein */}
      <mesh geometry={veinGeometry}>
        <meshStandardMaterial
          color={isDiagnostic ? "#a5f3fc" : isWireframe ? "#6ee7b7" : "#d1fae5"}
          emissive={isDiagnostic ? "#22d3ee" : "#10b981"}
          emissiveIntensity={isDiagnostic ? 0.8 : 0.2}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Bio-Luminescent floating particle halo */}
      <Sparkles
        count={isDiagnostic ? 45 : 30}
        scale={4.8}
        size={isDiagnostic ? 3.5 : 2.2}
        speed={0.5}
        opacity={0.75}
        color={isDiagnostic ? "#38bdf8" : "#34d399"}
      />
    </group>
  );
}

function StaticLeafFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-44 h-44 rounded-full bg-gradient-to-tr from-leaf-600/30 via-emerald-400/20 to-teal-500/30 flex items-center justify-center animate-pulse-glow shadow-inner">
        <svg viewBox="0 0 100 100" className="w-32 h-32 text-leaf-500 drop-shadow-2xl animate-float-slow">
          <path
            d="M50 8 C80 8 94 35 94 62 C94 88 74 96 50 96 C26 96 6 88 6 62 C6 35 20 8 50 8 Z"
            fill="currentColor"
          />
          <path d="M50 10 L50 94" stroke="#d1fae5" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
          <path d="M50 32 Q70 38 80 46" stroke="#d1fae5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          <path d="M50 54 Q30 60 20 68" stroke="#d1fae5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          <path d="M50 72 Q68 78 76 82" stroke="#d1fae5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>
      <span className="text-xs font-bold text-leaf-600 dark:text-leaf-400 mt-3 flex items-center gap-1.5">
        <SparkleIcon className="w-3.5 h-3.5" />
        3D Bio-Neural Engine Active
      </span>
    </div>
  );
}

export default function Leaf3DHero({ isDark }) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [mode, setMode] = useState('organic'); // 'organic' | 'diagnostic' | 'wireframe'

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!gl || prefersReduced) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }

    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  if (!hasWebGL || !isVisible) {
    return <StaticLeafFallback />;
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Viewport Stage */}
      <div className="w-full h-60 sm:h-72 cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden relative">
        <Suspense fallback={<StaticLeafFallback />}>
          <Canvas
            camera={{ position: [0, 0, 5.2], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[6, 9, 6]} intensity={2.4} color="#ffffff" />
            <pointLight position={[-5, -3, -2]} intensity={1.5} color="#34d399" />
            <pointLight position={[4, -2, 4]} intensity={1.2} color="#06b6d4" />
            <spotLight position={[0, 8, 2]} intensity={1.8} angle={0.6} penumbra={1} color="#a7f3d0" />

            <Float speed={2.8} rotationIntensity={0.7} floatIntensity={0.9}>
              <OrganicLeafModel isDark={isDark} mode={mode} />
            </Float>

            <ContactShadows position={[0, -2.6, 0]} opacity={0.5} scale={6.5} blur={2.8} far={4.5} color="#022c22" />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
          </Canvas>
        </Suspense>

        {/* Floating 3D Interaction Mode Selector */}
        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 px-3 pointer-events-auto">
          <button
            onClick={() => setMode('organic')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all backdrop-blur-md flex items-center gap-1 shadow-md ${
              mode === 'organic'
                ? 'bg-emerald-600 text-white shadow-emerald-500/40 scale-105'
                : 'bg-white/70 dark:bg-slate-900/75 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <SparkleIcon className="w-3 h-3" />
            <span>3D Organic</span>
          </button>

          <button
            onClick={() => setMode('diagnostic')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all backdrop-blur-md flex items-center gap-1 shadow-md ${
              mode === 'diagnostic'
                ? 'bg-cyan-600 text-white shadow-cyan-500/40 scale-105'
                : 'bg-white/70 dark:bg-slate-900/75 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Bio-Scanner</span>
          </button>

          <button
            onClick={() => setMode('wireframe')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all backdrop-blur-md flex items-center gap-1 shadow-md ${
              mode === 'wireframe'
                ? 'bg-purple-600 text-white shadow-purple-500/40 scale-105'
                : 'bg-white/70 dark:bg-slate-900/75 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3 h-3 text-purple-400" />
            <span>Neural Mesh</span>
          </button>
        </div>
      </div>

      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
        <Rotate3d className="w-3.5 h-3.5 text-leaf-500" />
        Drag to rotate in 3D • Touch or click anywhere to spin
      </p>
    </div>
  );
}
