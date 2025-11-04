-- =============================================
-- QUERIES ÚTEIS - BarConnect
-- Copie e cole no Supabase SQL Editor
-- =============================================

-- ═════════════════════════════════════════════
-- 📊 DASHBOARD - MÉTRICAS PRINCIPAIS
-- ═════════════════════════════════════════════

-- Total de vendas do dia
SELECT 
    COALESCE(SUM(total), 0) as total_vendas,
    COUNT(*) as numero_vendas,
    COALESCE(AVG(total), 0) as ticket_medio
FROM sales
WHERE DATE(created_at) = CURRENT_DATE;

-- Vendas por forma de pagamento (hoje)
SELECT 
    payment_method as forma_pagamento,
    COUNT(*) as quantidade,
    SUM(total) as total
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY payment_method
ORDER BY total DESC;

-- Comandas abertas no momento
SELECT 
    c.number as comanda,
    c.customer_name as cliente,
    c.table_number as mesa,
    c.total,
    c.created_at,
    COUNT(ci.id) as itens
FROM comandas c
LEFT JOIN comanda_items ci ON c.id = ci.comanda_id
WHERE c.status = 'open'
GROUP BY c.id, c.number, c.customer_name, c.table_number, c.total, c.created_at
ORDER BY c.number;

-- ═════════════════════════════════════════════
-- 📦 ESTOQUE - CONTROLE E ALERTAS
-- ═════════════════════════════════════════════

-- Produtos com estoque crítico
SELECT 
    name as produto,
    stock as estoque_atual,
    min_stock as estoque_minimo,
    (stock - min_stock) as diferenca,
    category as categoria,
    price as preco,
    CASE 
        WHEN stock <= 0 THEN '🔴 Zerado'
        WHEN stock <= min_stock THEN '🟠 Crítico'
        WHEN stock <= min_stock * 1.5 THEN '🟡 Baixo'
        ELSE '🟢 Normal'
    END as status
FROM products 
WHERE active = true
ORDER BY (stock - min_stock) ASC;

-- Valor total do estoque
SELECT 
    SUM(stock * cost_price) as valor_custo,
    SUM(stock * price) as valor_venda,
    SUM(stock * (price - cost_price)) as lucro_potencial
FROM products 
WHERE active = true;

-- Movimentações de estoque (últimas 24h)
SELECT 
    p.name as produto,
    sm.movement_type as tipo,
    sm.quantity as quantidade,
    sm.previous_stock as estoque_anterior,
    sm.new_stock as estoque_novo,
    sm.reason as motivo,
    sm.created_at
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY sm.created_at DESC;

-- ═════════════════════════════════════════════
-- 💰 FINANCEIRO - RECEITAS E DESPESAS
-- ═════════════════════════════════════════════

-- Saldo do dia
SELECT 
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as receitas,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as despesas,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as saldo
FROM transactions
WHERE DATE(created_at) = CURRENT_DATE;

-- Receitas e despesas do mês
SELECT 
    DATE(created_at) as dia,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as receitas,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as despesas,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as saldo_dia
FROM transactions
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(created_at)
ORDER BY dia;

-- Despesas por categoria (mês)
SELECT 
    category as categoria,
    COUNT(*) as quantidade,
    SUM(amount) as total
FROM transactions
WHERE type = 'expense'
AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category
ORDER BY total DESC;

-- ═════════════════════════════════════════════
-- 📈 PRODUTOS - ANÁLISE DE VENDAS
-- ═════════════════════════════════════════════

-- Top 10 produtos mais vendidos (mês)
SELECT 
    si.product_name as produto,
    SUM(si.quantity) as quantidade_vendida,
    SUM(si.subtotal) as faturamento,
    COUNT(DISTINCT s.id) as numero_vendas,
    ROUND(AVG(si.quantity), 2) as media_por_venda
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY si.product_name
ORDER BY quantidade_vendida DESC
LIMIT 10;

-- Produtos nunca vendidos
SELECT 
    p.name as produto,
    p.stock as estoque,
    p.price as preco,
    p.category as categoria,
    p.created_at
FROM products p
WHERE p.active = true
AND NOT EXISTS (
    SELECT 1 FROM sale_items si WHERE si.product_id = p.id
)
ORDER BY p.created_at DESC;

