import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { COINS, Coin } from "@/lib/constants";

interface OrderBookPairDropdownProps {
  selectedCoin: Coin;
  handleCoinSelection: (coin: Coin) => void;
}

export function OrderBookPairDropdown({
  selectedCoin,
  handleCoinSelection,
}: OrderBookPairDropdownProps) {
  return (
    <div className="flex flex-row items-center gap-2 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="font-semibold flex items-center gap-2">
          <img
            src={`${selectedCoin}.svg`}
            alt={selectedCoin}
            className="w-5 h-5"
          />
          {selectedCoin}-USD
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {COINS.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleCoinSelection(option)}
              className={cn(
                "min-w-0 flex items-center gap-2 font-semibold",
                option !== selectedCoin ? "text-muted-foreground" : ""
              )}
            >
              <img src={`${option}.svg`} alt={option} className="w-4 h-4" />
              {option}-USD
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
