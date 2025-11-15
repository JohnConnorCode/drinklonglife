import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: z.string().optional(),
  tagline: z.string().max(200, 'Tagline too long').optional().nullable(),
  label_color: z.enum(['yellow', 'red', 'green']),
  function_list: z.array(z.string()).optional().nullable(),
  best_for: z.array(z.string()).optional().nullable(),
  description: z.any().optional().nullable(), // Tiptap JSON
  story: z.any().optional().nullable(),
  detailed_function: z.any().optional().nullable(),
  how_to_use: z.any().optional().nullable(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  display_order: z.number().min(1),
  stripe_product_id: z.string().optional().nullable(),
  meta_title: z.string().max(60, 'Meta title too long (max 60 chars)').optional().nullable(),
  meta_description: z.string().max(160, 'Meta description too long (max 160 chars)').optional().nullable(),
  published_at: z.string().datetime().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  image_alt: z.string().optional().nullable(),
});

// Product variant validation schema
export const variantSchema = z.object({
  size_key: z.string().min(1, 'Size key required'),
  label: z.string().min(1, 'Label required'),
  stripe_price_id: z.string().regex(/^price_[a-zA-Z0-9]+$/, 'Invalid Stripe Price ID'),
  is_default: z.boolean(),
  display_order: z.number().min(1),
  is_active: z.boolean(),
  price_usd: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
});

// Product creation request
export const createProductRequestSchema = z.object({
  product: productSchema,
  ingredients: z.array(z.string().uuid()).optional(),
  variants: z.array(variantSchema).optional(),
});

// Product update request
export const updateProductRequestSchema = createProductRequestSchema.partial();

// Ingredient validation schema
export const ingredientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['fruit', 'root', 'green', 'herb', 'other']).optional().nullable(),
  seasonality: z.string().optional().nullable(),
  function: z.any().optional().nullable(), // Tiptap JSON
  sourcing_story: z.any().optional().nullable(),
  nutritional_profile: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  image_alt: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;
export type IngredientInput = z.infer<typeof ingredientSchema>;
