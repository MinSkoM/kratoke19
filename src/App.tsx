import { useState, useEffect, useRef, useMemo } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import liff from '@line/liff';
import type { Liff } from '@line/liff';
import { Product, CartItem, UserProfile, Order } from './types';
import { ShoppingCart, User, History as HistoryIcon, Loader2, Search, Plus, Minus, AlertCircle } from 'lucide-react';

import Menu from './components/Menu';
import Register from './components/Register';
import History from './components/History';
import CartSummary from './components/CartSummary';

const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2009263888-F1O3wTGT';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyEF1msRoS-tMlV0zJJCIPsJi2onO44afnxF_lZvvlvM-nk8B2HgiT-7a4_ng0rdSvN/exec'; 

// 🟢 ฟังก์ชันสำหรับสุ่มสีอัตโนมัติตามชื่อหมวดหมู่
const getCategoryColor = (category: string = 'ทั่วไป') => {
  const themes = [
    { card: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { card: 'border-l-green-500', badge: 'bg-green-50 text-green-700 border-green-200' },
    { card: 'border-l-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    { card: 'border-l-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { card: 'border-l-pink-500', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
    { card: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    { card: 'border-l-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
    { card: 'border-l-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    // 🟢 สีที่เพิ่มใหม่ 8 สีด้านล่างนี้
    { card: 'border-l-cyan-500', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { card: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { card: 'border-l-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
    { card: 'border-l-fuchsia-500', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
    { card: 'border-l-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    { card: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { card: 'border-l-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { card: 'border-l-lime-500', badge: 'bg-lime-50 text-lime-700 border-lime-200' }
  ];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % themes.length;
  return themes[index];
};

// 🟢 Component รายการสินค้าย่อย (แสดงสเปกและปุ่มหยิบลงตะกร้า)
const SearchVariantItem: FC<{ variant: Product; onAdd: (p: Product, q: number) => void }> = ({ variant, onAdd }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            {variant.size && (
              <p className="text-gray-500">ขนาด: <span className="text-gray-900 font-bold">{variant.size}</span></p>
            )}
            {(variant as any).thickness && (
              <p className="text-gray-500">หนา: <span className="text-gray-900 font-bold">{(variant as any).thickness}</span></p>
            )}
            {(variant as any).weight && (
              <p className="text-gray-500">น้ำหนัก: <span className="text-gray-900 font-bold">{(variant as any).weight}</span></p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 border-dashed pt-3">
        <div className="text-lg font-black text-blue-600">{variant.price}.-</div>
        
        <div className="flex items-center gap-2">
          {/* ตัวเลือกจำนวน */}
          <div className="flex items-center border rounded-lg bg-white">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-1.5 text-gray-400 active:text-blue-600">
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-bold text-gray-700 text-sm">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="p-1.5 text-gray-400 active:text-blue-600">
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              onAdd(variant, qty);
              setQty(1);
            }}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

// 🟢 Component กล่องหลัก (จัดกลุ่มตามชื่อสินค้า)
const GroupedSearchProductCard: FC<{ group: { name: string, category: string, variants: Product[] }; onAdd: (p: Product, q: number) => void }> = ({ group, onAdd }) => {
  const theme = getCategoryColor(group.category);
  // ดึงรูปภาพจากสินค้ารายการแรกที่มีรูป
  const firstImage = group.variants.find((v: any) => v.image)?.image as string | undefined;

  return (
    <div className={`bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm border-l-4 ${theme.card}`}>
      {/* ส่วนหัว: รูปภาพ หมวดหมู่ และ ชื่อสินค้า */}
      <div className="flex gap-4 items-start mb-4">
        {firstImage && (
          <img src={firstImage} className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm" alt={group.name} />
        )}
        <div>
          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mb-1 border ${theme.badge}`}>
            หมวด: {group.category || 'ทั่วไป'}
          </span>
          <h3 className="text-base font-bold text-gray-800 leading-tight">{group.name}</h3>
        </div>
      </div>

      {/* ส่วนรายละเอียดสินค้าย่อย */}
      <div className="space-y-3">
        {group.variants.map((variant) => (
          <SearchVariantItem key={variant.id} variant={variant} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
};


const AppContent: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialized = useRef(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [memberInfo, setMemberInfo] = useState<{name: string, phone: string, address: string} | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isLiffReady, setIsLiffReady] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  // 🟢 State สำหรับควบคุมการแสดง Overlay แจ้งเตือนให้ไปลงทะเบียน
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'รับที่ร้าน' | 'จัดส่ง'>('รับที่ร้าน');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeApp = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setUserProfile({ 
          userId: profile.userId, 
          displayName: profile.displayName, 
          pictureUrl: profile.pictureUrl || '' 
        });

        setIsLiffReady(true); 

        try {
          const [memberRes, prodRes] = await Promise.all([
            fetch(`${GAS_URL}?action=checkMember&lineId=${profile.userId}`),
            fetch(`${GAS_URL}?action=getProducts`)
          ]);

          const memberData = await memberRes.json();
          const prodData = await prodRes.json();

          if (memberData.isMember) {
            setIsRegistered(true);
            setMemberInfo(memberData.data);
          }
          if (prodData.status === 'success') {
            setProducts(prodData.data);
          }
        } catch (apiError) {
          console.error("GAS Fetch Error:", apiError);
        }

      } catch (error) {
        console.error('LIFF Init Failed', error);
        setIsLiffReady(true); 
      } finally {
        setIsLoading(false); 
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (location.pathname === '/history' && userProfile?.userId) {
      const loadHistory = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`${GAS_URL}?action=getHistory&lineId=${userProfile.userId}`);
          const data = await res.json();
          if (data.status === 'success') setOrders(data.data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      loadHistory();
    }
  }, [location.pathname, userProfile?.userId]);

  const handleRegister = async (name: string, phone: string, address: string) => {
    setIsLoading(true);
    try {
      const payload = { lineId: userProfile?.userId, name, phone, address };
      const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'register', payload }) });
      const data = await res.json();
      if (data.status === 'success') {
        setIsRegistered(true);
        setMemberInfo({ name, phone, address });
        alert('บันทึกข้อมูลเรียบร้อย');
        navigate('/menu');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    // 🟢 ดักตรวจสอบการลงทะเบียนก่อนเพิ่มลงตะกร้า
    if (!isRegistered) {
      setShowRegisterPrompt(true);
      return; // หยุดการทำงาน ไม่เพิ่มของลงตะกร้า
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      return existing 
        ? prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => 
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!isRegistered) {
      alert('กรุณาลงทะเบียนข้อมูลจัดส่งก่อนสั่งซื้อ');
      setShowCart(false);
      navigate('/register');
    } else {
      handleConfirmOrder();
    }
  };

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: 'submitOrder', 
          payload: { lineId: userProfile?.userId, cart, totalQuantity, totalPrice: cartTotal, shippingMethod: deliveryMethod } 
        }),
      });
      
      const responseText = await res.text();
      const data = JSON.parse(responseText);

      if (data.status === 'success') {
        if (liff.isInClient()) {
          try {
            const itemBoxes = cart.map(item => {
              const specs = [item.size, (item as any).thickness].filter(Boolean);
              const specText = specs.length > 0 ? ` [${specs.join(', ')}]` : '';
              
              return {
                type: "box", layout: "horizontal",
                contents: [
                  { type: "text", text: `${item.name}${specText} x${item.quantity}`, size: "sm", color: "#555555", flex: 1, wrap: true },
                  { type: "text", text: `฿${item.price * item.quantity}`, size: "sm", color: "#111111", align: "end", flex: 0 }
                ]
              };
            });

            const flexMessage: any = {
              type: "flex", altText: `บิลสั่งซื้อ ${data.orderId}`,
              contents: {
                type: "bubble",
                body: {
                  type: "box", layout: "vertical",
                  contents: [
                    { type: "text", text: "RECEIPT", weight: "bold", color: "#1DB446", size: "sm" },
                    { type: "text", text: "รายการสั่งซื้อ", weight: "bold", size: "xl", margin: "md" },
                    { type: "text", text: `รหัส: ${data.orderId}`, size: "xs", color: "#aaaaaa", wrap: true },
                    { type: "separator", margin: "xxl" },
                    { type: "box", layout: "vertical", margin: "xxl", spacing: "sm", contents: itemBoxes },
                    { type: "separator", margin: "xxl" },
                    {
                      type: "box", layout: "horizontal", margin: "md",
                      contents: [
                        { type: "text", text: "วิธีจัดส่ง", size: "sm", color: "#555555" },
                        { type: "text", text: deliveryMethod, size: "sm", color: "#111111", align: "end" }
                      ]
                    },
                    {
                      type: "box", layout: "horizontal", margin: "md",
                      contents: [
                        { type: "text", text: "ยอดรวมทั้งสิ้น", size: "sm", color: "#555555" },
                        { type: "text", text: `฿${cartTotal}`, size: "lg", color: "#ff0000", align: "end", weight: "bold" }
                      ]
                    }
                  ]
                }
              }
            };
            await liff.sendMessages([flexMessage]);
          } catch (msgError: any) {
            console.error('Send message error:', msgError);
            alert(`⚠️ ออเดอร์เข้าแล้ว แต่ข้อความไม่เด้งเพราะ: ${msgError.message}`);
          }
        }

        alert('ส่งคำสั่งซื้อเรียบร้อย!');
        setCart([]);
        setShowCart(false);
        setSearchTerm('');

        if (liff.isInClient()) {
          liff.closeWindow(); 
        } else {
          navigate('/history');
        }
      } else {
        throw new Error(data.error || 'สถานะไม่สำเร็จ');
      }
    } catch (error: any) {
      console.error("Order Submit Error:", error);
      alert(`ไม่สามารถส่งคำสั่งซื้อได้: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600' : 'text-gray-400';

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFilteredProducts = useMemo(() => {
    const groups = filteredProducts.reduce((acc, product) => {
      const key = `${product.category}|${product.name}`;
      if (!acc[key]) {
        acc[key] = { name: product.name, category: product.category, variants: [] };
      }
      acc[key].variants.push(product);
      return acc;
    }, {} as Record<string, { name: string, category: string, variants: Product[] }>);
    
    return Object.values(groups);
  }, [filteredProducts]);

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 z-[60] flex flex-col items-center justify-center backdrop-blur-sm">
           <Loader2 className="animate-spin text-blue-600 mb-2" size={48} />
           <p className="text-gray-800 font-bold">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* 🟢 Overlay แจ้งเตือนให้ไปลงทะเบียน */}
      {showRegisterPrompt && (
        <div 
          className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setShowRegisterPrompt(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ลงทะเบียนก่อนสั่งซื้อ</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              คุณยังไม่ได้กรอกข้อมูลสำหรับจัดส่งสินค้า กรุณาลงทะเบียนข้อมูลในหน้าข้อมูลฉันก่อนหยิบสินค้าลงตะกร้านะครับ
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRegisterPrompt(false)} 
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  setShowRegisterPrompt(false);
                  navigate('/register');
                }} 
                className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md active:scale-95"
              >
                ไปลงทะเบียน
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm p-4 sticky top-0 z-40 border-b">
        <div className="container mx-auto flex justify-between items-center max-w-md">
          <div className="flex items-center gap-3">
            {userProfile?.pictureUrl ? (
              <img src={userProfile.pictureUrl} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><User size={24}/></div>
            )}
            <div>
              <h1 className="text-sm font-bold truncate w-32">{userProfile?.displayName || 'Loading...'}</h1>
              <p className={`text-[10px] font-medium ${isRegistered ? 'text-green-600' : 'text-orange-500'}`}>
                {isRegistered ? '● สมาชิกยืนยันแล้ว' : '● ยังไม่ได้ลงทะเบียน'}
              </p>
            </div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-2.5 bg-gray-100 rounded-full">
            <ShoppingCart size={22} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md min-h-[70vh]">
        
        {isLiffReady && location.pathname === '/menu' && (
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ รหัสสินค้า (ID)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {isLiffReady && (
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={
              searchTerm ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-xs font-semibold text-gray-500 mb-2 px-1">
                    พบ {filteredProducts.length} รายการ ({groupedFilteredProducts.length} กลุ่มสินค้า)
                  </p>
                  
                  {groupedFilteredProducts.length > 0 ? (
                    groupedFilteredProducts.map((group, index) => (
                      <GroupedSearchProductCard 
                        key={index} 
                        group={group} 
                        onAdd={addToCart} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <Search size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">ไม่พบสินค้าที่คุณค้นหา</p>
                    </div>
                  )}
                </div>
              ) : (
                <Menu products={products} isLoading={isLoading} addToCart={addToCart} />
              )
            } />
            <Route path="/register" element={<Register onRegister={handleRegister} isRegistered={isRegistered} initialData={memberInfo} />} />
            <Route path="/history" element={<History orders={orders} isLoading={isLoading} />} />
          </Routes>
        )}
      </main>

      {showCart && (
        <CartSummary 
          cart={cart} cartTotal={cartTotal} deliveryMethod={deliveryMethod} 
          setDeliveryMethod={setDeliveryMethod} setShowCart={setShowCart}
          isRegistered={isRegistered} handleCheckout={handleCheckout} 
          userAddress={memberInfo?.address}
          updateQuantity={updateQuantity}
        />
      )}

      {isLiffReady && (
        <footer className="bg-white border-t fixed bottom-0 left-0 right-0 z-40 h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <nav className="container mx-auto max-w-md flex justify-around items-center h-full">
            <Link to="/menu" onClick={() => setSearchTerm('')} className={`flex flex-col items-center justify-center w-full ${isActive('/menu')}`}>
              <ShoppingCart size={24} />
              <span className="text-[10px] font-bold mt-1">สั่งสินค้า</span>
            </Link>
            <Link to="/history" className={`flex flex-col items-center justify-center w-full ${isActive('/history')}`}>
              <HistoryIcon size={24} />
              <span className="text-[10px] font-bold mt-1">ประวัติ</span>
            </Link>
            <Link to="/register" className={`flex flex-col items-center justify-center w-full ${isActive('/register')}`}>
              <User size={24} />
              <span className="text-[10px] font-bold mt-1">ข้อมูลฉัน</span>
            </Link>
          </nav>
        </footer>
      )}
    </div>
  );
};

const App: FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;