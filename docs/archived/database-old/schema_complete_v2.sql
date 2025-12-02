-- BarConnect Database Schema - Versão Otimizada V3
-- Execute este SQL no Supabase SQL Editor para criar toda a estrutura
-- IMPORTANTE: Este script irá REMOVER todas as tabelas existentes!

-- =============================================
-- LIMPEZA COMPLETA - REMOVER TODAS AS TABELAS EXISTENTES
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remover views existentes primeiro
DROP VIEW IF EXISTS sales_detailed CASCADE;
DROP VIEW IF EXISTS products_critical_stock CASCADE;

-- Remover triggers existentes (compatível com DB limpo)
DO $$
BEGIN
  IF to_regclass('public.comanda_items') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_update_comanda_total ON public.comanda_items';
  END IF;
  IF to_regclass('public.sale_items') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trigger_stock_movement ON public.sale_items';
  END IF;
END $$;

-- Remover funções
DROP FUNCTION IF EXISTS update_comanda_total() CASCADE;
DROP FUNCTION IF EXISTS handle_stock_movement() CASCADE;

-- Remover todas as tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.comanda_items CASCADE;
DROP TABLE IF EXISTS public.comandas CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Remover qualquer tabela antiga que possa existir
DROP TABLE IF EXISTS public.Comandas CASCADE;
DROP TABLE IF EXISTS public.Products CASCADE;
DROP TABLE IF EXISTS public.Transactions CASCADE;

-- Confirmar limpeza
DO $$
BEGIN
    RAISE NOTICE 'Limpeza completa realizada. Criando nova estrutura...';
END $$;

-- =============================================
-- 1. TABELA DE USUÁRIOS (Autenticação)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Em produção usar hash seguro (bcrypt, Argon2)
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. TABELA DE PRODUTOS (Estoque)
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10,2) DEFAULT 0 CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 20, -- Estoque mínimo para alertas
    category VARCHAR(100) DEFAULT 'geral',
    barcode VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. TABELA DE COMANDAS
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

-- =============================================
-- 4. TABELA DE ITENS DA COMANDA
-- =============================================
CREATE TABLE IF NOT EXISTS public.comanda_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID NOT NULL REFERENCES public.comandas(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL, -- Snapshot do nome no momento da venda
    product_price DECIMAL(10,2) NOT NULL, -- Snapshot do preço no momento da venda
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. TABELA DE VENDAS (Registro Final)
-- =============================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comanda_id UUID REFERENCES public.comandas(id), -- NULL para vendas diretas
    sale_type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (sale_type IN ('direct', 'comanda')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit', 'debit', 'pix', 'courtesy', 'other', 'transfer')),
    is_courtesy BOOLEAN DEFAULT false,
    customer_name VARCHAR(255),
    items_snapshot JSONB, -- Backup dos itens vendidos
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. TABELA DE ITENS DA VENDA (Detalhamento)
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

-- =============================================
-- 7. TABELA DE TRANSAÇÕES FINANCEIRAS
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id), -- NULL para transações manuais
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) DEFAULT 'geral',
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. TABELA DE MOVIMENTAÇÃO DE ESTOQUE
-- =============================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(255),
    sale_id UUID REFERENCES public.sales(id), -- Para rastrear vendas
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INSERIR DADOS INICIAIS
-- =============================================

-- Usuários padrão (usar hashes em produção)
-- ATENÇÃO: Estas senhas são para desenvolvimento apenas
-- Em produção, use hashes seguros (bcrypt, Argon2, etc.)
INSERT INTO public.users (username, password, name, role) VALUES
    ('admin', '$2b$10$dummyhashfordev123456789', 'Administrador', 'admin'),
    ('operador', '$2b$10$dummyhashfordev987654321', 'Operador', 'operator')
ON CONFLICT (username) DO NOTHING;

-- Confirmar inserção de usuários
DO $$
BEGIN
    RAISE NOTICE 'Usuários padrão criados com sucesso';
END $$;

-- Produtos de exemplo
INSERT INTO public.products (name, description, price, cost_price, stock, category, min_stock) VALUES
    ('Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml', 5.50, 3.20, 100, 'bebidas', 20),
    ('Água Mineral 500ml', 'Água mineral natural 500ml', 3.00, 1.50, 150, 'bebidas', 30),
    ('Cerveja Pilsen 350ml', 'Cerveja Pilsen lata 350ml gelada', 6.00, 3.50, 80, 'bebidas', 15),
    ('Almoço Executivo', 'Prato executivo completo', 25.00, 12.00, 50, 'pratos', 10),
    ('Café Expresso', 'Café expresso tradicional', 4.50, 1.20, 200, 'bebidas', 50),
    ('Sanduíche Natural', 'Sanduíche natural de frango', 12.00, 6.50, 30, 'lanches', 10);

