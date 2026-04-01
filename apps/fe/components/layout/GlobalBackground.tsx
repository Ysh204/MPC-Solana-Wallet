"use client";

import { AnimatedWaves } from "./AnimatedWaves";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none">
      {/* ── The SVG Wave Animation — bright and vivid ── */}
      <div className="absolute inset-0 opacity-80">
        <AnimatedWaves />
      </div>

      {/* ── Background Micro-Particles (Subtle Grid) ── */}
      <div 
        className="absolute inset-0 opacity-[0.04] text-white" 
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      {/* ── Global Radial Glows — brighter ── */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] blur-[150px] -translate-y-1/2 translate-x-1/4" style={{ background: 'rgba(139,92,246,0.18)' }} />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] blur-[150px] translate-y-1/2 -translate-x-1/4" style={{ background: 'rgba(98,214,255,0.12)' }} />
      
      {/* ── Third central bloom orb ── */}
      <div 
        className="absolute w-[900px] h-[500px] blur-[200px]" 
        style={{ background: 'rgba(139,92,246,0.07)', top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }} 
      />

      {/* ── Noise texture overlay ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={4} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
