-- =============================================
-- BARCONNECT - QUERIES ÚTEIS E RELATÓRIOS
-- =============================================
-- Descrição: Queries prontas para usar no dia a dia
-- Data: 31/10/2025
-- Como usar: Copie e cole no Supabase SQL Editor
-- =============================================

-- =============================================
-- SEÇÃO 1: PDV - COMANDAS E VENDAS
-- =============================================

-- 1.1 - Listar comandas abertas
SELECT 
    c.number,
    c.customer_name,
    c.table_number,
    c.total,
    c.created_at,
    COUNT(ci.id) as total_items
FROM comandas c
LEFT JOIN comanda_items ci ON c.id = ci.comanda_id
WHERE c.status = 'open'
GROUP BY c.id
ORDER BY c.number;

-- 1.2 - Detalhes de uma comanda específica
SELECT 
    ci.product_name,
    ci.quantity,
    ci.product_price,
    ci.subtotal
FROM comanda_items ci
WHERE ci.comanda_id = 'COLE-UUID-AQUI'
ORDER BY ci.created_at;

-- 1.3 - Vendas do dia
SELECT 
    s.id,
    s.sale_type,
    s.total,
    s.payment_method,
    s.customer_name,
    s.created_at,
    COUNT(si.id) as items_count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE DATE(s.created_at) = CURRENT_DATE
GROUP BY s.id
ORDER BY s.created_at DESC;

-- 1.4 - Vendas por período
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total_vendas,
    SUM(total) as faturamento,
    AVG(total) as ticket_medio
FROM sales
WHERE created_at >= '2025-10-01' 
  AND created_at < '2025-11-01'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- 1.5 - Vendas por método de pagamento
SELECT 
    payment_method,
    COUNT(*) as quantidade,
    SUM(total) as valor_total,
    AVG(total) as ticket_medio
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY payment_method
ORDER BY valor_total DESC;

-- 1.6 - Top 10 produtos mais vendidos (hoje)
SELECT 
    si.product_name,
    SUM(si.quantity) as quantidade_vendida,
    SUM(si.subtotal) as faturamento,
    COUNT(DISTINCT si.sale_id) as num_vendas
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE DATE(s.created_at) = CURRENT_DATE
GROUP BY si.product_name
ORDER BY quantidade_vendida DESC
LIMIT 10;

-- 1.7 - Top 10 produtos mais vendidos (mês atual)
SELECT 
    si.product_name,
    SUM(si.quantity) as quantidade_vendida,
    SUM(si.subtotal) as faturamento,
    COUNT(DISTINCT si.sale_id) as num_vendas,
    AVG(si.product_price) as preco_medio
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY si.product_name
ORDER BY quantidade_vendida DESC
LIMIT 10;

-- =============================================
-- SEÇÃO 2: ESTOQUE E PRODUTOS
-- =============================================

-- 2.1 - Produtos com estoque baixo (crítico)
SELECT 
    name,
    category,
    stock,
    min_stock,
    (stock - min_stock) as diferenca,
    CASE 
        WHEN stock <= 0 THEN '🔴 ZERADO'
        WHEN stock <= min_stock THEN '🟠 CRÍTICO'
        WHEN stock <= min_stock * 1.5 THEN '🟡 BAIXO'
        ELSE '🟢 NORMAL'
    END as status
FROM products
WHERE active = true
  AND stock <= min_stock * 1.5
ORDER BY diferenca ASC;

-- 2.2 - Movimentações de estoque (últimas 50)
SELECT 
    p.name as produto,
    sm.movement_type,
    sm.quantity,
    sm.previous_stock,
    sm.new_stock,
    sm.reason,
    sm.created_at
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
ORDER BY sm.created_at DESC
LIMIT 50;

-- 2.3 - Histórico de estoque de um produto específico
SELECT 
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    reason,
    created_at
