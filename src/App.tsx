import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import liff from '@line/liff';
import type { Liff } from '@line/liff';
import { Product, CartItem, UserProfile, Order } from './types';
import { ShoppingCart, User, History as HistoryIcon, Loader2, Search } from 'lucide-react'; // 🟢 เพิ่มไอคอน Search

import Menu from './components/Menu';
import Register from './components/Register';
import History from './components/History';
import CartSummary from './components/CartSummary';

const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2009263888-F1O3wTGT';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbx-9jqz_1O0u_dxFcYuJ8nLwAJ2t82A3rcOykX1JXPCMboXBWLLj_G_BOSZwfgWUDBW/exec'; 

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
  const [deliveryMethod, setDeliveryMethod] = useState<'รับที่ร้าน' | 'จัดส่ง'>('รับที่ร้าน');

  // 🟢 เพิ่ม State สำหรับเก็บข้อความค้นหาสินค้า
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
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      return existing 
        ? prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...prev, { ...product, quantity }];
    });
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
            const itemBoxes = cart.map(item => ({
              type: "box", layout: "horizontal",
              contents: [
                { type: "text", text: `${item.name} (${item.size}) x${item.quantity}`, size: "sm", color: "#555555", flex: 1 },
                { type: "text", text: `฿${item.price * item.quantity}`, size: "sm", color: "#111111", align: "end", flex: 0 }
              ]
            }));

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
        setSearchTerm(''); // เคลียร์ช่องค้นหาหลังสั่งเสร็จ

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

  // 🟢 กรองสินค้าจากคำที่ค้นหา ก่อนส่งไปให้หน้า Menu โชว์
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 z-[60] flex flex-col items-center justify-center backdrop-blur-sm">
           <Loader2 className="animate-spin text-blue-600 mb-2" size={48} />
           <p className="text-gray-800 font-bold">กำลังโหลดข้อมูล...</p>
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
        
        {/* 🟢 แสดงช่องค้นหาเฉพาะหน้า Menu เท่านั้น */}
        {isLiffReady && location.pathname === '/menu' && (
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาสินค้าที่ต้องการ..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {isLiffReady && (
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            {/* 🟢 เปลี่ยนจากการส่ง products เป็น filteredProducts */}
            <Route path="/menu" element={<Menu products={filteredProducts} isLoading={isLoading} addToCart={addToCart} />} />
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
        />
      )}

      {isLiffReady && (
        <footer className="bg-white border-t fixed bottom-0 left-0 right-0 z-40 h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <nav className="container mx-auto max-w-md flex justify-around items-center h-full">
            <Link to="/menu" className={`flex flex-col items-center justify-center w-full ${isActive('/menu')}`}>
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