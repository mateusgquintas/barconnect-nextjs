// Teste de venda direta - Debug do erro
// Execute: node test-direct-sale-debug.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase com as variáveis corretas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectSale() {
  console.log('🧪 Testando venda direta...');

  try {
    // 1. Primeiro, buscar um produto real do sistema
    console.log('🔍 Buscando produtos no sistema...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .limit(1);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('ℹ️ Nenhum produto encontrado, testando apenas com item customizado');
    }

    const realProduct = products?.[0];
    console.log('📦 Produto encontrado:', realProduct);

    // 2. Simular items da venda direta
    const mockItems = [];
    
    // Adicionar produto real se existir
    if (realProduct) {
      mockItems.push({
        product: {
          id: realProduct.id,
          name: realProduct.name,
          price: realProduct.price,
          stock: realProduct.stock
        },
        quantity: 1
      });
    }

    // Adicionar item customizado
    mockItems.push({
      product: {
        id: 'custom-456', // Item customizado
        name: 'Item Personalizado',
        price: 25.00,
        category: 'bebidas'
      },
      quantity: 1
    });

    console.log('🛒 Items da venda:', mockItems.map(i => ({ name: i.product.name, price: i.product.price })));

    // 3. Calcular total
    const total = mockItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    console.log('💰 Total calculado:', total);

    // 4. Criar venda
    const saleData = {
      comanda_id: null,
      sale_type: 'direct',
      total,
      payment_method: 'cash',
      is_courtesy: false,
      customer_name: null,
      items_snapshot: mockItems.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price
        },
        quantity: item.quantity
      })),
      notes: 'Teste de venda direta'
    };

    console.log('💾 Criando venda:', saleData);

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert(saleData)
      .select()
      .single();

    if (saleError) {
      console.error('❌ Erro ao criar venda:', saleError);
      return;
    }

    console.log('✅ Venda criada:', sale.id);

    // 5. Criar itens da venda
    const saleItems = mockItems.map((item, index) => {
      const isCustomItem = !item.product.id || item.product.id.startsWith('custom-');
      
      const saleItem = {
        sale_id: sale.id,
        product_id: isCustomItem ? null : item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        is_custom_item: isCustomItem,
        custom_category: isCustomItem ? (item.product.category || 'outros') : null
      };

      console.log(`📦 Item ${index + 1}:`, {
        name: saleItem.product_name,
        price: saleItem.product_price,
        quantity: saleItem.quantity,
        isCustom: saleItem.is_custom_item,
        productId: saleItem.product_id
      });

      return saleItem;
    });

    console.log('💾 Inserindo itens:', saleItems);

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error('❌ Erro detalhado ao criar itens:', {
        error: itemsError,
        code: itemsError.code,
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint
      });
      
      // Reverter venda
      await supabase.from('sales').delete().eq('id', sale.id);
      console.log('🔄 Venda revertida');
      return;
    }

    console.log('✅ Itens criados com sucesso!');
    console.log('🎉 Teste de venda direta concluído!');

    // Limpar dados de teste
    await supabase.from('sales').delete().eq('id', sale.id);
    console.log('🧹 Dados de teste removidos');

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

// Executar teste
testDirectSale();