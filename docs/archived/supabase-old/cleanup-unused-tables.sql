-- DEPRECATED - NÃO UTILIZAR
-- Este script foi incorporado ao bloco de limpeza segura em supabase/schema-unificado.sql
-- Mantido apenas para histórico. Use SEMPRE o schema unificado.
-- =============================================
--
-- =============================================
-- BARCONNECT - SCRIPT DE LIMPEZA
-- =============================================
-- Descrição: Remove tabelas duplicadas não usadas no código
-- Data: 31/10/2025
-- ⚠️ ATENÇÃO: Execute este script APENAS após verificar que
--    as tabelas hotel_* estão VAZIAS ou não são necessárias
-- =============================================

-- =============================================
-- ETAPA 1: VERIFICAÇÃO DE DADOS
-- =============================================
-- Execute estas queries ANTES de deletar para confirmar que está seguro:

DO $$
DECLARE
    hotel_rooms_count INTEGER;
    hotel_guests_count INTEGER;
    hotel_reservations_count INTEGER;
    hotel_room_charges_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 VERIFICANDO DADOS NAS TABELAS...';
    RAISE NOTICE '========================================';
    
    -- Verificar hotel_rooms
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_rooms') THEN
        SELECT COUNT(*) INTO hotel_rooms_count FROM public.hotel_rooms;
        RAISE NOTICE 'hotel_rooms: % registros', hotel_rooms_count;
    ELSE
        RAISE NOTICE 'hotel_rooms: tabela não existe';
    END IF;
    
    -- Verificar hotel_guests
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_guests') THEN
        SELECT COUNT(*) INTO hotel_guests_count FROM public.hotel_guests;
        RAISE NOTICE 'hotel_guests: % registros', hotel_guests_count;
    ELSE
        RAISE NOTICE 'hotel_guests: tabela não existe';
    END IF;
    
    -- Verificar hotel_reservations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_reservations') THEN
        SELECT COUNT(*) INTO hotel_reservations_count FROM public.hotel_reservations;
        RAISE NOTICE 'hotel_reservations: % registros', hotel_reservations_count;
    ELSE
        RAISE NOTICE 'hotel_reservations: tabela não existe';
    END IF;
    
    -- Verificar hotel_room_charges
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_room_charges') THEN
        SELECT COUNT(*) INTO hotel_room_charges_count FROM public.hotel_room_charges;
        RAISE NOTICE 'hotel_room_charges: % registros', hotel_room_charges_count;
    ELSE
        RAISE NOTICE 'hotel_room_charges: tabela não existe';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '⚠️  SE TODAS AS TABELAS ACIMA ESTIVEREM VAZIAS (0 registros),';
    RAISE NOTICE '    você pode prosseguir com a ETAPA 2 (limpeza)';
    RAISE NOTICE '========================================';
END $$;

-- =============================================
-- ETAPA 2: BACKUP (OPCIONAL MAS RECOMENDADO)
-- =============================================
-- Antes de deletar, você pode criar backups:

-- Criar tabelas de backup (descomente se quiser fazer backup):
/*
CREATE TABLE IF NOT EXISTS public.hotel_rooms_backup AS SELECT * FROM public.hotel_rooms;
CREATE TABLE IF NOT EXISTS public.hotel_guests_backup AS SELECT * FROM public.hotel_guests;
CREATE TABLE IF NOT EXISTS public.hotel_reservations_backup AS SELECT * FROM public.hotel_reservations;
CREATE TABLE IF NOT EXISTS public.hotel_room_charges_backup AS SELECT * FROM public.hotel_room_charges;
*/

