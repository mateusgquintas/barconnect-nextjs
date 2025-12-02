# 🔐 FASE 3 - Aplicar RLS (Row Level Security)

## 📍 ONDE VOCÊ ESTÁ AGORA

### ✅ Completado até agora:
- ✅ **FASE 1:** Banco de dados preparado (schema + migrations)
- ✅ **FASE 2:** Autenticação funcionando (Supabase Auth)
  - ✅ Login com username ou email
  - ✅ Criação de usuários via API
  - ✅ Senhas seguras (bcrypt em auth.users)
  - ✅ Sem vazamentos de dados
- ✅ **Testes:** Sistema criando e autenticando usuários perfeitamente

### ⏸️ Próximo passo (AGORA):
- **FASE 3:** Aplicar RLS para proteger os dados

---

## 🎯 O QUE É RLS E POR QUE APLICAR?

### 🤔 O que é RLS?
**RLS (Row Level Security)** = Segurança por linha no PostgreSQL

Sem RLS:
```sql
-- ❌ Qualquer usuário logado pode ver/editar TUDO
SELECT * FROM products; -- Retorna todos os produtos
DELETE FROM sales WHERE id = 123; -- Qualquer um pode deletar!
```

Com RLS:
```sql
-- ✅ Supabase verifica automaticamente:
-- - Usuário está autenticado?
-- - Qual é o role dele? (admin ou operator)
-- - Tem permissão para ver/editar essa linha?

-- Admin: vê tudo
-- Operator: vê só o que está ativo
```

### 🛡️ Por que aplicar?
1. **Segurança:** Previne acesso não autorizado aos dados
2. **Controle:** Admin vê tudo, Operator vê só o necessário
3. **Auditoria:** Fica registrado quem acessou o quê
4. **Compliance:** LGPD/GDPR exige controle de acesso

---

## 📋 O QUE SERÁ FEITO

### 2 Arquivos SQL para aplicar:

#### 1️⃣ **rls-policies.sql** (PRIMEIRO - Transição)
```
Objetivo: Habilitar RLS mantendo compatibilidade
- Habilita RLS em todas as tabelas
- Políticas permissivas (todos veem tudo, por enquanto)
- Garante que sistema continue funcionando
- Prepara para políticas seguras
```

#### 2️⃣ **rls-policies.secure.sql** (DEPOIS - Produção)
```
Objetivo: Aplicar regras de segurança por role
- Admin: acesso total
- Operator: acesso limitado
- Regras por tabela (products, sales, etc.)
- Produção-ready
```

---

## 🚀 PASSO A PASSO - APLICAR RLS

### ⚠️ IMPORTANTE: Faça backup antes!

```sql
-- No Supabase: Dashboard → SQL Editor → New Query
-- Execute isso PRIMEIRO (backup)

-- Ver estrutura atual
\dt public.*

-- Contar registros
SELECT 
  'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'comandas', COUNT(*) FROM comandas;
```

---

### 📝 PASSO 1: Aplicar RLS Básico (Transição)

**Arquivo:** `supabase/rls-policies.sql`

```bash
1. Abrir Supabase Dashboard
2. Ir em: SQL Editor → New Query
3. Copiar TODO o conteúdo de: supabase/rls-policies.sql
4. Colar na query
5. Clicar em "Run" (ou Ctrl+Enter)
6. Aguardar mensagem: "Success. No rows returned"
```

**O que esse SQL faz:**
```sql
-- Habilita RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
-- ... e outras tabelas

-- Cria políticas permissivas (todos autenticados podem acessar)
CREATE POLICY "users_authenticated_all" ON users
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Permite que usuários autenticados façam tudo (por enquanto)
```

**Resultado esperado:**
- ✅ RLS habilitado em todas as tabelas
- ✅ Sistema continua funcionando normalmente
- ✅ Todas as queries funcionam como antes
- ⚠️ Ainda não há restrições por role (todos veem tudo)

---

### 🧪 PASSO 2: Testar Aplicação

```bash
1. Abrir aplicação: http://localhost:3000
2. Fazer login como admin
3. Testar:
   ✅ Ver produtos
   ✅ Criar produto
   ✅ Ver vendas
   ✅ Criar venda
   ✅ Ver comandas
4. Logout
5. Fazer login como operador
6. Testar mesmas funcionalidades
```

**Se algo quebrar:**
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
-- ... outras tabelas

-- Investigar o problema
-- Reabilitar depois
```

---

### 🔒 PASSO 3: Aplicar RLS Seguro (Produção)

**Arquivo:** `supabase/rls-policies.secure.sql`

⚠️ **SÓ APLIQUE DEPOIS DE TESTAR O PASSO 1!**

```bash
1. Confirmar que Passo 1 funcionou perfeitamente
2. Abrir Supabase Dashboard
3. Ir em: SQL Editor → New Query
4. Copiar TODO o conteúdo de: supabase/rls-policies.secure.sql
5. Colar na query
6. Clicar em "Run"
7. Aguardar: "Success. No rows returned"
```

**O que esse SQL faz:**
```sql
-- Remove políticas permissivas
DROP POLICY IF EXISTS "users_authenticated_all" ON users;

-- Cria políticas por role
CREATE POLICY "admin_full_access" ON products
  FOR ALL USING (is_app_user('admin'));
-- Admin: acesso total ✅

CREATE POLICY "operator_read_active" ON products
  FOR SELECT USING (is_app_user('operator') AND active = true);
