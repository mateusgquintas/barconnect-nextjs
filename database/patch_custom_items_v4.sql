-- BarConnect - Patch V4: Suporte para itens personalizados e controle de estoque
-- Execute no Supabase SQL Editor para adicionar funcionalidades de itens customizados

-- =============================================
-- 1. ADICIONAR COLUNA track_stock NA TABELA products
-- =============================================

-- Adiciona flag para controlar se o produto tem estoque ou não
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT true;

-- Atualiza produtos existentes para rastrear estoque por padrão
UPDATE public.products SET track_stock = true WHERE track_stock IS NULL;

-- Cria índice para performance em consultas de produtos sem estoque
CREATE INDEX IF NOT EXISTS idx_products_track_stock ON public.products(track_stock) WHERE track_stock = false;

-- =============================================
-- 2. MODIFICAR TABELA sale_items PARA PERMITIR product_id NULO
-- =============================================

-- Remove constraint de NOT NULL do product_id para permitir itens personalizados
ALTER TABLE public.sale_items 
ALTER COLUMN product_id DROP NOT NULL;

-- Adiciona colunas para metadados de itens personalizados
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS is_custom_item BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_category VARCHAR(100);

-- Cria índice para performance em consultas de itens customizados
CREATE INDEX IF NOT EXISTS idx_sale_items_custom ON public.sale_items(is_custom_item) WHERE is_custom_item = true;

-- =============================================
-- 3. ATUALIZAR FUNÇÃO DE CONTROLE DE ESTOQUE
-- =============================================

-- Remove função existente se houver
DROP FUNCTION IF EXISTS handle_stock_movement() CASCADE;

-- Cria nova função que considera track_stock e itens personalizados
CREATE OR REPLACE FUNCTION handle_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Só processa se for INSERT (nova venda)
    IF TG_OP = 'INSERT' THEN
        -- Verifica se o item tem product_id válido e deve rastrear estoque
        IF NEW.product_id IS NOT NULL THEN
            -- Verifica se o produto deve rastrear estoque
            IF EXISTS (
                SELECT 1 FROM public.products 
                WHERE id = NEW.product_id 
                AND track_stock = true
            ) THEN
                -- Debita estoque do produto
                UPDATE public.products
                SET 
                    stock = stock - NEW.quantity,
                    updated_at = NOW()
                WHERE id = NEW.product_id;
                
                -- Registra movimento de estoque (saída)
                INSERT INTO public.stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    reference_type,
                    reference_id,
                    notes
                ) VALUES (
                    NEW.product_id,
                    'out',
                    NEW.quantity,
                    'sale',
                    NEW.sale_id,
                    'Venda - ' || NEW.product_name
                );
            END IF;
        END IF;
        -- Para itens customizados (product_id IS NULL), não faz nada no estoque
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recria trigger com nova função
DROP TRIGGER IF EXISTS trigger_stock_movement ON public.sale_items;
CREATE TRIGGER trigger_stock_movement
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_stock_movement();

-- =============================================
-- 4. ADICIONAR COLUNA subcategory SE NÃO EXISTIR
-- =============================================

-- Garante que a coluna subcategory existe (pode já ter sido criada)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Cria índice composto para category + subcategory
CREATE INDEX IF NOT EXISTS idx_products_category_subcategory 
ON public.products(category, subcategory) WHERE active = true;

-- =============================================
-- 5. ATUALIZAR VIEW sales_detailed PARA ITENS CUSTOMIZADOS
-- =============================================

-- Remove view existente
DROP VIEW IF EXISTS sales_detailed;

-- Cria view atualizada que considera itens customizados
CREATE OR REPLACE VIEW sales_detailed AS
SELECT 
    s.id as sale_id,
    s.sale_type,
    s.total,
    s.payment_method,
    s.is_courtesy,
    s.customer_name,
    s.created_at,
    DATE(s.created_at) as sale_date,
    TO_CHAR(s.created_at, 'HH24:MI') as sale_time,
    c.number as comanda_number,
    c.table_number,
    -- Items detalhados (incluindo customizados)
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'product_id', si.product_id,
                'product_name', si.product_name,
                'price', si.product_price,
                'quantity', si.quantity,
                'subtotal', si.subtotal,
                'is_custom', si.is_custom_item,
                'custom_category', si.custom_category
            )
        ) FILTER (WHERE si.id IS NOT NULL), 
        '[]'::JSON
    ) as items
FROM public.sales s
LEFT JOIN public.comandas c ON s.comanda_id = c.id
LEFT JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY 
    s.id, s.sale_type, s.total, s.payment_method, s.is_courtesy, 
    s.customer_name, s.created_at, c.number, c.table_number
ORDER BY s.created_at DESC;

-- =============================================
-- 6. FUNÇÃO AUXILIAR PARA CRIAR ITEM PERSONALIZADO
-- =============================================

CREATE OR REPLACE FUNCTION create_custom_sale_item(
    p_sale_id UUID,
    p_name VARCHAR(255),
    p_price DECIMAL(10,2),
    p_quantity INTEGER,
    p_category VARCHAR(100) DEFAULT 'outros'
)
RETURNS UUID AS $$
DECLARE
    v_item_id UUID;
BEGIN
    -- Valida parâmetros
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantidade deve ser maior que zero';
    END IF;
    
    IF p_price < 0 THEN
        RAISE EXCEPTION 'Preço não pode ser negativo';
    END IF;
    
    -- Cria item personalizado
    INSERT INTO public.sale_items (
        sale_id,
        product_id,
        product_name,
        product_price,
        quantity,
        is_custom_item,
        custom_category
    ) VALUES (
        p_sale_id,
        NULL, -- product_id nulo indica item personalizado
        p_name,
        p_price,
        p_quantity,
        true,
        p_category
    ) RETURNING id INTO v_item_id;
    
    RETURN v_item_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. CONFIRMAR APLICAÇÃO DO PATCH
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Patch V4 aplicado com sucesso!';
    RAISE NOTICE 'Funcionalidades adicionadas:';
    RAISE NOTICE '- Coluna track_stock em products (controle de rastreamento de estoque)';
    RAISE NOTICE '- Suporte a itens personalizados em sale_items (product_id nulo)';
    RAISE NOTICE '- Trigger de estoque atualizado para considerar track_stock e itens customizados';
    RAISE NOTICE '- View sales_detailed atualizada para itens customizados';
    RAISE NOTICE '- Função create_custom_sale_item() para facilitar criação de itens personalizados';
END $$;