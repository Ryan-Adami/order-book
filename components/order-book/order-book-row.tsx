import { Denomination } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

interface OrderBookRowProps {
  price: number;
  size: number;
  total: number;
  usdTotal: number;
  barWidth: number;
  isFirstBid?: boolean;
  isLastBid?: boolean;
  isBids?: boolean;
  denomination: Denomination;
}

export function OrderBookRow({
  price,
  size,
  total,
  usdTotal,
  barWidth,
  isFirstBid = false,
  isBids = false,
  denomination,
}: OrderBookRowProps) {
  const barColor = isBids ? "rgb(21 128 61)" : "rgb(239 68 68)";
  const priceColor = isBids ? "text-green-600" : "text-red-400";

  return (
    <div
      className="relative cursor-pointer grid grid-cols-[20%_40%_40%]"
      style={{ marginTop: isFirstBid ? "1px" : "" }}
    >
      <div
        className="absolute left-0 top-0 z-10"
        style={{
          width: `${barWidth}%`,
          height: "22px",
          backgroundColor: barColor,
          opacity: 0.15,
        }}
      />

      <div className="pl-2.5 h-6 z-20 relative">
        <div
          className={`${priceColor} text-sm leading-6 hover:font-semibold hover:tracking-[-0.04em]`}
        >
          {formatNumber(price)}
        </div>
      </div>
      <div className="pr-0.5 z-20 relative">
        <div className="text-gray-200 text-sm leading-6 text-right hover:font-semibold hover:tracking-[-0.03em]">
          {denomination === "USD"
            ? formatNumber(price * size, [0, 0])
            : formatNumber(size, [4, 4])}
        </div>
      </div>
      <div className="pr-2.5 z-20 relative">
        <div className="text-gray-200 text-sm leading-6 text-right hover:font-semibold hover:tracking-[-0.03em]">
          {denomination === "USD"
            ? formatNumber(usdTotal, [0, 0])
            : formatNumber(total, [4, 4])}
        </div>
      </div>
    </div>
  );
}
