-- ========================================
-- VERIFICAR SENHAS NO SUPABASE
-- ========================================

-- 1️⃣ VERIFICAR TABELA public.users
-- Coluna 'password' deve estar VAZIA (é o correto!)
SELECT 
  id,
  username,
  email,
  password,                    -- ← Deve estar VAZIO
  auth_user_id,                -- ← Link com auth.users
  role,
  active,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Resultado esperado:
-- username      | email              | password | auth_user_id        | role
-- --------------------------------------------------------------------------
-- maria.santos  | maria@gmail.com    | (vazio)  | uuid-abc123         | operator
-- admin         | admin@barconnect   | (vazio)  | uuid-def456         | admin


-- 2️⃣ VERIFICAR LIGAÇÃO COM auth.users
-- Confirmar que auth_user_id está preenchido
SELECT 
  u.username,
  u.email AS public_email,
  u.auth_user_id,
  CASE 
    WHEN u.auth_user_id IS NULL THEN '❌ SEM LINK'
    ELSE '✅ LINKADO'
  END AS status_link
FROM public.users u
ORDER BY u.created_at DESC;

-- Resultado esperado:
-- username      | public_email       | auth_user_id  | status_link
-- -------------------------------------------------------------------
-- maria.santos  | maria@gmail.com    | uuid-abc123   | ✅ LINKADO
-- admin         | admin@barconnect   | uuid-def456   | ✅ LINKADO


-- 3️⃣ VERIFICAR auth.users (somente leitura)
-- ATENÇÃO: Você NÃO consegue ver a senha, ela está criptografada!
-- Acesse: Authentication → Users no Dashboard do Supabase

-- O que você verá:
-- ✅ Email do usuário
-- ✅ Data de criação
-- ✅ Status (ativo/inativo)
-- ❌ Senha (nunca é mostrada, está hasheada internamente)


-- ========================================
-- TESTAR LOGIN
-- ========================================

-- O login funciona assim:
-- 1. Usuário digita: maria.santos + senha123
-- 2. Sistema busca email: SELECT email FROM users WHERE username = 'maria.santos'
-- 3. Sistema autentica: supabase.auth.signInWithPassword(email: 'maria@gmail.com', password: 'senha123')
-- 4. Supabase compara hash: bcrypt.compare(senha123, encrypted_password em auth.users)
-- 5. Se correto: retorna token JWT + sessão


-- ========================================
-- VERIFICAR USUÁRIOS SEM MIGRAÇÃO
-- ========================================

-- Usuários antigos que ainda têm senha na coluna 'password'
SELECT 
  username,
  email,
  CASE 
    WHEN password IS NOT NULL AND password != '' THEN '⚠️ TEM SENHA (antigo)'
    ELSE '✅ MIGRADO'
  END AS status_migracao,
  CASE 
    WHEN auth_user_id IS NULL THEN '❌ NÃO LINKADO'
    ELSE '✅ LINKADO'
  END AS status_auth
FROM public.users
ORDER BY created_at DESC;

-- Resultado esperado:
-- username      | status_migracao     | status_auth
-- -----------------------------------------------------
-- maria.santos  | ✅ MIGRADO          | ✅ LINKADO
-- admin         | ✅ MIGRADO          | ✅ LINKADO
-- operador      | ✅ MIGRADO          | ✅ LINKADO


-- ========================================
-- CONTAR USUÁRIOS POR STATUS
-- ========================================

SELECT 
  COUNT(*) AS total_usuarios,
  COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) AS com_auth,
  COUNT(CASE WHEN password IS NOT NULL AND password != '' THEN 1 END) AS com_senha_antiga,
  COUNT(CASE WHEN auth_user_id IS NULL THEN 1 END) AS sem_auth
FROM public.users
WHERE active = true;

-- Resultado ideal (todos migrados):
-- total_usuarios | com_auth | com_senha_antiga | sem_auth
-- ---------------------------------------------------------
--       3        |    3     |        0         |    0


-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

/*
❓ Por que a coluna 'password' está vazia?
✅ RESPOSTA: Porque o Supabase Auth gerencia as senhas de forma segura em auth.users

❓ As senhas estão seguras?
✅ RESPOSTA: SIM! Estão criptografadas com bcrypt + salt em auth.users

❓ Posso remover a coluna 'password'?
⚠️ RESPOSTA: Sim, mas só depois de confirmar que TODOS os usuários estão migrados

❓ Como ver a senha de um usuário?
❌ RESPOSTA: IMPOSSÍVEL! As senhas são hasheadas de forma irreversível

❓ Como testar se a senha está funcionando?
✅ RESPOSTA: Faça logout e tente fazer login com o usuário criado
*/


-- ========================================
-- PRÓXIMOS PASSOS (OPCIONAL - FUTURO)
-- ========================================

-- Depois que TODOS os usuários estiverem migrados:

-- PASSO 1: Verificar que ninguém usa mais a coluna password
SELECT COUNT(*) FROM public.users 
WHERE password IS NOT NULL AND password != '';
-- Se retornar 0, pode prosseguir

-- PASSO 2: Remover coluna password (CUIDADO!)
-- ALTER TABLE public.users DROP COLUMN password;

-- PASSO 3: Atualizar código que ainda referencia 'password'
