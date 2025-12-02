-- DEPRECATED - NÃO UTILIZAR
-- Este arquivo foi substituído por supabase/schema-unificado.sql
-- Mantido apenas para histórico. Use o schema unificado.
-- =============================================
--
-- =============================================
-- BARCONNECT - SCHEMA HOTEL/ROMARIAS (Sistema de Hospedagem)
-- =============================================
-- Descrição: Sistema de gestão de quartos e romarias
-- Data: 31/10/2025
-- Status: ✅ PRODUÇÃO (ESTRUTURA ATUAL EM USO)
-- =============================================

-- =============================================
-- 1. TABELA DE ROMARIAS (GRUPOS DE VIAGEM)
-- =============================================
-- Propósito: Grupos organizados de hóspedes (ônibus de romaria)
-- Usado em: hooks/usePilgrimagesDB.ts, components/HotelPilgrimages.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.pilgrimages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    number_of_people INTEGER NOT NULL DEFAULT 0,
    bus_group VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pilgrimages_status ON public.pilgrimages(status);
CREATE INDEX IF NOT EXISTS idx_pilgrimages_arrival_date ON public.pilgrimages(arrival_date);
CREATE INDEX IF NOT EXISTS idx_pilgrimages_departure_date ON public.pilgrimages(departure_date);

-- Comentários
COMMENT ON TABLE public.pilgrimages IS 'Grupos de romaria/ônibus organizados';
COMMENT ON COLUMN public.pilgrimages.bus_group IS 'Identificação do ônibus/grupo';
COMMENT ON COLUMN public.pilgrimages.status IS 'active = ativa, completed = concluída, cancelled = cancelada';

-- =============================================
-- 2. TABELA DE QUARTOS (COM DADOS DE HÓSPEDES)
-- =============================================
-- Propósito: Quartos do hotel com dados de check-in/hóspede
-- Usado em: hooks/useRoomsDB.ts, components/Hotel.tsx
-- NOTA: Estrutura atual mistura dados de quarto + hóspede (desnormalizado)
-- =============================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    type VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
    description TEXT,
    
    -- Vínculo com romaria
    pilgrimage_id UUID REFERENCES public.pilgrimages(id),
    
    -- Dados do hóspede (desnormalizado - atualmente armazenado aqui)
    guest_name VARCHAR(100),
    guest_cpf VARCHAR(20),
    guest_phone VARCHAR(30),
    guest_email VARCHAR(100),
    
    -- Datas de check-in/out
    check_in_date DATE,
    check_out_date DATE,
    
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_number ON public.rooms(number);
CREATE INDEX IF NOT EXISTS idx_rooms_pilgrimage_id ON public.rooms(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_check_in_date ON public.rooms(check_in_date);
CREATE INDEX IF NOT EXISTS idx_rooms_check_out_date ON public.rooms(check_out_date);

-- Comentários
COMMENT ON TABLE public.rooms IS 'Quartos do hotel com dados de hóspede atual';
COMMENT ON COLUMN public.rooms.pilgrimage_id IS 'Romaria associada ao quarto (se houver)';
COMMENT ON COLUMN public.rooms.guest_name IS 'Nome do hóspede atual (estrutura desnormalizada)';
COMMENT ON COLUMN public.rooms.number IS 'Número do quarto (único)';

-- =============================================
-- 3. TABELA DE HÓSPEDES (HISTÓRICO)
-- =============================================
-- Propósito: Histórico de hóspedes (não usado ativamente no código atual)
-- Usado em: Apenas em database/clean-transactional-data.js
-- Status: ⚠️ TABELA EXISTE MAS NÃO TEM INTERFACE
-- =============================================
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cpf VARCHAR(20),
    phone VARCHAR(30),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_guests_cpf ON public.guests(cpf);
CREATE INDEX IF NOT EXISTS idx_guests_name ON public.guests(name);

-- Comentários
COMMENT ON TABLE public.guests IS 'Histórico de hóspedes (não usado ativamente)';

-- =============================================
-- 4. TABELA DE RESERVAS DE QUARTO
-- =============================================
-- Propósito: Reservas de quartos vinculando hóspede + romaria
-- Usado em: lib/agendaService.ts (apenas leitura, sem interface CRUD)
-- Status: ⚠️ TABELA USADA MAS SEM INTERFACE DE GESTÃO
-- =============================================
CREATE TABLE IF NOT EXISTS public.room_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id),
    guest_id UUID REFERENCES public.guests(id),
    pilgrimage_id UUID REFERENCES public.pilgrimages(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_room_reservations_pilgrimage_id ON public.room_reservations(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_guest_id ON public.room_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_room_id ON public.room_reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_status ON public.room_reservations(status);
CREATE INDEX IF NOT EXISTS idx_room_reservations_check_in_date ON public.room_reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_room_reservations_check_out_date ON public.room_reservations(check_out_date);

-- Comentários
COMMENT ON TABLE public.room_reservations IS 'Reservas de quartos (usado em agendaService, sem interface)';

-- =============================================
-- QUERIES ÚTEIS PARA O SISTEMA ATUAL
-- =============================================

-- Query 1: Listar quartos de uma romaria
-- SELECT r.number, r.guest_name, r.status
-- FROM rooms r
-- WHERE r.pilgrimage_id = 'uuid-da-romaria'
-- ORDER BY r.number;

-- Query 2: Ocupação atual do hotel
-- SELECT 
--   status,
--   COUNT(*) as quantidade
-- FROM rooms
-- GROUP BY status;

-- Query 3: Romarias ativas com quartos
-- SELECT 
--   p.name,
--   p.arrival_date,
--   p.departure_date,
--   COUNT(r.id) as total_quartos
-- FROM pilgrimages p
-- LEFT JOIN rooms r ON r.pilgrimage_id = p.id
-- WHERE p.status = 'active'
-- GROUP BY p.id, p.name, p.arrival_date, p.departure_date;

-- =============================================
-- OBSERVAÇÕES IMPORTANTES
-- =============================================

-- 📌 ESTRUTURA ATUAL (Em uso no código):
--    - pilgrimages: ✅ Usado ativamente
--    - rooms: ✅ Usado ativamente (estrutura desnormalizada)
--    - guests: ⚠️ Existe mas não tem interface
--    - room_reservations: ⚠️ Usado parcialmente (apenas leitura)

-- 📌 LIMITAÇÕES ATUAIS:
--    - rooms mistura dados de quarto + hóspede (não normalizado)
--    - Não permite múltiplos hóspedes por quarto
--    - Não permite múltiplos quartos facilmente por romaria
--    - Não há histórico de check-ins anteriores

-- 📌 MELHORIAS FUTURAS (Opcional):
--    - Criar tabela pilgrimage_rooms (junção N:N)
--    - Separar dados de hóspede da tabela rooms
--    - Criar interface para gestão de reservas
--    - Adicionar histórico de check-ins

-- =============================================
-- FINALIZAÇÃO
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema Hotel/Romarias criado!';
    RAISE NOTICE '📊 Tabelas: 4';
    RAISE NOTICE '⚠️  Estrutura atual (desnormalizada em uso)';
END $$;
