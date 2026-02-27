import { useState, useEffect } from 'react';
import type { FC } from 'react';
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

enum Page {
  Menu,
  Register,
  History,
}

const App: FC = () => {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // State สำหรับเก็บข้อมูลสมาชิกที่โหลดจาก Database
  const [memberInfo, setMemberInfo] = useState<{name: string, phone: string, address: string} | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Menu);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'รับที่ร้าน' | 'จัดส่ง'>('รับที่ร้าน');

  // Initialize LIFF and Data
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

        // โหลดข้อมูลสมาชิกและสินค้าพร้อมกันเพื่อความเร็ว
        const [memberRes, prodRes] = await Promise.all([
          fetch(`${GAS_URL}?action=checkMember&lineId=${uid}`),
          fetch(`${GAS_URL}?action=getProducts`)
        ]);

        const memberData = await memberRes.json();
        const prodData = await prodRes.json();

        // จัดการข้อมูลสมาชิก
        if (memberData.isMember) {
          setIsRegistered(true);
          setMemberInfo(memberData.data); // data จาก GAS: {name, address, phone}
        }

        // จัดการข้อมูลสินค้า
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

  // โหลดประวัติเมื่อเปลี่ยนมาหน้า History
  useEffect(() => {
    if (currentPage === Page.History && userProfile?.userId) {
      loadHistory();
    }
  }, [currentPage]);

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
        setMemberInfo({ name, phone, address }); // อัปเดตข้อมูลใน UI ทันที
        alert('บันทึกข้อมูลสำเร็จ');
        liff.closeWindow()
        
        // ถ้าลงทะเบียนสำเร็จ ให้กลับไปหน้าสั่งซื้อต่
        setCurrentPage(Page.Menu);
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
      setCurrentPage(Page.Register);
      setShowCart(false);
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
        // ส่ง Flex Message หรือ Text เข้า LINE (ถ้าทำในเครื่องจริง)
        if (liffObject && liffObject.isInClient()) {
            const summary = `🛒 สั่งซื้อสำเร็จ!\nรหัสออเดอร์: ${data.orderId}\nยอดรวม: ${cartTotal}.-`;
            await liffObject.sendMessages([{ type: 'text', text: summary }]);
        }
        alert('ส่งคำสั่งซื้อเรียบร้อย! ขอบคุณที่ใช้บริการครับ');
        setCart([]);
        setShowCart(false);
        setCurrentPage(Page.History);
        if (liff.isInClient()) {
          liff.closeWindow(); 
        }
      }
    } catch (error) {
        alert('ไม่สามารถส่งคำสั่งซื้อได้ โปรดตรวจสอบอินเทอร์เน็ต');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      {/* Loading Overlay */}
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
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white animate-pulse">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-md min-h-[70vh]">
        {currentPage === Page.Menu && (
          <Menu products={products} isLoading={isLoading} addToCart={addToCart} />
        )}
        
        {currentPage === Page.Register && (
          <Register 
            onRegister={handleRegister} 
            isRegistered={isRegistered} 
            initialData={memberInfo} 
          />
        )}
        
        {currentPage === Page.History && (
          <History orders={orders} isLoading={isLoading} />
        )}
      </main>

      {/* Cart Summary Drawer */}
      {showCart && (
        <CartSummary 
          cart={cart}
          cartTotal={cartTotal}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          setShowCart={setShowCart}
          isRegistered={isRegistered}
          handleCheckout={handleCheckout}
        />
      )}

      {/* Bottom Navigation */}
      <footer className="bg-white border-t fixed bottom-0 left-0 right-0 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <nav className="container mx-auto max-w-md flex justify-around items-center h-16">
          <button 
            onClick={() => {setCurrentPage(Page.Menu); setShowCart(false);}} 
            className={`flex flex-col items-center justify-center w-full transition-colors ${currentPage === Page.Menu ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <ShoppingCart size={24} />
            <span className="text-[10px] font-bold mt-1">สั่งสินค้า</span>
          </button>
          
          <button 
            onClick={() => {setCurrentPage(Page.History); setShowCart(false);}} 
            className={`flex flex-col items-center justify-center w-full transition-colors ${currentPage === Page.History ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <HistoryIcon size={24} />
            <span className="text-[10px] font-bold mt-1">ประวัติ</span>
          </button>
          
          <button 
            onClick={() => {setCurrentPage(Page.Register); setShowCart(false);}} 
            className={`flex flex-col items-center justify-center w-full transition-colors ${currentPage === Page.Register ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <User size={24} />
            <span className="text-[10px] font-bold mt-1">ข้อมูลฉัน</span>
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default App;