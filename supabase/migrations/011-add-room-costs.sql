-- Migration 011: Adicionar campos de custos e manutenção aos quartos
-- Data: 2025-01-04
-- Objetivo: Estruturar análise financeira por quarto (custos fixos, variáveis, manutenção)

-- Adicionar campos de custo e manutenção
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS fixed_cost_monthly DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_cost_daily DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS maintenance_notes TEXT;

-- Adicionar comentários descritivos
COMMENT ON COLUMN rooms.fixed_cost_monthly IS 'Custo fixo mensal do quarto (manutenção, limpeza fixa, etc.) em R$';
COMMENT ON COLUMN rooms.variable_cost_daily IS 'Custo variável estimado por dia de ocupação (consumo, amenidades, etc.) em R$';
COMMENT ON COLUMN rooms.last_maintenance_date IS 'Data da última manutenção realizada no quarto';
COMMENT ON COLUMN rooms.maintenance_notes IS 'Observações sobre manutenções, reformas ou necessidades do quarto';

-- Criar índice para facilitar queries de análise financeira
CREATE INDEX IF NOT EXISTS idx_rooms_costs ON rooms(fixed_cost_monthly, variable_cost_daily);
CREATE INDEX IF NOT EXISTS idx_rooms_maintenance ON rooms(last_maintenance_date);
