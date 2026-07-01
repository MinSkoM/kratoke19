export interface Product {
  id: string;
  category: string;
  name: string;
  detail: string;
  thickness: string;
  color: string;
  weight: string;
  size: string;
  price: number;
  unit?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export interface Order {
  orderId: string;
  date: string;
  items: CartItem[];
  total: number;
  status: string;
  shippingMethod: string;
}
