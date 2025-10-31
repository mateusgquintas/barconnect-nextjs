-- ====================================================================
-- BARCONNECT - SCHEMA COMPLETO UNIFICADO
-- ====================================================================
-- Versão: 1.0
-- Data: 2025-10-31
-- Descrição: Script unificado para criação completa do banco de dados
--            Inclui: PDV/Bar, Hotel, Romarias e Agenda
-- 
-- IMPORTANTE: Este script cria TODA a estrutura do zero
-- Execute APENAS em banco de dados LIMPO ou para reset completo
-- ====================================================================

-- =============================================
-- EXTENSÕES NECESSÁRIAS
-- =============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- LIMPEZA COMPLETA (OPCIONAL - DESCOMENTE PARA USAR)
-- =============================================
-- ATENÇÃO: As linhas abaixo irão REMOVER todas as tabelas!
-- Descomente apenas se quiser fazer reset completo

/*
-- Remover views
DROP VIEW IF EXISTS sales_detailed CASCADE;
DROP VIEW IF EXISTS products_critical_stock CASCADE;

-- Remover triggers
DO $$
BEGIN
  IF to_regclass('public.comanda_items') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_comanda_total ON public.comanda_items';
  END IF;
  IF to_regclass('public.sale_items') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_stock_movement ON public.sale_items';
  END IF;
END $$;

-- Remover funções
DROP FUNCTION IF EXISTS update_comanda_total() CASCADE;
DROP FUNCTION IF EXISTS handle_stock_movement() CASCADE;
DROP FUNCTION IF EXISTS create_custom_sale_item(UUID, VARCHAR, DECIMAL, INTEGER, VARCHAR) CASCADE;

-- Remover tabelas (ordem respeitando foreign keys)
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.room_reservations CASCADE;
DROP TABLE IF EXISTS public.hotel_room_charges CASCADE;
DROP TABLE IF EXISTS public.hotel_reservations CASCADE;
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.comanda_items CASCADE;
DROP TABLE IF EXISTS public.comandas CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.hotel_guests CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.hotel_rooms CASCADE;
DROP TABLE IF EXISTS public.pilgrimages CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
*/

-- =============================================
-- PARTE 1: MÓDULO PDV/BAR
-- =============================================

-- 1.1. TABELA DE USUÁRIOS
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

COMMENT ON TABLE public.users IS 'Usuários do sistema (admin/operador)';

-- 1.2. TABELA DE PRODUTOS
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
    track_stock BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Catálogo de produtos com controle de estoque';
COMMENT ON COLUMN public.products.track_stock IS 'Se false, o produto não afeta estoque (ex: serviços)';
COMMENT ON COLUMN public.products.subcategory IS 'Subcategoria para melhor organização';

-- 1.3. TABELA DE COMANDAS
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

COMMENT ON TABLE public.comandas IS 'Comandas de mesa com status';

-- 1.4. TABELA DE ITENS DA COMANDA
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

COMMENT ON TABLE public.comanda_items IS 'Itens adicionados às comandas';

-- 1.5. TABELA DE VENDAS
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID REFERENCES public.comandas(id) ON DELETE SET NULL,
    sale_type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (sale_type IN ('direct', 'comanda')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit', 'debit', 'pix', 'courtesy', 'other', 'transfer')),
    is_courtesy BOOLEAN DEFAULT false,
    customer_name VARCHAR(255),
    items_snapshot JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.sales IS 'Registro final de todas as vendas';
COMMENT ON COLUMN public.sales.comanda_id IS 'Nullable para permitir remoção de comandas antigas';

-- 1.6. TABELA DE ITENS DA VENDA
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    is_custom_item BOOLEAN DEFAULT false,
    custom_category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.sale_items IS 'Detalhamento dos itens vendidos';
COMMENT ON COLUMN public.sale_items.product_id IS 'Nullable para itens customizados (sem cadastro no estoque)';
COMMENT ON COLUMN public.sale_items.is_custom_item IS 'True para itens criados na hora da venda';

-- 1.7. TABELA DE TRANSAÇÕES FINANCEIRAS
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

COMMENT ON TABLE public.transactions IS 'Transações financeiras (receitas/despesas)';

-- 1.8. TABELA DE MOVIMENTAÇÃO DE ESTOQUE
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

COMMENT ON TABLE public.stock_movements IS 'Histórico de movimentações de estoque';

-- =============================================
-- PARTE 2: MÓDULO HOTEL
-- =============================================

-- 2.1. TABELA DE QUARTOS DO HOTEL
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(10) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning')),
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.hotel_rooms IS 'Quartos do hotel';

-- 2.2. TABELA DE HÓSPEDES DO HOTEL
CREATE TABLE IF NOT EXISTS public.hotel_guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    document VARCHAR(30),
    phone VARCHAR(30),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.hotel_guests IS 'Hóspedes do hotel';

-- 2.3. TABELA DE RESERVAS DO HOTEL
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

COMMENT ON TABLE public.hotel_reservations IS 'Reservas de quartos do hotel';

-- 2.4. TABELA DE CONSUMOS NO QUARTO
CREATE TABLE IF NOT EXISTS public.hotel_room_charges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID NOT NULL REFERENCES public.hotel_reservations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.hotel_room_charges IS 'Consumos/extras lançados em reservas de quartos';

-- =============================================
-- PARTE 3: MÓDULO ROMARIAS
-- =============================================

-- 3.1. TABELA DE ROMARIAS
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

COMMENT ON TABLE public.pilgrimages IS 'Grupos de romaria/ônibus organizados para o hotel';

-- 3.2. TABELA DE QUARTOS (ROMARIAS/AGENDA)
-- Nota: Esta é diferente de hotel_rooms - serve para agenda e romarias
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    number INTEGER,
    type VARCHAR(50),
    capacity INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'cleaning', 'active', 'inactive')),
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

