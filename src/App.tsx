import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import liff from '@line/liff';
import type { Liff } from '@line/liff';
import { Product, CartItem, UserProfile, Order } from './types';
import { ShoppingCart, User, History as HistoryIcon, Loader2 } from 'lucide-react';

import Menu from './components/Menu.tsx';
import Register from './components/Register';
import History from './components/History';
import CartSummary from './components/CartSummary';

const LIFF_ID = process.env.VITE_LIFF_ID || '2009263888-F1O3wTGT'; 
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyiM_Fi6St5RPAjFBbM8QvCuFYAE_Ah_h5uDt4xznIODfAq-3eHKcXk_4eLaGwME53C/exec'; 

// --- Component หลักที่จะจัดการ Logic ทั้งหมด --
const AppContent: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [memberInfo, setMemberInfo] = useState<{name: string, phone: string, address: string} | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'รับที่ร้าน' | 'จัดส่ง'>('รับที่ร้าน');

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        let uid = 'U_MOCK_12345';
        let dName = 'Mock User';
        let pic = '';

        if (LIFF_ID && LIFF_ID !== 'YOUR_LIFF_ID') {
          await liff.init({ liffId: LIFF_ID });
          setLiffObject(liff);
          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            uid = profile.userId;
            dName = profile.displayName;
            pic = profile.pictureUrl || '';
          }
        }

        setUserProfile({ userId: uid, displayName: dName, pictureUrl: pic });

        const [memberRes, prodRes] = await Promise.all([
          fetch(`${GAS_URL}?action=checkMember&lineId=${uid}`),
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

      } catch (error) {
        console.error('Initialization failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // โหลดประวัติเมื่ออยู่ที่หน้า /history
  useEffect(() => {
    if (location.pathname === '/history' && userProfile?.userId) {
      loadHistory();
    }
  }, [location.pathname, userProfile]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${GAS_URL}?action=getHistory&lineId=${userProfile?.userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name: string, phone: string, address: string) => {
    setIsLoading(true);
    try {
      const payload = { lineId: userProfile?.userId, name, phone, address };
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'register', payload }),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setIsRegistered(true);
        setMemberInfo({ name, phone, address });
        alert('บันทึกข้อมูลเรียบร้อย');
        
        // หลังจากลงทะเบียนเสร็จ ให้เด้งกลับไปหน้าแรก
        navigate('/menu');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
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
      const orderDetails = {
        lineId: userProfile?.userId,
        cart,
        totalQuantity,
        totalPrice: cartTotal,
        shippingMethod: deliveryMethod,
      };

      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'submitOrder', payload: orderDetails }),
      });
      
      const data = await res.json();

      if (data.status === 'success') {
        if (liffObject && liffObject.isInClient()) {
            const summary = `🛒 สั่งซื้อสำเร็จ!\nรหัสออเดอร์: ${data.orderId}\nยอดรวม: ${cartTotal}.-`;
            await liffObject.sendMessages([{ type: 'text', text: summary }]);
        }
        alert('ส่งคำสั่งซื้อเรียบร้อย!');
        setCart([]);
        setShowCart(false);
        navigate('/history');
      }
    } catch (error) {
        alert('ไม่สามารถส่งคำสั่งซื้อได้');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันช่วยเช็คหน้าปัจจุบันเพื่อเปลี่ยนสีเมนู
  const isActive = (path: string) => location.pathname === path ? 'text-blue-600' : 'text-gray-400';

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 z-[60] flex flex-col items-center justify-center backdrop-blur-sm">
           <Loader2 className="animate-spin text-blue-600 mb-2" size={48} />
           <p className="text-gray-800 font-bold">กำลังดำเนินการ...</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-40 border-b">
        <div className="container mx-auto flex justify-between items-center max-w-md">
          <div className="flex items-center gap-3">
            {userProfile?.pictureUrl ? 
              <img src={userProfile.pictureUrl} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100" /> :
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><User size={24}/></div>
            }
            <div>
              <h1 className="text-sm font-bold truncate w-32">{userProfile?.displayName || 'Guest User'}</h1>
              <p className={`text-[10px] font-medium ${isRegistered ? 'text-green-600' : 'text-orange-500'}`}>
                {isRegistered ? '● สมาชิกยืนยันแล้ว' : '● ยังไม่ได้ลงทะเบียน'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowCart(true)} 
            className="relative p-2.5 bg-gray-100 rounded-full text-gray-700 active:bg-gray-200 transition-colors"
          >
            <ShoppingCart size={22} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Routes Switcher */}
      <main className="container mx-auto p-4 max-w-md min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<Menu products={products} isLoading={isLoading} addToCart={addToCart} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} isRegistered={isRegistered} initialData={memberInfo} />} />
          <Route path="/history" element={<History orders={orders} isLoading={isLoading} />} />
        </Routes>
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <CartSummary 
          cart={cart} cartTotal={cartTotal} deliveryMethod={deliveryMethod} 
          setDeliveryMethod={setDeliveryMethod} setShowCart={setShowCart}
          isRegistered={isRegistered} handleCheckout={handleCheckout} 
        />
      )}

      {/* Footer Navigation */}
      <footer className="bg-white border-t fixed bottom-0 left-0 right-0 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <nav className="container mx-auto max-w-md flex justify-around items-center h-16">
          <Link to="/menu" className={`flex flex-col items-center justify-center w-full transition-colors ${isActive('/menu')}`}>
            <ShoppingCart size={24} />
            <span className="text-[10px] font-bold mt-1">สั่งสินค้า</span>
          </Link>
          <Link to="/history" className={`flex flex-col items-center justify-center w-full transition-colors ${isActive('/history')}`}>
            <HistoryIcon size={24} />
            <span className="text-[10px] font-bold mt-1">ประวัติ</span>
          </Link>
          <Link to="/register" className={`flex flex-col items-center justify-center w-full transition-colors ${isActive('/register')}`}>
            <User size={24} />
            <span className="text-[10px] font-bold mt-1">ข้อมูลฉัน</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

// --- Export App พร้อม Router ---
const App: FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;