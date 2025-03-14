'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers, providers, utils } from "ethers";
import cronosSniperABI from "@/abi/CronosSniper.json";
import { useBetContext } from "@/context/BetContext";

interface PastBet {
  betId: bigint;
  predictedPrice: bigint;
  closingPrice: bigint;
  winnings: bigint;
  won: boolean;
}

const gameTypes = ["Glint", "Snap", "Rush", "Strike", "Blast", "Snipe", "Boom", "Raid", "Chase", "Hunt", "Kill"];

export default function PastBets() {
  const { address } = useAccount();
  const [pastBets, setPastBets] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { resolvedBet } = useBetContext();

  const fetchPastBets = async () => {
    if (!address) return;

    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MM;
      if (!contractAddress) throw new Error("Contract address not configured!");
      const provider = new providers.JsonRpcProvider("https://evm-t3.cronos.org");
      const contract = new ethers.Contract(contractAddress, cronosSniperABI, provider);

      const pastBetsDataRaw = await contract.getUserPastBets({ from: address });
      console.log("Dati grezzi non formattati da getUserPastBets per", address, ":", pastBetsDataRaw);

      // Rimuovi duplicati basati su betId dai dati grezzi
      const uniqueBetsMap = new Map<bigint, any>();
      pastBetsDataRaw.forEach((bet: any) => {
        const betId = BigInt(bet.betId.toString());
        if (!uniqueBetsMap.has(betId)) {
          uniqueBetsMap.set(betId, bet);
        }
      });
      const uniqueBetsDataRaw = Array.from(uniqueBetsMap.values());
      console.log("Dati grezzi unici dopo rimozione duplicati:", uniqueBetsDataRaw);

      const pastBetsData: PastBet[] = uniqueBetsDataRaw.map((bet: any) => ({
        betId: BigInt(bet.betId.toString()),
        predictedPrice: BigInt(bet.predictedPrice.toString()),
        closingPrice: BigInt(bet.closingPrice.toString()),
        winnings: BigInt(bet.winnings.toString()),
        won: bet.won,
      }));
      console.log("Dati formattati da getUserPastBets per", address, ":", pastBetsData);

      const filteredBets = pastBetsData.filter(
        (bet) => bet.predictedPrice !== BigInt(0) || bet.closingPrice !== BigInt(0)
      );
      console.log("Dati filtrati prima del map:", filteredBets);

      const formattedBets = await Promise.all(
        filteredBets.map(async (bet) => {
          const betDetails = await contract.bets(bet.betId);
          console.log(`Dettagli betId=${bet.betId}:`, betDetails);
          return {
            id: Number(bet.betId),
            type: gameTypes[Number(betDetails.gameType)] || "Unknown",
            predictedPrice: Number(bet.predictedPrice) / 1e5,
            closingPrice: Number(bet.closingPrice) / 1e5,
            winnings: utils.formatEther(bet.winnings),
            result: bet.won ? "Won" : "Lost",
          };
        })
      );
      console.log("Formatted PastBets:", formattedBets);

      // Ordina per ID decrescente e prendi le ultime 5
      const uniqueFormattedBets = formattedBets
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
      setPastBets(uniqueFormattedBets);
      setIsInitialLoad(false);
    } catch (err) {
      console.error("Errore nel fetch di PastBets:", err);
    }
  };

  useEffect(() => {
    if (address) fetchPastBets();
  }, [address]);

  useEffect(() => {
    if (resolvedBet !== null) {
      console.log("Rilevata scommessa risolta dal contesto:", resolvedBet);
      fetchPastBets();
    }
  }, [resolvedBet]);

  if (!address || isInitialLoad) {
    return <div className="empty-placeholder" style={{ height: "100px" }}></div>;
  }

  return (
    <div className="bets-table mx-auto mb-8">
      {pastBets.length === 0 ? (
        <div className="empty-placeholder" style={{ height: "100px" }}></div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            fontSize: "14px",
            lineHeight: "1",
            padding: "10px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>ID</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Type</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Predicted Price</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Closing Price</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Winnings</th>
              <th style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {pastBets.map((bet) => (
              <tr
                key={`past-${bet.id}-${bet.result}`} // Chiave univoca con risultato
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "background-color 0.3s ease",
                  height: "28px",
                  verticalAlign: "middle",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>{bet.id}</td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>{bet.type}</td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>
                  {bet.predictedPrice.toFixed(5).replace(".", ",")}
                </td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>
                  {bet.closingPrice.toFixed(5).replace(".", ",")}
                </td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>{bet.winnings}</td>
                <td style={{ padding: "8px", textAlign: "center", height: "28px", verticalAlign: "middle" }}>{bet.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}