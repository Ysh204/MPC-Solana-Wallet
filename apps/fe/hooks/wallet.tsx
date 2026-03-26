"use client";

import { useCallback, useEffect, useState } from "react";
import { getWallet, getTransactions, type WalletInfo, type Transaction } from "../lib/api";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetch = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getWallet(token);
      setWallet(data);
    } catch (e: any) {
      const msg = e?.message || "Failed to load wallet";
      if (msg.toLowerCase().includes("wallet not found") || msg.toLowerCase().includes("not found")) {
        setNotFound(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { wallet, loading, error, notFound, refresh: fetch };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions(token);
      setTransactions(data.transactions);
    } catch (e: any) {
      setError(e?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, loading, error, refresh: fetch };
}
