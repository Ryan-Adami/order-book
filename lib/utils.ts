import { clsx, type ClassValue } from "clsx";
import Decimal from "decimal.js";
import { twMerge } from "tailwind-merge";
import { Coin, Denomination } from "./constants";
import { nSigFigs } from "@/hooks/use-hyperliquid-order-book";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, minMaxPrecision?: [number, number]) {
  if (minMaxPrecision) {
    const formatted = num.toLocaleString("en-US", {
      minimumFractionDigits: minMaxPrecision[0],
      maximumFractionDigits: minMaxPrecision[1],
    });
    return formatted;
  }

  if (num === 0) return "0";

  const decimal = new Decimal(num);
  const significantDigits = decimal.sd(true);

  if (significantDigits >= 5) {
    const formatted = decimal.toNumber().toLocaleString("en-US");
    return formatted;
  }

  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 5 - significantDigits,
    maximumFractionDigits: 5 - significantDigits,
  });

  return formatted;
}

export function processNumber(num: number): number {
  if (num === 0) return 0;

  const decimal = new Decimal(num);
  const significantDigits = decimal.sd();

  if (significantDigits >= 5) {
    return decimal.toNumber();
  }

  return decimal.toSD(5).toNumber();
}

export interface OrderBookSettings {
  sigFigs: nSigFigs;
  denomination: Denomination;
}

export interface StoredSettings {
  [key: string]: OrderBookSettings;
}

const STORAGE_KEY = "orderBookSettings";

export function getStoredSettings(): StoredSettings {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return {};
  }
}

export function setStoredSettings(
  coin: Coin,
  settings: OrderBookSettings
): void {
  if (typeof window === "undefined") return;

  try {
    const currentSettings = getStoredSettings();
    const updatedSettings = {
      ...currentSettings,
      [coin]: settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
}

export function getDefaultSettings(): OrderBookSettings {
  return {
    sigFigs: 2,
    denomination: "USD",
  };
}

export function roundToSigFigs(num: number, sigFigs: number): number {
  if (num === 0) return 0;

  const decimal = new Decimal(num);
  return decimal.toSD(sigFigs).toNumber();
}

export interface SpreadData {
  value: number;
  percentage: string;
}

export function calculateSpreadsForAllSigFigs(
  orderBook: any
): Record<number, SpreadData> {
  if (!orderBook?.levels) return {};

  const bids = orderBook.levels[0];
  const asks = orderBook.levels[1];

  const spreads: Record<number, SpreadData> = {};

  // Calculate for each sig fig value
  [2, 3, 4, 5].forEach((sigFigs) => {
    const roundedBids = bids.map((bid: any) =>
      roundToSigFigs(parseFloat(bid.px), sigFigs)
    );
    const roundedAsks = asks.map((ask: any) =>
      roundToSigFigs(parseFloat(ask.px), sigFigs)
    );

    const lowestAsk = Math.min(...roundedAsks);
    const highestBid = Math.max(...roundedBids);
    const spread = lowestAsk - highestBid;
    const midPrice = (lowestAsk + highestBid) / 2;
    const spreadPercentage = ((spread / midPrice) * 100).toFixed(3);

    spreads[sigFigs] = {
      value: spread,
      percentage: spreadPercentage,
    };
  });

  return spreads;
}
