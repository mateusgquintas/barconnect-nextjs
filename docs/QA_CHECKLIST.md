# Checklist de QA Manual

## Cadastro e Edição de Produtos
- [x] Adicionar novo produto (todos os campos) <!-- Cobertura automatizada (__tests__/useProductsDB.comprehensive.test.ts, ProductFormDialog.integration.test.tsx) -->
- [x] Editar produto existente (nome, preço, estoque, categoria) <!-- Cobertura automatizada (__tests__/useProductsDB.comprehensive.test.ts, ProductFormDialog.integration.test.tsx) -->
- [x] Atualizar apenas estoque <!-- Cobertura automatizada (__tests__/useProductsDB.comprehensive.test.ts) -->
- [x] Verificar feedback de sucesso/erro <!-- Cobertura automatizada (__tests__/useProductsDB.comprehensive.test.ts, ProductFormDialog.integration.test.tsx) -->
- [x] Verificar atualização automática da lista <!-- Cobertura automatizada (__tests__/useProductsDB.comprehensive.test.ts, ProductFormDialog.integration.test.tsx) -->

## Vendas e Transações
- [x] Registrar venda direta <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->
- [x] Registrar venda por comanda <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->
- [x] Conferir geração automática de transação financeira <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->
- [x] Conferir vendas em Entradas (Financeiro) <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->
- [x] Registrar nova entrada manual <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->
- [x] Registrar nova saída manual <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->
- [x] Conferir totais e saldo <!-- Cobertura automatizada (__tests__/SalesTransactions.comprehensive.test.tsx) -->

## Exportação
- [x] Exportar dados do Financeiro para Excel <!-- Cobertura automatizada (__tests__/Export.comprehensive.test.tsx) -->
- [ ] Verificar a exportação de dados em diferentes formatos (CSV, Excel).
- [ ] Validar a integridade dos dados exportados.

## Automatizar testes de Exportação
- [ ] Automatizar testes de Exportação
  - Cobrir: exportação do financeiro para Excel, conferir planilha gerada, verificar se os dados estão corretos e formatados adequadamente, garantir que o arquivo seja baixado sem erros.
  - Criar testes automatizados para exportação.
- Testes a serem implementados:
  - Verificar se a planilha gerada contém todos os dados necessários.
  - Validar o formato da planilha (ex: .xlsx).
  - Conferir se a exportação é realizada sem erros.

## Testes de Exportação
- [ ] Verificar se a exportação do financeiro para Excel está funcionando corretamente.
- [ ] Conferir se a planilha gerada contém todos os dados esperados.
- [ ] Validar o formato da planilha gerada (cabeçalhos, tipos de dados).
- [ ] Verificar se a funcionalidade de exportação está acessível a partir da interface do usuário.
- [ ] Testar a exportação de diferentes formatos (CSV, PDF, etc.).
- [ ] Validar que os dados exportados estão corretos e completos.
- [ ] Garantir que a exportação não cause erros ou falhas no sistema.
- [ ] Testar a performance da exportação em grandes volumes de dados.

## Automatizar testes de Acessibilidade
- [ ] Automatizar testes de Acessibilidade
  - Cobrir: navegação por teclado, foco, leitor de tela, aria-live, skip link, verificar se todos os elementos interativos são acessíveis e se as mensagens de erro são lidas corretamente pelo leitor de tela.
  - Criar testes automatizados de acessibilidade.
- Testes a serem implementados:
  - Verificar se todos os elementos interativos são acessíveis via teclado.
  - Validar se o foco é gerenciado corretamente durante a navegação.
  - Conferir se o conteúdo é lido corretamente por leitores de tela.

## Testes de Acessibilidade
- [ ] Testar a navegação por teclado em todos os componentes.
- [ ] Verificar se o foco está sendo gerenciado corretamente.
- [ ] Testar a compatibilidade com leitores de tela.
- [ ] Validar o uso de aria-live para atualizações dinâmicas.
- [ ] Conferir a presença de skip links para navegação eficiente.
- [ ] Implementar testes de acessibilidade usando jest-axe.
- [ ] Verificar se todos os componentes da interface estão acessíveis.
- [ ] Garantir que as mensagens de erro e feedback sejam acessíveis.
- [ ] Testar a navegação por teclado em toda a aplicação.

