-- =============================================
-- EXECUTAR ESTE ARQUIVO NO SQL EDITOR DO SUPABASE
-- =============================================
-- Copie TODO este arquivo e cole no SQL Editor
-- Depois clique em RUN (ou pressione F5)
-- =============================================

-- =============================================
-- PARTE 1: Adicionar coluna email
-- =============================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Preencher emails baseado nos usernames existentes
UPDATE public.users
SET email = CASE 
  WHEN username LIKE '%@%' THEN username
  ELSE username || '@barconnect.com'
END
WHERE email IS NULL OR email = '';

-- =============================================
-- PARTE 2: Criar usuários no Supabase Auth
-- =============================================

-- Função helper para criar usuário (segura, não duplica)
CREATE OR REPLACE FUNCTION create_auth_user_safe(
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
    RAISE NOTICE '⚠️  Usuário já existe: % (id: %)', p_email, v_user_id;
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
  
  -- Criar identity (necessário para login funcionar)
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao criar usuário %: %', p_email, SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PARTE 3: Criar e vincular usuários
-- =============================================

-- Criar usuário ADMIN
DO $$
DECLARE
  v_admin_auth_id UUID;
  v_admin_email TEXT := 'admin@barconnect.com';
  v_admin_password TEXT := 'admin123';
BEGIN
  RAISE NOTICE '=== Criando usuário ADMIN ===';
  
  -- Criar no auth.users
  v_admin_auth_id := create_auth_user_safe(
    v_admin_email,
    v_admin_password,
    'Administrador'
  );
  
  IF v_admin_auth_id IS NULL THEN
    RAISE EXCEPTION 'Falha ao criar usuário admin no Supabase Auth';
  END IF;
  
  -- Atualizar ou criar em public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE username = 'admin' OR username = 'admin@barconnect.com' OR email = v_admin_email) THEN
    -- Atualizar existente
    UPDATE public.users
    SET auth_user_id = v_admin_auth_id,
        email = v_admin_email,
        username = v_admin_email,
        updated_at = NOW()
    WHERE username = 'admin' OR username = 'admin@barconnect.com' OR email = v_admin_email;
    
    RAISE NOTICE '✅ Admin vinculado: % → auth_user_id: %', v_admin_email, v_admin_auth_id;
  ELSE
    -- Criar novo
    INSERT INTO public.users (id, username, email, password, name, role, active, auth_user_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      v_admin_email,
      v_admin_email,
      '', -- Senha gerenciada pelo Supabase Auth
      'Administrador',
      'admin',
      true,
      v_admin_auth_id,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Admin criado: % (auth_user_id: %)', v_admin_email, v_admin_auth_id;
  END IF;
END $$;

-- Criar usuário OPERADOR
DO $$
DECLARE
  v_oper_auth_id UUID;
  v_oper_email TEXT := 'operador@barconnect.com';
  v_oper_password TEXT := 'operador123';
BEGIN
  RAISE NOTICE '=== Criando usuário OPERADOR ===';
  
  -- Criar no auth.users
  v_oper_auth_id := create_auth_user_safe(
    v_oper_email,
    v_oper_password,
    'Operador'
  );
  
  IF v_oper_auth_id IS NULL THEN
    RAISE EXCEPTION 'Falha ao criar usuário operador no Supabase Auth';
  END IF;
  
  -- Atualizar ou criar em public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE username = 'operador' OR username = 'operador@barconnect.com' OR email = v_oper_email) THEN
    -- Atualizar existente
    UPDATE public.users
    SET auth_user_id = v_oper_auth_id,
        email = v_oper_email,
        username = v_oper_email,
        updated_at = NOW()
    WHERE username = 'operador' OR username = 'operador@barconnect.com' OR email = v_oper_email;
    
    RAISE NOTICE '✅ Operador vinculado: % → auth_user_id: %', v_oper_email, v_oper_auth_id;
  ELSE
    -- Criar novo
    INSERT INTO public.users (id, username, email, password, name, role, active, auth_user_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      v_oper_email,
      v_oper_email,
      '', -- Senha gerenciada pelo Supabase Auth
      'Operador',
      'operator',
      true,
      v_oper_auth_id,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Operador criado: % (auth_user_id: %)', v_oper_email, v_oper_auth_id;
  END IF;
END $$;

-- Limpar função temporária
DROP FUNCTION IF EXISTS create_auth_user_safe(TEXT, TEXT, TEXT);

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================
DO $$
DECLARE
  v_result RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 USUÁRIOS CRIADOS:';
  RAISE NOTICE '  - admin@barconnect.com / admin123';
  RAISE NOTICE '  - operador@barconnect.com / operador123';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO:';
  
  FOR v_result IN 
    SELECT username, email, role, 
           CASE WHEN auth_user_id IS NOT NULL THEN '✅ Vinculado' ELSE '❌ Sem vínculo' END as status
    FROM public.users 
    WHERE active = true
    ORDER BY role DESC
  LOOP
    RAISE NOTICE '  % | % | % | %', v_result.username, v_result.email, v_result.role, v_result.status;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Mude as senhas no Dashboard!';
  RAISE NOTICE '    Authentication → Users → [usuário] → Reset Password';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 PRÓXIMO PASSO: Testar login!';
  RAISE NOTICE '    http://localhost:3000';
  RAISE NOTICE '    Usuário: admin ou admin@barconnect.com';
  RAISE NOTICE '    Senha: admin123';
  RAISE NOTICE '=================================================';
END $$;
