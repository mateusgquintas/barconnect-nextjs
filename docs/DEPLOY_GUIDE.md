# Guia de Deploy & Operação

## Pré-requisitos
- Node.js 18+ e npm instalados
- Conta e projeto no Supabase configurados
- Variáveis de ambiente `.env.local` preenchidas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Build e Deploy Local
```powershell
npm install
npm run build
npm start
```
Acesse: http://localhost:3000

## Deploy em Produção (Vercel, Render, etc.)
1. Suba o código para o repositório (GitHub/GitLab)
2. Configure as variáveis de ambiente no painel do serviço
3. Aponte para o branch principal (`master` ou `main`)
4. Pipeline CI (GitHub Actions) valida Lint / Test / Build
5. Somente após CI verde o provedor (ex: Vercel) realizará o build final

### Variáveis de Ambiente (Checklist)
| Nome | Escopo | Descrição |
|------|--------|-----------|
| NEXT_PUBLIC_SUPABASE_URL | Public | URL do projeto Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | Chave anônima Supabase |
| (Futuro) SUPABASE_SERVICE_ROLE_KEY | Server | Operações privilegiadas (NÃO expor no cliente) |

### CI (Arquivo `.github/workflows/ci.yml`)
Passos executados:
1. `npm ci`
2. `npm run lint`
3. `npm run test:coverage` (gera artifact `coverage/`)
4. `npm run build`

Falha em qualquer etapa bloqueia merge (ao ativar branch protection).

### Smoke Test Pós-Deploy
Executar rapidamente em produção ou preview:
1. Abrir página inicial sem erros no console.
2. Criar produto pela modal (ver na lista imediatamente).
3. Registrar uma venda direta e confirmar em Transações.
4. Exportar Excel e verificar arquivo não vazio.
5. Atualizar estoque e conferir valor atualizado.
6. Navegar com Tab pelo formulário (foco visível e ordem lógica).

### Rollback
1. Identificar commit anterior estável (git log / tag).
2. Criar hotfix branch: `git checkout -b rollback/<hash>`.
3. Reverter commit problemático: `git revert <hash>` (ou cherry-pick dos bons).
4. Abrir PR com título "Rollback: <contexto>".
5. Após CI verde, merge e aguardar novo deploy.

### Estratégia de Branches (Sugestão)
| Branch | Propósito |
|--------|-----------|
| main/master | Produção estável |
| develop (opcional) | Integração contínua antes de produção |
| feature/* | Features isoladas |
| fix/* | Correções rápidas |
| chore/* | Infra/ajustes não funcionais |

### Política de Qualidade (Sugestão Futura)
- Cobertura mínima: 50% linhas (expandir gradualmente para 70%+)
- Proibir merges com lint errors
- Rótulo `needs-tests` para PR sem testes de lógica

### Observabilidade (Futuro)
- Integrar Sentry ou LogRocket para erros runtime
- Health endpoint (quando API própria existir) para monitoramento

## Dicas
- Para homologação, use um banco Supabase separado
- Sempre rode `npm run build` local antes de abrir PR grande
- Ajuste logs em hooks/serviços para nível `debug` (futuro toggle)
- Use `test:coverage` antes de abrir PR crítico

## Troubleshooting
- Erros de conexão: revise as variáveis de ambiente
- Falha no build: rode `npm run build` localmente e corrija avisos/erros
- Problemas de cache: limpe cache do navegador e reinicie o servidor

---

Adapte conforme o provedor de deploy escolhido. Para dúvidas, consulte documentação do Next.js, Supabase e Actions.
