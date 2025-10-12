// Teste simples para verificar autenticação
import { validateCredentials } from '../lib/authService';

describe('AuthService', () => {
  it('deve validar credenciais do admin', async () => {
    const user = await validateCredentials('admin', 'admin123');
    expect(user).toBeTruthy();
    expect(user?.role).toBe('admin');
  });

  it('deve validar credenciais do operador', async () => {
    const user = await validateCredentials('operador', 'operador123');
    expect(user).toBeTruthy();
    expect(user?.role).toBe('operator');
  });

  it('deve rejeitar credenciais inválidas', async () => {
    const user = await validateCredentials('invalid', 'invalid');
    expect(user).toBeNull();
  });
});