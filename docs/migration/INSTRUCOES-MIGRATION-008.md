# 🔧 INSTRUÇÕES - Migration 008: Bed Configuration

## ⚠️ IMPORTANTE: Execute esta migration no Supabase SQL Editor

### 📋 Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - Menu lateral: SQL Editor
   - Clique em "New Query"

3. **Cole o conteúdo da migration**
   - Arquivo: `supabase/migrations/008-add-bed-configuration.sql`
   - Cole TODO o conteúdo no editor

4. **Execute a migration**
   - Clique em "Run" ou pressione Ctrl+Enter
   - Aguarde confirmação de sucesso

### ✅ Resultado Esperado

Você verá mensagens como:
```
✅ Coluna bed_configuration adicionada à tabela rooms
✅ Índice GIN criado para bed_configuration
╔════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 008 CONCLUÍDA COM SUCESSO               ║
╚════════════════════════════════════════════════════════╝
```

### 🔍 O Que Esta Migration Faz

**Adiciona o campo `bed_configuration` (JSONB) na tabela `rooms`**

Este campo armazena a configuração EXATA das camas, exemplo:
```json
[
  {"id": "1", "type": "casal", "quantity": 1},
  {"id": "2", "type": "solteiro", "quantity": 2}
]
```

### 🎯 Benefícios

**ANTES da migration:**
- ❌ Quarto 201: 3 camas, 5 pessoas
- ❌ Sistema estimava: "2 camas de casal, 1 solteiro"
- ❌ Real era: "1 queen, 1 beliche, 1 sofá-cama"
- ❌ Ao editar novamente, perdia a configuração real

**DEPOIS da migration:**
- ✅ Quarto 201: Salva configuração exata no banco
- ✅ Lista mostra: "1 cama Queen, 1 cama Beliche, 1 cama Sofá-cama"
- ✅ Ao editar novamente, carrega EXATAMENTE as camas anteriores
- ✅ Configuração preservada para sempre

### 🚀 Após Executar a Migration

1. **Teste a funcionalidade:**
   - Edite o quarto 201
   - Adicione: 1 cama de casal, 2 camas de solteiro
   - Salve
   - Edite novamente
   - ✅ Deve mostrar exatamente "1 casal, 2 solteiro"

2. **Observe no card:**
   - A lista descritiva deve mostrar a configuração real
   - Não mais estimativas

### 📝 Observações

- ✅ **Compatibilidade total**: Quartos antigos continuam funcionando (usa estimativa)
- ✅ **Novos quartos**: Salvam configuração detalhada automaticamente
- ✅ **Índice GIN**: Otimiza consultas em dados JSONB
- ✅ **Sem perda de dados**: Migration é aditiva (apenas adiciona campo)

### 🔄 Em Caso de Erro

Se a migration falhar:
1. Verifique se a coluna já existe: 
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'rooms' AND column_name = 'bed_configuration';
   ```
2. Se retornar resultado, a migration já foi executada
3. Se der erro de permissão, contacte o admin do Supabase

---

**Status:** ⏳ Aguardando execução manual no Supabase
