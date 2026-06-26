import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { CartItem } from '../types';
import { X, MapPin, Plus, Minus, Trash2, ShoppingBag, Edit3, Check } from 'lucide-react';
import { fmt } from '../utils/fmt';

interface CartSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  deliveryMethod: 'รับที่ร้าน' | 'จัดส่ง';
  setDeliveryMethod: (m: 'รับที่ร้าน' | 'จัดส่ง') => void;
  setShowCart: (v: boolean) => void;
  isRegistered: boolean;
  handleCheckout: () => void;
  userAddress?: string;
  updateQuantity: (id: string, delta: number) => void;
  onAddressUpdate?: (addr: string) => void;
}

const CartSummary: FC<CartSummaryProps> = ({
  cart, cartTotal, deliveryMethod, setDeliveryMethod,
  setShowCart, isRegistered, handleCheckout, userAddress, updateQuantity, onAddressUpdate,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [localAddress, setLocalAddress] = useState(userAddress ?? '');

  useEffect(() => { setLocalAddress(userAddress ?? ''); }, [userAddress]);

  const canCheckout = cart.length > 0 && !(deliveryMethod === 'จัดส่ง' && !localAddress);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center backdrop-blur-sm"
      onClick={() => setShowCart(false)}>
      <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full"/>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#142D95]"/>
            <h2 className="text-lg font-black text-gray-900">ตะกร้าสินค้า</h2>
          </div>
          <button onClick={() => setShowCart(false)}
            className="p-2 rounded-full bg-gray-100 text-gray-500 active:bg-gray-200 transition-colors">
            <X size={18}/>
          </button>
        </div>

        {/* Items list */}
        <div className="max-h-56 overflow-y-auto px-5 py-3 space-y-1">
          {cart.map(item => <CartItemRow key={item.id} item={item} updateQuantity={updateQuantity}/>)}
          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag size={36} className="mx-auto mb-2 opacity-30"/>
              <p className="text-base">ตะกร้าของคุณว่างอยู่</p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 pb-5">
            {/* Delivery toggle */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm font-bold text-gray-600 mb-2">วิธีรับสินค้า</p>
              <div className="grid grid-cols-2 gap-2">
                {(['รับที่ร้าน', 'จัดส่ง'] as const).map(m => (
                  <button key={m} onClick={() => { setDeliveryMethod(m); setIsEditingAddress(false); }}
                    className={`py-3 rounded-2xl text-base font-bold border-2 transition-all ${
                      deliveryMethod === m
                        ? 'bg-[#142D95] text-white border-[#142D95] shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Address confirm/edit when จัดส่ง */}
            {deliveryMethod === 'จัดส่ง' && (
              <div className="bg-[#F0F4FF] border border-[#6A9DF7]/40 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-black text-[#142D95]">ยืนยันที่อยู่จัดส่ง</p>
                  {!isEditingAddress && localAddress && (
                    <button onClick={() => setIsEditingAddress(true)}
                      className="flex items-center gap-1 text-xs text-[#6A9DF7] font-bold">
                      <Edit3 size={12}/> แก้ไข
                    </button>
                  )}
                </div>
                {!localAddress ? (
                  <p className="text-sm text-red-500 font-semibold">ยังไม่มีที่อยู่ กรุณาอัปเดตในหน้าข้อมูลฉัน</p>
                ) : isEditingAddress ? (
                  <div>
                    <textarea value={localAddress} onChange={e => setLocalAddress(e.target.value)}
                      className="w-full text-sm text-gray-700 bg-white border-2 border-[#6A9DF7] rounded-xl p-3 resize-none focus:outline-none"
                      rows={3}/>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { setIsEditingAddress(false); setLocalAddress(userAddress ?? ''); }}
                        className="flex-1 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl">
                        ยกเลิก
                      </button>
                      <button onClick={() => { setIsEditingAddress(false); onAddressUpdate?.(localAddress); }}
                        className="flex-[2] flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-white bg-[#142D95] rounded-xl">
                        <Check size={14}/> บันทึก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-[#6A9DF7] mt-0.5 shrink-0"/>
                    <p className="text-sm text-gray-700 leading-snug">{localAddress}</p>
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-gray-600">ยอดสุทธิ</span>
              <span className="text-3xl font-black text-orange-500">{fmt(cartTotal)}</span>
            </div>

            {/* Checkout button */}
            <button onClick={handleCheckout} disabled={!canCheckout}
              className="w-full py-4 rounded-2xl text-lg font-black shadow-md transition-all active:scale-95
                bg-green-500 text-white hover:bg-green-600
                disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:scale-100">
              {isRegistered ? '✓ ส่งคำสั่งซื้อ' : 'ลงทะเบียนก่อนสั่งซื้อ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Cart item row ─────────────────────────────────────────────────────── */
const CartItemRow: FC<{ item: CartItem; updateQuantity: (id: string, delta: number) => void }> = ({ item, updateQuantity }) => {
  const [input, setInput] = useState<number | string>(item.quantity);

  useEffect(() => { setInput(item.quantity); }, [item.quantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '') { setInput(''); return; }
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0) { setInput(n); updateQuantity(item.id, n - item.quantity); }
  };

  const handleBlur = () => {
    if (!input || Number(input) < 1) { setInput(1); if (item.quantity !== 1) updateQuantity(item.id, 1 - item.quantity); }
  };

  const specs = [
    item.detail && item.detail,
    item.size && `ขนาด ${item.size}`,
    item.thickness && `หนา ${item.thickness}`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
        {specs.length > 0 && <p className="text-xs text-[#6A9DF7] font-medium mt-0.5">{specs.join(' · ')}</p>}
        <p className="text-xs text-gray-400 mt-0.5">{fmt(item.price)}/ชิ้น</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="text-sm font-black text-orange-500">{fmt(item.price * item.quantity)}</p>
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
          <button onClick={() => updateQuantity(item.id, -1)}
            className="px-2.5 py-1.5 text-gray-400 active:text-red-500 transition-colors">
            {item.quantity === 1 ? <Trash2 size={14} className="text-red-400"/> : <Minus size={14}/>}
          </button>
          <input type="number" min="1" value={input} onChange={handleChange} onBlur={handleBlur}
            className="w-8 text-center text-sm font-bold text-gray-800 bg-transparent focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ MozAppearance: 'textfield' }}/>
          <button onClick={() => updateQuantity(item.id, 1)}
            className="px-2.5 py-1.5 text-gray-400 active:text-[#142D95] transition-colors">
            <Plus size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
