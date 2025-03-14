"use client";
import { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import ClaimPrizes from "@/components/ClaimPrizes";
import Chest from "@/components/Chest";
import PlayGame from "@/components/playGame";
import { useAccount } from "wagmi";
import { useGameContext } from "@/context/GameContext"; // Aggiornato per TH
import { usePublicClient } from "wagmi";
import { formatEther, Abi } from "viem"; // Aggiunto Abi
import treasureHunterCronosArtifact from "@/abi/TreasureHunterCronos.json"; // Import corretto

// Definisci l'ABI con il tipo corretto
const abi = treasureHunterCronosArtifact as Abi;

export default function Home() {
  const { isConnected, address } = useAccount();
  const {
    gameLevel,
    setGameLevel,
    isCooldown,
    setIsCooldown,
    setOnPlayAgain,
    setOnGameComplete,
  } = useGameContext();
  const [selectedChest, setSelectedChest] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const scrollDirectionRef = useRef<"left" | "right" | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const publicClient = usePublicClient({ chainId: 338 }); // Cronos Testnet?
  const chestWidth = 115 + 19;
  const totalChests = 10;
  const cycleWidth = totalChests * chestWidth;
  const gamePrices: { [key: number]: bigint } = {
    0: BigInt("26250000000000000000"), // 25 + 5% fee
    1: BigInt("52500000000000000000"), // 50 + 5% fee
    2: BigInt("105000000000000000000"), // 100 + 5% fee
  };

  useEffect(() => {
    const checkBalance = async () => {
      if (!address || !publicClient) {
        setCanPlay(false);
        setBalance("0");
        return;
      }

      try {
        const balanceWei = await publicClient.getBalance({ address });
        const balanceCRO = formatEther(balanceWei);
        setBalance(balanceCRO);
        const gamePrice = gamePrices[gameLevel];
        setCanPlay(balanceWei >= gamePrice);
      } catch (error) {
        console.error("Errore durante il controllo del saldo:", error);
        setCanPlay(false);
        setBalance("0");
      }
    };

    checkBalance();
  }, [address, gameLevel, publicClient]);

  const animateScroll = () => {
    if (!scrollDirectionRef.current) return;

    setScrollOffset((prev) => {
      const step = scrollDirectionRef.current === "left" ? -5 : 5;
      let newOffset = prev + step;
      if (newOffset < 0) newOffset += cycleWidth;
      if (newOffset >= cycleWidth) newOffset -= cycleWidth;
      return newOffset;
    });

    animationFrameRef.current = requestAnimationFrame(animateScroll);
  };

  const startScrolling = (direction: "left" | "right") => {
    if (!canPlay || scrollDirectionRef.current) return;

    scrollDirectionRef.current = direction;
    animateScroll();
  };

  const stopScrolling = () => {
    scrollDirectionRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleChestSelect = (chestId: number) => {
    if (!canPlay) {
      console.error("Fondi insufficienti!");
      return;
    }

    setSelectedChest(chestId);
  };

  const handlePlayAgain = () => {
    console.log("Play Again clicked, starting spin");
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedChest(null);
      console.log("Spin finished, selection reset");
    }, 1000);
  };

  const handleGameComplete = () => {
    setGameCompleted(true);
    setTimeout(() => setGameCompleted(false), 1000);
  };

  // Imposta le funzioni nel contesto
  useEffect(() => {
    setOnPlayAgain(() => handlePlayAgain);
    setOnGameComplete(() => handleGameComplete);
  }, [setOnPlayAgain, setOnGameComplete]);

  const extendedChests = Array(30).fill(null);

  return (
    <div className="pages">
      <div className="game-form">
        <div className="form-section">
          <ConnectButton />
        </div>

        <div className="form-section game-rules">
          <span className="rule-step">🎲 Pick your level</span>
          <span className="rule-step">💎 Grab a chest</span>
          <span className="rule-step">🏆 Win big!</span>
        </div>

        <div className="form-section">
          <select
            value={gameLevel}
            onChange={(e) => setGameLevel(Number(e.target.value))}
            className="cost-selector"
          >
            <option value={0}>25 CRO</option>
            <option value={1}>50 CRO</option>
            <option value={2}>100 CRO</option>
          </select>
        </div>

        <div className="form-section">
          <div className="chest-nav">
            <button
              onMouseDown={() => startScrolling("left")}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              disabled={!canPlay}
              className="nav-arrow left-arrow"
            >
              ←
            </button>
            <span className="chest-prompt">Choose a Chest!</span>
            <button
              onMouseDown={() => startScrolling("right")}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              disabled={!canPlay}
              className="nav-arrow right-arrow"
            >
              →
            </button>
          </div>

          <div
            className="chest-container"
            style={{
              transform: `translateX(-${scrollOffset}px)`,
              width: `${extendedChests.length * chestWidth}px`,
            }}
          >
            {extendedChests.map((_, index) => (
              <Chest
                key={index}
                chestId={index % 10}
                isSelected={selectedChest === (index % 10)}
                onSelect={handleChestSelect}
                isDisabled={!isConnected || !canPlay}
                isSpinning={isSpinning}
              />
            ))}
          </div>
        </div>

        <div className="form-section">
          {selectedChest !== null ? (
            <PlayGame selectedChest={selectedChest} address={address} />
          ) : (
            <p className="info-text">
              {!canPlay ? "Insufficient funds to play!" : isCooldown ? "Wait 10 seconds before next play!" : "Select chest"}
            </p>
          )}
        </div>

        <div className="form-section">
          {isConnected ? (
            <ClaimPrizes address={address} gameCompleted={gameCompleted} />
          ) : (
            <p className="info-text">Please connect your wallet to view and claim prizes.</p>
          )}
        </div>
      </div>
    </div>
  );
}