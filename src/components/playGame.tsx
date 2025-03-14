"use client";
import { useEffect, useState, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import treasureHunterCronosArtifact from "@/abi/TreasureHunterCronos.json";
import { useGameContext } from "@/context/GameContext";
import { parseEther } from "@ethersproject/units";
import { Abi } from "viem"; // Aggiunto Abi

// Tipizza l'ABI correttamente
const abi = treasureHunterCronosArtifact as Abi;

interface PlayGameProps {
  selectedChest: number;
  address: `0x${string}` | undefined;
}

const chestImages: { [key: string]: string } = {
  "Cronos Trillionaire": "/images/cronos_trillionaire.png",
  "Cronos Billionaire": "/images/cronos_billionaire.png",
  "Cronos Millionaire": "/images/cronos_millionaire.png",
  "Bull Run": "/images/bull_run.png",
  "We are so FuCkiNg BACK!": "/images/we_are_so_fucking_back.png",
  "We are back!": "/images/we_are_back.png",
  "Good exit": "/images/good_exit.png",
  "No lose, Good news": "/images/no_lose_good_news.png",
  "Bear": "/images/bear_market.png",
  "Rug-pull": "/images/rug_pull.png",
};

export default function PlayGame({ selectedChest, address }: PlayGameProps) {
  const { gameLevel, setIsCooldown, onPlayAgain, onGameComplete } = useGameContext();
  const [chestResult, setChestResult] = useState<{ prize: string; amount: string; prizeType: number } | null>(null);
  const [countdown, setCountdown] = useState<number>(4);
  const [isOpening, setIsOpening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const isMounted = useRef(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TH as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not defined in environment variables");

  const { data: transactionHash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isSuccess: transactionConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  });

  const gamePrices: { [key: number]: bigint } = {
    0: BigInt("26250000000000000000"), // 25 CRO + 5% fee
    1: BigInt("52500000000000000000"), // 50 CRO + 5% fee
    2: BigInt("105000000000000000000"), // 100 CRO + 5% fee
  };

  const gamePrice = gamePrices[gameLevel];

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const connectWebSocket = (attempt = 1, maxAttempts = 5) => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connesso al bot WebSocket");
        setErrorMessage(null);
      };

      ws.onmessage = (event) => {
        const gameData = JSON.parse(event.data);
        console.log("Risposta dal bot:", gameData);
        if (gameData.error) {
          setErrorMessage(gameData.error);
          setWaitingConfirmation(false);
          return;
        }
        if (gameData.level === gameLevel && gameData.prize) {
          setChestResult(gameData.prize);
        }
      };

      ws.onerror = () => {
        console.log("Errore WebSocket silenziato (non influisce sulla partita)");
      };

      ws.onclose = () => {
        console.log("WebSocket chiuso, tentativo di riconnessione...");
        if (attempt < maxAttempts) {
          setTimeout(() => connectWebSocket(attempt + 1, maxAttempts), 1000 * attempt);
        } else {
          setErrorMessage("Connessione al server persa dopo diversi tentativi.");
        }
      };

      return ws;
    };

    const ws = connectWebSocket();
    return () => {
      ws.close();
      isMounted.current = false;
    };
  }, [gameLevel]);

  const handleOpenChest = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMessage("Connessione al server non disponibile. Riprova.");
      return;
    }

    try {
      setErrorMessage(null);
      setWaitingConfirmation(true);

      wsRef.current.send(JSON.stringify({ level: gameLevel, chestId: selectedChest }));

      const chestResult = await new Promise<{ prize: string; amount: string; prizeType: number }>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          const gameData = JSON.parse(event.data);
          if (gameData.level === gameLevel && gameData.prize) {
            wsRef.current!.removeEventListener("message", messageHandler);
            resolve(gameData.prize);
          }
        };
        wsRef.current!.addEventListener("message", messageHandler);
        setTimeout(() => {
          wsRef.current!.removeEventListener("message", messageHandler);
          reject(new Error("Timeout attesa risposta bot"));
        }, 7000);
      });

      setChestResult(chestResult);

      const chestResultArg = [chestResult.prizeType, BigInt(parseEther(chestResult.amount).toString())] as [number, bigint];

      writeContract({
        address: contractAddress,
        abi,
        functionName: "playGame",
        args: [gameLevel, selectedChest, chestResultArg],
        value: gamePrice,
        gas: BigInt("10000000"),
        chainId: 338,
      });
    } catch (err) {
      console.error("Errore durante il gioco:", err);
      setErrorMessage("Transaction failed. Try again?");
      setWaitingConfirmation(false);
    }
  };

  useEffect(() => {
    if (transactionConfirmed && chestResult) {
      setIsOpening(true);
      setWaitingConfirmation(false);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), 10000);
    } else if (writeError) {
      setErrorMessage("Transaction failed. Try again?");
      setWaitingConfirmation(false);
    }
  }, [transactionConfirmed, chestResult, setIsCooldown, writeError]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpening && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isOpening && countdown === 0) {
      setIsOpening(false);
      onGameComplete();
    }
    return () => clearTimeout(timer);
  }, [countdown, isOpening, onGameComplete]);

  const getChestImage = () => {
    return chestImages[chestResult?.prize || ""] || "/images/chest.png";
  };

  const getPrizeMessage = () => {
    if (!chestResult) return "";
    if (chestResult.prize === "Rug-pull") {
      return "💀 You lose!";
    } else {
      return `🎉 ${chestResult.amount} CRO`;
    }
  };

  const handlePlayAgainClick = () => {
    setIsOpening(false);
    setCountdown(4);
    setErrorMessage(null);
    setWaitingConfirmation(false);
    setChestResult(null);
    onPlayAgain(); // Usa la funzione dal contesto
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="open-chest-container">
      {waitingConfirmation ? (
        <p style={{ color: "#f8c300", fontSize: "16px", fontWeight: "600" }}>
          ⏳ Awaiting your confirmation...
        </p>
      ) : isOpening ? (
        <div className="countdown-container">
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8c300" }}>
            🎉 Opening in <span style={{ color: "#f56565" }}>{countdown}</span> 🎉
          </h2>
        </div>
      ) : countdown === 0 && chestResult ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f8c300" }}>
              {chestResult.prize}
            </span>
            <img
              src={getChestImage()}
              alt={`Chest for ${chestResult.prize}`}
              style={{ width: "100px", height: "100px", borderRadius: "10px" }}
            />
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: chestResult.prize === "Rug-pull" ? "#f56565" : "#48bb78",
              }}
            >
              {getPrizeMessage()}
            </h3>
          </div>
          <button onClick={handlePlayAgainClick} style={{ marginTop: "8px" }}>
            Play Again
          </button>
        </>
      ) : errorMessage ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#f56565", fontSize: "14px", marginBottom: "8px" }}>{errorMessage}</p>
          <button onClick={handleTryAgain}>Try Again</button>
        </div>
      ) : (
        <button onClick={handleOpenChest} disabled={isPending}>
          {isPending ? "Processing..." : "Open Chest"}
        </button>
      )}
    </div>
  );
}