-- Migration 009: Inserir quartos do hotel - VERSÃO LIMPA
-- Data: 2025-11-27
-- Objetivo: Popular tabela rooms com todos os apartamentos do hotel

-- =============================================
-- IMPORTANTE: Execute APÓS migrations 007 e 008
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  🏨 MIGRATION 009: INSERIR QUARTOS DO HOTEL           ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- =============================================
-- LIMPAR TABELA (CUIDADO EM PRODUÇÃO!)
-- =============================================
-- COMENTAR ESTA LINHA SE NÃO QUISER DELETAR OS QUARTOS EXISTENTES
DELETE FROM rooms;

-- =============================================
-- PRÉDIO PRINCIPAL - PRIMEIRO ANDAR (11-18)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(11, 1, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(12, 1, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(13, 1, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(14, 1, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb),
(15, 1, 'standard', 'available', 1, 1, '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb),
(16, 1, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(17, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(18, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- =============================================
-- PRÉDIO PRINCIPAL - SEGUNDO ANDAR (21-28)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(21, 2, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(22, 2, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(23, 2, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(24, 2, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(25, 2, 'standard', 'available', 1, 1, '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb),
(26, 2, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(27, 2, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(28, 2, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- =============================================
-- PRÉDIO PRINCIPAL - TERCEIRO ANDAR (31-38)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(31, 3, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(32, 3, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(33, 3, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(34, 3, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(35, 3, 'standard', 'available', 1, 1, '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb),
(36, 3, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(37, 3, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb),
(38, 3, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- =============================================
-- PRÉDIO PRINCIPAL - QUARTO ANDAR (41-48, sem 45)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(41, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(42, 4, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(43, 4, 'standard', 'available', 5, 4, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(44, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(46, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(47, 4, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb),
(48, 4, 'standard', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb);

-- =============================================
-- PRÉDIO PRINCIPAL - QUINTO ANDAR (56-58)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(56, 5, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(57, 5, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb),
(58, 5, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb);

-- =============================================
-- PRÉDIO PRINCIPAL - SEXTO ANDAR (66-68)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(66, 6, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(67, 6, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb),
(68, 6, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb);

-- =============================================
-- ANEXO - PRIMEIRO ANDAR (101-106)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(101, 1, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(102, 1, 'standard', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb),
(103, 1, 'standard', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb),
(104, 1, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(105, 1, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(106, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- =============================================
-- ANEXO - QUARTO ANDAR (401-406)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(401, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),
(402, 4, 'standard', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb),
(403, 4, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(404, 4, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(405, 4, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),
(406, 4, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- =============================================
-- ANEXO - QUINTO ANDAR (501-504, sem 503)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(501, 5, 'standard', 'available', 4, 4, '[{"id":"1","type":"solteiro","quantity":4}]'::jsonb),
(502, 5, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(504, 5, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb);

-- =============================================
-- POUSADA SEM ELEVADOR - TÉRREO (01-07)
-- =============================================
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
(1, 0, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb),
(2, 0, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),
(3, 0, 'standard', 'available', 4, 4, '[{"id":"1","type":"solteiro","quantity":4}]'::jsonb),
(4, 0, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(5, 0, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),
(6, 0, 'standard', 'available', 5, 4, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":3}]'::jsonb),
(7, 0, 'standard', 'available', 6, 6, '[{"id":"1","type":"solteiro","quantity":6}]'::jsonb);

-- =============================================
-- RESUMO FINAL
-- =============================================
DO $$
DECLARE
  total_rooms INTEGER;
  total_capacity INTEGER;
  total_beds INTEGER;
BEGIN
  SELECT COUNT(*), SUM(capacity), SUM(beds) 
  INTO total_rooms, total_capacity, total_beds 
  FROM rooms;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRATION 009 CONCLUÍDA COM SUCESSO               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 ESTATÍSTICAS DO HOTEL:';
  RAISE NOTICE '';
  RAISE NOTICE '  🏨 Total de Apartamentos: %', total_rooms;
  RAISE NOTICE '  👥 Capacidade Total: % pessoas', total_capacity;
  RAISE NOTICE '  🛏️  Total de Camas: % camas', total_beds;
  RAISE NOTICE '';
  RAISE NOTICE '📍 DISTRIBUIÇÃO:';
  RAISE NOTICE '  • Térreo (Pousada): 7 quartos';
  RAISE NOTICE '  • 1º Andar: 14 quartos (8 principal + 6 anexo)';
  RAISE NOTICE '  • 2º Andar: 8 quartos';
  RAISE NOTICE '  • 3º Andar: 8 quartos';
  RAISE NOTICE '  • 4º Andar: 13 quartos (7 principal + 6 anexo)';
  RAISE NOTICE '  • 5º Andar: 6 quartos (3 principal + 3 anexo)';
  RAISE NOTICE '  • 6º Andar: 3 quartos';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Cada quarto inclui configuração detalhada de camas (JSONB)';
  RAISE NOTICE '';
END $$;
