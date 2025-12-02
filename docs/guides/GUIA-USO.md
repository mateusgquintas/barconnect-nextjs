# 📚 GUIA DE USO - Banco de Dados BarConnect

> **Atualizado:** 31 de Outubro de 2025  
> **Versão:** 2.0 (Pós-migração)

---

## 🎯 VISÃO GERAL

O BarConnect possui **2 módulos principais**:

1. **Sistema PDV** → Comandas, Vendas, Estoque
2. **Sistema Hotel** → Romarias, Quartos, Alocações

---

## 📦 MÓDULO 1: SISTEMA PDV

### Tabelas Principais

#### 1.1 - **users** (Autenticação)
```sql
-- Estrutura
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255), -- bcrypt hash
    name VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('admin', 'operator')),
    active BOOLEAN DEFAULT true
);

-- Usuários padrão
INSERT INTO users (username, password, name, role) VALUES
    ('admin', '$2b$10$...', 'Administrador', 'admin'),
    ('operador', '$2b$10$...', 'Operador', 'operator');

-- Consultas úteis
SELECT * FROM users WHERE active = true;
SELECT * FROM users WHERE role = 'admin';
```

**Hook:** `lib/authService.ts`  
**Componentes:** `LoginScreen.tsx`, `CreateUserDialog.tsx`

---

#### 1.2 - **products** (Catálogo de Produtos)
```sql
-- Estrutura
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 20,
    category VARCHAR(100),
    barcode VARCHAR(100),
    active BOOLEAN DEFAULT true
);

-- Consultas úteis
-- Produtos com estoque baixo
SELECT * FROM products WHERE stock <= min_stock AND active = true;

-- Produtos por categoria
SELECT * FROM products WHERE category = 'bebidas' AND active = true;

-- Valor total do estoque
SELECT SUM(stock * cost_price) as valor_estoque FROM products WHERE active = true;
```

**Hook:** `hooks/useProductsDB.ts`  
**Componentes:** `ProductCatalog.tsx`, `ProductFormDialog.tsx`

---

#### 1.3 - **comandas** (Comandas Abertas/Fechadas)
```sql
-- Estrutura
CREATE TABLE comandas (
    id UUID PRIMARY KEY,
    number INTEGER,
    customer_name VARCHAR(255),
    table_number INTEGER,
    status VARCHAR(20) CHECK (status IN ('open', 'closed', 'cancelled')),
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- Consultas úteis
-- Comandas abertas
SELECT * FROM comandas WHERE status = 'open' ORDER BY number;

-- Total de vendas do dia
SELECT SUM(total) FROM comandas 
WHERE status = 'closed' 
AND DATE(closed_at) = CURRENT_DATE;

-- Comandas por mesa
SELECT * FROM comandas WHERE table_number = 5 AND status = 'open';
```

**Hook:** `hooks/useComandasDB.ts`  
**Componentes:** `ComandasList.tsx`, `ComandaDetail.tsx`, `NewComandaDialog.tsx`

---

#### 1.4 - **comanda_items** (Itens das Comandas)
```sql
-- Estrutura
CREATE TABLE comanda_items (
    id UUID PRIMARY KEY,
    comanda_id UUID REFERENCES comandas(id),
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255),
    product_price DECIMAL(10,2),
    quantity INTEGER,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED
);

-- Consultas úteis
-- Itens de uma comanda
SELECT * FROM comanda_items WHERE comanda_id = 'uuid-here';

-- Produto mais vendido (comandas)
SELECT product_name, SUM(quantity) as total
FROM comanda_items
GROUP BY product_name
ORDER BY total DESC
LIMIT 10;
```

**Trigger:** Atualiza automaticamente `comandas.total` quando itens são adicionados/removidos

---

