-- ====================================================================
-- BARCONNECT - LIMPEZA DE DADOS TRANSACIONAIS
-- ====================================================================
-- Versão: 1.0
-- Data: 2025-10-31
-- Descrição: Remove APENAS dados transacionais (vendas, comandas, 
--            transações, reservas, bookings)
--            MANTÉM dados fixos (usuários, produtos, quartos, romarias)
-- 
-- Use este script para limpar dados de teste ou resetar transações
-- sem perder configurações e cadastros básicos
-- ====================================================================

-- =============================================
-- AVISO DE SEGURANÇA
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '====================================================================';
    RAISE NOTICE '⚠️  ATENÇÃO - OPERAÇÃO DESTRUTIVA';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'Este script irá REMOVER PERMANENTEMENTE:';
    RAISE NOTICE '  → Todas as vendas e itens de vendas';
    RAISE NOTICE '  → Todas as comandas e itens de comandas';
    RAISE NOTICE '  → Todas as transações financeiras';
    RAISE NOTICE '  → Todas as movimentações de estoque';
    RAISE NOTICE '  → Todas as reservas de hotel e cobranças';
    RAISE NOTICE '  → Todos os hóspedes';
    RAISE NOTICE '  → Todas as reservas de romarias';
    RAISE NOTICE '  → Todos os bookings da agenda';
    RAISE NOTICE '';
    RAISE NOTICE 'SERÃO MANTIDOS:';
    RAISE NOTICE '  ✓ Usuários';
    RAISE NOTICE '  ✓ Produtos (catálogo)';
    RAISE NOTICE '  ✓ Quartos de hotel';
    RAISE NOTICE '  ✓ Quartos de agenda/romarias';
    RAISE NOTICE '  ✓ Romarias cadastradas';
    RAISE NOTICE '';
    RAISE NOTICE 'Prosseguindo em 3 segundos...';
    RAISE NOTICE '====================================================================';
    PERFORM pg_sleep(3);
END $$;

-- =============================================
-- DESABILITAR TRIGGERS TEMPORARIAMENTE
-- =============================================

SET session_replication_role = 'replica';

-- =============================================
-- 1. LIMPAR BOOKINGS DA AGENDA
-- =============================================

DELETE FROM public.bookings;

-- =============================================
-- 2. LIMPAR MÓDULO DE VENDAS E COMANDAS (PDV/BAR)
-- =============================================

-- Limpar itens de vendas (filho de sales)
DELETE FROM public.sale_items;

-- Limpar vendas
DELETE FROM public.sales;

-- Limpar itens de comandas (filho de comandas)
DELETE FROM public.comanda_items;

-- Limpar comandas
DELETE FROM public.comandas;

-- =============================================
-- 3. LIMPAR TRANSAÇÕES FINANCEIRAS
-- =============================================

DELETE FROM public.transactions;

-- =============================================
-- 4. LIMPAR MOVIMENTAÇÕES DE ESTOQUE
-- =============================================

DELETE FROM public.stock_movements;

-- =============================================
-- 5. LIMPAR RESERVAS E HÓSPEDES DO HOTEL
-- =============================================

-- Limpar cobranças de quartos
DELETE FROM public.hotel_room_charges;

-- Limpar reservas de hotel
DELETE FROM public.hotel_reservations;

-- Limpar hóspedes do hotel
DELETE FROM public.hotel_guests;

-- =============================================
-- 6. LIMPAR RESERVAS DE ROMARIAS
-- =============================================

-- Limpar reservas de romarias
DELETE FROM public.room_reservations;

-- Limpar hóspedes de romarias
DELETE FROM public.guests;

-- =============================================
-- 7. RESETAR STATUS DOS QUARTOS (OPCIONAL)
-- =============================================

-- Resetar status dos quartos de hotel para available
UPDATE public.hotel_rooms 
SET status = 'available', updated_at = NOW()
WHERE status != 'maintenance';

-- Resetar status dos quartos de agenda/romarias
UPDATE public.rooms 
SET status = 'available',
    pilgrimage_id = NULL,
    guest_name = NULL,
    guest_cpf = NULL,
    guest_phone = NULL,
    guest_email = NULL,
    check_in_date = NULL,
    check_out_date = NULL,
    observations = NULL
WHERE status IN ('occupied', 'reserved');

-- =============================================
-- 8. RESETAR ESTOQUE DE PRODUTOS (OPCIONAL)
-- =============================================
-- Descomente as linhas abaixo se quiser resetar o estoque para valores padrão
-- ATENÇÃO: Isso irá zerar o estoque de todos os produtos que rastreiam estoque!

/*
UPDATE public.products 
SET stock = 0, updated_at = NOW()
WHERE track_stock = true;
*/

-- Ou, para resetar para valores específicos:
/*
UPDATE public.products 
SET stock = min_stock * 3, updated_at = NOW()
WHERE track_stock = true;
*/

-- =============================================
-- 9. REABILITAR TRIGGERS
-- =============================================

SET session_replication_role = 'origin';

-- =============================================
-- 10. VACUUM PARA RECUPERAR ESPAÇO
-- =============================================

VACUUM ANALYZE public.bookings;
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

-- =============================================
-- MENSAGEM DE CONFIRMAÇÃO
-- =============================================

DO $$
DECLARE
    user_count INTEGER;
    product_count INTEGER;
    hotel_room_count INTEGER;
    room_count INTEGER;
    pilgrimage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO hotel_room_count FROM public.hotel_rooms;
    SELECT COUNT(*) INTO room_count FROM public.rooms;
    SELECT COUNT(*) INTO pilgrimage_count FROM public.pilgrimages;
    
    RAISE NOTICE '====================================================================';
    RAISE NOTICE '✅ LIMPEZA DE DADOS TRANSACIONAIS CONCLUÍDA!';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Dados REMOVIDOS:';
    RAISE NOTICE '  ✗ Todas as vendas, comandas e transações';
    RAISE NOTICE '  ✗ Todas as movimentações de estoque';
    RAISE NOTICE '  ✗ Todas as reservas e hóspedes';
    RAISE NOTICE '  ✗ Todos os bookings da agenda';
    RAISE NOTICE '';
    RAISE NOTICE 'Dados MANTIDOS:';
    RAISE NOTICE '  ✓ % usuários', user_count;
    RAISE NOTICE '  ✓ % produtos', product_count;
    RAISE NOTICE '  ✓ % quartos de hotel', hotel_room_count;
    RAISE NOTICE '  ✓ % quartos de agenda/romarias', room_count;
    RAISE NOTICE '  ✓ % romarias', pilgrimage_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Status dos quartos resetado para "available"';
    RAISE NOTICE 'Sistema pronto para novas operações!';
    RAISE NOTICE '====================================================================';
END $$;

-- Fim do script
