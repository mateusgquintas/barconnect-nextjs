-- Correção crítica: ajustar tabelas para venda direta funcionar
-- Execute no Supabase SQL Editor

-- 1. Remover trigger problemático temporariamente
DROP TRIGGER IF EXISTS trigger_stock_movement ON public.sale_items;

-- 2. Permitir product_id nulo
ALTER TABLE public.sale_items 
ALTER COLUMN product_id DROP NOT NULL;

-- 3. Adicionar colunas para itens customizados
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS is_custom_item BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_category VARCHAR(100);

-- 4. Atualizar registros existentes
UPDATE public.sale_items 
SET is_custom_item = false 
WHERE is_custom_item IS NULL;

-- 5. Criar trigger simples que funciona com a estrutura atual
CREATE OR REPLACE FUNCTION handle_stock_movement_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Só processa itens não customizados com product_id válido
    IF NEW.product_id IS NOT NULL AND (NEW.is_custom_item IS FALSE OR NEW.is_custom_item IS NULL) THEN
        -- Debitar estoque
        UPDATE public.products
        SET stock = stock - NEW.quantity
        WHERE id = NEW.product_id;
        
        -- Registrar movimento (usando colunas existentes)
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity,
            previous_stock,
            new_stock,
            reason
        ) SELECT 
            NEW.product_id,
            'out',
            NEW.quantity,
            p.stock + NEW.quantity,
            p.stock,
            'Venda #' || NEW.sale_id::text
        FROM public.products p 
        WHERE p.id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Recriar trigger
CREATE TRIGGER trigger_stock_movement
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_stock_movement_simple();

-- 7. Confirmar aplicação
DO $$
BEGIN
    RAISE NOTICE 'Correção aplicada com sucesso!';
    RAISE NOTICE 'Funcionalidades corrigidas:';
    RAISE NOTICE '- sale_items permite product_id NULL';
    RAISE NOTICE '- Adicionadas colunas is_custom_item e custom_category';
    RAISE NOTICE '- Trigger de estoque simplificado e funcional';
    RAISE NOTICE '- Itens customizados não afetam estoque';
END $$;