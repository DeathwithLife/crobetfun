"use client";
import { useReadContract } from "wagmi";
import croCaveArtifact from "@/abi/CroCave.json";
import { useGameContext } from "@/context/GameContextCV";
import { Abi } from "viem"; // Aggiunto Abi
import { useEffect, useState } from "react";

// Tipizza l'ABI correttamente
const abi = croCaveArtifact as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CV as `0x${string}`; // Usa CV

interface LastGuessesProps {
  refreshTrigger?: number;
}

export default function LastGuesses({ refreshTrigger }: LastGuessesProps) {
  const { gameLevel } = useGameContext();
  const { data: guesses, refetch, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getLastGuesses",
    args: [BigInt(gameLevel)],
  });
  const [lastGuesses, setLastGuesses] = useState<{ value: bigint; exiting?: boolean }[]>([]);

  useEffect(() => {
    if (guesses) {
      const newGuesses = (guesses as bigint[]).map((value) => ({ value }));
      setLastGuesses((prev) => {
        // Ordine cronologico: più vecchio a sinistra, più recente a destra
        const updated = [...prev, ...newGuesses].slice(-10); // Prendi gli ultimi 10
        if (prev.length >= 10 && newGuesses.length > 0) {
          // Se la lista è piena, il primo esce mentre il nuovo entra
          return updated.map((guess, index) => ({
            ...guess,
            exiting: index === 0 && prev.length === 10, // Il primo esce
          }));
        }
        return updated;
      });
    }
  }, [guesses]);

  useEffect(() => {
    if (refreshTrigger !== undefined) refetch();
  }, [refreshTrigger, refetch]);

  // Rimuovi gli elementi "exiting" dopo l'animazione
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastGuesses((prev) => prev.filter((g) => !g.exiting));
    }, 500); // Durata animazione
    return () => clearTimeout(timer);
  }, [lastGuesses]);

  if (isLoading) return <p className="info-text">Loading last guesses...</p>;
  if (error || !lastGuesses) return <p className="info-text">Error loading guesses: {error?.message}</p>;

  return (
    <div className="guesses-section">
      <div className="guesses-list">
        {lastGuesses.length === 0 ? (
          <span className="cyber-text">No guesses yet</span>
        ) : (
          lastGuesses.map((guess, index) => (
            <span
              key={`${guess.value}-${index}`}
              className={`cyber-number neon-glow ${guess.exiting ? "exiting" : ""}`}
            >
              {guess.value.toString()}
            </span>
          ))
        )}
      </div>
    </div>
  );
}