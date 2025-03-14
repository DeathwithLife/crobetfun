'use client';

import { useReadContract } from 'wagmi';
import treasureHunterCronosArtifact from "@/abi/TreasureHunterCronos.json"; // Import corretto
import { formatEther, Abi } from 'viem'; // Aggiunto Abi
import { useEffect, useState } from 'react';

// Tipizza l'ABI
const abi = treasureHunterCronosArtifact as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TH as `0x${string}`; // Correzione: usa TH

export default function TopWinners() {
  const [winners, setWinners] = useState<{ address: string; amount: number }[]>([]);
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getTopWinners',
  });

  useEffect(() => {
    if (data && Array.isArray(data) && data.length === 2 && Array.isArray(data[0]) && Array.isArray(data[1])) {
      const formattedWinners = data[0].map((winner: string, index: number) => ({
        address: winner,
        amount: parseFloat(formatEther(BigInt(data[1][index] || 0))),
      }));
      setWinners(formattedWinners);
    }
  }, [data]);

  if (isLoading) return <p>Loading top winners...</p>;
  if (error) return <p>Error loading winners</p>;

  return (
    <div className="leaderboard-container">
      <h2 className="text-xl font-bold mb-4">🏆 Top 10 Winners: </h2>
      <ul className="list-none">
        {winners.length === 0 ? (
          <p>No winners yet</p>
        ) : (
          winners.map((winner, index) => (
            <li key={index} className="mb-2">
              <span className="font-semibold">{index + 1}.</span> {winner.address.slice(0, 6)}...{winner.address.slice(-4)} - {winner.amount} CRO
            </li>
          ))
        )}
      </ul>
    </div>
  );
}