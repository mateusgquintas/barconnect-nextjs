-- =============================================
-- MIGRATION 006: ADICIONAR AMENIDADES AOS QUARTOS
-- Data: 2025-11-26
-- Objetivo: Expandir tabela rooms com campos de amenidades para hotel
-- =============================================

-- IMPORTANTE: Esta migration ALTERA a tabela rooms existente
-- Compatível com schema atual: rooms (id UUID PK, number INTEGER, type, status, floor, etc)
-- Preserva todas as FKs existentes (room_reservations.room_id → rooms.id)

DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION 006: ADICIONAR AMENIDADES ===';
  RAISE NOTICE 'Expandindo tabela rooms existente...';
END $$;

-- =============================================
-- SEÇÃO 1: ADICIONAR CAMPOS DE INFORMAÇÃO
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Adicionando campos de informação...';
  
  -- Campo para nome customizado do quarto
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'custom_name'
  ) THEN
    ALTER TABLE rooms ADD COLUMN custom_name VARCHAR(100);
    RAISE NOTICE '  ✓ Adicionado campo custom_name';
  ELSE
    RAISE NOTICE '  ⚠ Campo custom_name já existe';
  END IF;

  -- Campo para capacidade (máximo de pessoas)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'capacity'
  ) THEN
    ALTER TABLE rooms ADD COLUMN capacity INTEGER DEFAULT 2;
    RAISE NOTICE '  ✓ Adicionado campo capacity';
  ELSE
    RAISE NOTICE '  ⚠ Campo capacity já existe';
  END IF;

  -- Campo para número de camas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'beds'
  ) THEN
    ALTER TABLE rooms ADD COLUMN beds INTEGER DEFAULT 1;
    RAISE NOTICE '  ✓ Adicionado campo beds';
  ELSE
    RAISE NOTICE '  ⚠ Campo beds já existe';
  END IF;

  -- Informação: Taxa diária
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'daily_rate'
  ) THEN
    ALTER TABLE rooms ADD COLUMN daily_rate DECIMAL(10,2);
    RAISE NOTICE '  ✓ Adicionado campo daily_rate';
  ELSE
    RAISE NOTICE '  ⚠ Campo daily_rate já existe';
  END IF;

  -- Informação: Área do quarto (m²)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'room_size'
  ) THEN
    ALTER TABLE rooms ADD COLUMN room_size DECIMAL(6,2);
    RAISE NOTICE '  ✓ Adicionado campo room_size';
  ELSE
    RAISE NOTICE '  ⚠ Campo room_size já existe';
  END IF;
  
  RAISE NOTICE '✅ Campos de informação adicionados';
END $$;

-- =============================================
-- SEÇÃO 2: ADICIONAR AMENIDADES PRINCIPAIS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Adicionando amenidades principais...';

  -- Amenidades: Frigobar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_minibar'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_minibar BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_minibar';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_minibar já existe';
  END IF;

  -- Amenidades: Ar-condicionado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_ac'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_ac BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_ac';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_ac já existe';
  END IF;

  -- Amenidades: TV
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_tv'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_tv BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_tv';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_tv já existe';
  END IF;

  -- Amenidades: Wi-Fi
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_wifi'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_wifi BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_wifi';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_wifi já existe';
  END IF;

  -- Amenidades: Varanda
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_balcony'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_balcony BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_balcony';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_balcony já existe';
  END IF;
  
  RAISE NOTICE '✅ Amenidades principais adicionadas';
END $$;

-- =============================================
-- SEÇÃO 3: ADICIONAR AMENIDADES BANHEIRO E EXTRAS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Adicionando amenidades de banheiro e extras...';

  -- Amenidades: Banheira
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_bathtub'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_bathtub BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_bathtub';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_bathtub já existe';
  END IF;

  -- Amenidades: Secador de Cabelo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_hairdryer'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_hairdryer BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_hairdryer';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_hairdryer já existe';
  END IF;

  -- Amenidades: Cofre
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_safe'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_safe BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_safe';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_safe já existe';
  END IF;

  -- Amenidades: Telefone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_phone'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_phone BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_phone';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_phone já existe';
  END IF;

  -- Amenidades: Roupão/Chinelos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'has_bathrobe'
  ) THEN
    ALTER TABLE rooms ADD COLUMN has_bathrobe BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo has_bathrobe';
  ELSE
    RAISE NOTICE '  ⚠ Campo has_bathrobe já existe';
  END IF;
  
  RAISE NOTICE '✅ Amenidades de banheiro e extras adicionadas';
END $$;

