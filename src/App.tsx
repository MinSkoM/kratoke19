import { useState, useEffect, useRef, useMemo } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import liff from '@line/liff';
import { Product, CartItem, UserProfile, Order } from './types';
import { ShoppingCart, User, History as HistoryIcon, Loader2, Search, Plus, Minus, X } from 'lucide-react';
import { getProductImage } from './utils/productImage';

import Menu from './components/Menu';
import Register from './components/Register';
import History from './components/History';
import CartSummary from './components/CartSummary';

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string;
const GAS_URL = import.meta.env.VITE_GAS_URL as string;

export const getCategoryTheme = (category: string = '') => {
  const themes = [
    { bg: 'bg-blue-50',    border: 'border-blue-200',   icon: 'bg-blue-100 text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    { bg: 'bg-orange-50',  border: 'border-orange-200',  icon: 'bg-orange-100 text-orange-600',  badge: 'bg-orange-100 text-orange-700' },
    { bg: 'bg-purple-50',  border: 'border-purple-200',  icon: 'bg-purple-100 text-purple-600',  badge: 'bg-purple-100 text-purple-700' },
    { bg: 'bg-pink-50',    border: 'border-pink-200',    icon: 'bg-pink-100 text-pink-600',    badge: 'bg-pink-100 text-pink-700' },
    { bg: 'bg-teal-50',    border: 'border-teal-200',    icon: 'bg-teal-100 text-teal-600',    badge: 'bg-teal-100 text-teal-700' },
    { bg: 'bg-red-50',     border: 'border-red-200',     icon: 'bg-red-100 text-red-600',     badge: 'bg-red-100 text-red-700' },
    { bg: 'bg-indigo-50',  border: 'border-indigo-200',  icon: 'bg-indigo-100 text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700' },
    { bg: 'bg-cyan-50',    border: 'border-cyan-200',    icon: 'bg-cyan-100 text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700' },
    { bg: 'bg-rose-50',    border: 'border-rose-200',    icon: 'bg-rose-100 text-rose-600',    badge: 'bg-rose-100 text-rose-700' },
    { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'bg-amber-100 text-amber-600',   badge: 'bg-amber-100 text-amber-700' },
    { bg: 'bg-lime-50',    border: 'border-lime-200',    icon: 'bg-lime-100 text-lime-600',    badge: 'bg-lime-100 text-lime-700' },
    { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'bg-violet-100 text-violet-600',  badge: 'bg-violet-100 text-violet-700' },
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', icon: 'bg-fuchsia-100 text-fuchsia-600', badge: 'bg-fuchsia-100 text-fuchsia-700' },
    { bg: 'bg-sky-50',     border: 'border-sky-200',     icon: 'bg-sky-100 text-sky-600',     badge: 'bg-sky-100 text-sky-700' },
    { bg: 'bg-green-50',   border: 'border-green-200',   icon: 'bg-green-100 text-green-600',   badge: 'bg-green-100 text-green-700' },
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return themes[Math.abs(hash) % themes.length];
};

/* ── Search result cards ──────────────────────────────────────────────── */
const SearchVariantItem: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState(1);
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm mb-3">
        {variant.detail    && <p className="text-gray-500">รายละเอียด: <span className="text-gray-900 font-bold">{variant.detail}</span></p>}
        {variant.size      && <p className="text-gray-500">ขนาด: <span className="text-gray-900 font-bold">{variant.size}</span></p>}
        {variant.thickness && <p className="text-gray-500">หนา: <span className="text-gray-900 font-bold">{variant.thickness}</span></p>}
        {variant.weight    && <p className="text-gray-500">น้ำหนัก: <span className="text-gray-900 font-bold">{variant.weight}</span></p>}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
        <span className="text-2xl font-black text-[#142D95]">{variant.price}฿</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-400 active:text-blue-600"><Minus size={15}/></button>
            <span className="w-8 text-center font-bold text-gray-800 text-base">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-400 active:text-blue-600"><Plus size={15}/></button>
          </div>
          <button onClick={() => { onAdd(variant, qty); setQty(1); }}
            className="bg-[#E3CE54] text-[#142D95] px-4 py-2.5 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform">
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

const SingleSearchCard: FC<{ group: { name: string; category: string; variants: Product[] }; onAdd: (p: Product, q: number) => void }> = ({ group, onAdd }) => {
  const [qty, setQty] = useState(1);
  const v = group.variants[0];
  const theme = getCategoryTheme(group.category);
  return (
    <div className={`bg-white rounded-2xl border ${theme.border} overflow-hidden shadow-sm`}>
      <div className="flex gap-4 p-4 items-start">
        <img src={getProductImage(v)} alt={group.name}
          className="w-20 h-20 object-cover rounded-xl shrink-0 bg-gray-100"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mb-1.5 ${theme.badge}`}>{group.category}</span>
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">{group.name}</h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-sm">
            {v.detail    && <p className="text-gray-500">รายละเอียด: <span className="font-bold text-gray-800">{v.detail}</span></p>}
            {v.size      && <p className="text-gray-500">ขนาด: <span className="font-bold text-gray-800">{v.size}</span></p>}
            {v.thickness && <p className="text-gray-500">หนา: <span className="font-bold text-gray-800">{v.thickness}</span></p>}
            {v.weight    && <p className="text-gray-500">น้ำหนัก: <span className="font-bold text-gray-800">{v.weight}</span></p>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
        <span className="text-2xl font-black text-[#142D95]">{v.price}฿</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-400 active:text-blue-600"><Minus size={15}/></button>
            <span className="w-8 text-center font-bold text-gray-800 text-base">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-400 active:text-blue-600"><Plus size={15}/></button>
          </div>
          <button onClick={() => { onAdd(v, qty); setQty(1); }}
            className="bg-[#E3CE54] text-[#142D95] px-4 py-2.5 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform">
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupedSearchCard: FC<{ group: { name: string; category: string; variants: Product[] }; onAdd: (p: Product, q: number) => void }> = ({ group, onAdd }) => {
  const theme = getCategoryTheme(group.category);
  if (group.variants.length === 1) return <SingleSearchCard group={group} onAdd={onAdd} />;
  return (
    <div className={`bg-white rounded-2xl border ${theme.border} overflow-hidden shadow-sm`}>
      <div className="flex gap-4 p-4 items-center">
        <img src={getProductImage(group.variants[0])} alt={group.name}
          className="w-20 h-20 object-cover rounded-xl shrink-0 bg-gray-100"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div>
          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mb-1.5 ${theme.badge}`}>{group.category}</span>
          <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{group.variants.length} ตัวเลือก</p>
        </div>
      </div>
      <div className={`px-4 pb-4 space-y-3`}>
        {group.variants.map(v => <SearchVariantItem key={v.id} variant={v} onAdd={onAdd} />)}
      </div>
    </div>
  );
};

/* ── Main app ─────────────────────────────────────────────────────────── */
const AppContent: FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const initialized = useRef(false);

  const [userProfile, setUserProfile]   = useState<UserProfile | null>(null);
  const [memberInfo,  setMemberInfo]    = useState<{ name: string; phone: string; address: string } | null>(null);
  const [products,    setProducts]      = useState<Product[]>([]);
  const [orders,      setOrders]        = useState<Order[]>([]);
  const [isLiffReady, setIsLiffReady]   = useState(false);
  const [isLoading,   setIsLoading]     = useState(true);
  const [cart,        setCart]          = useState<CartItem[]>([]);
  const [isRegistered,setIsRegistered]  = useState(false);
  const [showCart,    setShowCart]      = useState(false);
  const [showRegPrompt, setShowRegPrompt] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'รับที่ร้าน' | 'จัดส่ง'>('รับที่ร้าน');
  const [searchTerm,  setSearchTerm]    = useState('');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        // Dev bypass: skip LIFF when running outside LINE
        const isDev = import.meta.env.DEV;
        if (!isDev) await liff.init({ liffId: LIFF_ID });
        if (!isDev && !liff.isLoggedIn()) { liff.login(); return; }
        const isDev2 = import.meta.env.DEV;
        const profile = isDev2
          ? { userId: 'Udev001', displayName: 'คุณสมชาย', pictureUrl: '' }
          : await liff.getProfile();
        setUserProfile({ userId: profile.userId, displayName: profile.displayName, pictureUrl: profile.pictureUrl || '' });
        setIsLiffReady(true);
        try {
          const [mRes, pRes] = await Promise.all([
            fetch(`${GAS_URL}?action=checkMember&lineId=${profile.userId}`),
            fetch(`${GAS_URL}?action=getProducts`),
          ]);
          const mData = await mRes.json();
          const pData = await pRes.json();
          if (mData.isMember) { setIsRegistered(true); setMemberInfo(mData.data); }
          if (pData.status === 'success') setProducts(pData.data.filter((p: Product) => p.price));
        } catch (e) { console.error('GAS:', e); }
      } catch (e) { console.error('LIFF:', e); setIsLiffReady(true); }
      finally { setIsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (location.pathname !== '/history' || !userProfile?.userId) return;
    (async () => {
      setIsLoading(true);
      try {
        const res  = await fetch(`${GAS_URL}?action=getHistory&lineId=${userProfile.userId}`);
        const data = await res.json();
        if (data.status === 'success') setOrders(data.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [location.pathname, userProfile?.userId]);

  const handleRegister = async (name: string, phone: string, address: string) => {
    setIsLoading(true);
    try {
      const res  = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'register', payload: { lineId: userProfile?.userId, name, phone, address } }) });
      const data = await res.json();
      if (data.status === 'success') { setIsRegistered(true); setMemberInfo({ name, phone, address }); alert('บันทึกข้อมูลเรียบร้อย'); navigate('/menu'); }
    } catch { alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล'); }
    finally { setIsLoading(false); }
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (!isRegistered) { setShowRegPrompt(true); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
                : [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));

  const totalQty  = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = () => {
    if (!isRegistered) { alert('กรุณาลงทะเบียนก่อนสั่งซื้อ'); setShowCart(false); navigate('/register'); }
    else handleConfirmOrder();
  };

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitOrder', payload: { lineId: userProfile?.userId, cart, totalQuantity: totalQty, totalPrice: cartTotal, shippingMethod: deliveryMethod } }),
      });
      const data = JSON.parse(await res.text());
      if (data.status === 'success') {
        const inClient = liff.isInClient();
        if (!inClient) alert('DEBUG: isInClient = false — ข้อความจะไม่ถูกส่ง');
        if (inClient) {
          try {
            await liff.sendMessages([{
              type: 'flex', altText: `บิลสั่งซื้อ ${data.orderId}`,
              contents: {
                type: 'bubble',
                body: {
                  type: 'box', layout: 'vertical',
                  contents: [
                    { type: 'text', text: 'RECEIPT', weight: 'bold', color: '#1DB446', size: 'sm' },
                    { type: 'text', text: 'รายการสั่งซื้อ', weight: 'bold', size: 'xl', margin: 'md' },
                    { type: 'text', text: `รหัส: ${data.orderId}`, size: 'xs', color: '#aaaaaa', wrap: true },
                    { type: 'separator', margin: 'xxl' },
                    { type: 'box', layout: 'vertical', margin: 'xxl', spacing: 'sm', contents: cart.map(item => ({
                      type: 'box', layout: 'horizontal',
                      contents: [
                        { type: 'text', text: `${item.name}${[item.detail, item.size, item.thickness].filter(Boolean).map(s=>`[${s}]`).join('')} x${item.quantity}`, size: 'sm', color: '#555555', flex: 1, wrap: true },
                        { type: 'text', text: `฿${item.price * item.quantity}`, size: 'sm', color: '#111111', align: 'end', flex: 0 },
                      ],
                    }))},
                    { type: 'separator', margin: 'xxl' },
                    { type: 'box', layout: 'horizontal', margin: 'md', contents: [
                      { type: 'text', text: 'ยอดรวมทั้งสิ้น', size: 'sm', color: '#555555' },
                      { type: 'text', text: `฿${cartTotal}`, size: 'lg', color: '#ff0000', align: 'end', weight: 'bold' },
                    ]},
                  ],
                },
              },
            } as any]);
          } catch (e: any) { alert(`⚠️ ออเดอร์เข้าแล้ว แต่ส่งข้อความไม่ได้: ${e.message}`); }
        }
        alert('ส่งคำสั่งซื้อเรียบร้อย!');
        setCart([]); setShowCart(false); setSearchTerm('');
        if (liff.isInClient()) liff.closeWindow(); else navigate('/history');
      } else throw new Error(data.error || 'error');
    } catch (e: any) { alert(`ไม่สามารถส่งคำสั่งซื้อได้: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  const isActive = (p: string) => location.pathname === p;

  const filteredProducts = useMemo(() =>
    products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]);

  const groupedSearch = useMemo(() => {
    const map: Record<string, { name: string; category: string; variants: Product[] }> = {};
    filteredProducts.forEach(p => {
      const key = `${p.category}|${p.name}`;
      if (!map[key]) map[key] = { name: p.name, category: p.category, variants: [] };
      map[key].variants.push(p);
    });
    return Object.values(map);
  }, [filteredProducts]);

  return (
    <div className="font-sans bg-[#F5F7FF] min-h-screen pb-24 overflow-x-hidden">

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 z-[60] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#6A9DF7]/30 border-t-[#142D95] rounded-full animate-spin"/>
            <p className="text-base font-semibold text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      )}

      {/* Register prompt modal */}
      {showRegPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-5" onClick={() => setShowRegPrompt(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">กรุณาลงทะเบียนก่อนสั่งซื้อ</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">กรุณากรอกข้อมูลในหน้า "ข้อมูลฉัน" ก่อนเพิ่มสินค้าลงตะกร้าครับ</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRegPrompt(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl text-base">ปิด</button>
              <button onClick={() => { setShowRegPrompt(false); navigate('/register'); }}
                className="flex-[2] py-4 bg-[#142D95] text-white font-black rounded-2xl text-base shadow-sm active:scale-95 transition-transform">ลงทะเบียน</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#142D95] sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center px-4 py-3 gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            {userProfile?.pictureUrl
              ? <img src={userProfile.pictureUrl} alt="avatar" className="w-9 h-9 rounded-full ring-2 ring-[#FCEF74]/60"/>
              : <div className="w-9 h-9 rounded-full bg-[#6A9DF7]/30 flex items-center justify-center"><User size={18} className="text-[#FCEF74]"/></div>}
            {isRegistered && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#142D95]"/>}
          </div>

          {/* User name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{userProfile?.displayName || 'กำลังโหลด...'}</p>
            <p className={`text-xs font-medium leading-tight ${isRegistered ? 'text-green-400' : 'text-[#FCEF74]'}`}>
              {isRegistered ? 'สมาชิกยืนยันแล้ว' : 'ยังไม่ได้ลงทะเบียน'}
            </p>
          </div>

          {/* Brand */}
          <span className="text-sm font-black text-[#FCEF74] tracking-widest">KRATOKE</span>

          {/* Cart */}
          <button onClick={() => setShowCart(true)}
            className="relative w-10 h-10 bg-[#FCEF74] rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0">
            <ShoppingCart size={20} className="text-[#142D95]"/>
            {totalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#142D95] text-[#FCEF74] text-[11px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
                {totalQty}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 pt-4 min-h-[70vh]">

        {/* Search bar (menu only) */}
        {isLiffReady && isActive('/menu') && (
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input
              type="text"
              placeholder="ค้นหาสินค้า หรือ รหัส..."
              className="w-full pl-11 pr-11 py-3.5 text-base bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A9DF7] focus:border-transparent placeholder:text-gray-300 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <X size={14} className="text-gray-500"/>
              </button>
            )}
          </div>
        )}

        {isLiffReady && (
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace/>}/>
            <Route path="/menu" element={
              searchTerm ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-sm font-semibold text-gray-500">พบ <strong className="text-gray-900">{filteredProducts.length}</strong> รายการ</p>
                    <p className="text-xs text-gray-400">{groupedSearch.length} กลุ่ม</p>
                  </div>
                  {groupedSearch.length > 0
                    ? groupedSearch.map((g, i) => <GroupedSearchCard key={i} group={g} onAdd={addToCart}/>)
                    : <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Search size={40} className="mx-auto text-gray-300 mb-3"/>
                        <p className="text-gray-400 text-lg">ไม่พบสินค้าที่ค้นหา</p>
                      </div>}
                </div>
              ) : (
                <Menu products={products} isLoading={isLoading} addToCart={addToCart}/>
              )
            }/>
            <Route path="/register" element={<Register onRegister={handleRegister} isRegistered={isRegistered} initialData={memberInfo}/>}/>
            <Route path="/history"  element={<History  orders={orders} isLoading={isLoading}/>}/>
          </Routes>
        )}
      </main>

      {/* Cart sheet */}
      {showCart && (
        <CartSummary cart={cart} cartTotal={cartTotal} deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod} setShowCart={setShowCart}
          isRegistered={isRegistered} handleCheckout={handleCheckout}
          userAddress={memberInfo?.address} updateQuantity={updateQuantity}/>
      )}

      {/* Bottom nav */}
      {isLiffReady && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
          <div className="max-w-md mx-auto px-4 pb-3">
            <nav className="bg-[#142D95] rounded-3xl shadow-lg flex items-center px-2 py-2">
              {[
                { to: '/menu',     icon: ShoppingCart, label: 'สั่งสินค้า',  onClick: () => setSearchTerm('') },
                { to: '/history',  icon: HistoryIcon,  label: 'ประวัติ',     onClick: undefined },
                { to: '/register', icon: User,         label: 'ข้อมูลฉัน',  onClick: undefined },
              ].map(({ to, icon: Icon, label, onClick }) => (
                <Link key={to} to={to} onClick={onClick}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-2xl gap-1 transition-all ${
                    isActive(to)
                      ? 'bg-[#FCEF74] text-[#142D95] shadow-sm'
                      : 'text-[#6A9DF7] hover:text-white'
                  }`}>
                  <Icon size={22}/>
                  <span className="text-xs font-bold">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

const App: FC = () => <Router><AppContent/></Router>;
export default App;