-- Operator: só leitura de produtos ativos ✅
```

**Resultado esperado:**
- ✅ Admin: acesso total (ver/criar/editar/deletar)
- ✅ Operator: acesso limitado (só ver produtos ativos, criar vendas)
- ✅ Segurança máxima aplicada

---

### 🧪 PASSO 4: Testar Restrições

```bash
1. Login como OPERATOR
2. Tentar acessar:
   ✅ Ver produtos ativos → DEVE FUNCIONAR
   ❌ Ver produtos inativos → NÃO DEVE APARECER
   ✅ Criar venda → DEVE FUNCIONAR
   ❌ Deletar produto → DEVE FALHAR
   ❌ Ver todos os usuários → DEVE FALHAR

3. Login como ADMIN
4. Tentar acessar:
   ✅ Ver todos os produtos → DEVE FUNCIONAR
   ✅ Ver produtos inativos → DEVE FUNCIONAR
   ✅ Criar/editar/deletar → DEVE FUNCIONAR
   ✅ Ver todos os usuários → DEVE FUNCIONAR
```

---

## 🔍 VERIFICAR SE RLS ESTÁ FUNCIONANDO

### Query de Verificação:

```sql
-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Resultado esperado: rls_enabled = true em todas as tabelas
```

### Ver Políticas Ativas:

```sql
-- Listar todas as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Testar Função is_app_user():

```sql
-- Verificar função que valida role
SELECT is_app_user('admin');  -- Deve retornar true se você for admin
SELECT is_app_user('operator'); -- Deve retornar false se você for admin
```

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### ❌ Erro: "new row violates row-level security policy"

**Causa:** RLS está bloqueando insert/update  
**Solução:**
```sql
-- Verificar se usuário tem auth_user_id
SELECT username, auth_user_id FROM users WHERE username = 'admin';

-- Se auth_user_id estiver NULL, vincular:
UPDATE users 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@barconnect.com')
WHERE username = 'admin';
```

---

### ❌ Erro: "permission denied for table"

**Causa:** RLS muito restritivo ou falta política  
**Solução:**
```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Temporariamente desabilitar para debug
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- Testar
-- Reabilitar e ajustar política
```

---

### ❌ Aplicação não carrega dados

**Causa:** Política RLS bloqueando SELECT  
**Solução:**
```sql
-- Verificar se função is_app_user funciona
SELECT 
  auth.uid() as my_auth_id,
  (SELECT auth_user_id FROM users WHERE auth_user_id = auth.uid()) as my_user,
  is_app_user('admin') as is_admin,
  is_app_user('operator') as is_operator;

-- Deve retornar seus dados
```

---

## 📊 RESUMO DAS PERMISSÕES

### 👨‍💼 Admin (role='admin')
| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| users | ✅ Todos | ✅ Sim | ✅ Sim | ✅ Sim |
| products | ✅ Todos | ✅ Sim | ✅ Sim | ✅ Sim |
| sales | ✅ Todas | ✅ Sim | ✅ Sim | ✅ Sim |
| comandas | ✅ Todas | ✅ Sim | ✅ Sim | ✅ Sim |

### 👨‍💻 Operator (role='operator')
| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| users | ❌ Nenhum | ❌ Não | ❌ Não | ❌ Não |
| products | ✅ Ativos | ❌ Não | ❌ Não | ❌ Não |
| sales | ✅ Suas | ✅ Sim | ✅ Suas | ❌ Não |
| comandas | ✅ Suas | ✅ Sim | ✅ Suas | ❌ Não |

---

## ✅ CHECKLIST DE CONCLUSÃO

### Antes de aplicar RLS:
- [ ] Backup do banco feito
- [ ] Todos os usuários têm auth_user_id preenchido
- [ ] Função is_app_user() existe e funciona
- [ ] Aplicação funcionando perfeitamente

### Após aplicar rls-policies.sql:
- [ ] Query executou sem erros
- [ ] Login como admin funciona
- [ ] Login como operator funciona
- [ ] Todas as funcionalidades testadas

### Após aplicar rls-policies.secure.sql:
- [ ] Query executou sem erros
- [ ] Admin vê tudo
- [ ] Operator vê só o permitido
- [ ] Restrições funcionando corretamente

---

## 🎯 PRÓXIMOS PASSOS DEPOIS DO RLS

### 1. **Monitoramento** (Opcional)
```sql
-- Criar view para auditar acessos
CREATE VIEW audit_log AS
SELECT 
  auth.uid() as user_id,
  current_timestamp as access_time,
  current_query() as query_executed;
```

### 2. **Otimização** (Opcional)
```sql
-- Criar índices para performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_products_active ON products(active);
```

### 3. **Documentação** (Recomendado)
- Documentar regras de acesso para equipe
- Criar manual de permissões
- Treinar operadores sobre limitações

---

## 📚 REFERÊNCIAS

### Arquivos do Projeto:
- `supabase/rls-policies.sql` - Políticas de transição
- `supabase/rls-policies.secure.sql` - Políticas de produção
- `supabase/AUTH-ARQUITETURA.md` - Arquitetura completa

### Documentação Oficial:
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## 🎉 CONCLUSÃO

Após aplicar RLS:
- ✅ Sistema 100% seguro
- ✅ Dados protegidos por role
- ✅ Compliance com LGPD/GDPR
- ✅ Pronto para produção

**Tempo estimado:** 30-60 minutos  
**Dificuldade:** Média  
**Reversível:** Sim (pode desabilitar RLS a qualquer momento)

---

**🚀 Vamos aplicar? Comece pelo Passo 1!**
