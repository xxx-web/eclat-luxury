import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

function generateOrderId(): string {
  // Prefer crypto.randomUUID for collision-free IDs; fallback to timestamp+random
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ECLAT-${crypto.randomUUID().toUpperCase()}`;
  }
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ECLAT-${ts}${rand}`;
}

export interface OrderItem {
  productId: string;
  name: string;
  img: string;
  price: number;
  qty: number;
  category: string;
}

export interface Order {
  id: string;
  userId: string | null;
  items: OrderItem[];
  total: number;
  shipping: {
    name: string;
    phone: string;
    address: string;
    note?: string;
  };
  payment: 'alipay' | 'wechat' | 'card';
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: number;
  paidAt?: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  detail: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string | null;
  userName: string;
  rating: number; // 1-5
  content: string;
  createdAt: number;
}

const ORDER_KEY_PREFIX = 'eclat_orders_';
const ADDRESS_KEY_PREFIX = 'eclat_addresses_';
const REVIEW_KEY = 'eclat_reviews';

function orderKey(userId: string | null) {
  return `${ORDER_KEY_PREFIX}${userId ?? 'guest'}`;
}

function addressKey(userId: string | null) {
  return `${ADDRESS_KEY_PREFIX}${userId ?? 'guest'}`;
}

function loadList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveList<T>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => loadList<Order>(orderKey(null)));
  const userIdRef = useRef<string | null>(null);

  // Re-load when user changes (guarded against out-of-order resolution)
  useEffect(() => {
    const nextUserId = user?.id ?? null;
    userIdRef.current = nextUserId;
    setOrders(loadList<Order>(orderKey(nextUserId)));
  }, [user?.id]);

  const createOrder = useCallback(
    (data: Omit<Order, 'id' | 'userId' | 'status' | 'createdAt'>): Order => {
      const currentUserId = userIdRef.current;
      const order: Order = {
        ...data,
        id: generateOrderId(),
        userId: currentUserId,
        status: 'paid', // simplified - mark as paid immediately
        paidAt: Date.now(),
        createdAt: Date.now(),
      };
      const list = loadList<Order>(orderKey(currentUserId));
      list.unshift(order);
      saveList(orderKey(currentUserId), list);
      setOrders(list);
      return order;
    },
    []
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      const currentUserId = userIdRef.current;
      const list = loadList<Order>(orderKey(currentUserId));
      const idx = list.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], status: 'cancelled' };
        saveList(orderKey(currentUserId), list);
        setOrders(list);
      }
    },
    []
  );

  return { orders, createOrder, cancelOrder };
}

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(() => loadList<Address>(addressKey(null)));
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextUserId = user?.id ?? null;
    userIdRef.current = nextUserId;
    setAddresses(loadList<Address>(addressKey(nextUserId)));
  }, [user?.id]);

  const addAddress = useCallback(
    (addr: Omit<Address, 'id'>) => {
      const currentUserId = userIdRef.current;
      const list = loadList<Address>(addressKey(currentUserId));
      const newAddr: Address = { ...addr, id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
      if (addr.isDefault) {
        // ensure only one default
        list.forEach((a) => (a.isDefault = false));
      }
      list.unshift(newAddr);
      saveList(addressKey(currentUserId), list);
      setAddresses(list);
      return newAddr;
    },
    []
  );

  const removeAddress = useCallback(
    (id: string) => {
      const currentUserId = userIdRef.current;
      const list = loadList<Address>(addressKey(currentUserId)).filter((a) => a.id !== id);
      saveList(addressKey(currentUserId), list);
      setAddresses(list);
    },
    []
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      const currentUserId = userIdRef.current;
      const list = loadList<Address>(addressKey(currentUserId)).map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      saveList(addressKey(currentUserId), list);
      setAddresses(list);
    },
    []
  );

  return { addresses, addAddress, removeAddress, setDefaultAddress };
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(() => loadList<Review>(REVIEW_KEY));

  const addReview = useCallback(
    (data: Omit<Review, 'id' | 'createdAt'>) => {
      const list = loadList<Review>(REVIEW_KEY);
      const newReview: Review = {
        ...data,
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      list.unshift(newReview);
      saveList(REVIEW_KEY, list);
      setReviews(list);
      return newReview;
    },
    []
  );

  const getReviewsFor = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId),
    [reviews]
  );

  return { reviews, addReview, getReviewsFor };
}
