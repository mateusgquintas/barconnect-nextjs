-- DEPRECATED - NÃO UTILIZAR
-- Este arquivo foi substituído por supabase/schema-unificado.sql
-- Mantido apenas para histórico. Use o schema unificado.
-- =============================================
--
-- =============================================
-- BARCONNECT - SCHEMA PDV (Sistema de Comandas e Vendas)
-- =============================================
-- Descrição: Sistema completo de PDV com controle de comandas,
--            vendas, estoque e transações financeiras
-- Data: 31/10/2025
-- Status: ✅ PRODUÇÃO (NÃO ALTERAR SEM BACKUP)
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- 1. TABELA DE USUÁRIOS
-- =============================================
-- Propósito: Autenticação e controle de acesso (admin/operador)
-- Usado em: lib/authService.ts, hooks/useUsersDB.ts
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hash
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(active);

-- Comentários
COMMENT ON TABLE public.users IS 'Usuários do sistema com autenticação bcrypt';
COMMENT ON COLUMN public.users.password IS 'Hash bcrypt da senha (nunca armazenar texto plano)';
COMMENT ON COLUMN public.users.role IS 'admin = acesso total, operator = operações básicas';

-- =============================================
-- 2. TABELA DE PRODUTOS
-- =============================================
-- Propósito: Catálogo de produtos com controle de estoque
-- Usado em: hooks/useProductsDB.ts, components/ProductCatalog.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10,2) DEFAULT 0 CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 20,
    category VARCHAR(100) DEFAULT 'geral',
    subcategory VARCHAR(100),
    barcode VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique 
    ON public.products(barcode) WHERE barcode IS NOT NULL;

-- Comentários
COMMENT ON TABLE public.products IS 'Catálogo de produtos com controle de estoque';
COMMENT ON COLUMN public.products.min_stock IS 'Estoque mínimo para alertas de reposição';
COMMENT ON COLUMN public.products.cost_price IS 'Preço de custo para cálculo de margem';

-- =============================================
-- 3. TABELA DE COMANDAS
-- =============================================
-- Propósito: Comandas de mesa/balcão (abertas e fechadas)
-- Usado em: hooks/useComandasDB.ts, components/ComandaDetail.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.comandas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    table_number INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comandas_status ON public.comandas(status);
CREATE INDEX IF NOT EXISTS idx_comandas_created_at ON public.comandas(created_at);
CREATE INDEX IF NOT EXISTS idx_comandas_number ON public.comandas(number);
CREATE INDEX IF NOT EXISTS idx_comandas_table_number ON public.comandas(table_number);

-- Constraint única para números de comandas abertas
CREATE UNIQUE INDEX IF NOT EXISTS idx_comandas_unique_number_open 
    ON public.comandas(number) WHERE status = 'open';

-- Comentários
COMMENT ON TABLE public.comandas IS 'Comandas de atendimento (status: open/closed/cancelled)';
COMMENT ON COLUMN public.comandas.number IS 'Número da comanda (único apenas quando status=open)';
COMMENT ON COLUMN public.comandas.total IS 'Total calculado automaticamente via trigger';

