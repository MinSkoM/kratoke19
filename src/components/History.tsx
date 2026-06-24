import type { FC } from 'react';
import { Order } from '../types';
import { Package, Clock } from 'lucide-react';

interface HistoryProps {
  orders: Order[];
  isLoading: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  'รอคอนเฟิร์ม': 'bg-yellow-100 text-yellow-800',
  'ชำระเงินแล้ว': 'bg-blue-100 text-blue-800',
  'รับสินค้าเรียบร้อย': 'bg-green-100 text-green-800',
};

const History: FC<HistoryProps> = ({ orders, isLoading }) => {
  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-800">ประวัติการสั่งซื้อ</h2>

      {orders.map(order => (
        <div key={order.orderId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-blue-500" />
              <span className="font-bold text-base text-gray-800">{order.orderId}</span>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <Clock size={14} />
              <span>วันที่: {new Date(order.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              {Array.isArray(order.items) ? (
                order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-base">
                    <span className="text-gray-700 flex-1 pr-2">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                    <span className="font-bold text-blue-600 whitespace-nowrap">{item.price * item.quantity} ฿</span>
                  </div>
                ))
              ) : (
                <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{order.items as any}</p>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 mt-3 pt-3">
              <span className="text-base text-gray-600">ยอดรวม ({order.shippingMethod})</span>
              <span className="text-xl font-black text-blue-600">{order.total} บาท</span>
            </div>
          </div>
        </div>
      ))}

      {orders.length === 0 && !isLoading && (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg">ยังไม่มีประวัติการสั่งซื้อ</p>
        </div>
      )}
    </div>
  );
};

export default History;
