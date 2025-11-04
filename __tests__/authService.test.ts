// Teste simples para verificar autenticação
// NOTA: Estes testes requerem Supabase Auth funcionando e são complexos de mockar
// A autenticação é testada de forma mais efetiva nos testes de integração e E2E
import { validateCredentials } from '../lib/authService';

describe('AuthService', () => {
  // Skip testes que dependem de Supabase Auth real
  // TODO: Implementar testes de integração com banco de teste
  it.skip('deve validar credenciais do admin', async () => {
    const user = await validateCredentials('admin', 'admin123');
    expect(user).toBeTruthy();
    expect(user?.role).toBe('admin');
  });

  it.skip('deve validar credenciais do operador', async () => {
    const user = await validateCredentials('operador', 'operador123');
    expect(user).toBeTruthy();
    expect(user?.role).toBe('operator');
  });

  it('deve rejeitar credenciais inválidas', async () => {
    const user = await validateCredentials('invalid', 'invalid');
    expect(user).toBeNull();
  });
});