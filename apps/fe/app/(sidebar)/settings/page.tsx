"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { getProfile, updateProfile, type UserProfile } from "../../../lib/api";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState<{
    kind: "success" | "error" | "loading" | "";
    msg: string;
  }>({ kind: "", msg: "" });

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getProfile(token);
        setProfile(data.user);
        setDisplayName(data.user.displayName || "");
        setBio(data.user.bio || "");
        setAvatarUrl(data.user.avatarUrl || "");
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading", msg: "Saving profile..." });

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateProfile(token, {
        displayName,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              displayName,
              bio,
              avatarUrl,
            }
          : current,
      );
      setStatus({ kind: "success", msg: "Profile updated successfully." });
      setTimeout(() => setStatus({ kind: "", msg: "" }), 2000);
    } catch (error: any) {
      setStatus({ kind: "error", msg: error?.message || "Failed to update profile." });
      setTimeout(() => setStatus({ kind: "", msg: "" }), 4000);
    }
  }

  const buttonStyles = (() => {
    if (status.kind === "loading") return "btn btn-primary opacity-60 px-8";
    if (status.kind === "success") {
      return "btn px-8 border border-[#4ade80]/25 bg-[#4ade80]/20 text-[#4ade80]";
    }
    if (status.kind === "error") {
      return "btn px-8 border border-[#fb7185]/25 bg-[#fb7185]/20 text-[#fb7185]";
    }
    return "btn btn-primary px-8";
  })();

  const buttonIcon = (() => {
    if (status.kind === "loading") return <Loader2 size={16} className="animate-spin" />;
    if (status.kind === "success") return <CheckCircle size={16} />;
    if (status.kind === "error") return <AlertCircle size={16} />;
    return <Save size={16} />;
  })();

  const buttonText = (() => {
    if (status.kind === "loading") return "Saving...";
    if (status.kind === "success") return "Saved";
    if (status.kind === "error") return "Retry";
    return "Save changes";
  })();

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1350px]" id="settings-page">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-black/20 p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(162,92,246,0.08),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(0,210,255,0.06),transparent_60%)]" />

          <div className="relative z-10 w-full">
            <header className="mb-8">
              <div className="dashboard-chip dashboard-chip-strong mb-4">
                <Sparkles size={14} />
                Account settings
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Wallet profile <span className="landing-gradient">settings</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-[#8ba2aa]">
                Keep the wallet profile clean and recognizable while the MPC
                infrastructure handles signing behind the scenes.
              </p>
            </header>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#8b5cf6]/40 border-t-[#b58cff]" />
                <span className="text-xs font-bold uppercase tracking-[0.26em] text-[#b58cff]">
                  Loading profile
                </span>
              </div>
            ) : (
              <ScrollReveal>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                  <div className="dashboard-panel">
                    <div className="mb-6 flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--radius)]"
                        style={{
                          border: "1px solid rgba(139,92,246,0.2)",
                          background: "#0f1822",
                        }}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-white">
                            {(displayName || profile?.displayName || "?").slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                          Wallet identity
                        </p>
                        <h2 className="text-2xl font-extrabold text-white">
                          {displayName || profile?.displayName || "Unnamed profile"}
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                            <UserRound size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Public identity</p>
                            <p className="text-xs text-[#80969e]">Display name and avatar used across the app.</p>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-[#8ba1a9]">
                          A small amount of profile metadata makes the wallet dashboard feel personal without adding extra product surface area.
                        </p>
                      </div>

                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                            <ShieldCheck size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Provisioned wallet</p>
                            <p className="text-xs text-[#80969e]">The aggregated public key currently attached to your account.</p>
                          </div>
                        </div>
                        <p className="break-all text-sm leading-6 text-[#8ba1a9]">
                          {profile?.publicKey || "Wallet not provisioned yet."}
                        </p>
                      </div>

                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                            <FileText size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Bio</p>
                            <p className="text-xs text-[#80969e]">Optional text displayed in the wallet UI.</p>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-[#8ba1a9]">
                          {bio || "No bio added yet."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-panel">
                    <form onSubmit={handleSave} className="flex flex-col gap-5">
                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                          Display name
                        </label>
                        <div className="relative">
                          <input
                            className="dashboard-input pr-16"
                            placeholder="e.g. Solana Builder"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            minLength={1}
                            maxLength={40}
                          />
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#5f747c]">
                            {displayName.length}/40
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                          Avatar URL
                        </label>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5f747c]">
                              Preview
                            </p>
                            <div
                              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full"
                              style={{
                                border: "1px solid rgba(139,92,246,0.2)",
                                background: "#0f1822",
                              }}
                            >
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt="Avatar preview"
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <User size={24} className="text-white/40" />
                              )}
                            </div>
                          </div>
                          <input
                            className="dashboard-input flex-1"
                            type="url"
                            placeholder="https://example.com/avatar.png"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }} />

                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                          Bio
                        </label>
                        <textarea
                          className="dashboard-input min-h-[100px] resize-none"
                          style={{ fontFamily: "var(--sans)", height: "auto" }}
                          placeholder="Add a short note about this wallet or the environment it is used for."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          maxLength={280}
                          rows={4}
                        />
                        <p className="mt-1 text-right text-[10px] text-[#5f747c]">
                          {bio.length}/280
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            status.kind === "error"
                              ? "text-[#fb7185]"
                              : status.kind === "success"
                                ? "text-[#4ade80]"
                                : "text-[#8ba1a9]"
                          }`}
                        >
                          {status.msg || "These settings only affect the wallet profile UI."}
                        </span>

                        <button type="submit" disabled={status.kind === "loading"} className={buttonStyles}>
                          {buttonIcon}
                          {buttonText}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
