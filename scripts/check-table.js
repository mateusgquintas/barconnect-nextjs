// Script para verificar a estrutura da tabela users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    // Primeiro, vamos ver o que existe na tabela
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela:', error.message);
      return;
    }

    if (users && users.length > 0) {
      console.log('📋 Colunas existentes na tabela users:');
      console.log('=====================================');
      Object.keys(users[0]).forEach(column => {
        console.log(`📝 ${column}: ${typeof users[0][column]} = "${users[0][column]}"`);
      });
    } else {
      console.log('❌ Tabela users está vazia');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableStructure();