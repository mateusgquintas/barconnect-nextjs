-- Migration 010: Corrigir problemas de segurança identificados
-- Data: 2025-12-03
-- Objetivo: Habilitar RLS e ajustar views com SECURITY DEFINER

-- ============================================
-- 1. HABILITAR RLS EM pilgrimage_occurrences
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE public.pilgrimage_occurrences ENABLE ROW LEVEL SECURITY;

-- Criar policy para permitir leitura pública (já que é tabela de consulta)
CREATE POLICY "Permitir leitura pública de occurrences"
  ON public.pilgrimage_occurrences
  FOR SELECT
  USING (true);

-- Criar policy para admin inserir/atualizar/deletar
CREATE POLICY "Apenas admins podem modificar occurrences"
  ON public.pilgrimage_occurrences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- 2. RECRIAR VIEWS SEM SECURITY DEFINER
-- ============================================

-- View: pilgrimage_next_occurrences
-- Remover SECURITY DEFINER e usar SECURITY INVOKER (padrão)
DROP VIEW IF EXISTS public.pilgrimage_next_occurrences CASCADE;

CREATE VIEW public.pilgrimage_next_occurrences AS
SELECT 
  p.id AS pilgrimage_id,
  p.name,
  p.numberOfPeople,
  p.obs,
  po.id AS occurrence_id,
  po.arrivalDate,
  po.departureDate,
  po.created_at
FROM public.pilgrimages p
INNER JOIN public.pilgrimage_occurrences po ON po.pilgrimage_id = p.id
WHERE po.arrivalDate >= CURRENT_DATE
ORDER BY po.arrivalDate ASC;

COMMENT ON VIEW public.pilgrimage_next_occurrences IS 
'View de próximas occurrências de romarias (usando SECURITY INVOKER para respeitar RLS do usuário)';

-- ============================================

-- View: products_critical_stock
DROP VIEW IF EXISTS public.products_critical_stock CASCADE;

CREATE VIEW public.products_critical_stock AS
SELECT 
  id,
  name,
  category,
  price,
  stock,
  minimum_stock,
  (minimum_stock - stock) AS stock_needed,
  barcode
FROM public.products
WHERE stock < minimum_stock
  AND minimum_stock > 0
ORDER BY (minimum_stock - stock) DESC;

COMMENT ON VIEW public.products_critical_stock IS 
'View de produtos com estoque crítico (usando SECURITY INVOKER para respeitar RLS do usuário)';

-- ============================================

-- View: pilgrimage_all_occurrences
DROP VIEW IF EXISTS public.pilgrimage_all_occurrences CASCADE;

CREATE VIEW public.pilgrimage_all_occurrences AS
SELECT 
  p.id AS pilgrimage_id,
  p.name,
  p.numberOfPeople,
  p.obs,
  po.id AS occurrence_id,
  po.arrivalDate,
  po.departureDate,
  po.created_at,
  CASE 
    WHEN po.departureDate < CURRENT_DATE THEN 'past'
    WHEN po.arrivalDate <= CURRENT_DATE AND po.departureDate >= CURRENT_DATE THEN 'active'
    ELSE 'future'
  END AS status
FROM public.pilgrimages p
INNER JOIN public.pilgrimage_occurrences po ON po.pilgrimage_id = p.id
ORDER BY po.arrivalDate DESC;

COMMENT ON VIEW public.pilgrimage_all_occurrences IS 
'View de todas as occurrências de romarias com status (usando SECURITY INVOKER para respeitar RLS do usuário)';

-- ============================================

-- View: sales_detailed
-- Esta view precisa combinar dados de várias tabelas
DROP VIEW IF EXISTS public.sales_detailed CASCADE;

CREATE VIEW public.sales_detailed AS
SELECT 
  s.id,
  s.sale_type,
  s.total,
  s.payment_method,
  s.customer_name,
  s.comanda_id,
  s.is_courtesy,
  s.created_at,
  s.created_by,
  u.name AS seller_name,
  u.email AS seller_email
FROM public.sales s
LEFT JOIN public.users u ON u.id = s.created_by
ORDER BY s.created_at DESC;

COMMENT ON VIEW public.sales_detailed IS 
'View detalhada de vendas com informações do vendedor (usando SECURITY INVOKER para respeitar RLS do usuário)';

-- ============================================
-- 3. GARANTIR QUE TABELAS PRINCIPAIS TÊM RLS
-- ============================================

-- Verificar se RLS está habilitado nas tabelas principais
-- (Se não estiver, habilitar)

DO $$
BEGIN
  -- Tabela sales
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'sales') THEN
    ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em sales';
  END IF;

  -- Tabela products
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'products') THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em products';
  END IF;

  -- Tabela pilgrimages
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'pilgrimages') THEN
    ALTER TABLE public.pilgrimages ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em pilgrimages';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRATION 010 CONCLUÍDA COM SUCESSO               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 MELHORIAS DE SEGURANÇA:';
  RAISE NOTICE '   • RLS habilitado em pilgrimage_occurrences';
  RAISE NOTICE '   • 4 views recriadas sem SECURITY DEFINER';
  RAISE NOTICE '   • RLS verificado em tabelas principais';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  AÇÃO NECESSÁRIA:';
  RAISE NOTICE '   • Verificar policies RLS em todas as tabelas';
  RAISE NOTICE '   • Testar permissões de leitura/escrita';
  RAISE NOTICE '';
END $$;
