"use client";
import { useReadContract } from "wagmi";
import treasureHunterCronosArtifact from "@/abi/TreasureHunterCronos.json";
import { formatEther, Abi } from "viem"; // Aggiunto Abi

// Tipizza l'ABI correttamente
const abi = treasureHunterCronosArtifact as Abi;

export default function LastWinners() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TH as `0x${string}`; // Usa TH
  if (!contractAddress) throw new Error("Contract address not defined in environment variables");

  const { data: winners, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getLastWinners",
  });

  if (isLoading) {
    return <p className="info-text">Loading last winners...</p>;
  }

  if (error || !winners) {
    return <p className="info-text">Error loading last winners.</p>;
  }

  // Tipizzazione dei dati restituiti
  type Winner = {
    player: string;
    prizeAmount: bigint;
    level: number;
    timestamp: bigint;
  };

  const lastWinners = winners as [Winner, Winner, Winner, Winner, Winner];

  // Ordinamento per timestamp (dal più recente al meno recente)
  const sortedWinners = [...lastWinners].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const levelNames = ["25 CRO", "50 CRO", "100 CRO"];

  return (
    <div className="last-winners">
      <h2 className="last-winners-title">Last 5 Wins</h2>
      <ul className="last-winners-list">
        {sortedWinners.map((winner, index) => (
          <li key={index}>
            <span>
              {winner.player.slice(0, 6)}...{winner.player.slice(-4)}
            </span>
            <span> won </span>
            <strong>{formatEther(winner.prizeAmount)} CRO</strong>
            <span> on </span>
            <span>{levelNames[winner.level]}</span>
            <span> at </span>
            <span>{new Date(Number(winner.timestamp) * 1000).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}