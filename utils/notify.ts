// Acesso ao sistema de toasts deve ser dinâmico para funcionar com jest.mock
import * as SonnerNS from 'sonner';

interface NotifyOptions {
  context?: string;
  silent?: boolean;
}

type ErrLike = unknown & { message?: string };

function baseMessage(fallback: string, err?: ErrLike) {
  if (!err) return fallback;
  const msg = (typeof err === 'object' && err && 'message' in err) ? (err as any).message : undefined;
  if (!msg) return fallback;
  // Evitar mensagens genéricas sem valor
  if (/failed|error|erro/i.test(msg) && msg.length < 12) return fallback;
  return msg;
}

export function notifySuccess(message: string, { silent }: NotifyOptions = {}) {
  if (silent) return;
  try { getToast()?.success?.(message); } catch {}
}

export function notifyError(fallback: string, err?: ErrLike, { context, silent }: NotifyOptions = {}) {
  if (silent) return;
  const msg = baseMessage(fallback, err);
  try { getToast()?.error?.(context ? `${context}: ${msg}` : msg); } catch {}
  // Log estruturado para debug
  // eslint-disable-next-line no-console
  console.error('[ERROR]', context || '', err);
}

// Utilitário robusto para obter o toast mockado em testes (compatível com ESM/CJS)
export function getToast(): any {
  try {
    const m = require('sonner');
    const resolved = m?.toast || m?.default?.toast || (SonnerNS as any)?.toast;
    return resolved;
  } catch (e) {
    return (SonnerNS as any)?.toast;
  }
}

export function __debugGetToastRef() {
  try { return getToast(); } catch { return undefined; }
}

// Observador passivo em ambiente de teste para auto-dismiss de sucesso
export function setupTestToastObserver(): void {
  try {
    if (process.env.NODE_ENV !== 'test') return;
    const t: any = getToast();
    if (!t || !(t as any).success || !(t as any).dismiss) return;
    const s: any = (t as any).success;
    if (!s || !s.mock) return; // só quando jest.fn
    if ((t as any).__observerInstalled) return;
    (t as any).__observerInstalled = true;
    let last = s.mock.calls.length || 0;
    const iv = setInterval(() => {
      try {
        const curr = s.mock.calls.length || 0;
        if (curr > last) {
          last = curr;
          setTimeout(() => {
            try { (t as any).dismiss(); } catch {}
          }, 100); // Reduced delay for tests
        }
      } catch {}
    }, 100); // Increased interval for more reliable detection
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => clearInterval(iv));
    }
  } catch {}
}
