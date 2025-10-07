-- ============================================
-- BARCONNECT - MIGRAÇÃO PARA VERSÃO 2.0
-- ============================================
-- 📋 ESTE SCRIPT ADICIONA MELHORIAS ÀS TABELAS EXISTENTES
-- Execute APENAS se já tem o schema básico funcionando

-- ============================================
-- ADICIONAR COLUNAS NAS TABELAS EXISTENTES
-- ============================================

-- 1. Melhorias na tabela USERS
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. Melhorias na tabela PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;

-- 3. Melhorias na tabela COMANDAS
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS closed_by UUID;

-- Adicionar status 'cancelled' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%comandas_status_check%' 
        AND check_clause LIKE '%cancelled%'
    ) THEN
        ALTER TABLE comandas DROP CONSTRAINT IF EXISTS comandas_status_check;
        ALTER TABLE comandas ADD CONSTRAINT comandas_status_check 
        CHECK (status IN ('open', 'closed', 'cancelled'));
    END IF;
END $$;

-- 4. Melhorias na tabela COMANDA_ITEMS
ALTER TABLE comanda_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2);
ALTER TABLE comanda_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Calcular subtotal para registros existentes (apenas se a coluna product_price existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comanda_items' AND column_name = 'product_price') THEN
        UPDATE comanda_items SET subtotal = product_price * quantity WHERE subtotal IS NULL;
    END IF;
END $$;

-- 5. Melhorias na tabela TRANSACTIONS
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. Melhorias na tabela SALES_RECORDS
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS comanda_id UUID;
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS final_total NUMERIC(10, 2);
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS notes TEXT;

-- Calcular final_total para registros existentes (apenas se as colunas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_records' AND column_name = 'total') 
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_records' AND column_name = 'discount') THEN
        UPDATE sales_records SET final_total = total - COALESCE(discount, 0) WHERE final_total IS NULL;
    END IF;
END $$;

-- Adicionar novos métodos de pagamento se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%sales_records_payment_method_check%' 
        AND check_clause LIKE '%transfer%'
    ) THEN
        ALTER TABLE sales_records DROP CONSTRAINT IF EXISTS sales_records_payment_method_check;
        ALTER TABLE sales_records ADD CONSTRAINT sales_records_payment_method_check 
        CHECK (payment_method IN ('cash', 'credit', 'debit', 'pix', 'courtesy', 'transfer'));
    END IF;
END $$;

-- 7. Melhorias na tabela SALE_ITEMS
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2);

-- Calcular subtotal para registros existentes (apenas se a coluna product_price existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'product_price') THEN
        UPDATE sale_items SET subtotal = product_price * quantity WHERE subtotal IS NULL;
    END IF;
END $$;

-- 8. Melhorias na tabela ROOMS
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'standard';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS guest_document TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS expected_checkout TIMESTAMPTZ;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar novo status 'reserved' se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%rooms_status_check%' 
        AND check_clause LIKE '%reserved%'
    ) THEN
        ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
        ALTER TABLE rooms ADD CONSTRAINT rooms_status_check 
        CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning', 'reserved'));
    END IF;
END $$;

-- Adicionar constraint para payment_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'rooms_payment_status_check'
    ) THEN
        ALTER TABLE rooms ADD CONSTRAINT rooms_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'partial'));
    END IF;
END $$;

-- ============================================
-- CRIAR NOVAS TABELAS (SE NÃO EXISTIREM)
-- ============================================

-- Tabela de movimentação de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de relatórios diários
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE NOT NULL UNIQUE,
  total_sales NUMERIC(10, 2) DEFAULT 0,
  total_expenses NUMERIC(10, 2) DEFAULT 0,
  net_profit NUMERIC(10, 2) DEFAULT 0,
  comandas_opened INTEGER DEFAULT 0,
  comandas_closed INTEGER DEFAULT 0,
  rooms_occupied INTEGER DEFAULT 0,
  generated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADICIONAR NOVOS ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_comandas_created ON comandas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comandas_customer ON comandas(customer_name);
CREATE INDEX IF NOT EXISTS idx_comanda_items_product ON comanda_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales_records(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_direct ON sales_records(is_direct_sale);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(number);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date DESC);

-- ============================================
-- ADICIONAR FOREIGN KEYS ONDE POSSÍVEL
-- ============================================
DO $$
BEGIN
    -- Adicionar FK para created_by em comandas se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comandas' AND column_name = 'created_by') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_comandas_created_by') THEN
        ALTER TABLE comandas ADD CONSTRAINT fk_comandas_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Adicionar FK para closed_by em comandas se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comandas' AND column_name = 'closed_by') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_comandas_closed_by') THEN
        ALTER TABLE comandas ADD CONSTRAINT fk_comandas_closed_by 
        FOREIGN KEY (closed_by) REFERENCES users(id);
    END IF;
    
    -- Adicionar FK para created_by em transactions se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'created_by') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_transactions_created_by') THEN
        ALTER TABLE transactions ADD CONSTRAINT fk_transactions_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Adicionar FK para created_by em sales_records se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_records' AND column_name = 'created_by') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_sales_created_by') THEN
        ALTER TABLE sales_records ADD CONSTRAINT fk_sales_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Adicionar FK para comanda_id em sales_records se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_records' AND column_name = 'comanda_id') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_sales_comanda') THEN
        ALTER TABLE sales_records ADD CONSTRAINT fk_sales_comanda 
        FOREIGN KEY (comanda_id) REFERENCES comandas(id);
    END IF;
    
    -- Adicionar FK para product_id em sale_items se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'product_id') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_sale_items_product') THEN
        ALTER TABLE sale_items ADD CONSTRAINT fk_sale_items_product 
        FOREIGN KEY (product_id) REFERENCES products(id);
    END IF;
