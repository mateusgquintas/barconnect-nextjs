#!/bin/bash

# BarConnect - Script de Migração do Banco de Dados
# Este script facilita a aplicação do novo schema no Supabase

echo "🔄 BarConnect - Migração do Banco de Dados"
echo "=========================================="
echo ""

# Verificar se existe o arquivo de schema
if [ ! -f "database/schema_complete_v2.sql" ]; then
    echo "❌ Erro: Arquivo database/schema_complete_v2.sql não encontrado!"
    echo "   Certifique-se de que o arquivo existe no diretório database/"
    exit 1
fi

echo "✅ Arquivo de schema encontrado"
echo ""

# Instruções para o usuário
echo "📋 INSTRUÇÕES PARA MIGRAÇÃO:"
echo ""
echo "1. Acesse o Supabase Dashboard:"
echo "   https://supabase.com/dashboard"
echo ""
echo "2. Selecione seu projeto BarConnect"
echo ""
echo "3. Vá para 'SQL Editor' no menu lateral"
echo ""
echo "4. Clique em 'New Query'"
echo ""
echo "5. Cole o conteúdo do arquivo database/schema_complete_v2.sql"
echo ""
echo "6. Execute a query (botão 'Run' ou Ctrl+Enter)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Esta migração irá RECRIAR todas as tabelas"
echo "   - Dados existentes serão PERDIDOS"
echo "   - Certifique-se de fazer backup se necessário"
echo ""

# Mostrar resumo do schema
echo "📊 RESUMO DO NOVO SCHEMA:"
echo ""
echo "Tabelas que serão criadas:"
echo "  • users (sistema de usuários)"
echo "  • products (catálogo de produtos)"
echo "  • comandas (comandas do bar)"
echo "  • comanda_items (itens das comandas)"
echo "  • sales (vendas realizadas)"
echo "  • sale_items (itens das vendas)"
echo "  • transactions (transações financeiras)"
echo "  • stock_movements (movimentações de estoque)"
echo ""
echo "Recursos incluídos:"
echo "  • Triggers automáticos para cálculos"
echo "  • Views para consultas otimizadas"
echo "  • Índices para performance"
echo "  • Dados de exemplo para testes"
echo ""

# Opção para mostrar o conteúdo do arquivo
echo "Deseja visualizar o conteúdo do arquivo SQL? (y/n)"
read -r show_content

if [ "$show_content" = "y" ] || [ "$show_content" = "Y" ]; then
    echo ""
    echo "📄 CONTEÚDO DO ARQUIVO:"
    echo "======================"
    cat database/schema_complete_v2.sql
    echo ""
fi

echo "✅ Migração pronta para ser executada!"
echo ""
echo "Após executar o SQL no Supabase:"
echo "1. Teste a conexão com o novo schema"
echo "2. Execute os testes do sistema"
echo "3. Integre os novos hooks (useSalesV2, useComandasV2, etc.)"
echo ""
echo "🚀 Boa sorte com a migração!"