#### 1.5 - **sales** (Vendas Finalizadas)
```sql
-- Estrutura
CREATE TABLE sales (
    id UUID PRIMARY KEY,
    comanda_id UUID REFERENCES comandas(id),
    sale_type VARCHAR(20) CHECK (sale_type IN ('direct', 'comanda')),
    total DECIMAL(10,2),
    payment_method VARCHAR(50),
    is_courtesy BOOLEAN DEFAULT false,
    customer_name VARCHAR(255),
    created_at TIMESTAMP
);

-- Consultas úteis
-- Vendas do mês
SELECT DATE(created_at) as dia, SUM(total) as total
FROM sales
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY dia
ORDER BY dia;

-- Vendas por forma de pagamento
SELECT payment_method, SUM(total) as total
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY payment_method;

-- Ticket médio
SELECT AVG(total) as ticket_medio FROM sales
WHERE DATE(created_at) = CURRENT_DATE;
```

**Hook:** `hooks/useSalesDB.ts`  
**Componentes:** `SalesTransactions.tsx`, `Dashboard.tsx`

---

#### 1.6 - **transactions** (Transações Financeiras)
```sql
-- Estrutura
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    sale_id UUID REFERENCES sales(id),
    type VARCHAR(20) CHECK (type IN ('income', 'expense')),
    description TEXT,
    amount DECIMAL(10,2),
    category VARCHAR(100),
    payment_method VARCHAR(50),
    created_at TIMESTAMP
);

-- Consultas úteis
-- Receitas vs Despesas do dia
SELECT 
    type,
    SUM(amount) as total
FROM transactions
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY type;

-- Saldo do dia
SELECT 
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as saldo
FROM transactions
WHERE DATE(created_at) = CURRENT_DATE;

-- Despesas por categoria
SELECT category, SUM(amount) as total
FROM transactions
WHERE type = 'expense'
AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category
ORDER BY total DESC;
```

**Hook:** `hooks/useTransactionsDB.ts`  
**Componentes:** `Transactions.tsx`, `NewTransactionDialog.tsx`

---

#### 1.7 - **stock_movements** (Movimentação de Estoque)
```sql
-- Estrutura
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER,
    previous_stock INTEGER,
    new_stock INTEGER,
    reason VARCHAR(255),
    sale_id UUID REFERENCES sales(id),
    created_at TIMESTAMP
);

-- Consultas úteis
-- Movimentações de um produto
SELECT * FROM stock_movements 
WHERE product_id = 'uuid-here'
ORDER BY created_at DESC;

-- Entradas e saídas do dia
SELECT 
    movement_type,
    SUM(quantity) as total_quantidade
FROM stock_movements
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY movement_type;
```

**Trigger:** Automaticamente criado quando `sale_items` é inserido

---

## 🏨 MÓDULO 2: SISTEMA HOTEL (PÓS-MIGRAÇÃO)

### Tabelas Principais

#### 2.1 - **pilgrimages** (Romarias/Grupos)
```sql
-- Estrutura
CREATE TABLE pilgrimages (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    arrival_date DATE,
    departure_date DATE,
    number_of_people INTEGER,
    bus_group VARCHAR(100),
    contact_phone VARCHAR(30),
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP
);

-- Consultas úteis
-- Romarias ativas
SELECT * FROM pilgrimages WHERE status = 'active' ORDER BY arrival_date;

-- Romarias chegando hoje
SELECT * FROM pilgrimages 
WHERE arrival_date = CURRENT_DATE 
AND status = 'active';

-- Total de pessoas esperadas no mês
SELECT SUM(number_of_people) as total_pessoas
FROM pilgrimages
WHERE DATE_TRUNC('month', arrival_date) = DATE_TRUNC('month', CURRENT_DATE)
AND status = 'active';
```

**Hook:** `hooks/usePilgrimagesDB.ts`  
**Componentes:** `HotelPilgrimages.tsx`

---

#### 2.2 - **rooms_master** (Catálogo de Quartos) ✨ NOVO
```sql
-- Estrutura
CREATE TABLE rooms_master (
    number INTEGER PRIMARY KEY,
    type VARCHAR(50) CHECK (type IN ('single', 'double', 'triple', 'suite', 'standard')),
    capacity INTEGER CHECK (capacity > 0),
    floor INTEGER,
    description TEXT,
    daily_rate DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Consultas úteis
-- Quartos disponíveis
SELECT * FROM rooms_master WHERE active = true ORDER BY number;

-- Quartos por tipo
SELECT type, COUNT(*) as quantidade
FROM rooms_master
WHERE active = true
GROUP BY type;

-- Capacidade total do hotel
SELECT SUM(capacity) as capacidade_total
FROM rooms_master
WHERE active = true;
```

