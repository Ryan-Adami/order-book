export function OrderBookHeader({ denomination }: { denomination: string }) {
  return (
    <div className="grid grid-cols-[20%_40%_40%] text-gray-400 text-sm font-medium py-1 px-2">
      <div className="text-left">Price</div>
      <div className="text-right">Size ({denomination})</div>
      <div className="text-right">Total ({denomination})</div>
    </div>
  );
}
