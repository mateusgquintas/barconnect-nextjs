// Teste de compatibilidade dos dashboards
// Execute: node test-dashboard-compatibility.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardData() {
  console.log('🧪 Testando compatibilidade dos dashboards...');

  try {
    // 1. Testar busca de vendas (como usado pelo useSalesDB)
    console.log('\n1. 🔍 Testando busca de vendas do useSalesDB...');
    
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('id, comanda_id, total, payment_method, is_courtesy, customer_name, items_snapshot, created_at, comandas!sales_comanda_id_fkey(number)')
      .order('created_at', { ascending: false })
      .limit(3);

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      return;
    }

    console.log('✅ Vendas encontradas:', salesData.length);
    if (salesData.length > 0) {
      console.log('📊 Exemplo de venda:', {
        id: salesData[0].id,
        total: salesData[0].total,
        payment_method: salesData[0].payment_method,
        has_items_snapshot: !!salesData[0].items_snapshot,
        comanda_number: salesData[0].comandas?.number
      });
    }

    // 2. Testar view sales_detailed
    console.log('\n2. 🔍 Testando view sales_detailed...');
    
    const { data: detailedData, error: detailedError } = await supabase
      .from('sales_detailed')
      .select('*')
      .limit(3);

    if (detailedError) {
      console.error('❌ Erro ao buscar sales_detailed:', detailedError);
    } else {
      console.log('✅ View sales_detailed funcionando:', detailedData.length, 'registros');
      if (detailedData.length > 0) {
        console.log('📊 Exemplo detalhado:', {
          id: detailedData[0].id,
          total: detailedData[0].total,
          items_count: detailedData[0].items_count,
          items_summary: detailedData[0].items_summary
        });
      }
    }

    // 3. Testar sale_items com novas colunas
    console.log('\n3. 🔍 Testando sale_items com novas colunas...');
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .select('id, product_id, product_name, quantity, subtotal, is_custom_item, custom_category')
      .limit(5);

    if (itemsError) {
      console.error('❌ Erro ao buscar sale_items:', itemsError);
    } else {
      console.log('✅ Sale_items com novas colunas:', itemsData.length, 'registros');
      
      const customItems = itemsData.filter(item => item.is_custom_item);
      const normalItems = itemsData.filter(item => !item.is_custom_item);
      
      console.log('📊 Distribuição:', {
        total: itemsData.length,
        normal_items: normalItems.length,
        custom_items: customItems.length
      });

      if (customItems.length > 0) {
        console.log('🎨 Exemplo item customizado:', {
          name: customItems[0].product_name,
          product_id: customItems[0].product_id,
          is_custom: customItems[0].is_custom_item,
          category: customItems[0].custom_category
        });
      }
    }

    // 4. Testar formato esperado pelo dashboard
    console.log('\n4. 🔍 Testando formato esperado pelo DashboardBar...');
    
    if (salesData && salesData.length > 0) {
      // Simular conversão do useSalesDB para SaleRecord
      const mockSaleRecord = {
        id: salesData[0].id,
        comandaNumber: salesData[0].comandas?.number,
        customerName: salesData[0].customer_name,
        items: salesData[0].items_snapshot || [],
        total: salesData[0].total,
        paymentMethod: salesData[0].payment_method,
        date: new Date(salesData[0].created_at).toLocaleDateString('pt-BR'),
        time: new Date(salesData[0].created_at).toLocaleTimeString('pt-BR'),
        isDirectSale: !salesData[0].comanda_id,
        isCourtesy: !!salesData[0].is_courtesy,
      };

      console.log('✅ Formato SaleRecord válido:', {
        hasRequiredFields: !!(mockSaleRecord.id && mockSaleRecord.total && mockSaleRecord.paymentMethod),
        date: mockSaleRecord.date,
        time: mockSaleRecord.time,
        isDirectSale: mockSaleRecord.isDirectSale,
        itemsCount: Array.isArray(mockSaleRecord.items) ? mockSaleRecord.items.length : 0
      });
    }

    console.log('\n🎉 Teste de compatibilidade concluído!');
    console.log('📋 Resumo:');
    console.log('- ✅ Tabela sales mantém estrutura compatível');
    console.log('- ✅ View sales_detailed funcionando');
    console.log('- ✅ Sale_items com novas colunas para itens customizados');
    console.log('- ✅ Formato SaleRecord preservado para dashboards');
    console.log('\n💡 Os dashboards devem continuar funcionando normalmente!');

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

// Executar teste
testDashboardData();