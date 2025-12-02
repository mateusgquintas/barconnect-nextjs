-- BarConnect - Módulo Hotel: Estrutura de Banco de Dados
-- Execute este SQL no Supabase SQL Editor

-- =============================
-- 1. TABELA DE QUARTOS
-- =============================
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(10) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- Ex: solteiro, casal, suíte
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- 2. TABELA DE HÓSPEDES
-- =============================
CREATE TABLE IF NOT EXISTS public.hotel_guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    document VARCHAR(30), -- RG, CPF, passaporte
    phone VARCHAR(30),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- 3. TABELA DE RESERVAS
-- =============================
CREATE TABLE IF NOT EXISTS public.hotel_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.hotel_rooms(id),
    guest_id UUID NOT NULL REFERENCES public.hotel_guests(id),
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    total_value DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- 4. TABELA DE CONSUMOS NO QUARTO (EXTRAS)
-- =============================
CREATE TABLE IF NOT EXISTS public.hotel_room_charges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID NOT NULL REFERENCES public.hotel_reservations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- 5. ÍNDICES E CONSTRAINTS
-- =============================
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_status ON public.hotel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_room_id ON public.hotel_reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_guest_id ON public.hotel_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_status ON public.hotel_reservations(status);

-- =============================
-- 6. COMENTÁRIOS
-- =============================
COMMENT ON TABLE public.hotel_rooms IS 'Quartos do hotel';
COMMENT ON TABLE public.hotel_guests IS 'Hóspedes do hotel';
COMMENT ON TABLE public.hotel_reservations IS 'Reservas de quartos do hotel';
COMMENT ON TABLE public.hotel_room_charges IS 'Consumos/extras lançados em reservas de quartos';

-- =============================
-- 7. EXEMPLOS DE USO
-- =============================
-- Inserir quarto:
-- INSERT INTO public.hotel_rooms (number, type, description, daily_rate) VALUES ('101', 'casal', 'Suíte com ar-condicionado', 250.00);
-- Inserir hóspede:
-- INSERT INTO public.hotel_guests (name, document, phone) VALUES ('João da Silva', '123456789', '11999999999');
-- Inserir reserva:
-- INSERT INTO public.hotel_reservations (room_id, guest_id, checkin_date, checkout_date) VALUES ('<room_uuid>', '<guest_uuid>', '2025-10-12', '2025-10-15');
-- Lançar consumo:
-- INSERT INTO public.hotel_room_charges (reservation_id, description, amount) VALUES ('<reservation_uuid>', 'Água mineral', 5.00);
