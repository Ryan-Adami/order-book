export const COINS = ["BTC", "ETH"];

export type Coin = (typeof COINS)[number];

export type Denomination = Coin | "USD";
