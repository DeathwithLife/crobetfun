'use client';

import { useReadContracts } from "wagmi";
import cronosSniperABI from "@/abi/CronosSniper.json";
import { formatEther } from "viem";
import { Abi } from "viem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MM as `0x${string}`;
const typedABI = cronosSniperABI as Abi;

const calls = Array.from({ length: 5 }, (_, index) => ({
  address: CONTRACT_ADDRESS,
  abi: typedABI,
  functionName: "recentWinners",
  args: [index],
}));

export default function Last5Winners() {
  const { data, isLoading, error } = useReadContracts({
    contracts: calls,
  }) as { 
    data: Array<{ result: [string, bigint, bigint] | undefined }> | undefined; 
    isLoading: boolean; 
    error: Error | null 
  };

  const winners = data
    ? data
        .filter((call) => call.result !== undefined)
        .map((call) => ({
          address: call.result![0],
          amount: parseFloat(formatEther(call.result![1])),
          timestamp: Number(call.result![2]),
        }))
        .filter((winner) => winner.amount > 0)
    : [];

  if (isLoading) return <p>Loading recent winners...</p>;
  if (error) return <p>Error loading winners: {error.message}</p>;

  return (
    <div className="last-winners max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🏅 Last 5 Winners 🏅</h2>
      {winners.length === 0 ? (
        <p>No recent winners yet</p>
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
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Address</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Winnings (tCRO)</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((winner, index) => (
              <tr
                key={`recent-${index}`}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "background-color 0.3s ease",
                  height: "28px",
                  verticalAlign: "middle",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>
                  {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
                </td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>{winner.amount}</td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>
                  {new Date(winner.timestamp * 1000).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}