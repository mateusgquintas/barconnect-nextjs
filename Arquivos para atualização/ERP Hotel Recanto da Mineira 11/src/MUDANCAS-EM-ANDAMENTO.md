# 🚧 Mudanças em Andamento - ERP Hotelaria

> **Status:** Em progresso | **Data:** Outubro 2025

---

## ✅ Mudanças Concluídas

### 1. Título do App
- ✅ Mudado de "BarConnect" para "ERP Hotelaria" no Header

### 2. PDV - Categorias com Cores
- ✅ Sistema de cores implementado por subcategoria:
  - 🟣 **Purple** - Drinks (Caipirinha, Vodka, Whisky)
  - 🟠 **Amber** - Cervejas (Lata, Long Neck)
  - 🔵 **Blue** - Refrigerantes e Água
  - 🟡 **Yellow** - Fritas (Batata)
  - 🔴 **Red** - Carnes (Calabresa, Frango, Espetinho)
  - 🟠 **Orange** - Mistas (Petisco Misto)
  - 🟢 **Green** - Executivo (Almoço)

### 3. PDV - Registro de Login
- ✅ Campo `createdBy` adicionado nas interfaces:
  - `Comanda` - registra quem criou
  - `SaleRecord` - registra quem vendeu
- ✅ App.tsx atualizado para salvar o nome do usuário logado

### 4. Hotel - Filtros de Limpeza ✨ NOVO
- ✅ Filtro "Limpeza" adicionado
- ✅ Todos os filtros diferenciados por cores:
  - 🟢 Verde - Disponível
  - 🔴 Vermelho - Ocupado
  - 🟡 Amarelo - Limpeza
  - ⚫ Cinza - Manutenção

### 5. Hotel - Sistema de Romarias ✨ NOVO
- ✅ Filtro de romarias abaixo dos status
- ✅ Dropdown com lista de romarias
- ✅ Cada romaria tem:
  - Nome
  - Data de chegada/saída
  - Número de pessoas
  - Ônibus/Grupo
- ✅ Quartos podem ser associados a romarias
- ✅ Ícone de ônibus nos quartos com romaria

### 6. Hotel - Check-in com Dados Completos ✨ NOVO
- ✅ Dialog expandido de check-in
- ✅ Campos de informações pessoais:
  - Nome completo (obrigatório)
  - CPF
  - Telefone
  - Email
  - Observações
- ✅ Campos de hospedagem:
  - Data check-in (obrigatório)
  - Data check-out (obrigatório)
  - Romaria associada (opcional)
- ✅ Resumo do quarto e diária
- ✅ Validação de campos obrigatórios

### 7. Estoque - Botão (i) com Informações ✨ NOVO
- ✅ Ícone (i) ao lado de cada produto
- ✅ Dialog com informações completas:
  - Dados do produto (nome, categoria, preço, estoque)
  - Valor total em estoque
  - Status atual
- ✅ Gráficos implementados:
  - Gráfico de barras: Vendas mensais
  - Gráfico de linha: Saída de estoque
- ✅ Usando Recharts para visualizações

### 8. Estoque - Edição Completa ✨ NOVO
- ✅ Dialog de edição expandido
- ✅ Campos editáveis:
  - Nome do produto
  - Preço
  - Estoque
  - Categoria
  - Subcategoria
- ✅ Validação de campos obrigatórios
- ✅ Atualização em tempo real

### 9. Estoque - Adicionar Produtos ✨ NOVO
- ✅ Botão "Adicionar Produto" no topo
- ✅ Dialog com formulário completo:
  - Nome (obrigatório)
  - Preço (obrigatório)
  - Estoque inicial (obrigatório)
  - Categoria (obrigatório)
  - Subcategoria (opcional)
- ✅ Validação de campos
- ✅ Produtos adicionados aparecem na listagem

---

## 🔄 Mudanças Pendentes

### Dashboard & Financeiro

