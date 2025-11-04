-- =============================================
-- VERIFICAÇÃO: Execute depois da migração
-- =============================================
-- Use este SQL para verificar se tudo funcionou
-- =============================================

-- 1. Verificar estrutura da tabela users
\d public.users

-- 2. Listar todos os usuários ativos
SELECT 
  id,
  username,
  email,
  auth_user_id,
  role,
  active,
  created_at
FROM public.users
WHERE active = true
ORDER BY role DESC, username;

-- 3. Verificar se auth_user_id está preenchido
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(auth_user_id) as com_auth_vinculado,
  COUNT(*) - COUNT(auth_user_id) as sem_auth
FROM public.users
WHERE active = true;

-- Resultado esperado:
-- total_usuarios: 2 (ou mais)
-- com_auth_vinculado: 2 (ou igual ao total)
-- sem_auth: 0

-- 4. Verificar usuários no Supabase Auth
SELECT 
  u.id as user_id,
  u.username,
  u.email as email_app,
  u.role,
  au.id as auth_id,
  au.email as email_auth,
  au.email_confirmed_at,
  CASE 
    WHEN u.auth_user_id = au.id THEN '✅ Vinculado'
    ELSE '❌ Não vinculado'
  END as status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.active = true;

-- 5. Testar função is_app_user (deve existir)
SELECT public.is_app_user();
SELECT public.is_app_user('admin');

-- =============================================
-- DIAGNÓSTICO DE PROBLEMAS
-- =============================================

-- Se auth_user_id está NULL, execute:
-- (Substitua os UUIDs pelos IDs reais do auth.users)
/*
UPDATE public.users
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@barconnect.com'),
    email = 'admin@barconnect.com',
    username = 'admin@barconnect.com'
WHERE username = 'admin';

UPDATE public.users
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'operador@barconnect.com'),
    email = 'operador@barconnect.com',
    username = 'operador@barconnect.com'
WHERE username = 'operador';
*/

-- Se usuário não existe no auth.users, vá para:
-- Dashboard → Authentication → Users → Add user
