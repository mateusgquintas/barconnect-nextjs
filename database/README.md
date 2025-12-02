# 🗄️ Database Utilities

Esta pasta contém utilitários para gerenciamento do banco de dados.

## 📁 Arquivos

### Scripts Ativos
- **`clean-transactional-data.js`** - Script Node.js para limpar dados transacionais (vendas, comandas)
- **`clean-transactional-data.sql`** - SQL para limpar dados transacionais
- **`manage_users_guide.sql`** - Guia SQL para gerenciamento de usuários

## 🔧 Como Usar

### Limpar Dados Transacionais
```bash
npm run supabase:clean-transactional
```

Ou execute diretamente:
```bash
node database/clean-transactional-data.js
```

### Gerenciar Usuários
Execute o SQL do arquivo `manage_users_guide.sql` no Supabase SQL Editor.

## 📝 Notas

- **Migrations** estão em `supabase/migrations/` - essa é a fonte da verdade para o schema
- **Schemas antigos** foram movidos para `docs/archived/database-old/`
- **Patches aplicados** foram arquivados em `docs/archived/database-old/`

## ⚠️ Atenção

Scripts de limpeza são **destrutivos**. Use apenas em ambiente de desenvolvimento ou com backup completo.
