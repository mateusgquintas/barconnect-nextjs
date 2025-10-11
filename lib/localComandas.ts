// Funções auxiliares para comandas no localStorage
import { Comanda } from '@/types';

const LOCAL_COMANDAS_KEY = 'comandas_local';

export function getLocalComandas(): Comanda[] {
  try {
    const stored = localStorage.getItem(LOCAL_COMANDAS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalComandas(comandas: Comanda[]): void {
  try {
    localStorage.setItem(LOCAL_COMANDAS_KEY, JSON.stringify(comandas));
  } catch (error) {
    console.error('Erro ao salvar comandas no localStorage:', error);
  }
}

export function updateLocalComanda(comandaId: string, updatedComanda: Partial<Comanda>): void {
  const comandas = getLocalComandas();
  const index = comandas.findIndex(c => c.id === comandaId);
  
  if (index >= 0) {
    comandas[index] = { ...comandas[index], ...updatedComanda };
    saveLocalComandas(comandas);
  }
}

export function deleteLocalComanda(comandaId: string): void {
  const comandas = getLocalComandas();
  const filtered = comandas.filter(c => c.id !== comandaId);
  saveLocalComandas(filtered);
}