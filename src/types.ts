export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface Session {
  id: string;
  title: string;
  script: string;
  imageUrl?: string;
  audioUrl?: string;
  flavorProfiles?: string[];
  createdAt?: number;
  ingredients?: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  flavorProfiles?: string[];
}

export interface CartItem {
  id: string;
  product?: Product;
  customSession?: Session;
  quantity: number;
  type: 'standard' | 'custom';
  price: number;
}

export interface OrderHistoryItem {
  id: string;
  cartItem: CartItem;
  timestamp: number;
  rating?: number;
  deliveryMethod?: 'delivery' | 'pickup';
  pickupLocation?: string;
}
