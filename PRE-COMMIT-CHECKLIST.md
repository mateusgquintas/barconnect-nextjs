# ✅ Checklist Pré-Commit - BarConnect

## 🎯 **Objetivo**
Garantir que todo código commitado esteja testado e funcional antes de enviar para o repositório e deploy.

---

## 📋 **Checklist Automático**

### **Comando único (RECOMENDADO):**
```bash
npm run check
```

Este comando executa automaticamente:
1. ✅ Build de produção (`npm run build`)
2. ✅ Testes unitários (`npm test`)

---

## 🔧 **Checklist Manual (passo a passo)**

### **1. Verificar build de produção**
```bash
npm run build
```

**Resultado esperado:**
```
✓ Compiled successfully in 14.6s
✓ Checking validity of types    
✓ Collecting page data
✓ Generating static pages (15/15)
✓ Finalizing page optimization
```

❌ **Se falhar:**
- Verifique erros de TypeScript
- Verifique imports quebrados
- Verifique variáveis de ambiente no `.env.local`

---

### **2. Rodar testes**
```bash
npm test
```

**Resultado esperado:**
```
Test Suites: X passed, X total
Tests:       X passed, X total
```

⚠️ **Testes falhando?**
- Se são testes antigos/quebrados: OK, pode commitar (mas anote para corrigir depois)
- Se são testes novos: CORRIJA antes de commitar
- Use `--passWithNoTests` para ignorar testes faltando

---

### **3. Verificar mudanças**
```bash
git status
git diff
```

**Revisar:**
- ✅ Apenas arquivos relacionados à feature/fix
- ✅ Sem `console.log()` desnecessários
- ✅ Sem comentários de debug (`// TODO TEMP`)
- ✅ Sem secrets ou credenciais expostas

---

### **4. Commitar**
```bash
git add .
git commit -m "tipo: descrição clara

- detalhe 1
- detalhe 2"
```

**Tipos de commit:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `refactor:` Refatoração sem mudar comportamento
- `docs:` Apenas documentação
- `test:` Adicionar ou corrigir testes
- `chore:` Configurações, scripts, dependências
- `style:` Formatação, espaços, etc
- `perf:` Melhorias de performance

---

### **5. Push**
```bash
git push origin master
```

---

## 🚨 **Checklist de Segurança**

Antes de commitar, verifique:

### **Variáveis de ambiente:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` NÃO deve estar em arquivos commitados
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` pode estar (é pública)
- ✅ Todas as secrets devem estar APENAS em `.env.local` (git ignorado)

### **Dados sensíveis:**
- ❌ Senhas ou tokens nos arquivos
- ❌ IDs ou emails reais de usuários
- ❌ URLs de APIs privadas
- ✅ Use dados de exemplo genéricos

### **Console logs:**
- ❌ `console.log(password)` - NUNCA
- ❌ `console.log(user)` - Dados sensíveis
- ✅ `console.error()` para erros importantes (ok em produção)
- ✅ Remova `console.log()` de debug antes de commitar

---

## 📊 **Fluxo Completo Recomendado**

```bash
# 1. Testar build e testes
npm run check

# 2. Revisar mudanças
git status
git diff

# 3. Adicionar arquivos
git add .

# 4. Commitar com mensagem descritiva
git commit -m "feat: Adiciona validação de email no cadastro

- Valida formato de email com regex
- Mostra mensagem de erro clara
- Adiciona testes de validação"

# 5. Push
git push origin master
```

---

## 🔄 **Scripts Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção (usa em CI/CD) |
| `npm test` | Roda todos os testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run check` | ✅ **Build + Testes (pré-commit)** |
| `npm run precommit` | Alias para `check` |
| `npm run lint` | Roda ESLint |
| `npm run typecheck` | Verifica tipos TypeScript |

---

## 💡 **Dicas**

### **Commit pequenos e frequentes:**
✅ `feat: Add email validation`  
✅ `fix: Corrige erro de login`  
❌ `fix: Vários bugs e adiciona features` (muito genérico)

### **Teste localmente antes:**
- Sempre rode `npm run dev` e teste manualmente a feature
- Se mudou algo de autenticação, teste login/logout
- Se mudou banco, teste criação/leitura/atualização

### **Build sempre antes de push:**
- Vercel faz build automático no deploy
- Se build falhar localmente, vai falhar na Vercel também
- Economize tempo testando antes!

---

## 📝 **Exemplo de Workflow Completo**

```bash
# Depois de fazer mudanças no código...

# 1. Teste manualmente
npm run dev
# Abra http://localhost:3000 e teste a feature

# 2. Rode checklist automático
npm run check

# 3. Se passou, commit
git add .
git commit -m "feat: Add user creation API

- API Route /api/create-user com Service Role Key
- Validação de admin obrigatória
- Rollback automático em caso de erro
- Testes unitários adicionados"

# 4. Push
git push origin master

# 5. Monitore deploy na Vercel
# Verifique https://vercel.com/dashboard
```

---

## ✅ **Status Atual - BarConnect**

### **Últimas verificações:**
- ✅ Build de produção: OK (14.6s)
- ⚠️ Testes: 19 failed (testes antigos), 404 passed
- ✅ Correção Vercel: Applied (Supabase instanciado em runtime)
- ✅ RLS: Habilitado com sucesso
- ✅ Autenticação: Funcionando (admin + operador)

### **Próximo commit:**
Antes de commitar, rode:
```bash
npm run check
```

Se build passar, está OK para commitar! 🚀

---

**Criado em:** 04/11/2025  
**Última atualização:** 04/11/2025  
**Versão:** 1.0
