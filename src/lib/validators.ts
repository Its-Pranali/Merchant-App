import { z } from 'zod';

export const phoneSchema = z.string()
  .regex(/^\d{10}$/, 'Phone must be 10 digits');

export const pincodeSchema = z.string()
  .regex(/^\d{6}$/, 'Pincode must be 6 digits');

export const panSchema = z.string()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Invalid PAN format');

export const applicationFormSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tradeName: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: phoneSchema,
  email: z.string().email('Invalid email format'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: pincodeSchema,
  pan: panSchema,
  gstin: z.string().optional(),
  doiOrDob: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;