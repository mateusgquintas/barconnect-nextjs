-- =============================
-- SCRIPT DE VALIDAÇÃO DO SCHEMA
-- Execute ANTES de qualquer mudança para validar estrutura atual
-- =============================

-- 1. VERIFICAR SE TABELAS EXISTEM
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('pilgrimages', 'rooms', 'guests', 'room_reservations')
ORDER BY tablename;

-- 2. VERIFICAR ESTRUTURA DA TABELA ROOMS
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'rooms'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA ROOM_RESERVATIONS
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'room_reservations'
ORDER BY ordinal_position;

-- 4. VERIFICAR FOREIGN KEYS
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('rooms', 'room_reservations');

-- 5. VERIFICAR ÍNDICES
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('rooms', 'room_reservations', 'pilgrimages')
ORDER BY tablename, indexname;

-- 6. CONTAR REGISTROS EXISTENTES (NÃO DELETAR DADOS!)
SELECT 
  'rooms' as table_name, 
  COUNT(*) as count 
FROM public.rooms
UNION ALL
SELECT 
  'room_reservations' as table_name, 
  COUNT(*) as count 
FROM public.room_reservations
UNION ALL
SELECT 
  'pilgrimages' as table_name, 
  COUNT(*) as count 
FROM public.pilgrimages;

-- =============================
-- RESULTADO ESPERADO:
-- =============================
-- Se todas as tabelas existirem: OK → Seguir para Fase 3 (Remover conflitante)
-- Se faltarem tabelas: EXECUTAR schema_hotel_romarias.sql primeiro
-- Se houver dados: CUIDADO → Não deletar, apenas adicionar campos se necessário
