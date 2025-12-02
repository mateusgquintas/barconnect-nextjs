-- =============================================
-- BARCONNECT - SCHEMA UNIFICADO (PDV + HOTEL/ROMARIAS)
-- =============================================
-- Objetivo: Consolidar toda a estrutura em UM ÚNICO SCHEMA, removendo duplicidades
-- Data: 2025-11-01
-- Segurança: Script idempotente, com limpeza segura das tabelas duplicadas hotel_*
-- =============================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- [A] LIMPEZA SEGURA DE TABELAS DUPLICADAS (NÃO USADAS NO CÓDIGO)
--     - hotel_rooms, hotel_guests, hotel_reservations, hotel_room_charges
--     - Regras:
--       1) Se estiverem VAZIAS -> DROP
--       2) Se tiverem dados      -> RENAME para *_backup (preserva dados)
-- =============================================
DO $$
DECLARE
  has_hotel_rooms boolean := (SELECT to_regclass('public.hotel_rooms') IS NOT NULL);
  has_hotel_guests boolean := (SELECT to_regclass('public.hotel_guests') IS NOT NULL);
  has_hotel_reservations boolean := (SELECT to_regclass('public.hotel_reservations') IS NOT NULL);
  has_hotel_room_charges boolean := (SELECT to_regclass('public.hotel_room_charges') IS NOT NULL);

  cnt_rooms int := 0;
  cnt_guests int := 0;
  cnt_res int := 0;
  cnt_charges int := 0;
BEGIN
  RAISE NOTICE '=== LIMPEZA DE TABELAS DUPLICADAS (hotel_*) ===';

  IF has_hotel_room_charges THEN
    EXECUTE 'SELECT COUNT(*) FROM public.hotel_room_charges' INTO cnt_charges;
    IF cnt_charges = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.hotel_room_charges CASCADE';
      RAISE NOTICE 'Removido: hotel_room_charges (vazia)';
    ELSE
      IF to_regclass('public.hotel_room_charges_backup') IS NULL THEN
        EXECUTE 'ALTER TABLE public.hotel_room_charges RENAME TO hotel_room_charges_backup';
        RAISE NOTICE 'Renomeado: hotel_room_charges -> hotel_room_charges_backup (preservado)';
      END IF;
    END IF;
  END IF;

  IF has_hotel_reservations THEN
    EXECUTE 'SELECT COUNT(*) FROM public.hotel_reservations' INTO cnt_res;
    IF cnt_res = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.hotel_reservations CASCADE';
      RAISE NOTICE 'Removido: hotel_reservations (vazia)';
    ELSE
      IF to_regclass('public.hotel_reservations_backup') IS NULL THEN
        EXECUTE 'ALTER TABLE public.hotel_reservations RENAME TO hotel_reservations_backup';
        RAISE NOTICE 'Renomeado: hotel_reservations -> hotel_reservations_backup (preservado)';
      END IF;
    END IF;
  END IF;

  IF has_hotel_guests THEN
    EXECUTE 'SELECT COUNT(*) FROM public.hotel_guests' INTO cnt_guests;
    IF cnt_guests = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.hotel_guests CASCADE';
      RAISE NOTICE 'Removido: hotel_guests (vazia)';
    ELSE
      IF to_regclass('public.hotel_guests_backup') IS NULL THEN
        EXECUTE 'ALTER TABLE public.hotel_guests RENAME TO hotel_guests_backup';
        RAISE NOTICE 'Renomeado: hotel_guests -> hotel_guests_backup (preservado)';
      END IF;
    END IF;
  END IF;

  IF has_hotel_rooms THEN
    EXECUTE 'SELECT COUNT(*) FROM public.hotel_rooms' INTO cnt_rooms;
    IF cnt_rooms = 0 THEN
      EXECUTE 'DROP TABLE IF EXISTS public.hotel_rooms CASCADE';
      RAISE NOTICE 'Removido: hotel_rooms (vazia)';
    ELSE
      IF to_regclass('public.hotel_rooms_backup') IS NULL THEN
        EXECUTE 'ALTER TABLE public.hotel_rooms RENAME TO hotel_rooms_backup';
        RAISE NOTICE 'Renomeado: hotel_rooms -> hotel_rooms_backup (preservado)';
      END IF;
    END IF;
  END IF;

  RAISE NOTICE '=== FIM DA LIMPEZA DE TABELAS DUPLICADAS ===';
END $$;

-- =============================================
-- [B] SCHEMA PDV (Comandas, Vendas, Estoque)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(active);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10,2) DEFAULT 0 CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 20,
    category VARCHAR(100) DEFAULT 'geral',
    subcategory VARCHAR(100),
    barcode VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique ON public.products(barcode) WHERE barcode IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.comandas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    table_number INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_comandas_status ON public.comandas(status);
