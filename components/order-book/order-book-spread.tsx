import { formatNumber } from "@/lib/utils";

interface OrderBookSpreadProps {
  spreadValue: string;
  spreadPercentage: string;
}

export function OrderBookSpread({
  spreadValue,
  spreadPercentage,
}: OrderBookSpreadProps) {
  return (
    <div className="bg-gray-800 flex flex-row gap-8 justify-center items-center py-1">
      <div className="text-white text-sm">Spread</div>
      <div className="text-white text-sm">{spreadValue}</div>
      <div className="text-white text-sm">{spreadPercentage}%</div>
    </div>
  );
}
