import { Product } from '../types';

export function getProductImage(product: Product): string {
  return `/${product.name || ''}.jpg`;
}
