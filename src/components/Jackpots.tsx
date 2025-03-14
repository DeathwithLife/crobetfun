"use client";
import { useReadContract } from "wagmi";
import croCaveArtifact from "@/abi/CroCave.json";
import { useGameContext } from "@/context/GameContextCV";
import { formatEther, Abi } from "viem"; // Aggiunto Abi
import { useEffect, useState } from "react";

// Tipizza l'ABI correttamente
const abi = croCaveArtifact as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CV as `0x${string}`; // Usa CV

interface JackpotsProps {
  refreshTrigger?: number; // Per refresh
}

export default function Jackpots({ refreshTrigger }: JackpotsProps) {
  const { gameLevel } = useGameContext();
  const { data, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getJackpotDetails",
    args: [BigInt(gameLevel)],
  });
  const [jackpotData, setJackpotData] = useState<[bigint, bigint, bigint, bigint, bigint] | null>(null);

  useEffect(() => {
    if (data) setJackpotData(data as [bigint, bigint, bigint, bigint, bigint]);
  }, [data]);

  useEffect(() => {
    if (refreshTrigger !== undefined) refetch(); // Refresh dopo partita
  }, [refreshTrigger, refetch]);

  if (!jackpotData && isLoading) return <div className="cyber-loading">Loading prizes...</div>;

  const [level, totalJackpot, payout, remainingJackpot, superJackpot] = jackpotData || [0n, 0n, 0n, 0n, 0n];

  return (
    <div className="jackpot-row">
      <span>
        <span className="vault-prize">Vault Prize: </span>
        <span className="cyber-text">{formatEther(payout)} CRO</span>
      </span>
      <span className="jackpot-divider">|</span>
      <span>
        <span className="early-bird-bonus">Early Bird Bonus: </span>
        <span className="cyber-text">{formatEther(superJackpot)} CRO</span>
      </span>
    </div>
  );
}