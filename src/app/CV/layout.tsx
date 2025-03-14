import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import ContextProvider from "@/context";
import { GameProvider } from "@/context/GameContextCV"; // Updated
import TopWinners from "@/components/TopWinnersCV";
import GameRules from "@/components/GameRules";

export const metadata: Metadata = {
  title: "CroCave",
  description: "Guess the number and win on Cronos!",
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
          <GameProvider>
            <div className="layout-container">
              <div className="mobile-links">
                <a href="/rules">Rules</a>
                <a href="/winners">Winners</a>
              </div>

              <div className="left-column">
                <div className="flex flex-col justify-between h-full p-4">
                  {/* Vuoto o logo */}
                </div>
              </div>

              <div className="main-content">{children}</div>

              <div className="right-column">
                <div className="top-winners sticky-top">
                  <TopWinners />
                </div>
                <div className="game-rules sticky-bottom">
                  <GameRules />
                </div>
              </div>
            </div>
          </GameProvider>
        </ContextProvider>
      </body>
    </html>
  );
}