FROM stock_movements
WHERE product_id = 'COLE-UUID-DO-PRODUTO-AQUI'
ORDER BY created_at DESC;

-- 2.4 - Produtos por categoria (com valor em estoque)
SELECT 
    category,
    COUNT(*) as total_produtos,
    SUM(stock) as estoque_total,
    SUM(stock * price) as valor_total_estoque,
    SUM(stock * cost_price) as custo_total_estoque
FROM products
WHERE active = true
GROUP BY category
ORDER BY valor_total_estoque DESC;

-- =============================================
-- SEÇÃO 3: FINANCEIRO
-- =============================================

-- 3.1 - Resumo financeiro do dia
SELECT 
    DATE(created_at) as data,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as receitas,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as despesas,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as saldo
FROM transactions
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at);

-- 3.2 - Transações do mês (resumo)
SELECT 
    DATE(created_at) as data,
    type,
    COUNT(*) as quantidade,
    SUM(amount) as valor_total
FROM transactions
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(created_at), type
ORDER BY data DESC, type;

-- 3.3 - Despesas por categoria (mês atual)
SELECT 
    category,
    COUNT(*) as quantidade,
    SUM(amount) as valor_total,
    AVG(amount) as valor_medio
FROM transactions
WHERE type = 'expense'
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category
ORDER BY valor_total DESC;

-- 3.4 - Faturamento mensal (últimos 12 meses)
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as mes,
    COUNT(*) as total_vendas,
    SUM(total) as faturamento,
    AVG(total) as ticket_medio
FROM sales
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mes DESC;

-- =============================================
-- SEÇÃO 4: HOTEL - ROMARIAS E QUARTOS
-- =============================================

-- 4.1 - Romarias ativas
SELECT 
    p.name,
    p.arrival_date,
    p.departure_date,
    p.number_of_people,
    p.bus_group,
    p.contact_phone,
    COUNT(r.id) as total_quartos_alocados
FROM pilgrimages p
LEFT JOIN rooms r ON r.pilgrimage_id = p.id
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY p.arrival_date;

-- 4.2 - Ocupação de quartos (status atual)
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM rooms
GROUP BY status
ORDER BY quantidade DESC;

-- 4.3 - Quartos de uma romaria específica
SELECT 
    r.number,
    r.status,
    r.guest_name,
    r.guest_phone,
    r.check_in_date,
    r.check_out_date
FROM rooms r
WHERE r.pilgrimage_id = 'COLE-UUID-DA-ROMARIA-AQUI'
ORDER BY r.number;

-- 4.4 - Check-ins do dia
SELECT 
    r.number,
    r.guest_name,
    r.guest_phone,
    r.check_in_date,
    r.check_out_date,
    p.name as romaria
FROM rooms r
LEFT JOIN pilgrimages p ON r.pilgrimage_id = p.id
WHERE r.check_in_date = CURRENT_DATE
ORDER BY r.number;

-- 4.5 - Check-outs do dia
SELECT 
    r.number,
    r.guest_name,
    r.guest_phone,
    r.check_in_date,
    r.check_out_date,
    p.name as romaria
FROM rooms r
LEFT JOIN pilgrimages p ON r.pilgrimage_id = p.id
WHERE r.check_out_date = CURRENT_DATE
ORDER BY r.number;

-- 4.6 - Quartos disponíveis
SELECT 
    number,
    type,
    description
FROM rooms
WHERE status = 'available'
ORDER BY number;

-- 4.7 - Histórico de romarias (últimas 10)
SELECT 
    name,
    arrival_date,
    departure_date,
    number_of_people,
    bus_group,
    status,
    created_at
FROM pilgrimages
ORDER BY created_at DESC
LIMIT 10;

-- =============================================
-- SEÇÃO 5: RELATÓRIOS GERENCIAIS
-- =============================================