**Hook:** `hooks/useRoomsMasterDB.ts` (A CRIAR)  
**Componentes:** `RoomsMasterManager.tsx` (A CRIAR)

---

#### 2.3 - **pilgrimage_rooms** (Alocação de Quartos) ✨ NOVO
```sql
-- Estrutura
CREATE TABLE pilgrimage_rooms (
    id UUID PRIMARY KEY,
    pilgrimage_id UUID REFERENCES pilgrimages(id),
    room_number INTEGER REFERENCES rooms_master(number),
    guest_name VARCHAR(100),
    guest_document VARCHAR(30),
    guest_phone VARCHAR(30),
    guest_email VARCHAR(100),
    check_in DATE,
    check_out DATE,
    status VARCHAR(20) CHECK (status IN ('allocated', 'reserved', 'checked_in', 'checked_out', 'cancelled')),
    notes TEXT,
    daily_rate DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(pilgrimage_id, room_number)
);

-- Consultas úteis
-- Quartos de uma romaria
SELECT 
    pr.room_number,
    pr.guest_name,
    pr.status,
    rm.type
FROM pilgrimage_rooms pr
JOIN rooms_master rm ON pr.room_number = rm.number
WHERE pr.pilgrimage_id = 'uuid-here'
ORDER BY pr.room_number;

-- Qual romaria está em um quarto?
SELECT 
    p.name as romaria,
    pr.guest_name,
    pr.check_in,
    pr.check_out
FROM pilgrimage_rooms pr
JOIN pilgrimages p ON pr.pilgrimage_id = p.id
WHERE pr.room_number = 101
AND pr.status IN ('reserved', 'checked_in');

-- Quartos ocupados hoje
SELECT 
    pr.room_number,
    p.name as romaria,
    pr.guest_name,
    pr.status
FROM pilgrimage_rooms pr
JOIN pilgrimages p ON pr.pilgrimage_id = p.id
WHERE pr.status = 'checked_in'
AND pr.check_in <= CURRENT_DATE
AND pr.check_out > CURRENT_DATE
ORDER BY pr.room_number;

-- Taxa de ocupação
SELECT 
    COUNT(DISTINCT pr.room_number)::DECIMAL / COUNT(DISTINCT rm.number) * 100 as taxa_ocupacao
FROM rooms_master rm
LEFT JOIN pilgrimage_rooms pr ON rm.number = pr.room_number
    AND pr.status = 'checked_in'
    AND pr.check_in <= CURRENT_DATE
    AND pr.check_out > CURRENT_DATE;
```

**Hook:** `hooks/usePilgrimageRoomsDB.ts` (A CRIAR)  
**Componentes:** `PilgrimageRoomAllocation.tsx` (A CRIAR)

---

#### 2.4 - **rooms** (View de Compatibilidade) ✨ NOVO
```sql
-- View que emula estrutura antiga
CREATE VIEW rooms AS
SELECT 
    gen_random_uuid() as id,
    rm.number,
    rm.type,
    rm.description,
    CASE 
        WHEN pr.id IS NOT NULL THEN 
            CASE pr.status
                WHEN 'checked_in' THEN 'occupied'
                WHEN 'reserved' THEN 'reserved'
                WHEN 'allocated' THEN 'reserved'
                ELSE 'available'
            END
        ELSE 'available'
    END as status,
    pr.pilgrimage_id,
    pr.guest_name,
    pr.guest_document as guest_cpf,
    pr.guest_phone,
    pr.guest_email,
    pr.check_in as check_in_date,
    pr.check_out as check_out_date,
    pr.notes as observations,
    rm.created_at
FROM rooms_master rm
LEFT JOIN pilgrimage_rooms pr ON rm.number = pr.room_number
    AND pr.status IN ('allocated', 'reserved', 'checked_in');
```

**Hook:** `hooks/useRoomsDB.ts` (MANTÉM API ANTIGA)  
**Componentes:** `Hotel.tsx` (CONTINUA FUNCIONANDO)

