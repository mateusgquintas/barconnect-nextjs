-- ====================================================================
-- BARCONNECT - GERENCIAMENTO DE USUÁRIOS
-- ====================================================================
-- Versão: 1.0
-- Data: 2025-10-31
-- Descrição: Guia e scripts para gerenciar usuários do sistema
-- 
-- IMPORTANTE: Em produção, sempre use senhas hasheadas!
-- Nunca armazene senhas em texto plano!
-- ====================================================================

-- =============================================
-- 1. CRIAR NOVO USUÁRIO
-- =============================================

-- Exemplo: Criar usuário operador
INSERT INTO public.users (username, password, name, role, active) VALUES
    ('operador2', '$2b$10$seu_hash_bcrypt_aqui', 'João Silva', 'operator', true);

-- Exemplo: Criar usuário administrador  
INSERT INTO public.users (username, password, name, role, active) VALUES
    ('admin2', '$2b$10$seu_hash_bcrypt_aqui', 'Maria Santos', 'admin', true);

-- Exemplo: Criar múltiplos usuários de uma vez
INSERT INTO public.users (username, password, name, role, active) VALUES
    ('caixa1', '$2b$10$seu_hash_bcrypt_aqui', 'Pedro Oliveira', 'operator', true),
    ('caixa2', '$2b$10$seu_hash_bcrypt_aqui', 'Ana Costa', 'operator', true),
    ('gerente', '$2b$10$seu_hash_bcrypt_aqui', 'Carlos Mendes', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 2. LISTAR USUÁRIOS
-- =============================================

-- Listar todos os usuários
SELECT id, username, name, role, active, created_at, updated_at
FROM public.users 
ORDER BY created_at DESC;

-- Listar apenas usuários ativos
SELECT id, username, name, role, created_at
FROM public.users 
WHERE active = true
ORDER BY role DESC, name ASC;

-- Listar apenas administradores
SELECT id, username, name, created_at
FROM public.users 
WHERE role = 'admin' AND active = true
ORDER BY created_at DESC;

-- =============================================
-- 3. ATUALIZAR USUÁRIO
-- =============================================

-- Atualizar senha de um usuário
UPDATE public.users 
SET password = '$2b$10$novo_hash_bcrypt_aqui', 
    updated_at = NOW()
WHERE username = 'operador2';

-- Atualizar nome de um usuário
UPDATE public.users 
SET name = 'João da Silva Santos', 
    updated_at = NOW()
WHERE username = 'operador2';

-- Promover usuário para administrador
UPDATE public.users 
SET role = 'admin', 
    updated_at = NOW()
WHERE username = 'caixa1';

-- Rebaixar administrador para operador
UPDATE public.users 
SET role = 'operator', 
    updated_at = NOW()
WHERE username = 'admin2';

-- =============================================
-- 4. DESATIVAR/ATIVAR USUÁRIO
-- =============================================

-- Desativar usuário (sem deletar)
UPDATE public.users 
SET active = false, 
    updated_at = NOW()
WHERE username = 'operador2';

-- Reativar usuário
UPDATE public.users 
SET active = true, 
    updated_at = NOW()
WHERE username = 'operador2';

-- =============================================
-- 5. DELETAR USUÁRIO
-- =============================================

-- ATENÇÃO: Isso remove permanentemente o usuário!
-- Considere usar "desativar" ao invés de deletar

-- Deletar um usuário específico
DELETE FROM public.users 
WHERE username = 'usuario_para_remover';

-- Deletar múltiplos usuários inativos antigos (cuidado!)
DELETE FROM public.users 
WHERE active = false 
  AND updated_at < NOW() - INTERVAL '1 year';

-- =============================================
-- 6. VERIFICAR INTEGRIDADE
-- =============================================

-- Verificar usuários sem nome
SELECT id, username, role 
FROM public.users 
WHERE name IS NULL OR name = '';

-- Verificar usernames duplicados (não deveria existir)
SELECT username, COUNT(*) 
FROM public.users 
GROUP BY username 
HAVING COUNT(*) > 1;

-- Verificar roles inválidos
SELECT id, username, role 
FROM public.users 
WHERE role NOT IN ('admin', 'operator');

-- =============================================
-- 7. ESTATÍSTICAS DE USUÁRIOS
-- =============================================

-- Contar usuários por role
SELECT 
    role,
    COUNT(*) as total,
    SUM(CASE WHEN active THEN 1 ELSE 0 END) as ativos,
    SUM(CASE WHEN NOT active THEN 1 ELSE 0 END) as inativos
FROM public.users
GROUP BY role;

-- Usuários criados por mês
SELECT 
    DATE_TRUNC('month', created_at) as mes,
    COUNT(*) as novos_usuarios
FROM public.users
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- =============================================
-- 8. AUDITORIA
-- =============================================

-- Últimos usuários criados
SELECT username, name, role, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- Usuários modificados recentemente
SELECT username, name, role, updated_at
FROM public.users
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;

-- Usuários inativos há muito tempo
SELECT username, name, role, updated_at,
       NOW() - updated_at as tempo_inativo
FROM public.users
WHERE active = false
ORDER BY updated_at ASC;

-- =============================================
-- 9. MANUTENÇÃO DE SEGURANÇA
-- =============================================

-- Forçar atualização de senha para todos os usuários
-- (adicione uma flag 'must_change_password' se necessário)

-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- UPDATE public.users 
-- SET must_change_password = true, updated_at = NOW()
-- WHERE password LIKE '$2b$10$dummyhashfordev%'; -- senhas de exemplo

-- =============================================
-- 10. TEMPLATES DE FUNÇÃO (OPCIONAL)
-- =============================================

-- Função para criar usuário com validação
CREATE OR REPLACE FUNCTION create_user(
    p_username VARCHAR(50),
    p_password VARCHAR(255),
    p_name VARCHAR(100),
    p_role VARCHAR(20)
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validar role
    IF p_role NOT IN ('admin', 'operator') THEN
        RAISE EXCEPTION 'Role inválido. Use "admin" ou "operator".';
    END IF;
    
    -- Validar username único
    IF EXISTS (SELECT 1 FROM public.users WHERE username = p_username) THEN
        RAISE EXCEPTION 'Username "%" já existe.', p_username;
    END IF;
    
    -- Criar usuário
    INSERT INTO public.users (username, password, name, role)
    VALUES (p_username, p_password, p_name, p_role)
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Uso da função:
-- SELECT create_user('novousuario', '$2b$10$hash...', 'Nome Completo', 'operator');

-- =============================================
-- NOTAS IMPORTANTES
-- =============================================

/*
1. USERNAME deve ser único
2. ROLE deve ser 'admin' ou 'operator'
3. Todos os campos são obrigatórios exceto updated_at
4. Em produção, senhas DEVEM ser hasheadas (bcrypt, Argon2, etc.)
5. Nunca exponha senhas em logs ou consultas
6. Considere implementar autenticação de dois fatores (2FA)
7. Implemente políticas de senha forte
8. Realize auditorias regulares de acesso
9. Use HTTPS em todas as comunicações
10. Mantenha backup regular dos dados de usuários
*/

-- =============================================
-- EXEMPLOS DE HASH BCRYPT (PARA REFERÊNCIA)
-- =============================================

/*
NUNCA use estes hashes em produção! São exemplos conhecidos.
Gere novos hashes únicos para cada ambiente.

Senha: "admin123"
Hash: $2b$10$CwTycUXWue0Thq9StjUM0uJ8sxMxQOv1oOvPqwSjjKxwrTI0oR9hq

Senha: "operator456"
Hash: $2b$10$ZvXBnZRH0fX9EqTxGQl5GuOzQnYBXjY3WZZZvM4xYJOPFiCh8wLZK

Para gerar novos hashes em Node.js:
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('senha', 10);
*/

-- Fim do script
