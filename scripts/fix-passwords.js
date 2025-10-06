// Script para atualizar senhas dos usuários
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPasswords() {
  try {
    console.log('🔧 Atualizando senhas dos usuários...');
    
    // Atualizar senha do admin
    const { error: adminError } = await supabase
      .from('users')
      .update({ password: 'admin123' })
      .eq('username', 'admin');
    
    if (adminError) {
      console.error('❌ Erro ao atualizar admin:', adminError.message);
    } else {
      console.log('✅ Senha do admin atualizada');
    }
    
    // Atualizar senha do operador
    const { error: opError } = await supabase
      .from('users')
      .update({ password: 'op123' })
      .eq('username', 'operador');
    
    if (opError) {
      console.error('❌ Erro ao atualizar operador:', opError.message);
    } else {
      console.log('✅ Senha do operador atualizada');
    }
    
    console.log('\n🎉 Senhas atualizadas! Credenciais para login:');
    console.log('   Admin: admin / admin123');
    console.log('   Operador: operador / op123');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixPasswords();