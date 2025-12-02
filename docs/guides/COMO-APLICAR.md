# 🚀 Como Aplicar o Schema Unificado

> **Objetivo:** Consolidar toda a estrutura do banco em um único schema  
> **Tempo:** ~5 minutos  
> **Risco:** Muito baixo (com verificações de segurança embutidas)

---

## 📋 **Pré-requisitos**

- ✅ Acesso ao Supabase SQL Editor
- ✅ Permissões de admin no projeto
- ⏱️ 5 minutos de tempo

---

## 🎯 **O Que Este Script Faz**

O arquivo `schema-unificado.sql` consolida **todas as tabelas usadas** pelo BarConnect:

### **Sistema PDV (8 tabelas)**
- `users`, `products`, `comandas`, `comanda_items`
- `sales`, `sale_items`, `transactions`, `stock_movements`

### **Sistema Hotel/Romarias (4 tabelas)**
- `pilgrimages`, `rooms`, `guests`, `room_reservations`

### **Limpeza Automática (Segura)**
- Tabelas duplicadas `hotel_*` (não usadas no código):
  - **Se estiverem VAZIAS:** Remove (DROP)
  - **Se tiverem dados:** Renomeia para `*_backup` (preserva tudo)

### **Views e Triggers**
- ✅ `sales_detailed` (relatórios)
- ✅ `products_critical_stock` (alertas de estoque)
- ✅ `trigger_update_comanda_total` (atualiza total automaticamente)
- ✅ `trigger_stock_movement` (reduz estoque nas vendas)

---

## 🛡️ **Segurança**

- ✅ **Zero downtime** esperado
- ✅ **Nenhuma tabela usada** será dropada
- ✅ **Dados preservados** (hotel_* com dados vira *_backup)
- ✅ **Idempotente** (pode rodar múltiplas vezes sem quebrar)
- ✅ **Rollback disponível** (via backup do Supabase)

---

## 📝 **Passo a Passo**

### **1️⃣ Fazer Backup (OBRIGATÓRIO)**

```bash
# No Supabase Dashboard:
Settings → Database → Backups → Create backup now
```

✅ **Aguarde confirmação** do backup antes de prosseguir!

---

### **2️⃣ Abrir o SQL Editor**

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New query**

---

### **3️⃣ Executar o Schema Unificado**

Copie e cole **TODO** o conteúdo de:

```
supabase/schema-unificado.sql
```

**Ou**, se preferir, execute via arquivo:

1. Abra `schema-unificado.sql` no VS Code
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou F5)

---

### **4️⃣ Aguardar Execução**

Você verá mensagens como:

```
NOTICE: === LIMPEZA DE TABELAS DUPLICADAS (hotel_*) ===
NOTICE: Removido: hotel_rooms (vazia)
NOTICE: Removido: hotel_guests (vazia)
NOTICE: === FIM DA LIMPEZA DE TABELAS DUPLICADAS ===
NOTICE: 🎉 Schema unificado aplicado com sucesso!
NOTICE: ✅ PDV + HOTEL/ROMARIAS consolidado e pronto.
```

⏱️ **Tempo esperado:** 10-30 segundos

---

### **5️⃣ Validar a Aplicação**

Execute o script de validação:

```bash
# Copie e cole o conteúdo de:
supabase/validacao-pos-unificacao.sql
```

**Resultado esperado:**

```
✅ users
✅ products
✅ comandas
✅ comanda_items
✅ sales
✅ sale_items
✅ transactions
✅ stock_movements
✅ pilgrimages
✅ rooms
✅ guests
✅ room_reservations

✅ sales_detailed
✅ products_critical_stock

✅ trigger_update_comanda_total
✅ trigger_stock_movement
```

---

### **6️⃣ Testar o Sistema**

Abra o aplicativo BarConnect e teste:

- ✅ **Login** (users/auth)
- ✅ **Comandas** (criar, adicionar itens, fechar)
- ✅ **Vendas Diretas** (vender sem comanda)
- ✅ **Produtos** (adicionar, editar, verificar estoque)
- ✅ **Romarias** (criar, visualizar)
- ✅ **Quartos** (check-in, check-out)

---

## ❓ **FAQ (Perguntas Frequentes)**

### **P: O sistema vai parar de funcionar?**
**R:** Não! O schema unificado usa os **mesmos nomes de tabelas** que já existem. É só uma consolidação + limpeza.

### **P: E se eu tiver dados nas tabelas hotel_*?**
**R:** O script **renomeia automaticamente** para `hotel_*_backup`. Seus dados ficam preservados e você pode migrar depois se quiser.

### **P: Posso rodar este script múltiplas vezes?**
**R:** Sim! É idempotente. `CREATE TABLE IF NOT EXISTS` garante que não quebre nada.

### **P: Preciso parar o aplicativo?**
**R:** Não! Zero downtime. O schema não altera tabelas existentes, só garante que existam e limpa duplicatas.

### **P: E se algo der errado?**
**R:** Use o backup que você criou no passo 1:
```
Settings → Database → Backups → [seu backup] → Restore
```

### **P: Como sei se funcionou?**
**R:** Execute o `validacao-pos-unificacao.sql` e veja se todos os ✅ aparecem.

---

## 🔧 **Comandos Úteis Pós-Aplicação**

### **Ver todas as tabelas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### **Verificar se hotel_* foram removidas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'hotel_%';
```

### **Listar views:**
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

### **Listar triggers:**
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 📊 **Comparação: Antes vs Depois**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Arquivos SQL** | schema-pdv.sql + schema-hotel.sql | ✅ schema-unificado.sql |
| **Tabelas duplicadas** | ❌ hotel_rooms, hotel_guests, etc. | ✅ Removidas/renomeadas |
| **Complexidade** | Alta (2 schemas) | ✅ Baixa (1 schema) |
| **Manutenção** | Difícil (sincronizar 2 arquivos) | ✅ Fácil (1 fonte única) |

---

## ✅ **Checklist de Execução**

- [ ] Backup criado no Supabase
- [ ] Abri o SQL Editor
- [ ] Copiei e colei `schema-unificado.sql`
- [ ] Executei (RUN/F5)
- [ ] Vi mensagens de sucesso
- [ ] Executei `validacao-pos-unificacao.sql`
- [ ] Todos os ✅ apareceram
- [ ] Testei login, comandas e vendas
- [ ] Testei romarias e quartos (se usado)
- [ ] Sistema funcionando 100%

---

## 🎉 **Pronto!**

Seu banco agora está:
- ✅ **Consolidado** (1 schema único)
- ✅ **Limpo** (sem duplicatas)
- ✅ **Documentado** (tudo em schema-unificado.sql)
- ✅ **Preparado** para o futuro

---

## 📞 **Suporte**

**Dúvidas?**
- Consulte: `supabase/INDEX.md` (navegação completa)
- Veja queries: `supabase/relatorios.sql`
- Referência: `supabase/GUIA-RAPIDO.md`

**Algo deu errado?**
- Restaure o backup (Passo 1)
- Revise os logs do SQL Editor
- Verifique se copiou TODO o conteúdo do arquivo

---

**Data:** 2 de Novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para produção