-- Margem de lucro por produto (vendas do mês)
SELECT 
    p.name as produto,
    SUM(si.quantity) as quantidade_vendida,
    SUM(si.subtotal) as receita_total,
    SUM(si.quantity * p.cost_price) as custo_total,
    SUM(si.subtotal - (si.quantity * p.cost_price)) as lucro_bruto,
    ROUND(
        ((SUM(si.subtotal) - SUM(si.quantity * p.cost_price)) / SUM(si.subtotal) * 100)::NUMERIC,
        2
    ) as margem_percentual
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
JOIN products p ON si.product_id = p.id
WHERE DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.id, p.name
ORDER BY lucro_bruto DESC;

-- ═════════════════════════════════════════════
-- 🏨 HOTEL - GESTÃO DE ROMARIAS
-- ═════════════════════════════════════════════

-- Romarias ativas no momento
SELECT 
    p.name as romaria,
    p.bus_group as onibus,
    p.arrival_date as chegada,
    p.departure_date as partida,
    p.number_of_people as pessoas,
    p.contact_phone as telefone,
    CURRENT_DATE - p.arrival_date as dias_hospedados
FROM pilgrimages p
WHERE p.status = 'active'
AND p.arrival_date <= CURRENT_DATE
AND p.departure_date >= CURRENT_DATE
ORDER BY p.arrival_date;

-- Romarias chegando nos próximos 7 dias
SELECT 
    p.name as romaria,
    p.arrival_date as chegada,
    p.number_of_people as pessoas,
    p.contact_phone as telefone,
    p.arrival_date - CURRENT_DATE as dias_ate_chegada
FROM pilgrimages p
WHERE p.status = 'active'
AND p.arrival_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY p.arrival_date;

-- Total de pessoas esperadas no mês
SELECT 
    DATE_TRUNC('month', arrival_date) as mes,
    COUNT(*) as numero_romarias,
    SUM(number_of_people) as total_pessoas
FROM pilgrimages
WHERE status = 'active'
AND arrival_date >= DATE_TRUNC('month', CURRENT_DATE)
AND arrival_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY DATE_TRUNC('month', arrival_date);

-- ═════════════════════════════════════════════
-- 🛏️ HOTEL - QUARTOS E OCUPAÇÃO (PÓS-MIGRAÇÃO)
-- ═════════════════════════════════════════════

-- Taxa de ocupação atual
SELECT 
    COUNT(DISTINCT rm.number) as total_quartos,
    COUNT(DISTINCT CASE 
        WHEN pr.status = 'checked_in' 
        AND pr.check_in <= CURRENT_DATE 
        AND pr.check_out > CURRENT_DATE 
        THEN pr.room_number 
    END) as quartos_ocupados,
    ROUND(
        COUNT(DISTINCT CASE 
            WHEN pr.status = 'checked_in' 
            AND pr.check_in <= CURRENT_DATE 
            AND pr.check_out > CURRENT_DATE 
            THEN pr.room_number 
        END)::DECIMAL / COUNT(DISTINCT rm.number) * 100,
        2
    ) as taxa_ocupacao
FROM rooms_master rm
LEFT JOIN pilgrimage_rooms pr ON rm.number = pr.room_number;

-- Quartos ocupados agora (com detalhes)
SELECT 
    pr.room_number as quarto,
    rm.type as tipo,
    p.name as romaria,
    pr.guest_name as hospede,
    pr.check_in as entrada,
    pr.check_out as saida,
    pr.check_out - CURRENT_DATE as dias_restantes
FROM pilgrimage_rooms pr
JOIN rooms_master rm ON pr.room_number = rm.number
JOIN pilgrimages p ON pr.pilgrimage_id = p.id
WHERE pr.status = 'checked_in'
AND pr.check_in <= CURRENT_DATE
AND pr.check_out > CURRENT_DATE
ORDER BY pr.room_number;

-- Quartos alocados por romaria
SELECT 
    p.name as romaria,
    COUNT(pr.room_number) as quartos_alocados,
    STRING_AGG(pr.room_number::TEXT, ', ' ORDER BY pr.room_number) as numeros_quartos,
    p.number_of_people as total_pessoas
FROM pilgrimages p
JOIN pilgrimage_rooms pr ON p.id = pr.pilgrimage_id
WHERE p.status = 'active'
AND pr.status IN ('allocated', 'reserved', 'checked_in')
GROUP BY p.id, p.name, p.number_of_people
ORDER BY p.name;

-- Histórico de ocupação de um quarto específico
-- (Substituir 101 pelo número do quarto desejado)
SELECT 
    p.name as romaria,
    pr.guest_name as hospede,
    pr.check_in as entrada,
    pr.check_out as saida,
    pr.status,
    (pr.check_out - pr.check_in) as dias_hospedagem