CREATE INDEX IF NOT EXISTS idx_comandas_created_at ON public.comandas(created_at);
CREATE INDEX IF NOT EXISTS idx_comandas_number ON public.comandas(number);
CREATE INDEX IF NOT EXISTS idx_comandas_table_number ON public.comandas(table_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_comandas_unique_number_open ON public.comandas(number) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS public.comanda_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID NOT NULL REFERENCES public.comandas(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON public.comanda_items(comanda_id);
CREATE INDEX IF NOT EXISTS idx_comanda_items_product_id ON public.comanda_items(product_id);

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID REFERENCES public.comandas(id),
    sale_type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (sale_type IN ('direct', 'comanda')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit', 'debit', 'pix', 'courtesy', 'other', 'transfer')),
    is_courtesy BOOLEAN DEFAULT false,
    customer_name VARCHAR(255),
    items_snapshot JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_type ON public.sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_comanda_id ON public.sales(comanda_id);
CREATE INDEX IF NOT EXISTS idx_sales_is_courtesy ON public.sales(is_courtesy);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) DEFAULT 'geral',
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_sale_id ON public.transactions(sale_id);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(255),
    sale_id UUID REFERENCES public.sales(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON public.stock_movements(movement_type);

-- Triggers PDV
CREATE OR REPLACE FUNCTION update_comanda_total()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.comandas 
      SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM public.comanda_items WHERE comanda_id = OLD.comanda_id),
          updated_at = NOW()
    WHERE id = OLD.comanda_id;
    RETURN OLD;
  ELSE
    UPDATE public.comandas 
      SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM public.comanda_items WHERE comanda_id = NEW.comanda_id),
          updated_at = NOW()
    WHERE id = NEW.comanda_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_comanda_total ON public.comanda_items;
CREATE TRIGGER trigger_update_comanda_total
  AFTER INSERT OR UPDATE OR DELETE ON public.comanda_items
  FOR EACH ROW EXECUTE FUNCTION update_comanda_total();

CREATE OR REPLACE FUNCTION handle_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  current_stock INTEGER;
  new_stock_val INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT stock INTO current_stock FROM public.products WHERE id = NEW.product_id;
    new_stock_val := GREATEST(0, current_stock - NEW.quantity);
    UPDATE public.products SET stock = new_stock_val, updated_at = NOW() WHERE id = NEW.product_id;
    INSERT INTO public.stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, reason, sale_id)
    VALUES (NEW.product_id, 'out', NEW.quantity, current_stock, new_stock_val, 'Venda de produto', NEW.sale_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_stock_movement ON public.sale_items;
CREATE TRIGGER trigger_stock_movement
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION handle_stock_movement();

-- Views PDV (drop e recria para evitar erro 42P16 ao alterar colunas)
DROP VIEW IF EXISTS public.sales_detailed;
CREATE VIEW public.sales_detailed AS
SELECT 
  s.id,
  s.sale_type,
  s.total,
  s.payment_method,
  s.is_courtesy,
  s.customer_name,
  s.created_at,
  c.number as comanda_number,
  c.table_number,
  COUNT(si.id) as items_count,
  STRING_AGG(si.product_name || ' (' || si.quantity || 'x)', ', ') as items_summary
FROM public.sales s
LEFT JOIN public.comandas c ON s.comanda_id = c.id
LEFT JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY s.id, c.number, c.table_number;

DROP VIEW IF EXISTS public.products_critical_stock;
CREATE VIEW public.products_critical_stock AS
SELECT 
  id, name, stock, min_stock, category,
  (stock - min_stock) as stock_difference,
  CASE 
    WHEN stock <= 0 THEN 'out_of_stock'
    WHEN stock <= min_stock THEN 'critical'
    WHEN stock <= min_stock * 1.5 THEN 'low'
    ELSE 'normal'
  END as stock_status
FROM public.products 
WHERE active = true
ORDER BY stock_difference ASC;

-- =============================================
-- [C] SCHEMA HOTEL/ROMARIAS (Estrutura em uso no código)
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
CREATE INDEX IF NOT EXISTS idx_pilgrimages_status ON public.pilgrimages(status);
CREATE INDEX IF NOT EXISTS idx_pilgrimages_arrival_date ON public.pilgrimages(arrival_date);
CREATE INDEX IF NOT EXISTS idx_pilgrimages_departure_date ON public.pilgrimages(departure_date);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
  description TEXT,
  pilgrimage_id UUID REFERENCES public.pilgrimages(id),
  guest_name VARCHAR(100),
  guest_cpf VARCHAR(20),
  guest_phone VARCHAR(30),
  guest_email VARCHAR(100),
  check_in_date DATE,
  check_out_date DATE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_number ON public.rooms(number);
CREATE INDEX IF NOT EXISTS idx_rooms_pilgrimage_id ON public.rooms(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_check_in_date ON public.rooms(check_in_date);
CREATE INDEX IF NOT EXISTS idx_rooms_check_out_date ON public.rooms(check_out_date);

CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cpf VARCHAR(20),
  phone VARCHAR(30),
  email VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guests_cpf ON public.guests(cpf);
CREATE INDEX IF NOT EXISTS idx_guests_name ON public.guests(name);

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
CREATE INDEX IF NOT EXISTS idx_room_reservations_pilgrimage_id ON public.room_reservations(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_guest_id ON public.room_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_room_id ON public.room_reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_status ON public.room_reservations(status);
CREATE INDEX IF NOT EXISTS idx_room_reservations_check_in_date ON public.room_reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_room_reservations_check_out_date ON public.room_reservations(check_out_date);

-- =============================================
-- [D] FINALIZAÇÃO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '🎉 Schema unificado aplicado com sucesso!';
  RAISE NOTICE '✅ PDV + HOTEL/ROMARIAS consolidado e pronto.';
  RAISE NOTICE 'ℹ️  Tabelas hotel_* foram removidas se vazias, ou preservadas como *_backup se tinham dados.';
END $$;
