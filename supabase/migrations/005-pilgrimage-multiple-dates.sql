-- =============================================
-- Migration: Suporte a Múltiplas Datas para Romarias
-- Descrição: Permite que uma romaria tenha múltiplas ocorrências/datas
-- Autor: Sistema BarConnect
-- Data: 2025-11-26
-- =============================================

-- PARTE 1: CRIAR NOVA TABELA DE OCORRÊNCIAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.pilgrimage_occurrences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pilgrimage_id UUID NOT NULL REFERENCES public.pilgrimages(id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'active', 'completed', 'cancelled')
    ),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: data de partida deve ser >= data de chegada
    CONSTRAINT valid_date_range CHECK (departure_date >= arrival_date)
);

-- Índices para performance
CREATE INDEX idx_pilgrimage_occurrences_pilgrimage ON public.pilgrimage_occurrences(pilgrimage_id);
CREATE INDEX idx_pilgrimage_occurrences_dates ON public.pilgrimage_occurrences(arrival_date, departure_date);
CREATE INDEX idx_pilgrimage_occurrences_status ON public.pilgrimage_occurrences(status);

COMMENT ON TABLE public.pilgrimage_occurrences IS 'Ocorrências/datas múltiplas de uma romaria (para planejamento de longo prazo)';
COMMENT ON COLUMN public.pilgrimage_occurrences.status IS 'scheduled: agendado | active: em andamento | completed: finalizado | cancelled: cancelado';

-- =============================================
-- PARTE 2: MIGRAR DADOS EXISTENTES
-- =============================================

-- Criar uma ocorrência para cada romaria existente
-- usando suas datas arrival_date e departure_date atuais
INSERT INTO public.pilgrimage_occurrences (pilgrimage_id, arrival_date, departure_date, status, notes)
SELECT 
    id as pilgrimage_id,
    arrival_date,
    departure_date,
    CASE 
        WHEN status = 'active' AND CURRENT_DATE BETWEEN arrival_date AND departure_date THEN 'active'
        WHEN status = 'active' AND CURRENT_DATE < arrival_date THEN 'scheduled'
        WHEN status = 'completed' OR CURRENT_DATE > departure_date THEN 'completed'
        WHEN status = 'cancelled' THEN 'cancelled'
        ELSE 'scheduled'
    END as status,
    NULL as notes
FROM public.pilgrimages
WHERE arrival_date IS NOT NULL AND departure_date IS NOT NULL;

-- =============================================
-- PARTE 3: ATUALIZAR TABELA PILGRIMAGES
-- =============================================

-- Remover colunas de data da tabela principal (agora ficam em occurrences)
-- NOTA: Mantemos por enquanto para compatibilidade, mas podemos remover futuramente
-- ALTER TABLE public.pilgrimages DROP COLUMN IF EXISTS arrival_date;
-- ALTER TABLE public.pilgrimages DROP COLUMN IF EXISTS departure_date;

-- Por enquanto, vamos apenas adicionar um comentário informativo
COMMENT ON TABLE public.pilgrimages IS 'Romarias/Grupos - Use pilgrimage_occurrences para múltiplas datas';
COMMENT ON COLUMN public.pilgrimages.arrival_date IS 'DEPRECATED: Use pilgrimage_occurrences. Mantido por compatibilidade';
COMMENT ON COLUMN public.pilgrimages.departure_date IS 'DEPRECATED: Use pilgrimage_occurrences. Mantido por compatibilidade';

-- =============================================
-- PARTE 4: FUNÇÃO HELPER PARA CALCULAR STATUS
-- =============================================

-- Função para atualizar automaticamente o status da occurrence baseado nas datas
CREATE OR REPLACE FUNCTION update_occurrence_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar status automaticamente baseado nas datas
    IF CURRENT_DATE < NEW.arrival_date THEN
        NEW.status := 'scheduled';
    ELSIF CURRENT_DATE BETWEEN NEW.arrival_date AND NEW.departure_date THEN
        NEW.status := 'active';
    ELSIF CURRENT_DATE > NEW.departure_date THEN
        NEW.status := 'completed';
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status automaticamente
CREATE TRIGGER trg_update_occurrence_status
    BEFORE INSERT OR UPDATE ON public.pilgrimage_occurrences
    FOR EACH ROW
    EXECUTE FUNCTION update_occurrence_status();

