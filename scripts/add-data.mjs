// Usage:
//   node --env-file=.env.local scripts/add-data.mjs products data/products.json
//   node --env-file=.env.local scripts/add-data.mjs users data/users.json
// Needs Node 20.6+ and NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const [kind, file] = process.argv.slice(2);
if (!['products', 'users'].includes(kind) || !file) {
  console.error('Usage: add-data.mjs <products|users> <file.json>');
  process.exit(1);
}
const clean = (v) => (v ?? '').split('#')[0].trim().replace(/^["']|["']$/g, '');
const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

function fail(msg) { console.error(`\n✗ ${msg}\n`); process.exit(1); }
if (!url || !key) fail('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local');
if (/your-|YOUR-/.test(url + key)) fail('.env.local still contains placeholder values. Paste your real project URL and service_role key.');
if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) console.warn(`! URL looks unusual: ${url}`);
if (key.startsWith('eyJ')) {
  // Legacy JWT keys: check the embedded role and project ref.
  try {
    const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    if (claims.role !== 'service_role') fail(`This is the "${claims.role}" key. Use the service_role key (Project Settings → API).`);
    const ref = new URL(url).hostname.split('.')[0];
    if (claims.ref && claims.ref !== ref) fail(`Key belongs to project "${claims.ref}" but the URL is project "${ref}".`);
  } catch { fail('SUPABASE_SERVICE_ROLE_KEY is not a valid key. Copy it again without extra characters.'); }
} else if (!key.startsWith('sb_secret_')) {
  fail('Key format not recognized. Use the service_role key (starts with eyJ…) or a secret key (starts with sb_secret_).');
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const rows = JSON.parse(readFileSync(file, 'utf8'));
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function categoryId(name) {
  const slug = slugify(name);
  const { data } = await db.from('categories').select('id').eq('slug', slug).maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await db.from('categories').insert({ name, slug }).select('id').single();
  if (error) throw error;
  return created.id;
}

async function addProducts() {
  for (const p of rows) {
    const slug = p.slug || slugify(p.title);
    const record = {
      title: p.title, slug, description: p.description ?? null,
      price: Math.round(Number(p.price) * 100),                       // dollars in the file, cents in the DB
      compare_at_price: p.compareAtPrice ? Math.round(Number(p.compareAtPrice) * 100) : null,
      stock: p.stock ?? 0,
      images: p.images?.length ? p.images : [`https://picsum.photos/seed/${slug}/900/900`],
      category_id: p.category ? await categoryId(p.category) : null,
      attributes: p.attributes ?? {}, is_featured: !!p.featured, is_active: p.active ?? true,
    };
    const { error } = await db.from('products').upsert(record, { onConflict: 'slug' });
    console.log(error ? `✗ ${p.title}: ${error.message}` : `✓ ${p.title}`);
  }
}

async function addUsers() {
  for (const u of rows) {
    const { data, error } = await db.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
      user_metadata: { full_name: u.fullName ?? null },
    });
    if (error) { console.log(`✗ ${u.email}: ${error.message}`); continue; }
    // The profile row is created by a database trigger; set role/phone afterwards.
    const { error: pErr } = await db.from('profiles')
      .update({ role: u.role ?? 'customer', phone: u.phone ?? null }).eq('id', data.user.id);
    console.log(pErr ? `✗ ${u.email}: ${pErr.message}` : `✓ ${u.email} (${u.role ?? 'customer'})`);
  }
}

await (kind === 'products' ? addProducts() : addUsers());
