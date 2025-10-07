# 🔧 Como Corrigir Imports no Projeto Next.js

> **⚠️ IMPORTANTE:** Use isso APENAS no projeto **Next.js**, NÃO no Figma Make!

---

## 🎯 Qual é o Problema?

Você está vendo este erro:

```
Module not found: Can't resolve '@radix-ui/react-slot.1.2'
```

Isso acontece porque:
- No **Figma Make** (React): imports com `@versão` funcionam ✅
- No **Next.js**: imports com `@versão` NÃO funcionam ❌

---

## 💻 Solução Rápida

### Para Windows (PowerShell)

1. **Abra PowerShell no projeto Next.js:**
   ```powershell
   cd C:\Users\seuusuario\projeto-nextjs
   ```

2. **Execute o script:**
   ```powershell
   .\CORRECAO-AUTOMATICA.ps1
   ```

3. **Se der erro de permissão:**
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\CORRECAO-AUTOMATICA.ps1
   ```

4. **Instale dependências:**
   ```powershell
   npm install
   ```

5. **Teste o build:**
   ```powershell
   npm run build
   ```

---

### Para Mac/Linux (Bash)

1. **Abra terminal no projeto Next.js:**
   ```bash
   cd ~/projeto-nextjs
   ```

2. **Dê permissão ao script:**
   ```bash
   chmod +x SCRIPT-CORRECAO-AUTOMATICA.sh
   ```

3. **Execute:**
   ```bash
   ./SCRIPT-CORRECAO-AUTOMATICA.sh
   ```

4. **Instale dependências:**
   ```bash
   npm install
   ```

5. **Teste o build:**
   ```bash
   npm run build
   ```

---

## 🔍 Correção Manual (Se Preferir)

Se não quiser usar o script, pode fazer manualmente:

### No VS Code:

1. Pressione `Ctrl+Shift+H` (ou `Cmd+Shift+H` no Mac)

2. **Ative "Use Regular Expression"** (ícone `.*`)

3. **Find:**
   ```regex
   @radix-ui/react-slot@[\d.]+
   ```

4. **Replace:**
   ```
   @radix-ui/react-slot
   ```

5. Clique em **"Replace All"**

6. Repita para cada biblioteca:
   - `lucide-react@[\d.]+` → `lucide-react`
   - `class-variance-authority@[\d.]+` → `class-variance-authority`
   - `@radix-ui/react-dialog@[\d.]+` → `@radix-ui/react-dialog`
   - etc.

---

## ✅ Como Saber se Funcionou?

Depois das correções:

1. **Rode:**
   ```bash
   npm run build
   ```

2. **Deve aparecer:**
   ```
   ✓ Compiled successfully
   ```

3. **Se ainda der erro:**
   - Copie a mensagem de erro COMPLETA
   - Me envie
   - Vou te ajudar!

---

## 🚨 Erros Comuns

### Erro: "script não encontrado"

**Causa:** Você está na pasta errada

**Solução:** 
```bash
# Verifique se está na pasta certa
pwd  # Mac/Linux
cd   # Windows

# Deve mostrar: .../projeto-nextjs
```

### Erro: "npm: command not found"

**Causa:** Node.js não instalado

**Solução:**
1. Instale Node.js: https://nodejs.org
2. Reinicie o terminal
3. Tente novamente

### Erro: "Permission denied"

**Causa:** Sem permissão para executar

**Solução:**
```bash
# Mac/Linux
chmod +x SCRIPT-CORRECAO-AUTOMATICA.sh

# Windows PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## 📝 Diferença Entre os Dois Projetos

### Projeto Figma Make (React)
- **Localização:** Pasta atual onde você está
- **Imports:** `@radix-ui/react-slot@1.2.3` ✅ FUNCIONA
- **Objetivo:** Desenvolvimento e testes
- **NÃO** precisa de correção

### Projeto Next.js
- **Localização:** Outra pasta (provavelmente `hotel-recanto/`)
- **Imports:** `@radix-ui/react-slot` ✅ SEM VERSÃO
- **Objetivo:** Produção com Supabase
- **PRECISA** de correção

---

## 🎯 Checklist Final

Depois de corrigir os imports no Next.js:

- [ ] Script executou sem erros
- [ ] Rodou `npm install`
- [ ] Rodou `npm run build`
- [ ] Build completou com sucesso
- [ ] Não há erros de "Module not found"
- [ ] Pronto para continuar com deploy!

---

## 💡 Dica

**Se você ainda não criou o projeto Next.js:**

1. Ignore esses scripts por enquanto
2. Continue trabalhando no Figma Make (React)
3. Quando for migrar para Next.js:
   - Crie o projeto novo
   - Copie os arquivos
   - **ENTÃO** rode o script de correção

---

**Precisa de ajuda?** Me envie:
- Print do erro
- Qual comando você rodou
- Em qual pasta você está

Vou te ajudar! 🚀
