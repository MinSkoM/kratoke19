import { Product } from '../types';

const CATEGORY_IMAGES: Record<string, string> = {
  A1: 'https://images.unsplash.com/photo-1501166222995-ff31c7e93cef?w=400&q=80&auto=format&fit=crop',
  A2: 'https://images.unsplash.com/photo-1661904482365-67d592410354?w=400&q=80&auto=format&fit=crop',
  A3: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=400&q=80&auto=format&fit=crop',
  A4: 'https://images.unsplash.com/photo-1734888369524-bd915004d0c3?w=400&q=80&auto=format&fit=crop',
  A5: 'https://images.unsplash.com/photo-1694696410046-731023abe5d6?w=400&q=80&auto=format&fit=crop',
  A6: 'https://images.unsplash.com/photo-1538474705339-e87de81450e8?w=400&q=80&auto=format&fit=crop',
  B1: 'https://images.unsplash.com/photo-1612058237353-6213b412a1c4?w=400&q=80&auto=format&fit=crop',
  B2: 'https://images.unsplash.com/photo-1522322512347-a0e57fd1744c?w=400&q=80&auto=format&fit=crop',
  B3: 'https://images.unsplash.com/photo-1595234200096-f1c7ccdf26a7?w=400&q=80&auto=format&fit=crop',
  B4: 'https://images.unsplash.com/photo-1667892702884-faa077e80d7b?w=400&q=80&auto=format&fit=crop',
  C1: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80&auto=format&fit=crop',
  C2: 'https://images.unsplash.com/photo-1622109912940-2bddde35274d?w=400&q=80&auto=format&fit=crop',
  C3: 'https://images.unsplash.com/photo-1609627016501-b862497c7294?w=400&q=80&auto=format&fit=crop',
  D1: 'https://images.unsplash.com/photo-1616661317985-aeb2a13016d6?w=400&q=80&auto=format&fit=crop',
  E1: 'https://images.unsplash.com/photo-1560428105-5eef97beccb0?w=400&q=80&auto=format&fit=crop',
  E2: 'https://images.unsplash.com/photo-1649956739904-9b5e3618c626?w=400&q=80&auto=format&fit=crop',
  E3: 'https://images.unsplash.com/photo-1586057285471-2f78bffaf074?w=400&q=80&auto=format&fit=crop',
  E4: 'https://images.unsplash.com/photo-1649706286480-1c6f3f3c1fb1?w=400&q=80&auto=format&fit=crop',
  E5: 'https://images.unsplash.com/photo-1520697517317-6767553cc51a?w=400&q=80&auto=format&fit=crop',
};

const FALLBACK = 'https://images.unsplash.com/photo-1600474848646-0142057eb600?w=400&q=80&auto=format&fit=crop';

export function getProductImage(product: Product): string {
  if (product.image?.trim()) return product.image;
  const fromId = product.id?.substring(0, 2).toUpperCase();
  if (fromId && CATEGORY_IMAGES[fromId]) return CATEGORY_IMAGES[fromId];
  const fromCat = product.category?.substring(0, 2).toUpperCase();
  if (fromCat && CATEGORY_IMAGES[fromCat]) return CATEGORY_IMAGES[fromCat];
  return FALLBACK;
}
