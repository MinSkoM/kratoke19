import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../features/cart/useCart';
import { useCheckout } from '../features/checkout/useCheckout';
import { useLineAuth } from '../features/line-auth/useLineAuth';
import { useMember } from '../features/member/useMember';
import { useOrderHistory } from '../features/order-history/useOrderHistory';
import { useProducts } from '../features/products/useProducts';

export function useShopApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const loadedUserId = useRef<string | null>(null);
  const loadedProducts = useRef(false);
  const isPublicCalculator = location.pathname.startsWith('/calculator');

  const { userProfile, isLiffReady, isLoadingProfile } = useLineAuth(!isPublicCalculator);
  const { products, loadProducts } = useProducts();
  const { memberInfo, setMemberInfo, isRegistered, loadMember, saveMember } = useMember();
  const { orders, loadHistory } = useOrderHistory();
  const { cart, addItem, updateQuantity, clearCart, totalQty, cartTotal } = useCart();
  const { isCheckingOut, confirmOrder, closeLineWindow } = useCheckout();

  const [isAppDataLoading, setIsAppDataLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showRegPrompt, setShowRegPrompt] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'รับที่ร้าน' | 'จัดส่ง'>('รับที่ร้าน');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSearchName, setExpandedSearchName] = useState<string | null>(null);

  useEffect(() => {
    if (loadedProducts.current) return;
    loadedProducts.current = true;

    (async () => {
      setIsAppDataLoading(true);
      try {
        await loadProducts();
      } catch (error) {
        console.error('Products:', error);
      } finally {
        setIsAppDataLoading(false);
      }
    })();
  }, [loadProducts]);

  useEffect(() => {
    if (!userProfile?.userId || loadedUserId.current === userProfile.userId) return;
    loadedUserId.current = userProfile.userId;

    (async () => {
      setIsAppDataLoading(true);
      try {
        await loadMember(userProfile.userId);
      } catch (error) {
        console.error('Member:', error);
      } finally {
        setIsAppDataLoading(false);
      }
    })();
  }, [loadMember, userProfile?.userId]);

  useEffect(() => {
    if (location.pathname !== '/history' || !userProfile?.userId) return;

    (async () => {
      setIsAppDataLoading(true);
      try {
        await loadHistory(userProfile.userId);
      } catch (error) {
        console.error('History:', error);
      } finally {
        setIsAppDataLoading(false);
      }
    })();
  }, [loadHistory, location.pathname, userProfile?.userId]);

  const filteredProducts = useMemo(
    () => products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.id.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    [products, searchTerm],
  );

  const groupedSearch = useMemo(() => {
    const map: Record<string, { name: string; category: string; variants: Product[] }> = {};
    filteredProducts.forEach(product => {
      const key = `${product.category}|${product.name}`;
      if (!map[key]) map[key] = { name: product.name, category: product.category, variants: [] };
      map[key].variants.push(product);
    });
    return Object.values(map);
  }, [filteredProducts]);

  const handleRegister = async (name: string, phone: string, address: string) => {
    setIsAppDataLoading(true);
    try {
      await saveMember(userProfile?.userId, { name, phone, address });
      alert('บันทึกข้อมูลเรียบร้อย');
      navigate('/menu');
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsAppDataLoading(false);
    }
  };

  const handleAddressUpdate = async (newAddress: string) => {
    if (!memberInfo || !userProfile) return;
    const updated = { ...memberInfo, address: newAddress };
    setMemberInfo(updated);
    try {
      await saveMember(userProfile.userId, updated);
    } catch {
      // Keep the optimistic UI update; address save can be retried from profile.
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (!isRegistered) {
      setShowRegPrompt(true);
      return;
    }
    addItem(product, quantity);
  };

  const handleCheckout = () => {
    if (!isRegistered) {
      alert('กรุณาลงทะเบียนก่อนสั่งซื้อ');
      setShowCart(false);
      navigate('/register');
      return;
    }

    void handleConfirmOrder();
  };

  const handleConfirmOrder = async () => {
    setIsAppDataLoading(true);
    try {
      const result = await confirmOrder({
        lineId: userProfile?.userId,
        cart,
        totalQuantity: totalQty,
        totalPrice: cartTotal,
        shippingMethod: deliveryMethod,
      });

      if (result.receiptError) {
        alert(`⚠️ ออเดอร์เข้าแล้ว แต่ส่งข้อความไม่ได้: ${result.receiptError.message}`);
      }

      alert('ส่งคำสั่งซื้อเรียบร้อย!');
      clearCart();
      setShowCart(false);
      setSearchTerm('');

      if (result.shouldCloseLineWindow) {
        closeLineWindow();
      } else {
        navigate('/history');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      alert(`ไม่สามารถส่งคำสั่งซื้อได้: ${message}`);
    } finally {
      setIsAppDataLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isLoading = isLoadingProfile || isAppDataLoading || isCheckingOut;

  return {
    userProfile,
    memberInfo,
    products,
    orders,
    isLiffReady,
    isLoading,
    cart,
    showCart,
    setShowCart,
    showRegPrompt,
    setShowRegPrompt,
    deliveryMethod,
    setDeliveryMethod,
    searchTerm,
    setSearchTerm,
    expandedSearchName,
    setExpandedSearchName,
    isRegistered,
    totalQty,
    cartTotal,
    filteredProducts,
    groupedSearch,
    isActive,
    addToCart,
    updateQuantity,
    handleRegister,
    handleCheckout,
    handleAddressUpdate,
    isPublicCalculator,
  };
}
