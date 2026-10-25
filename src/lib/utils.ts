import clsx, { type ClassValue } from 'clsx';
import type { OrderStatus } from '@/types';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);
export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get = (obj: any, path: string) => path.split('.').reduce((a, k) => a?.[k], obj);
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};
