-- Migration 009: Inserir quartos do hotel com configuração detalhada
-- Data: 2025-11-27
-- Objetivo: Popular tabela rooms com apartamentos do 1º ao 6º andar + anexos + pousada

-- =============================================
-- IMPORTANTE: Execute APÓS a migration 008
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  🏨 MIGRATION 009: INSERIR QUARTOS DO HOTEL           ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  ATENÇÃO: Esta migration irá DELETAR todos os quartos existentes!';
  RAISE NOTICE '';
END $$;

-- =============================================
-- LIMPAR TABELA DE QUARTOS
-- =============================================

DO $$
DECLARE
  old_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM rooms;
  DELETE FROM rooms;
  RAISE NOTICE '🗑️  Deletados % quartos existentes', old_count;
  RAISE NOTICE '';
END $$;

-- =============================================
-- PRIMEIRO ANDAR (Apartamentos 11-18)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos do PRIMEIRO ANDAR...';
END $$;

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
-- SEGUNDO ANDAR (Apartamentos 21-28)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos do SEGUNDO ANDAR...';
END $$;

-- Apto 21: 1 casal, 1 solteiro, 1 auxiliar (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (21, 2, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 22: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (22, 2, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 23: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (23, 2, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 24: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (24, 2, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 25: 1 solteiro (1 pessoa, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (25, 2, 'standard', 'available', 1, 1,
  '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 26: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (26, 2, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 27: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (27, 2, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 28: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (28, 2, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- =============================================
-- TERCEIRO ANDAR (Apartamentos 31-38)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos do TERCEIRO ANDAR...';
END $$;

-- Apto 31: 1 casal, 1 solteiro, 1 auxiliar (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (31, 3, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 32: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (32, 3, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 33: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (33, 3, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 34: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (34, 3, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 35: 1 solteiro (1 pessoa, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (35, 3, 'standard', 'available', 1, 1,
  '[{"id":"1","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 36: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (36, 3, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 37: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (37, 3, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 38: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (38, 3, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- =============================================
-- QUARTO ANDAR (Apartamentos 41-48)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos do QUARTO ANDAR...';
END $$;

-- Apto 41: 1 casal, 1 solteiro, 1 auxiliar (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (41, 4, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 42: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (42, 4, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 43: 1 casal, 1 solteiro, 1 solteiro, 1 auxiliar (5 pessoas, 4 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (43, 4, 'standard', 'available', 5, 4,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 44: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (44, 4, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 46: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (46, 4, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 47: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (47, 4, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 48: 1 solteiro, 1 solteiro (2 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (48, 4, 'standard', 'available', 2, 2,
  '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- =============================================
-- QUINTO ANDAR (Apartamentos 56-58)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos do QUINTO ANDAR...';
END $$;

-- Apto 56: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (56, 5, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 57: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (57, 5, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 58: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (58, 5, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- =============================================
-- SEXTO ANDAR (Apartamentos 66-68)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos do SEXTO ANDAR...';
END $$;

-- Apto 66: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (66, 6, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 67: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (67, 6, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 68: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (68, 6, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- =============================================
-- ANEXOS AO LADO COM ELEVADOR (101-106, 401-406, 501-504)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos dos ANEXOS (com elevador)...';
END $$;

-- Primeiro Andar Anexo
-- Apto 101: 1 casal, 1 solteiro, 1 auxiliar (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (101, 1, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 102: 1 solteiro, 1 solteiro (2 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (102, 1, 'standard', 'available', 2, 2,
  '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 103: 1 solteiro, 1 solteiro (2 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (103, 1, 'standard', 'available', 2, 2,
  '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 104: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (104, 1, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 105: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (105, 1, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 106: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (106, 1, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Quarto Andar Anexo
-- Apto 401: 1 casal, 1 solteiro, 1 auxiliar (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (401, 4, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1},{"id":"3","type":"sofa-cama","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 402: 1 solteiro, 1 solteiro (2 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (402, 4, 'standard', 'available', 2, 2,
  '[{"id":"1","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 403: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (403, 4, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 404: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (404, 4, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 405: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (405, 4, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 406: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (406, 4, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Quinto Andar Anexo
-- Apto 501: 1 solteiro, 1 solteiro, 1 solteiro, 1 solteiro (4 pessoas, 4 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (501, 5, 'standard', 'available', 4, 4,
  '[{"id":"1","type":"solteiro","quantity":4}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 502: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (502, 5, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 504: 1 casal (2 pessoas, 1 cama)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (504, 5, 'standard', 'available', 2, 1,
  '[{"id":"1","type":"casal","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- =============================================
-- POUSADA SEM ELEVADOR (Apartamentos 01-07)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📍 Inserindo apartamentos da POUSADA (sem elevador)...';
END $$;

-- Apto 01: 1 solteiro, 1 solteiro, 1 solteiro (3 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (1, 0, 'standard', 'available', 3, 3,
  '[{"id":"1","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 02: 1 casal, 1 solteiro, 1 solteiro (4 pessoas, 3 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (2, 0, 'standard', 'available', 4, 3,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":2}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 03: 3 solteiro + MOTORISTA (4 pessoas, 4 camas - incluindo extra motorista)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (3, 0, 'standard', 'available', 4, 4,
  '[{"id":"1","type":"solteiro","quantity":4}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 04: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (4, 0, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 05: 1 casal, 1 solteiro (3 pessoas, 2 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (5, 0, 'standard', 'available', 3, 2,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":1}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 06: 1 casal, 1 solteiro, 1 solteiro, 1 solteiro (5 pessoas, 4 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (6, 0, 'standard', 'available', 5, 4,
  '[{"id":"1","type":"casal","quantity":1},{"id":"2","type":"solteiro","quantity":3}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

-- Apto 07: 1 solteiro, 1 solteiro, 1 solteiro, 1 solteiro, 1 solteiro, 1 solteiro (6 pessoas, 6 camas)
INSERT INTO rooms (number, floor, type, status, capacity, beds, bed_configuration)
VALUES (7, 0, 'standard', 'available', 6, 6,
  '[{"id":"1","type":"solteiro","quantity":6}]'::jsonb)
ON CONFLICT (number) DO UPDATE SET
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  bed_configuration = EXCLUDED.bed_configuration;

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
  RAISE NOTICE '📍 DISTRIBUIÇÃO POR ANDAR:';
  RAISE NOTICE '  • Pousada (térreo): 7 apartamentos';
  RAISE NOTICE '  • 1º Andar: 14 apartamentos (8 prédio principal + 6 anexo)';
  RAISE NOTICE '  • 2º Andar: 8 apartamentos';
  RAISE NOTICE '  • 3º Andar: 8 apartamentos';
  RAISE NOTICE '  • 4º Andar: 14 apartamentos (7 prédio principal + 6 anexo + sem apto 45)';
  RAISE NOTICE '  • 5º Andar: 6 apartamentos (3 prédio principal + 3 anexo)';
  RAISE NOTICE '  • 6º Andar: 3 apartamentos';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Todos os apartamentos incluem:';
  RAISE NOTICE '   - Número do apartamento';
  RAISE NOTICE '   - Andar';
  RAISE NOTICE '   - Capacidade total de pessoas';
  RAISE NOTICE '   - Número total de camas';
  RAISE NOTICE '   - Configuração detalhada de camas (JSONB)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 NOTA: Use ON CONFLICT para atualizar apartamentos existentes';
  RAISE NOTICE '';
END $$;
