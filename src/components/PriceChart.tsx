// PriceChart.tsx
'use client';

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { Line } from "react-chartjs-2";
import bandOracleABI from "@/abi/IBandOracle.json";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PriceChart() {
  const { data: priceData, isLoading, error, refetch } = useReadContract({
    abi: bandOracleABI,
    address: process.env.NEXT_PUBLIC_BAND_ORACLE_ADDRESS as `0x${string}`,
    functionName: "getReferenceData",
    args: ["CRO", "USD"],
  }) as {
    data: [bigint, bigint, bigint] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  const [prices, setPrices] = useState<number[]>([]);

  useEffect(() => {
    console.log("PriceChart - Env Address:", process.env.NEXT_PUBLIC_BAND_ORACLE_ADDRESS);
    console.log("PriceChart - priceData:", priceData);
    console.log("PriceChart - priceData[0]:", priceData?.[0]);
    console.log("PriceChart - lastUpdatedQuote:", priceData?.[2]);
    console.log("PriceChart - isLoading:", isLoading, "Error:", error);
    if (priceData && !isLoading && !error) {
      const newPrice = Number(priceData[0]) / 1e18; // 0.082822
      console.log("PriceChart - New Price:", newPrice);
      setPrices((prev) => {
        const updated = [...prev.slice(-9), newPrice];
        console.log("PriceChart - Updated Prices:", updated);
        return updated;
      });
    } else if (error) {
      console.log("PriceChart - Failed to load price:", error.message);
    }
  }, [priceData, isLoading, error]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("PriceChart - Refetching price...");
      refetch();
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [refetch]);

  const chartData = {
    labels: prices.length > 0 ? prices.map((_, i) => `${i * 10}s`) : ["0s"],
    datasets: [
      {
        label: "CRO/USD",
        data: prices.length > 0 ? prices : [0],
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false }, // Rimosso il titolo "CRO Price" dal grafico
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `CRO/USD: ${value.toFixed(5).replace('.', ',')}`; // X,XXXXX nei tooltip
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { 
        title: { display: true, text: "Price (USD)" },
        ticks: {
          precision: 5 // Limita a 5 decimali sull'asse Y
        }
      },
    },
  };

  return (
    <div className="price-chart mt-4" style={{ height: "300px", width: "100%", position: "relative" }}>
      {isLoading && !prices.length ? (
        <p>Loading price data...</p>
      ) : error ? (
        <div>
          <p>Error loading price: {error.message}</p>
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
}