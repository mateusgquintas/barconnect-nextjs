# 🚀 MIGRAÇÃO 004: Adicionar Email e Criar Usuários no Supabase Auth

## 🎯 O QUE VAI ACONTECER

Esta migração vai:
1. ✅ Adicionar coluna `email` em `public.users`
2. ✅ Criar usuários `admin@barconnect.com` e `operador@barconnect.com` no Supabase Auth
3. ✅ Vincular automaticamente com `auth_user_id`
4. ✅ Atualizar código para aceitar tanto username quanto email no login

---

## ⚡ EXECUTAR AGORA (2 minutos)

### Passo 1: Abrir SQL Editor no Supabase

1. Acesse: https://supabase.com
2. Login no seu projeto
3. Clique em **SQL Editor** (ícone </>)

### Passo 2: Copiar e executar a migração

Copie TODO o conteúdo do arquivo:
```
supabase/migrations/004-add-email-and-create-auth-users.sql
```

Cole no SQL Editor e clique em **RUN** (ou F5)

### Passo 3: Verificar o resultado

Você deve ver mensagens como:

```
✅ Coluna email adicionada e populada
✅ Usuário criado: admin@barconnect.com (id: abc-123-uuid)
✅ Admin vinculado: username=admin@barconnect.com → auth_user_id=abc-123-uuid
✅ Usuário criado: operador@barconnect.com (id: def-456-uuid)
✅ Operador vinculado: username=operador@barconnect.com → auth_user_id=def-456-uuid

=================================================
✅ MIGRAÇÃO 004 CONCLUÍDA COM SUCESSO!
=================================================
Usuários criados:
  - admin@barconnect.com / admin123
  - operador@barconnect.com / operador123

⚠️  IMPORTANTE: Mude as senhas no Dashboard do Supabase!
    Authentication → Users → [usuário] → Reset Password
=================================================
```

---

## 🔍 VERIFICAR SE FUNCIONOU

### Verificação 1: Coluna email existe

```sql
-- No SQL Editor, execute:
SELECT 
  id,
  username,
  email,
  auth_user_id,
  role
FROM public.users
WHERE active = true;
```

**Resultado esperado:**
| id | username | email | auth_user_id | role |
|----|----------|-------|--------------|------|
| ... | admin@barconnect.com | admin@barconnect.com | abc-123... | admin |
| ... | operador@barconnect.com | operador@barconnect.com | def-456... | operator |

### Verificação 2: Usuários no Supabase Auth

1. Vá em **Authentication** → **Users**
2. Você deve ver:
   - ✅ admin@barconnect.com (confirmado)
   - ✅ operador@barconnect.com (confirmado)

### Verificação 3: Login funciona

1. Abra seu app: http://localhost:3000
2. Tente fazer login com:

| Opção | Usuário | Senha |
|-------|---------|-------|
| 1 | `admin` | `admin123` |
| 2 | `admin@barconnect.com` | `admin123` |
| 3 | `operador` | `operador123` |
| 4 | `operador@barconnect.com` | `operador123` |

**Todas as 4 opções devem funcionar!** ✅

---

## 🔧 SE DER ERRO

### Erro: "relation auth.users does not exist"

**Causa:** Você não tem acesso à tabela auth.users via SQL Editor.

**Solução:** Criar usuários manualmente pelo Dashboard:

1. **Authentication** → **Users** → **Add user**
2. Preencher:
   - Email: `admin@barconnect.com`
   - Password: `admin123`
   - ✅ Auto Confirm User
3. Clicar em **Create user**
4. Repetir para `operador@barconnect.com` / `operador123`

Depois, vincular manualmente:

```sql
-- Pegar o UUID do admin criado
SELECT id, email FROM auth.users WHERE email = 'admin@barconnect.com';
-- Copiar o UUID (exemplo: abc-123-uuid)

-- Atualizar public.users
UPDATE public.users
SET auth_user_id = 'abc-123-uuid', -- COLAR o UUID aqui
    email = 'admin@barconnect.com',
    username = 'admin@barconnect.com'
WHERE username = 'admin' OR email = 'admin@barconnect.com';

-- Repetir para operador
SELECT id, email FROM auth.users WHERE email = 'operador@barconnect.com';
-- Copiar o UUID (exemplo: def-456-uuid)

UPDATE public.users
SET auth_user_id = 'def-456-uuid', -- COLAR o UUID aqui
    email = 'operador@barconnect.com',
    username = 'operador@barconnect.com'
WHERE username = 'operador' OR email = 'operador@barconnect.com';
```

### Erro: "column email already exists"

**Causa:** Coluna já existe.

**Solução:** Só vincular usuários (pular a parte 1 da migração).

Execute apenas:

```sql
-- Adicionar índice (se não existir)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Preencher emails vazios
UPDATE public.users
SET email = CASE 
  WHEN username LIKE '%@%' THEN username
  ELSE username || '@barconnect.com'
END
WHERE email IS NULL;
```

Depois seguir o processo de criar usuários no Dashboard (explicado acima).

### Erro: "Invalid login credentials" ao fazer login

**Causa 1:** Usuário não existe no Supabase Auth.
**Solução:** Criar pelo Dashboard (Authentication → Users → Add user)

**Causa 2:** Senha errada.
**Solução:** Resetar senha no Dashboard (Authentication → Users → [usuário] → Reset Password)

**Causa 3:** `auth_user_id` está NULL.
**Solução:** Executar o UPDATE manual (mostrado acima)

---

## 📝 O QUE O CÓDIGO ATUALIZADO FAZ

### Antes (só aceitava email):
```typescript
if (!isEmail) {
  console.warn('⚠️ Username deve ser um e-mail válido');
  return null;
}
```

### Depois (aceita username OU email):
```typescript
if (!isEmail) {
  // Buscar email em public.users pelo username
  const { data } = await supabase
    .from('users')
    .select('email')
    .eq('username', username)
    .maybeSingle();
  
  emailToUse = data.email;
}

// Autenticar com email
await supabase.auth.signInWithPassword({
  email: emailToUse,
  password
});
```

**Fluxo:**
1. Você digita: `admin`
2. Sistema busca: `SELECT email FROM users WHERE username = 'admin'`
3. Encontra: `admin@barconnect.com`
4. Autentica: `signInWithPassword('admin@barconnect.com', 'admin123')`
5. ✅ Login bem-sucedido!

---

## 🎯 PRÓXIMOS PASSOS

### Depois da migração funcionar:

1. ✅ **Testar login** com todas as 4 opções (admin, admin@..., operador, operador@...)
2. ✅ **Mudar senhas** no Dashboard (Authentication → Users)
3. ✅ **Aplicar RLS** (FASE 3) - arquivo: `supabase/rls-policies.sql`

### Checklist de sucesso:

- [ ] Coluna `email` existe em `public.users`
- [ ] Todos os `auth_user_id` estão preenchidos (não NULL)
- [ ] Usuários existem no Supabase Auth (Authentication → Users)
- [ ] Login com `admin` funciona
- [ ] Login com `admin@barconnect.com` funciona
- [ ] Console mostra "✅ Login bem-sucedido: admin@barconnect.com | Role: admin"

---

## 🆘 PRECISA DE AJUDA?

Se algo der errado, me envie:

1. **Console do navegador** (F12 → Console → copie as mensagens)
2. **Resultado da query:**
   ```sql
   SELECT username, email, auth_user_id, role 
   FROM public.users 
   WHERE active = true;
   ```
3. **Lista de usuários no Supabase Auth:**
   - Authentication → Users → screenshot

Vou te ajudar a resolver! 🚀

---

## 📚 RESUMO EM 3 PASSOS

1. ✅ **Executar:** `supabase/migrations/004-add-email-and-create-auth-users.sql` no SQL Editor
2. ✅ **Verificar:** `SELECT * FROM public.users` → email e auth_user_id preenchidos
3. ✅ **Testar:** Login com `admin` / `admin123` deve funcionar

**FUNCIONA?** 🎉 Próximo: Aplicar RLS (FASE 3)!