COMMENT ON TABLE public.rooms IS 'Quartos para agenda e romarias (diferente de hotel_rooms)';
COMMENT ON COLUMN public.rooms.name IS 'Nome do quarto (usado pela agenda)';
COMMENT ON COLUMN public.rooms.number IS 'Número do quarto (usado pelas romarias)';

-- 3.3. TABELA DE HÓSPEDES (ROMARIAS)
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cpf VARCHAR(20),
    phone VARCHAR(30),
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.guests IS 'Hóspedes individuais (para histórico detalhado de romarias)';

-- 3.4. TABELA DE RESERVAS DE QUARTOS (ROMARIAS)
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

COMMENT ON TABLE public.room_reservations IS 'Reservas de quartos vinculando hóspede, quarto e romaria';

-- =============================================
-- PARTE 4: MÓDULO AGENDA/BOOKINGS
-- =============================================

-- 4.1. TABELA DE BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    start TIMESTAMP WITH TIME ZONE NOT NULL,
    "end" TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out')),
    customer_name TEXT,
    pilgrimage_id UUID REFERENCES public.pilgrimages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (start < "end")
);

COMMENT ON TABLE public.bookings IS 'Reservas de agenda com intervalos de data/hora';
COMMENT ON COLUMN public.bookings."end" IS 'Data/hora final exclusiva (intervalo semi-aberto)';

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices PDV/Bar
CREATE UNIQUE INDEX IF NOT EXISTS idx_comandas_unique_number_open ON public.comandas(number) WHERE status = 'open';
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique ON public.products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comandas_status ON public.comandas(status);
CREATE INDEX IF NOT EXISTS idx_comandas_created_at ON public.comandas(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_type ON public.sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_comanda_id ON public.sales(comanda_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_track_stock ON public.products(track_stock) WHERE track_stock = false;
CREATE INDEX IF NOT EXISTS idx_products_category_subcategory ON public.products(category, subcategory) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_custom ON public.sale_items(is_custom_item) WHERE is_custom_item = true;
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON public.comanda_items(comanda_id);

-- Índices Hotel
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_status ON public.hotel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_room_id ON public.hotel_reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_guest_id ON public.hotel_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_status ON public.hotel_reservations(status);

-- Índices Romarias
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_number ON public.rooms(number) WHERE number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_pilgrimage_id ON public.rooms(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_pilgrimage_id ON public.room_reservations(pilgrimage_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_guest_id ON public.room_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_room_id ON public.room_reservations(room_id);

-- Índices Agenda/Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON public.bookings(start);
CREATE INDEX IF NOT EXISTS idx_bookings_end ON public.bookings("end");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON public.bookings(start, "end");

-- =============================================
-- TRIGGERS E FUNÇÕES
-- =============================================

-- Função: Atualizar total da comanda automaticamente
CREATE OR REPLACE FUNCTION update_comanda_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.comandas 
        SET total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM public.comanda_items 
            WHERE comanda_id = OLD.comanda_id
        ),
        updated_at = NOW()
        WHERE id = OLD.comanda_id;
        RETURN OLD;
    ELSE
        UPDATE public.comandas 
        SET total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM public.comanda_items 
            WHERE comanda_id = NEW.comanda_id
        ),
        updated_at = NOW()
        WHERE id = NEW.comanda_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comanda_total
    AFTER INSERT OR UPDATE OR DELETE ON public.comanda_items
    FOR EACH ROW
    EXECUTE FUNCTION update_comanda_total();

-- Função: Controlar estoque nas vendas
CREATE OR REPLACE FUNCTION handle_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
    new_stock_val INTEGER;
    should_track BOOLEAN;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Só processa se não for item customizado e tiver product_id
        IF NEW.product_id IS NOT NULL AND (NEW.is_custom_item IS FALSE OR NEW.is_custom_item IS NULL) THEN
            -- Verifica se o produto rastreia estoque
            SELECT track_stock INTO should_track
            FROM public.products
            WHERE id = NEW.product_id;
            
            -- Só atualiza estoque se track_stock = true
            IF should_track THEN
                -- Buscar estoque atual
                SELECT stock INTO current_stock 
                FROM public.products 
                WHERE id = NEW.product_id;
                
                -- Calcular novo estoque (nunca negativo)
                new_stock_val := GREATEST(0, current_stock - NEW.quantity);

                -- Atualizar estoque do produto
                UPDATE public.products 
                SET stock = new_stock_val,
                    updated_at = NOW()
                WHERE id = NEW.product_id;
                
                -- Registrar movimentação
                INSERT INTO public.stock_movements (
                    product_id, movement_type, quantity, 
                    previous_stock, new_stock, reason, sale_id
                ) VALUES (
                    NEW.product_id, 'out', NEW.quantity,
                    current_stock, new_stock_val,
                    'Venda de produto', NEW.sale_id
                );
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_movement
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_stock_movement();

-- Função: Criar item personalizado de venda
CREATE OR REPLACE FUNCTION create_custom_sale_item(
    p_sale_id UUID,
    p_name VARCHAR(255),
    p_price DECIMAL(10,2),
    p_quantity INTEGER,
    p_category VARCHAR(100) DEFAULT 'outros'
)
RETURNS UUID AS $$
DECLARE
    v_item_id UUID;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantidade deve ser maior que zero';
    END IF;
    
    IF p_price < 0 THEN
        RAISE EXCEPTION 'Preço não pode ser negativo';
    END IF;
    
    INSERT INTO public.sale_items (
        sale_id, product_id, product_name, product_price,
        quantity, is_custom_item, custom_category
    ) VALUES (
        p_sale_id, NULL, p_name, p_price,
        p_quantity, true, p_category
    ) RETURNING id INTO v_item_id;
    
    RETURN v_item_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS PARA RELATÓRIOS
-- =============================================

-- View: Vendas com detalhes
CREATE OR REPLACE VIEW sales_detailed AS
SELECT 
    s.id as sale_id,
    s.sale_type,
    s.total,
    s.payment_method,
    s.is_courtesy,
    s.customer_name,
    s.created_at,
    DATE(s.created_at) as sale_date,
    TO_CHAR(s.created_at, 'HH24:MI') as sale_time,
    c.number as comanda_number,
    c.table_number,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'product_id', si.product_id,
                'product_name', si.product_name,
                'price', si.product_price,
                'quantity', si.quantity,
                'subtotal', si.subtotal,
                'is_custom', si.is_custom_item,
                'custom_category', si.custom_category
            )
        ) FILTER (WHERE si.id IS NOT NULL), 
        '[]'::JSON
    ) as items
