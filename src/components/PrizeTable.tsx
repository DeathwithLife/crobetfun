"use client";

import { useGameContext } from "@/context/GameContext";

interface Prize {
  icon: string;
  name: string;
  value: number;
}

interface PrizeData {
  [key: number]: Prize[];
}

const prizeData: PrizeData = {
  0: [ // Livello 25 CRO
    { icon: "💎", name: "Cronos Trillionaire", value: 2500 },
    { icon: "💰", name: "Cronos Billionaire", value: 1250 },
    { icon: "💵", name: "Cronos Millionaire", value: 500 },
    { icon: "🚀", name: "Bull Run BB!", value: 250 },
    { icon: "🔥", name: "We are so FuCkInG Back!", value: 125 },
    { icon: "⚡", name: "We are Back!", value: 50 },
    { icon: "🟢", name: "Good Exit", value: 37.5 },
    { icon: "🔵", name: "No Loss, Good news", value: 25 },
    { icon: "🐻", name: "Bear Market", value: 10 },
    { icon: "💀", name: "Rug Pull", value: 0 },
  ],
  1: [ // Livello 50 CRO
    { icon: "💎", name: "Cronos Trillionaire", value: 5000 },
    { icon: "💰", name: "Cronos Billionaire", value: 2500 },
    { icon: "💵", name: "Cronos Millionaire", value: 1000 },
    { icon: "🚀", name: "Bull Run BB!", value: 500 },
    { icon: "🔥", name: "We are so FuCkInG Back!", value: 250 },
    { icon: "⚡", name: "We are Back!", value: 100 },
    { icon: "🟢", name: "Good Exit", value: 75 },
    { icon: "🔵", name: "No Loss, Good news", value: 50 },
    { icon: "🐻", name: "Bear Market", value: 20 },
    { icon: "💀", name: "Rug Pull", value: 0 },
  ],
  2: [ // Livello 100 CRO
    { icon: "💎", name: "Cronos Trillionaire", value: 10000 },
    { icon: "💰", name: "Cronos Billionaire", value: 5000 },
    { icon: "💵", name: "Cronos Millionaire", value: 2000 },
    { icon: "🚀", name: "Bull Run BB!", value: 1000 },
    { icon: "🔥", name: "We are so FuCkInG Back!", value: 500 },
    { icon: "⚡", name: "We are Back!", value: 200 },
    { icon: "🟢", name: "Good Exit", value: 150 },
    { icon: "🔵", name: "No Loss, Good news", value: 100 },
    { icon: "🐻", name: "Bear Market", value: 40 },
    { icon: "💀", name: "Rug Pull", value: 0 },
  ],
};

export default function PrizeTable() {
  const { gameLevel } = useGameContext();
  const prizes: Prize[] = prizeData[gameLevel];

  return (
    <div>
      <h2 className="prize-table-title">Prizes</h2>
      <ul className="prize-table-list">
        {prizes.map((prize: Prize, index: number) => (
          <li key={index}>
            {prize.icon} <strong>{prize.name}:</strong> {prize.value} CRO
          </li>
        ))}
      </ul>
    </div>
  );
}