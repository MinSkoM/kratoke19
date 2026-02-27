export interface Product {
  id: string;
  category: string;
  name: string;
  size: string;
  thickness: string;
  color: string;
  weight: string;
  price: number;
  image: string;
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