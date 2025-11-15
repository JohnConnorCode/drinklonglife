-- =====================================================
-- E-COMMERCE PRODUCT MANAGEMENT
-- =====================================================
-- Migration: 005_ecommerce_products.sql
-- Date: 2025-11-15
-- Description: Product catalog for cold-pressed juice blends
--              Replaces Sanity CMS product management

-- =====================================================
-- PRODUCTS TABLE (Replaces Sanity "blend" schema)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,

  -- Rich Content (stored as Tiptap JSON or Portable Text JSON)
  description JSONB, -- Rich text for main description
  story JSONB, -- Rich text for blend story
  detailed_function JSONB, -- Rich text for functional benefits
  how_to_use JSONB, -- Rich text for usage instructions

  -- Simple Arrays
  function_list TEXT[], -- ["Energy", "Focus", "Detox"]
  best_for TEXT[], -- ["Morning boost", "Post-workout"]

  -- Visual
  label_color TEXT CHECK (label_color IN ('yellow', 'red', 'green')),
  image_url TEXT, -- Supabase Storage URL
  image_alt TEXT,

  -- Stripe Integration
  stripe_product_id TEXT, -- Link to Stripe Product (prod_xxxxx)

  -- Display Control
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 1,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ, -- NULL = draft, NOT NULL = published

  -- Constraints
  CONSTRAINT valid_display_order CHECK (display_order >= 1)
);

-- Indexes
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON public.products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS products_display_order_idx ON public.products(display_order);
CREATE INDEX IF NOT EXISTS products_published_at_idx ON public.products(published_at) WHERE published_at IS NOT NULL;

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view published products
CREATE POLICY "Anyone can view published products"
  ON public.products
  FOR SELECT
  USING (published_at IS NOT NULL AND is_active = TRUE);

-- Admins can manage all products
CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to products"
  ON public.products
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');


-- =====================================================
-- INGREDIENTS TABLE (Replaces Sanity "ingredient" schema)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('fruit', 'root', 'green', 'herb', 'other')),
  seasonality TEXT, -- "Year-round", "Summer", etc.

  -- Rich Content
  function JSONB, -- Rich text for health benefits
  sourcing_story JSONB, -- Rich text for sourcing details
  nutritional_profile TEXT, -- Plain text
  notes TEXT,

  -- Visual
  image_url TEXT,
  image_alt TEXT,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingredients_name_idx ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS ingredients_type_idx ON public.ingredients(type);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Anyone can view ingredients
CREATE POLICY "Anyone can view ingredients"
  ON public.ingredients
  FOR SELECT
  USING (TRUE);

-- Admins can manage ingredients
CREATE POLICY "Admins can manage ingredients"
  ON public.ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- =====================================================
-- PRODUCT_INGREDIENTS (Many-to-Many Relationship)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 1, -- Order ingredients appear in product
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate ingredient per product
  UNIQUE(product_id, ingredient_id),

  -- Constraint
  CONSTRAINT valid_ingredient_order CHECK (display_order >= 1)
);

CREATE INDEX IF NOT EXISTS product_ingredients_product_id_idx ON public.product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS product_ingredients_ingredient_id_idx ON public.product_ingredients(ingredient_id);

ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

-- Anyone can view product ingredients
CREATE POLICY "Anyone can view product ingredients"
  ON public.product_ingredients
  FOR SELECT
  USING (TRUE);

-- Admins can manage product ingredients
CREATE POLICY "Admins can manage product ingredients"
  ON public.product_ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- =====================================================
-- PRODUCT_VARIANTS (Replaces stripeProduct variants)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,

  -- Variant Details
  size_key TEXT NOT NULL, -- "gallon", "half_gallon", "shot"
  label TEXT NOT NULL, -- "1-Gallon Jug"
  stripe_price_id TEXT NOT NULL, -- price_xxxxx

  -- Display
  is_default BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,

  -- Legacy pricing (optional, for display only)
  price_usd NUMERIC(10, 2), -- For display only
  sku TEXT,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_stripe_price_id CHECK (stripe_price_id ~ '^price_[a-zA-Z0-9]+$'),
  CONSTRAINT valid_variant_order CHECK (display_order >= 1)
);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_variants_stripe_price_id_idx ON public.product_variants(stripe_price_id);
CREATE INDEX IF NOT EXISTS product_variants_is_active_idx ON public.product_variants(is_active) WHERE is_active = TRUE;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can view active variants for published products
CREATE POLICY "Anyone can view active variants"
  ON public.product_variants
  FOR SELECT
  USING (
    is_active = TRUE AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_variants.product_id
        AND published_at IS NOT NULL
        AND is_active = TRUE
    )
  );

-- Admins can manage variants
CREATE POLICY "Admins can manage variants"
  ON public.product_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- =====================================================
-- FARMS TABLE (Optional - for ingredient sourcing)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  website TEXT,
  contact_email TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view farms"
  ON public.farms
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage farms"
  ON public.farms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- =====================================================
-- INGREDIENT_FARMS (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ingredient_farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ingredient_id, farm_id)
);

CREATE INDEX IF NOT EXISTS ingredient_farms_ingredient_id_idx ON public.ingredient_farms(ingredient_id);
CREATE INDEX IF NOT EXISTS ingredient_farms_farm_id_idx ON public.ingredient_farms(farm_id);

ALTER TABLE public.ingredient_farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ingredient farms"
  ON public.ingredient_farms
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage ingredient farms"
  ON public.ingredient_farms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_ingredients
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_product_variants
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_farms
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-generate slug from product name
CREATE OR REPLACE FUNCTION public.slugify(text_to_slug TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(text_to_slug, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.name);

    -- Handle duplicate slugs by appending number
    WHILE EXISTS (
      SELECT 1 FROM public.products
      WHERE slug = NEW.slug
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::TEXT;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_slug_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.generate_product_slug();


-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.products IS 'Product catalog for cold-pressed juice blends (replaces Sanity blend schema)';
COMMENT ON TABLE public.ingredients IS 'Ingredient library with sourcing information (replaces Sanity ingredient schema)';
COMMENT ON TABLE public.product_variants IS 'Product size variants with Stripe price IDs (replaces Sanity stripeProduct variants)';
COMMENT ON TABLE public.product_ingredients IS 'Many-to-many relationship between products and ingredients';
COMMENT ON TABLE public.farms IS 'Farm partners for ingredient sourcing';
COMMENT ON TABLE public.ingredient_farms IS 'Many-to-many relationship between ingredients and farms';

COMMENT ON COLUMN public.products.published_at IS 'NULL = draft, NOT NULL = published';
COMMENT ON COLUMN public.products.description IS 'Rich text content stored as Tiptap JSON';
COMMENT ON COLUMN public.products.function_list IS 'Array of benefit keywords like ["Energy", "Focus", "Detox"]';
COMMENT ON COLUMN public.product_variants.stripe_price_id IS 'Stripe Price ID for checkout (price_xxxxx)';
