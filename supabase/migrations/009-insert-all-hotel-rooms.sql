-- Migration 009: Inserir todos os quartos do Hotel Recanto da Mineira
-- Data: 2025-11-27
-- Objetivo: Popular banco com todos os quartos conforme organização real do hotel

-- Limpar tabelas relacionadas primeiro (respeitar foreign keys)
DELETE FROM room_reservations;
DELETE FROM rooms;

-- ============================================
-- PRÉDIO PRINCIPAL - PRIMEIRO ANDAR (11-18)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 11: 1 casal + 2 solteiro = 4 pessoas
(11, 1, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb),

-- Apto 12: 1 casal = 2 pessoas
(12, 1, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 13: 1 casal + 1 solteiro = 3 pessoas
(13, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 14: 1 casal + 1 solteiro = 3 pessoas
(14, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 15: 1 solteiro = 1 pessoa
(15, 1, 'standard', 'available', 1, 1, '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 16: 1 casal + 1 solteiro = 3 pessoas
(16, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 17: 1 casal + 1 solteiro = 3 pessoas
(17, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 18: 1 casal + 1 solteiro = 3 pessoas
(18, 1, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- ============================================
-- PRÉDIO PRINCIPAL - SEGUNDO ANDAR (21-28)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 21: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(21, 2, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 22: 1 casal = 2 pessoas
(22, 2, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 23: 1 casal + 1 solteiro = 3 pessoas
(23, 2, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 24: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(24, 2, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 25: 1 solteiro = 1 pessoa
(25, 2, 'standard', 'available', 1, 1, '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 26: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(26, 2, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 27: 1 casal + 1 solteiro = 3 pessoas
(27, 2, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 28: 1 casal + 1 solteiro = 3 pessoas
(28, 2, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- ============================================
-- PRÉDIO PRINCIPAL - TERCEIRO ANDAR (31-38)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 31: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(31, 3, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 32: 1 casal = 2 pessoas
(32, 3, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 33: 1 casal + 1 solteiro = 3 pessoas
(33, 3, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 34: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(34, 3, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 35: 1 solteiro = 1 pessoa
(35, 3, 'standard', 'available', 1, 1, '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 36: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(36, 3, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 37: 1 casal + 1 solteiro = 3 pessoas
(37, 3, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 38: 1 casal + 1 solteiro = 3 pessoas
(38, 3, 'standard', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- ============================================
-- PRÉDIO PRINCIPAL - QUARTO ANDAR (41-44, 46-48) - SEM 45
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 41: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(41, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 42: 1 casal = 2 pessoas
(42, 4, 'standard', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 43: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(43, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 44: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(44, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 46: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(46, 4, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 47: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(47, 4, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 48: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(48, 4, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb);

-- ============================================
-- PRÉDIO PRINCIPAL - QUINTO ANDAR (56-58)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 56: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(56, 5, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 57: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(57, 5, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 58: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(58, 5, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb);

-- ============================================
-- PRÉDIO PRINCIPAL - SEXTO ANDAR (66-68)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 66: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(66, 6, 'standard', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 67: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(67, 6, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 68: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(68, 6, 'standard', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb);

-- ============================================
-- ANEXO - PRIMEIRO ANDAR (101-106)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 101: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(101, 1, 'anexo', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 102: 1 solteiro + 1 solteiro = 2 pessoas
(102, 1, 'anexo', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb),

-- Apto 103: 1 solteiro + 1 solteiro = 2 pessoas
(103, 1, 'anexo', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb),

-- Apto 104: 1 casal = 2 pessoas
(104, 1, 'anexo', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 105: 1 casal = 2 pessoas
(105, 1, 'anexo', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 106: 1 casal + 1 solteiro = 3 pessoas
(106, 1, 'anexo', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- ============================================
-- ANEXO - QUARTO ANDAR (401-406)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 401: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(401, 4, 'anexo', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 402: 1 solteiro + 1 solteiro = 2 pessoas
(402, 4, 'anexo', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb),

-- Apto 403: 1 casal = 2 pessoas
(403, 4, 'anexo', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 404: 1 casal = 2 pessoas
(404, 4, 'anexo', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 405: 1 casal = 2 pessoas
(405, 4, 'anexo', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb),

-- Apto 406: 1 casal + 1 solteiro = 3 pessoas
(406, 4, 'anexo', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb);

-- ============================================
-- ANEXO - QUINTO ANDAR (501, 502, 504) - SEM 503
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration) VALUES
-- Apto 501: 1 solteiro + 1 solteiro + 1 sofá-cama = 3 pessoas
(501, 5, 'anexo', 'available', 3, 3, '[{"id":"1","type":"solteiro","quantity":2},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb),

-- Apto 502: 1 casal + 1 solteiro = 3 pessoas
(502, 5, 'anexo', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb),

-- Apto 504: 1 casal = 2 pessoas
(504, 5, 'anexo', 'available', 2, 1, '[{"id":"1","type":"casal","quantity":1}]'::jsonb);

-- ============================================
-- POUSADA - PRIMEIRO ANDAR (03, 04, 05, 06)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration, custom_name) VALUES
-- Apto 03: 1 solteiro + 1 sofá-cama = 2 pessoas
(3, 1, 'pousada', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":1},{"id":"2","type":"sofa-cama","quantity":1}]'::jsonb, 'Apto 03'),

-- Apto 04: 1 casal + 1 solteiro = 3 pessoas
(4, 1, 'pousada', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb, 'Apto 04'),

-- Apto 05: 1 casal + 1 solteiro = 3 pessoas
(5, 1, 'pousada', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb, 'Apto 05'),

-- Apto 06: 1 casal + 1 solteiro + 1 sofá-cama = 4 pessoas
(6, 1, 'pousada', 'available', 4, 3, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb, 'Apto 06');

-- ============================================
-- POUSADA - SEGUNDO ANDAR (01, 02, 07)
-- ============================================

INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration, custom_name) VALUES
-- Apto 01: 1 casal + 1 solteiro = 3 pessoas
(1, 2, 'pousada', 'available', 3, 2, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb, 'Apto 01'),

-- Apto 02: 1 solteiro + 1 solteiro = 2 pessoas
(2, 2, 'pousada', 'available', 2, 2, '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb, 'Apto 02'),

-- Apto 07: 1 casal + 1 solteiro + 1 solteiro + 1 solteiro = 5 pessoas
(7, 2, 'pousada', 'available', 5, 4, '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":3}]'::jsonb, 'Apto 07');

-- ============================================
-- ESTATÍSTICAS FINAIS
-- ============================================

DO $$
DECLARE
  total_quartos INTEGER;
  total_capacidade INTEGER;
  total_camas INTEGER;
  principal_count INTEGER;
  anexo_count INTEGER;
  pousada_count INTEGER;
BEGIN
  SELECT COUNT(*), SUM(capacity), SUM(beds) 
  INTO total_quartos, total_capacidade, total_camas 
  FROM rooms;
  
  SELECT COUNT(*) INTO principal_count FROM rooms WHERE type = 'standard';
  SELECT COUNT(*) INTO anexo_count FROM rooms WHERE type = 'anexo';
  SELECT COUNT(*) INTO pousada_count FROM rooms WHERE type = 'pousada';
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRATION 009 CONCLUÍDA COM SUCESSO               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🏨 HOTEL RECANTO DA MINEIRA';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 TOTAIS:';
  RAISE NOTICE '   • Total de Apartamentos: %', total_quartos;
  RAISE NOTICE '   • Capacidade Total: % pessoas', total_capacidade;
  RAISE NOTICE '   • Total de Camas: % camas', total_camas;
  RAISE NOTICE '';
  RAISE NOTICE '🏢 POR PRÉDIO:';
  RAISE NOTICE '   • Prédio Principal: % quartos', principal_count;
  RAISE NOTICE '   • Anexo: % quartos', anexo_count;
  RAISE NOTICE '   • Pousada: % quartos', pousada_count;
  RAISE NOTICE '';
  RAISE NOTICE '✨ Todos os quartos foram inseridos com configuração detalhada de camas!';
  RAISE NOTICE '';
END $$;
