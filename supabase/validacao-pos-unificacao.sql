-- =============================================
-- VALIDAÇÃO PÓS-APLICAÇÃO DO SCHEMA UNIFICADO
-- =============================================
-- Execute este script APÓS rodar schema-unificado.sql
-- Verifica se todas as tabelas, índices, views e triggers foram criados corretamente
-- =============================================

SELECT '=== VALIDAÇÃO DO SCHEMA UNIFICADO ===' AS info;
SELECT '' AS info;

-- =============================================
-- 1. VERIFICAR TABELAS PRINCIPAIS
-- =============================================
SELECT '1. Verificando existência das tabelas...' AS info;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN '✅ users' 
    ELSE '❌ users FALTANDO' 
  END as resultado
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN '✅ products' ELSE '❌ products FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comandas') THEN '✅ comandas' ELSE '❌ comandas FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comanda_items') THEN '✅ comanda_items' ELSE '❌ comanda_items FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales') THEN '✅ sales' ELSE '❌ sales FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sale_items') THEN '✅ sale_items' ELSE '❌ sale_items FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN '✅ transactions' ELSE '❌ transactions FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_movements') THEN '✅ stock_movements' ELSE '❌ stock_movements FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pilgrimages') THEN '✅ pilgrimages' ELSE '❌ pilgrimages FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rooms') THEN '✅ rooms' ELSE '❌ rooms FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guests') THEN '✅ guests' ELSE '❌ guests FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'room_reservations') THEN '✅ room_reservations' ELSE '❌ room_reservations FALTANDO' END;

SELECT '' AS info;

-- =============================================
-- 2. VERIFICAR TABELAS DUPLICADAS (hotel_*)
-- =============================================
SELECT '2. Verificando se tabelas duplicadas foram removidas/renomeadas...' AS info;

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hotel_rooms') 
    THEN '✅ hotel_rooms removida/renomeada' 
    ELSE '⚠️ hotel_rooms ainda existe' 
  END as resultado
UNION ALL
SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hotel_guests') THEN '✅ hotel_guests removida/renomeada' ELSE '⚠️ hotel_guests ainda existe' END
UNION ALL
SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hotel_reservations') THEN '✅ hotel_reservations removida/renomeada' ELSE '⚠️ hotel_reservations ainda existe' END
UNION ALL
SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hotel_room_charges') THEN '✅ hotel_room_charges removida/renomeada' ELSE '⚠️ hotel_room_charges ainda existe' END;

SELECT '' AS info;

-- =============================================
-- 3. VERIFICAR VIEWS
-- =============================================
SELECT '3. Verificando views...' AS info;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'sales_detailed') 
    THEN '✅ sales_detailed' 
    ELSE '❌ sales_detailed FALTANDO' 
  END as resultado
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'products_critical_stock') THEN '✅ products_critical_stock' ELSE '❌ products_critical_stock FALTANDO' END;

SELECT '' AS info;

-- =============================================
-- 4. VERIFICAR TRIGGERS
-- =============================================
SELECT '4. Verificando triggers...' AS info;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = 'comanda_items' 
        AND trigger_name = 'trigger_update_comanda_total'
    ) 
    THEN '✅ trigger_update_comanda_total' 
    ELSE '❌ trigger_update_comanda_total FALTANDO' 
  END as resultado
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = 'sale_items' 
        AND trigger_name = 'trigger_stock_movement'
    ) 
    THEN '✅ trigger_stock_movement' 
    ELSE '❌ trigger_stock_movement FALTANDO' 
  END;

SELECT '' AS info;

-- =============================================
-- 5. CONTAR REGISTROS (RESUMO)
-- =============================================
SELECT '5. Resumo de registros nas tabelas...' AS info;

SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'comandas', COUNT(*) FROM comandas
UNION ALL
SELECT 'comanda_items', COUNT(*) FROM comanda_items
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM stock_movements
UNION ALL
SELECT 'pilgrimages', COUNT(*) FROM pilgrimages
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'guests', COUNT(*) FROM guests
UNION ALL
SELECT 'room_reservations', COUNT(*) FROM room_reservations
ORDER BY tabela;

SELECT '' AS info;

-- =============================================
-- 6. VERIFICAR ÍNDICES CRÍTICOS
-- =============================================
SELECT '6. Verificando alguns índices críticos...' AS info;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename = 'comandas' 
        AND indexname = 'idx_comandas_unique_number_open'
    ) 
    THEN '✅ idx_comandas_unique_number_open' 
    ELSE '❌ idx_comandas_unique_number_open FALTANDO' 
  END as resultado
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'products' AND indexname = 'idx_products_barcode_unique') THEN '✅ idx_products_barcode_unique' ELSE '❌ idx_products_barcode_unique FALTANDO' END
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'rooms' AND indexname = 'idx_rooms_number') THEN '✅ idx_rooms_number (unique)' ELSE '❌ idx_rooms_number FALTANDO' END;

SELECT '' AS info;

-- =============================================
-- 7. VERIFICAR FOREIGN KEYS PRINCIPAIS
-- =============================================
SELECT '7. Verificando algumas foreign keys...' AS info;

SELECT 
  COUNT(*) as fks_comanda_items
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' 
  AND table_name = 'comanda_items' 
  AND constraint_type = 'FOREIGN KEY';

SELECT 
  COUNT(*) as fks_sale_items
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' 
  AND table_name = 'sale_items' 
  AND constraint_type = 'FOREIGN KEY';

SELECT 
  COUNT(*) as fks_room_reservations
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' 
  AND table_name = 'room_reservations' 
  AND constraint_type = 'FOREIGN KEY';

SELECT '' AS info;

-- =============================================
-- 8. VERIFICAR STATUS DE RLS (Row Level Security)
-- =============================================
SELECT '8. Verificando RLS (Row Level Security)...' AS info;

SELECT c.relname AS tabela,
       CASE WHEN c.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END AS rls,
       CASE WHEN c.relforcerowsecurity THEN 'FORCED' ELSE 'NOT_FORCED' END AS rls_force
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'users','products','comandas','comanda_items','sales','sale_items',
    'transactions','stock_movements','pilgrimages','rooms','guests','room_reservations'
  )
ORDER BY c.relname;

SELECT '' AS info;

-- =============================================
-- 8. RESULTADO FINAL
-- =============================================
SELECT '=== VALIDAÇÃO CONCLUÍDA ===' AS info;
SELECT '' AS info;
SELECT 'Se todas as verificações acima mostraram ✅, o schema unificado foi aplicado com sucesso!' AS info;
SELECT 'Se algum item mostrou ❌, revise o script schema-unificado.sql e reaplique.' AS info;
SELECT '' AS info;
