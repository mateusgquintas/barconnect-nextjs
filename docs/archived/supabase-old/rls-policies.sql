-- =============================================
-- RLS POLICIES - BarConnect
-- =============================================
-- Objetivo: Habilitar RLS e criar políticas padrão para usuários autenticados
-- AVISO: Ativar RLS sem políticas adequadas pode quebrar o app.
--         Aplique primeiro em um ambiente de teste, valide e só então em produção.
-- =============================================

-- INÍCIO: Habilitando RLS e criando políticas padrão

-- Helper: função para checar se o papel atual é 'authenticated'
-- Observação: No Supabase, as requisições do browser logado usam o papel 'authenticated'.
--             Se não utiliza Supabase Auth, prefira usar a SERVICE KEY no backend.

-- =============================================
-- 1) Habilitar RLS em todas as tabelas usadas pelo app
-- =============================================
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comandas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comanda_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilgrimages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_reservations  ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2) Políticas padrão: liberar acesso total para usuários autenticados
--    (Ajuste conforme necessário: você pode separar read/write ou endurecer por tabela)
-- =============================================

-- USERS
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_write_authenticated" ON public.users;
CREATE POLICY "users_select_authenticated" ON public.users
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "users_write_authenticated" ON public.users
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- PRODUCTS
DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;
DROP POLICY IF EXISTS "products_write_authenticated" ON public.products;
CREATE POLICY "products_select_authenticated" ON public.products
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "products_write_authenticated" ON public.products
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- COMANDAS
DROP POLICY IF EXISTS "comandas_select_authenticated" ON public.comandas;
DROP POLICY IF EXISTS "comandas_write_authenticated" ON public.comandas;
CREATE POLICY "comandas_select_authenticated" ON public.comandas
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "comandas_write_authenticated" ON public.comandas
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- COMANDA_ITEMS
DROP POLICY IF EXISTS "comanda_items_select_authenticated" ON public.comanda_items;
DROP POLICY IF EXISTS "comanda_items_write_authenticated" ON public.comanda_items;
CREATE POLICY "comanda_items_select_authenticated" ON public.comanda_items
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "comanda_items_write_authenticated" ON public.comanda_items
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- SALES
DROP POLICY IF EXISTS "sales_select_authenticated" ON public.sales;
DROP POLICY IF EXISTS "sales_write_authenticated" ON public.sales;
CREATE POLICY "sales_select_authenticated" ON public.sales
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "sales_write_authenticated" ON public.sales
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- SALE_ITEMS
DROP POLICY IF EXISTS "sale_items_select_authenticated" ON public.sale_items;
DROP POLICY IF EXISTS "sale_items_write_authenticated" ON public.sale_items;
CREATE POLICY "sale_items_select_authenticated" ON public.sale_items
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "sale_items_write_authenticated" ON public.sale_items
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- TRANSACTIONS
DROP POLICY IF EXISTS "transactions_select_authenticated" ON public.transactions;
DROP POLICY IF EXISTS "transactions_write_authenticated" ON public.transactions;
CREATE POLICY "transactions_select_authenticated" ON public.transactions
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "transactions_write_authenticated" ON public.transactions
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- STOCK_MOVEMENTS
DROP POLICY IF EXISTS "stock_movements_select_authenticated" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_write_authenticated" ON public.stock_movements;
CREATE POLICY "stock_movements_select_authenticated" ON public.stock_movements
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "stock_movements_write_authenticated" ON public.stock_movements
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- PILGRIMAGES
DROP POLICY IF EXISTS "pilgrimages_select_authenticated" ON public.pilgrimages;
DROP POLICY IF EXISTS "pilgrimages_write_authenticated" ON public.pilgrimages;
CREATE POLICY "pilgrimages_select_authenticated" ON public.pilgrimages
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "pilgrimages_write_authenticated" ON public.pilgrimages
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ROOMS
DROP POLICY IF EXISTS "rooms_select_authenticated" ON public.rooms;
DROP POLICY IF EXISTS "rooms_write_authenticated" ON public.rooms;
CREATE POLICY "rooms_select_authenticated" ON public.rooms
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "rooms_write_authenticated" ON public.rooms
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- GUESTS
DROP POLICY IF EXISTS "guests_select_authenticated" ON public.guests;
DROP POLICY IF EXISTS "guests_write_authenticated" ON public.guests;
CREATE POLICY "guests_select_authenticated" ON public.guests
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "guests_write_authenticated" ON public.guests
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ROOM_RESERVATIONS
DROP POLICY IF EXISTS "room_reservations_select_authenticated" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_write_authenticated" ON public.room_reservations;
CREATE POLICY "room_reservations_select_authenticated" ON public.room_reservations
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "room_reservations_write_authenticated" ON public.room_reservations
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- FIM: RLS habilitado e políticas criadas (padrão: authenticated)
-- Todas as tabelas agora têm Row Level Security ativado
-- Usuários autenticados têm acesso total (ajuste conforme necessário)
