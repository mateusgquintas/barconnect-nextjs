'use client'
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Receipt, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import { User } from '@/types/user';
import { getToast } from '@/utils/notify';
import { validateCredentials } from '@/lib/authService';
import { CreateUserDialog } from './CreateUserDialog';
import { useUsersDB } from '@/hooks/useUsersDB';

interface LoginScreenProps {
  onLogin?: (user: User) => void | Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  
  const { createUser } = useUsersDB();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validar credenciais usando o serviço de autenticação (busca do banco primeiro)
      const validatedUser = await validateCredentials(username, password);
      if (!validatedUser) {
        try { getToast()?.error?.('Usuário ou senha incorretos'); } catch {}
        setIsLoading(false);
        return;
      }
      try { getToast()?.success?.(`Bem-vindo, ${validatedUser.name}!`); } catch {}
      if (onLogin) await onLogin(validatedUser);
    } catch (err) {
      // Em caso de falha na autenticação, apenas exibir feedback
      try { getToast()?.error?.('Erro ao fazer login. Tente novamente.'); } catch {}
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">BarConnect</h1>
          <p className="text-slate-600 text-center">Sistema de Gestão</p>
        </div>

  <form onSubmit={handleSubmit} className="space-y-4" role="form">
          <div>
            <label htmlFor="username" className="text-slate-700 mb-2 block">Usuário ou Email</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Digite seu usuário ou email"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-slate-700 mb-2 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800"
            style={{ height: '48px', width: '100%', minWidth: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-base"
            style={{ height: '48px', width: '100%', minWidth: '100%' }}
            onClick={() => setShowCreateUserDialog(true)}
          >
            <UserPlus className="w-5 h-5" />
            <span>Criar Usuário</span>
          </Button>
        </form>

        <CreateUserDialog
          open={showCreateUserDialog}
          onOpenChange={setShowCreateUserDialog}
          onCreateUser={createUser}
        />
      </Card>
    </div>
  );
}