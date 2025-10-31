# 📚 Scripts SQL do BarConnect - Guia Completo

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura dos Scripts](#estrutura-dos-scripts)
3. [Ordem de Execução](#ordem-de-execução)
4. [Descrição Detalhada](#descrição-detalhada)
5. [Casos de Uso Comuns](#casos-de-uso-comuns)
6. [Troubleshooting](#troubleshooting)
7. [Segurança e Boas Práticas](#segurança-e-boas-práticas)

---

## 🎯 Visão Geral

Este diretório contém todos os scripts SQL necessários para configurar, gerenciar e manter o banco de dados do BarConnect no Supabase (PostgreSQL).

### Scripts Principais (Recomendados)

| Script | Descrição | Quando Usar |
|--------|-----------|-------------|
| **00-SCHEMA-COMPLETO.sql** | Criação completa do schema | Primeira instalação ou reset total |
| **01-DADOS-INICIAIS.sql** | População com dados de exemplo | Após criar schema, para testes |
| **02-LIMPAR-DADOS-TRANSACIONAIS.sql** | Limpeza de dados transacionais | Limpar dados de teste/desenvolvimento |
| **03-GERENCIAR-USUARIOS.sql** | Guia de gerenciamento de usuários | Criar/editar/remover usuários |

### Scripts Legados (Referência)

Os scripts abaixo são mantidos para referência histórica, mas **não devem ser usados** em novas instalações. Use o **00-SCHEMA-COMPLETO.sql** que consolida tudo:

- `schema_complete_v2.sql` - Schema antigo do PDV/Bar
- `schema_hotel.sql` - Schema antigo do hotel
- `schema_hotel_romarias.sql` - Schema antigo de romarias
- `patch_*.sql` - Patches antigos (já incluídos no schema completo)
- `fix_*.sql` - Correções antigas (já incluídas no schema completo)

---

## 🏗️ Estrutura dos Scripts

### 00-SCHEMA-COMPLETO.sql

**Propósito:** Criar toda a estrutura do banco de dados do zero.

**Contém:**
- ✅ **Módulo PDV/Bar**: Comandas, vendas, produtos, estoque
- ✅ **Módulo Hotel**: Quartos, hóspedes, reservas, cobranças
- ✅ **Módulo Romarias**: Grupos, quartos, reservas
- ✅ **Módulo Agenda**: Bookings com controle de datas
- ✅ **Triggers**: Automação de cálculos (total comanda, estoque)
- ✅ **Views**: Relatórios otimizados (vendas detalhadas, estoque crítico)
- ✅ **Índices**: Performance em consultas frequentes
- ✅ **Funções**: Utilitários (criar item customizado, etc.)

**Tabelas Criadas:**
```
PDV/Bar:
├── users                 (usuários do sistema)
├── products              (catálogo de produtos)
├── comandas              (comandas de mesa)
├── comanda_items         (itens das comandas)
├── sales                 (vendas finalizadas)
├── sale_items            (itens das vendas)
├── transactions          (transações financeiras)
└── stock_movements       (movimentações de estoque)

Hotel:
├── hotel_rooms           (quartos do hotel)
├── hotel_guests          (hóspedes)
├── hotel_reservations    (reservas)
└── hotel_room_charges    (consumos no quarto)

Romarias:
├── pilgrimages           (grupos de romaria)
├── rooms                 (quartos para agenda/romarias)
├── guests                (hóspedes de romarias)
└── room_reservations     (reservas de romarias)

Agenda:
└── bookings              (reservas com data/hora)
```

### 01-DADOS-INICIAIS.sql

**Propósito:** Popular o banco com dados de exemplo para testes.

**Contém:**
- 👥 **3 usuários** de exemplo (admin, operador, caixa)
- 🍺 **29 produtos** (bebidas, pratos, lanches, sobremesas, serviços)
- 🏨 **10 quartos de hotel** (tipos variados)
- 📅 **35 quartos** para agenda/romarias (5 andares x 5 quartos + 10 nomeados)
- 🚌 **3 romarias** de exemplo

**⚠️ IMPORTANTE:** As senhas são apenas para desenvolvimento! Substitua em produção.

### 02-LIMPAR-DADOS-TRANSACIONAIS.sql

**Propósito:** Remover dados transacionais mantendo cadastros.

**Remove:**
- ❌ Todas as vendas e itens de vendas
- ❌ Todas as comandas e itens de comandas
- ❌ Todas as transações financeiras
- ❌ Todas as movimentações de estoque
- ❌ Todas as reservas e hóspedes
- ❌ Todos os bookings

**Mantém:**
- ✅ Usuários
- ✅ Produtos (catálogo)
- ✅ Quartos
- ✅ Romarias cadastradas

### 03-GERENCIAR-USUARIOS.sql

**Propósito:** Guia completo para gerenciar usuários.

**Funcionalidades:**
- ➕ Criar novos usuários
- 📋 Listar usuários (todos, ativos, por role)
- ✏️ Atualizar dados de usuário
- 🔒 Desativar/ativar usuários
- 🗑️ Deletar usuários
- 📊 Estatísticas e auditoria
- 🔐 Funções de validação

---

## 🚀 Ordem de Execução

### 📦 Primeira Instalação (Banco Limpo)

1. **Criar Schema Completo**
   ```sql
   -- Execute no Supabase SQL Editor
   -- Arquivo: 00-SCHEMA-COMPLETO.sql
   -- Tempo estimado: ~30 segundos
   ```

2. **Popular Dados Iniciais** (Opcional, recomendado para testes)
   ```sql
   -- Arquivo: 01-DADOS-INICIAIS.sql
   -- Tempo estimado: ~5 segundos
   ```

3. **Verificar Instalação**
   ```sql
   -- Conferir se tabelas foram criadas
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Deve retornar 18 tabelas
   ```

### 🔄 Reset Completo (Banco Existente)

1. **Descomentar Seção de Limpeza** no `00-SCHEMA-COMPLETO.sql`
   ```sql
   -- Encontre o bloco comentado /* ... */
   -- Descomente para ativar limpeza
   ```

2. **Executar Schema Completo**
   ```sql
   -- Isso irá remover TUDO e recriar
   -- ATENÇÃO: Dados serão perdidos!
   ```

3. **Popular Dados Iniciais** (se necessário)

### 🧹 Limpeza de Dados de Teste

```sql
-- Arquivo: 02-LIMPAR-DADOS-TRANSACIONAIS.sql
-- Remove dados transacionais mantendo cadastros
-- Tempo estimado: ~10 segundos
```

### 👥 Gerenciar Usuários

```sql
-- Arquivo: 03-GERENCIAR-USUARIOS.sql
-- Execute as queries conforme necessidade
-- Sempre use hashes para senhas em produção!
```

---

## 📖 Descrição Detalhada

### Funcionalidades Principais

#### 1. Sistema de Estoque Inteligente

- **Rastreamento Condicional**: Produtos com `track_stock = false` não afetam estoque (ex: serviços)
- **Itens Customizados**: Produtos criados na hora da venda (sem cadastro prévio)
- **Movimentação Automática**: Trigger atualiza estoque ao registrar venda
- **Histórico Completo**: Tabela `stock_movements` registra todas as movimentações

#### 2. Gestão de Comandas

- **Total Automático**: Trigger calcula total da comanda ao adicionar/remover itens
- **Snapshot de Dados**: Preço e nome do produto são salvos no momento da venda
- **Status de Comanda**: `open`, `closed`, `cancelled`
- **Número Único**: Constraint impede números duplicados em comandas abertas

#### 3. Vendas Diretas e por Comanda

- **Vendas Diretas**: `sale_type = 'direct'`, sem comanda associada
- **Vendas por Comanda**: `sale_type = 'comanda'`, vinculada a uma comanda
- **Foreign Key Flexível**: `comanda_id` pode ser NULL (permite remoção de comandas antigas)
- **Métodos de Pagamento**: cash, credit, debit, pix, courtesy, transfer, other

#### 4. Módulo Hotel

- **Quartos**: Tipos variados (solteiro, casal, suíte, família)
- **Reservas**: Check-in/check-out, status de reserva
- **Hóspedes**: Cadastro completo com documentos
- **Cobranças**: Extras/consumos lançados na reserva

#### 5. Módulo Romarias

- **Grupos**: Cadastro de romarias com datas e ônibus
- **Quartos Dedicados**: Sistema separado de quartos para romarias
- **Reservas**: Vinculação entre quarto, hóspede e romaria
- **Flexibilidade**: Um quarto pode ser vinculado a uma romaria

#### 6. Agenda/Bookings

- **Intervalo de Tempo**: Start/end com timestamp completo
- **Validação**: Constraint garante que start < end
- **Status**: pending, confirmed, cancelled, checked_in, checked_out
- **Integração**: Pode vincular booking a uma romaria

---

## 💡 Casos de Uso Comuns

### Caso 1: Nova Instalação em Produção

```sql
-- Passo 1: Execute 00-SCHEMA-COMPLETO.sql
-- Passo 2: NÃO execute 01-DADOS-INICIAIS.sql (dados de exemplo)
-- Passo 3: Crie usuários reais com 03-GERENCIAR-USUARIOS.sql
-- Passo 4: Cadastre produtos reais via interface do sistema
```

### Caso 2: Ambiente de Testes

```sql
-- Passo 1: Execute 00-SCHEMA-COMPLETO.sql
-- Passo 2: Execute 01-DADOS-INICIAIS.sql
-- Passo 3: Teste o sistema
-- Passo 4: Execute 02-LIMPAR-DADOS-TRANSACIONAIS.sql quando quiser limpar
```

### Caso 3: Migração de Schema Antigo

```sql
-- Passo 1: Faça BACKUP completo do banco atual
-- Passo 2: Execute 00-SCHEMA-COMPLETO.sql (com limpeza descomentada)
-- Passo 3: Migre dados customizados (se houver)
-- Passo 4: Valide integridade dos dados
```

### Caso 4: Adicionar Novo Usuário

```sql
-- Use o script 03-GERENCIAR-USUARIOS.sql
-- Exemplo:
INSERT INTO public.users (username, password, name, role) 
VALUES ('novousuario', '$2b$10$hash_bcrypt_aqui', 'Nome Completo', 'operator');
```

### Caso 5: Limpar Dados de Teste Mantendo Cadastros

```sql
-- Execute: 02-LIMPAR-DADOS-TRANSACIONAIS.sql
-- Resultado: Vendas, comandas e transações removidas
--           Produtos e usuários mantidos
```

---

## 🔧 Troubleshooting

### Erro: "relation already exists"

**Causa:** Tentando criar tabela que já existe.

**Solução:**
```sql
-- Opção 1: Use IF NOT EXISTS (já incluído nos scripts)
-- Opção 2: Descomente a seção de limpeza no 00-SCHEMA-COMPLETO.sql
-- Opção 3: Delete a tabela manualmente: DROP TABLE nome_tabela CASCADE;
```

### Erro: "duplicate key value violates unique constraint"

**Causa:** Tentando inserir username ou barcode duplicado.

**Solução:**
```sql
-- Adicione ON CONFLICT DO NOTHING ao INSERT
-- Ou use ON CONFLICT (coluna) DO UPDATE SET ...
```

### Erro: "violates foreign key constraint"

**Causa:** Tentando inserir dados com referência a chave estrangeira inexistente.

**Solução:**
```sql
-- Certifique-se de inserir dados na ordem correta:
-- 1. users, products, hotel_rooms, rooms, pilgrimages
-- 2. comandas, sales, hotel_guests, guests
-- 3. comanda_items, sale_items, bookings, reservations
```

### Erro: "permission denied"

**Causa:** Usuário não tem permissões no schema public.

**Solução:**
```sql
-- Execute como superuser ou admin do Supabase
-- Ou conceda permissões:
GRANT ALL ON SCHEMA public TO seu_usuario;
GRANT ALL ON ALL TABLES IN SCHEMA public TO seu_usuario;
```

### Lentidão em Consultas

**Causa:** Índices não criados ou estatísticas desatualizadas.

**Solução:**
```sql
-- Recriar estatísticas
ANALYZE;

-- Verificar índices
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Recriar índices se necessário (já incluídos no script principal)
```

---

## 🔐 Segurança e Boas Práticas

### ⚠️ NUNCA Faça Isso em Produção

1. ❌ Usar senhas em texto plano
2. ❌ Usar hashes de exemplo (como no 01-DADOS-INICIAIS.sql)
3. ❌ Expor credenciais em logs ou código
4. ❌ Desabilitar SSL/TLS
5. ❌ Usar usuário admin para aplicação
6. ❌ Permitir SQL injection (sempre use prepared statements)

### ✅ Sempre Faça Isso em Produção

1. ✅ Usar hashes bcrypt/Argon2 para senhas (custo mínimo 10)
2. ✅ Habilitar SSL/TLS para conexões
3. ✅ Usar variáveis de ambiente para credenciais
4. ✅ Implementar Row Level Security (RLS) no Supabase
5. ✅ Fazer backup regular do banco de dados
6. ✅ Monitorar queries lentas e uso de recursos
7. ✅ Rotacionar credenciais periodicamente
8. ✅ Implementar auditoria de acesso
9. ✅ Limitar privilégios por role (admin vs operator)
10. ✅ Validar dados na aplicação antes de inserir no banco

### 🔑 Gerando Hashes de Senha

**Node.js (bcrypt):**
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hash = await bcrypt.hash('senha_segura', saltRounds);
console.log(hash);
```

**Python:**
```python
import bcrypt
password = b"senha_segura"
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=10))
print(hashed.decode('utf-8'))
```

### 🛡️ Row Level Security (RLS)

O script `00-SCHEMA-COMPLETO.sql` inclui um exemplo comentado de RLS para a agenda. Para ativar:

```sql
-- Descomentar seção RLS no final do script
-- Customizar políticas conforme necessidade
-- Exemplo:
CREATE POLICY "Users can view their own data" ON public.sales
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 📊 Monitoramento

```sql
-- Queries mais lentas
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Tamanho das tabelas
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public';
```

---

## 📞 Suporte

### Documentação Adicional

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **README Principal**: `../README.md`
- **Arquitetura**: `../ARCHITECTURE.md`

### Contato

Para dúvidas ou problemas, consulte a documentação do projeto ou abra uma issue no repositório.

---

## 📝 Changelog

### Versão 1.0 (2025-10-31)

- ✅ Consolidação de todos os scripts SQL em arquivos unificados
- ✅ Script completo de schema (`00-SCHEMA-COMPLETO.sql`)
- ✅ Script de dados iniciais (`01-DADOS-INICIAIS.sql`)
- ✅ Script de limpeza de dados (`02-LIMPAR-DADOS-TRANSACIONAIS.sql`)
- ✅ Guia de gerenciamento de usuários (`03-GERENCIAR-USUARIOS.sql`)
- ✅ Documentação completa (este README)
- ✅ Suporte a itens customizados
- ✅ Rastreamento condicional de estoque
- ✅ Integração completa entre PDV, Hotel, Romarias e Agenda
- ✅ Triggers e views otimizados
- ✅ Índices de performance

---

**Última atualização:** 2025-10-31  
**Versão dos Scripts:** 1.0  
**Compatibilidade:** PostgreSQL 12+, Supabase
