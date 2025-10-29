-- ====================================================================
-- SCRIPT DE LIMPEZA DE DADOS TRANSACIONAIS
-- ====================================================================
-- Este script remove APENAS dados transacionais (vendas, comandas, transações)
-- MANTÉM dados fixos: usuários, produtos, quartos, romarias
-- ====================================================================

-- Desabilitar temporariamente triggers e constraints
SET session_replication_role = 'replica';

-- ====================================================================
-- 1. LIMPAR DADOS DE VENDAS E COMANDAS (PDV/Bar)
-- ====================================================================

-- Limpar itens de vendas (filho de sales)
DELETE FROM public.sale_items;
SELECT 'sale_items: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.sale_items LIMIT 0) as t;

-- Limpar vendas
DELETE FROM public.sales;
SELECT 'sales: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.sales LIMIT 0) as t;

-- Limpar itens de comandas (filho de comandas)
DELETE FROM public.comanda_items;
SELECT 'comanda_items: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.comanda_items LIMIT 0) as t;

-- Limpar comandas
DELETE FROM public.comandas;
SELECT 'comandas: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.comandas LIMIT 0) as t;

-- ====================================================================
-- 2. LIMPAR TRANSAÇÕES FINANCEIRAS
-- ====================================================================

-- Limpar todas as transações (entradas/saídas)
DELETE FROM public.transactions;
SELECT 'transactions: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.transactions LIMIT 0) as t;

-- ====================================================================
-- 3. LIMPAR MOVIMENTAÇÕES DE ESTOQUE
-- ====================================================================

-- Limpar movimentações de estoque
DELETE FROM public.stock_movements;
SELECT 'stock_movements: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.stock_movements LIMIT 0) as t;

-- ====================================================================
-- 4. LIMPAR RESERVAS E HÓSPEDES (Hotel - dados temporários)
-- ====================================================================

-- Limpar cobranças de quartos
DELETE FROM public.hotel_room_charges;
SELECT 'hotel_room_charges: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.hotel_room_charges LIMIT 0) as t;

-- Limpar reservas de hotel
DELETE FROM public.hotel_reservations;
SELECT 'hotel_reservations: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.hotel_reservations LIMIT 0) as t;

-- Limpar hóspedes
DELETE FROM public.hotel_guests;
SELECT 'hotel_guests: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.hotel_guests LIMIT 0) as t;

-- ====================================================================
-- 5. LIMPAR RESERVAS DE ROMARIAS (dados temporários)
-- ====================================================================

-- Limpar reservas de romarias
DELETE FROM public.room_reservations;
SELECT 'room_reservations: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.room_reservations LIMIT 0) as t;

-- Limpar hóspedes de romarias
DELETE FROM public.guests;
SELECT 'guests: ' || COUNT(*) || ' registros removidos' FROM (SELECT 1 FROM public.guests LIMIT 0) as t;

-- ====================================================================
-- 6. RESETAR CONTADORES DE ESTOQUE (OPCIONAL)
-- ====================================================================

-- Resetar quantidade em estoque de produtos para o valor inicial
-- DESCOMENTE a linha abaixo se quiser resetar estoque para 0
-- UPDATE public.products SET stock_quantity = 0 WHERE stock_quantity > 0;

-- ====================================================================
-- 7. REABILITAR CONSTRAINTS E TRIGGERS
-- ====================================================================

SET session_replication_role = 'origin';

-- ====================================================================
-- 8. VACUUM PARA RECUPERAR ESPAÇO
-- ====================================================================

VACUUM ANALYZE public.sale_items;
VACUUM ANALYZE public.sales;
VACUUM ANALYZE public.comanda_items;
VACUUM ANALYZE public.comandas;
VACUUM ANALYZE public.transactions;
VACUUM ANALYZE public.stock_movements;
VACUUM ANALYZE public.hotel_room_charges;
VACUUM ANALYZE public.hotel_reservations;
VACUUM ANALYZE public.hotel_guests;
VACUUM ANALYZE public.room_reservations;
VACUUM ANALYZE public.guests;

-- ====================================================================
-- RESUMO DO QUE FOI MANTIDO:
-- ====================================================================
-- ✅ users (login/autenticação)
-- ✅ products (catálogo de produtos)
-- ✅ hotel_rooms (quartos do hotel)
-- ✅ rooms (quartos de romarias)
-- ✅ pilgrimages (romarias cadastradas)
--
-- RESUMO DO QUE FOI REMOVIDO:
-- ====================================================================
-- ❌ sales + sale_items (vendas do PDV)
-- ❌ comandas + comanda_items (comandas do bar)
-- ❌ transactions (entradas/saídas financeiras)
-- ❌ stock_movements (movimentações de estoque)
-- ❌ hotel_reservations + hotel_guests + hotel_room_charges (hotel)
-- ❌ room_reservations + guests (reservas de romarias)
-- ====================================================================

SELECT '✅ LIMPEZA DE DADOS TRANSACIONAIS CONCLUÍDA COM SUCESSO!' as status;
SELECT 'Dados fixos mantidos: users, products, hotel_rooms, rooms, pilgrimages' as info;
