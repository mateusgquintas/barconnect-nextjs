# 🚀 GUIA RÁPIDO: Como Fazer Login Agora

## 🎯 PROBLEMA
Você não consegue entrar com `admin` / `admin123` porque o sistema mudou para **autenticação por email**.

---

## ⚡ SOLUÇÃO RÁPIDA (5 minutos)

### **Opção 1: Modo Mock (Desenvolvimento Local)**

Perfeito para testar rapidamente sem configurar Supabase.

#### 1️⃣ Verificar se está em modo mock

Abra o navegador e procure no console a mensagem:
```
🧪 Usando Supabase Mock - Configure as variáveis de ambiente para conectar ao Supabase real
```

Se aparecer ✅ **Você está em modo mock**

#### 2️⃣ Usar EMAIL em vez de username

No formulário de login, use:

| Campo | Valor |
|-------|-------|
| **Email/Usuário** | `admin@barconnect.com` |
| **Senha** | `admin123` |

Ou para operador:

| Campo | Valor |
|-------|-------|
| **Email/Usuário** | `operador@barconnect.com` |
| **Senha** | `operador123` |

#### 3️⃣ Se ainda não funcionar

Você precisa **atualizar o componente de login** para aceitar emails. Veja o próximo passo.

---

### **Opção 2: Supabase Real (Produção)**

Use esta opção se você quer testar a integração completa com Supabase Auth.

#### 1️⃣ Criar arquivo `.env.local`

```bash
# No terminal (PowerShell)
cd barconnect-nextjs
New-Item -ItemType File -Path .env.local -Force
```

#### 2️⃣ Adicionar suas credenciais do Supabase

Edite `.env.local` e adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Como obter essas credenciais:**
1. Acesse [supabase.com](https://supabase.com)
2. Login no seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3️⃣ Reiniciar o servidor

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```

#### 4️⃣ Criar primeiro usuário no Supabase

**Opção A: Pelo Dashboard do Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Vá em **Authentication** → **Users**
3. Clique em **Add user** → **Create new user**
4. Preencha:
   - Email: `admin@barconnect.com`
   - Password: `Admin@123456` (mínimo 6 caracteres)
   - ✅ Auto Confirm User

**Opção B: Pelo SQL Editor do Supabase**
1. Vá em **SQL Editor**
2. Execute:

```sql
-- Criar usuário admin no Supabase Auth
-- (substitua a senha se preferir)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@barconnect.com',
  crypt('Admin@123456', gen_salt('bf')), -- senha: Admin@123456
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  '',
  ''
);
```

**IMPORTANTE:** Após criar o usuário, o sistema **automaticamente criará o perfil** em `public.users` com role `operator` no primeiro login. Se quiser que seja `admin`, você precisa ajustar manualmente depois.

#### 5️⃣ Fazer login

No formulário de login:

| Campo | Valor |
|-------|-------|
| **Email** | `admin@barconnect.com` |
| **Senha** | `Admin@123456` |

---

## 🔍 COMO VERIFICAR SE FUNCIONOU

### No Console do Navegador (F12)

Procure por mensagens como:

✅ **Sucesso:**
```
✅ Perfil criado automaticamente: admin@barconnect.com
✅ Login bem-sucedido: admin@barconnect.com
```

❌ **Erro comum:**
```
❌ Erro ao fazer login: Invalid login credentials
```
**Solução:** Verifique se o email e senha estão corretos no Supabase Auth.

### No Supabase (se usando Opção 2)

1. Vá em **Database** → **Table Editor** → `users`
2. Verifique se apareceu uma linha com:
   - `username`: admin@barconnect.com
   - `auth_user_id`: (UUID preenchido) ← **Isso é crucial!**
   - `role`: operator ou admin
   - `active`: true

---

## ❓ PERGUNTAS FREQUENTES

### 1. **Por que não funciona mais `admin` / `admin123`?**

O sistema mudou de autenticação por **username** para **email**. Agora você precisa usar:
- ❌ `admin` → ✅ `admin@barconnect.com`

### 2. **Posso usar qualquer email?**

**Modo Mock (Opção 1):** Só funciona com os emails pré-definidos:
- `admin@barconnect.com`
- `operador@barconnect.com`

**Supabase Real (Opção 2):** Funciona com qualquer email que você criar no Supabase Auth.

### 3. **O que é "consolidação de email"?**

É o processo de **migração automática** dos usuários antigos (que tinham username) para o novo sistema (com email):

1. Você tinha: `admin` / `admin123` na tabela `public.users`
2. Agora cria: `admin@barconnect.com` no Supabase Auth
3. Na primeira vez que fizer login, o sistema:
   - Busca se existe um usuário com `username = 'admin@barconnect.com'`
   - Se encontrar, **vincula** ele ao novo `auth_user_id`
   - Se não encontrar, **cria um novo perfil**

**Exemplo prático:**

```sql
-- ANTES (usuário antigo)
SELECT * FROM public.users WHERE username = 'admin';
-- id: 1, username: 'admin', password: (hash bcrypt), auth_user_id: NULL

-- DEPOIS do primeiro login com email
SELECT * FROM public.users WHERE username = 'admin';
-- id: 1, username: 'admin', password: (hash bcrypt), auth_user_id: 'abc-123-uuid'
```

### 4. **Como criar mais usuários?**

**Modo Mock:** Edite o arquivo `lib/authService.ts` e adicione na lista `FALLBACK_USERS_DB`.

**Supabase Real:** Use o Dashboard do Supabase (Authentication → Users → Add user) ou o SQL Editor.

### 5. **Preciso alterar o componente de login?**

Provavelmente **SIM**, se ele ainda estiver esperando "username" em vez de "email". Veja a seção abaixo.

---

## 🛠️ ATUALIZAR O COMPONENTE DE LOGIN

Se o seu formulário de login ainda pede "Usuário", você precisa atualizar para "Email".

### Antes:
```tsx
<input 
  type="text" 
  placeholder="Usuário" 
  name="username" 
/>
```

### Depois:
```tsx
<input 
  type="email" 
  placeholder="Email (ex: admin@barconnect.com)" 
  name="email" 
/>
```

E no código de login:

### Antes:
```typescript
await loginWithCredentials(username, password);
```

### Depois:
```typescript
await loginWithCredentials(email, password);
```

**Onde está o componente de login?**
Procure por:
```bash
grep -r "loginWithCredentials" app/ components/
```

Provavelmente está em:
- `app/login/page.tsx`
- `components/LoginForm.tsx`
- `app/(auth)/login/page.tsx`

---

## 🎯 RESUMO: O QUE FAZER AGORA

### Para começar AGORA (5 min):

1. ✅ Tente fazer login com `admin@barconnect.com` / `admin123`
2. ✅ Se não funcionar, verifique o console do navegador (F12)
3. ✅ Se aparecer "Modo Mock", você está na **Opção 1**
4. ✅ Se aparecer erro de credenciais, você precisa criar usuário no Supabase (**Opção 2**)

### Para produção (30 min):

1. ✅ Seguir **Opção 2** completa
2. ✅ Criar primeiro usuário admin no Supabase
3. ✅ Testar login
4. ✅ Verificar que `auth_user_id` foi preenchido
5. ✅ Aplicar RLS (FASE 3) quando tudo funcionar

---

## 📞 PRECISA DE AJUDA?

Se ainda não funcionar, me envie:

1. Console do navegador (F12 → Console)
2. Se está usando Modo Mock ou Supabase Real
3. Qual mensagem de erro aparece

Vou te ajudar a resolver! 🚀
