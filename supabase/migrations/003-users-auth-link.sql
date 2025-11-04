-- =============================================
-- 003 - Vincular usuários de aplicação ao Supabase Auth
-- =============================================
-- Objetivo: preparar migração para usar Supabase Auth como identidade
--           e a tabela public.users como perfil/roles da aplicação.
-- =============================================

BEGIN;

-- 1) Adicionar coluna de vínculo com auth.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID NULL UNIQUE;

-- 2) Índices úteis
CREATE INDEX IF NOT EXISTS idx_users_active_role ON public.users(active, role);

-- 3) Função helper para checar se usuário app está ativo e (opcionalmente) tem um papel
CREATE OR REPLACE FUNCTION public.is_app_user(required_role text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.active = true
      AND (
        required_role IS NULL
        OR u.role = required_role
        OR u.role = 'admin' -- admin tem passe-livre
      )
  );
$$;

COMMIT;
