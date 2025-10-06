// Script para verificar dados exatos da tabela users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    console.log('👥 Dados completos da tabela users:');
    console.log('=====================================');
    users.forEach(user => {
      console.log(`📋 ID: ${user.id}`);
      console.log(`👤 Username: "${user.username}"`);
      console.log(`🔐 Password: "${user.password_hash}"`);
      console.log(`📝 Name: "${user.name}"`);
      console.log(`🏷️ Role: "${user.role}"`);
      console.log('-------------------------------------');
    });
    
    console.log('\n🔍 Para fazer login, use:');
    users.forEach(user => {
      console.log(`   Username: ${user.username} | Password: ${user.password_hash}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUsers();