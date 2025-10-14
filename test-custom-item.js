#!/usr/bin/env node

/**
 * Script para testar funcionalidades do Item Personalizado
 * Execute: node test-custom-item.js
 */

console.log('🧪 Teste de Item Personalizado - BarConnect');
console.log('==========================================\n');

// Simulação de dados de teste
const mockCustomItem = {
  id: `custom-${Date.now()}`,
  name: 'Taxa de Serviço - 10%',
  price: 5.50,
  stock: 999,
  category: 'outros'
};

const mockSaleItem = {
  sale_id: 'test-sale-123',
  product_id: null, // Item personalizado
  product_name: mockCustomItem.name,
  product_price: mockCustomItem.price,
  quantity: 1,
  is_custom_item: true,
  custom_category: 'outros'
};

console.log('📦 Item personalizado criado:');
console.log(JSON.stringify(mockCustomItem, null, 2));

console.log('\n💾 Sale item correspondente:');
console.log(JSON.stringify(mockSaleItem, null, 2));

console.log('\n✅ Características do item personalizado:');
console.log('- product_id: null (não vinculado ao estoque)');
console.log('- is_custom_item: true');
console.log('- custom_category: outros');
console.log('- Estoque não será debitado pelo trigger');
console.log('- Total da venda: R$', (mockSaleItem.product_price * mockSaleItem.quantity).toFixed(2));

console.log('\n🔧 Para aplicar no banco:');
console.log('1. Execute o patch: database/patch_custom_items_v4.sql');
console.log('2. Teste uma venda com item personalizado');
console.log('3. Verifique que o estoque não foi alterado');
console.log('4. Confirme o registro na tabela sales e sale_items');

console.log('\n🎯 Próximos passos de teste:');
console.log('- Criar item personalizado no PDV');
console.log('- Finalizar venda (direto ou comanda)');
console.log('- Verificar que trigger não debita estoque');
console.log('- Confirmar dados na view sales_detailed');