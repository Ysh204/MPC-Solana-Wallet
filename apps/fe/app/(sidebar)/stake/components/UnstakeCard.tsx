"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStaking } from "../../../../hooks/staking/useStaking";

export function UnstakeCard() {
  const [amount, setAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { requestUnstake, withdrawUnstake, loading, userStake } = useStaking();
  const { connected } = useWallet();

  const stakedBalance = userStake ? (userStake.stakedAmount.toNumber() / 1e9).toFixed(2) : "0.00";
  const pendingUnstake = userStake ? (userStake.pendingUnstakeAmount.toNumber() / 1e9).toFixed(2) : "0.00";
  const hasPending = userStake && userStake.pendingUnstakeAmount.toNumber() > 0;

  useEffect(() => {
    if (!userStake || userStake.pendingUnstakeAmount.toNumber() === 0) {
      setTimeLeft('');
      setIsUnlocked(false);
      return;
    }

    const updateTimer = () => {
      const unlockTimeStr = userStake.unstakeUnlockTime.toString();
      const unlockTime = parseInt(unlockTimeStr) * 1000;
      const now = Date.now();

      if (now >= unlockTime) {
        setTimeLeft('Unlocked & Ready!');
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
        const diff = unlockTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Unlocking in: ${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [userStake]);

  const handleAction = async () => {
    if (hasPending && isUnlocked) {
      await withdrawUnstake();
    } else if (!hasPending && amount && !isNaN(Number(amount))) {
      await requestUnstake(Number(amount));
      setAmount('');
    }
  };

  return (
    <div className="dashboard-panel flex flex-col relative text-left h-full justify-between">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Unstake SOL</h2>
        <p className="text-white/60 text-sm">
          Staked Balance: <span className="text-white font-mono">{stakedBalance} SOL</span>
        </p>
      </div>

      <div className="relative mb-8 flex-grow">
        {!hasPending ? (
          <>
            {/* Tightly wrap the input and label together */}
            <div className="relative w-full">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-24 bg-[#0a0c14] border border-white/[0.03] rounded-2xl py-4 pl-6 pr-16 text-3xl text-white/80 font-mono outline-none focus:border-[#4d3257]/40 transition-all placeholder:text-white/40"
              />
              {/* inset-y-0 and flex items-center guarantees perfect vertical centering */}
              <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none z-20">
                <span className="text-white/50 font-bold text-sm">SOL</span>
              </div>
            </div>

            <p className="text-white/40 text-[11px] mt-3 flex items-center gap-1.5 opacity-75 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              24-hour lockup applies
            </p>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full py-2">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Pending Unstake</p>
            <p className="text-4xl font-mono font-bold text-white mb-2">{pendingUnstake} <span className="text-lg">SOL</span></p>
            <p className={`text-sm font-medium px-3 py-1 rounded-full ${isUnlocked ? 'text-[#2d8e9d] bg-[#2d8e9d]/10' : 'text-[#8a426f] bg-[#8a426f]/10'}`}>
              {timeLeft}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleAction}
        disabled={!connected || loading || (!hasPending && !amount)}
        className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 ${hasPending && isUnlocked
          ? 'bg-[#2d8e9d] text-white'
          : 'bg-[#3b2a47] text-[#a48ab5]'
          }`}
      >
        {loading ? 'Processing...' : hasPending && isUnlocked ? 'Withdraw SOL' : hasPending ? 'Locked' : 'Request Unstake'}
      </button>
    </div>
  );
}