# 🔧 GUIA DE EXECUÇÃO - Migrations 008 e 009

## ⚠️ PROBLEMAS IDENTIFICADOS E SOLUÇÕES

### 🐛 Problema 1: Camas não aparecem nos cards
**Causa:** Função `getBedsDetailList` não estava mapeando corretamente os tipos de cama
**Solução:** ✅ Corrigido - Adicionado mapeamento `bedTypeLabels` 

### 🐛 Problema 2: Camas não aparecem ao editar quarto
**Causa:** Campo `bed_configuration` não existe no banco
**Solução:** ✅ Execute a Migration 008 (adiciona campo JSONB)

### 🐛 Problema 3: Migration 009 muito verbosa
**Solução:** ✅ Criado novo arquivo `009-insert-hotel-rooms-CLEAN.sql`

---

## 📋 EXECUÇÃO PASSO A PASSO

### **PASSO 1: Execute Migration 008** 
⏱️ Tempo: 5 segundos

1. Abra o Supabase SQL Editor
2. Cole o conteúdo de: `supabase/migrations/008-add-bed-configuration.sql`
3. Clique em **Run**
4. Aguarde mensagem: ✅ Coluna bed_configuration adicionada

### **PASSO 2: Execute Migration 009 CLEAN**
⏱️ Tempo: 10 segundos

1. **⚠️ ATENÇÃO:** Esta migration **DELETA** todos os quartos existentes!
2. Abra o Supabase SQL Editor (nova query)
3. Cole o conteúdo de: `supabase/migrations/009-insert-hotel-rooms-CLEAN.sql`
4. **IMPORTANTE:** Se NÃO quiser deletar quartos existentes, comente a linha 19:
   ```sql
   -- DELETE FROM rooms;  -- ← COMENTAR ESTA LINHA
   ```
5. Clique em **Run**
6. Aguarde mensagem de sucesso com estatísticas

### **PASSO 3: Verifique no Aplicativo**
⏱️ Tempo: 2 minutos

1. Recarregue a página `/hotel` no navegador
2. Verifique se os cards mostram:
   ```
   Camas:
     • 1 cama de Casal
     • 2 camas de Solteiro
   ```
3. Clique para **editar um quarto**
4. Verifique se as camas aparecem corretamente na seção "Configuração de Camas"

---

## 📊 RESULTADO ESPERADO

### **Após Migration 008:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'bed_configuration';
```
**Retorno esperado:**
```
column_name        | data_type
bed_configuration | jsonb
```

### **Após Migration 009:**
```sql
SELECT COUNT(*) as total_quartos FROM rooms;
```
**Retorno esperado:** 
```
total_quartos
59
```
(7 pousada + 37 prédio principal + 15 anexo)

### **Teste de Configuração:**
```sql
SELECT number, floor, capacity, beds, bed_configuration 
FROM rooms 
WHERE number = 11 
LIMIT 1;
```
**Retorno esperado:**
```json
{
  "number": 11,
  "floor": 1,
  "capacity": 4,
  "beds": 3,
  "bed_configuration": [
    {"id":"1","type":"casal","quantity":1},
    {"id":"2","type":"solteiro","quantity":1},
    {"id":"3","type":"sofa-cama","quantity":1}
  ]
}
```

---

## 🔍 VERIFICAÇÃO DE BUGS

### **Teste 1: Card de Quarto**
✅ Deve mostrar lista detalhada de camas
❌ Se mostrar apenas "X camas" → Migration 008 não foi executada

### **Teste 2: Edição de Quarto**
✅ Deve carregar camas configuradas anteriormente
❌ Se estimar camas erradas → Quarto foi criado antes da migration 008

### **Teste 3: Salvamento**
1. Edite o quarto 11
2. Mude para: 1 Queen + 2 Solteiro
3. Salve
4. Recarregue a página
5. ✅ Deve mostrar exatamente "1 Queen, 2 Solteiro"
6. ❌ Se mostrar estimativa → bed_configuration não está sendo salvo

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### **Erro: "column bed_configuration does not exist"**
**Solução:** Execute a Migration 008 primeiro

### **Erro: "duplicate key value violates unique constraint"**
**Solução:** Descomente a linha `DELETE FROM rooms;` na migration 009

### **Camas não aparecem nos cards**
**Solução:** 
1. Verifique se migration 008 foi executada
2. Force refresh do browser (Ctrl+Shift+R)
3. Verifique se `bed_configuration` tem dados:
   ```sql
   SELECT number, bed_configuration FROM rooms WHERE number = 11;
   ```

### **Ao editar quarto, camas não carregam**
**Solução:**
1. O quarto foi criado ANTES da migration 008
2. Edite e salve novamente - isso irá criar o bed_configuration
3. Na próxima edição, carregará corretamente

---

## 📁 ARQUIVOS MODIFICADOS

### **Código (já aplicado):**
- ✅ `hooks/useRoomsDB.ts` - Adicionado campo bed_configuration
- ✅ `components/Hotel.tsx` - Corrigido getBedsDetailList com mapeamento
- ✅ `components/rooms/RoomEditDialog.tsx` - Salva e carrega bed_configuration

### **Migrations (execute manualmente):**
- ⏳ `supabase/migrations/008-add-bed-configuration.sql` - **EXECUTAR PRIMEIRO**
- ⏳ `supabase/migrations/009-insert-hotel-rooms-CLEAN.sql` - **EXECUTAR DEPOIS**

### **Arquivos obsoletos (ignorar):**
- ❌ `supabase/migrations/009-insert-hotel-rooms.sql` - Versão antiga, não use

---

## ✅ CHECKLIST FINAL

Antes de confirmar que tudo está funcionando:

- [ ] Migration 008 executada com sucesso
- [ ] Migration 009 executada com sucesso
- [ ] Verificado total de 59 quartos no banco
- [ ] Card do quarto 11 mostra lista de camas
- [ ] Ao editar quarto 11, aparecem 3 camas configuradas
- [ ] Ao salvar nova configuração, é preservada
- [ ] Não há erros no console do navegador

---

**Pronto para executar! 🚀**
