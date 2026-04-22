"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AtSign, Lock, LockKeyhole, ShieldCheck } from "lucide-react";

import { signin } from "../../lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/wallet");
      return;
    }
    setCheckingSession(false);
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { token } = await signin({ email, password });
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      router.replace("/wallet");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="fixed inset-0 z-0 bg-[#050507]/80" />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 60%)",
        }}
      />

      <section className="dashboard-panel relative z-10 mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <div
            className="animate-pulse-glow-staking relative mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius)]"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(98,214,255,0.1))",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 40px rgba(139,92,246,0.2), 0 0 0 8px rgba(139,92,246,0.06)",
            }}
          >
            <ShieldCheck size={34} className="text-white" />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-white">
            Sign in to your wallet
          </h1>
          <p className="mt-2 text-[#9aa3b2]">
            Access your Solana wallet protected by multi-party computation.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Email address
            </label>
            <div className="relative">
              <AtSign
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f747c]"
              />
              <input
                className="dashboard-input !pl-11"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }} />

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f747c]"
              />
              <input
                className="dashboard-input !pl-11"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <button disabled={loading} className="btn btn-primary mt-2 w-full" type="submit">
            <LockKeyhole size={16} />
            {loading ? "Authenticating..." : "Unlock wallet"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: "rgba(98,214,255,0.04)",
              border: "1px solid rgba(98,214,255,0.1)",
            }}
          >
            <ShieldCheck size={14} className="text-[#62d6ff]" />
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-[#7db8c0]">
              Protected by multi-party computation
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
