import type { FC } from 'react';
import { Order } from '../types'; // (ถ้า Order ใน types.ts กำหนด items เป็น string อยู่แล้วก็ไม่เป็นไรครับ)

interface HistoryProps {
  orders: Order[];
  isLoading: boolean;
}

const History: FC<HistoryProps> = ({ orders, isLoading }) => {
  return (
    <div className="p-4 space-y-4 pb-20">
      <h2 className="text-xl font-bold">ประวัติการสั่งซื้อ</h2>
      
      {orders.map(order => (
        <div key={order.orderId} className="border bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-sm">รหัส: {order.orderId}</p>
            <p className={`px-2 py-1 text-xs rounded-full ${
              order.status === 'รอคอนเฟิร์ม' ? 'bg-yellow-100 text-yellow-800' : 
              order.status === 'สำเร็จ' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {order.status}
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-2">วันที่: {new Date(order.date).toLocaleDateString('th-TH')}</p>
          
          {/* 🟢 ส่วนที่แก้ไข: เช็กชนิดข้อมูลก่อนโชว์ ป้องกันหน้าขาว */}
          <div className="border-t pt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {Array.isArray(order.items) ? (
              <ul className="space-y-1">
                {order.items.map((item: any) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="truncate w-3/4">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                    <span>{item.price * item.quantity} ฿</span>
                  </li>
                ))}
              </ul>
            ) : (
              // ถ้าข้อมูลมาจาก GAS เป็น String (ข้อความยาวๆ) จะแสดงตรงนี้ โดยจะขึ้นบรรทัดใหม่ตาม \n อัตโนมัติ
              <p>{order.items}</p>
            )}
          </div>
          
          <div className="border-t mt-2 pt-2 flex justify-between font-bold text-sm">
            <span>ยอดรวม ({order.shippingMethod})</span>
            <span className="text-blue-600">{order.total} บาท</span>
          </div>
        </div>
      ))}

      {orders.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 mt-10">ยังไม่มีประวัติการสั่งซื้อ</p>
      )}
    </div>
  );
};

export default History;