"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { nSigFigs } from "@/hooks/use-hyperliquid-order-book";

interface OrderBookControlsProps {
  sigFigs: nSigFigs;
  setSigFigs: (value: nSigFigs) => void;
  denomination: string;
  setDenomination: (value: string) => void;
  selectedCoin: string;
  spreadsForSigFigs: Record<string, number>;
}

export function OrderBookControls({
  sigFigs,
  setSigFigs,
  denomination,
  setDenomination,
  selectedCoin,
  spreadsForSigFigs,
}: OrderBookControlsProps) {
  // Create array of options with their spread values
  const allSigFigOptions: nSigFigs[] = [null, 2, 3, 4, 5];
  const optionsWithSpreads = allSigFigOptions.map((option) => ({
    option,
    spreadValue: spreadsForSigFigs[option?.toString() || "null"],
  }));

  // Remove duplicates and sort by spread value (least to largest)
  const uniqueOptionsWithSpreads = optionsWithSpreads.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.spreadValue === item.spreadValue)
  );

  const sigFigOptions = uniqueOptionsWithSpreads
    .sort((a, b) => a.spreadValue - b.spreadValue)
    .map((item) => item.option);

  const denominationOptions = [selectedCoin, "USD"];

  // Helper function to format spread value
  const formatSpreadValue = (option: nSigFigs) => {
    const spreadValue = spreadsForSigFigs[option?.toString() || "null"];
    return spreadValue?.toLocaleString("en-US") || "—";
  };

  return (
    <div className="flex flex-row justify-between items-center p-2">
      <DropdownMenu>
        <DropdownMenuTrigger>{formatSpreadValue(sigFigs)}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {sigFigOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => setSigFigs(option)}
              className={cn(
                "min-w-0",
                option !== sigFigs ? "text-muted-foreground" : ""
              )}
            >
              {formatSpreadValue(option)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="text-sm font-semibold">Order Book</div>

      <DropdownMenu>
        <DropdownMenuTrigger>{denomination}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {denominationOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => setDenomination(option)}
              className={cn(
                "min-w-0",
                option !== denomination ? "text-muted-foreground" : ""
              )}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