-- =============================================
-- 4. TABELA DE ITENS DA COMANDA
-- =============================================
-- Propósito: Itens adicionados a cada comanda
-- Usado em: hooks/useComandasDB.ts, components/ComandaDetail.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.comanda_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID NOT NULL REFERENCES public.comandas(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON public.comanda_items(comanda_id);
CREATE INDEX IF NOT EXISTS idx_comanda_items_product_id ON public.comanda_items(product_id);

-- Comentários
COMMENT ON TABLE public.comanda_items IS 'Itens adicionados às comandas (snapshot de preço no momento)';
COMMENT ON COLUMN public.comanda_items.product_name IS 'Nome do produto no momento da venda (imutável)';
COMMENT ON COLUMN public.comanda_items.product_price IS 'Preço do produto no momento da venda (imutável)';

-- =============================================
-- 5. TABELA DE VENDAS
-- =============================================
-- Propósito: Registro final de todas as vendas (comandas + diretas)
-- Usado em: hooks/useSalesDB.ts, components/SalesTransactions.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID REFERENCES public.comandas(id),
    sale_type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (sale_type IN ('direct', 'comanda')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit', 'debit', 'pix', 'courtesy', 'other', 'transfer')),
    is_courtesy BOOLEAN DEFAULT false,
    customer_name VARCHAR(255),
    items_snapshot JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sales_type ON public.sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_comanda_id ON public.sales(comanda_id);
CREATE INDEX IF NOT EXISTS idx_sales_is_courtesy ON public.sales(is_courtesy);

-- Comentários
COMMENT ON TABLE public.sales IS 'Registro final de todas as vendas';
COMMENT ON COLUMN public.sales.sale_type IS 'direct = venda direta, comanda = fechamento de comanda';
COMMENT ON COLUMN public.sales.items_snapshot IS 'Backup JSON dos itens vendidos';

-- =============================================
-- 6. TABELA DE ITENS DA VENDA
-- =============================================
-- Propósito: Detalhamento dos itens vendidos
-- Usado em: hooks/useSalesDB.ts, components/SalesTransactions.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

-- Comentários
COMMENT ON TABLE public.sale_items IS 'Itens detalhados de cada venda';

-- =============================================
-- 7. TABELA DE TRANSAÇÕES FINANCEIRAS
-- =============================================
-- Propósito: Controle de receitas e despesas
-- Usado em: hooks/useTransactionsDB.ts, components/Transactions.tsx
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) DEFAULT 'geral',
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_sale_id ON public.transactions(sale_id);

-- Comentários
COMMENT ON TABLE public.transactions IS 'Transações financeiras (receitas e despesas)';
COMMENT ON COLUMN public.transactions.type IS 'income = receita, expense = despesa';

-- =============================================
-- 8. TABELA DE MOVIMENTAÇÃO DE ESTOQUE
-- =============================================
-- Propósito: Histórico completo de movimentações de estoque
-- Usado em: hooks/useProductsDB.ts, trigger automático
-- =============================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(255),
    sale_id UUID REFERENCES public.sales(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON public.stock_movements(movement_type);

-- Comentários
COMMENT ON TABLE public.stock_movements IS 'Histórico de movimentações de estoque';
COMMENT ON COLUMN public.stock_movements.movement_type IS 'in = entrada, out = saída, adjustment = ajuste';

-- =============================================
-- TRIGGERS AUTOMÁTICOS
-- =============================================

-- Trigger 1: Atualizar total da comanda automaticamente
CREATE OR REPLACE FUNCTION update_comanda_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.comandas 
        SET total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM public.comanda_items 
            WHERE comanda_id = OLD.comanda_id
        ),
        updated_at = NOW()
        WHERE id = OLD.comanda_id;
        RETURN OLD;
    ELSE
        UPDATE public.comandas 
        SET total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM public.comanda_items 
            WHERE comanda_id = NEW.comanda_id
        ),
        updated_at = NOW()
        WHERE id = NEW.comanda_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comanda_total ON public.comanda_items;
CREATE TRIGGER trigger_update_comanda_total
    AFTER INSERT OR UPDATE OR DELETE ON public.comanda_items
    FOR EACH ROW
    EXECUTE FUNCTION update_comanda_total();

-- Trigger 2: Movimentar estoque automaticamente nas vendas
CREATE OR REPLACE FUNCTION handle_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
    new_stock_val INTEGER;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT stock INTO current_stock 
        FROM public.products 
        WHERE id = NEW.product_id;
        
        new_stock_val := GREATEST(0, current_stock - NEW.quantity);

        UPDATE public.products 
        SET stock = new_stock_val,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        INSERT INTO public.stock_movements (
            product_id, movement_type, quantity, 
            previous_stock, new_stock, reason, sale_id
        ) VALUES (
            NEW.product_id, 'out', NEW.quantity,
            current_stock, new_stock_val,
            'Venda de produto', NEW.sale_id
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_stock_movement ON public.sale_items;
CREATE TRIGGER trigger_stock_movement
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_stock_movement();

-- =============================================
-- VIEWS PARA RELATÓRIOS
-- =============================================

-- View 1: Vendas com detalhes completos
CREATE OR REPLACE VIEW sales_detailed AS
SELECT 
    s.id,
    s.sale_type,
    s.total,
    s.payment_method,
    s.is_courtesy,
    s.customer_name,
    s.created_at,
    c.number as comanda_number,
    c.table_number,
    COUNT(si.id) as items_count,
    STRING_AGG(si.product_name || ' (' || si.quantity || 'x)', ', ') as items_summary
FROM public.sales s
LEFT JOIN public.comandas c ON s.comanda_id = c.id
LEFT JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY s.id, c.number, c.table_number;

COMMENT ON VIEW sales_detailed IS 'Vendas com resumo de itens para relatórios';

-- View 2: Produtos com estoque crítico
CREATE OR REPLACE VIEW products_critical_stock AS
SELECT 
    id, name, stock, min_stock, category,
    (stock - min_stock) as stock_difference,
    CASE 
        WHEN stock <= 0 THEN 'out_of_stock'
        WHEN stock <= min_stock THEN 'critical'
        WHEN stock <= min_stock * 1.5 THEN 'low'
        ELSE 'normal'
    END as stock_status
FROM public.products 
WHERE active = true
ORDER BY stock_difference ASC;

COMMENT ON VIEW products_critical_stock IS 'Produtos com estoque baixo ou zerado';

-- =============================================
-- DADOS INICIAIS (Desenvolvimento)
-- =============================================

-- Usuários padrão (usar em desenvolvimento apenas)
INSERT INTO public.users (username, password, name, role) VALUES
    ('admin', '$2b$10$YourHashHere', 'Administrador', 'admin'),
    ('operador', '$2b$10$YourHashHere', 'Operador', 'operator')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- FINALIZAÇÃO
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema PDV criado com sucesso!';
    RAISE NOTICE '📊 Tabelas: 8';
    RAISE NOTICE '🔧 Triggers: 2';
    RAISE NOTICE '📈 Views: 2';
END $$;
