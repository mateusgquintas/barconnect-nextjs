-- Migration 002 - Aplicar Schema Unificado (PDV + Hotel/Romarias)
-- Data: 2025-11-01
-- Observação: Esta migração replica o conteúdo de supabase/schema-unificado.sql
-- Recomendado rodar esta migração em produção após backup

\echo '== Iniciando Migration 002: Schema Unificado =='

-- Copie o conteúdo de schema-unificado.sql abaixo (manter sincronizado)
-- Por praticidade, incluímos diretamente para tornar a migração autossuficiente

\i ../schema-unificado.sql

\echo '== Migration 002 concluída =='
