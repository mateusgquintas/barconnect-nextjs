-- BarConnect - Hotel + Romarias: Estrutura Integrada
-- Execute este SQL no Supabase SQL Editor

-- =============================
-- 1. TABELA DE ROMARIAS (GRUPOS DE VIAGEM)
-- =============================
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

-- =============================
-- 2. TABELA DE QUARTOS (VÍNCULO COM ROMARIA)
-- =============================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    type VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
    description TEXT,
    pilgrimage_id UUID REFERENCES public.pilgrimages(id), -- Vínculo com romaria
    guest_name VARCHAR(100),
    guest_cpf VARCHAR(20),
    guest_phone VARCHAR(30),
    guest_email VARCHAR(100),
    check_in_date DATE,
    check_out_date DATE,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- 3. TABELA DE HÓSPEDES (OPCIONAL, PARA HISTÓRICO DETALHADO)
-- =============================
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cpf VARCHAR(20),
    phone VARCHAR(30),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- 4. TABELA DE RESERVAS DE QUARTO (VÍNCULO COM ROMARIA E HÓSPEDE)
-- =============================
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

-- =============================
-- 5. ÍNDICES E CONSTRAINTS
-- =============================
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_number ON public.rooms(number);
CREATE INDEX IF NOT EXISTS idx_rooms_pilgrimage_id ON public.rooms(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_pilgrimage_id ON public.room_reservations(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_guest_id ON public.room_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_room_id ON public.room_reservations(room_id);

-- =============================
-- 6. COMENTÁRIOS
-- =============================
COMMENT ON TABLE public.pilgrimages IS 'Grupos de romaria/ônibus organizados para o hotel';
COMMENT ON TABLE public.rooms IS 'Quartos do hotel, podendo ser vinculados a uma romaria';
COMMENT ON TABLE public.guests IS 'Hóspedes individuais (opcional, para histórico detalhado)';
COMMENT ON TABLE public.room_reservations IS 'Reservas de quartos, vinculando hóspede, quarto e romaria';
