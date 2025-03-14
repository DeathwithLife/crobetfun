import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import ContextProvider from "@/context";
import { GameProvider } from "@/context/GameContext";
import TopWinners from "@/components/TopWinnersTH";
import PrizeTable from "@/components/PrizeTable";
import LastWinners from "@/components/LastWinners"; // Import del nuovo componente

export const metadata: Metadata = {
  title: "Treasure Hunter on CRO",
  description: "AppKit example dApp",
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
                  {/* Vuoto */}
                </div>
              </div>

              <div className="main-content">{children}</div>

              <div className="right-column">
                <div className="top-winners">
                  <TopWinners />
                </div>
                <div className="last-winners-container">
                  <LastWinners />
                </div>
                <div className="prize-table">
                  <PrizeTable />
                </div>
              </div>
            </div>
          </GameProvider>
        </ContextProvider>
      </body>
    </html>
  );
}