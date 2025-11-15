import { z } from 'zod';

// Ingredient type enum
export const ingredientTypes = ['fruit', 'root', 'green', 'herb', 'other'] as const;

// Ingredient validation schema
export const ingredientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(ingredientTypes, {
    errorMap: () => ({ message: 'Type must be fruit, root, green, herb, or other' }),
  }),
  seasonality: z.string().max(100).optional().nullable(),
  function: z.any().optional().nullable(), // Tiptap JSON
  sourcing_story: z.any().optional().nullable(), // Tiptap JSON
  nutritional_profile: z.string().max(1000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  image_alt: z.string().max(200).optional().nullable(),
});

export type IngredientFormData = z.infer<typeof ingredientSchema>;
