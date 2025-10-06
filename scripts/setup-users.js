// Script para criar usuários de teste no Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Substitua com suas credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas');
  console.log('Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: '2', 
    username: 'operador',
    password: 'op123',
    name: 'Operador',
    role: 'operator'
  }
];

async function setupUsers() {
  try {
    console.log('🔍 Verificando tabela users...');
    
    // Verificar se a tabela existe e tem dados
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Erro ao acessar tabela users:', fetchError.message);
      console.log('\n📝 Certifique-se de que a tabela "users" existe no Supabase com as colunas:');
      console.log('- id (text, primary key)');
      console.log('- username (text, unique)');
      console.log('- password (text)');
      console.log('- name (text)');
      console.log('- role (text)');
      return;
    }

    console.log(`📊 Usuários existentes: ${existingUsers?.length || 0}`);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('👥 Usuários encontrados:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.name}) - Role: ${user.role}`);
      });
    } else {
      console.log('📝 Inserindo usuários padrão...');
      
      const { data, error } = await supabase
        .from('users')
        .insert(defaultUsers);
      
      if (error) {
        console.error('❌ Erro ao inserir usuários:', error.message);
      } else {
        console.log('✅ Usuários criados com sucesso!');
        console.log('👥 Credenciais de acesso:');
        console.log('  Admin: admin / admin123');
        console.log('  Operador: operador / op123');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

setupUsers();