-- =============================================
-- SEÇÃO 4: ADICIONAR CARACTERÍSTICAS ESPECIAIS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Adicionando características especiais...';

  -- Amenidades: Vista (oceano, montanha, cidade, etc)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'view_type'
  ) THEN
    ALTER TABLE rooms ADD COLUMN view_type VARCHAR(50);
    RAISE NOTICE '  ✓ Adicionado campo view_type';
  ELSE
    RAISE NOTICE '  ⚠ Campo view_type já existe';
  END IF;

  -- Amenidades: Acessibilidade
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'is_accessible'
  ) THEN
    ALTER TABLE rooms ADD COLUMN is_accessible BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo is_accessible';
  ELSE
    RAISE NOTICE '  ⚠ Campo is_accessible já existe';
  END IF;

  -- Amenidades: Permite Fumantes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'is_smoking_allowed'
  ) THEN
    ALTER TABLE rooms ADD COLUMN is_smoking_allowed BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo is_smoking_allowed';
  ELSE
    RAISE NOTICE '  ⚠ Campo is_smoking_allowed já existe';
  END IF;

  -- Amenidades: Permite Pets
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'is_pet_friendly'
  ) THEN
    ALTER TABLE rooms ADD COLUMN is_pet_friendly BOOLEAN DEFAULT false;
    RAISE NOTICE '  ✓ Adicionado campo is_pet_friendly';
  ELSE
    RAISE NOTICE '  ⚠ Campo is_pet_friendly já existe';
  END IF;
  
  RAISE NOTICE '✅ Características especiais adicionadas';
END $$;

-- =============================================
-- SEÇÃO 5: ATUALIZAR QUARTOS EXISTENTES COM VALORES PADRÃO
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Atualizando valores padrão nos quartos existentes...';
  
  -- Atualizar capacity se NULL
  UPDATE rooms 
  SET capacity = COALESCE(capacity, 2)
  WHERE capacity IS NULL;
  
  -- Atualizar beds se NULL
  UPDATE rooms 
  SET beds = COALESCE(beds, 1)
  WHERE beds IS NULL;
  
  -- Atualizar floor baseado em number se NULL
  UPDATE rooms 
  SET floor = COALESCE(floor, CASE 
    WHEN number < 100 THEN 0
    WHEN number < 200 THEN 1
    WHEN number < 300 THEN 2
    WHEN number < 400 THEN 3
    ELSE (number / 100)
  END)
  WHERE floor IS NULL AND number IS NOT NULL;
  
  -- Atualizar amenidades booleanas se NULL (padrão false)
  UPDATE rooms 
  SET 
    has_minibar = COALESCE(has_minibar, false),
    has_ac = COALESCE(has_ac, false),
    has_tv = COALESCE(has_tv, false),
    has_wifi = COALESCE(has_wifi, false),
    has_balcony = COALESCE(has_balcony, false),
    has_bathtub = COALESCE(has_bathtub, false),
    has_hairdryer = COALESCE(has_hairdryer, false),
    has_safe = COALESCE(has_safe, false),
    has_phone = COALESCE(has_phone, false),
    has_bathrobe = COALESCE(has_bathrobe, false),
    is_accessible = COALESCE(is_accessible, false),
    is_smoking_allowed = COALESCE(is_smoking_allowed, false),
    is_pet_friendly = COALESCE(is_pet_friendly, false);
  
  RAISE NOTICE '  ✓ Valores padrão configurados para quartos existentes';
END $$;

-- =============================================
-- SEÇÃO 6: CRIAR/VERIFICAR TRIGGER PARA updated_at
-- =============================================

-- Criar ou substituir a função de trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_rooms_updated_at'
  ) THEN
    CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
    RAISE NOTICE '✅ Trigger update_rooms_updated_at criado';
  ELSE
    RAISE NOTICE '⚠ Trigger update_rooms_updated_at já existe';
  END IF;
END $$;

