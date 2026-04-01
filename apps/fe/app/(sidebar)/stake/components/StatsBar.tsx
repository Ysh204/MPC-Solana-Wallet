"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useStaking } from "../../../../hooks/staking/useStaking";

export function StatsBar() {
  const { poolState } = useStaking();
  const { connected } = useWallet();

  const totalStaked = useMemo(() => {
    if (!poolState) return "0.00";
    return (poolState.totalStaked.toNumber() / 1e9).toFixed(2);
  }, [poolState]);

  const apy = useMemo(() => {
    if (!poolState) return "0%";
    const ratePerSec = poolState.rewardRate.toNumber();
    const yearlyRate = ratePerSec * 86400 * 365;
    const apyValue = (yearlyRate / 1e9) * 100;
    return `${apyValue.toFixed(0)}%`;
  }, [poolState]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {/* ── Total Staked Pill ── */}
      <div className="flex h-12 items-center gap-3 rounded-full border border-white/[0.04] bg-white/[0.02] backdrop-blur-xl px-6 shadow-lg">
        <TrendingUp size={16} className="text-[#8b5cf6]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
          Total value staked
        </span>
        <span className="ml-1 font-mono text-sm font-bold text-white">
          {totalStaked} <span className="ml-0.5 text-white/50 text-[10px]">SOL</span>
        </span>
      </div>

      {/* ── APR Pill ── */}
      <div className="flex h-12 items-center gap-3 rounded-full border border-white/[0.04] bg-white/[0.02] backdrop-blur-xl pl-6 pr-2 shadow-lg">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
          Current APR
        </span>
        <div className="ml-1 flex h-8 items-center rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20 px-3">
          <span className="font-mono text-sm font-bold text-[#00d2ff] drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]">
            {apy}
          </span>
        </div>
      </div>

      {/* ── Network Status Pill ── */}
      <div className="flex h-12 items-center gap-3 rounded-full border border-white/[0.04] bg-white/[0.02] backdrop-blur-xl px-6 shadow-lg">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
          Network status
        </span>
        <div className="ml-1 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${connected
              ? "bg-[#4ade80] shadow-[0_0_8px_#4ade80]"
              : "bg-red-500 shadow-[0_0_8px_#ef4444]"
              }`}
          />
          <span className="text-[11px] font-bold uppercase tracking-widest text-white">
            {connected ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}