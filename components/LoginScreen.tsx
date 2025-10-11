'use client'
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Receipt, Lock, User as UserIcon } from 'lucide-react';
import { User } from '@/types/user';
import { getToast } from '@/utils/notify';
import { validateCredentials } from '@/lib/authService';

interface LoginScreenProps {
  onLogin: (user: User) => void | Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validar credenciais usando o serviço de autenticação
      const validatedUser = validateCredentials(username, password);
      
      if (!validatedUser) {
        try { getToast()?.error?.('Usuário ou senha incorretos'); } catch {}
        return;
      }

      // Login bem-sucedido
      const maybePromise = onLogin(validatedUser);
      if (maybePromise && typeof (maybePromise as any).then === 'function') {
        await (maybePromise as Promise<void>);
      }
      
      try { getToast()?.success?.(`Bem-vindo, ${validatedUser.name}!`); } catch {}
    } catch (err) {
      // Em caso de falha na autenticação, apenas exibir feedback
      try { getToast()?.error?.('Erro ao fazer login. Tente novamente.'); } catch {}
    } finally {
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
            <label htmlFor="username" className="text-slate-700 mb-2 block">Usuário</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
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
                type="password"
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
            className="w-full h-12 bg-slate-900 hover:bg-slate-800"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

      </Card>
    </div>
  );
}