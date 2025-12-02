/**
 * Script de teste para verificar bug de bed_configuration
 * Problema: 6 solteiras vira 3 casais
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ifewhvbdgxhyuiwpmwhx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZXdodmJkZ3hoeXVpd3Btd2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MDAzMzEsImV4cCI6MjA0NzE3NjMzMX0.r8yqg15u9e-qPr2Y7wjS5MvDWRnz9ztHXgHmLf0aPlE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBedConfiguration() {
  console.log('\n=== TESTE DE BED_CONFIGURATION ===\n');

  // 1. Buscar quarto 11
  console.log('1️⃣ Buscando quarto 11...');
  const { data: room11Before, error: errorBefore } = await supabase
    .from('rooms')
    .select('*')
    .eq('number', 11)
    .single();

  if (errorBefore) {
    console.error('❌ Erro ao buscar quarto:', errorBefore);
    return;
  }

  console.log('✅ Quarto 11 encontrado:');
  console.log('   Capacity:', room11Before.capacity);
  console.log('   Beds:', room11Before.beds);
  console.log('   Bed Configuration:', JSON.stringify(room11Before.bed_configuration, null, 2));

  // 2. Simular mudança para 6 solteiras
  console.log('\n2️⃣ Alterando para 6 solteiras...');
  const newBedConfig = [
    { id: '1', type: 'solteiro', quantity: 6 }
  ];

  const { data: updated, error: errorUpdate } = await supabase
    .from('rooms')
    .update({
      bed_configuration: newBedConfig,
      beds: 6,
      capacity: 6
    })
    .eq('number', 11)
    .select();

  if (errorUpdate) {
    console.error('❌ Erro ao atualizar:', errorUpdate);
    return;
  }

  console.log('✅ Quarto atualizado:');
  console.log('   Response:', JSON.stringify(updated, null, 2));

  // 3. Re-buscar para verificar
  console.log('\n3️⃣ Re-buscando quarto 11...');
  const { data: room11After, error: errorAfter } = await supabase
    .from('rooms')
    .select('*')
    .eq('number', 11)
    .single();

  if (errorAfter) {
    console.error('❌ Erro ao re-buscar:', errorAfter);
    return;
  }

  console.log('✅ Quarto após update:');
  console.log('   Capacity:', room11After.capacity);
  console.log('   Beds:', room11After.beds);
  console.log('   Bed Configuration:', JSON.stringify(room11After.bed_configuration, null, 2));

  // 4. Verificar se dados são corretos
  const actualConfig = room11After.bed_configuration;
  if (Array.isArray(actualConfig) && actualConfig.length === 1) {
    const bed = actualConfig[0];
    if (bed.type === 'solteiro' && bed.quantity === 6) {
      console.log('\n✅ SUCESSO: bed_configuration está correto!');
    } else {
      console.log('\n❌ ERRO: bed_configuration foi modificado!');
      console.log('   Esperado: { type: "solteiro", quantity: 6 }');
      console.log('   Recebido:', bed);
    }
  } else {
    console.log('\n❌ ERRO: bed_configuration tem formato incorreto!');
    console.log('   Esperado: array com 1 item');
    console.log('   Recebido:', actualConfig);
  }

  // 5. Restaurar dados originais
  console.log('\n5️⃣ Restaurando dados originais...');
  await supabase
    .from('rooms')
    .update({
      bed_configuration: room11Before.bed_configuration,
      beds: room11Before.beds,
      capacity: room11Before.capacity
    })
    .eq('number', 11);

  console.log('✅ Quarto 11 restaurado\n');
}

testBedConfiguration().catch(console.error);
