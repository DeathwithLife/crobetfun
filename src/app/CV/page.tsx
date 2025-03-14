"use client";
import { useState, useEffect } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import GameButton from "@/components/GameButton";
import Jackpots from "@/components/Jackpots";
import LastGuesses from "@/components/LastGuesses";
import { useAccount, useReadContract } from "wagmi";
import { useGameContext } from "@/context/GameContextCV"; // Come vuoi tu
import { usePublicClient } from "wagmi";
import { formatEther, parseEther, Abi } from "viem"; // Aggiunto parseEther e Abi
import croCaveArtifact from "@/abi/CroCave.json";

// Tipizza l'ABI correttamente
const abi = croCaveArtifact as Abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CV as `0x${string}`; // Correzione: usa CV

export default function Home() {
  const { isConnected, address } = useAccount();
  const { gameLevel, setGameLevel, gameResult, setGameResult, prizeAmount, setPrizeAmount } = useGameContext();
  const [guess, setGuess] = useState<string>("00000");
  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const publicClient = usePublicClient({ chainId: 338 });

  const { data: lastWinnerData, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "lastWinner",
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (gameLevel === undefined) setGameLevel(0);
  }, [gameLevel, setGameLevel]);

  const TICKET_PRICE = parseEther("50"); // Sostituito BigInt con parseEther
  const maxGuesses = [999, 9999, 99999];

  const activeDials = [
    [false, true, true, true, false], // 3 centrali
    [false, true, true, true, true],  // 4 centrali
    [true, true, true, true, true],   // Tutti 5
  ];

  const levelNames = [
    "Crypto Rookie - 3 digits to guess",
    "Chain Hacker - 4 digits to guess",
    "Vault Master - 5 digits to guess",
  ];

  useEffect(() => {
    const checkBalance = async () => {
      if (!address || !publicClient) {
        setCanPlay(false);
        setBalance("0");
        return;
      }
      try {
        const balanceWei = await publicClient.getBalance({ address });
        setBalance(formatEther(balanceWei));
        setCanPlay(balanceWei >= TICKET_PRICE);
      } catch (error) {
        console.error("Errore durante il controllo del saldo:", error);
        setCanPlay(false);
        setBalance("0");
      }
    };
    checkBalance();
  }, [address, publicClient]);

  const handleDigitChange = (digitIndex: number, value: number) => {
    if (!activeDials[gameLevel][digitIndex]) return;
    const guessArray = guess.split("");
    guessArray[digitIndex] = value.toString();
    const newGuess = guessArray.join("");
    const activeGuess = activeDials[gameLevel]
      .reduce((acc, active, i) => (active ? acc + newGuess[i] : acc), "");
    if (Number(activeGuess) <= maxGuesses[gameLevel]) {
      setGuess(newGuess);
    }
  };

  const isGuessComplete = () => {
    const activeGuess = activeDials[gameLevel]
      .reduce((acc, active, i) => (active ? acc + guess[i] : acc), "");
    const guessNumber = Number(activeGuess);
    return activeGuess.length === activeDials[gameLevel].filter(Boolean).length && guessNumber <= maxGuesses[gameLevel];
  };

  const getGuessForContract = () => {
    const activeGuess = activeDials[gameLevel]
      .reduce((acc, active, i) => (active ? acc + guess[i] : acc), "");
    return Number(activeGuess);
  };

  const handleTransactionComplete = async () => {
    setIsProcessing(true);
    setCountdown(5);
    await refetch(); // Solo refetch qui, il risultato viene gestito dopo il countdown
  };

  // Countdown e aggiornamento del risultato
  useEffect(() => {
    if (isProcessing && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isProcessing && countdown === 0) {
      setIsProcessing(false);
      if (lastWinnerData && address) {
        const [winner, amount] = lastWinnerData as [string, bigint];
        const userWon = winner.toLowerCase() === address.toLowerCase() && amount > 0n;
        const result = userWon ? "won" : "lost";
        const prize = userWon ? formatEther(amount) : "0";
        setGameResult(result);
        setPrizeAmount(prize);
      }
      setIsAnimating(true);
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [isProcessing, countdown, lastWinnerData, address, setGameResult, setPrizeAmount]);

  useEffect(() => {
    if (isAnimating) {
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
        const resetTimer = setTimeout(() => {
          setGameResult(null);
          setGuess("0".repeat(5));
        }, 2000);
        return () => clearTimeout(resetTimer);
      }, 2000);
      return () => clearTimeout(animationTimer);
    }
  }, [isAnimating, setGameResult, setGuess]);

  return (
    <div className="pages">
      <div className="game-form">
        <div className="form-section">
          <ConnectButton />
        </div>

        <div className="form-section game-rules">
          <span className="rule-step">🎲 Pick your level</span>
          <span className="rule-step">🔢 Guess the number</span>
          <span className="rule-step">🏆 Win big!</span>
        </div>

        <div className="form-section centered-select">
          <select
            value={gameLevel}
            onChange={(e) => {
              setGameLevel(Number(e.target.value));
              setGuess("0".repeat(5));
            }}
            className="cost-selector"
          >
            {levelNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <div className="number-dial">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`dial ${activeDials[gameLevel][index] ? "active" : "inactive"}`}
              >
                <select
                  value={Number(guess[index])}
                  onChange={(e) => handleDigitChange(index, Number(e.target.value))}
                  disabled={!isConnected || !canPlay || !activeDials[gameLevel][index]}
                >
                  {Array.from({ length: 10 }).map((_, num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section jackpot-section">
          <Jackpots refreshTrigger={refreshTrigger} />
        </div>

        <div className="form-section guesses-section">
          <LastGuesses refreshTrigger={refreshTrigger} />
        </div>

        <div className="form-section">
          {isGuessComplete() && canPlay ? (
            isProcessing ? (
              <div className="countdown cyber-loading neon-glow">
                <p>Hacking Vault... {countdown}</p>
              </div>
            ) : (
              <GameButton
                guess={getGuessForContract()}
                address={address}
                onTransactionComplete={handleTransactionComplete}
              />
            )
          ) : (
            <p className="info-text">
              {!isConnected
                ? "Connect your wallet to play!"
                : !canPlay
                ? "Insufficient funds (50 TCRO)!"
                : `Enter a valid guess (max ${maxGuesses[gameLevel]})`}
            </p>
          )}
        </div>

        <div className="vault-section">
          <div
            className={`vault ${isAnimating ? "animating" : ""} ${
              gameResult === "won" ? "open" : gameResult === "lost" ? "closed" : ""
            }`}
          >
            {gameResult && (
              <div className="vault-result">
                <span className={gameResult === "won" ? "won-text" : "lost-text"}>
                  {gameResult === "won" ? `You Won ${prizeAmount} TCRO!` : "You Lost"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}