FROM public.sales s
LEFT JOIN public.comandas c ON s.comanda_id = c.id
LEFT JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY 
    s.id, s.sale_type, s.total, s.payment_method, s.is_courtesy, 
    s.customer_name, s.created_at, c.number, c.table_number
ORDER BY s.created_at DESC;

-- View: Produtos com estoque crítico
CREATE OR REPLACE VIEW products_critical_stock AS
SELECT 
    id, name, stock, min_stock, category, subcategory,
    (stock - min_stock) as stock_difference,
    CASE 
        WHEN stock <= 0 THEN 'out_of_stock'
        WHEN stock <= min_stock THEN 'critical'
        WHEN stock <= min_stock * 1.5 THEN 'low'
        ELSE 'normal'
    END as stock_status
FROM public.products 
WHERE active = true AND track_stock = true
ORDER BY stock_difference ASC;

-- =============================================
-- ROW LEVEL SECURITY (RLS) - OPCIONAL
-- =============================================
-- Descomente para ativar RLS na agenda

/*
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read rooms" ON public.rooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read bookings" ON public.bookings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (true);
*/

-- ====================================================================
-- FINALIZAÇÃO
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================================';
    RAISE NOTICE '✅ BARCONNECT - Schema completo criado com sucesso!';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'Módulos instalados:';
    RAISE NOTICE '  ✓ PDV/Bar (comandas, vendas, estoque)';
    RAISE NOTICE '  ✓ Hotel (quartos, hóspedes, reservas)';
    RAISE NOTICE '  ✓ Romarias (grupos, quartos, reservas)';
    RAISE NOTICE '  ✓ Agenda (bookings)';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Execute 01-DADOS-INICIAIS.sql para popular dados exemplo';
    RAISE NOTICE '  2. Configure autenticação e permissões conforme necessário';
    RAISE NOTICE '  3. Execute scripts de manutenção quando necessário';
    RAISE NOTICE '====================================================================';
END $$;

-- Fim do script
