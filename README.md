This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy (Vercel)

1) Configure as variáveis de ambiente no Vercel (Project Settings → Environment Variables):
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2) Conecte este repositório ao Vercel e defina:
	- Build Command: `npm run build`
	- Output Directory: `.next`
	- Node.js: 20+

3) Este repositório contém `.vercelignore` para evitar enviar testes/rotas de debug ao deploy.

4) Após o build, teste as rotas principais e verifique se não há logs de erro no console do Vercel.

## CI (GitHub Actions)

Há um workflow em `.github/workflows/ci.yml` que executa:
- install → lint (não bloqueia por warnings) → typecheck → test → build

Se quiser rodar o build na CI com suas credenciais reais, crie os Secrets no repositório (Settings → Secrets and variables → Actions → New repository secret):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

O workflow já usa esses secrets quando presentes.

## Ambiente local (.env)

Crie um arquivo `.env.local` na raiz copiando de `.env.example` e preencha os valores:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Em desenvolvimento, se as variáveis não estiverem definidas, o projeto usa valores mock para evitar falhas em testes.