-- =============================================
-- PARTE 5: VIEWS ÚTEIS
-- =============================================

-- View para ver romarias com suas próximas ocorrências
CREATE OR REPLACE VIEW pilgrimage_next_occurrences AS
SELECT 
    p.id,
    p.name,
    p.bus_group,
    p.contact_phone,
    p.number_of_people,
    p.status as pilgrimage_status,
    po.id as occurrence_id,
    po.arrival_date,
    po.departure_date,
    po.status as occurrence_status,
    po.notes as occurrence_notes
FROM public.pilgrimages p
LEFT JOIN public.pilgrimage_occurrences po ON p.id = po.pilgrimage_id
WHERE po.status IN ('scheduled', 'active')
ORDER BY po.arrival_date ASC;

COMMENT ON VIEW pilgrimage_next_occurrences IS 'Romarias com suas próximas ocorrências agendadas ou ativas';

-- View para ver todas as ocorrências de uma romaria
CREATE OR REPLACE VIEW pilgrimage_all_occurrences AS
SELECT 
    p.id,
    p.name,
    p.bus_group,
    p.contact_phone,
    p.number_of_people,
    p.status as pilgrimage_status,
    po.id as occurrence_id,
    po.arrival_date,
    po.departure_date,
    po.status as occurrence_status,
    po.notes as occurrence_notes,
    po.created_at as occurrence_created_at
FROM public.pilgrimages p
INNER JOIN public.pilgrimage_occurrences po ON p.id = po.pilgrimage_id
ORDER BY p.name, po.arrival_date DESC;

COMMENT ON VIEW pilgrimage_all_occurrences IS 'Todas as romarias com todas as suas ocorrências (histórico completo)';

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

DO $$
DECLARE
    v_pilgrimages_count INTEGER;
    v_occurrences_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_pilgrimages_count FROM public.pilgrimages;
    SELECT COUNT(*) INTO v_occurrences_count FROM public.pilgrimage_occurrences;
    
    RAISE NOTICE '📊 Estatísticas da migração:';
    RAISE NOTICE '   - Romarias: %', v_pilgrimages_count;
    RAISE NOTICE '   - Ocorrências criadas: %', v_occurrences_count;
    RAISE NOTICE '✅ Tabela pilgrimage_occurrences criada';
    RAISE NOTICE '✅ Dados existentes migrados';
    RAISE NOTICE '✅ Função e trigger de status automático criados';
    RAISE NOTICE '✅ Views criadas: pilgrimage_next_occurrences, pilgrimage_all_occurrences';
    RAISE NOTICE '⚠️  Colunas arrival_date/departure_date na tabela pilgrimages estão DEPRECATED';
    RAISE NOTICE '📌 Use pilgrimage_occurrences para gerenciar datas';
    
    IF v_occurrences_count >= v_pilgrimages_count THEN
        RAISE NOTICE '✅ Migração concluída com sucesso!';
    ELSE
        RAISE WARNING '⚠️  Menos ocorrências que romarias - verifique os dados';
    END IF;
END $$;

-- =============================================
-- EXEMPLO DE USO
-- =============================================

/*
-- Criar romaria com múltiplas datas (exemplo)
INSERT INTO pilgrimages (name, bus_group, number_of_people, contact_phone, status)
VALUES ('Aparecida 2026', 'Ônibus 1', 45, '(11) 98888-8888', 'active')
RETURNING id;

-- Adicionar múltiplas ocorrências
INSERT INTO pilgrimage_occurrences (pilgrimage_id, arrival_date, departure_date)
VALUES 
    ('UUID_DA_ROMARIA', '2026-03-15', '2026-03-18'),
    ('UUID_DA_ROMARIA', '2026-06-20', '2026-06-23'),
    ('UUID_DA_ROMARIA', '2026-09-10', '2026-09-13');

-- Consultar todas as datas de uma romaria
SELECT * FROM pilgrimage_all_occurrences WHERE id = 'UUID_DA_ROMARIA';

-- Consultar próximas ocorrências agendadas
SELECT * FROM pilgrimage_next_occurrences WHERE arrival_date >= CURRENT_DATE;
*/
