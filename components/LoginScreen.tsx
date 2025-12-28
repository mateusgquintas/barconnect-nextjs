'use client'
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Receipt, Lock, User as UserIcon, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { validateCredentials } from '@/lib/authService';
import { CreateUserDialog } from './CreateUserDialog';
import { useUsersDB } from '@/hooks/useUsersDB';
import { Checkbox } from './ui/checkbox';

interface LoginScreenProps {
  onLogin?: (user: User) => void | Promise<void>;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  
  const { createUser } = useUsersDB();

  // Carregar credenciais salvas (se houver)
  useEffect(() => {
    const savedUsername = localStorage.getItem('barconnect_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Validação em tempo real
  useEffect(() => {
    const newErrors: FormErrors = {};
    
    if (touched.username && username.length > 0 && username.length < 3) {
      newErrors.username = 'Usuário deve ter no mínimo 3 caracteres';
    }
    
    if (touched.password && password.length > 0 && password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
  }, [username, password, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos os campos como touched
    setTouched({ username: true, password: true });
    
    // Validação básica
    if (username.length < 3) {
      setErrors({ username: 'Usuário deve ter no mínimo 3 caracteres' });
      return;
    }
    
    if (password.length < 6) {
      setErrors({ password: 'Senha deve ter no mínimo 6 caracteres' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Validar credenciais usando o serviço de autenticação
      const validatedUser = await validateCredentials(username, password);
      
      if (!validatedUser) {
        setErrors({ 
          general: 'Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.' 
        });
        toast.error('Credenciais inválidas', {
          description: 'Usuário ou senha incorretos'
        });
        setIsLoading(false);
        return;
      }
      
      // Salvar username se "Lembrar de mim" estiver marcado
      if (rememberMe) {
        localStorage.setItem('barconnect_username', username);
      } else {
        localStorage.removeItem('barconnect_username');
      }
      
      toast.success(`Bem-vindo, ${validatedUser.name}!`, {
        description: 'Login realizado com sucesso'
      });
      
      if (onLogin) {
        await onLogin(validatedUser);
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      // Mensagens de erro específicas baseadas no tipo de erro
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      let errorDescription = 'Ocorreu um problema ao processar sua solicitação';
      
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão';
        errorDescription = 'Verifique sua internet e tente novamente';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Tempo esgotado';
        errorDescription = 'O servidor demorou para responder';
      }
      
      setErrors({ general: errorDescription });
      toast.error(errorMessage, { description: errorDescription });
      setIsLoading(false);
    }
  };

  const handleUsernameBlur = () => {
    setTouched(prev => ({ ...prev, username: true }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        {/* Header com Logo */}
        <div className="flex flex-col items-center pt-8 pb-6 px-8">
          <div 
            className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 hover:scale-105"
            role="img"
            aria-label="Logo HotelConnect"
          >
            <Receipt className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1.5 tracking-tight">HotelConnect</h1>
          <p className="text-slate-600 font-medium text-sm">Sistema de Gestão Hoteleira</p>
        </div>

        <div className="px-8 pb-8">
          {/* Alerta de Erro Geral */}
          {errors.general && (
            <div 
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-0.5">Erro de Autenticação</p>
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Campo Usuário */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className="text-sm font-semibold text-slate-900"
              >
                Usuário ou Email
              </label>
              <div className="relative">
                <UserIcon 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" 
                  aria-hidden="true"
                />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Digite seu usuário ou email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleUsernameBlur}
                  className={`pl-11 h-12 text-base transition-colors ${
                    errors.username 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-slate-300 focus-visible:border-slate-900'
                  }`}
                  required
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
              </div>
              {errors.username && (
                <p 
                  id="username-error" 
                  className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-sm font-semibold text-slate-900"
              >
                Senha
              </label>
              <div className="relative">
                <Lock 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" 
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  className={`pl-11 h-12 text-base transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-slate-300 focus-visible:border-slate-900'
                  }`}
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
              </div>
              {errors.password && (
                <p 
                  id="password-error" 
                  className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me e Esqueci Senha */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  aria-label="Lembrar de mim"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-slate-700 cursor-pointer select-none hover:text-slate-900 transition-colors"
                >
                  Lembrar de mim
                </label>
              </div>
              
              <button
                type="button"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors underline-offset-4 hover:underline"
                onClick={() => {
                  toast.info('Recuperação de senha', {
                    description: 'Entre em contato com um administrador para redefinir sua senha',
                    duration: 5000
                  });
                }}
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-base font-semibold shadow-lg hover:shadow-xl disabled:opacity-60"
              style={{ width: '100%', minWidth: '100%' }}
              disabled={isLoading || !!errors.username || !!errors.password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            {/* Divisor Elegante */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm font-medium text-slate-600 bg-white">
                  Não tem uma conta?
                </span>
              </div>
            </div>

            {/* Botão Criar Nova Conta */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-900 font-semibold shadow-sm hover:shadow-md transition-all"
              style={{ width: '100%', minWidth: '100%' }}
              onClick={() => setShowCreateUserDialog(true)}
            >
              <UserPlus className="w-5 h-5" aria-hidden="true" />
              Criar Nova Conta
            </Button>
          </form>
        </div>

        {/* Dialog de Criar Usuário */}
        <CreateUserDialog
          open={showCreateUserDialog}
          onOpenChange={setShowCreateUserDialog}
          onCreateUser={createUser}
        />
      </Card>
    </div>
  );
}