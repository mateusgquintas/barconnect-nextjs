-- ====================================================================
-- BARCONNECT - DADOS INICIAIS
-- ====================================================================
-- Versão: 1.0
-- Data: 2025-10-31
-- Descrição: Script para popular o banco com dados iniciais de exemplo
-- 
-- Execute APÓS o script 00-SCHEMA-COMPLETO.sql
-- Este script é IDEMPOTENTE (pode ser executado múltiplas vezes)
-- ====================================================================

-- =============================================
-- 1. USUÁRIOS PADRÃO
-- =============================================
-- ATENÇÃO: Estas senhas são para desenvolvimento apenas!
-- Em produção, use hashes seguros (bcrypt, Argon2, etc.)

INSERT INTO public.users (username, password, name, role) VALUES
    ('admin', '$2b$10$dummyhashfordev123456789', 'Administrador', 'admin'),
    ('operador', '$2b$10$dummyhashfordev987654321', 'Operador', 'operator'),
    ('caixa', '$2b$10$dummyhashfordev111111111', 'Caixa Principal', 'operator')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 2. PRODUTOS DE EXEMPLO
-- =============================================

INSERT INTO public.products (name, description, price, cost_price, stock, category, subcategory, min_stock, track_stock) VALUES
    -- Bebidas
    ('Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml', 5.50, 3.20, 100, 'bebidas', 'refrigerantes', 20, true),
    ('Guaraná Antarctica 350ml', 'Refrigerante Guaraná Antarctica lata 350ml', 5.00, 2.80, 120, 'bebidas', 'refrigerantes', 20, true),
    ('Água Mineral 500ml', 'Água mineral natural 500ml', 3.00, 1.50, 150, 'bebidas', 'água', 30, true),
    ('Água com Gás 500ml', 'Água mineral com gás 500ml', 3.50, 1.70, 80, 'bebidas', 'água', 20, true),
    ('Cerveja Pilsen 350ml', 'Cerveja Pilsen lata 350ml gelada', 6.00, 3.50, 80, 'bebidas', 'cervejas', 15, true),
    ('Cerveja IPA 350ml', 'Cerveja IPA artesanal lata 350ml', 8.50, 5.00, 50, 'bebidas', 'cervejas', 10, true),
    ('Café Expresso', 'Café expresso tradicional', 4.50, 1.20, 200, 'bebidas', 'café', 50, true),
    ('Cappuccino', 'Cappuccino cremoso', 7.00, 2.50, 100, 'bebidas', 'café', 30, true),
    ('Suco de Laranja', 'Suco natural de laranja 300ml', 6.00, 2.00, 50, 'bebidas', 'sucos', 15, true),
    ('Suco de Limão', 'Suco natural de limão 300ml', 5.50, 1.80, 50, 'bebidas', 'sucos', 15, true),
    
    -- Pratos/Refeições
    ('Almoço Executivo', 'Prato executivo completo com arroz, feijão, carne e salada', 25.00, 12.00, 50, 'pratos', 'executivos', 10, true),
    ('Feijoada Completa', 'Feijoada com acompanhamentos', 35.00, 18.00, 30, 'pratos', 'especiais', 5, true),
    ('Filé à Parmegiana', 'Filé bovino à parmegiana com arroz e fritas', 42.00, 22.00, 25, 'pratos', 'carnes', 5, true),
    ('Frango Grelhado', 'Peito de frango grelhado com legumes', 28.00, 14.00, 40, 'pratos', 'carnes', 10, true),
    ('Peixe Assado', 'Peixe assado com molho especial', 38.00, 20.00, 20, 'pratos', 'peixes', 5, true),
    
    -- Lanches
    ('Sanduíche Natural', 'Sanduíche natural de frango com salada', 12.00, 6.50, 30, 'lanches', 'naturais', 10, true),
    ('X-Burger', 'Hambúrguer artesanal com queijo', 18.00, 9.00, 40, 'lanches', 'hambúrgueres', 10, true),
    ('X-Bacon', 'Hambúrguer com queijo e bacon', 22.00, 11.00, 35, 'lanches', 'hambúrgueres', 10, true),
    ('Misto Quente', 'Misto quente tradicional', 8.00, 4.00, 50, 'lanches', 'tradicionais', 15, true),
    ('Croissant', 'Croissant artesanal', 7.00, 3.00, 40, 'lanches', 'padaria', 15, true),
    
    -- Sobremesas
    ('Pudim', 'Pudim de leite caseiro', 10.00, 4.00, 20, 'sobremesas', 'doces', 5, true),
    ('Brownie', 'Brownie de chocolate', 12.00, 5.00, 25, 'sobremesas', 'doces', 5, true),
    ('Sorvete 2 Bolas', 'Sorvete artesanal 2 bolas', 15.00, 6.00, 30, 'sobremesas', 'gelados', 10, true),
    
    -- Petiscos
    ('Porção de Fritas', 'Batata frita crocante', 15.00, 6.00, 50, 'petiscos', 'fritos', 15, true),
    ('Porção de Anéis de Cebola', 'Anéis de cebola empanados', 18.00, 8.00, 40, 'petiscos', 'fritos', 10, true),
    ('Tábua de Frios', 'Seleção de queijos e frios', 35.00, 18.00, 15, 'petiscos', 'premium', 5, true),
    
    -- Serviços (não afetam estoque)
    ('Taxa de Serviço', 'Taxa de serviço 10%', 0.00, 0.00, 0, 'serviços', NULL, 0, false),
    ('Couvert Artístico', 'Couvert artístico por pessoa', 15.00, 0.00, 0, 'serviços', NULL, 0, false),
    ('Reserva de Mesa', 'Taxa de reserva antecipada', 20.00, 0.00, 0, 'serviços', NULL, 0, false)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. QUARTOS DO HOTEL
