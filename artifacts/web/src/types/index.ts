export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: Category | string;
  brand?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  unit: string;
  stock: number;
  images: string[];
  specifications?: Record<string, string>;
  isFeatured: boolean;
  isActive: boolean;
  lowStockThreshold: number;
  rating?: number;
  createdAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface TrackingEvent {
  status: OrderStatus;
  note?: string;
  date: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: OrderStatus;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  trackingNumber: string;
  trackingHistory: TrackingEvent[];
  deliveredAt?: string;
  createdAt: string;
}
