import { useMemo, useState } from 'react';
import type { CartItem, Product } from '../../types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      return existing
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const totalQty = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return { cart, setCart, addItem, updateQuantity, clearCart, totalQty, cartTotal };
}
