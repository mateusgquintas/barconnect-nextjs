-- =============================================
-- LIMPAR DADOS DE TESTE - BarConnect
-- =============================================
-- ATENÇÃO: Este script apaga TODOS os dados das tabelas
-- Use apenas em ambiente de desenvolvimento/teste
-- NÃO execute em produção sem backup!
-- =============================================

-- ORDEM IMPORTANTE: Apagar primeiro as tabelas filhas (com FK) e depois as pais

-- 1) Movimentações de estoque (referencia sales)
DELETE FROM public.stock_movements;

-- 2) Itens de vendas
DELETE FROM public.sale_items;

-- 3) Vendas
DELETE FROM public.sales;

-- 4) Itens de comandas
DELETE FROM public.comanda_items;

-- 5) Comandas
DELETE FROM public.comandas;

-- 6) Transações
DELETE FROM public.transactions;

-- 4) Tabelas de hotel/romarias
DELETE FROM public.room_reservations;
DELETE FROM public.guests;
DELETE FROM public.rooms;
DELETE FROM public.pilgrimages;

-- 5) Produtos (mantém ou apaga conforme necessário)
-- DELETE FROM public.products;  -- Descomente se quiser apagar produtos também

-- 6) Usuários do app (NÃO apaga auth.users, apenas public.users)
-- CUIDADO: Se apagar, terá que recriar os usuários
-- DELETE FROM public.users WHERE username NOT IN ('admin', 'operador');  -- Mantém apenas admin e operador
-- DELETE FROM public.users;  -- Apaga TODOS os usuários do app

-- =============================================
-- VERIFICAÇÃO: Contar registros após limpeza
-- =============================================
SELECT 'sale_items' AS tabela, COUNT(*) AS total FROM public.sale_items
UNION ALL
SELECT 'sales', COUNT(*) FROM public.sales
UNION ALL
SELECT 'comanda_items', COUNT(*) FROM public.comanda_items
UNION ALL
SELECT 'comandas', COUNT(*) FROM public.comandas
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM public.stock_movements
UNION ALL
SELECT 'transactions', COUNT(*) FROM public.transactions
UNION ALL
SELECT 'room_reservations', COUNT(*) FROM public.room_reservations
UNION ALL
SELECT 'guests', COUNT(*) FROM public.guests
UNION ALL
SELECT 'rooms', COUNT(*) FROM public.rooms
UNION ALL
SELECT 'pilgrimages', COUNT(*) FROM public.pilgrimages
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'users', COUNT(*) FROM public.users
ORDER BY tabela;

-- =============================================
-- OPCIONAL: Resetar sequências (IDs voltam para 1)
-- =============================================
-- ALTER SEQUENCE sales_id_seq RESTART WITH 1;
-- ALTER SEQUENCE sale_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE comandas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE comanda_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE stock_movements_id_seq RESTART WITH 1;
-- ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- =============================================
-- FIM: Dados de teste removidos
-- =============================================
