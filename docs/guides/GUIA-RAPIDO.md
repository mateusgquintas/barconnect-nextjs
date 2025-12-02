# 📖 Guia Completo de Uso - Banco de Dados BarConnect

> **Data:** 31 de Outubro de 2025  
> **Versão:** 1.0  
> **Status:** Documentação oficial da estrutura em produção

---

## 🎯 **Visão Geral**

Este guia explica **como usar** cada tabela do sistema BarConnect, incluindo exemplos práticos de INSERT, UPDATE, SELECT e DELETE.

---

## 📊 **SISTEMA PDV (Comandas e Vendas)**

### **1. Tabela: `users`**

**Propósito:** Autenticação e controle de acesso

**Campos principais:**
- `username` → Login único
- `password` → Hash bcrypt da senha
- `name` → Nome completo
- `role` → 'admin' ou 'operator'

**Exemplos:**

```sql
-- Criar novo usuário (a senha deve ser hash bcrypt)
INSERT INTO users (username, password, name, role)
VALUES ('joao', '$2b$10$...hashaqui...', 'João Silva', 'operator');

-- Buscar usuário por username
SELECT * FROM users WHERE username = 'joao' AND active = true;

-- Atualizar papel do usuário
UPDATE users SET role = 'admin' WHERE username = 'joao';

-- Desativar usuário (soft delete)
UPDATE users SET active = false WHERE username = 'joao';
```

---

### **2. Tabela: `products`**

**Propósito:** Catálogo de produtos com estoque

**Campos principais:**
- `name` → Nome do produto
- `price` → Preço de venda
- `cost_price` → Preço de custo
- `stock` → Quantidade em estoque
- `min_stock` → Estoque mínimo (alerta)
- `category` → Categoria do produto

**Exemplos:**

```sql
-- Adicionar novo produto
INSERT INTO products (name, price, cost_price, stock, min_stock, category)
VALUES ('Coca-Cola 2L', 8.50, 5.00, 50, 10, 'bebidas');

-- Buscar produtos por categoria
SELECT * FROM products 
WHERE category = 'bebidas' AND active = true
ORDER BY name;

-- Atualizar estoque (use com cuidado - há trigger automático nas vendas)
UPDATE products 
SET stock = stock + 20 
WHERE id = 'uuid-do-produto';

-- Marcar produto como inativo
UPDATE products SET active = false WHERE id = 'uuid-do-produto';

-- Produtos com estoque baixo
SELECT name, stock, min_stock 
FROM products 
WHERE stock <= min_stock AND active = true;
```

---

Consulte o arquivo completo para ver todas as tabelas e exemplos detalhados.

---

## 📚 **Arquivos Relacionados**

- `schema-pdv.sql` → Estrutura completa do sistema PDV
- `schema-hotel.sql` → Estrutura do sistema Hotel/Romarias
- `relatorios.sql` → Queries prontas para relatórios
- `cleanup-unused-tables.sql` → Limpeza de tabelas não usadas

---

**Dúvidas?** Consulte os comentários nos arquivos SQL ou revise o README.md principal.
