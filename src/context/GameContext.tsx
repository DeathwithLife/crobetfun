"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
  gameLevel: number;
  setGameLevel: (level: number) => void;
  isCooldown: boolean;
  setIsCooldown: (value: boolean) => void;
  prizePool: string;
  setPrizePool: (value: string) => void;
  onPlayAgain: () => void; // Aggiunto
  setOnPlayAgain: (fn: () => void) => void; // Setter per onPlayAgain
  onGameComplete: () => void; // Aggiunto
  setOnGameComplete: (fn: () => void) => void; // Setter per onGameComplete
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameLevel, setGameLevel] = useState<number>(1); // Default: 50 CRO
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const [prizePool, setPrizePool] = useState<string>("0");
  const [onPlayAgain, setOnPlayAgain] = useState<() => void>(() => () => {}); // Default: funzione vuota
  const [onGameComplete, setOnGameComplete] = useState<() => void>(() => () => {}); // Default: funzione vuota

  return (
    <GameContext.Provider
      value={{
        gameLevel,
        setGameLevel,
        isCooldown,
        setIsCooldown,
        prizePool,
        setPrizePool,
        onPlayAgain,
        setOnPlayAgain,
        onGameComplete,
        setOnGameComplete,
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