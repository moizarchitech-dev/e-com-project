'use client';
import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { money } from '@/lib/utils';

export default function CouponInput({ subtotal }: { subtotal: number }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function validate(c: string) {
    const r = await fetch('/api/coupons/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: c, subtotal }),
    });
    return (await r.json()) as { valid: boolean; discount?: number; code?: string; message?: string };
  }
  async function apply() {
    if (!code.trim()) return;
    setBusy(true); setMsg(null);
    const res = await validate(code.trim());
    setBusy(false);
    if (res.valid) { setCoupon({ code: res.code!, discount: res.discount! }); setCode(''); }
    else setMsg(res.message ?? 'That code isn’t valid.');
  }
  // Re-check the applied coupon whenever the subtotal changes.
  useEffect(() => {
    if (!coupon) return;
    validate(coupon.code).then((res) => {
      if (res.valid) { if (res.discount !== coupon.discount) setCoupon({ code: coupon.code, discount: res.discount! }); }
      else { setCoupon(null); setMsg(res.message ?? null); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  if (coupon) {
    return (
      <p className="flex items-center justify-between rounded-md bg-pine/10 px-3 py-2 text-sm">
        <span><strong>{coupon.code}</strong> applied, you save {money(coupon.discount)}</span>
        <button className="underline" onClick={() => setCoupon(null)}>Remove</button>
      </p>
    );
  }
  return (
    <div>
      <label htmlFor="coupon" className="label">Coupon code</label>
      <div className="flex gap-2">
        <input id="coupon" className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" />
        <button type="button" onClick={apply} disabled={busy} className="btn btn-secondary">{busy ? 'Checking…' : 'Apply'}</button>
      </div>
      {msg && <p className="field-error" role="alert">{msg}</p>}
    </div>
  );
}
