import { useCallback, useState } from 'react';
import type { Order } from '../../types';
import { getHistory } from '../../lib/gasClient';

export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadHistory = useCallback(async (lineId: string) => {
    const nextOrders = await getHistory(lineId);
    setOrders(nextOrders);
    return nextOrders;
  }, []);

  return { orders, loadHistory };
}
