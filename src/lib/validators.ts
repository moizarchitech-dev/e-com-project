import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Enter the full name'),
  line1: z.string().min(3, 'Enter the street address'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter the city'),
  state: z.string().optional(),
  postalCode: z.string().min(3, 'Enter the postal code'),
  country: z.string().length(2, 'Use a 2-letter country code, e.g. US'),
  phone: z.string().optional(),
});

export const checkoutRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(20),
    options: z.record(z.string()).default({}),
  })).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  deliveryMethod: z.enum(['standard', 'express']),
  couponCode: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
export const signUpSchema = signInSchema.extend({ fullName: z.string().min(2, 'Enter your name') });
export const profileSchema = z.object({ fullName: z.string().min(2, 'Enter your name'), phone: z.string().optional() });
export const savedAddressSchema = addressSchema.extend({ label: z.string().optional(), isDefault: z.boolean().default(false) });
