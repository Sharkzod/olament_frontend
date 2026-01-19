// lib/api/ordersApi.ts
import apiClient from './apiClient';

// Get all orders
export const getAllOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

// Get order by ID
export const getOrderById = async (orderId: string) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

// Create order
export const createOrder = async (data: {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}) => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Get user orders
export const getUserOrders = async () => {
  const response = await apiClient.get('/orders/my-orders');
  return response.data;
};

// Get shop orders
export const getShopOrders = async (shopId: string, params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get(`/shops/${shopId}/orders`, { params });
  return response.data;
};