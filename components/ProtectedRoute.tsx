import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();


  if (!user) return null;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Negado</h2>
          <p className="text-slate-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
