# ⚡ COMANDOS RÁPIDOS - Copy & Paste

## 🚀 TESTAR AGORA

### **1. Reiniciar Servidor:**
```bash
# Parar servidor (Ctrl+C)
npm run dev
```

### **2. Limpar Cache do Navegador:**
```javascript
// Abrir console (F12) e executar:
localStorage.clear()
location.reload()
```

### **3. Verificar Logs:**
```javascript
// Console deve mostrar:
// 📊 Supabase Status: { isUsingMock: false, ... }
```

---

## 🔍 QUERIES SQL ÚTEIS

### **Ver Usuários com Auth Vinculado:**
```sql
SELECT 
  id,
  username,
  name,
  role,
  active,
  auth_user_id,
  created_at
FROM public.users 
WHERE auth_user_id IS NOT NULL
ORDER BY created_at DESC;
```

### **Ver Usuários Que Precisam Migração:**
```sql
SELECT 
  id,
  username,
  name,
  role,
  active
FROM public.users 
WHERE auth_user_id IS NULL;
```

### **Verificar Coluna auth_user_id Existe:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'auth_user_id';
```

### **Ver Últimas Sessões (Auth):**
```sql
-- Nota: Precisa ter permissão para ler auth.users
SELECT 
  id,
  email,
  last_sign_in_at,
  created_at
FROM auth.users 
ORDER BY last_sign_in_at DESC 
LIMIT 10;
```

### **Limpar Usuários Duplicados:**
```sql
-- CUIDADO! Revise antes de executar
-- Mantém apenas o registro mais recente por username
DELETE FROM public.users 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.users 
  GROUP BY username
);
```

### **Migrar Usuário Específico Manualmente:**
```sql
-- Vincular auth_user_id a usuário existente
UPDATE public.users 
SET auth_user_id = 'UUID-DO-AUTH-USER-AQUI'
WHERE username = 'email@dominio.com';
```

---

## 🧪 TESTAR LOGIN

### **Via Console do Navegador:**
```javascript
// 1. Abrir console (F12)

// 2. Testar login
const { loginWithCredentials } = useAuth()
await loginWithCredentials('seu@email.com', 'suaSenha123')

// 3. Verificar usuário
console.log(user)
```

### **Via Interface:**
```
1. Ir para /login
2. Digitar: seu@email.com
3. Digitar: suaSenha123
4. Clicar em "Entrar"
5. Verificar console (F12) para logs
```

---

## 🔧 CRIAR USUÁRIO NO SUPABASE

### **Via Dashboard:**
```
1. Abrir Supabase Dashboard
2. Authentication > Users
3. Add User > Create new user
4. Email: seu@email.com
5. Password: suaSenha123
6. ✅ Auto Confirm User
7. Create User
```

### **Via API (se tiver SDK configurado):**
```typescript
// Admin SDK (backend apenas)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NUNCA no frontend!
)

const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'usuario@dominio.com',
  password: 'senha123',
  email_confirm: true
})
```

---

## 🐛 TROUBLESHOOTING

### **Erro: "auth_user_id column does not exist"**
```sql
-- Executar migration novamente
-- Copiar conteúdo de: supabase/migrations/003-users-auth-link.sql
-- E executar no Supabase SQL Editor
```

### **Erro: "Invalid login credentials"**
```sql
-- Verificar se usuário existe no Supabase Auth
-- Dashboard > Authentication > Users

-- Se não existir, criar via dashboard
-- Se existir mas não funciona, resetar senha:
-- Dashboard > Authentication > Users > [usuário] > Send password reset
```

### **Perfil não criado após login:**
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Testar login novamente

-- Reabilitar (importante!)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### **Ver erros detalhados:**
```javascript
// No console do navegador (F12)
// Aba Console > Filter por "❌" para ver erros
// Ou digitar:
console.log = (function(oldLog) {
  return function() {
    oldLog.apply(console, arguments);
  }
})(console.log);
```

---

## 📊 VALIDAÇÃO RÁPIDA

### **Checklist de 1 Minuto:**
```bash
# 1. Servidor rodando?
✅ npm run dev funcionando

# 2. Console sem erros críticos?
✅ F12 > Console > Sem erros vermelhos

# 3. Login funciona?
✅ Consegue fazer login

# 4. Perfil criado?
✅ SELECT * FROM public.users WHERE auth_user_id IS NOT NULL

# 5. Logout funciona?
✅ Clica em sair e volta para login

# 6. Reload mantém sessão?
✅ F5 e continua logado
```

---

## 🎯 PRÓXIMA FASE (RLS)

### **Aplicar RLS Básico (Transição):**
```sql
-- Copiar e executar:
-- supabase/rls-policies.sql
-- (Mantém compatibilidade, apenas habilita RLS)
```

### **Testar Acesso:**
```sql
-- Verificar se consegue acessar dados
SELECT * FROM products LIMIT 5;
SELECT * FROM comandas LIMIT 5;
SELECT * FROM sales LIMIT 5;
```

### **Aplicar RLS Seguro (Produção):**
```sql
-- Copiar e executar:
-- supabase/rls-policies.secure.sql
-- (Restringe acesso por role)
```

---

## 💾 BACKUP RÁPIDO

### **Antes de Aplicar RLS:**
```bash
# No Supabase Dashboard:
Settings > Database > Backups > Create backup now

# Aguardar confirmação antes de continuar
```

---

## 📝 LOGS ESPERADOS (SUCESSO)

### **No Console após Login:**
```
📊 Supabase Status: { isUsingMock: false, hasUrl: true, hasKey: true }
✅ Login bem-sucedido: seu@email.com | Role: operator
🔐 Auth event: SIGNED_IN
✅ Novo perfil criado: seu@email.com
```

### **No Console após Logout:**
```
✅ Logout bem-sucedido
✅ Logout realizado
🔐 Auth event: SIGNED_OUT
```

### **No Console após Reload (F5):**
```
📊 Supabase Status: { isUsingMock: false, hasUrl: true, hasKey: true }
🔐 Auth event: SIGNED_IN
(Usuário continua logado sem pedir credenciais)
```

---

## ⚡ COMANDOS DE EMERGÊNCIA

### **Resetar Tudo (CUIDADO!):**
```sql
-- Limpar todos os perfis
TRUNCATE public.users CASCADE;

-- Recriar estrutura
-- Executar: supabase/schema-unificado.sql
-- Executar: supabase/migrations/003-users-auth-link.sql
```

### **Voltar para Estado Anterior:**
```bash
# Restaurar backup do Supabase
Settings > Database > Backups > [seu backup] > Restore
```

---

## 🎁 BÔNUS: SCRIPT DE TESTE COMPLETO

### **Copiar no console (F12) para testar:**
```javascript
// Teste completo de autenticação
(async () => {
  console.log('🧪 Iniciando testes...');
  
  // 1. Verificar contexto
  const { user, loginWithCredentials, logout } = useAuth();
  console.log('👤 Usuário atual:', user);
  
  // 2. Fazer logout (se logado)
  if (user) {
    console.log('🚪 Fazendo logout...');
    logout();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // 3. Fazer login
  console.log('🔐 Fazendo login...');
  const success = await loginWithCredentials('seu@email.com', 'suaSenha123');
  
  if (success) {
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', user);
  } else {
    console.log('❌ Login falhou');
  }
  
  // 4. Verificar perfil no banco
  console.log('🔍 Verificando banco...');
  // (Executar query SQL separadamente)
  
  console.log('🎉 Testes concluídos!');
})();
```

---

**Última atualização:** 3 de Novembro de 2025  
**Versão:** 1.0