-- Confirmar inserção de produtos
DO $$
BEGIN
    RAISE NOTICE 'Produtos de exemplo criados com sucesso';
END $$;

-- =============================================
-- CONSTRAINTS ADICIONAIS
-- =============================================

-- Constraint única para evitar números duplicados em comandas abertas
CREATE UNIQUE INDEX IF NOT EXISTS idx_comandas_unique_number_open 
ON public.comandas(number) WHERE status = 'open';

-- Índice único opcional para código de barras (evita duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique 
ON public.products(barcode) WHERE barcode IS NOT NULL;

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para comandas
CREATE INDEX IF NOT EXISTS idx_comandas_status ON public.comandas(status);
CREATE INDEX IF NOT EXISTS idx_comandas_created_at ON public.comandas(created_at);
CREATE INDEX IF NOT EXISTS idx_comandas_number ON public.comandas(number);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_sales_type ON public.sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_comanda_id ON public.sales(comanda_id);

-- Índices para transações
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON public.comanda_items(comanda_id);

-- Índice para acelerar agregações na view sales_detailed
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- =============================================
-- TRIGGERS PARA AUTOMAÇÃO
-- =============================================

-- Trigger para atualizar total da comanda automaticamente
CREATE OR REPLACE FUNCTION update_comanda_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se é INSERT, UPDATE ou DELETE
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

CREATE TRIGGER trigger_update_comanda_total
    AFTER INSERT OR UPDATE OR DELETE ON public.comanda_items
    FOR EACH ROW
    EXECUTE FUNCTION update_comanda_total();

-- Trigger para movimentar estoque automaticamente nas vendas
CREATE OR REPLACE FUNCTION handle_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
    new_stock_val INTEGER;
BEGIN
    -- Reduzir estoque ao inserir item de venda
    IF TG_OP = 'INSERT' THEN
        -- Buscar estoque atual
        SELECT stock INTO current_stock 
        FROM public.products 
        WHERE id = NEW.product_id;
        
        -- Verificar se há estoque suficiente (opcional - pode permitir venda com estoque zerado)
        -- Descomente a linha abaixo se quiser bloquear vendas sem estoque:
        -- IF NEW.quantity > current_stock THEN
        --     RAISE EXCEPTION 'Estoque insuficiente para o produto % (disponível: %, solicitado: %)', NEW.product_id, current_stock, NEW.quantity;
        -- END IF;

        -- Calcular novo estoque (nunca negativo)
        new_stock_val := GREATEST(0, current_stock - NEW.quantity);

        -- Atualizar estoque do produto
        UPDATE public.products 
        SET stock = new_stock_val,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        -- Registrar movimentação
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

CREATE TRIGGER trigger_stock_movement
    AFTER INSERT ON public.sale_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_stock_movement();

-- =============================================
-- VIEWS PARA RELATÓRIOS
-- =============================================

-- View de vendas com detalhes
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

-- View de produtos com estoque crítico
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

-- =============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================
COMMENT ON TABLE public.users IS 'Usuários do sistema (admin/operador)';
COMMENT ON TABLE public.products IS 'Catálogo de produtos com controle de estoque';
COMMENT ON TABLE public.comandas IS 'Comandas de mesa com status';
COMMENT ON TABLE public.comanda_items IS 'Itens adicionados às comandas';
COMMENT ON TABLE public.sales IS 'Registro final de todas as vendas';
COMMENT ON TABLE public.sale_items IS 'Detalhamento dos itens vendidos';
COMMENT ON TABLE public.transactions IS 'Transações financeiras (receitas/despesas)';
COMMENT ON TABLE public.stock_movements IS 'Histórico de movimentações de estoque';

-- =============================================
-- RECOMENDAÇÕES DE SEGURANÇA (AUTENTICAÇÃO)
-- =============================================
-- As senhas devem ser armazenadas apenas como hashes seguros (ex: bcrypt, Argon2).
-- Nunca armazene senhas em texto puro.
-- Utilize sempre HTTPS para proteger dados em trânsito.
-- Implemente políticas de senha forte e autenticação multifator (MFA) quando possível.
-- Restrinja privilégios de acesso ao banco de dados para minimizar riscos.
-- Realize auditorias e monitore tentativas de acesso suspeitas.

-- =============================================
-- FINALIZAÇÃO
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '🎉 BarConnect V3 - Migração completada com sucesso!';
    RAISE NOTICE '✅ Tabelas principais criadas';
    RAISE NOTICE '✅ Triggers automáticos configurados';
    RAISE NOTICE '✅ Views otimizadas criadas';
    RAISE NOTICE '✅ Índices para performance aplicados';
    RAISE NOTICE '✅ Dados de exemplo inseridos';
    RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$;

-- Fim do script de criação