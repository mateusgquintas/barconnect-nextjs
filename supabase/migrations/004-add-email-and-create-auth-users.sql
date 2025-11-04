-- =============================================
-- 004 - Adicionar email e criar usuários no Supabase Auth
-- =============================================
-- Objetivo: 
--   1. Adicionar coluna email em public.users
--   2. Criar usuários admin e operador no Supabase Auth
--   3. Vincular automaticamente com auth_user_id
-- =============================================

BEGIN;

-- =============================================
-- PARTE 1: Adicionar coluna email
-- =============================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL UNIQUE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Atualizar emails baseado nos usernames existentes
-- Se username já é email, usar ele
-- Se não, criar email baseado no username
UPDATE public.users
SET email = CASE 
  WHEN username LIKE '%@%' THEN username
  ELSE username || '@barconnect.com'
END
WHERE email IS NULL;

RAISE NOTICE '✅ Coluna email adicionada e populada';

-- =============================================
-- PARTE 2: Criar usuários no Supabase Auth
-- =============================================
-- IMPORTANTE: Senhas padrão são admin123 e operador123
-- Você pode (e deve!) mudar isso no Dashboard depois

-- Função helper para criar usuário no auth.users
CREATE OR REPLACE FUNCTION create_auth_user_if_not_exists(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Verificar se usuário já existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE '⚠️  Usuário já existe: %', p_email;
    RETURN v_user_id;
  END IF;
  
  -- Criar novo usuário
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(p_password, gen_salt('bf'));
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_password,
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('name', COALESCE(p_name, split_part(p_email, '@', 1))),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Criar identity também (necessário para login)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', p_email
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Usuário criado: % (id: %)', p_email, v_user_id;
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar usuário admin
DO $$
DECLARE
  v_admin_auth_id UUID;
  v_admin_email TEXT := 'admin@barconnect.com';
  v_admin_password TEXT := 'admin123'; -- ⚠️ MUDAR NO DASHBOARD DEPOIS!
BEGIN
  -- Criar no auth.users
  v_admin_auth_id := create_auth_user_if_not_exists(
    v_admin_email,
    v_admin_password,
    'Administrador'
  );
  
  -- Atualizar ou criar em public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE username = 'admin' OR email = v_admin_email) THEN
    -- Atualizar existente
    UPDATE public.users
    SET auth_user_id = v_admin_auth_id,
        email = v_admin_email,
        username = v_admin_email
    WHERE username = 'admin' OR email = v_admin_email;
    RAISE NOTICE '✅ Admin vinculado: username=% → auth_user_id=%', v_admin_email, v_admin_auth_id;
  ELSE
    -- Criar novo
    INSERT INTO public.users (username, email, password, name, role, active, auth_user_id)
    VALUES (v_admin_email, v_admin_email, '', 'Administrador', 'admin', true, v_admin_auth_id);
    RAISE NOTICE '✅ Admin criado: % (auth_user_id: %)', v_admin_email, v_admin_auth_id;
  END IF;
END $$;

-- Criar usuário operador
DO $$
DECLARE
  v_oper_auth_id UUID;
  v_oper_email TEXT := 'operador@barconnect.com';
  v_oper_password TEXT := 'operador123'; -- ⚠️ MUDAR NO DASHBOARD DEPOIS!
BEGIN
  -- Criar no auth.users
  v_oper_auth_id := create_auth_user_if_not_exists(
    v_oper_email,
    v_oper_password,
    'Operador'
  );
  
  -- Atualizar ou criar em public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE username = 'operador' OR email = v_oper_email) THEN
    -- Atualizar existente
    UPDATE public.users
    SET auth_user_id = v_oper_auth_id,
        email = v_oper_email,
        username = v_oper_email
    WHERE username = 'operador' OR email = v_oper_email;
    RAISE NOTICE '✅ Operador vinculado: username=% → auth_user_id=%', v_oper_email, v_oper_auth_id;
  ELSE
    -- Criar novo
    INSERT INTO public.users (username, email, password, name, role, active, auth_user_id)
    VALUES (v_oper_email, v_oper_email, '', 'Operador', 'operator', true, v_oper_auth_id);
    RAISE NOTICE '✅ Operador criado: % (auth_user_id: %)', v_oper_email, v_oper_auth_id;
  END IF;
END $$;

-- Limpar função temporária
DROP FUNCTION IF EXISTS create_auth_user_if_not_exists(TEXT, TEXT, TEXT);

RAISE NOTICE '=================================================';
RAISE NOTICE '✅ MIGRAÇÃO 004 CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '=================================================';
RAISE NOTICE 'Usuários criados:';
RAISE NOTICE '  - admin@barconnect.com / admin123';
RAISE NOTICE '  - operador@barconnect.com / operador123';
RAISE NOTICE '';
RAISE NOTICE '⚠️  IMPORTANTE: Mude as senhas no Dashboard do Supabase!';
RAISE NOTICE '    Authentication → Users → [usuário] → Reset Password';
RAISE NOTICE '=================================================';

COMMIT;
