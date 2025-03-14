// src/app/MM/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import ContextProvider from "@/context";
import { BetProvider } from "@/context/BetContext";
import TopWinners from "@/components/TopWinnersMM";
import PastBets from "@/components/PastBets";
import Last5Winners from "@/components/Last5WinnersMM";
import { memo } from "react";

const MemoizedTopWinners = memo(TopWinners);
const MemoizedPastBets = memo(PastBets);
const MemoizedLast5Winners = memo(Last5Winners);

export const metadata: Metadata = {
  title: "Cronos Sniper",
  description: "Bet on CRO/USD price predictions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const cookies = headersData.get("cookie");

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          <BetProvider>
            <div className="layout-container flex flex-col md:flex-row min-h-screen">
              <div className="left-column md:w-1/4 p-4 flex flex-col">
                {/* Game Rules in cima */}
                <div
                  className="game-rules-container w-full"
                  style={{ background: "rgba(0, 0, 0, 0.6)", borderRadius: "8px", textAlign: "center" }}
                >
                  <h2>Game Rules</h2>
                  <ul>
                    <p>Welcome to Cronos Sniper:</p>
                    <p style={{ color: "red", margin: "0" }}>HARDCORE</p> {/* Rimossi spazi e aggiunto colore rosso */}
                    <p></p>
                    <li>
                      ⏳ <strong>1. choose the target distance</strong>
                    </li>
                    <li></li>
                    <li>
                      🎯 <strong>2. Place a bet (X,xxxxx only) on CRO/USD price</strong>
                    </li>
                    <li></li>
                    <li>
                      💰<strong>3. Get Rich </strong>
                    </li>
                    <li></li>
                  </ul>
                </div>

                {/* Prize Table al fondo estremo */}
                <div
                  className="prize-table-container w-full"
                  style={{ background: "rgba(0, 0, 0, 0.6)", borderRadius: "8px", textAlign: "center" }}
                >
                  <h2>Prize Table 🏆</h2>
                  <ul>
                    <li>🔒 <strong>Glint (30min):</strong> 10x your bet</li>
                    <li>⚡ <strong>Snap (1h):</strong> 25x your bet</li>
                    <li>🚀 <strong>Rush (3h):</strong> 50x your bet</li>
                    <li>🌩️ <strong>Strike (6h):</strong> 100x your bet</li>
                    <li>💥 <strong>Blast (12h):</strong> 250x your bet</li>
                    <li>🎯 <strong>Snipe (24h):</strong> 500x your bet</li>
                    <li>💣 <strong>Boom (72h):</strong> 750x your bet</li>
                    <li>⚔️ <strong>Raid (120h):</strong> 1000x your bet</li>
                    <li>🔋 <strong>Chase (168h):</strong> 2500x your bet</li>
                    <li>🦇 <strong>Hunt (240h):</strong> 5000x your bet</li>
                    <li>💀 <strong>Kill (720h):</strong> 10000x your bet</li>
                    <li></li>
                    <p><em> Exact Match Only:</em> HARDCORE</p>
                    <li></li>
                    <p><em> Winnings will be automatically sent to your wallet </em></p>
                    <li></li>
                  </ul>
                </div>
              </div>
              <div className="main-content md:w-2/4 p-4">{children}</div>
              <div className="right-column md:w-1/4 p-4 flex flex-col justify-between">
                <div
                  className="top-winners-container w-full"
                  style={{ background: "rgba(0, 0, 0, 0.6)", borderRadius: "8px", textAlign: "center" }}
                >
                  <MemoizedTopWinners />
                </div>
                <div
                  className="last-winners-container w-full"
                  style={{ background: "rgba(0, 0, 0, 0.6)", borderRadius: "8px", textAlign: "center", margin: "20px 0" }}
                >
                  <MemoizedLast5Winners />
                </div>
                <div
                  className="past-bets-container w-full"
                  style={{ background: "rgba(0, 0, 0, 0.6)", borderRadius: "8px", textAlign: "center" }}
                >
                  <h2>Latest Bets</h2>
                  <MemoizedPastBets />
                </div>
              </div>
            </div>
          </BetProvider>
        </ContextProvider>
      </body>
    </html>
  );
}