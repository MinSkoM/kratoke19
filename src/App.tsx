import { useState, useEffect, useRef, useMemo } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import liff from '@line/liff';
import { Product, CartItem, UserProfile, Order } from './types';
import { ShoppingCart, User, History as HistoryIcon, Search, X } from 'lucide-react';
import { fmt } from './utils/fmt';

import Menu, { ProductCard } from './components/Menu';
import Register from './components/Register';
import History from './components/History';
import CartSummary from './components/CartSummary';

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string;
const GAS_URL = import.meta.env.VITE_GAS_URL as string;



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
  const [expandedSearchName, setExpandedSearchName] = useState<string | null>(null);

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

  const handleAddressUpdate = async (newAddress: string) => {
    if (!memberInfo || !userProfile) return;
    const updated = { ...memberInfo, address: newAddress };
    setMemberInfo(updated);
    try {
      await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'register', payload: { lineId: userProfile.userId, ...updated } }) });
    } catch { /* non-critical */ }
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
        if (liff.isInClient()) {
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
                        { type: 'text', wrap: true, flex: 4, size: 'sm', color: '#555555',
                          text: [item.name, item.detail, item.size && `ขนาด: ${item.size}`, item.thickness && `หนา: ${item.thickness}`].filter(Boolean).join(' '),
                        },
                        { type: 'text', text: `x${item.quantity}`, size: 'sm', color: '#333333', align: 'center', flex: 1 },
                        { type: 'text', text: fmt(item.price * item.quantity), size: 'sm', color: '#111111', align: 'end', flex: 2 },
                      ],
                    }))},
                    { type: 'separator', margin: 'xxl' },
                    { type: 'box', layout: 'horizontal', margin: 'md', contents: [
                      { type: 'text', text: 'วิธีรับสินค้า', size: 'sm', color: '#555555' },
                      { type: 'text', text: deliveryMethod, size: 'sm', color: '#111111', align: 'end', weight: 'bold' },
                    ]},
                    { type: 'box', layout: 'horizontal', margin: 'sm', contents: [
                      { type: 'text', text: 'ยอดรวมทั้งสิ้น', size: 'sm', color: '#555555' },
                      { type: 'text', text: fmt(cartTotal), size: 'lg', color: '#ff0000', align: 'end', weight: 'bold' },
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
                    ? groupedSearch.map(g => (
                        <ProductCard key={g.name} name={g.name} variants={g.variants}
                          isExpanded={expandedSearchName === g.name}
                          onToggle={() => setExpandedSearchName(prev => prev === g.name ? null : g.name)}
                          onAdd={(p, q) => { addToCart(p, q); setExpandedSearchName(null); }}/>
                      ))
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
          userAddress={memberInfo?.address} updateQuantity={updateQuantity}
          onAddressUpdate={handleAddressUpdate}/>
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
