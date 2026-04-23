"use client";

import { AnimatedWaves } from "./AnimatedWaves";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none">
      <div className="absolute inset-0 opacity-55 print:hidden">
        <AnimatedWaves />
      </div>

      <div
        className="absolute inset-0 opacity-[0.02] text-slate-700 print:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div
        className="absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/2 translate-x-1/4 blur-[150px] print:hidden"
        style={{ background: "rgba(59,130,246,0.12)" }}
      />
      <div
        className="absolute bottom-0 left-0 h-[700px] w-[700px] -translate-x-1/4 translate-y-1/2 blur-[150px] print:hidden"
        style={{ background: "rgba(20,184,166,0.09)" }}
      />

      <div
        className="absolute h-[900px] w-[500px] blur-[200px] print:hidden"
        style={{
          background: "rgba(217,119,6,0.06)",
          top: "34%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-[0.02] pointer-events-none print:hidden">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={4}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
