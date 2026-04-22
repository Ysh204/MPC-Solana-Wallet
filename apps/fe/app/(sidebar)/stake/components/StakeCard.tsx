"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStaking } from "../../../../hooks/staking/useStaking";

export function StakeCard() {
  const [amount, setAmount] = useState('');
  const { stake, loading, userStake } = useStaking();
  const { connected } = useWallet();

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount))) return;
    await stake(Number(amount));
    setAmount('');
  };

  const stakedBalance = userStake ? (userStake.stakedAmount.toNumber() / 1e9).toFixed(2) : "0.00";

  return (
    <div className="dashboard-panel flex flex-col relative text-left h-full justify-between">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Stake SOL</h2>
        <p className="text-white/60 text-sm">
          Your Active Stake: <span className="text-white font-mono">{stakedBalance} SOL</span>
        </p>
      </div>

      <div className="relative mb-8 flex-grow">
        {/* Tightly wrap the input and label together */}
        <div className="relative w-full">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full h-24 bg-[#0a0c14] border border-white/[0.03] rounded-2xl py-4 pl-6 pr-16 text-3xl text-white/80 font-mono outline-none focus:border-[#2d8e9d]/40 transition-all placeholder:text-white/40"
          />
          {/* inset-y-0 and flex items-center guarantees perfect vertical centering */}
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none z-20">
            <span className="text-white/50 font-bold text-sm">SOL</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleStake}
        disabled={!connected || loading || !amount}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6b47a1] to-[#2d8e9d] text-white/90 font-bold tracking-widest uppercase hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Stake Now'}
      </button>
    </div>
  );
}