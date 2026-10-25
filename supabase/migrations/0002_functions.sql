create or replace function public.increment_coupon_use(p_coupon uuid)
returns void language sql security definer set search_path = public as $$
  update coupons set used_count = used_count + 1 where id = p_coupon;
$$;
revoke execute on function public.increment_coupon_use from public, anon, authenticated;