## Acessibilidade
- [x] Navegar por teclado (tab, shift+tab) em todas as telas <!-- Cobertura automatizada (__tests__/Accessibility.comprehensive.test.tsx) -->
- [x] Foco visível em botões e campos <!-- Cobertura automatizada (__tests__/Accessibility.comprehensive.test.tsx) -->
- [x] Leitor de tela lê títulos, botões e feedbacks corretamente <!-- Cobertura automatizada (__tests__/Accessibility.comprehensive.test.tsx) -->
- [x] Mensagens de loading/erro são anunciadas (aria-live) <!-- Cobertura automatizada (__tests__/Accessibility.comprehensive.test.tsx) -->
- [x] Skip link funciona no Financeiro <!-- Cobertura automatizada (__tests__/Accessibility.comprehensive.test.tsx) -->

## Performance e Cache
- [x] Alternar rapidamente entre abas (Estoque/Financeiro) sem recarregar dados desnecessariamente <!-- Cobertura automatizada (__tests__/Performance.comprehensive.test.tsx) -->
- [x] Conferir atualização após adicionar/editar (cache é invalidado) <!-- Cobertura automatizada (__tests__/Performance.comprehensive.test.tsx) -->

## Feedback e Notificações
- [x] Toasts de sucesso/erro aparecem e somem automaticamente <!-- Cobertura automatizada (__tests__/Feedback.comprehensive.test.tsx) -->
- [x] Mensagens são claras e contextualizadas <!-- Cobertura automatizada (__tests__/Feedback.comprehensive.test.tsx) -->

## Responsividade
- [ ] Testar em desktop, tablet e mobile (layout, botões, tabelas)

## Erros e Limites
- [ ] Tentar cadastrar produto com campos obrigatórios vazios (erro)
- [ ] Tentar registrar venda com valor zero (erro)
- [ ] Testar limites de estoque baixo (alerta crítico)

## Práticas Recomendadas para Sustentabilidade em Testes

- **Documentação Clara**: Assegure-se de que todos os testes estejam bem documentados, incluindo o propósito de cada teste e como executá-los.
- **Estrutura de Testes**: Organize seus testes em uma estrutura clara e lógica, separando testes unitários, de integração e de ponta a ponta.
- **Automação de Testes**: Continue a automatizar testes, como os de exportação e acessibilidade, para garantir que sejam executados regularmente.
- **Integração Contínua**: Configure um pipeline de integração contínua (CI) para executar testes automaticamente em cada commit ou pull request.
- **Revisão de Código**: Implemente revisões de código para garantir que as práticas de teste sejam seguidas e que o código esteja sempre em conformidade com os padrões.
- **Atualizações Regulares**: Mantenha suas dependências de teste atualizadas, como o `jest-axe`, para aproveitar melhorias e correções de bugs.
- **Feedback e Iteração**: Colete feedback regularmente sobre a eficácia dos testes e faça iterações conforme necessário.

## Práticas Sustentáveis de Teste

- **Documentação Clara**: Assegure-se de que todos os testes estejam bem documentados, incluindo o propósito de cada teste e como executá-los.
- **Revisões de Código**: Estabeleça um processo de revisão de código para os testes, garantindo que todos os testes sejam revisados por pelo menos uma outra pessoa antes de serem mesclados.
- **Integração Contínua**: Configure um pipeline de integração contínua (CI) para executar testes automaticamente em cada push ou pull request.
- **Cobertura de Testes**: Monitore a cobertura de testes e defina metas para garantir que uma porcentagem significativa do código esteja coberta por testes.
- **Atualizações Regulares**: Revise e atualize os testes regularmente para garantir que eles permaneçam relevantes e eficazes à medida que o código evolui.
- **Treinamento da Equipe**: Proporcione treinamento contínuo para a equipe sobre as melhores práticas de teste e novas ferramentas que possam ser úteis.
- **Feedback do Usuário**: Incorpore feedback dos usuários sobre a funcionalidade e a usabilidade, e use isso para guiar a criação de novos testes.

---

Marque cada item conforme for validando. Adapte conforme novas features ou ajustes futuros.
