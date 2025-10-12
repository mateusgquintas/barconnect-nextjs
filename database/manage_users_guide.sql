-- Guia para adicionar novos usuários no Supabase
-- Execute no Supabase SQL Editor

-- EXEMPLO: Adicionar um novo usuário operador
INSERT INTO public.users (username, password, name, role) VALUES
    ('operador2', 'senha123', 'João Silva', 'operator');

-- EXEMPLO: Adicionar um novo usuário administrador  
INSERT INTO public.users (username, password, name, role) VALUES
    ('admin2', 'admin456', 'Maria Santos', 'admin');

-- EXEMPLO: Adicionar múltiplos usuários de uma vez
INSERT INTO public.users (username, password, name, role) VALUES
    ('caixa1', 'caixa123', 'Pedro Oliveira', 'operator'),
    ('caixa2', 'caixa456', 'Ana Costa', 'operator'),
    ('gerente', 'gerente789', 'Carlos Mendes', 'admin');

-- VERIFICAR usuários cadastrados
SELECT id, username, name, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- ATUALIZAR senha de um usuário
UPDATE public.users 
SET password = 'nova_senha_123', updated_at = NOW()
WHERE username = 'operador2';

-- DELETAR um usuário
DELETE FROM public.users WHERE username = 'usuario_para_remover';

-- NOTAS IMPORTANTES:
-- 1. username deve ser único
-- 2. role deve ser 'admin' ou 'operator'
-- 3. Em produção, senhas devem ser hasheadas
-- 4. Todos os campos são obrigatórios