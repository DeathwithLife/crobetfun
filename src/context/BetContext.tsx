'use client';

import { createContext, useContext, useState, ReactNode } from "react";

interface BetContextType {
  resolvedBet: number | null;
  setResolvedBet: (betId: number | null) => void;
  notification: { message: string; type: "success" | "error" | "warning" } | null;
  setNotification: (notification: { message: string; type: "success" | "error" | "warning" } | null) => void;
}

const BetContext = createContext<BetContextType | undefined>(undefined);

export function BetProvider({ children }: { children: ReactNode }) {
  const [resolvedBet, setResolvedBet] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  return (
    <BetContext.Provider value={{ resolvedBet, setResolvedBet, notification, setNotification }}>
      {children}
    </BetContext.Provider>
  );
}

export function useBetContext() {
  const context = useContext(BetContext);
  if (!context) {
    throw new Error("useBetContext must be used within a BetProvider");
  }
  return context;
}