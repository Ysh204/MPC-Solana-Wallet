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
      setStatus({
        kind: "error",
        msg: error?.message || "Failed to update profile.",
      });
      setTimeout(() => setStatus({ kind: "", msg: "" }), 4000);
    }
  }

  const buttonStyles = (() => {
    if (status.kind === "loading") return "btn btn-primary opacity-60 px-8";
    if (status.kind === "success") {
      return "btn px-8 border border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (status.kind === "error") {
      return "btn px-8 border border-rose-200 bg-rose-50 text-rose-700";
    }
    return "btn btn-primary px-8";
  })();

  const buttonIcon = (() => {
    if (status.kind === "loading")
      return <Loader2 size={16} className="animate-spin" />;
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
        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/78 p-8 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] print:hidden [background-image:linear-gradient(to_right,rgba(15,23,42,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="pointer-events-none absolute inset-0 print:hidden bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.09),transparent_70%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.07),transparent_60%)]" />

          <div className="relative z-10 w-full">
            <header className="mb-8">
              <div className="dashboard-chip dashboard-chip-strong mb-4">
                <Sparkles size={14} />
                Account settings
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Wallet profile{" "}
                <span className="landing-gradient">settings</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Keep the wallet profile clean and recognizable while the MPC
                infrastructure handles signing behind the scenes.
              </p>
            </header>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
                <span className="text-xs font-bold uppercase tracking-[0.26em] text-blue-700">
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
                          border: "1px solid rgba(37,99,235,0.16)",
                          background: "#f8fafc",
                        }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-black text-slate-950">
                            {(displayName || profile?.displayName || "?")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#71868d]">
                          Wallet identity
                        </p>
                        <h2 className="text-2xl font-extrabold text-slate-950">
                          {displayName ||
                            profile?.displayName ||
                            "Unnamed profile"}
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                            <UserRound size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Public identity
                            </p>
                            <p className="text-xs text-slate-500">
                              Display name and avatar used across the app.
                            </p>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">
                          A small amount of profile metadata makes the wallet
                          dashboard feel personal without adding extra product
                          surface area.
                        </p>
                      </div>

                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                            <ShieldCheck size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Provisioned wallet
                            </p>
                            <p className="text-xs text-slate-500">
                              The aggregated public key currently attached to
                              your account.
                            </p>
                          </div>
                        </div>
                        <p className="break-all text-sm leading-6 text-slate-600">
                          {profile?.publicKey || "Wallet not provisioned yet."}
                        </p>
                      </div>

                      <div className="dashboard-soft-panel rounded-[var(--radius-md)] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                            <FileText size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Bio
                            </p>
                            <p className="text-xs text-slate-500">
                              Optional text displayed in the wallet UI.
                            </p>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">
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
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
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
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                              Preview
                            </p>
                            <div
                              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full"
                              style={{
                                border: "1px solid rgba(37,99,235,0.16)",
                                background: "#f8fafc",
                              }}
                            >
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt="Avatar preview"
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (
                                      e.currentTarget as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <User size={24} className="text-slate-400" />
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

                      <div className="h-px w-full bg-slate-200/80" />

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
                        <p className="mt-1 text-right text-[10px] text-slate-500">
                          {bio.length}/280
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            status.kind === "error"
                              ? "text-rose-700"
                              : status.kind === "success"
                                ? "text-emerald-700"
                                : "text-slate-600"
                          }`}
                        >
                          {status.msg ||
                            "These settings only affect the wallet profile UI."}
                        </span>

                        <button
                          type="submit"
                          disabled={status.kind === "loading"}
                          className={buttonStyles}
                        >
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
