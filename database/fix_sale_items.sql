-- Correção urgente para sale_items: adicionar suporte a itens customizados
-- Execute no Supabase SQL Editor

-- 1. Permitir product_id nulo para itens customizados
ALTER TABLE public.sale_items 
ALTER COLUMN product_id DROP NOT NULL;

-- 2. Adicionar colunas para itens customizados
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS is_custom_item BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_category VARCHAR(100);

-- 3. Atualizar registros existentes
UPDATE public.sale_items 
SET is_custom_item = false 
WHERE is_custom_item IS NULL;

-- 4. Confirmar mudanças
DO $$
BEGIN
    RAISE NOTICE 'Correção de sale_items aplicada com sucesso!';
    RAISE NOTICE 'Agora a tabela suporta:';
    RAISE NOTICE '- product_id pode ser NULL para itens customizados';
    RAISE NOTICE '- is_custom_item: flag para identificar itens personalizados';
    RAISE NOTICE '- custom_category: categoria de itens personalizados';
END $$;