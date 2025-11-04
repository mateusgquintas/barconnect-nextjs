-- =============================================
-- PASSO 2: VINCULAR USUÁRIOS
-- =============================================
-- Execute DEPOIS de criar os usuários no Dashboard
-- Substitua os UUIDs pelos reais que você copiou
-- =============================================

-- INSTRUÇÕES:
-- 1. Vá em: Authentication → Users
-- 2. Copie o UUID (ID) do admin@barconnect.com
-- 3. Copie o UUID (ID) do operador@barconnect.com
-- 4. Substitua abaixo onde diz 'COLE-UUID-ADMIN-AQUI'
-- 5. Execute este script

BEGIN;

-- =============================================
-- VINCULAR ADMIN
-- =============================================
-- ⚠️ SUBSTITUA 'COLE-UUID-ADMIN-AQUI' pelo UUID real!

UPDATE public.users
SET auth_user_id = '656c845c-dd9e-42d1-abd5-5f17b57e19c4'::uuid,
    email = 'admin@barconnect.com',
    username = 'admin@barconnect.com',
    updated_at = NOW()
WHERE username = 'admin' 
   OR username = 'admin@barconnect.com' 
   OR email = 'admin@barconnect.com';

-- =============================================
-- VINCULAR OPERADOR
-- =============================================
-- ⚠️ SUBSTITUA 'COLE-UUID-OPERADOR-AQUI' pelo UUID real!

UPDATE public.users
SET auth_user_id = 'ecac0c5d-5de4-4fcd-9d4d-f785159c1924'::uuid,
    email = 'operador@barconnect.com',
    username = 'operador@barconnect.com',
    updated_at = NOW()
WHERE username = 'operador' 
   OR username = 'operador@barconnect.com' 
   OR email = 'operador@barconnect.com';

COMMIT;

-- =============================================
-- VERIFICAÇÃO
-- =============================================
DO $$
DECLARE
  v_result RECORD;
  v_admin_vinculado BOOLEAN;
  v_oper_vinculado BOOLEAN;
BEGIN
  -- Verificar admin
  SELECT auth_user_id IS NOT NULL INTO v_admin_vinculado
  FROM public.users 
  WHERE email = 'admin@barconnect.com';
  
  -- Verificar operador
  SELECT auth_user_id IS NOT NULL INTO v_oper_vinculado
  FROM public.users 
  WHERE email = 'operador@barconnect.com';
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  
  IF v_admin_vinculado AND v_oper_vinculado THEN
    RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
  ELSE
    RAISE NOTICE '⚠️  ATENÇÃO: Verifique os UUIDs!';
  END IF;
  
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO:';
  RAISE NOTICE '';
  
  FOR v_result IN 
    SELECT 
      username, 
      email, 
      role,
      SUBSTRING(auth_user_id::text, 1, 8) || '...' as uuid_preview,
      CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ Vinculado' 
        ELSE '❌ Sem vínculo' 
      END as status
    FROM public.users 
    WHERE email IN ('admin@barconnect.com', 'operador@barconnect.com')
    ORDER BY role DESC
  LOOP
    RAISE NOTICE '  % | % | % | %', 
      v_result.email, 
      v_result.role, 
      v_result.uuid_preview,
      v_result.status;
  END LOOP;
  
  RAISE NOTICE '';
  
  IF v_admin_vinculado AND v_oper_vinculado THEN
    RAISE NOTICE '🎯 PRÓXIMO PASSO: Testar login!';
    RAISE NOTICE '    http://localhost:3000';
    RAISE NOTICE '    Usuário: admin ou admin@barconnect.com';
    RAISE NOTICE '    Senha: admin123';
  ELSE
    RAISE NOTICE '⚠️  ATENÇÃO: UUIDs não foram substituídos!';
    RAISE NOTICE '    Edite este arquivo e substitua os UUIDs';
    RAISE NOTICE '    antes de executar novamente.';
  END IF;
  
  RAISE NOTICE '=================================================';
END $$;

-- Mostrar detalhes completos
SELECT 
  id,
  username,
  email,
  auth_user_id,
  role,
  active,
  created_at,
  updated_at
FROM public.users
WHERE email IN ('admin@barconnect.com', 'operador@barconnect.com')
ORDER BY role DESC;
