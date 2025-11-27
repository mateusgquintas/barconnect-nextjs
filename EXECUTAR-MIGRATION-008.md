# 🚨 EXECUTAR MIGRATION 008 - URGENTE

## ❌ PROBLEMA ATUAL

As camas **NÃO** estão sendo salvas porque a coluna `bed_configuration` **NÃO EXISTE** no banco de dados!

Quando você:
1. Edita um quarto e adiciona camas
2. Salva → Supabase **IGNORA** o campo `bed_configuration` (coluna não existe)
3. Recarrega → Código não encontra `bed_configuration` → Mostra estimativa errada
4. Abre edição → Carrega estimativa ao invés das camas reais

## ✅ SOLUÇÃO (2 minutos)

### PASSO 1: Abrir Supabase
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**

### PASSO 2: Executar Migration
1. Clique em **"New query"**
2. Copie TODO o conteúdo do arquivo: `supabase/migrations/008-add-bed-configuration.sql`
3. Cole no editor SQL
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

### PASSO 3: Verificar Sucesso
Você deve ver mensagens como:
```
✅ Coluna bed_configuration adicionada à tabela rooms
✅ Índice GIN criado para bed_configuration
╔════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 008 CONCLUÍDA COM SUCESSO               ║
╚════════════════════════════════════════════════════════╝
```

### PASSO 4: Testar no Aplicativo
1. Recarregue a página do hotel (F5)
2. Edite um quarto
3. Configure as camas (ex: 1 Casal, 2 Solteiro)
4. Salve
5. **RECARREGUE A PÁGINA** (F5)
6. Agora deve aparecer: "1 cama de Casal, 2 camas de Solteiro" ✅
7. Edite novamente → As camas devem carregar corretamente ✅

## 🔍 COMO VERIFICAR SE FUNCIONOU

### Teste 1: No SQL Editor do Supabase
```sql
SELECT number, bed_configuration 
FROM rooms 
WHERE number = 11 
LIMIT 1;
```

**Antes da migration:**
```
bed_configuration: null
```

**Depois de editar e salvar:**
```json
bed_configuration: [
  {"id":"1","type":"casal","quantity":1},
  {"id":"2","type":"solteiro","quantity":2}
]
```

### Teste 2: No Aplicativo
✅ Cards mostram lista de camas
✅ Edit dialog carrega camas salvas
✅ Após recarregar página, camas permanecem

## ⚠️ IMPORTANTE

**SEM EXECUTAR A MIGRATION 008:**
- ❌ Camas NÃO serão salvas
- ❌ Sempre mostrará estimativa
- ❌ Perderá configuração ao recarregar

**DEPOIS DE EXECUTAR A MIGRATION 008:**
- ✅ Camas serão salvas corretamente
- ✅ Configuração exata preservada
- ✅ Lista detalhada nos cards

---

## 📁 Arquivo da Migration

**Localização:** `supabase/migrations/008-add-bed-configuration.sql`

**O que faz:**
1. Adiciona coluna `bed_configuration` (tipo JSONB)
2. Cria índice GIN para performance
3. Adiciona comentário explicativo

**Tempo de execução:** ~2 segundos

**É reversível?** Sim (se necessário, execute `ALTER TABLE rooms DROP COLUMN bed_configuration;`)

---

## 🎯 PRÓXIMO PASSO

**EXECUTE A MIGRATION 008 AGORA!** 

Depois disso, tudo funcionará perfeitamente! 🚀
