#!/usr/bin/env node

/**
 * 🔧 Script para Aplicar Correção de Foreign Keys
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixForeignKeys() {
  console.log('🔧 === CORRIGINDO FOREIGN KEY CONSTRAINTS ===\n');
  
  try {
    // Ler o script SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'fix-foreign-keys.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executando correções de foreign keys...');
    
    // Executar SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.log('❌ Erro ao executar SQL:', error.message);
      console.log('\n💡 Execute manualmente no Supabase SQL Editor:');
      console.log(sqlContent);
    } else {
      console.log('✅ Foreign keys corrigidas com sucesso!');
      console.log('📋 Agora comandas podem ser removidas após migração para sales');
    }
    
  } catch (err) {
    console.log('💥 Erro:', err.message);
    console.log('\n💡 Execute o SQL manualmente no Supabase SQL Editor');
  }
}

fixForeignKeys().catch(console.error);