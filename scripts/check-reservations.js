// Script para verificar as datas das reservas no banco
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkReservations() {
  console.log('🔍 Verificando reservas de dezembro 2025...\n');
  
  const { data, error } = await supabase
    .from('room_reservations')
    .select('id, room_id, notes, check_in_date, check_out_date, status, pilgrimage_id')
    .gte('check_in_date', '2025-12-01')
    .lte('check_in_date', '2025-12-31')
    .order('check_in_date');

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`📊 Total de reservas: ${data.length}\n`);
  
  data.forEach(r => {
    const checkIn = r.check_in_date;
    const checkOut = r.check_out_date;
    const name = r.notes || 'Sem nome';
    
    console.log(`📅 ${name}`);
    console.log(`   ID: ${r.id}`);
    console.log(`   Quarto: ${r.room_id}`);
    console.log(`   Check-in: ${checkIn}`);
    console.log(`   Check-out: ${checkOut}`);
    console.log(`   Status: ${r.status}`);
    console.log(`   Romaria: ${r.pilgrimage_id || 'Individual'}`);
    console.log('');
  });

  // Análise específica das que aparecem no calendário
  console.log('\n🎯 ANÁLISE DAS RESERVAS VISÍVEIS:\n');
  
  const maria = data.find(r => (r.notes || '').includes('Maria'));
  if (maria) {
    console.log('Q42 - Maria:');
    console.log(`  Check-in DB: ${maria.check_in_date}`);
    console.log(`  Check-out DB: ${maria.check_out_date}`);
    
    const checkOutDate = new Date(maria.check_out_date);
    const lastNight = new Date(checkOutDate);
    lastNight.setDate(lastNight.getDate() - 1);
    
    console.log(`  Última noite (checkout -1): ${lastNight.toISOString().slice(0, 10)}`);
    console.log(`  Badge laranja DEVE aparecer em: dia ${lastNight.getDate()}`);
  }

  const richa = data.find(r => (r.notes || '').includes('richa'));
  if (richa) {
    console.log('\nQ103 - richa:');
    console.log(`  Check-in DB: ${richa.check_in_date}`);
    console.log(`  Check-out DB: ${richa.check_out_date}`);
    
    const checkOutDate = new Date(richa.check_out_date);
    const lastNight = new Date(checkOutDate);
    lastNight.setDate(lastNight.getDate() - 1);
    
    console.log(`  Última noite (checkout -1): ${lastNight.toISOString().slice(0, 10)}`);
    console.log(`  Badge laranja DEVE aparecer em: dia ${lastNight.getDate()}`);
  }
}

checkReservations().then(() => {
  console.log('\n✅ Verificação concluída');
  process.exit(0);
});
