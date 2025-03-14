"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import croCaveArtifact from "@/abi/CroCave.json";
import { useEffect } from "react";
import { useGameContext } from "@/context/GameContextCV";
import { Abi } from "viem"; // Aggiunto Abi

// Tipizza l'ABI
const abi = croCaveArtifact as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CV as `0x${string}`; // Correzione: usa CV

interface GameButtonProps {
  guess: number;
  address?: `0x${string}`;
  onTransactionComplete?: () => void;
}

export default function GameButton({ guess, address, onTransactionComplete }: GameButtonProps) {
  const { gameLevel } = useGameContext();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const handlePlay = () => {
    if (!address) {
      console.log("No address provided!");
      return;
    }
    console.log("Calling playGame with Guess:", guess, "Level:", gameLevel);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "playGame",
      args: [BigInt(guess), BigInt(gameLevel)],
      value: BigInt("50000000000000000000"), // 50 TCRO
      account: address,
    });
  };

  useEffect(() => {
    if (error) {
      console.log("Transaction failed:", error.message);
      return;
    }
    if (isSuccess) {
      console.log("Transaction Success! Hash:", hash);
      if (onTransactionComplete) onTransactionComplete();
    }
  }, [isSuccess, error, hash, onTransactionComplete]);

  return (
    <button onClick={handlePlay} disabled={isPending || isLoading || !address}>
      {isPending || isLoading ? "Playing..." : "Play Now"}
    </button>
  );
}