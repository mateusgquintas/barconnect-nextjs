-- =============================================
-- VERIFICAÇÃO DE TABELAS E DADOS
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. VERIFICAR QUAIS TABELAS EXISTEM
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. CONTAR REGISTROS EM CADA TABELA
SELECT 
  'comandas' as tabela,
  COUNT(*) as total_registros
FROM comandas
UNION ALL
SELECT 'comanda_items', COUNT(*) FROM comanda_items
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM stock_movements
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'pilgrimages', COUNT(*) FROM pilgrimages
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms;

-- 3. VERIFICAR SE TABELAS HOTEL_* EXISTEM E TÊM DADOS
DO $$
DECLARE
  tabela TEXT;
  total INT;
BEGIN
  FOR tabela IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'hotel_%'
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', tabela) INTO total;
    RAISE NOTICE 'Tabela: % | Registros: %', tabela, total;
  END LOOP;
END $$;

-- 4. VERIFICAR SE GUESTS E ROOM_RESERVATIONS EXISTEM
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guests') THEN
    RAISE NOTICE 'Tabela GUESTS existe';
    PERFORM COUNT(*) FROM guests;
    RAISE NOTICE 'Total de registros em GUESTS: %', (SELECT COUNT(*) FROM guests);
  ELSE
    RAISE NOTICE 'Tabela GUESTS não existe';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'room_reservations') THEN
    RAISE NOTICE 'Tabela ROOM_RESERVATIONS existe';
    PERFORM COUNT(*) FROM room_reservations;
    RAISE NOTICE 'Total de registros em ROOM_RESERVATIONS: %', (SELECT COUNT(*) FROM room_reservations);
  ELSE
    RAISE NOTICE 'Tabela ROOM_RESERVATIONS não existe';
  END IF;
END $$;

-- 5. VERIFICAR ESTRUTURA DA TABELA ROOMS
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'rooms'
ORDER BY ordinal_position;

-- 6. VERIFICAR FOREIGN KEYS
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
