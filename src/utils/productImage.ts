import type { SyntheticEvent } from 'react';
import { Product } from '../types';

export function getProductImage(product: Product): string {
  return `/${product.name || ''}.png`;
}

export function handleProductImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackTried !== 'true') {
    image.dataset.fallbackTried = 'true';
    image.src = image.src.replace(/\.png($|\?)/, '.jpg$1');
    return;
  }
  image.style.display = 'none';
}
