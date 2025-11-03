import React, { createContext, useContext, useState, useMemo } from "react";

interface OfflineContextValue {
  offline: boolean;
  setOffline: (o: boolean) => void;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [offline, setOffline] = useState(false);
  const value = useMemo(() => ({ offline, setOffline }), [offline]);
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
}
