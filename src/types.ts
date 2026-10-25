export type Product = {
  id: string; title: string; slug: string; description: string | null;
  price: number; compare_at_price: number | null; stock: number; images: string[];
  category_id: string | null; attributes: { sizes?: string[]; colors?: string[] };
  is_featured: boolean; is_active: boolean; created_at: string;
};
export type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null };
export type Profile = { id: string; full_name: string | null; phone: string | null; role: string };
export type Address = {
  id: string; user_id: string; label: string | null; full_name: string; line1: string; line2: string | null;
  city: string; state: string | null; postal_code: string; country: string; phone: string | null; is_default: boolean;
};
export type Coupon = {
  id: string; code: string; type: 'percent' | 'fixed'; value: number; min_subtotal: number;
  max_uses: number | null; used_count: number; expires_at: string | null; is_active: boolean;
};
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderItem = {
  id: string; order_id: string; product_id: string | null; title: string; quantity: number; price: number;
  options: Record<string, string>;
};
export type AddressJson = {
  fullName: string; line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string; phone?: string;
};
export type Order = {
  id: string; user_id: string | null; status: OrderStatus; subtotal: number; discount: number; shipping_cost: number;
  total_amount: number; currency: string; shipping_address: AddressJson; billing_address: AddressJson;
  delivery_method: string; payment_intent_id: string | null; tracking_number: string | null;
  estimated_delivery: string | null; created_at: string; order_items?: OrderItem[];
};
