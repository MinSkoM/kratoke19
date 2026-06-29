import { useState } from 'react';
import type { CartItem } from '../../types';
import { submitOrder } from '../../lib/gasClient';
import { closeLineWindow, isLineInClient, sendLineMessages } from '../../lib/liffClient';
import { createReceiptMessage } from './flexReceipt';

interface CheckoutInput {
  lineId?: string;
  cart: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  shippingMethod: 'รับที่ร้าน' | 'จัดส่ง';
}

export function useCheckout() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const confirmOrder = async (input: CheckoutInput) => {
    setIsCheckingOut(true);
    try {
      const order = await submitOrder(input);

      let receiptError: Error | null = null;

      if (isLineInClient()) {
        try {
          await sendLineMessages([
            createReceiptMessage({
              orderId: order.orderId,
              cart: input.cart,
              deliveryMethod: input.shippingMethod,
              cartTotal: input.totalPrice,
            }) as any,
          ]);
        } catch (error) {
          receiptError = error instanceof Error ? error : new Error('Unable to send LINE receipt.');
        }
      }

      return { order, receiptError, shouldCloseLineWindow: isLineInClient() };
    } finally {
      setIsCheckingOut(false);
    }
  };

  return { isCheckingOut, confirmOrder, closeLineWindow };
}
