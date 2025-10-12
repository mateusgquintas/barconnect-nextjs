# BarConnect - Script de Migração do Banco de Dados (PowerShell)
# Este script facilita a aplicação do novo schema no Supabase

Write-Host "🔄 BarConnect - Migração do Banco de Dados" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se existe o arquivo de schema
$schemaFile = "database\schema_complete_v2.sql"
if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ Erro: Arquivo database\schema_complete_v2.sql não encontrado!" -ForegroundColor Red
    Write-Host "   Certifique-se de que o arquivo existe no diretório database\" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Arquivo de schema encontrado" -ForegroundColor Green
Write-Host ""

# Instruções para o usuário
Write-Host "📋 INSTRUÇÕES PARA MIGRAÇÃO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse o Supabase Dashboard:"
Write-Host "   https://supabase.com/dashboard" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Selecione seu projeto BarConnect"
Write-Host ""
Write-Host "3. Vá para 'SQL Editor' no menu lateral"
Write-Host ""
Write-Host "4. Clique em 'New Query'"
Write-Host ""
Write-Host "5. Cole o conteúdo do arquivo database\schema_complete_v2.sql"
Write-Host ""
Write-Host "6. Execute a query (botao 'Run' ou Ctrl+Enter)"
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "   - Esta migração irá REMOVER TODAS AS TABELAS EXISTENTES" -ForegroundColor Yellow
Write-Host "   - O script foi atualizado para limpar conflitos" -ForegroundColor Yellow
Write-Host "   - Dados existentes serão PERDIDOS completamente" -ForegroundColor Yellow
Write-Host "   - Certifique-se de fazer backup se necessário" -ForegroundColor Yellow
Write-Host ""

# Mostrar resumo do schema
Write-Host "📊 RESUMO DO NOVO SCHEMA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tabelas que serão criadas:" -ForegroundColor White
Write-Host "  • users (sistema de usuários)" -ForegroundColor Gray
Write-Host "  • products (catálogo de produtos)" -ForegroundColor Gray
Write-Host "  • comandas (comandas do bar)" -ForegroundColor Gray
Write-Host "  • comanda_items (itens das comandas)" -ForegroundColor Gray
Write-Host "  • sales (vendas realizadas)" -ForegroundColor Gray
Write-Host "  • sale_items (itens das vendas)" -ForegroundColor Gray
Write-Host "  • transactions (transações financeiras)" -ForegroundColor Gray
Write-Host "  • stock_movements (movimentações de estoque)" -ForegroundColor Gray
Write-Host ""
Write-Host "Recursos incluídos:" -ForegroundColor White
Write-Host "  • Triggers automáticos para cálculos" -ForegroundColor Gray
Write-Host "  • Views para consultas otimizadas" -ForegroundColor Gray
Write-Host "  • Índices para performance" -ForegroundColor Gray
Write-Host "  • Dados de exemplo para testes" -ForegroundColor Gray
Write-Host ""

# Opção para mostrar o conteúdo do arquivo
$showContent = Read-Host "Deseja visualizar o conteúdo do arquivo SQL? (y/n)"

if ($showContent -eq "y" -or $showContent -eq "Y") {
    Write-Host ""
    Write-Host "📄 CONTEÚDO DO ARQUIVO:" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Get-Content $schemaFile | Write-Host
    Write-Host ""
}

# Oferecer para abrir o Supabase
$openBrowser = Read-Host "Deseja abrir o Supabase Dashboard no navegador? (y/n)"

if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://supabase.com/dashboard"
    Write-Host "🌐 Abrindo Supabase Dashboard..." -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Migração pronta para ser executada!" -ForegroundColor Green
Write-Host ""
Write-Host "Após executar o SQL no Supabase:" -ForegroundColor Yellow
Write-Host "1. Teste a conexão com o novo schema" -ForegroundColor Gray
Write-Host "2. Execute os testes do sistema" -ForegroundColor Gray
Write-Host "3. Integre os novos hooks (useSalesV2, useComandasV2, etc.)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Boa sorte com a migração!" -ForegroundColor Green

# Pausar para o usuário ler
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")