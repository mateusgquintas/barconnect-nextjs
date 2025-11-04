# 🚀 O QUE FAZER AGORA - Guia Rápido

## ✅ FASE 1: CONCLUÍDA
- Schema unificado aplicado
- Migration 003 aplicada (auth_user_id)
- Banco de dados preparado

## ✅ FASE 2: CÓDIGO IMPLEMENTADO
- `hooks/useAuthProfile.ts` criado
- `lib/authService.ts` atualizado
- `contexts/AuthContext.tsx` atualizado

---

## 🎯 PRÓXIMOS PASSOS (AGORA)

### **1️⃣ TESTE BÁSICO (5 minutos)**

#### **A) Reiniciar servidor de desenvolvimento:**
```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

#### **B) Abrir aplicação e verificar console:**
```
✅ Esperado ver:
📊 Supabase Status: { isUsingMock: false, hasUrl: true, ... }
```

#### **C) Tentar fazer login:**
- Se tiver Supabase configurado → usar email@dominio.com
- Se modo mock → usar `admin` / `admin123`

#### **D) Verificar console após login:**
```
✅ Esperado ver:
✅ Login bem-sucedido: [seu-email] | Role: operator
```

---

### **2️⃣ CRIAR PRIMEIRO USUÁRIO NO SUPABASE AUTH (10 minutos)**

**Se ainda não tem usuário cadastrado:**

1. Abrir Supabase Dashboard
2. Ir em **Authentication** > **Users**
3. Clicar em **Add User** > **Create new user**
4. Preencher:
   - **Email:** seu@email.com
   - **Password:** suaSenha123
   - ✅ Auto Confirm User (marcar)
5. Clicar em **Create User**

**Ou via SQL (se preferir):**
```sql
-- Nota: Não é possível inserir diretamente em auth.users via SQL
-- Use o Dashboard ou API do Supabase
```

---

### **3️⃣ TESTAR LOGIN (5 minutos)**

1. **Voltar para aplicação**
2. **Fazer login com:**
   - Email: seu@email.com
   - Senha: suaSenha123

3. **Verificar console (F12):**
```javascript
// Deve aparecer:
✅ Login bem-sucedido: seu@email.com | Role: operator
```

4. **Verificar perfil criado no banco:**
```sql
-- No Supabase SQL Editor
SELECT id, username, name, role, auth_user_id, active 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
```

**Resultado esperado:**
```
| id   | username         | name     | role     | auth_user_id | active |
|------|------------------|----------|----------|--------------|--------|
| uuid | seu@email.com    | seu      | operator | uuid-do-auth | true   |
```

---

### **4️⃣ TESTAR FUNCIONALIDADES DO APP (15 minutos)**

Após login bem-sucedido, testar:

- [ ] **Dashboard** carrega
- [ ] **Comandas** funciona (criar, adicionar itens)
- [ ] **Vendas** funciona (venda direta)
- [ ] **Produtos** funciona (adicionar, editar)
- [ ] **Estoque** atualiza corretamente
- [ ] **Logout** funciona
- [ ] **Login novamente** funciona
- [ ] **Reload (F5)** mantém sessão

---

## ⚠️ SE ALGO DER ERRADO

### **Problema: Console mostra erro "auth_user_id column does not exist"**
**Solução:**
```sql
-- Verificar se coluna foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'auth_user_id';

-- Se não existir, executar novamente:
-- supabase/migrations/003-users-auth-link.sql
```

---

### **Problema: Login não funciona (Invalid credentials)**
**Soluções possíveis:**

1. **Verificar se usuário existe no Supabase Auth:**
```
Dashboard > Authentication > Users
```

2. **Criar usuário manualmente (como mostrado acima)**

3. **Resetar senha:**
```
Dashboard > Authentication > Users > [seu usuário] > Send password reset
```

---

### **Problema: Perfil não é criado em public.users**
**Causa:** RLS pode estar bloqueando

**Solução temporária:**
```sql
-- Desabilitar RLS temporariamente (apenas para teste!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Testar login novamente

-- Reabilitar depois
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

**Solução definitiva:** Aplicar políticas RLS corretas (FASE 3)

---

### **Problema: App não compila**
**Erro comum:** Import do `useAuthProfile`

**Solução:**
```bash
# Verificar se arquivo foi criado
ls -la hooks/useAuthProfile.ts

# Se não existir, criar novamente
# (arquivo já foi criado acima)
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### **Antes de continuar para FASE 3:**

- [ ] Servidor reiniciado com sucesso
- [ ] Console sem erros críticos
- [ ] Login com email/senha funciona
- [ ] Perfil criado em `public.users`
- [ ] `auth_user_id` preenchido corretamente
- [ ] Dashboard e funcionalidades básicas funcionam
- [ ] Logout funciona
- [ ] Reload mantém sessão

---

## 🎯 SE TUDO FUNCIONOU

**Parabéns! 🎉**

Você completou **FASE 1** e **FASE 2** com sucesso!

### **Próxima fase: RLS (Row Level Security)**

**O que vamos fazer:**
1. ✅ Habilitar RLS em todas as tabelas
2. ✅ Criar políticas de acesso por role (admin/operator)
3. ✅ Testar permissões
4. ✅ Garantir segurança total dos dados

**Quando fazer:**
- Agora (se tudo funcionou perfeitamente)
- Ou deixar para depois (se quiser testar mais)

---

## 📞 ME AVISE QUANDO...

**Preciso saber o resultado dos testes para continuar:**

✅ **Funcionou tudo?**
→ "Tudo funcionou, vamos para FASE 3!"

⚠️ **Algum problema?**
→ Me mande:
- Print do console (F12)
- Mensagem de erro
- O que estava tentando fazer

❓ **Dúvidas?**
→ Pergunte qualquer coisa!

---

## 🚀 COMANDO RÁPIDO PARA COPIAR

```bash
# 1. Reiniciar servidor
npm run dev

# 2. Abrir app no navegador
# http://localhost:3000

# 3. Abrir console (F12)

# 4. Fazer login e verificar mensagens
```

---

**Data:** 3 de Novembro de 2025  
**Status:** ⏸️ Aguardando testes  
**Próxima Fase:** RLS (quando estiver pronto)

---

## 🎁 BÔNUS: QUERIES ÚTEIS

```sql
-- Ver todos os usuários com auth_user_id
SELECT username, role, active, auth_user_id 
FROM public.users 
WHERE auth_user_id IS NOT NULL;

-- Ver usuários que precisam migração
SELECT username, role, active 
FROM public.users 
WHERE auth_user_id IS NULL;

-- Contar usuários por role
SELECT role, COUNT(*) 
FROM public.users 
GROUP BY role;

-- Ver última sessão ativa
SELECT email, last_sign_in_at 
FROM auth.users 
ORDER BY last_sign_in_at DESC 
LIMIT 10;
```

---

**Boa sorte! 🍀**
