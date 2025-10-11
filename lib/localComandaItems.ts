// Funções utilitárias para centralizar acesso aos itens de comanda no localStorage

export function getComandaItems(comandaId: string): any[] {
  try {
    const key = `comanda_items_${comandaId}`;
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setComandaItems(comandaId: string, items: any[]): void {
  try {
    const key = `comanda_items_${comandaId}`;
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Silencioso
  }
}

export function removeComandaItems(comandaId: string): void {
  try {
    const key = `comanda_items_${comandaId}`;
    window.localStorage.removeItem(key);
  } catch {
    // Silencioso
  }
}
