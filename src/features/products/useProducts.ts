import { useCallback, useState } from 'react';
import type { Product } from '../../types';
import { getProducts } from '../../lib/gasClient';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = useCallback(async () => {
    const nextProducts = await getProducts();
    setProducts(nextProducts);
    return nextProducts;
  }, []);

  return { products, setProducts, loadProducts };
}
