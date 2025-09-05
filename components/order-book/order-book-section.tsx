import { Denomination } from "@/lib/constants";
import { OrderBookRow } from "./order-book-row";

interface OrderBookSectionProps {
  orders: Array<{
    price: number;
    size: number;
    total: number;
    usdTotal: number;
  }>;
  maxTotal: number;
  denomination: Denomination;
  isBids?: boolean;
}

export function OrderBookSection({
  orders,
  maxTotal,
  denomination,
  isBids = false,
}: OrderBookSectionProps) {
  return (
    <>
      {orders.map((order, index) => {
        const barWidth = (order.total / maxTotal) * 100;

        return (
          <OrderBookRow
            key={index}
            price={order.price}
            size={order.size}
            total={order.total}
            usdTotal={order.usdTotal}
            barWidth={barWidth}
            isFirstBid={isBids && index === 0}
            isBids={isBids}
            denomination={denomination}
          />
        );
      })}
    </>
  );
}
