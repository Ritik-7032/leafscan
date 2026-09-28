import React from 'react';

export function BroccoliIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="brocStem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#84cc16" />
          <stop offset="100%" stop-color="#4d7c0f" />
        </linearGradient>
        <linearGradient id="brocHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#15803d" />
          <stop offset="50%" stop-color="#166534" />
          <stop offset="100%" stop-color="#14532d" />
        </linearGradient>
      </defs>
      {/* Stalk */}
      <path d="M26 34 L24 54 C24 58 40 58 40 54 L38 34 Z" fill="url(#brocStem)" />
      <path d="M26 38 L20 46 M38 38 L44 46" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
      {/* Florets */}
      <circle cx="32" cy="20" r="13" fill="url(#brocHead)" />
      <circle cx="21" cy="26" r="11" fill="url(#brocHead)" />
      <circle cx="43" cy="26" r="11" fill="url(#brocHead)" />
      <circle cx="32" cy="30" r="12" fill="url(#brocHead)" />
      {/* Floret details */}
      <circle cx="28" cy="18" r="2.5" fill="#4ade80" opacity="0.6" />
      <circle cx="36" cy="22" r="2.5" fill="#4ade80" opacity="0.6" />
      <circle cx="20" cy="28" r="2" fill="#4ade80" opacity="0.6" />
      <circle cx="44" cy="28" r="2" fill="#4ade80" opacity="0.6" />
      <circle cx="32" cy="32" r="2.5" fill="#4ade80" opacity="0.6" />
    </svg>
  );
}

export function CabbageIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cabbageOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="100%" stop-color="#15803d" />
        </linearGradient>
        <linearGradient id="cabbageInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#86efac" />
          <stop offset="100%" stop-color="#4ade80" />
        </linearGradient>
      </defs>
      {/* Outer wrapper leaves */}
      <ellipse cx="32" cy="35" rx="26" ry="22" fill="url(#cabbageOuter)" />
      <path d="M10 32 C10 18 24 12 32 14 C20 18 16 32 18 45 Z" fill="#16a34a" />
      <path d="M54 32 C54 18 40 12 32 14 C44 18 48 32 46 45 Z" fill="#16a34a" />
      {/* Inner head */}
      <circle cx="32" cy="35" r="18" fill="url(#cabbageInner)" />
      {/* Leaf veins */}
      <path d="M32 18 Q30 32 32 52" stroke="#dcfce7" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M32 30 Q22 28 18 36" stroke="#dcfce7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M32 34 Q42 32 46 40" stroke="#dcfce7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M32 42 Q24 44 22 50" stroke="#dcfce7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M32 44 Q40 46 42 50" stroke="#dcfce7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function CauliflowerIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cauliCurd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <linearGradient id="cauliLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#16a34a" />
          <stop offset="100%" stop-color="#14532d" />
        </linearGradient>
      </defs>
      {/* Outer protective green leaves */}
      <path d="M32 56 C14 56 6 38 10 24 C16 34 22 46 32 50 Z" fill="url(#cauliLeaf)" />
      <path d="M32 56 C50 56 58 38 54 24 C48 34 42 46 32 50 Z" fill="url(#cauliLeaf)" />
      <path d="M32 58 C26 48 20 28 26 12 C28 24 30 46 32 58 Z" fill="#15803d" />
      <path d="M32 58 C38 48 44 28 38 12 C36 24 34 46 32 58 Z" fill="#15803d" />
      {/* Cauliflower curd head florets */}
      <circle cx="32" cy="30" r="10" fill="url(#cauliCurd)" />
      <circle cx="23" cy="28" r="8" fill="url(#cauliCurd)" />
      <circle cx="41" cy="28" r="8" fill="url(#cauliCurd)" />
      <circle cx="26" cy="38" r="8" fill="url(#cauliCurd)" />
      <circle cx="38" cy="38" r="8" fill="url(#cauliCurd)" />
      <circle cx="32" cy="22" r="7" fill="url(#cauliCurd)" />
      {/* Curd granule highlights */}
      <circle cx="32" cy="29" r="1.5" fill="#cbd5e1" />
      <circle cx="24" cy="27" r="1.5" fill="#cbd5e1" />
      <circle cx="40" cy="27" r="1.5" fill="#cbd5e1" />
      <circle cx="28" cy="37" r="1.5" fill="#cbd5e1" />
      <circle cx="36" cy="37" r="1.5" fill="#cbd5e1" />
    </svg>
  );
}

export function TurnipIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="turnipPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9333ea" />
          <stop offset="60%" stop-color="#7e22ce" />
          <stop offset="100%" stop-color="#581c87" />
        </linearGradient>
        <linearGradient id="turnipWhite" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#7e22ce" />
          <stop offset="35%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <linearGradient id="turnipGreens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="100%" stop-color="#16a34a" />
        </linearGradient>
      </defs>
      {/* Top Green Foliage */}
      <path d="M32 26 C28 14 18 8 14 6 C20 14 26 22 30 26 Z" fill="url(#turnipGreens)" />
      <path d="M32 26 C36 14 46 8 50 6 C44 14 38 22 34 26 Z" fill="url(#turnipGreens)" />
      <path d="M32 24 C32 10 32 4 32 2 C32 10 32 18 32 24 Z" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      {/* Bulb Root Body */}
      <path d="M14 35 C14 25 22 24 32 24 C42 24 50 25 50 35 C50 46 38 56 32 60 C26 56 14 46 14 35 Z" fill="url(#turnipWhite)" />
      {/* Purple Shoulder Crown */}
      <path d="M14 34 C14 25 22 24 32 24 C42 24 50 25 50 34 C44 38 38 38 32 38 C26 38 20 38 14 34 Z" fill="url(#turnipPurple)" />
      {/* Taproot tail */}
      <path d="M32 58 Q31 63 32 64" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