---

## 📊 VIEWS E RELATÓRIOS

### sales_detailed
```sql
-- Vendas com detalhes completos
SELECT 
    s.id,
    s.sale_type,
    s.total,
    s.payment_method,
    s.created_at,
    c.number as comanda_number,
    COUNT(si.id) as items_count,
    STRING_AGG(si.product_name || ' (' || si.quantity || 'x)', ', ') as items_summary
FROM sales s
LEFT JOIN comandas c ON s.comanda_id = c.id
LEFT JOIN sale_items si ON s.id = si.sale_id
GROUP BY s.id, c.number;

-- Uso
SELECT * FROM sales_detailed WHERE DATE(created_at) = CURRENT_DATE;
```

### products_critical_stock
```sql
-- Produtos com estoque baixo
SELECT 
    id, 
    name, 
    stock, 
    min_stock,
    (stock - min_stock) as stock_difference,
    CASE 
        WHEN stock <= 0 THEN 'out_of_stock'
        WHEN stock <= min_stock THEN 'critical'
        WHEN stock <= min_stock * 1.5 THEN 'low'
        ELSE 'normal'
    END as stock_status
FROM products 
WHERE active = true
ORDER BY stock_difference ASC;

-- Uso
SELECT * FROM products_critical_stock WHERE stock_status = 'critical';
```

---

## 🔧 QUERIES ÚTEIS

### Dashboard - Métricas do Dia
```sql
-- Total de vendas
SELECT COALESCE(SUM(total), 0) as total_vendas
FROM sales
WHERE DATE(created_at) = CURRENT_DATE;

-- Número de vendas
SELECT COUNT(*) as numero_vendas
FROM sales
WHERE DATE(created_at) = CURRENT_DATE;

-- Ticket médio
SELECT COALESCE(AVG(total), 0) as ticket_medio
FROM sales
WHERE DATE(created_at) = CURRENT_DATE;

-- Comandas abertas
SELECT COUNT(*) as comandas_abertas
FROM comandas
WHERE status = 'open';

-- Produtos vendidos
SELECT SUM(si.quantity) as total_itens
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE DATE(s.created_at) = CURRENT_DATE;
```

### Relatório de Ocupação Hotel
```sql
-- Ocupação atual
SELECT 
    COUNT(DISTINCT CASE WHEN pr.status = 'checked_in' THEN pr.room_number END) as quartos_ocupados,
    COUNT(DISTINCT rm.number) as total_quartos,
    ROUND(
        COUNT(DISTINCT CASE WHEN pr.status = 'checked_in' THEN pr.room_number END)::DECIMAL 
        / COUNT(DISTINCT rm.number) * 100, 
        2
    ) as taxa_ocupacao
FROM rooms_master rm
LEFT JOIN pilgrimage_rooms pr ON rm.number = pr.room_number
    AND pr.check_in <= CURRENT_DATE
    AND pr.check_out > CURRENT_DATE;

-- Romarias hospedadas agora
SELECT 
    p.name,
    p.bus_group,
    COUNT(pr.room_number) as quartos_ocupados,
    p.number_of_people as total_pessoas
FROM pilgrimages p
JOIN pilgrimage_rooms pr ON p.id = pr.pilgrimage_id
WHERE pr.status = 'checked_in'
AND pr.check_in <= CURRENT_DATE
AND pr.check_out > CURRENT_DATE
GROUP BY p.id, p.name, p.bus_group, p.number_of_people;
```

---

## 🚀 PRÓXIMOS PASSOS

Após a migração, você terá:

✅ **Estrutura limpa e normalizada**  
✅ **Código antigo continua funcionando** (via view)  
✅ **Pronto para novos recursos:**
   - Alocar múltiplos quartos para romarias
   - Histórico completo de ocupação
   - Relatórios avançados
   - Interface de check-in/check-out

---

## 📞 SUPORTE

Se tiver dúvidas sobre qualquer query ou estrutura, consulte:
- `supabase/README.md` - Visão geral
- `supabase/PLANO-MIGRACAO.md` - Plano de migração completo
