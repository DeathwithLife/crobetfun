"use client";
import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import treasureHunterCronosArtifact from "@/abi/TreasureHunterCronos.json"; // Import corretto
import { formatEther, Abi } from "viem"; // Aggiunto Abi

// Tipizza l'ABI
const abi = treasureHunterCronosArtifact as Abi;

interface ClaimPrizesProps {
  address: `0x${string}` | undefined;
  gameCompleted: boolean; // Aggiunto
}

export default function ClaimPrizes({ address, gameCompleted }: ClaimPrizesProps) {
  const [prizeBalance, setPrizeBalance] = useState<string>("0");
  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TH as `0x${string}`; // Correzione: usa TH
  if (!contractAddress) throw new Error("Contract address not defined in environment variables");

  const { data: balanceData, refetch, isLoading: isBalanceLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "prizeBalance",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  const { writeContract, isPending: isClaimPending, isError: isClaimError, error: claimError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: claimConfirmed } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  useEffect(() => {
    if (address) {
      refetch();
    }
    if (balanceData) {
      setPrizeBalance(formatEther(balanceData as bigint));
    }
  }, [address, balanceData, refetch]);

  useEffect(() => {
    if (claimConfirmed) {
      setClaimMessage("🎉 Prizes claimed successfully!");
      refetch();
      setClaimTxHash(undefined);
      setTimeout(() => setClaimMessage(null), 5000);
    }
  }, [claimConfirmed, refetch]);

  useEffect(() => {
    if (gameCompleted && address) {
      refetch();
    }
  }, [gameCompleted, address, refetch]);

  const handleClaimPrizes = async () => {
    if (!address || Number(prizeBalance) <= 0) return;
    try {
      setClaimMessage(null);
      writeContract(
        {
          address: contractAddress,
          abi,
          functionName: "claimPrizes",
          args: [],
        },
        {
          onSuccess: (hash) => {
            setClaimTxHash(hash);
          },
          onError: (err) => {
            console.error("Error claiming prizes:", err);
            setClaimMessage("⚠️ Failed to claim prizes. Try again.");
          },
        }
      );
    } catch (err) {
      console.error("Error claiming prizes:", err);
      setClaimMessage("⚠️ Transaction failed. Please try again.");
    }
  };

  if (!address) {
    return <p className="info-text">Please connect your wallet to view and claim prizes.</p>;
  }

  if (isBalanceLoading && !balanceData) {
    return <p className="info-text">Loading prize balance...</p>;
  }

  return (
    <div className="claim-prizes-container">
      {Number(prizeBalance) > 0 ? (
        <>
          <p>Prize Balance: {parseFloat(prizeBalance).toFixed(1)} CRO</p>
          <button
            onClick={handleClaimPrizes}
            disabled={isClaimPending || isTxConfirming || Number(prizeBalance) <= 0}
          >
            {isClaimPending || isTxConfirming ? "Processing..." : "Claim Prizes"}
          </button>
        </>
      ) : (
        <p className="info-text">No prizes to claim.</p>
      )}
      {claimMessage && (
        <p
          style={{
            color: claimMessage.includes("success") ? "#48bb78" : "#f56565",
            marginTop: "8px",
          }}
        >
          {claimMessage}
        </p>
      )}
      {isClaimError && (
        <p style={{ color: "#f56565", marginTop: "8px" }}>
          Error: {claimError?.message || "Unknown error"}
        </p>
      )}
    </div>
  );
}