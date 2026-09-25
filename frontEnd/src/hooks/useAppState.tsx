import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SYMBOL } from "@/data/mockData";

type AppState = {
  symbol: string;
  setSymbol: (s: string) => void;
  period: string;
  setPeriod: (p: string) => void;
  refreshKey: number;
  refresh: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [period, setPeriod] = useState("1Y");
  const [refreshKey, setRefreshKey] = useState(0);

  const value = useMemo<AppState>(
    () => ({
      symbol,
      setSymbol: (s) => setSymbol(s.trim().toUpperCase().replace(/\.NS$/i, "")),
      period,
      setPeriod,
      refreshKey,
      refresh: () => setRefreshKey((k) => k + 1),
    }),
    [symbol, period, refreshKey],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