#### Responsividade e Supabase
- [ ] Verificar código de Dashboard (Bar e Controladoria)
- [ ] Verificar código de Financeiro
- [ ] Garantir que está preparado para Supabase
- [ ] Testar responsividade

---

## ⚠️ Itens para Migração Next.js + Supabase

Quando migrar para Next.js, será necessário:

### Hotel - Preparar para Banco
- [ ] Criar tabela `rooms` no Supabase
- [ ] Criar tabela `pilgrimages` no Supabase
- [ ] Criar tabela `guests` no Supabase
- [ ] Substituir `useState` por queries do Supabase

### Estoque - Preparar para Banco
- [ ] Criar tabela `products` no Supabase
- [ ] Criar tabela `sales_history` no Supabase
- [ ] Implementar queries para gráficos (dados reais)
- [ ] Substituir `useState` por queries do Supabase

### Geral
- [ ] Todos os dados mockados viram dados do Supabase
- [ ] localStorage é substituído por banco de dados
- [ ] Sincronização em tempo real entre dispositivos

---

## 📋 Próximos Passos Imediatos

### Passo 1: Continuar Mudanças Locais (React)
Vou continuar implementando as mudanças restantes no projeto React atual.

### Passo 2: Testar Localmente
Depois de todas as mudanças, vamos testar:
```bash
npm run dev
```

### Passo 3: Migrar para Next.js
Quando tudo estiver funcionando no React:
1. Seguir `ComoTornarAppFuncional.md`
2. Copiar código atualizado
3. Configurar Supabase
4. Deploy

---

## 🎯 Ordem de Implementação Recomendada

### Alta Prioridade (Fazer Agora)
1. ✅ Título (FEITO)
2. ✅ Cores nos produtos (FEITO)
3. ✅ Registro de login (FEITO)
4. [ ] **Hotel - Filtros de limpeza**
5. [ ] **Hotel - Sistema de romarias**

### Média Prioridade (Fazer Depois)
6. [ ] Estoque - Botão (i)
7. [ ] Estoque - Edição completa
8. [ ] Hotel - Check-in com dados

### Baixa Prioridade (Verificar)
9. [ ] Dashboard - Responsividade
10. [ ] Financeiro - Responsividade

---

## 🐛 Erros Encontrados

### Erro de Deploy (Não Especificado)
**Status:** Aguardando informações

**Você mencionou:** "tive esses erros na hora do deploy"

**Precisamos:** 
- Qual plataforma de deploy? (Vercel, Netlify, etc.)
- Qual mensagem de erro exata?
- Em qual passo do guia estava?

**Por favor, envie:**
1. Print do erro
2. Logs completos do terminal
3. Arquivo onde deu erro

---

## 💡 Notas Importantes

### Sobre o Projeto Atual
- Estamos modificando o **projeto React** (Figma Make)
- **NÃO** é Next.js ainda
- Imports com `@versão` funcionam aqui
- localStorage funciona normalmente

### Quando Migrar para Next.js
- Copiar **TODOS** os arquivos atualizados
- Seguir guia `ComoTornarAppFuncional.md`
- Configurar Supabase para substituir localStorage
- Ajustar imports (remover versões)

### Dados que Vão para o Supabase
Quando migrar, criar tabelas:
- `users` - Usuários (login)
- `comandas` - Comandas abertas/fechadas
- `products` - Produtos do catálogo
- `sales` - Registro de vendas
- `transactions` - Financeiro
- `rooms` - Quartos do hotel
- `pilgrimages` - Romarias (novo!)

---

## 📞 Me Avise Quando

- [ ] Quiser continuar as implementações
- [ ] Quiser testar o que já fizemos
- [ ] Encontrar erros
- [ ] Estiver pronto para migrar para Next.js
- [ ] Precisar de ajuda com deploy

---

**Última atualização:** Agora mesmo  
**Progresso:** 9/10 itens concluídos (90%)  
**Status:** 🎉 Quase completo! Falta apenas verificar Dashboard/Financeiro
