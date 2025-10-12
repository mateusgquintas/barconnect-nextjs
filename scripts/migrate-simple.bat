@echo off
echo.
echo ===========================================
echo   BarConnect - Migracao do Banco V2
echo ===========================================
echo.
echo ✅ Schema SIMPLIFICADO encontrado!
echo.
echo ⚠️  ATENCAO: LIMPEZA COMPLETA ⚠️
echo Este script ira REMOVER TODAS as tabelas existentes
echo para evitar conflitos de estrutura.
echo.
echo 📋 INSTRUCOES:
echo.
echo 1. Acesse: https://supabase.com/dashboard
echo 2. Selecione seu projeto BarConnect
echo 3. Va para 'SQL Editor'
echo 4. Clique em 'New Query'
echo 5. Cole TODO o conteudo de database\schema_simple_v2.sql
echo 6. Execute a query (botao Run)
echo.
echo ✨ O script SIMPLIFICADO ira:
echo   • Remover todas as tabelas antigas
echo   • Criar 8 tabelas novas (SEM triggers complexos)
echo   • Configurar indices basicos  
echo   • Inserir dados de exemplo
echo   • Criar usuarios: admin/admin123 e operador/operador123
echo.
echo 🚀 Versao simplificada = MENOS erros!
echo.
pause