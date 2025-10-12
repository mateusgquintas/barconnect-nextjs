## 🔧 Instruções para Corrigir Foreign Keys no Supabase

### **Execute este SQL no Supabase SQL Editor:**

```sql
-- Remover constraint restritiva existente
ALTER TABLE public.sales 
DROP CONSTRAINT sales_comanda_id_fkey;

-- Recriar constraint que permite remoção de comandas
ALTER TABLE public.sales 
ADD CONSTRAINT sales_comanda_id_fkey 
FOREIGN KEY (comanda_id) 
REFERENCES public.comandas(id) 
ON DELETE SET NULL;
```

### **Após executar, rode:**
```bash
node scripts/clean-database.js --clean
```

### **Explicação:**
- **Antes**: `ON DELETE RESTRICT` (não permite remover comanda se tem venda)
- **Depois**: `ON DELETE SET NULL` (remove comanda, deixa comanda_id=NULL na venda)

Isso permite:
✅ Reutilizar números de comanda  
✅ Manter histórico de vendas  
✅ Limpeza automática de comandas fechadas