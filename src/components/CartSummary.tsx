import { useState, useEffect } from 'react';
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
  cart, cartTotal, deliveryMethod, setDeliveryMethod, setShowCart,
  isRegistered, handleCheckout, userAddress, updateQuantity
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={() => setShowCart(false)}>
      <div className="bg-white rounded-t-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">ตะกร้าสินค้า</h2>
          <button onClick={() => setShowCart(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto px-5 py-3">
          {cart.map(item => (
            <CartItemRow key={item.id} item={item} updateQuantity={updateQuantity} />
          ))}
          {cart.length === 0 && (
            <p className="text-center text-gray-400 text-lg py-6">ตะกร้าของคุณว่างอยู่</p>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 pb-2">
            <div className="border-t border-gray-100 pt-4 mb-3">
              <h3 className="font-bold text-base text-gray-700 mb-2">วิธีรับสินค้า</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryMethod('รับที่ร้าน')}
                  className={`py-3 text-base font-bold rounded-xl border-2 transition-all ${deliveryMethod === 'รับที่ร้าน' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}
                >
                  รับที่ร้าน
                </button>
                <button
                  onClick={() => setDeliveryMethod('จัดส่ง')}
                  className={`py-3 text-base font-bold rounded-xl border-2 transition-all ${deliveryMethod === 'จัดส่ง' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}
                >
                  จัดส่ง
                </button>
              </div>
            </div>

            {deliveryMethod === 'จัดส่ง' && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-3 flex items-start gap-2">
                <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-800 mb-1">จัดส่งไปที่:</p>
                  <p className="text-base text-gray-700 leading-snug">
                    {userAddress ?? <span className="text-red-500 font-semibold">ยังไม่มีที่อยู่ กรุณาอัปเดตในหน้าข้อมูลฉัน</span>}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="text-lg font-bold text-gray-700">ยอดสุทธิ</span>
              <span className="text-2xl font-black text-blue-600">{cartTotal} บาท</span>
            </div>
          </div>
        )}

        <div className="px-5 pb-6">
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || (deliveryMethod === 'จัดส่ง' && !userAddress)}
            className="w-full bg-green-500 text-white py-4 rounded-2xl text-lg font-bold hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md active:scale-95"
          >
            {isRegistered ? 'ส่งคำสั่งซื้อ' : 'ลงทะเบียนก่อนสั่งซื้อ'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CartItemRow: FC<{ item: CartItem; updateQuantity: (id: string, delta: number) => void }> = ({ item, updateQuantity }) => {
  const [inputValue, setInputValue] = useState<number | string>(item.quantity);

  useEffect(() => {
    setInputValue(item.quantity);
  }, [item.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setInputValue('');
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        setInputValue(num);
        updateQuantity(item.id, num - item.quantity);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue === '' || Number(inputValue) < 1) {
      setInputValue(1);
      if (item.quantity !== 1) updateQuantity(item.id, 1 - item.quantity);
    }
  };

  const specParts = [item.size, item.thickness].filter(Boolean);

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-3">
        <p className="font-semibold text-base text-gray-800 leading-tight">
          {item.name}
          {specParts.length > 0 && (
            <span className="text-blue-500 font-normal ml-1 text-sm">[{specParts.join(', ')}]</span>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{item.price} บาท/ชิ้น</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className="font-bold text-base text-blue-600">{item.price * item.quantity} ฿</p>
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
          <button
            onClick={() => updateQuantity(item.id, -1)}
            className="px-3 py-2 text-gray-500 hover:bg-gray-200 active:text-red-500 transition-colors"
          >
            {item.quantity === 1 ? <Trash2 size={16} className="text-red-400" /> : <Minus size={16} />}
          </button>
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-10 text-center text-base font-bold text-gray-700 bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ MozAppearance: 'textfield' }}
          />
          <button
            onClick={() => updateQuantity(item.id, 1)}
            className="px-3 py-2 text-gray-500 hover:bg-gray-200 active:text-blue-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
