'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@/components/ConnectButton';
import Image from 'next/image';
import Link from "next/link";
import { Abi, formatEther, Address } from 'viem'; // Importa Address da viem
import cronosSniperArtifact from '@/abi/CronosSniper.json';
import croCaveArtifact from '@/abi/CroCave.json';
import treasureHunterArtifact from '@/abi/TreasureHunterCronos.json';
import rewardsVaultArtifact from '@/abi/Rewards.json';

const CONTRACTS = {
  marksmanSniper: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MM as `0x${string}`,
    abi: cronosSniperArtifact as Abi,
  },
  cronosVault: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CV as `0x${string}`,
    abi: croCaveArtifact as Abi,
  },
  treasureHunter: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TH as `0x${string}`,
    abi: treasureHunterArtifact as Abi,
  },
  rewardsVault: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_RV as `0x${string}`,
    abi: rewardsVaultArtifact as Abi,
  },
};

const GAMES = [
  { name: 'Marksman Sniper', path: '/MM', image: '/marksman.png' },
  { name: 'Cronos Vault', path: '/CV', image: '/vault.png' },
  { name: 'Treasure Hunter', path: '/TH', image: '/hunter.png' },
];

export default function Home() {
  const { isConnected, address } = useAccount();
  const [totalRewards, setTotalRewards] = useState<string>('0');

  // Leggi i totali spesi dai contratti di gioco
  const { data: marksmanSpent } = useReadContract({
    address: CONTRACTS.marksmanSniper.address,
    abi: CONTRACTS.marksmanSniper.abi,
    functionName: 'getTotalSpent',
    args: [address],
    chainId: 338,
  }) as { data: bigint | undefined };

  const { data: cronosSpent } = useReadContract({
    address: CONTRACTS.cronosVault.address,
    abi: CONTRACTS.cronosVault.abi,
    functionName: 'getTotalSpent',
    args: [address],
    chainId: 338,
  }) as { data: bigint | undefined };

  const { data: treasureSpentData } = useReadContract({
    address: CONTRACTS.treasureHunter.address,
    abi: CONTRACTS.treasureHunter.abi,
    functionName: 'getPlayerSpentCronos',
    args: [],
    chainId: 338,
  }) as { data: [Address[], bigint[]] | undefined }; // Usa Address invece di address

  useEffect(() => {
    if (!isConnected || !address) {
      setTotalRewards('0');
      return;
    }

    const formatReward = (value: bigint | undefined) => (value ? Number(formatEther(value)) : 0);
    const marksman = formatReward(marksmanSpent);
    const cronos = formatReward(cronosSpent);

    // Calcola il totale speso da TH per l'utente connesso
    let treasure = 0;
    if (treasureSpentData) {
      const [players, spent] = treasureSpentData;
      const index = players.indexOf(address); // address è il valore, players è Address[]
      if (index !== -1) {
        treasure = formatReward(spent[index]);
      }
    }

    const total = (marksman + cronos + treasure) * 5; // 5 CROBET per CRO speso
    setTotalRewards(total.toFixed(4));
  }, [isConnected, address, marksmanSpent, cronosSpent, treasureSpentData]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess: txConfirmed, isLoading: txConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleClaimRewards = () => {
    if (!address || Number(totalRewards) <= 0) return;

    writeContract({
      address: CONTRACTS.rewardsVault.address,
      abi: CONTRACTS.rewardsVault.abi,
      functionName: 'claimRewards',
      args: [],
      account: address,
    });
  };

  useEffect(() => {
    if (txConfirmed) {
      setTotalRewards('0');
    }
  }, [txConfirmed]);

  return (
    <div className="layout-container">
      {/* Left Column */}
      <div className="left-column">
        <Image
          src="/crobet-logo.png"
          alt="Crobet Logo"
          width={300}
          height={300}
          priority
          style={{ marginBottom: '200px' }}
        />
        {isConnected && address && (
          <div style={{ textAlign: 'center', color: 'var(--foreground)' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--highlight)', textShadow: '0 0 10px rgba(255, 215, 0, 0.8)' }}>
              Total Rewards: {totalRewards} CROBET
            </p>
            <button
              onClick={handleClaimRewards}
              disabled={isPending || txConfirming || Number(totalRewards) <= 0}
              className="claim-button"
            >
              {isPending || txConfirming ? 'Processing...' : 'Riscuoti Rewards'}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <ConnectButton />
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          {!isConnected && (
            <p className="text-gray-800 mt-4">Connetti il wallet per vedere le ricompense e i giochi.</p>
          )}
          {isConnected && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {GAMES.map((game) => (
                <Link key={game.name} href={game.path} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Image
                      src={game.image}
                      alt={`${game.name} Preview`}
                      width={200}
                      height={200}
                    />
                    <p style={{ marginTop: '10px', fontSize: '1.1rem', color: 'var(--foreground)' }}>{game.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="right-column">
        <div className="presentation-box">
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--blue-cronos)', textShadow: '0 0 15px rgba(1, 120, 255, 0.8)', marginBottom: '20px' }}>
            Welcome to Crobet.fun!
          </h2>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px', color: 'var(--foreground)', textShadow: '0 0 5px rgba(255, 255, 255, 0.3)' }}>
            100% of ticket sales fuel the prize pool! On top of that, every game dishes out <span style={{ color: 'var(--highlight)', fontWeight: 'bold' }}>rewards</span> to players—giving it all back to the community.
          </p>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px', color: 'var(--foreground)', textShadow: '0 0 5px rgba(255, 255, 255, 0.3)' }}>
            1 CRO per game supports the <span style={{ color: 'var(--neon-green)' }}>token of the month</span>, voted by YOU! <span style={{ color: 'var(--highlight)' }}>Token owner?</span> Just hit us up!
          </p>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px', color: 'var(--foreground)', textShadow: '0 0 5px rgba(255, 255, 255, 0.3)' }}>
            Our games? A wild mix:
          </p>
          <ul style={{ listStyleType: 'none', paddingLeft: '0', marginBottom: '15px' }}>
            <li style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--neon-green)', textShadow: '0 0 10px rgba(0, 255, 204, 0.5)' }}>
              - Luck-based: Roll the dice and pray!
            </li>
            <li style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--neon-blue)', textShadow: '0 0 10px rgba(0, 204, 255, 0.5)' }}>
              - Skill-based: Show off your chops.
            </li>
            <li style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--neon-purple)', textShadow: '0 0 10px rgba(204, 0, 255, 0.5)' }}>
              - Luck & Skill: Best of both worlds.
            </li>
          </ul>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--foreground)', textShadow: '0 0 5px rgba(255, 255, 255, 0.3)' }}>
            Fresh games drop <span style={{ color: 'var(--highlight)', fontWeight: 'bold' }}>weekly</span>. Stick around—this shit’s just getting started!
          </p>
        </div>
      </div>
    </div>
  );
}