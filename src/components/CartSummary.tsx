import { useState, useEffect } from 'react'; // 🟢 เพิ่ม import useState, useEffect
import type { FC } from 'react';
import { CartItem } from '../types';
import { X, MapPin, Plus, Minus, Trash2 } from 'lucide-react';

interface CartSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  deliveryMethod: 'รับที่ร้าน' | 'จัดส่ง';
  setDeliveryMethod: (method: 'รับที่ร้าน' | 'จัดส่ง') => void;
  setShowCart: (show: boolean) => void;
  isRegistered: boolean;
  handleCheckout: () => void;
  userAddress?: string;
  updateQuantity: (id: string, delta: number) => void;
}

const CartSummary: FC<CartSummaryProps> = ({
  cart, cartTotal, deliveryMethod, setDeliveryMethod, setShowCart, isRegistered, handleCheckout, userAddress, updateQuantity
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={() => setShowCart(false)}>
      <div className="bg-white rounded-t-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">ตะกร้าสินค้า</h2>
          <button onClick={() => setShowCart(false)} className="p-1"><X size={24} /></button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto pb-2 pr-1">
          {/* 🟢 เรียกใช้ Component ย่อยที่สร้างไว้ด้านล่าง */}
          {cart.map(item => (
            <CartItemRow key={item.id} item={item} updateQuantity={updateQuantity} />
          ))}
          {cart.length === 0 && <p className="text-center text-gray-500 py-4">ตะกร้าของคุณว่างอยู่</p>}
        </div>
        
        {cart.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2 text-sm">การจัดส่ง</h3>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setDeliveryMethod('รับที่ร้าน')} className={`flex-1 p-2 text-sm rounded-lg border ${deliveryMethod === 'รับที่ร้าน' ? 'bg-blue-500 text-white border-blue-500 font-bold' : 'text-gray-600'}`}>รับที่ร้าน</button>
              <button onClick={() => setDeliveryMethod('จัดส่ง')} className={`flex-1 p-2 text-sm rounded-lg border ${deliveryMethod === 'จัดส่ง' ? 'bg-blue-500 text-white border-blue-500 font-bold' : 'text-gray-600'}`}>จัดส่ง</button>
            </div>

            {deliveryMethod === 'จัดส่ง' && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex items-start gap-2">
                <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-800 mb-0.5">จัดส่งไปที่:</p>
                  <p className="text-sm text-gray-700 leading-snug">
                    {userAddress ? userAddress : <span className="text-red-500 font-semibold">ยังไม่มีข้อมูลที่อยู่ กรุณาอัปเดตในหน้าข้อมูลฉัน</span>}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold mt-2">
              <span>ยอดสุทธิ</span>
              <span className="text-blue-600">{cartTotal} บาท</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleCheckout} 
          disabled={cart.length === 0 || (deliveryMethod === 'จัดส่ง' && !userAddress)} 
          className="w-full bg-green-500 text-white p-3 mt-6 rounded-xl font-bold hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-sm active:scale-95"
        >
          {isRegistered ? 'ส่งคำสั่งซื้อให้ร้านเช็คสต็อก' : 'ไปหน้าสมัครสมาชิกก่อน'}
        </button>
      </div>
    </div>
  );
};

// --- 🟢 Component ย่อย: สำหรับจัดการช่องพิมพ์จำนวนของแต่ละรายการ ---
const CartItemRow: FC<{ item: CartItem; updateQuantity: (id: string, delta: number) => void }> = ({ item, updateQuantity }) => {
  const [inputValue, setInputValue] = useState<number | string>(item.quantity);

  // อัปเดตช่องพิมพ์อัตโนมัติ หากมีการกดปุ่ม + / - 
  useEffect(() => {
    setInputValue(item.quantity);
  }, [item.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setInputValue(''); // ปล่อยให้ว่างได้ตอนกำลังลบเพื่อพิมพ์ใหม่
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setInputValue(num);
        // คำนวณส่วนต่างเพื่อส่งให้ฟังก์ชัน updateQuantity ของเดิม
        if (num > 0) {
          updateQuantity(item.id, num - item.quantity);
        }
      }
    }
  };

  const handleBlur = () => {
    // ถ้าปล่อยช่องว่างไว้ หรือพิมพ์เลขน้อยกว่า 1 ให้เด้งกลับเป็น 1
    if (inputValue === '' || Number(inputValue) < 1) {
      setInputValue(1);
      if (item.quantity !== 1) {
        updateQuantity(item.id, 1 - item.quantity);
      }
    }
  };

  return (
    <div className="flex justify-between items-center border-b pb-3">
      <div className="w-3/5 pr-2">
        <p className="font-semibold text-sm truncate">
          {item.name} 
          {(item.size || (item as any).thickness) && (
            <span className="text-blue-600 font-normal ml-1">
              [{[item.size, (item as any).thickness].filter(Boolean).join(', ')}]
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500">{item.price} บาท/ชิ้น</p>
      </div>
      
      <div className="flex flex-col items-end gap-2 w-2/5">
        <p className="font-bold text-sm text-blue-600">{item.price * item.quantity} ฿</p>
        
        {/* 🟢 เปลี่ยนเป็น Input พิมพ์ได้ และลดขนาดกล่องให้กะทัดรัด */}
        <div className="flex items-center border rounded-lg bg-gray-50 shadow-sm overflow-hidden">
          <button 
            onClick={() => updateQuantity(item.id, -1)} 
            className="px-2 py-1.5 text-gray-500 hover:bg-gray-200 active:text-red-500 transition-colors"
          >
            {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
          </button>
          
          <input 
            type="number"
            min="1"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-8 p-0 m-0 text-center text-xs font-bold text-gray-700 bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ MozAppearance: 'textfield' }}
          />
          
          <button 
            onClick={() => updateQuantity(item.id, 1)} 
            className="px-2 py-1.5 text-gray-500 hover:bg-gray-200 active:text-blue-600 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;