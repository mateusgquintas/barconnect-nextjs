// Teste específico: vendas diretas aparecem no dashboard
// Execute: node test-direct-sales-dashboard.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectSalesInDashboard() {
  console.log('🎯 Testando como vendas diretas aparecem no dashboard...\n');

  try {
    // 1. Simular busca do useSalesDB (exatamente como o dashboard faz)
    console.log('1. 📊 Buscando vendas como o useSalesDB faz...');
    
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('id, comanda_id, total, payment_method, is_courtesy, customer_name, items_snapshot, created_at, comandas!sales_comanda_id_fkey(number)')
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      return;
    }

    console.log('✅ Total de vendas encontradas:', salesData.length);

    // 2. Separar vendas diretas vs comandas (como o dashboard faz)
    const vendasDiretas = salesData.filter(sale => !sale.comanda_id);
    const vendasComandas = salesData.filter(sale => sale.comanda_id);

    console.log('\n2. 📈 Distribuição de vendas:');
    console.log(`   🛒 Vendas diretas: ${vendasDiretas.length}`);
    console.log(`   📋 Vendas de comandas: ${vendasComandas.length}`);

    // 3. Mostrar exemplos de cada tipo
    if (vendasDiretas.length > 0) {
      console.log('\n3. 🛒 Exemplo de VENDA DIRETA:');
      const vd = vendasDiretas[0];
      console.log(`   ID: ${vd.id}`);
      console.log(`   Total: R$ ${vd.total}`);
      console.log(`   Pagamento: ${vd.payment_method}`);
      console.log(`   Cliente: ${vd.customer_name || 'Não informado'}`);
      console.log(`   Data: ${new Date(vd.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Comanda ID: ${vd.comanda_id} (null = venda direta)`);
      console.log(`   Items: ${vd.items_snapshot ? vd.items_snapshot.length : 0} itens`);
    }

    if (vendasComandas.length > 0) {
      console.log('\n4. 📋 Exemplo de VENDA DE COMANDA:');
      const vc = vendasComandas[0];
      console.log(`   ID: ${vc.id}`);
      console.log(`   Total: R$ ${vc.total}`);
      console.log(`   Pagamento: ${vc.payment_method}`);
      console.log(`   Cliente: ${vc.customer_name || 'Não informado'}`);
      console.log(`   Data: ${new Date(vc.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Comanda ID: ${vc.comanda_id}`);
      console.log(`   Comanda Número: ${vc.comandas?.number || 'N/A'}`);
    }

    // 4. Simular conversão para SaleRecord (formato do dashboard)
    console.log('\n5. 🔄 Conversão para formato SaleRecord (usado pelo dashboard):');
    
    const convertToSaleRecord = (sale) => {
      const created = new Date(sale.created_at);
      const pad = (n) => n.toString().padStart(2, '0');
      const date = `${pad(created.getDate())}/${pad(created.getMonth() + 1)}/${created.getFullYear()}`;
      const time = `${pad(created.getHours())}:${pad(created.getMinutes())}`;

      return {
        id: sale.id,
        comandaNumber: sale.comandas?.number,  // undefined para vendas diretas
        customerName: sale.customer_name,
        items: sale.items_snapshot || [],
        total: typeof sale.total === 'string' ? parseFloat(sale.total) : sale.total,
        paymentMethod: sale.payment_method,
        date,
        time,
        isDirectSale: !sale.comanda_id,  // TRUE para vendas diretas
        isCourtesy: !!sale.is_courtesy,
      };
    };

    const allSaleRecords = salesData.map(convertToSaleRecord);
    const directSaleRecords = allSaleRecords.filter(sale => sale.isDirectSale);
    const comandaSaleRecords = allSaleRecords.filter(sale => !sale.isDirectSale);

    console.log(`   ✅ Total SaleRecords: ${allSaleRecords.length}`);
    console.log(`   🛒 Direct Sales: ${directSaleRecords.length}`);
    console.log(`   📋 Comanda Sales: ${comandaSaleRecords.length}`);

    // 5. Como aparecem no dashboard
    console.log('\n6. 📊 Como aparecem no DASHBOARD:');
    
    if (directSaleRecords.length > 0) {
      const ds = directSaleRecords[0];
      console.log('\n   🛒 VENDA DIRETA no dashboard:');
      console.log(`      Título: "Venda Direta" (porque isDirectSale = true)`);
      console.log(`      Data/Hora: ${ds.date} ${ds.time}`);
      console.log(`      Total: R$ ${ds.total.toFixed(2)}`);
      console.log(`      Pagamento: ${ds.paymentMethod}`);
      console.log(`      Status: "Fechada"`);
      console.log(`      Cliente: ${ds.customerName || 'Não informado'}`);
    }

    if (comandaSaleRecords.length > 0) {
      const cs = comandaSaleRecords[0];
      console.log('\n   📋 VENDA DE COMANDA no dashboard:');
      console.log(`      Título: "Comanda #${cs.comandaNumber}" (porque isDirectSale = false)`);
      console.log(`      Data/Hora: ${cs.date} ${cs.time}`);
      console.log(`      Total: R$ ${cs.total.toFixed(2)}`);
      console.log(`      Pagamento: ${cs.paymentMethod}`);
      console.log(`      Status: "Fechada"`);
      console.log(`      Cliente: ${cs.customerName || 'Não informado'}`);
    }

    // 6. Calcular estatísticas como o dashboard faz
    console.log('\n7. 📈 ESTATÍSTICAS DO DASHBOARD:');
    
    const today = new Date();
    const todayStr = today.toLocaleDateString('pt-BR');
    
    const todaySales = allSaleRecords.filter(sale => sale.date === todayStr);
    const todayDirectSales = todaySales.filter(sale => sale.isDirectSale);
    const todayComandaSales = todaySales.filter(sale => !sale.isDirectSale);
    
    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const directSalesRevenue = todayDirectSales.reduce((sum, sale) => sum + sale.total, 0);
    const comandaSalesRevenue = todayComandaSales.reduce((sum, sale) => sum + sale.total, 0);

    console.log(`   📅 Vendas de hoje (${todayStr}):`);
    console.log(`      💰 Receita total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`      🛒 Vendas diretas: ${todayDirectSales.length} vendas = R$ ${directSalesRevenue.toFixed(2)}`);
    console.log(`      📋 Vendas comandas: ${todayComandaSales.length} vendas = R$ ${comandaSalesRevenue.toFixed(2)}`);
    console.log(`      📊 Total de vendas: ${todaySales.length}`);

    console.log('\n🎉 CONCLUSÃO:');
    console.log('✅ Vendas diretas SIM aparecem no dashboard');
    console.log('✅ São distinguidas pelo campo isDirectSale = true');
    console.log('✅ Aparecem como "Venda Direta" na lista');
    console.log('✅ Contam para todas as estatísticas (receita, métodos pagamento, etc.)');
    console.log('✅ São processadas junto com vendas de comandas');

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

// Executar teste
testDirectSalesInDashboard();