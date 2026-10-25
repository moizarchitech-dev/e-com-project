import 'server-only';
import { createClient } from '@supabase/supabase-js';

/** Service-role client. Bypasses RLS: use only in route handlers/webhooks. */
export const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
