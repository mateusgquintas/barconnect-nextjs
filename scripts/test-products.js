// Script para testar produtos e subcategorias
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const testProducts = [
  { name: 'Cerveja Lata Teste', price: 6.00, stock: 100, category: 'bebidas', subcategory: 'cerveja' },
  { name: 'Caipirinha Teste', price: 22.00, stock: 50, category: 'bebidas', subcategory: 'drink' },
  { name: 'Porção Batata Teste', price: 25.00, stock: 30, category: 'porcoes', subcategory: 'frita' },
  { name: 'Almoço Executivo Teste', price: 40.00, stock: 20, category: 'almoco', subcategory: 'executivo' },
];

async function testAddProducts() {
  console.log('🧪 Testando adição de produtos com subcategorias...');
  
  for (const product of testProducts) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erro ao adicionar ${product.name}:`, error);
      } else {
        console.log(`✅ Produto adicionado: ${product.name} - Subcategoria: ${product.subcategory}`);
      }
    } catch (err) {
      console.error(`💥 Erro fatal ao adicionar ${product.name}:`, err);
    }
  }
}

async function checkProducts() {
  console.log('\n📋 Verificando produtos no banco...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category, subcategory, name');
    
    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }
    
    console.log(`\n📊 Total de produtos: ${data.length}\n`);
    
    // Agrupar por categoria e subcategoria
    const grouped = {};
    data.forEach(product => {
      const category = product.category || 'sem categoria';
      const subcategory = product.subcategory || 'sem subcategoria';
      
      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][subcategory]) grouped[category][subcategory] = [];
      
      grouped[category][subcategory].push(product);
    });
    
    Object.keys(grouped).forEach(category => {
      console.log(`🏷️  ${category.toUpperCase()}`);
      Object.keys(grouped[category]).forEach(subcategory => {
        console.log(`   📁 ${subcategory}: ${grouped[category][subcategory].length} produtos`);
        grouped[category][subcategory].forEach(product => {
          console.log(`      - ${product.name} (R$ ${product.price})`);
        });
      });
      console.log('');
    });
    
  } catch (err) {
    console.error('💥 Erro fatal ao verificar produtos:', err);
  }
}

// Executar testes
async function runTests() {
  await checkProducts();
  
  if (process.argv.includes('--add-test-data')) {
    await testAddProducts();
    console.log('\n⏳ Aguardando 2 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await checkProducts();
  }
}

runTests().catch(console.error);