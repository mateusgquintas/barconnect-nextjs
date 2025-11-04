-- =============================================
-- SOLUÇÃO ALTERNATIVA: Sem acesso direto ao auth.users
-- =============================================
-- Este script só prepara a tabela public.users
-- Os usuários serão criados manualmente no Dashboard
-- =============================================

BEGIN;

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
-- PARTE 2: Preparar registros para vincular depois
-- =============================================

-- Garantir que admin e operador existem em public.users
INSERT INTO public.users (id, username, email, password, name, role, active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin', 'admin@barconnect.com', '', 'Administrador', 'admin', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE 
SET email = EXCLUDED.email,
    updated_at = NOW();

INSERT INTO public.users (id, username, email, password, name, role, active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'operador', 'operador@barconnect.com', '', 'Operador', 'operator', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE 
SET email = EXCLUDED.email,
    updated_at = NOW();

COMMIT;

-- =============================================
-- RESULTADO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ PARTE 1 CONCLUÍDA: Tabela preparada!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS MANUAIS:';
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣  Criar usuários no Dashboard do Supabase:';
  RAISE NOTICE '   • Ir em: Authentication → Users → Add user';
  RAISE NOTICE '   • Criar: admin@barconnect.com / admin123';
  RAISE NOTICE '   • Criar: operador@barconnect.com / operador123';
  RAISE NOTICE '   • ✅ Marcar "Auto Confirm User"';
  RAISE NOTICE '';
  RAISE NOTICE '2️⃣  Copiar os UUIDs dos usuários criados';
  RAISE NOTICE '';
  RAISE NOTICE '3️⃣  Executar o próximo script: VINCULAR-USUARIOS.sql';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
END $$;

-- Verificar usuários atuais
SELECT 
  id,
  username,
  email,
  auth_user_id,
  role,
  active
FROM public.users
WHERE username IN ('admin', 'operador') OR email IN ('admin@barconnect.com', 'operador@barconnect.com')
ORDER BY role DESC;
