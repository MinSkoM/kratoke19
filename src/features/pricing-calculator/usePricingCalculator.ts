import { useMemo, useState } from 'react';
import type { Product } from '../../types';
import { calculatePrice } from './pricingRules';
import type { PricingEstimateItem } from './pricingTypes';

export function usePricingCalculator() {
  const [items, setItems] = useState<PricingEstimateItem[]>([]);
  const result = useMemo(() => calculatePrice(items), [items]);

  const addProduct = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const safeQty = Math.max(1, Math.floor(quantity || 1));
      return existing
        ? prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + safeQty } : item)
        : [...prev, { id: `${product.id}-${Date.now()}`, product, quantity: safeQty }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: string, delta: number) => {
    setItems(prev => prev
      .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0));
  };

  return {
    items,
    result,
    addProduct,
    removeItem,
    updateItemQuantity,
  };
}
