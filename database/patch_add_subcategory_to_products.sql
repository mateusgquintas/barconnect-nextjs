-- Patch: add subcategory column to products if missing
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Optional: quick index to speed filtering by subcategory
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