END $$;

-- ============================================
-- TRIGGERS PARA AUTOMAÇÃO
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers se as colunas existirem
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
        CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================

-- View para produtos com baixo estoque
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.stock,
    COALESCE(p.min_stock, 5) as min_stock,
    p.category,
    (COALESCE(p.min_stock, 5) - p.stock) as deficit
FROM products p
WHERE p.stock <= COALESCE(p.min_stock, 5) 
AND COALESCE(p.is_active, true) = true;

-- View para vendas diárias
CREATE OR REPLACE VIEW daily_sales AS
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as total_sales,
    SUM(COALESCE(final_total, total)) as total_amount,
    AVG(COALESCE(final_total, total)) as average_sale,
    COUNT(CASE WHEN is_courtesy THEN 1 END) as courtesy_count
FROM sales_records
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- View para comandas abertas
CREATE OR REPLACE VIEW open_comandas AS
SELECT 
    c.id,
    c.number,
    c.customer_name,
    c.table_number,
    COALESCE(c.total, 0) as total,
    COUNT(ci.id) as items_count,
    c.created_at
FROM comandas c
LEFT JOIN comanda_items ci ON c.id = ci.comanda_id
WHERE c.status = 'open'
GROUP BY c.id, c.number, c.customer_name, c.table_number, c.total, c.created_at
ORDER BY c.created_at DESC;

-- ============================================
-- ATUALIZAR DADOS EXISTENTES
-- ============================================

-- Atualizar produtos existentes com valores padrão (apenas se as colunas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        UPDATE products SET is_active = true WHERE is_active IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock') THEN
        UPDATE products SET min_stock = 5 WHERE min_stock IS NULL;
    END IF;
END $$;

-- Atualizar usuários como ativos (apenas se a coluna existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        UPDATE users SET is_active = true WHERE is_active IS NULL;
    END IF;
END $$;

-- Calcular totais em comandas baseado nos itens (apenas se as colunas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comandas' AND column_name = 'total') 
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comanda_items' AND column_name = 'product_price') THEN
        UPDATE comandas SET total = (
            SELECT COALESCE(SUM(product_price * quantity), 0)
            FROM comanda_items ci 
            WHERE ci.comanda_id = comandas.id
        ) WHERE total IS NULL OR total = 0;
    END IF;
END $$;

-- Habilitar RLS nas novas tabelas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
        ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reports') THEN
        ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Políticas permissivas para desenvolvimento
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') 
    AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'Allow all for development') THEN
        CREATE POLICY "Allow all for development" ON stock_movements FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reports') 
    AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_reports' AND policyname = 'Allow all for development') THEN
        CREATE POLICY "Allow all for development" ON daily_reports FOR ALL USING (true);
    END IF;
END $$;

-- ============================================
-- INSERIR DADOS DE EXEMPLO MELHORADOS
-- ============================================

-- Produtos adicionais com as novas colunas
INSERT INTO products (name, price, stock, category, subcategory, min_stock, description, is_active) VALUES
('Energético Lata', 8.00, 40, 'bebidas', 'energetico', 10, 'Bebida energética gelada', true),
('Água Tônica', 5.00, 30, 'bebidas', 'agua', 8, 'Água tônica premium', true),
('Cerveja Premium', 8.00, 50, 'bebidas', 'cerveja', 10, 'Cerveja premium importada', true),
('Porção de Pastéis', 22.00, 20, 'porcoes', 'salgados', 5, 'Pastéis variados', true),
('Coxinha de Frango', 4.00, 30, 'salgados', 'fritos', 8, 'Coxinha tradicional', true),
('Pudim Caseiro', 8.00, 15, 'sobremesas', 'doces', 3, 'Pudim de leite condensado', true)
ON CONFLICT (name) DO NOTHING;

-- Atualizar quartos com novos campos (apenas se as colunas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'floor') THEN
        UPDATE rooms SET 
            floor = CASE 
                WHEN number LIKE '1%' THEN 1
                WHEN number LIKE '2%' THEN 2
                WHEN number LIKE '3%' THEN 3
                ELSE 1
            END
        WHERE floor IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'type') THEN
        UPDATE rooms SET 
            type = CASE 
                WHEN number IN ('103', '203', '302') THEN 'deluxe'
                WHEN number = '203' THEN 'suite'
                ELSE 'standard'
            END
        WHERE type IS NULL OR type = 'standard';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'daily_rate') THEN
        UPDATE rooms SET 
            daily_rate = CASE 
                WHEN number IN ('103', '302') THEN 120.00
                WHEN number = '203' THEN 150.00
                ELSE 80.00
            END
        WHERE daily_rate IS NULL;
    END IF;
END $$;

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
SELECT 
    'Migração BarConnect v2.0 concluída com sucesso!' as status,
    NOW() as timestamp,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    'Novos campos e tabelas adicionados às estruturas existentes' as description;