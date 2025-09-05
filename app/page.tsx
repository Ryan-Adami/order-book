"use client";
import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  nSigFigs,
  useHyperliquidOrderBook,
} from "@/hooks/use-hyperliquid-order-book";
import { OrderBookControls } from "@/components/order-book/order-book-controls";
import { OrderBookHeader } from "@/components/order-book/order-book-header";
import { OrderBookSection } from "@/components/order-book/order-book-section";
import { OrderBookSpread } from "@/components/order-book/order-book-spread";
import {
  getStoredSettings,
  setStoredSettings,
  getDefaultSettings,
  formatNumber,
} from "@/lib/utils";
import { Coin, COINS, Denomination } from "@/lib/constants";
import { OrderBookPairDropdown } from "@/components/order-book/order-book-pair-dropdown";

function OrderBookContent({ coin = "BTC" }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getInitialCoin = (): Coin => {
    const tradeParam = searchParams.get("trade");
    if (tradeParam && COINS.includes(tradeParam as Coin)) {
      return tradeParam as Coin;
    }
    if (tradeParam && !COINS.includes(tradeParam as Coin)) {
      router.replace(window.location.pathname);
    }
    return coin;
  };

  const [selectedCoin, setSelectedCoin] = useState<Coin>(getInitialCoin());
  const [sigFigs, setSigFigs] = useState<nSigFigs>(2);
  const [denomination, setDenomination] = useState<Denomination>(selectedCoin);
  const { orderBook, isLoading, spreadsForSigFigs } = useHyperliquidOrderBook(
    selectedCoin,
    sigFigs
  );

  const handleCoinSelection = (newCoin: Coin) => {
    setSelectedCoin(newCoin);
    const params = new URLSearchParams(searchParams.toString());
    params.set("trade", newCoin);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const storedSettings = getStoredSettings();
    const coinSettings = storedSettings[selectedCoin];

    if (coinSettings) {
      setSigFigs(coinSettings.sigFigs);
      setDenomination(coinSettings.denomination);
    } else {
      const defaultSettings = getDefaultSettings();
      setSigFigs(defaultSettings.sigFigs);
      setDenomination(defaultSettings.denomination);
    }
  }, [selectedCoin]);

  useEffect(() => {
    setStoredSettings(selectedCoin, { sigFigs, denomination });
  }, [selectedCoin, sigFigs, denomination]);

  const formatOrderBookData = useMemo(() => {
    if (!orderBook?.levels) return null;

    const bids = orderBook.levels[0].slice(0, 11);
    const originalAsks = orderBook.levels[1].slice(0, 11);

    let bidTotal = 0;
    let bidUsdTotal = 0;
    const processedBids = bids.map((bid) => {
      const price = parseFloat(bid.px);
      const size = parseFloat(bid.sz);
      bidTotal += size;
      bidUsdTotal += price * size;
      return {
        price,
        size,
        total: bidTotal,
        usdTotal: bidUsdTotal,
      };
    });

    let askTotal = 0;
    let askUsdTotal = 0;
    const processedAsksOriginal = originalAsks.map((ask) => {
      const price = parseFloat(ask.px);
      const size = parseFloat(ask.sz);
      askTotal += size;
      askUsdTotal += price * size;
      return {
        price,
        size,
        total: askTotal,
        usdTotal: askUsdTotal,
      };
    });

    const processedAsks = processedAsksOriginal.reverse();

    const lowestAsk = Math.min(...originalAsks.map((a) => parseFloat(a.px)));
    const highestBid = Math.max(...bids.map((b) => parseFloat(b.px)));
    const spreadNumber = lowestAsk - highestBid;
    const numberOfDecimals =
      formatNumber(lowestAsk).split(".")?.[1]?.length ?? 0;
    const spread = formatNumber(spreadNumber, [
      numberOfDecimals,
      numberOfDecimals,
    ]);
    const midPrice = (lowestAsk + highestBid) / 2;
    const spreadPercentage = ((spreadNumber / midPrice) * 100).toFixed(3);

    return {
      asks: processedAsks,
      bids: processedBids,
      spread: { value: spread, percentage: spreadPercentage, numberOfDecimals },
      maxAskTotal: askTotal,
      maxBidTotal: bidTotal,
    };
  }, [orderBook]);

  return (
    <div className="p-4 min-h-screen">
      <div className="max-w-[400px] mx-auto">
        <OrderBookPairDropdown
          selectedCoin={selectedCoin}
          handleCoinSelection={handleCoinSelection}
        />
        {formatOrderBookData &&
        !isLoading &&
        Object.keys(spreadsForSigFigs).length > 0 ? (
          <div className="overflow-hidden border border-gray-800 h-[623px]">
            <OrderBookControls
              sigFigs={sigFigs}
              setSigFigs={setSigFigs}
              denomination={denomination}
              setDenomination={setDenomination}
              selectedCoin={selectedCoin}
              spreadsForSigFigs={spreadsForSigFigs}
            />
            <OrderBookHeader denomination={denomination} />
            <OrderBookSection
              orders={formatOrderBookData.asks}
              maxTotal={formatOrderBookData.maxAskTotal}
              denomination={denomination}
            />
            <OrderBookSpread
              spreadValue={formatOrderBookData.spread.value}
              spreadPercentage={formatOrderBookData.spread.percentage}
            />
            <OrderBookSection
              orders={formatOrderBookData.bids}
              maxTotal={formatOrderBookData.maxBidTotal}
              isBids={true}
              denomination={denomination}
            />
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-800 h-[623px] w-[400px]">
            <div className="flex justify-between items-center p-2 border-gray-800">
              <div className="h-4 w-16 bg-gray-700/15 animate-pulse"></div>
              <div className="text-sm font-semibold">Order Book</div>
              <div className="h-4 w-20 bg-gray-700/15 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-[20%_40%_40%] text-gray-400 text-sm font-medium py-1 px-2">
              <div className="text-left">Price</div>
              <div className="text-right">Size ({denomination})</div>
              <div className="text-right">Total ({denomination})</div>
            </div>
            <div className="space-y-0">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="relative h-6 flex items-center">
                  <div className="absolute inset-0 bg-red-900/20"></div>
                  <div className="relative z-10 grid grid-cols-[20%_40%_40%] w-full px-2 text-sm">
                    <div className="text-left">
                      <div className="h-4 w-16 bg-gray-700/15 animate-pulse"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 flex flex-row gap-8 justify-center items-center py-1">
              <div className="text-white text-sm">Spread</div>
              <div className="h-4 w-12 bg-gray-700/15 animate-pulse"></div>
              <div className="h-4 w-8 bg-gray-700/15 animate-pulse"></div>
            </div>
            <div className="space-y-0">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="relative h-6 flex items-center">
                  <div className="absolute inset-0 bg-green-900/20"></div>
                  <div className="relative z-10 grid grid-cols-[20%_40%_40%] w-full px-2 text-sm">
                    <div className="text-left">
                      <div className="h-4 w-16 bg-gray-700/15 animate-pulse"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* <DebugInfo orderBook={orderBook} /> */}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="p-4 min-h-screen">
      <div className="max-w-[400px] mx-auto">
        <div className="h-10 w-full bg-gray-700/15 animate-pulse rounded mb-4"></div>
        <div className="overflow-hidden border border-gray-800 h-[623px] w-[400px]">
          <div className="flex justify-between items-center p-2 border-gray-800">
            <div className="h-4 w-16 bg-gray-700/15 animate-pulse"></div>
            <div className="text-sm font-semibold">Order Book</div>
            <div className="h-4 w-20 bg-gray-700/15 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-[20%_40%_40%] text-gray-400 text-sm font-medium py-1 px-2">
            <div className="text-left">Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Total</div>
          </div>
          <div className="space-y-0">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="relative h-6 flex items-center">
                <div className="absolute inset-0 bg-red-900/20"></div>
                <div className="relative z-10 grid grid-cols-[20%_40%_40%] w-full px-2 text-sm">
                  <div className="text-left">
                    <div className="h-4 w-16 bg-gray-700/15 animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 flex flex-row gap-8 justify-center items-center py-1">
            <div className="text-white text-sm">Spread</div>
            <div className="h-4 w-12 bg-gray-700/15 animate-pulse"></div>
            <div className="h-4 w-8 bg-gray-700/15 animate-pulse"></div>
          </div>
          <div className="space-y-0">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="relative h-6 flex items-center">
                <div className="absolute inset-0 bg-green-900/20"></div>
                <div className="relative z-10 grid grid-cols-[20%_40%_40%] w-full px-2 text-sm">
                  <div className="text-left">
                    <div className="h-4 w-16 bg-gray-700/15 animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 bg-gray-700/15 animate-pulse ml-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HyperliquidOrderBook({ coin = "BTC" }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderBookContent coin={coin} />
    </Suspense>
  );
}
