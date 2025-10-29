'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

interface PermissionConfig {
  // Abas/páginas
  pdv: boolean;
  dashboard: boolean;
  estoque: boolean;
  financeiro: boolean;
  hotel: boolean;
  
  // Funcionalidades
  createComanda: boolean;
  directSale: boolean;
  viewReports: boolean;
  manageInventory: boolean;
  viewTransactions: boolean;
  createTransaction: boolean;
  exportData: boolean;
  manageCortesia: boolean;
  viewControladoria: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, PermissionConfig> = {
  admin: {
    // Admin tem acesso completo
    pdv: true,
    dashboard: true,
    estoque: true,
    financeiro: true,
    hotel: true,
    
    createComanda: true,
    directSale: true,
    viewReports: true,
    manageInventory: true,
    viewTransactions: true,
    createTransaction: true,
    exportData: true,
    manageCortesia: true,
    viewControladoria: true,
  },
  operator: {
    // Operador tem acesso básico ao PDV
    pdv: true,
    dashboard: false,
    estoque: false,
    financeiro: false,
    hotel: false,
    
    createComanda: true,
    directSale: true,
    viewReports: false,
    manageInventory: false,
    viewTransactions: false,
    createTransaction: false,
    exportData: false,
    manageCortesia: false,
    viewControladoria: false,
  },
};

export function usePermissions() {
  const { user } = useAuth();
  
  if (!user) {
    // Usuário não logado - sem permissões
    return Object.keys(ROLE_PERMISSIONS.operator).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as PermissionConfig
    );
  }
  
  return ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.operator;
}

export function useHasPermission(permission: keyof PermissionConfig): boolean {
  const permissions = usePermissions();
  return permissions[permission];
}

export function useCanAccessPage(page: 'pdv' | 'dashboard' | 'estoque' | 'financeiro' | 'hotel'): boolean {
  return useHasPermission(page);
}