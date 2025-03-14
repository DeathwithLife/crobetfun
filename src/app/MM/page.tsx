'use client';

import { useState, useEffect } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import Image from "next/image";
import cronosSniperABI from "@/abi/CronosSniper.json";
import bandOracleABI from "@/abi/IBandOracle.json";
import PriceChart from "@/components/PriceChart";
import ActiveBets from "@/components/ActiveBets";
import { useBetContext } from "@/context/BetContext";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [predictedPrice, setPredictedPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [gameType, setGameType] = useState("0");
  const [isPriceValid, setIsPriceValid] = useState(true);
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const { writeContract, isPending, error, data: txHash } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  const [betPlaced, setBetPlaced] = useState(false);
  const { setNotification } = useBetContext();

  const { data: priceData, refetch: refetchPrice } = useReadContract({
    abi: bandOracleABI,
    address: "0xD0b2234eB9431e850a814bCdcBCB18C1093F986B",
    functionName: "getReferenceData",
    args: ["CRO", "USD"],
    chainId: 338,
  }) as { data: [bigint, bigint, bigint] | undefined; refetch: () => void };

  const { data: userBets } = useReadContract({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MM as `0x${string}`,
    abi: cronosSniperABI,
    functionName: "getUserBetDetails",
    args: [],
    chainId: 338,
    account: address,
  }) as { data: any[] | undefined };

  useEffect(() => {
    const interval = setInterval(() => {
      refetchPrice();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchPrice]);

  useEffect(() => {
    if (txConfirmed) {
      console.log("Home - Bet confirmed, txHash:", txHash);
      setNotification({ message: "Scommessa piazzata con successo!", type: "success" });
      setPredictedPrice("");
      setAmount("");
      setGameType("0");
      setBetPlaced(true);
      setIsPriceValid(true);
    }
    if (error) {
      console.log("Home - Bet error:", error.message);
      setNotification({ message: "Errore: la scommessa è fallita (revert dal contratto)", type: "error" });
    }
  }, [txConfirmed, error, txHash, setNotification]);

  useEffect(() => {
    if (userBets) {
      const active = userBets.filter(bet => !bet.resolved).map(bet => ({
        gameType: Number(bet.gameType),
      }));
      setActiveBets(active);
    }
  }, [userBets]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9,.]/g, '');
    const parts = value.split(/[,.]/);
    if (parts.length > 2) {
      const separator = value.includes(',') ? ',' : '.';
      value = parts[0] + separator + parts.slice(1).join('');
    }
    if (value.includes(',') || value.includes('.')) {
      const separator = value.includes(',') ? ',' : '.';
      const [integerPart, decimalPart] = value.split(separator);
      if (decimalPart && decimalPart.length > 5) {
        value = `${integerPart}${separator}${decimalPart.slice(0, 5)}`;
      }
    }
    setPredictedPrice(value);
    const cleanedValue = value.replace(',', '.');
    const isValid = /^[0-9]+\.[0-9]{5}$/.test(cleanedValue);
    setIsPriceValid(isValid);
    if (!isValid && value) {
      setNotification({ message: "Il prezzo deve essere nel formato X,xxxxx (es. 0,07420)", type: "warning" });
    }
  };

  const gameTypeNames = [
    "Glint (30min)", "Snap (1h)", "Rush (3h)", "Strike (6h)", "Blast (12h)",
    "Snipe (24h)", "Boom (72h)", "Raid (120h)", "Chase (168h)", "Hunt (240h)", "Kill (720h)"
  ];

  const handlePlaceBet = () => {
    if (!predictedPrice || !amount) {
      setNotification({ message: "Inserisci prezzo previsto e importo!", type: "warning" });
      return;
    }

    if (!isPriceValid) {
      setNotification({ message: "Il prezzo deve essere nel formato X,xxxxx (es. 0,07420)", type: "warning" });
      return;
    }

    const parsedPrice = parseFloat(predictedPrice.replace(',', '.'));
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedPrice) || isNaN(parsedAmount)) {
      setNotification({ message: "Inserisci valori numerici validi!", type: "warning" });
      return;
    }

    if (parsedPrice <= 0 || parsedAmount < 1) {
      setNotification({ message: "Il prezzo deve essere maggiore di zero e l'importo almeno 1 TCRO!", type: "warning" });
      return;
    }

    const selectedGameType = Number(gameType);
    const existingBet = activeBets.find(bet => bet.gameType === selectedGameType);
    if (existingBet) {
      setNotification({ message: `Hai già una scommessa attiva ${gameTypeNames[selectedGameType]}! Solo una scommessa per tipo è consentita.`, type: "warning" });
      return;
    }

    const predictedPriceInWei = BigInt(Math.floor(parsedPrice * 1e5));
    const amountInWei = BigInt(Math.floor(parsedAmount * 1e18));
    const fee = amountInWei / BigInt(20); // 5% fee
    const totalValue = amountInWei + fee;

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MM;
    if (!contractAddress) {
      setNotification({ message: "Indirizzo del contratto non configurato!", type: "error" });
      return;
    }

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: cronosSniperABI,
      functionName: "placeBet",
      args: [
        Number(gameType),
        predictedPriceInWei,
        amountInWei,
        "0x0000000000000000000000000000000000000000",
      ],
      value: totalValue,
      chainId: 338,
    });
  };

  return (
    <div className="pages">
      <div className="logo-container">
        <Image
          src="/images/logo_mm.png"
          alt="Cronos Challenge Logo"
          width={600}
          height={57}
          className="logo-banner"
        />
      </div>

      <div className="flex justify-center mt-16 mb-12"> {/* Aumentato mt-16 (64px) per più spazio */}
        <ConnectButton />
      </div>

      {!isConnected ? (
        <p className="text-gray-800 mt-4 text-center">Connect your wallet to start.</p>
      ) : (
        <div className="mt-4">
          <div className="price-container mb-16 text-center" style={{ marginTop: "16px" }}>
            <h4 className="text-[20px] font-bold text-blue-600 mt-8">CRO Price:</h4>
            <p className="text-xl">
              {priceData ? (Number(priceData[0]) / 1e18).toFixed(5).replace('.', ',') : "Loading..."} USD
            </p>
            <PriceChart />
          </div>

          <div className="bet-form max-w-lg mx-auto p-4 rounded-full shadow-lg bg-gradient-to-br from-gray-100 to-white mb-2" style={{ borderRadius: "20px" }}>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-3 py-2 mb-4 shadow-inner"
              style={{ borderRadius: "15px" }}
            >
              <option value="0">Glint (30min)</option>
              <option value="1">Snap (1h)</option>
              <option value="2">Rush (3h)</option>
              <option value="3">Strike (6h)</option>
              <option value="4">Blast (12h)</option>
              <option value="5">Snipe (24h)</option>
              <option value="6">Boom (72h)</option>
              <option value="7">Raid (120h)</option>
              <option value="8">Chase (168h)</option>
              <option value="9">Hunt (240h)</option>
              <option value="10">Kill (720h)</option>
            </select>
            <input
              type="text"
              placeholder="X,xxxxx (USD)"
              value={predictedPrice}
              onChange={handlePriceChange}
              className="w-full border border-gray-300 rounded-full px-3 py-2 mb-4 shadow-inner"
              style={{ borderRadius: "15px" }}
            />
            <input
              type="number"
              placeholder="Amount (tCRO)"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              step="0.1"
              min="1"
              className="w-full border border-gray-300 rounded-full px-3 py-2 mb-4 shadow-inner"
              style={{ borderRadius: "15px" }}
            />
            <button
              onClick={handlePlaceBet}
              disabled={isPending || !isPriceValid}
              className="w-full bg-blue-500 text-white px-2 py-0.5 rounded-full hover:bg-blue-600 shadow-md"
              style={{ borderRadius: "15px", fontSize: "14px", fontWeight: "500" }}
            >
              {isPending ? "Confirming..." : "Place Bet"}
            </button>
          </div>

          <ActiveBets onBetPlaced={() => setBetPlaced(false)} />
        </div>
      )}
    </div>
  );
}