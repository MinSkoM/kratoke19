import type { FC } from 'react';
import { Order } from '../types';
import { Package, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { fmt } from '../utils/fmt';

interface HistoryProps { orders: Order[]; isLoading: boolean; }

const STATUS: Record<string, { label: string; cls: string; icon: FC<{ size?: number }> }> = {
  'รอคอนเฟิร์ม':      { label: 'รอคอนเฟิร์ม',      cls: 'bg-amber-100 text-amber-700',   icon: AlertCircle },
  'ชำระเงินแล้ว':      { label: 'ชำระเงินแล้ว',      cls: 'bg-blue-100 text-blue-700',     icon: Truck },
  'รับสินค้าเรียบร้อย': { label: 'รับสินค้าเรียบร้อย', cls: 'bg-green-100 text-green-700',   icon: CheckCircle },
};

const History: FC<HistoryProps> = ({ orders, isLoading }) => (
  <div className="space-y-4 pb-28">
    <h2 className="text-2xl font-black text-gray-900">ประวัติการสั่งซื้อ</h2>

    {orders.map(order => {
      const s = STATUS[order.status] ?? { label: order.status, cls: 'bg-gray-100 text-gray-700', icon: Package };
      const StatusIcon = s.icon;
      return (
        <div key={order.orderId} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Order header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-blue-500"/>
              <span className="font-black text-gray-900 text-base">{order.orderId}</span>
            </div>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${s.cls}`}>
              <StatusIcon size={13}/> {s.label}
            </span>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
              <Clock size={14}/>
              <span>{new Date(order.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {Array.isArray(order.items)
                ? order.items.map((item: any) => {
                    const specs = [item.detail, item.size && `ขนาด: ${item.size}`, item.thickness && `หนา: ${item.thickness}`].filter(Boolean).join(' ');
                    return (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800">{item.name}</p>
                          {specs && <p className="text-xs text-gray-400 mt-0.5">{specs}</p>}
                        </div>
                        <span className="text-gray-500 whitespace-nowrap shrink-0 w-8 text-center">x{item.quantity}</span>
                        <span className="font-bold text-orange-500 whitespace-nowrap shrink-0 text-right w-24">{fmt(item.price * item.quantity)}</span>
                      </div>
                    );
                  })
                : <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{order.items as any}</p>
              }
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t border-dashed border-gray-200 mt-4 pt-3">
              <span className="text-sm text-gray-500 font-medium">ยอดรวม ({order.shippingMethod})</span>
              <span className="text-2xl font-black text-orange-500">{fmt(order.total)}</span>
            </div>
          </div>
        </div>
      );
    })}

    {orders.length === 0 && !isLoading && (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Package size={52} className="mx-auto mb-4 text-gray-200"/>
        <p className="text-lg font-bold text-gray-400">ยังไม่มีประวัติการสั่งซื้อ</p>
        <p className="text-sm text-gray-300 mt-1">รายการสั่งซื้อจะแสดงที่นี่</p>
      </div>
    )}
  </div>
);

export default History;
