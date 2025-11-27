-- Migration 008: Adicionar campo bed_configuration à tabela rooms
-- Data: 2025-11-26
-- Objetivo: Armazenar configuração detalhada de camas em formato JSONB

-- Adicionar coluna bed_configuration se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rooms' 
    AND column_name = 'bed_configuration'
  ) THEN
    ALTER TABLE public.rooms 
    ADD COLUMN bed_configuration JSONB;
    
    RAISE NOTICE '✅ Coluna bed_configuration adicionada à tabela rooms';
  ELSE
    RAISE NOTICE '⚠ Coluna bed_configuration já existe na tabela rooms';
  END IF;
END $$;

-- Adicionar comentário
COMMENT ON COLUMN public.rooms.bed_configuration IS 
'Configuração detalhada de camas em formato JSON. Exemplo: [{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]';

-- Adicionar índice GIN para consultas JSONB (opcional, mas recomendado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'rooms' 
    AND indexname = 'idx_rooms_bed_configuration'
  ) THEN
    CREATE INDEX idx_rooms_bed_configuration ON public.rooms USING GIN (bed_configuration);
    RAISE NOTICE '✅ Índice GIN criado para bed_configuration';
  ELSE
    RAISE NOTICE '⚠ Índice idx_rooms_bed_configuration já existe';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRATION 008 CONCLUÍDA COM SUCESSO               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 CAMPO ADICIONADO:';
  RAISE NOTICE '   • bed_configuration (JSONB) - Armazena tipos e quantidades de camas';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 EXEMPLO DE DADOS:';
  RAISE NOTICE '   [';
  RAISE NOTICE '     {"id": "1", "type": "casal", "quantity": 1},';
  RAISE NOTICE '     {"id": "2", "type": "solteiro", "quantity": 2}';
  RAISE NOTICE '   ]';
  RAISE NOTICE '';
END $$;
