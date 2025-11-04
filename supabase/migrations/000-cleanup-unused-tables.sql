-- =============================================
-- LIMPEZA DE TABELAS NÃO UTILIZADAS
-- Data: 2025-10-31
-- Objetivo: Remover tabelas duplicadas que não são usadas no código
-- =============================================

-- ATENÇÃO: 
-- 1. Fazer BACKUP antes de executar!
-- 2. Executar supabase/verificar-tabelas.sql ANTES
-- 3. Só executar se as tabelas estiverem VAZIAS (0 registros)

BEGIN;

-- =============================================
-- VERIFICAÇÕES DE SEGURANÇA
-- =============================================

DO $$
DECLARE
    count_hotel_rooms INT := 0;
    count_hotel_guests INT := 0;
    count_hotel_reservations INT := 0;
    count_hotel_charges INT := 0;
    count_guests INT := 0;
    can_proceed BOOLEAN := true;
BEGIN
    -- Verificar se tabelas existem e contar registros
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hotel_rooms') THEN
        SELECT COUNT(*) INTO count_hotel_rooms FROM hotel_rooms;
        RAISE NOTICE '📊 hotel_rooms: % registros', count_hotel_rooms;
        IF count_hotel_rooms > 0 THEN
            RAISE WARNING '⚠️  hotel_rooms tem dados! Não é seguro deletar.';
            can_proceed := false;
        END IF;
    ELSE
        RAISE NOTICE '✅ hotel_rooms não existe';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hotel_guests') THEN
        SELECT COUNT(*) INTO count_hotel_guests FROM hotel_guests;
        RAISE NOTICE '📊 hotel_guests: % registros', count_hotel_guests;
        IF count_hotel_guests > 0 THEN
            RAISE WARNING '⚠️  hotel_guests tem dados! Não é seguro deletar.';
            can_proceed := false;
        END IF;
    ELSE
        RAISE NOTICE '✅ hotel_guests não existe';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hotel_reservations') THEN
        SELECT COUNT(*) INTO count_hotel_reservations FROM hotel_reservations;
        RAISE NOTICE '📊 hotel_reservations: % registros', count_hotel_reservations;
        IF count_hotel_reservations > 0 THEN
            RAISE WARNING '⚠️  hotel_reservations tem dados! Não é seguro deletar.';
            can_proceed := false;
        END IF;
    ELSE
        RAISE NOTICE '✅ hotel_reservations não existe';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hotel_room_charges') THEN
        SELECT COUNT(*) INTO count_hotel_charges FROM hotel_room_charges;
        RAISE NOTICE '📊 hotel_room_charges: % registros', count_hotel_charges;
        IF count_hotel_charges > 0 THEN
            RAISE WARNING '⚠️  hotel_room_charges tem dados! Não é seguro deletar.';
            can_proceed := false;
        END IF;
    ELSE
        RAISE NOTICE '✅ hotel_room_charges não existe';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guests') THEN
        SELECT COUNT(*) INTO count_guests FROM guests;
        RAISE NOTICE '📊 guests: % registros', count_guests;
        IF count_guests > 0 THEN
            RAISE WARNING '⚠️  guests tem dados! Não é seguro deletar.';
            can_proceed := false;
        END IF;
    ELSE
        RAISE NOTICE '✅ guests não existe';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════';
    
    IF NOT can_proceed THEN
        RAISE EXCEPTION '🛑 ABORTANDO: Existem tabelas com dados. Não é seguro prosseguir.';
    ELSE
        RAISE NOTICE '✅ Todas as verificações passaram. Prosseguindo com limpeza...';
    END IF;
END $$;

-- =============================================
-- LIMPEZA DE TABELAS HOTEL_* (NÃO USADAS NO CÓDIGO)
-- =============================================

-- Remover tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS public.hotel_room_charges CASCADE;
RAISE NOTICE '🗑️  Removida: hotel_room_charges';

DROP TABLE IF EXISTS public.hotel_reservations CASCADE;
RAISE NOTICE '🗑️  Removida: hotel_reservations';

DROP TABLE IF EXISTS public.hotel_guests CASCADE;
RAISE NOTICE '🗑️  Removida: hotel_guests';

DROP TABLE IF EXISTS public.hotel_rooms CASCADE;
RAISE NOTICE '🗑️  Removida: hotel_rooms';

-- =============================================
-- LIMPEZA DA TABELA GUESTS (ANÁLISE ESPECIAL)
-- =============================================

-- Verificar se guests é referenciada por room_reservations
DO $$
DECLARE
    count_references INT := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'room_reservations') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'room_reservations' AND column_name = 'guest_id'
        ) THEN
            SELECT COUNT(*) INTO count_references 
            FROM room_reservations 
            WHERE guest_id IS NOT NULL;
            
            RAISE NOTICE '📊 room_reservations usando guest_id: % registros', count_references;
            
            IF count_references > 0 THEN
                RAISE NOTICE '⚠️  guests está sendo referenciada. Mantendo tabela.';
            ELSE
                DROP TABLE IF EXISTS public.guests CASCADE;
                RAISE NOTICE '🗑️  Removida: guests (não referenciada)';
            END IF;
        ELSE
            DROP TABLE IF EXISTS public.guests CASCADE;
            RAISE NOTICE '🗑️  Removida: guests (coluna guest_id não existe)';
        END IF;
    ELSE
        DROP TABLE IF EXISTS public.guests CASCADE;
        RAISE NOTICE '🗑️  Removida: guests (room_reservations não existe)';
    END IF;
END $$;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '✅ Limpeza concluída com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tabelas removidas:';
    RAISE NOTICE '   - hotel_room_charges';
    RAISE NOTICE '   - hotel_reservations';
    RAISE NOTICE '   - hotel_guests';
    RAISE NOTICE '   - hotel_rooms';
    RAISE NOTICE '   - guests (condicional)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tabelas mantidas (usadas no código):';
    RAISE NOTICE '   - pilgrimages ✅';
    RAISE NOTICE '   - rooms ✅';
    RAISE NOTICE '   - room_reservations ✅ (se existir)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximo passo: Executar migração 001-hotel-restructure.sql';
END $$;

COMMIT;

-- =============================================
-- ROLLBACK (SE NECESSÁRIO)
-- =============================================
-- ⚠️  CUIDADO: Só funciona se você tiver backup dos dados!
-- Para reverter, você precisa recriar as tabelas e importar o backup
-- Não há como desfazer DROP TABLE sem backup prévio!
