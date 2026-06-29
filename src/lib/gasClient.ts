import type { CartItem, Order, Product } from '../types';
import { requireGasUrl } from './env';

export interface MemberInfo {
  name: string;
  phone: string;
  address: string;
}

export interface CheckMemberResponse {
  isMember: boolean;
  data?: MemberInfo;
}

export interface RegisterMemberPayload extends MemberInfo {
  lineId?: string;
}

export interface SubmitOrderPayload {
  lineId?: string;
  cart: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  shippingMethod: 'รับที่ร้าน' | 'จัดส่ง';
}

export interface SubmitOrderResponse {
  status: 'success';
  orderId: string;
}

interface StatusResponse<T> {
  status?: string;
  data?: T;
  error?: string;
}

function gasUrl(params?: Record<string, string>): string {
  const url = new URL(requireGasUrl());
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Google Apps Script request failed (${response.status}).`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Google Apps Script returned invalid JSON.');
  }
}

function assertStatusSuccess<T extends { status?: string; error?: string }>(data: T, action: string): T {
  if (data.status !== 'success') {
    throw new Error(data.error || `${action} failed.`);
  }
  return data;
}

export async function checkMember(lineId: string): Promise<CheckMemberResponse> {
  const data = await parseJsonResponse<CheckMemberResponse>(
    await fetch(gasUrl({ action: 'checkMember', lineId })),
  );
  return { isMember: Boolean(data.isMember), data: data.data };
}

export async function getProducts(): Promise<Product[]> {
  const data = assertStatusSuccess(
    await parseJsonResponse<StatusResponse<Product[]>>(
      await fetch(gasUrl({ action: 'getProducts' })),
    ),
    'getProducts',
  );

  if (!Array.isArray(data.data)) {
    throw new Error('Product response data must be an array.');
  }

  return data.data.filter(product => product.price);
}

export async function registerMember(payload: RegisterMemberPayload): Promise<void> {
  assertStatusSuccess(
    await parseJsonResponse<StatusResponse<unknown>>(
      await fetch(requireGasUrl(), {
        method: 'POST',
        body: JSON.stringify({ action: 'register', payload }),
      }),
    ),
    'register',
  );
}

export async function submitOrder(payload: SubmitOrderPayload): Promise<SubmitOrderResponse> {
  const data = assertStatusSuccess(
    await parseJsonResponse<SubmitOrderResponse & { error?: string }>(
      await fetch(requireGasUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitOrder', payload }),
      }),
    ),
    'submitOrder',
  );

  if (!data.orderId) {
    throw new Error('Order response is missing orderId.');
  }

  return data;
}

export async function getHistory(lineId: string): Promise<Order[]> {
  const data = assertStatusSuccess(
    await parseJsonResponse<StatusResponse<Order[]>>(
      await fetch(gasUrl({ action: 'getHistory', lineId })),
    ),
    'getHistory',
  );

  if (!Array.isArray(data.data)) {
    throw new Error('Order history response data must be an array.');
  }

  return data.data;
}
