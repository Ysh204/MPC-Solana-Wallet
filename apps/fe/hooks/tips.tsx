"use client";

import { useCallback, useEffect, useState } from "react";
import { getTips, type TipRecord } from "../lib/api";

export function useTips() {
  const [sent, setSent] = useState<TipRecord[]>([]);
  const [received, setReceived] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTips(token);
      setSent(data.sent);
      setReceived(data.received);
    } catch (e) {
      console.error("Failed to load tips", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTips(); }, [fetchTips]);

  return { sent, received, loading, refresh: fetchTips };
}
