'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import cronosSniperABI from "@/abi/CronosSniper.json";
import { useBetContext } from "@/context/BetContext";

const durations = [1800, 3600, 10800, 21600, 43200, 86400, 259200, 432000, 604800, 864000, 2592000];
const gameTypes = ["Glint", "Snap", "Rush", "Strike", "Blast", "Snipe", "Boom", "Raid", "Chase", "Hunt", "Kill"];

export default function ActiveBets({ onBetPlaced }: { onBetPlaced?: () => void }) {
  const { address } = useAccount();
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setResolvedBet } = useBetContext();

  const fetchActiveBets = async () => {
    if (!address) {
      console.log("Nessun indirizzo connesso, skip fetchActiveBets");
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MM;
      console.log("Contract Address:", contractAddress);
      console.log("User Address:", address);
      if (!contractAddress) throw new Error("Contract address not configured!");
      const contract = new ethers.Contract(contractAddress, cronosSniperABI, provider);

      const betIds: bigint[] = await contract.getUserBetsView({ from: address });
      console.log("Bet IDs:", betIds.map(id => id.toString()));

      const betDetails = await Promise.all(
        betIds.map(async (id) => {
          const bet = await contract.bets(id);
          return {
            id: Number(id),
            gameType: bet.gameType,
            effectiveAmount: ethers.formatEther(bet.effectiveAmount),
            predictedPrice: Number(bet.predictedPrice) / 1e5,
            startTime: Number(bet.startTime),
            resolved: bet.resolved,
            won: bet.resolved ? bet.won : null,
            payout: ethers.formatEther(bet.payout),
          };
        })
      );

      const filteredBets = betDetails.filter((bet) => !bet.resolved);
      console.log("ActiveBets aggiornati:", filteredBets);

      const resolvedBets = activeBets.filter((oldBet) =>
        !filteredBets.some((newBet) => newBet.id === oldBet.id) &&
        betDetails.find((bet) => bet.id === oldBet.id)?.resolved
      );
      if (resolvedBets.length > 0) {
        resolvedBets.forEach((bet) => {
          console.log("Scommessa risolta:", bet.id);
          setResolvedBet(bet.id);
        });
      }

      setActiveBets(filteredBets);
      setError(null);
    } catch (err) {
      console.error("Errore in fetchActiveBets:", err);
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchActiveBets();
  }, [address]);

  useEffect(() => {
    if (onBetPlaced) {
      fetchActiveBets();
    }
  }, [onBetPlaced]);

  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      fetchActiveBets();
    }, 5000);
    return () => clearInterval(interval);
  }, [address]);

  if (!address) {
    return <p className="text-gray-800 text-center text-xs">Connect your wallet to view your bets.</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center text-xs">Error: {error}</p>;
  }

  return (
    <div className="bets-table max-w-4xl mx-auto mb-8" style={{ padding: "0" }}>
      <h4 className="text-xs font-bold mb-4 text-center text-blue-600">Active Bets</h4>
      {activeBets.length === 0 ? (
        <p className="text-gray-800 text-center text-sm mb-4">No active bets.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            fontSize: "14px",
            lineHeight: "1",
            margin: "0",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <th style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>ID</th>
              <th style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>Type</th>
              <th style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>Amount</th>
              <th style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>Predicted Price</th>
              <th style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>Time Remaining</th>
              <th style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeBets
              .sort((a, b) => a.id - b.id)
              .map((bet) => {
                const timeRemaining = Math.max(
                  0,
                  bet.startTime + durations[bet.gameType] - Math.floor(Date.now() / 1000)
                );
                return (
                  <tr
                    key={"active-" + bet.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "background-color 0.3s ease",
                      height: "14px",
                      verticalAlign: "middle",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>{bet.id}</td>
                    <td style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>{gameTypes[bet.gameType]}</td>
                    <td style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>{bet.effectiveAmount}</td>
                    <td style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>
                      {bet.predictedPrice.toFixed(5).replace(".", ",")}
                    </td>
                    <td style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>
                      {timeRemaining > 0 ? `${Math.floor(timeRemaining / 3600)}h ${Math.floor((timeRemaining % 3600) / 60)}m ${timeRemaining % 60}s` : "Expired"}
                    </td>
                    <td style={{ padding: "4px", textAlign: "center", height: "14px", verticalAlign: "middle" }}>
                      In Progress
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}