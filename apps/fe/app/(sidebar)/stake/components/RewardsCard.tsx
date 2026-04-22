"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStaking } from "../../../../hooks/staking/useStaking";

export function RewardsCard() {
  const { userStake, claimRewards, loading, poolState, walletBalance } = useStaking();
  const { connected } = useWallet();
  const [liveReward, setLiveReward] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const stakedLamports = userStake ? userStake.stakedAmount.toNumber() : 0;
  const rate = poolState ? poolState.rewardRate.toNumber() : 0;
  const rewardPerSec = (stakedLamports * rate) / 1e9;

  useEffect(() => {
    if (!userStake || stakedLamports === 0) {
      setLiveReward(0);
      return;
    }

    const baseRewardLamports = userStake.pendingReward.toNumber();
    const lastUpdateSec = userStake.lastUpdateTime.toNumber();
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsedSinceUpdate = Date.now() / 1000 - lastUpdateSec;
      const projectedReward = baseRewardLamports + (stakedLamports * rate * Math.max(0, elapsedSinceUpdate)) / 1e9;
      setLiveReward(projectedReward / 1e9);
    }, 50);

    return () => clearInterval(interval);
  }, [userStake, poolState, stakedLamports, rate]);

  return (
    <div className="dashboard-panel flex flex-col relative text-left h-full justify-between">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Your Rewards</h2>
        <p className="text-white/60 text-sm">Tokens earned from your active stake</p>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center py-4">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3 opacity-70">PENDING CLAIM</p>
        <p className="text-4xl font-mono font-black text-[#00d2ff] drop-shadow-[0_0_15px_rgba(0,210,255,0.4)] mb-1 leading-none tracking-tighter">
          {liveReward.toFixed(8)}
        </p>
        <p className="text-[#00d2ff]/60 text-[11px] mt-2 font-mono font-medium tracking-wide">
          {rewardPerSec > 0 ? `+${(rewardPerSec / 1e9).toExponential(2)} RTK/sec` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <div className="w-full flex justify-between items-end px-1 pb-1 border-b border-white/[0.04] mb-1">
          <span className="text-white/40 tracking-widest uppercase text-[10px] font-bold pb-2">In Wallet</span>
          <span className="text-white font-mono font-bold text-sm tracking-wide pb-2">
            {(walletBalance || 0).toFixed(2)} <span className="text-white/50 text-xs">RTK</span>
          </span>
        </div>
        <button
          onClick={claimRewards}
          disabled={!connected || loading || liveReward === 0}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6b47a1] to-[#2d8e9d] text-white/90 font-bold tracking-widest uppercase hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Claim Rewards'}
        </button>
      </div>
    </div>
  );
}