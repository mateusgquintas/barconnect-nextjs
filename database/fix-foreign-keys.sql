-- ============================================
-- Script para Ajustar Foreign Key Constraints
-- Permitir remoção de comandas após migração para sales
-- ============================================

-- Remover constraint restritiva existente
ALTER TABLE IF EXISTS public.sales 
DROP CONSTRAINT IF EXISTS sales_comanda_id_fkey;

-- Recriar constraint que permite remoção de comandas
-- SET NULL: quando uma comanda for removida, o comanda_id fica NULL em sales
-- Isso preserva o histórico da venda mesmo sem a comanda original
ALTER TABLE public.sales 
ADD CONSTRAINT sales_comanda_id_fkey 
FOREIGN KEY (comanda_id) 
REFERENCES public.comandas(id) 
ON DELETE SET NULL;

-- Confirmar alteração
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key constraint atualizada para permitir remoção de comandas';
    RAISE NOTICE '📝 Vendas mantêm histórico mesmo após remoção da comanda original';
END $$;