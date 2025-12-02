# 🚀 Deploy na Vercel - BarConnect

## ⚠️ Configuração Obrigatória de Variáveis de Ambiente

### 1. Acessar Settings no Vercel
1. Abra seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**

### 2. Adicionar as seguintes variáveis:

#### **NEXT_PUBLIC_SUPABASE_URL**
```
https://seu-projeto.supabase.co
```
- Onde encontrar: Supabase Dashboard → Project Settings → API → Project URL

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGc... (sua chave pública anon)
```
- Onde encontrar: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`

#### **SUPABASE_SERVICE_ROLE_KEY** ⚠️ **IMPORTANTE - SECRETA**
```
eyJhbGc... (sua chave service_role)
```
- Onde encontrar: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
- ⚠️ **NUNCA EXPONHA ESSA CHAVE NO FRONTEND**

---

## 📋 Checklist de Deploy

### ✅ Antes do Deploy:
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] RLS habilitado no Supabase (12 tabelas)
- [ ] Migrations executadas (001 a 004)
- [ ] Usuários admin e operador criados no banco
- [ ] Arquivo `.env.local` adicionado ao `.gitignore`

### ✅ Após o Deploy:
- [ ] Testar login com admin
- [ ] Testar login com operador
- [ ] Testar criação de usuário via API
- [ ] Verificar que RLS está funcionando
- [ ] Testar PDV (criar comanda, venda direta)
- [ ] Verificar logs da Vercel (se houver erros)

---

## 🔧 Troubleshooting

### Erro: "supabaseKey is required"
**Causa:** Variáveis de ambiente não configuradas na Vercel  
**Solução:** Configure as 3 variáveis acima em Settings → Environment Variables

### Erro: "Failed to collect page data for /api/create-user"
**Causa:** API Route tentando acessar Supabase durante o build  
**Solução:** ✅ Corrigido - Cliente Supabase agora é instanciado dentro da função

### Erro: "new row violates row-level security policy"
**Causa:** RLS habilitado mas políticas não aplicadas  
**Solução:** Execute `supabase/rls-policies.sql` no Supabase SQL Editor

### Erro: "Invalid login credentials"
**Causa:** Usuário não existe em `auth.users`  
**Solução:** Execute migration `004-add-email-and-create-auth-users.sql`

---

## 🔐 Segurança em Produção

### ✅ Já implementado:
- ✅ Senhas criptografadas com bcrypt (Supabase Auth)
- ✅ Service Role Key isolada no backend (API Route)
- ✅ RLS habilitado em todas as tabelas
- ✅ Frontend valida permissões (admin vs operador)
- ✅ API valida credenciais de admin antes de criar usuários
- ✅ Rollback automático se criação falhar

### ⚠️ Recomendações adicionais:
- [ ] Configurar CORS se necessário
- [ ] Adicionar rate limiting na API (Vercel Pro)
- [ ] Monitorar logs de acesso
- [ ] Backup automático do Supabase (Point-in-Time Recovery)

---

## 📊 Comandos Úteis

### Verificar build localmente:
```bash
npm run build
```

### Verificar variáveis de ambiente (local):
```bash
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)"
```

### Forçar redeploy na Vercel:
```bash
git commit --allow-empty -m "chore: Force Vercel redeploy"
git push origin master
```

---

## 📞 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Documentação Vercel:** https://vercel.com/docs/environment-variables
- **Documentação Supabase:** https://supabase.com/docs/guides/auth

---

**Status:** ✅ Correção aplicada - Pronto para redeploy!
