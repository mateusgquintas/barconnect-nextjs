// Central Supabase mock factory for tests
// Provides chainable minimal API used by hooks/services.

export interface SupabaseTableMockConfig<T=any> {
  table: string;
  rows: T[];
}

export function createSupabaseMock(tables: Record<string, any[]>) {
  const insertLog: any[] = [];

  function tableApi(table: string) {
    return {
      _table: table,
      _select: '*',
      select() { return this; },
      order() { return Promise.resolve({ data: tables[table] ?? [], error: null }); },
      insert(payload: any) {
        const row = Array.isArray(payload) ? payload[0] : payload;
        const id = row.id || `mock_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        insertLog.push({ table, row: { ...row, id } });
        tables[table] = [{ id, ...row }, ...(tables[table]||[])];
        return Promise.resolve({ data: [{ id }], error: null });
      },
      update() { return this; },
      eq() { return Promise.resolve({ error: null }); },
    };
  }

  return {
    supabase: {
      from(table: string) { return tableApi(table); }
    },
    insertLog,
    tables,
  };
}