-- =============================================
-- ETAPA 3: LIMPEZA DAS TABELAS NÃO USADAS
-- =============================================
-- ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
-- Execute APENAS se você confirmou na ETAPA 1 que as tabelas estão vazias

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🗑️  INICIANDO LIMPEZA...';
    RAISE NOTICE '========================================';
    
    -- Dropar hotel_room_charges (depende de hotel_reservations)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_room_charges') THEN
        DROP TABLE IF EXISTS public.hotel_room_charges CASCADE;
        RAISE NOTICE '✅ Removido: hotel_room_charges';
    END IF;
    
    -- Dropar hotel_reservations (depende de hotel_rooms e hotel_guests)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_reservations') THEN
        DROP TABLE IF EXISTS public.hotel_reservations CASCADE;
        RAISE NOTICE '✅ Removido: hotel_reservations';
    END IF;
    
    -- Dropar hotel_guests
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_guests') THEN
        DROP TABLE IF EXISTS public.hotel_guests CASCADE;
        RAISE NOTICE '✅ Removido: hotel_guests';
    END IF;
    
    -- Dropar hotel_rooms
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_rooms') THEN
        DROP TABLE IF EXISTS public.hotel_rooms CASCADE;
        RAISE NOTICE '✅ Removido: hotel_rooms';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 LIMPEZA CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabelas removidas: 4';
    RAISE NOTICE 'Sistema continua funcionando normalmente com:';
    RAISE NOTICE '  - pilgrimages (romarias)';
    RAISE NOTICE '  - rooms (quartos)';
    RAISE NOTICE '  - guests (hóspedes)';
    RAISE NOTICE '  - room_reservations (reservas)';
    RAISE NOTICE '========================================';
END $$;

-- =============================================
-- ETAPA 4: VERIFICAÇÃO PÓS-LIMPEZA
-- =============================================
-- Confirmar que as tabelas foram removidas:

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 VERIFICAÇÃO PÓS-LIMPEZA';
    RAISE NOTICE '========================================';
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_rooms') THEN
        RAISE NOTICE '✅ hotel_rooms: removida';
    ELSE
        RAISE NOTICE '❌ hotel_rooms: ainda existe';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_guests') THEN
        RAISE NOTICE '✅ hotel_guests: removida';
    ELSE
        RAISE NOTICE '❌ hotel_guests: ainda existe';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_reservations') THEN
        RAISE NOTICE '✅ hotel_reservations: removida';
    ELSE
        RAISE NOTICE '❌ hotel_reservations: ainda existe';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotel_room_charges') THEN
        RAISE NOTICE '✅ hotel_room_charges: removida';
    ELSE
        RAISE NOTICE '❌ hotel_room_charges: ainda existe';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- =============================================
-- OBSERVAÇÕES FINAIS
-- =============================================

-- 📌 TABELAS REMOVIDAS (não usadas no código):
--    ❌ hotel_rooms
--    ❌ hotel_guests
--    ❌ hotel_reservations
--    ❌ hotel_room_charges

-- 📌 TABELAS MANTIDAS (usadas ativamente):
--    ✅ pilgrimages (romarias)
--    ✅ rooms (quartos)
--    ✅ guests (hóspedes - histórico)
--    ✅ room_reservations (reservas)

-- 📌 IMPACTO NO CÓDIGO:
--    ✅ Zero impacto - as tabelas removidas não eram usadas
--    ✅ Todos os hooks e componentes continuam funcionando
--    ✅ Sistema mais limpo e organizado

-- 📌 SE PRECISAR REVERTER:
--    Se você fez backup na ETAPA 2, pode restaurar:
--    INSERT INTO hotel_rooms SELECT * FROM hotel_rooms_backup;
--    (e assim por diante para as outras tabelas)

-- =============================================
-- INSTRUÇÕES DE USO
-- =============================================

-- 1. Execute ETAPA 1 primeiro (verificação)
-- 2. Se todas as tabelas estiverem vazias, prossiga
-- 3. (Opcional) Execute ETAPA 2 para fazer backup
-- 4. Execute ETAPA 3 para limpar
-- 5. Execute ETAPA 4 para confirmar

-- OU execute tudo de uma vez se tiver certeza:
-- (todo o script está preparado para isso)
