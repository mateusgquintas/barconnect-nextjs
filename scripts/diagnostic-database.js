#!/usr/bin/env node

/**
 * 🔍 Script de Diagnóstico do Banco de Dados
 * Analisa o estado atual e testa o fluxo de dados
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticDatabase() {
  console.log('🔍 === DIAGNÓSTICO DO BANCO DE DADOS ===\n');
  
  const tables = [
    'comandas',
    'comanda_items', 
    'products',
    'sales',
    'sale_items',
    'sales_records',
    'users',
    'stock_movements'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false });
      
      if (error) {
        console.log(`❌ ${table}: ERRO - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} registros`);
        
        // Mostrar alguns exemplos para tabelas importantes
        if (table === 'comandas' && data?.length > 0) {
          console.log(`   📋 Comandas:`);
          data.slice(0, 3).forEach(cmd => {
            console.log(`      - ID: ${cmd.id}, Número: ${cmd.number}, Status: ${cmd.status}`);
          });
        }
        
        if (table === 'sales' && data?.length > 0) {
          console.log(`   💰 Vendas:`);
          data.slice(0, 3).forEach(sale => {
            console.log(`      - ID: ${sale.id}, Total: R$ ${sale.total}, Método: ${sale.payment_method}`);
          });
        }
        
        if (table === 'products' && data?.length > 0) {
          console.log(`   📦 Produtos:`);
          data.slice(0, 3).forEach(prod => {
            console.log(`      - ${prod.name}: R$ ${prod.price}, Estoque: ${prod.stock}`);
          });
        }
      }
    } catch (err) {
      console.log(`💥 ${table}: ERRO FATAL - ${err.message}`);
    }
  }
  
  console.log('\n🔍 === ANÁLISE DE PROBLEMAS ===\n');
  
  // Verificar comandas com status fechado que ainda estão na tabela
  try {
    const { data: closedComandas } = await supabase
      .from('comandas')
      .select('*')
      .eq('status', 'closed');
    
    if (closedComandas?.length > 0) {
      console.log(`⚠️  PROBLEMA: ${closedComandas.length} comandas fechadas ainda na tabela`);
      closedComandas.forEach(cmd => {
        console.log(`   - Comanda #${cmd.number} (ID: ${cmd.id}) - Status: ${cmd.status}`);
      });
      console.log('   💡 SOLUÇÃO: Mover para sales e remover da tabela comandas\n');
    } else {
      console.log('✅ Nenhuma comanda fechada encontrada na tabela\n');
    }
  } catch (err) {
    console.log('❌ Erro ao verificar comandas fechadas\n');
  }
  
  // Verificar vendas órfãs
  try {
    const { data: sales } = await supabase
      .from('sales')
      .select('id, comanda_id, total')
      .not('comanda_id', 'is', null);
    
    if (sales?.length > 0) {
      console.log(`📊 ${sales.length} vendas vinculadas a comandas encontradas`);
      
      for (const sale of sales.slice(0, 3)) {
        const { data: comanda } = await supabase
          .from('comandas')
          .select('id, status')
          .eq('id', sale.comanda_id)
          .single();
        
        if (comanda) {
          console.log(`   - Venda ${sale.id} → Comanda ${sale.comanda_id} (${comanda.status}) - R$ ${sale.total}`);
        } else {
          console.log(`   ⚠️  Venda ${sale.id} → Comanda ${sale.comanda_id} (NÃO ENCONTRADA) - R$ ${sale.total}`);
        }
      }
    }
  } catch (err) {
    console.log('❌ Erro ao verificar vendas vinculadas\n');
  }
  
  console.log('\n🎯 === RECOMENDAÇÕES ===\n');
  console.log('1. 🧹 Limpar comandas fechadas da tabela comandas');
  console.log('2. 🔄 Implementar fluxo: comanda → venda → remoção');
  console.log('3. 📊 Unificar controle de vendas em sales + sale_items');
  console.log('4. 📦 Implementar controle de estoque automático');
  console.log('5. 🔍 Adicionar logs de auditoria para rastreabilidade');
}

async function cleanClosedComandas() {
  console.log('\n🧹 === LIMPEZA DE COMANDAS FECHADAS ===\n');
  
  try {
    // Buscar comandas fechadas
    const { data: closedComandas, error } = await supabase
      .from('comandas')
      .select('*')
      .eq('status', 'closed');
    
    if (error) {
      console.log('❌ Erro ao buscar comandas fechadas:', error.message);
      return;
    }
    
    if (!closedComandas?.length) {
      console.log('✅ Nenhuma comanda fechada para limpar');
      return;
    }
    
    console.log(`🎯 Encontradas ${closedComandas.length} comandas fechadas para processar:`);
    
    for (const comanda of closedComandas) {
      console.log(`\n🔄 Processando Comanda #${comanda.number} (${comanda.id})...`);
      
      // Buscar itens da comanda (localStorage ou tabela)
      let items = [];
      const localKey = `comanda_items_${comanda.id}`;
      
      // Tentar localStorage primeiro
      if (typeof localStorage !== 'undefined') {
        try {
          const localItems = localStorage.getItem(localKey);
          if (localItems) {
            const parsed = JSON.parse(localItems);
            items = parsed.map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              product_price: item.product_price,
              quantity: item.quantity
            }));
            console.log(`   📱 ${items.length} itens encontrados no localStorage`);
          }
        } catch (err) {
          console.log('   ⚠️  Erro ao ler localStorage');
        }
      }
      
      // Se não tem itens, buscar na tabela comanda_items
      if (!items.length) {
        const { data: comandaItems } = await supabase
          .from('comanda_items')
          .select('*')
          .eq('comanda_id', comanda.id);
        
        if (comandaItems?.length) {
          items = comandaItems;
          console.log(`   🗄️  ${items.length} itens encontrados na tabela`);
        }
      }
      
      if (items.length) {
        // Calcular total
        const total = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
        
        console.log(`   💰 Total calculado: R$ ${total.toFixed(2)}`);
        console.log(`   ✅ Comanda pronta para ser movida para sales`);
        console.log(`   📋 Itens: ${items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}`);
      } else {
        console.log(`   ⚠️  Nenhum item encontrado para esta comanda`);
      }
    }
    
    console.log('\n💡 Para aplicar a limpeza, execute: node scripts/clean-database.js --apply');
    
  } catch (err) {
    console.log('💥 Erro fatal na limpeza:', err.message);
  }
}

// Executar diagnóstico
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    await cleanClosedComandas();
  } else {
    await diagnosticDatabase();
  }
}

main().catch(console.error);