FROM pilgrimage_rooms pr
JOIN pilgrimages p ON pr.pilgrimage_id = p.id
WHERE pr.room_number = 101
ORDER BY pr.check_in DESC;

-- Quartos disponíveis (não alocados)
SELECT 
    rm.number as quarto,
    rm.type as tipo,
    rm.capacity as capacidade,
    rm.daily_rate as diaria
FROM rooms_master rm
WHERE rm.active = true
AND NOT EXISTS (
    SELECT 1 FROM pilgrimage_rooms pr
    WHERE pr.room_number = rm.number
    AND pr.status IN ('allocated', 'reserved', 'checked_in')
    AND pr.check_in <= CURRENT_DATE
    AND pr.check_out > CURRENT_DATE
)
ORDER BY rm.number;

-- ═════════════════════════════════════════════
-- 📊 RELATÓRIOS GERENCIAIS
-- ═════════════════════════════════════════════

-- Comparativo mensal (últimos 6 meses)
SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as mes,
    COUNT(*) as numero_vendas,
    SUM(total) as faturamento,
    AVG(total) as ticket_medio
FROM sales
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- Performance de vendas por dia da semana
SELECT 
    TO_CHAR(created_at, 'Day') as dia_semana,
    EXTRACT(DOW FROM created_at) as numero_dia,
    COUNT(*) as numero_vendas,
    SUM(total) as faturamento,
    AVG(total) as ticket_medio
FROM sales
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY numero_dia;

-- Performance por hora do dia
SELECT 
    EXTRACT(HOUR FROM created_at) as hora,
    COUNT(*) as numero_vendas,
    SUM(total) as faturamento
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora;

-- ═════════════════════════════════════════════
-- 🔍 AUDITORIA E VERIFICAÇÃO
-- ═════════════════════════════════════════════

-- Comandas com valores inconsistentes
SELECT 
    c.number as comanda,
    c.total as total_comanda,
    COALESCE(SUM(ci.subtotal), 0) as total_itens,
    c.total - COALESCE(SUM(ci.subtotal), 0) as diferenca
FROM comandas c
LEFT JOIN comanda_items ci ON c.id = ci.comanda_id
GROUP BY c.id, c.number, c.total
HAVING ABS(c.total - COALESCE(SUM(ci.subtotal), 0)) > 0.01;

-- Produtos com estoque negativo (não deveria existir)
SELECT 
    name as produto,
    stock as estoque,
    category as categoria
FROM products
WHERE stock < 0;

-- Vendas sem itens (inconsistência)
SELECT 
    s.id,
    s.total,
    s.created_at,
    s.sale_type
FROM sales s
WHERE NOT EXISTS (
    SELECT 1 FROM sale_items si WHERE si.sale_id = s.id
);

-- Movimentações de estoque sem correspondência em vendas
SELECT 
    sm.id,
    p.name as produto,
    sm.movement_type,
    sm.quantity,
    sm.reason,
    sm.created_at
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.movement_type = 'out'
AND sm.sale_id IS NULL
ORDER BY sm.created_at DESC;

-- ═════════════════════════════════════════════
-- 🎯 QUERIES DE MANUTENÇÃO
-- ═════════════════════════════════════════════

-- Verificar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Contar registros em todas as tabelas
SELECT 
    'comandas' as tabela, COUNT(*) as registros FROM comandas
UNION ALL SELECT 'comanda_items', COUNT(*) FROM comanda_items
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'sales', COUNT(*) FROM sales
UNION ALL SELECT 'sale_items', COUNT(*) FROM sale_items
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL SELECT 'stock_movements', COUNT(*) FROM stock_movements
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'pilgrimages', COUNT(*) FROM pilgrimages
UNION ALL SELECT 'rooms_master', COUNT(*) FROM rooms_master
UNION ALL SELECT 'pilgrimage_rooms', COUNT(*) FROM pilgrimage_rooms
ORDER BY tabela;

-- Verificar integridade referencial
SELECT 
    'comandas órfãs' as problema,
    COUNT(*) as quantidade
FROM comandas c
WHERE c.id NOT IN (SELECT DISTINCT comanda_id FROM comanda_items WHERE comanda_id IS NOT NULL)
AND c.status = 'open'
UNION ALL
SELECT 
    'sale_items sem produto',
    COUNT(*)
FROM sale_items si
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.id = si.product_id)
UNION ALL
SELECT 
    'pilgrimage_rooms sem romaria',
    COUNT(*)
FROM pilgrimage_rooms pr
WHERE NOT EXISTS (SELECT 1 FROM pilgrimages p WHERE p.id = pr.pilgrimage_id);
