/**
 * Script para limpar dados transacionais do Supabase
 * Mantém: usuários, produtos, quartos, romarias (dados fixos)
 * Remove: vendas, comandas, transações, reservas (dados transacionais)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('   Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function confirmAction() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  ATENÇÃO: Esta ação irá DELETAR os seguintes dados:');
    console.log('   ❌ Todas as vendas (sales + sale_items)');
    console.log('   ❌ Todas as comandas (comandas + comanda_items)');
    console.log('   ❌ Todas as transações financeiras');
    console.log('   ❌ Todos os movimentos de estoque');
    console.log('   ❌ Todas as reservas de hotel');
    console.log('   ❌ Todas as reservas de romarias');
    console.log('');
    console.log('✅ Os seguintes dados serão MANTIDOS:');
    console.log('   ✅ Usuários (login)');
    console.log('   ✅ Produtos (catálogo)');
    console.log('   ✅ Quartos (hotel e romarias)');
    console.log('   ✅ Romarias cadastradas');
    console.log('');
    
    rl.question('Digite "CONFIRMAR" para prosseguir: ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'CONFIRMAR');
    });
  });
}

async function countRecords(table) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.warn(`   ⚠️  ${table}: erro ao contar (${error.message})`);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn(`   ⚠️  ${table}: erro ao contar (${err.message})`);
    return 0;
  }
}

async function deleteAllFromTable(table, description) {
  try {
    console.log(`\n🗑️  Limpando ${description}...`);
    
    // Contar registros antes
    const countBefore = await countRecords(table);
    console.log(`   📊 Registros encontrados: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log(`   ✅ Tabela já está vazia`);
      return { success: true, deleted: 0 };
    }

    // Deletar todos os registros
    const { error, count } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (PostgreSQL idiom)

    if (error) {
      console.error(`   ❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`   ✅ ${countBefore} registros removidos`);
    return { success: true, deleted: countBefore };
  } catch (err) {
    console.error(`   ❌ Erro inesperado: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function cleanTransactionalData() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       LIMPEZA DE DADOS TRANSACIONAIS - SUPABASE               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Confirmar ação
  const confirmed = await confirmAction();
  
  if (!confirmed) {
    console.log('\n❌ Operação cancelada pelo usuário.');
    process.exit(0);
  }

  console.log('\n🚀 Iniciando limpeza...\n');

  const results = [];

  // 1. Limpar vendas e comandas (PDV/Bar)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 FASE 1: Limpando dados de vendas e comandas');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  results.push(await deleteAllFromTable('sale_items', 'itens de vendas'));
  
  // 2. Limpar transações financeiras
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 FASE 2: Limpando transações financeiras');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  results.push(await deleteAllFromTable('transactions', 'transações financeiras'));

  // 3. Limpar movimentações de estoque (antes de sales!)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('� FASE 3: Limpando movimentações de estoque');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  results.push(await deleteAllFromTable('stock_movements', 'movimentações de estoque'));
  
  // Agora limpar vendas e comandas (pais)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('� FASE 1b: Limpando vendas e comandas (registros principais)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  results.push(await deleteAllFromTable('sales', 'vendas'));
  results.push(await deleteAllFromTable('comanda_items', 'itens de comandas'));
  results.push(await deleteAllFromTable('comandas', 'comandas'));

  // 4. Limpar reservas e hóspedes (Hotel)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏨 FASE 4: Limpando dados de hotel');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  results.push(await deleteAllFromTable('hotel_room_charges', 'cobranças de quartos'));
  results.push(await deleteAllFromTable('hotel_reservations', 'reservas de hotel'));
  results.push(await deleteAllFromTable('hotel_guests', 'hóspedes'));

  // 5. Limpar reservas de romarias
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⛪ FASE 5: Limpando dados de romarias');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  results.push(await deleteAllFromTable('room_reservations', 'reservas de romarias'));
  results.push(await deleteAllFromTable('guests', 'hóspedes de romarias'));

  // Resumo final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 RESUMO DA LIMPEZA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
  const errors = results.filter(r => !r.success);

  console.log(`   ✅ Total de registros removidos: ${totalDeleted}`);
  console.log(`   ${errors.length === 0 ? '✅' : '⚠️'}  Operações com erro: ${errors.length}\n`);

  if (errors.length > 0) {
    console.log('⚠️  Erros encontrados:');
    errors.forEach(err => console.log(`   • ${err.error}`));
    console.log('');
  }

  console.log('✅ DADOS MANTIDOS:');
  console.log('   • Usuários (users)');
  console.log('   • Produtos (products)');
  console.log('   • Quartos de hotel (hotel_rooms)');
  console.log('   • Quartos de romarias (rooms)');
  console.log('   • Romarias cadastradas (pilgrimages)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Executar limpeza
cleanTransactionalData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
    process.exit(1);
  });
