import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyCoupon } from '@/lib/pricing';
import type { Coupon } from '@/types';

const bodySchema = z.object({ code: z.string().min(1).max(40), subtotal: z.number().int().min(0) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ valid: false, message: 'Enter a coupon code.' }, { status: 400 });
  const code = parsed.data.code.trim().toUpperCase();
  const { data } = await createAdminClient().from('coupons').select('*').eq('code', code).maybeSingle();
  if (!data) return NextResponse.json({ valid: false, message: 'That code isn’t valid.' });
  const res = applyCoupon(data as Coupon, parsed.data.subtotal);
  if (!res.ok) return NextResponse.json({ valid: false, message: res.message });
  return NextResponse.json({ valid: true, code, discount: res.discount });
}
