# Sugestões de Incrementos Futuros

## 1. Testes e Qualidade
- Cobertura de testes unitários para hooks (`useProductsDB`, `useTransactionsDB`, `useSalesDB`)
- Testes de integração para flows críticos (cadastro, venda, exportação)
- Testes end-to-end (Cypress/Playwright)

## 2. Experiência do Usuário
- Migração completa de feedbacks para `notify` (padronização de toasts)
- Indicador de foco visível customizado para acessibilidade (WCAG AA)
- Melhorias de responsividade para mobile
- Loading global e skeletons para listas

## 3. Performance e Infraestrutura
- Parametrizar chaves de cache para suportar filtros dinâmicos
- Adotar SWR/React Query para cache e revalidação automática
- Suporte a Service Worker para modo offline
- Otimização de bundle (análise com `next build --analyze`)

## 4. Funcionalidades
- Sincronização offline/online de vendas e transações (flag `synced`)
- Campos extras: `discount`, `serviceFee` em vendas; `source` e `tags` em transações
- Soft-delete e histórico de alterações (auditoria)
- Relatórios avançados (PDF, gráficos customizados)
- Autenticação e controle de acesso por perfil
- Integração com sistemas externos (ERP, fiscal)

## 5. DevOps e Deploy
- Pipeline CI/CD com testes automáticos
- Ambiente de staging/homologação separado
- Scripts de seed/reset para banco de dados de teste

---

Essas sugestões podem ser priorizadas conforme necessidade do negócio, feedback dos usuários ou evolução do sistema.
