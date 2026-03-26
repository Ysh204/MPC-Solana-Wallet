"use client";

import { useCallback, useEffect, useState } from "react";
import { getCreators, getCreator, type Creator, type CreatorDetail } from "../lib/api";

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCreators(token);
      setCreators(data.creators);
    } catch (e) {
      console.error("Failed to load creators", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  return { creators, loading, refresh: fetchCreators };
}

export function useCreator(id: string) {
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreator = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCreator(token, id);
      setCreator(data.creator);
    } catch (e: any) {
      setError(e?.message || "Failed to load creator");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCreator(); }, [fetchCreator]);

  return { creator, loading, error, refresh: fetchCreator };
}
