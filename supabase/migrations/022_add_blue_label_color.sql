-- Migration: Add 'blue' to label_color constraint
-- This enables the Blue Bomb product

-- Drop the existing constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_label_color_check;

-- Add new constraint with 'blue' option
ALTER TABLE products ADD CONSTRAINT products_label_color_check
  CHECK (label_color IN ('yellow', 'red', 'green', 'blue'));

-- Comment for documentation
COMMENT ON COLUMN products.label_color IS 'Product label color theme: yellow (Rise), red (Reset), green (Cleanse), blue (Balance)';
