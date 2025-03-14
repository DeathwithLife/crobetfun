"use client";
import { useReadContract } from "wagmi";
import croCaveArtifact from "@/abi/CroCave.json";
import { formatEther, Abi } from "viem"; // Aggiunto Abi

// Tipizza l'ABI correttamente
const abi = croCaveArtifact as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CV as `0x${string}`; // Correzione: usa CV

export default function TopWinners() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getTopWinners",
  });

  if (isLoading) return <p>Loading top winners...</p>;
  if (error || !data) return <p>Error loading winners</p>;

  const winners = (data as any[]).map((winner) => ({
    address: winner.winnerAddress,
    amount: formatEther(winner.amountWon),
  }));

  return (
    <div className="leaderboard-container">
      <h2 className="text-xl font-bold mb-4">🏆 Top 10 Winners</h2>
      <ul className="list-none">
        {winners.map((winner, index) => (
          <li key={index} className="mb-2">
            <span className="font-semibold">{index + 1}.</span> {winner.address.slice(0, 6)}...{winner.address.slice(-4)} - {winner.amount} CRO
          </li>
        ))}
      </ul>
    </div>
  );
}