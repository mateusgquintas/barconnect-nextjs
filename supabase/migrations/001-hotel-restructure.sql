-- =============================================
-- MIGRAÇÃO 001: REESTRUTURAÇÃO DO MÓDULO HOTEL
-- Data: 2025-10-31
-- Objetivo: Normalizar estrutura e permitir escalabilidade
-- =============================================

-- ATENÇÃO: Este script assume que a FASE 2 (limpeza) já foi executada
-- Antes de executar, fazer BACKUP do banco de dados!

BEGIN;

-- =============================================
-- PARTE 1: RENOMEAR TABELA ANTIGA
-- =============================================

-- Renomear tabela rooms para rooms_old (preservar dados)
ALTER TABLE IF EXISTS rooms RENAME TO rooms_old;

RAISE NOTICE '✅ Tabela rooms renomeada para rooms_old';

-- =============================================
-- PARTE 2: CRIAR NOVA ESTRUTURA
-- =============================================

-- 2.1 - TABELA DE QUARTOS (CATÁLOGO FÍSICO)
CREATE TABLE IF NOT EXISTS public.rooms_master (
    number INTEGER PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (type IN ('single', 'double', 'triple', 'suite', 'standard')),
    capacity INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
    floor INTEGER,
    description TEXT,
    daily_rate DECIMAL(10,2) DEFAULT 0 CHECK (daily_rate >= 0),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.rooms_master IS 'Catálogo de quartos físicos do hotel (estrutura permanente)';
COMMENT ON COLUMN public.rooms_master.number IS 'Número do quarto (ex: 101, 102, 201)';
COMMENT ON COLUMN public.rooms_master.type IS 'Tipo: single, double, triple, suite, standard';
COMMENT ON COLUMN public.rooms_master.capacity IS 'Capacidade máxima de pessoas';

-- 2.2 - TABELA DE ALOCAÇÃO DE QUARTOS PARA ROMARIAS
CREATE TABLE IF NOT EXISTS public.pilgrimage_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pilgrimage_id UUID NOT NULL REFERENCES public.pilgrimages(id) ON DELETE CASCADE,
    room_number INTEGER NOT NULL REFERENCES public.rooms_master(number) ON DELETE RESTRICT,
    
    -- Dados do hóspede
    guest_name VARCHAR(100),
    guest_document VARCHAR(30),
    guest_phone VARCHAR(30),
    guest_email VARCHAR(100),
    
    -- Datas e status
    check_in DATE,
    check_out DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'allocated' CHECK (
        status IN ('allocated', 'reserved', 'checked_in', 'checked_out', 'cancelled')
    ),
    
    -- Informações adicionais
    notes TEXT,
    daily_rate DECIMAL(10,2), -- Pode ser diferente da diária padrão (desconto/grupo)
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: não pode alocar mesmo quarto para mesma romaria duas vezes
    UNIQUE(pilgrimage_id, room_number)
);

COMMENT ON TABLE public.pilgrimage_rooms IS 'Alocação de quartos para romarias (relacionamento N:M)';
COMMENT ON COLUMN public.pilgrimage_rooms.status IS 'allocated: alocado | reserved: reservado | checked_in: hospedado | checked_out: finalizado | cancelled: cancelado';

-- Índices para performance
CREATE INDEX idx_pilgrimage_rooms_pilgrimage ON public.pilgrimage_rooms(pilgrimage_id);
CREATE INDEX idx_pilgrimage_rooms_room ON public.pilgrimage_rooms(room_number);
CREATE INDEX idx_pilgrimage_rooms_status ON public.pilgrimage_rooms(status);
CREATE INDEX idx_pilgrimage_rooms_dates ON public.pilgrimage_rooms(check_in, check_out);

RAISE NOTICE '✅ Novas tabelas criadas';

-- =============================================
-- PARTE 3: MIGRAR DADOS DA TABELA ANTIGA
-- =============================================

-- 3.1 - Migrar catálogo de quartos
INSERT INTO public.rooms_master (number, type, description, active)
SELECT DISTINCT 
    number,
    COALESCE(type, 'standard')::VARCHAR(50),
    description,
    true
FROM rooms_old
WHERE number IS NOT NULL
ON CONFLICT (number) DO NOTHING;

RAISE NOTICE '✅ Catálogo de quartos migrado';

-- 3.2 - Migrar alocações atuais (apenas onde tem pilgrimage_id)
INSERT INTO public.pilgrimage_rooms (
    pilgrimage_id,
    room_number,
    guest_name,
    guest_document,
    guest_phone,
    guest_email,
    check_in,
    check_out,
    status,
    notes,
    created_at
)
SELECT 
    pilgrimage_id,
    number,
    guest_name,
    guest_cpf,
    guest_phone,
    guest_email,
    check_in_date,
    check_out_date,
    CASE 
        WHEN status = 'occupied' THEN 'checked_in'
        WHEN status = 'reserved' THEN 'reserved'
        WHEN status = 'available' THEN 'allocated'
        ELSE 'allocated'
    END::VARCHAR(20),
    observations,
    created_at
