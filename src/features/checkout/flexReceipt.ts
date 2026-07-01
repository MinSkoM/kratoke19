import type { CartItem } from '../../types';
import { fmt } from '../../utils/fmt';

interface ReceiptInput {
  orderId: string;
  cart: CartItem[];
  deliveryMethod: 'รับที่ร้าน' | 'จัดส่ง';
  cartTotal: number;
}

export function createReceiptMessage({ orderId, cart, deliveryMethod, cartTotal }: ReceiptInput) {
  return {
    type: 'flex',
    altText: `บิลสั่งซื้อ ${orderId}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'RECEIPT', weight: 'bold', color: '#1F2937', size: 'sm' },
          { type: 'text', text: 'รายการสั่งซื้อ', weight: 'bold', size: 'xl', margin: 'md' },
          { type: 'text', text: `รหัส: ${orderId}`, size: 'xs', color: '#64748B', wrap: true },
          { type: 'separator', margin: 'xxl' },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'xxl',
            spacing: 'sm',
            contents: cart.map(item => {
              const specs = [
                item.detail,
                item.size && `ขนาด: ${item.size}`,
                item.thickness && `หนา: ${item.thickness}`,
              ].filter(Boolean).join(' ');

              return {
                type: 'box',
                layout: 'horizontal',
                alignItems: 'flex-start',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    flex: 4,
                    contents: [
                      { type: 'text', text: item.name, size: 'sm', color: '#1F2937', wrap: true, weight: 'bold' },
                      ...(specs ? [{ type: 'text', text: specs, size: 'xs', color: '#64748B', wrap: true }] : []),
                    ],
                  },
                  { type: 'text', text: `x${item.quantity}`, size: 'sm', color: '#64748B', align: 'center', flex: 1 },
                  { type: 'text', text: fmt(item.price * item.quantity), size: 'sm', color: '#1F2937', align: 'end', flex: 2 },
                ],
              };
            }),
          },
          { type: 'separator', margin: 'xxl' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: 'วิธีรับสินค้า', size: 'sm', color: '#64748B' },
              { type: 'text', text: deliveryMethod, size: 'sm', color: '#1F2937', align: 'end', weight: 'bold' },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              { type: 'text', text: 'ยอดรวมทั้งสิ้น', size: 'sm', color: '#64748B' },
              { type: 'text', text: fmt(cartTotal), size: 'lg', color: '#C2410C', align: 'end', weight: 'bold' },
            ],
          },
        ],
      },
    },
  } as const;
}
