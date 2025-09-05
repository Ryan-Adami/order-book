"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as hl from "@nktkas/hyperliquid";
import type { Book } from "@nktkas/hyperliquid/types";
import { Decimal } from "decimal.js";

export type nSigFigs = null | 2 | 3 | 4 | 5;

export const useHyperliquidOrderBook = (coin = "BTC", nSigFigs: nSigFigs) => {
  const [orderBook, setOrderBook] = useState<Book | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [spreadsForSigFigs, setSpreadsForSigFigs] = useState<
    Record<string, number>
  >({});
  const transport = useRef<hl.WebSocketTransport | null>(null);
  const infoClient = useRef<hl.InfoClient | null>(null);
  const subsClient = useRef<hl.SubscriptionClient | null>(null);
  const subscription = useRef<any>(null);
  const updateQueue = useRef<Book[]>([]);
  const isProcessingRef = useRef(false);
  const previousCoin = useRef<string>(coin);

  const processUpdates = useCallback(() => {
    if (updateQueue.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    const latestUpdate = updateQueue.current[updateQueue.current.length - 1];
    updateQueue.current = [];

    setOrderBook(latestUpdate);
    isProcessingRef.current = false;
  }, []);

  const startProcessing = useCallback(() => {
    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      processUpdates();
    }
  }, [processUpdates]);

  const connect = useCallback(
    async (isCoinChange = false) => {
      try {
        if (isCoinChange) {
          setIsLoading(true);
          setOrderBook(null);
          setSpreadsForSigFigs({});
        }

        transport.current = new hl.WebSocketTransport();
        infoClient.current = new hl.InfoClient({
          transport: transport.current,
        });
        subsClient.current = new hl.SubscriptionClient({
          transport: transport.current,
        });

        const initialDataRaw = await infoClient.current.l2Book({
          coin,
          nSigFigs: null,
        });

        const spreadForFullPrecision =
          parseFloat(initialDataRaw.levels[1][0].px) -
          parseFloat(initialDataRaw.levels[0][0].px);

        const numberOfSignificantDigitsForFullPrecision = Math.max(
          new Decimal(parseFloat(initialDataRaw.levels[1][0].px)).sd(),
          new Decimal(parseFloat(initialDataRaw.levels[0][0].px)).sd()
        );

        const spreadsForSigFigs = {
          null: spreadForFullPrecision,
          ...Object.fromEntries(
            [2, 3, 4, 5].map((sigFigs) => [
              sigFigs,
              numberOfSignificantDigitsForFullPrecision === sigFigs
                ? spreadForFullPrecision
                : 10 ** (numberOfSignificantDigitsForFullPrecision - sigFigs) *
                  spreadForFullPrecision,
            ])
          ),
        };

        const initialData = await infoClient.current.l2Book({
          coin,
          nSigFigs: nSigFigs,
        });
        setOrderBook(initialData);

        subscription.current = await subsClient.current.l2Book(
          { coin, nSigFigs: nSigFigs },
          (data) => {
            updateQueue.current.push(data);
            startProcessing();
          }
        );
        setSpreadsForSigFigs(spreadsForSigFigs);
        setIsConnected(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error connecting:", error);
        setIsLoading(false);
      }
    },
    [coin, nSigFigs, startProcessing]
  );

  useEffect(() => {
    const isCoinChange = previousCoin.current !== coin;
    previousCoin.current = coin;

    connect(isCoinChange);

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
      if (transport.current) {
        transport.current.socket.close();
      }
    };
  }, [connect, nSigFigs]);

  return { orderBook, isConnected, isLoading, spreadsForSigFigs };
};
