import type { OrderStatus } from '@/types';
import { STATUS_LABEL, cn } from '@/lib/utils';

const STYLE: Record<OrderStatus, string> = {
  pending: 'bg-ink/10 text-ink', processing: 'bg-marigold/30 text-ink', shipped: 'bg-sky-100 text-sky-900',
  delivered: 'bg-pine/15 text-pine-dark', cancelled: 'bg-red-100 text-red-800',
};
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STYLE[status])}>{STATUS_LABEL[status]}</span>;
}
