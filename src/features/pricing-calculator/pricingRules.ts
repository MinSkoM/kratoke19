import type { PricingEstimateItem, PricingResult } from './pricingTypes';

export function calculatePrice(items: PricingEstimateItem[]): PricingResult {
  const pricedItems = items.map(item => {
    const unitPrice = Number(item.product.price) || 0;
    return {
      ...item,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });
  const subtotal = pricedItems.reduce((sum, item) => sum + item.subtotal, 0);

  return { items: pricedItems, subtotal, total: subtotal };
}
