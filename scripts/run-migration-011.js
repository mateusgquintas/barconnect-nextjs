/**
 * Script para executar a migration 011 diretamente no Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis SUPABASE não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('\n=== EXECUTANDO MIGRATION 011: Room Costs ===\n');

  // Ler arquivo de migration
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '011-add-room-costs.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Arquivo de migration não encontrado:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('📄 Migration SQL carregada:\n');
  console.log(migrationSQL);
  console.log('\n');

  // Executar migration via RPC (se disponível) ou direto via SQL
  try {
    // Tentar executar usando RPC (se configurado no Supabase)
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao executar migration via RPC:', error);
      console.log('\n⚠️  Tente executar manualmente no SQL Editor do Supabase Dashboard');
      console.log('\nSQL a ser executado:');
      console.log('-------------------');
      console.log(migrationSQL);
      console.log('-------------------\n');
    } else {
      console.log('✅ Migration executada com sucesso!');
      console.log('   Resultado:', data);
    }
  } catch (err) {
    console.error('❌ Erro ao executar migration:', err.message);
    console.log('\n⚠️  A função RPC pode não estar disponível.');
    console.log('   Execute manualmente no SQL Editor do Supabase Dashboard:\n');
    console.log(migrationSQL);
  }

  // Verificar se as colunas foram adicionadas
  console.log('\n🔍 Verificando estrutura da tabela rooms...\n');
  const { data: rooms, error: selectError } = await supabase
    .from('rooms')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('❌ Erro ao verificar tabela:', selectError);
  } else if (rooms && rooms.length > 0) {
    const room = rooms[0];
    const newFields = ['fixed_cost_monthly', 'variable_cost_daily', 'last_maintenance_date', 'maintenance_notes'];
    
    console.log('📋 Campos disponíveis na tabela rooms:');
    Object.keys(room).forEach(key => {
      const isNew = newFields.includes(key);
      console.log(`   ${isNew ? '✅' : '  '} ${key}${isNew ? ' (NOVO)' : ''}`);
    });
  }
}

runMigration().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
