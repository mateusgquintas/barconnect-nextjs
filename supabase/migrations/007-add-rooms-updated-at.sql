-- Migration 007: Adicionar coluna updated_at à tabela rooms
-- Data: 2025-11-26
-- Motivo: Corrigir erro "record 'new' has no field 'updated_at'" no trigger

-- Adicionar coluna updated_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rooms' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.rooms 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Atualizar registros existentes com a data de criação
    UPDATE public.rooms 
    SET updated_at = COALESCE(created_at, NOW())
    WHERE updated_at IS NULL;
    
    RAISE NOTICE '✅ Coluna updated_at adicionada à tabela rooms';
  ELSE
    RAISE NOTICE '⚠ Coluna updated_at já existe na tabela rooms';
  END IF;
END $$;

-- Adicionar comentário
COMMENT ON COLUMN public.rooms.updated_at IS 'Data e hora da última atualização do registro';