-- =============================================

INSERT INTO public.hotel_rooms (number, type, description, daily_rate, status) VALUES
    ('101', 'solteiro', 'Quarto individual com banheiro privativo', 150.00, 'available'),
    ('102', 'casal', 'Quarto de casal com ar-condicionado', 220.00, 'available'),
    ('103', 'casal', 'Quarto de casal luxo com varanda', 280.00, 'available'),
    ('201', 'família', 'Suíte familiar para até 4 pessoas', 350.00, 'available'),
    ('202', 'suíte', 'Suíte master com hidromassagem', 450.00, 'available'),
    ('203', 'casal', 'Quarto de casal standard', 220.00, 'available'),
    ('301', 'solteiro', 'Quarto individual econômico', 120.00, 'available'),
    ('302', 'casal', 'Quarto de casal standard', 220.00, 'available'),
    ('303', 'família', 'Suíte familiar com sala', 380.00, 'available'),
    ('304', 'suíte', 'Suíte premium vista jardim', 480.00, 'available')
ON CONFLICT (number) DO NOTHING;

-- =============================================
-- 4. QUARTOS PARA AGENDA/ROMARIAS
-- =============================================

-- Quartos por nome (para agenda)
INSERT INTO public.rooms (name, capacity, status) VALUES
    ('Quarto 101', 2, 'active'),
    ('Quarto 102', 2, 'active'),
    ('Quarto 103', 2, 'active'),
    ('Quarto 201', 4, 'active'),
    ('Quarto 202', 4, 'active'),
    ('Quarto 203', 4, 'active'),
    ('Dormitório A', 10, 'active'),
    ('Dormitório B', 10, 'active'),
    ('Dormitório C', 12, 'active'),
    ('Sala de Reunião', 20, 'active')
ON CONFLICT DO NOTHING;

-- Quartos por número (para romarias) - 5 andares x 5 quartos
INSERT INTO public.rooms (number, status) VALUES
    -- Andar 1
    (101, 'available'), (102, 'available'), (103, 'available'), (104, 'available'), (105, 'available'),
    -- Andar 2
    (201, 'available'), (202, 'available'), (203, 'available'), (204, 'available'), (205, 'available'),
    -- Andar 3
    (301, 'available'), (302, 'available'), (303, 'available'), (304, 'available'), (305, 'available'),
    -- Andar 4
    (401, 'available'), (402, 'available'), (403, 'available'), (404, 'available'), (405, 'available'),
    -- Andar 5
    (501, 'available'), (502, 'available'), (503, 'available'), (504, 'available'), (505, 'available')
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. ROMARIAS DE EXEMPLO
-- =============================================

INSERT INTO public.pilgrimages (name, arrival_date, departure_date, number_of_people, bus_group, contact_phone, status) VALUES
    ('Romaria São João', '2025-11-15', '2025-11-17', 45, 'Ônibus A', '(11) 98765-4321', 'active'),
    ('Grupo Aparecida', '2025-11-20', '2025-11-22', 38, 'Ônibus B', '(11) 91234-5678', 'active'),
    ('Peregrinação Santa Cruz', '2025-12-01', '2025-12-03', 52, 'Ônibus C e D', '(11) 93456-7890', 'active')
ON CONFLICT DO NOTHING;

-- =============================================
-- MENSAGEM DE CONFIRMAÇÃO
-- =============================================

DO $$
DECLARE
    user_count INTEGER;
    product_count INTEGER;
    hotel_room_count INTEGER;
    room_count INTEGER;
    pilgrimage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO hotel_room_count FROM public.hotel_rooms;
    SELECT COUNT(*) INTO room_count FROM public.rooms;
    SELECT COUNT(*) INTO pilgrimage_count FROM public.pilgrimages;
    
    RAISE NOTICE '====================================================================';
    RAISE NOTICE '✅ Dados iniciais inseridos com sucesso!';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'Resumo:';
    RAISE NOTICE '  → % usuários cadastrados', user_count;
    RAISE NOTICE '  → % produtos cadastrados', product_count;
    RAISE NOTICE '  → % quartos de hotel cadastrados', hotel_room_count;
    RAISE NOTICE '  → % quartos de agenda/romarias cadastrados', room_count;
    RAISE NOTICE '  → % romarias cadastradas', pilgrimage_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '  → Senhas padrão são para DESENVOLVIMENTO apenas!';
    RAISE NOTICE '  → Em PRODUÇÃO, altere todas as senhas para hashes seguros';
    RAISE NOTICE '  → Configure autenticação adequada antes de disponibilizar';
    RAISE NOTICE '====================================================================';
END $$;

-- Fim do script
