# Autenticação e Autorização (Arquitetura de Longo Prazo)

Este documento explica como autenticar usuários (quem é você) e autorizar acesso (o que você pode fazer) no BarConnect usando Supabase Auth + RLS do PostgreSQL.

## Objetivos

- Somente pessoas cadastradas (clientes pagantes) acessam o app
- Perfis e papéis (roles) gerenciados na tabela `public.users`
- Regras de acesso centralizadas no banco (RLS) para máxima segurança
- Frontend simples: apenas se autentica e consome dados via políticas do banco

## Componentes

- Supabase Auth: identidade do usuário (e-mail/senha ou magic link). Tabela interna `auth.users` (não editar manualmente).
- `public.users`: perfil do app e autorização (role: admin/operator; active: boolean). Vinculado a `auth.users.id` via `auth_user_id`.
- RLS Policies: regras por tabela, baseadas em `auth.uid()` e nos dados da `public.users`.

## Fluxo de alto nível

1. Usuário entra com e-mail/senha (ou magic link) → Supabase emite um JWT.
2. O JWT é usado automaticamente pelo client ao chamar o banco.
3. RLS no banco verifica: `auth.uid()` existe em `public.users` e `active = true`? Qual é o `role`?
4. Políticas permitem ou negam SELECT/INSERT/UPDATE/DELETE conforme papel.

## Tabela `public.users`

Campos importantes:
- id (uuid)
- username (string) — pode ser o e-mail
- name, role ('admin'|'operator'), active (boolean)
- auth_user_id (uuid, UNIQUE) — referência ao `auth.users.id`

Migração: `migrations/003-users-auth-link.sql`

## Função Helper: `is_app_user(required_role text)`

Retorna true se `auth.uid()` estiver em `public.users` com `active = true` e, se `required_role` informado, se o usuário tiver esse papel (ou for admin).

Usada em políticas: `USING (public.is_app_user('operator'))` etc.

## Políticas (duas fases)

- Transição (hoje): `supabase/rls-policies.sql`
  - Mantém app funcionando mesmo sem login (TO anon, authenticated)
  - Use apenas para tirar status "unrestricted" sem downtime

- Seguro (produção): `supabase/rls-policies.secure.sql`
  - Somente `authenticated`
  - Gate por `is_app_user()` e roles
  - Produtos: write só admin; Comandas/Vendas: write operador+admin; etc.

## Rollout recomendado

1. Criar `auth_user_id` (script 003) e registrar os clientes em `public.users`.
2. Garantir que o app exija login (Supabase Auth) antes do uso.
3. Backfill: ao logar, se não houver linha em `public.users` com `auth_user_id = auth.uid()`, crie-a (role padrão operator).
4. Aplicar `rls-policies.secure.sql`.
5. Remover permissões TO anon das políticas de transição.

## Sobre o gatilho de estoque

- A venda insere em `sale_items`; um trigger atualiza `products.stock` e cria `stock_movements`.
- Com RLS seguro, permitimos UPDATE/INSERT nessas tabelas para operadores. Alternativa avançada: mover para função mais restrita/servidor.

## Boas práticas adicionais

- Não guarde senha em `public.users`. Use somente Supabase Auth. Coluna `password` pode ser descontinuada.
- Admins gerenciam papéis pela UI do app (editando `role` na `public.users`).
- Audite acessos sensíveis com tabelas de log ou extensions.

## Próximos passos automáticos

- [ ] Aplicar `003-users-auth-link.sql`
- [ ] Habilitar login no app (mágico ou senha)
- [ ] Durante login, criar/atualizar registro em `public.users` com `auth_user_id`
- [ ] Aplicar `rls-policies.secure.sql`
- [ ] (Opcional) Remover coluna `password` e o fallback local do front

