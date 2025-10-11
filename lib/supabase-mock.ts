// Mock do Supabase para desenvolvimento local quando as env vars não estão disponíveis

export const createMockSupabaseClient = () => {
  const mockData = {
    products: [
      { id: '1', name: 'Coca-Cola 350ml', price: 5.50, stock: 100, category: 'bebidas' },
      { id: '2', name: 'Água Mineral 500ml', price: 3.00, stock: 995, category: 'bebidas' },
      { id: '3', name: 'Água Tônica', price: 5.00, stock: 997, category: 'bebidas' },
      { id: '4', name: 'Almoço Executivo', price: 20.00, stock: 998, category: 'almoco' },
      { id: '5', name: 'Caipirinha', price: 15.00, stock: 991, category: 'bebidas' },
      { id: '6', name: 'Cerveja Lata', price: 5.00, stock: 985, category: 'bebidas' },
      { id: '7', name: 'Cerveja Premium', price: 8.00, stock: 987, category: 'bebidas' },
    ],
    transactions: [
      { 
        id: 't1', 
        type: 'income', 
        description: 'Venda Mesa 1', 
        amount: 45.50, 
        category: 'Vendas', 
        date: '10/10/2025',
        time: '14:30',
        created_at: new Date('2025-10-10T14:30:00').toISOString() 
      },
      { 
        id: 't2', 
        type: 'expense', 
        description: 'Compra Bebidas', 
        amount: 200.00, 
        category: 'Estoque', 
        date: '09/10/2025',
        time: '10:15',
        created_at: new Date('2025-10-09T10:15:00').toISOString() 
      },
    ],
    comandas: [
      { 
        id: 'cmd-1', 
        number: 123, 
        customer_name: 'João Silva', 
        status: 'open', 
        created_at: new Date('2025-10-11T14:30:00').toISOString(),
        comanda_items: []
      },
      { 
        id: 'cmd-2', 
        number: 124, 
        customer_name: 'Maria Santos', 
        status: 'closed', 
        created_at: new Date('2025-10-11T13:15:00').toISOString(),
        comanda_items: []
      },
    ]
  };

  const createChain = (tableName: string) => {
    const chain: any = {
      select: () => chain,
        order: (column: string, options?: { ascending?: boolean }) => {
          let data = [...(mockData as any)[tableName] || []];
        
          if (column === 'created_at') {
            data.sort((a, b) => {
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              return options?.ascending ? dateA - dateB : dateB - dateA;
            });
          }
        
          // Certificar que retorna uma Promise
          const result = Promise.resolve({ data, error: null });
          // Adicionar métodos de chain caso necessário
          (result as any).select = () => result;
          (result as any).order = chain.order;
          return result;
        },
      insert: (payload: any) => {
        const newItem = Array.isArray(payload) ? payload[0] : payload;
        const id = `${tableName.slice(0, 3)}_${Date.now()}`;
        const item = {
          id,
          ...newItem,
          created_at: new Date().toISOString()
        };
        
        (mockData as any)[tableName].unshift(item);
        
        return {
          select: () => ({
            single: () => Promise.resolve({ data: item, error: null })
          })
        };
      },
      update: (payload: any) => ({
        eq: (field: string, value: any) => {
          const items = (mockData as any)[tableName];
          const index = items.findIndex((item: any) => item[field] === value);
          if (index !== -1) {
            items[index] = { ...items[index], ...payload };
          }
          return Promise.resolve({ error: null });
        }
      }),
      delete: () => ({
        eq: (field: string, value: any) => {
          const items = (mockData as any)[tableName];
          const index = items.findIndex((item: any) => item[field] === value);
          if (index !== -1) {
            items.splice(index, 1);
          }
          return Promise.resolve({ error: null });
        }
      }),
      eq: (field: string, value: any) => {
        const items = (mockData as any)[tableName];
        const data = items.filter((item: any) => item[field] === value);
        return Promise.resolve({ data, error: null });
      },
      single: () => {
        const items = (mockData as any)[tableName];
        const data = items[0] || null;
        return Promise.resolve({ data, error: null });
      }
    };
    
    return chain;
  };

  return {
    from: (tableName: string) => createChain(tableName)
  };
};