FROM rooms_old
WHERE pilgrimage_id IS NOT NULL
    AND number IS NOT NULL
ON CONFLICT (pilgrimage_id, room_number) DO NOTHING;

RAISE NOTICE '✅ Alocações de romarias migradas';

-- =============================================
-- PARTE 4: CRIAR VIEW DE COMPATIBILIDADE
-- =============================================

-- View que emula a estrutura antiga para manter código funcionando
CREATE OR REPLACE VIEW public.rooms AS
SELECT 
    gen_random_uuid() as id, -- Gera ID fake para compatibilidade
    rm.number,
    rm.type,
    rm.description,
    CASE 
        WHEN pr.id IS NOT NULL THEN 
            CASE pr.status
                WHEN 'checked_in' THEN 'occupied'
                WHEN 'reserved' THEN 'reserved'
                WHEN 'allocated' THEN 'reserved'
                ELSE 'available'
            END
        ELSE 'available'
    END as status,
    pr.pilgrimage_id,
    pr.guest_name,
    pr.guest_document as guest_cpf,
    pr.guest_phone,
    pr.guest_email,
    pr.check_in as check_in_date,
    pr.check_out as check_out_date,
    pr.notes as observations,
    rm.created_at
FROM rooms_master rm
LEFT JOIN pilgrimage_rooms pr ON rm.number = pr.room_number
    AND pr.status IN ('allocated', 'reserved', 'checked_in')
ORDER BY rm.number;

COMMENT ON VIEW public.rooms IS 'View de compatibilidade - emula estrutura antiga de rooms';

RAISE NOTICE '✅ View de compatibilidade criada';

-- =============================================
-- PARTE 5: TRIGGERS PARA UPDATED_AT
-- =============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rooms_master_updated_at
    BEFORE UPDATE ON public.rooms_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_pilgrimage_rooms_updated_at
    BEFORE UPDATE ON public.pilgrimage_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Triggers criados';

-- =============================================
-- PARTE 6: VALIDAÇÕES
-- =============================================

-- Verificar migração de quartos
DO $$
DECLARE
    total_rooms_old INT;
    total_rooms_new INT;
BEGIN
    SELECT COUNT(DISTINCT number) INTO total_rooms_old FROM rooms_old WHERE number IS NOT NULL;
    SELECT COUNT(*) INTO total_rooms_new FROM rooms_master;
    
    RAISE NOTICE '📊 Quartos na tabela antiga: %', total_rooms_old;
    RAISE NOTICE '📊 Quartos migrados: %', total_rooms_new;
    
    IF total_rooms_old != total_rooms_new THEN
        RAISE WARNING '⚠️  Divergência no número de quartos!';
    END IF;
END $$;

-- Verificar migração de alocações
DO $$
DECLARE
    total_allocations_old INT;
    total_allocations_new INT;
BEGIN
    SELECT COUNT(*) INTO total_allocations_old FROM rooms_old WHERE pilgrimage_id IS NOT NULL;
    SELECT COUNT(*) INTO total_allocations_new FROM pilgrimage_rooms;
    
    RAISE NOTICE '📊 Alocações na tabela antiga: %', total_allocations_old;
    RAISE NOTICE '📊 Alocações migradas: %', total_allocations_new;
    
    IF total_allocations_old != total_allocations_new THEN
        RAISE WARNING '⚠️  Divergência no número de alocações!';
    END IF;
END $$;

-- =============================================
-- FINALIZAÇÃO
-- =============================================

COMMIT;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '🎉 Migração concluída com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Estrutura migrada:';
    RAISE NOTICE '   - rooms_old (preservada)';
    RAISE NOTICE '   - rooms_master (catálogo de quartos)';
    RAISE NOTICE '   - pilgrimage_rooms (alocações)';
    RAISE NOTICE '   - rooms (view de compatibilidade)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Próximos passos:';
    RAISE NOTICE '   1. Testar interface existente';
    RAISE NOTICE '   2. Criar novos hooks (useRoomsMasterDB, usePilgrimageRoomsDB)';
    RAISE NOTICE '   3. Atualizar componentes';
    RAISE NOTICE '   4. Após 1 semana estável, executar: DROP TABLE rooms_old CASCADE;';
END $$;

-- =============================================
-- ROLLBACK (APENAS EM CASO DE EMERGÊNCIA)
-- =============================================
-- Para reverter esta migração, execute:
-- BEGIN;
-- DROP VIEW IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS pilgrimage_rooms CASCADE;
-- DROP TABLE IF EXISTS rooms_master CASCADE;
-- ALTER TABLE IF EXISTS rooms_old RENAME TO rooms;
-- COMMIT;