-- 5.1 - Dashboard executivo (hoje)
SELECT 
    'Vendas' as metrica,
    COUNT(*)::TEXT as valor
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'Faturamento',
    'R$ ' || ROUND(SUM(total), 2)::TEXT
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'Ticket Médio',
    'R$ ' || ROUND(AVG(total), 2)::TEXT
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'Comandas Abertas',
    COUNT(*)::TEXT
FROM comandas
WHERE status = 'open'
UNION ALL
SELECT 
    'Produtos em Estoque',
    SUM(stock)::TEXT
FROM products
WHERE active = true
UNION ALL
SELECT 
    'Quartos Ocupados',
    COUNT(*)::TEXT
FROM rooms
WHERE status = 'occupied';

-- 5.2 - Análise de margem de lucro (produtos vendidos hoje)
SELECT 
    si.product_name,
    SUM(si.quantity) as quantidade,
    AVG(p.cost_price) as custo_medio,
    AVG(si.product_price) as preco_venda,
    AVG(si.product_price - p.cost_price) as margem_unitaria,
    SUM(si.subtotal) as faturamento,
    SUM(si.quantity * p.cost_price) as custo_total,
    SUM(si.subtotal) - SUM(si.quantity * p.cost_price) as lucro_bruto,
    ROUND(
        ((SUM(si.subtotal) - SUM(si.quantity * p.cost_price)) / NULLIF(SUM(si.subtotal), 0)) * 100,
        2
    ) as margem_percentual
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE DATE(s.created_at) = CURRENT_DATE
GROUP BY si.product_name
ORDER BY lucro_bruto DESC;

-- 5.3 - Comparativo mensal (mês atual vs anterior)
WITH mes_atual AS (
    SELECT 
        COUNT(*) as vendas,
        SUM(total) as faturamento
    FROM sales
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
),
mes_anterior AS (
    SELECT 
        COUNT(*) as vendas,
        SUM(total) as faturamento
    FROM sales
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
)
SELECT 
    'Mês Atual' as periodo,
    ma.vendas,
    ma.faturamento,
    ROUND((ma.vendas - man.vendas) * 100.0 / NULLIF(man.vendas, 0), 2) as crescimento_vendas_pct,
    ROUND((ma.faturamento - man.faturamento) * 100.0 / NULLIF(man.faturamento, 0), 2) as crescimento_faturamento_pct
FROM mes_atual ma, mes_anterior man;

-- =============================================
-- SEÇÃO 6: MANUTENÇÃO E LIMPEZA
-- =============================================

-- 6.1 - Limpar comandas fechadas antigas (mais de 90 dias)
-- ⚠️ CUIDADO: Isto DELETA dados permanentemente!
-- DELETE FROM comandas
-- WHERE status = 'closed'
--   AND closed_at < CURRENT_DATE - INTERVAL '90 days';

-- 6.2 - Arquivar vendas antigas (exemplo - criar tabela de arquivo)
-- CREATE TABLE IF NOT EXISTS sales_archive AS
-- SELECT * FROM sales WHERE created_at < CURRENT_DATE - INTERVAL '1 year';

-- 6.3 - Verificar integridade referencial
SELECT 
    'Comandas sem itens' as problema,
    COUNT(*) as quantidade
FROM comandas c
LEFT JOIN comanda_items ci ON c.id = ci.comanda_id
WHERE c.status = 'open' AND ci.id IS NULL
UNION ALL
SELECT 
    'Vendas sem itens',
    COUNT(*)
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE si.id IS NULL;

-- =============================================
-- OBSERVAÇÕES FINAIS
-- =============================================

-- 📌 DICAS DE USO:
--    - Substitua 'COLE-UUID-AQUI' pelos IDs reais
--    - Ajuste as datas conforme necessário
--    - Use LIMIT para queries grandes
--    - Crie índices se queries estiverem lentas

-- 📌 PERFORMANCE:
--    - Queries com DATE() podem ser lentas em tabelas grandes
--    - Use índices em colunas frequentemente filtradas
--    - Considere criar materialized views para relatórios pesados
