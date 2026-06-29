import type { Product } from '../../types';

export interface PricingEstimateItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface PricingLineItem extends PricingEstimateItem {
  unitPrice: number;
  subtotal: number;
}

export interface PricingResult {
  items: PricingLineItem[];
  subtotal: number;
  total: number;
}
