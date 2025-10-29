'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DebugPageWrapperProps {
  children: React.ReactNode;
  title: string;
}

/**
 * Wrapper para páginas de debug/admin
 * Requer autenticação e redireciona para home se não autenticado
 * 
 * Páginas protegidas:
 * - /debug-sales
 * - /debug-schema
 * - /debug-supabase
 * - /test-dashboard
 * - /test-db
 */
export default function DebugPageWrapper({ children, title }: DebugPageWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      console.warn('🚫 Acesso negado a página de debug - redirecionando para home');
      router.push('/');
    }
  }, [user, router]);

  // Não renderizar conteúdo se não autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Renderizar página de debug
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                🔧 Página de Debug/Admin
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Esta página é destinada apenas para desenvolvimento e administração.</p>
                <p className="mt-1">Usuário autenticado: <strong>{user.username}</strong> ({user.role})</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
