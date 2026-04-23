"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";

interface StatusNotificationProps {
  kind: "success" | "error" | "loading" | "";
  message: string;
}

export default function StatusNotification({
  kind,
  message,
}: StatusNotificationProps) {
  if (!message) return null;

  const icon =
    kind === "success" ? (
      <CheckCircle size={18} className="shrink-0 text-[#4ade80]" />
    ) : kind === "error" ? (
      <XCircle size={18} className="shrink-0 text-[#fb7185]" />
    ) : kind === "loading" ? (
      <Loader2 size={18} className="shrink-0 animate-spin text-[#2563eb]" />
    ) : null;

  return (
    <div className={`status-bar status-${kind}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
          {kind === "loading" ? "Processing" : kind}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