-- =============================================
-- SEÇÃO 7: ADICIONAR COMENTÁRIOS NAS COLUNAS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Adicionando comentários nas colunas...';
  
  COMMENT ON COLUMN rooms.custom_name IS 'Nome personalizado do quarto (ex: "Suíte Presidencial")';
  COMMENT ON COLUMN rooms.capacity IS 'Capacidade máxima de pessoas no quarto';
  COMMENT ON COLUMN rooms.beds IS 'Número de camas no quarto';
  COMMENT ON COLUMN rooms.has_minibar IS 'Indica se o quarto possui frigobar';
  COMMENT ON COLUMN rooms.has_ac IS 'Indica se o quarto possui ar-condicionado';
  COMMENT ON COLUMN rooms.has_tv IS 'Indica se o quarto possui TV';
  COMMENT ON COLUMN rooms.has_wifi IS 'Indica se o quarto possui Wi-Fi';
  COMMENT ON COLUMN rooms.has_balcony IS 'Indica se o quarto possui varanda';
  COMMENT ON COLUMN rooms.has_bathtub IS 'Indica se o quarto possui banheira';
  COMMENT ON COLUMN rooms.has_safe IS 'Indica se o quarto possui cofre';
  COMMENT ON COLUMN rooms.has_phone IS 'Indica se o quarto possui telefone';
  COMMENT ON COLUMN rooms.has_hairdryer IS 'Indica se o quarto possui secador de cabelo';
  COMMENT ON COLUMN rooms.has_bathrobe IS 'Indica se o quarto possui roupão/chinelos';
  COMMENT ON COLUMN rooms.view_type IS 'Tipo de vista (oceano, montanha, cidade, jardim, etc)';
  COMMENT ON COLUMN rooms.is_accessible IS 'Indica se o quarto é acessível para pessoas com mobilidade reduzida';
  COMMENT ON COLUMN rooms.is_smoking_allowed IS 'Indica se é permitido fumar no quarto';
  COMMENT ON COLUMN rooms.is_pet_friendly IS 'Indica se o quarto aceita animais de estimação';
  COMMENT ON COLUMN rooms.daily_rate IS 'Taxa diária do quarto (em R$)';
  COMMENT ON COLUMN rooms.room_size IS 'Área do quarto em metros quadrados (m²)';
  
  RAISE NOTICE '  ✓ Comentários adicionados';
END $$;

-- =============================================
-- SEÇÃO 8: RESUMO FINAL
-- =============================================

DO $$
DECLARE
  total_rooms INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rooms FROM rooms;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRATION 006 CONCLUÍDA COM SUCESSO               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 CAMPOS ADICIONADOS À TABELA rooms:';
  RAISE NOTICE '';
  RAISE NOTICE '  📝 INFORMAÇÕES BÁSICAS (5 campos):';
  RAISE NOTICE '     • custom_name   - Nome personalizado/apelido';
  RAISE NOTICE '     • capacity      - Capacidade máxima';
  RAISE NOTICE '     • beds          - Número de camas';
  RAISE NOTICE '     • daily_rate    - Taxa diária (R$)';
  RAISE NOTICE '     • room_size     - Área em m²';
  RAISE NOTICE '';
  RAISE NOTICE '  🏨 AMENIDADES PRINCIPAIS (5 campos):';
  RAISE NOTICE '     • has_minibar   - Frigobar';
  RAISE NOTICE '     • has_ac        - Ar-condicionado';
  RAISE NOTICE '     • has_tv        - Televisão';
  RAISE NOTICE '     • has_wifi      - Wi-Fi';
  RAISE NOTICE '     • has_balcony   - Varanda';
  RAISE NOTICE '';
  RAISE NOTICE '  🚿 AMENIDADES BANHEIRO (2 campos):';
  RAISE NOTICE '     • has_bathtub   - Banheira';
  RAISE NOTICE '     • has_hairdryer - Secador de cabelo';
  RAISE NOTICE '';
  RAISE NOTICE '  ⭐ AMENIDADES EXTRAS (3 campos):';
  RAISE NOTICE '     • has_safe      - Cofre';
  RAISE NOTICE '     • has_phone     - Telefone';
  RAISE NOTICE '     • has_bathrobe  - Roupão/chinelos';
  RAISE NOTICE '';
  RAISE NOTICE '  🌟 CARACTERÍSTICAS ESPECIAIS (4 campos):';
  RAISE NOTICE '     • view_type           - Tipo de vista (oceano/cidade/jardim/etc)';
  RAISE NOTICE '     • is_accessible       - Acessível para PCD';
  RAISE NOTICE '     • is_smoking_allowed  - Permite fumar';
  RAISE NOTICE '     • is_pet_friendly     - Pet friendly';
  RAISE NOTICE '';
  RAISE NOTICE '💾 COMPATIBILIDADE:';
  RAISE NOTICE '   ✓ Preserva id UUID PRIMARY KEY';
  RAISE NOTICE '   ✓ Preserva number INTEGER (identificador do quarto)';
  RAISE NOTICE '   ✓ Preserva type, status, floor, description';
  RAISE NOTICE '   ✓ Compatível com room_reservations.room_id → rooms.id';
  RAISE NOTICE '   ✓ Valores padrão aplicados aos quartos existentes';
  RAISE NOTICE '';
  RAISE NOTICE '📈 TOTAL: 19 novos campos | Quartos cadastrados: %', total_rooms;
  RAISE NOTICE '';
END $$;
