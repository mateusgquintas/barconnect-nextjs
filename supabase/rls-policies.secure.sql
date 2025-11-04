-- =============================================
-- RLS POLICIES (SECURE) - BarConnect
-- =============================================
-- Objetivo: políticas de longo prazo:
--  - Nenhum acesso para 'anon'
--  - Somente usuários autenticados PRESENTES em public.users(active=true)
--  - Regras por papel (role): operator, admin
--  - Produtos: write só admin; demais: ver
--  - Comandas/Vendas/Itens: write operator+admin
--  - Transações: write admin (ajuste conforme o negócio)
--  - Movimentações de estoque: write via operação de venda (operator+admin)
-- IMPORTANTE: Aplique após vincular auth_user_id e garantir login via Supabase Auth.
-- =============================================

BEGIN;

-- Ativar RLS (se ainda não ativado)
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

-- Remover políticas antigas genéricas (se existirem)
DO $$
DECLARE r record; BEGIN
  FOR r IN SELECT polname, tablename FROM pg_policies WHERE schemaname='public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.polname, r.tablename);
  END LOOP;
END$$;

-- BASE: somente authenticated e que existam em public.users(active=true)
-- Helper: função is_app_user(required_role text default null) já criada na migração 003.

-- USERS
CREATE POLICY users_select_self ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Admin pode ver/editar todos os perfis
CREATE POLICY users_admin_all ON public.users
  FOR ALL TO authenticated
  USING (public.is_app_user('admin'))
  WITH CHECK (public.is_app_user('admin'));

-- PRODUCTS
CREATE POLICY products_read_app ON public.products
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY products_write_admin ON public.products
  FOR ALL TO authenticated
  USING (public.is_app_user('admin'))
  WITH CHECK (public.is_app_user('admin'));

-- COMANDAS
CREATE POLICY comandas_read_app ON public.comandas
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY comandas_write_ops ON public.comandas
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

-- COMANDA_ITEMS
CREATE POLICY comanda_items_read_app ON public.comanda_items
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY comanda_items_write_ops ON public.comanda_items
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

-- SALES
CREATE POLICY sales_read_app ON public.sales
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY sales_write_ops ON public.sales
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

-- SALE_ITEMS
CREATE POLICY sale_items_read_app ON public.sale_items
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY sale_items_write_ops ON public.sale_items
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

-- TRANSACTIONS
CREATE POLICY transactions_read_app ON public.transactions
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY transactions_write_admin ON public.transactions
  FOR ALL TO authenticated
  USING (public.is_app_user('admin'))
  WITH CHECK (public.is_app_user('admin'));

-- STOCK_MOVEMENTS
CREATE POLICY stock_movements_read_app ON public.stock_movements
  FOR SELECT TO authenticated
  USING (public.is_app_user());

-- Permitimos insert/update por operator para suportar trigger de venda
CREATE POLICY stock_movements_write_ops ON public.stock_movements
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

-- PILGRIMAGES / ROOMS / GUESTS / RESERVATIONS
CREATE POLICY pilgrimages_read_app ON public.pilgrimages
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY pilgrimages_write_ops ON public.pilgrimages
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

CREATE POLICY rooms_read_app ON public.rooms
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY rooms_write_ops ON public.rooms
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

CREATE POLICY guests_read_app ON public.guests
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY guests_write_ops ON public.guests
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

CREATE POLICY room_reservations_read_app ON public.room_reservations
  FOR SELECT TO authenticated
  USING (public.is_app_user());

CREATE POLICY room_reservations_write_ops ON public.room_reservations
  FOR ALL TO authenticated
  USING (public.is_app_user('operator'))
  WITH CHECK (public.is_app_user('operator'));

COMMIT;
