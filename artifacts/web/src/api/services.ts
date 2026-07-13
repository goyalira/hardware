import api from "@/api/axios";
import type { Category, Order, OrderStatus, Pagination, Product, ShippingAddress } from "@/types";

export interface ProductListParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sort?: string;
  page?: number;
  limit?: number;
  inStock?: boolean;
}

export const productApi = {
  list: async (params: ProductListParams = {}) => {
    const { data } = await api.get<{ products: Product[]; pagination: Pagination }>("/products", {
      params,
    });
    return data;
  },
  featured: async () => {
    const { data } = await api.get<{ products: Product[] }>("/products/featured");
    return data.products;
  },
  getBySlug: async (slug: string) => {
    const { data } = await api.get<{ product: Product }>(`/products/${slug}`);
    return data.product;
  },
  brands: async () => {
    const { data } = await api.get<{ brands: string[] }>("/products/brands");
    return data.brands;
  },
  lowStock: async () => {
    const { data } = await api.get<{ products: Product[] }>("/products/low-stock");
    return data.products;
  },
  create: async (payload: Partial<Product>) => {
    const { data } = await api.post<{ product: Product }>("/products", payload);
    return data.product;
  },
  update: async (id: string, payload: Partial<Product>) => {
    const { data } = await api.put<{ product: Product }>(`/products/${id}`, payload);
    return data.product;
  },
  updateStock: async (id: string, payload: { stock?: number; adjustment?: number }) => {
    const { data } = await api.patch<{ product: Product }>(`/products/${id}/stock`, payload);
    return data.product;
  },
  remove: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

export const categoryApi = {
  list: async () => {
    const { data } = await api.get<{ categories: Category[] }>("/categories");
    return data.categories;
  },
  getBySlug: async (slug: string) => {
    const { data } = await api.get<{ category: Category }>(`/categories/${slug}`);
    return data.category;
  },
  create: async (payload: Partial<Category>) => {
    const { data } = await api.post<{ category: Category }>("/categories", payload);
    return data.category;
  },
  update: async (id: string, payload: Partial<Category>) => {
    const { data } = await api.put<{ category: Category }>(`/categories/${id}`, payload);
    return data.category;
  },
  remove: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export const orderApi = {
  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post<{ order: Order }>("/orders", payload);
    return data.order;
  },
  myOrders: async () => {
    const { data } = await api.get<{ orders: Order[] }>("/orders/my");
    return data.orders;
  },
  getById: async (id: string) => {
    const { data } = await api.get<{ order: Order }>(`/orders/${id}`);
    return data.order;
  },
  tracking: async (id: string) => {
    const { data } = await api.get(`/orders/${id}/tracking`);
    return data;
  },
  listAll: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await api.get<{ orders: Order[]; pagination: Pagination }>("/orders", {
      params,
    });
    return data;
  },
  updateStatus: async (id: string, status: OrderStatus, note?: string) => {
    const { data } = await api.patch<{ order: Order }>(`/orders/${id}/status`, { status, note });
    return data.order;
  },
};


export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}

export const paymentApi = {
  createRazorpayOrder: async (items: { productId: string; quantity: number }[]) => {
    const { data } = await api.post<RazorpayOrderResponse>("/payments/razorpay/order", { items });
    return data;
  },
  verifyRazorpayPayment: async (payload: VerifyPaymentPayload) => {
    const { data } = await api.post<{ order: Order }>("/payments/razorpay/verify", payload);
    return data.order;
  },
};
export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post<{ url: string }>("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
};

export const userApi = {
  list: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const { data } = await api.get("/users", { params });
    return data as { users: unknown[]; pagination: Pagination };
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  setActive: async (id: string, isActive: boolean) => {
    const { data } = await api.patch(`/users/${id}/status`, { isActive });
    return data;
  },
  remove: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

export const adminApi = {
  summary: async () => {
    const { data } = await api.get("/admin/analytics/summary");
    return data;
  },
  sales: async (days = 30) => {
    const { data } = await api.get("/admin/analytics/sales", { params: { days } });
    return data.sales as { date: string; revenue: number; orders: number }[];
  },
  topProducts: async () => {
    const { data } = await api.get("/admin/analytics/top-products");
    return data.topProducts as { _id: string; name: string; unitsSold: number; revenue: number }[];
  },
  orderStatusBreakdown: async () => {
    const { data } = await api.get("/admin/analytics/order-status");
    return data.breakdown as { status: OrderStatus; count: number }[];
  },
};
