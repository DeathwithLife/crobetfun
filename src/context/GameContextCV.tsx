"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
  gameLevel: number;
  setGameLevel: (level: number) => void;
  isCooldown: boolean;
  setIsCooldown: (cooldown: boolean) => void;
  gameResult: "won" | "lost" | null;
  setGameResult: (result: "won" | "lost" | null) => void;
  prizeAmount: string;
  setPrizeAmount: (amount: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameLevel, setGameLevel] = useState<number>(0); // Default a 0
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<"won" | "lost" | null>(null);
  const [prizeAmount, setPrizeAmount] = useState<string>("0");

  return (
    <GameContext.Provider
      value={{
        gameLevel,
        setGameLevel,
        isCooldown,
        setIsCooldown,
        gameResult,
        setGameResult,
        prizeAmount,
        setPrizeAmount,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}