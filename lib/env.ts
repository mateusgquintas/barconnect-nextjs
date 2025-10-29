// Lightweight runtime validation for critical environment variables.
// Avoids adding external deps (like zod) while providing helpful errors in production.

type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string | undefined;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined;
  NEXT_PUBLIC_USE_SUPABASE_MOCK?: string | undefined;
  NODE_ENV?: string | undefined;
};

const raw: Env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_USE_SUPABASE_MOCK: process.env.NEXT_PUBLIC_USE_SUPABASE_MOCK,
  NODE_ENV: process.env.NODE_ENV,
};

function assertPresent(name: keyof Env, value: string | undefined) {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
}

// In production, hard-fail if required envs are missing. In dev/test, only warn.
export function getValidatedEnv() {
  const isProd = raw.NODE_ENV === 'production';
  const missing: string[] = [];
  if (!raw.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!raw.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missing.length) {
    const msg = `Required env vars missing: ${missing.join(', ')}`;
    if (isProd) {
      throw new Error(msg);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ ${msg} (using mock where applicable)`);
    }
  }

  return raw;
}

export const env = getValidatedEnv();
