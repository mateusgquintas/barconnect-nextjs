# 🏨 BarConnect - ERP para Hotéis de Pequeno Porte

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Sistema completo de gestão para hotéis pequenos com PDV, Dashboard, Estoque, Financeiro e Gestão de Quartos

[Demo](#) · [Documentação](./ComoTornarAppFuncional.md) · [Reportar Bug](#)

</div>

---

## 🚀 COMECE AQUI!

**👉 Primeira vez? Leia:** [COMECE-AQUI.md](./COMECE-AQUI.md)

**📖 Guias Rápidos:**
- 🏃 [Rodar em 5 minutos](./GUIA-RAPIDO-DEPLOY.md) - Comece por aqui!
- 🚨 [Está com erros?](./LEIA-ME-URGENTE.md) - Problemas comuns
- 🤔 [Entenda React vs Next.js](./ENTENDA-O-PROBLEMA.md) - Explicação clara

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Começando](#começando)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **BarConnect** é um sistema ERP completo desenvolvido especialmente para hotéis de pequeno porte. Começou como um PDV simples e evoluiu para uma solução completa de gestão.

### Por que BarConnect?

- ✨ **Interface Moderna**: Design minimalista e intuitivo
- 🚀 **Performance**: Responde instantaneamente às ações
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile
- 🔒 **Seguro**: Sistema de autenticação com níveis de acesso
- 💾 **Persistente**: Dados salvos localmente (com suporte a banco de dados)
- 📊 **Completo**: Dashboard com análises em tempo real

---

## ✨ Funcionalidades

### 🛒 PDV (Ponto de Venda)
- **Comandas**: Criar, gerenciar e finalizar comandas
- **Venda Direta**: Vendas sem comanda
- **Busca Rápida**: Encontre produtos instantaneamente
- **Item Personalizado**: Adicione itens com valores customizados
- **4 Métodos de Pagamento**: Dinheiro, Crédito, Débito, PIX
- **Cortesia**: Sistema especial para cortesias (apenas admin)

### 📊 Dashboard
Dois modos de visualização:

#### **Dashboard Bar** (Operacional)
- Receita total do período
- Comandas ativas e fechadas
- Ticket médio
- Produtos mais vendidos
- Distribuição de métodos de pagamento
- Controle de cortesias
- Detalhamento de vendas ao clicar

#### **Dashboard Controladoria** (Análise Financeira)
- Receitas vs Despesas
- Saldo do período
- Gráficos comparativos
- Análise por categoria
- Tendências de crescimento

### 📦 Estoque
- **Gestão de Produtos**: Adicionar, editar e remover produtos
- **Indicadores Visuais**: Cores para níveis de estoque
  - 🔴 Crítico (≤20 unidades)
  - 🟠 Baixo (≤50 unidades)
  - 🟢 Normal (>50 unidades)
- **Categorização**: Organize por categorias e subcategorias
- **Busca e Filtros**: Encontre produtos rapidamente

### 💰 Financeiro
- **Entradas e Saídas**: Registro completo de transações
- **Categorização**: Organize por tipo de despesa/receita
- **Filtros de Data**: Analise períodos específicos
- **Registro Manual**: Adicione transações manualmente
- **Integração Automática**: Vendas são registradas automaticamente

### 🏨 Hotel
- **Gestão de Quartos**: Status visual de cada quarto
  - 🟢 Disponível
  - 🔵 Ocupado
  - 🟡 Limpeza
  - 🔴 Manutenção
- **Check-in/Check-out**: Gerenciamento completo de hóspedes
- **Histórico**: Registro de todas as estadias
- **Valores**: Controle de diárias e valores

### 🔐 Autenticação
- **2 Níveis de Usuário**:
  - **Operador**: Acesso apenas ao PDV
  - **Admin**: Acesso completo ao sistema
- **Credenciais de Teste**:
  - Admin: `admin` / `admin123`
  - Operador: `operador` / `operador123`

---

## 🛠️ Tecnologias

### Core
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilização moderna
- **Vite** - Build tool

### Bibliotecas UI
- **shadcn/ui** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Sonner** - Notificações toast
- **Recharts** - Gráficos interativos

### Gerenciamento de Estado
- **React Hooks** - useState, useEffect, etc
- **Custom Hooks** - useLocalStorage, useDateFilter
- **localStorage** - Persistência local (pode ser substituído por DB)

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/barconnect.git
   cd barconnect
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Abra no navegador**
   ```
   http://localhost:5173
   ```

5. **Faça login**
   - Admin: `admin` / `admin123`
   - Operador: `operador` / `operador123`

---

## 📁 Estrutura do Projeto

```
barconnect/
├── components/              # Componentes React
│   ├── ui/                 # Componentes shadcn/ui
│   ├── figma/              # Componentes do Figma
│   ├── Header.tsx          # Cabeçalho principal
│   ├── ComandaSidebar.tsx  # Sidebar de comandas
│   ├── Dashboard.tsx       # Dashboard principal
│   └── ...                 # Outros componentes
│
├── hooks/                  # Custom React Hooks
│   ├── useLocalStorage.ts  # Hook de persistência
│   └── useDateFilter.ts    # Hook de filtro de data
│
├── utils/                  # Funções utilitárias
│   ├── calculations.ts     # Cálculos
│   └── constants.ts        # Constantes
│
├── data/                   # Dados estáticos
│   └── products.ts         # Produtos de exemplo
│
├── types/                  # TypeScript types
│   ├── index.ts           # Types principais
│   └── user.ts            # Types de usuário
│
├── styles/                 # Estilos globais
│   └── globals.css        # Tailwind CSS v4
│
├── guidelines/             # Documentação
│   └── Guidelines.md      # Guia de desenvolvimento
│
├── App.tsx                # Componente raiz
├── ComoTornarAppFuncional.md  # Guia de produção
└── README.md              # Este arquivo
```

---

## 🎬 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build           # Cria build de produção
npm run preview         # Preview do build

# Linting
npm run lint            # Verifica problemas no código

# Testes (futuro)
npm test                # Roda testes
npm run test:watch      # Testes em modo watch
```

---

## 📦 Deploy

### Opção 1: Vercel (Recomendado)

1. Crie conta na [Vercel](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure variáveis de ambiente (se usar banco de dados)
4. Deploy automático!

### Opção 2: Netlify

```bash
npm run build
netlify deploy --prod
```

### Opção 3: Build Manual

```bash
npm run build
# Copie a pasta 'dist' para seu servidor
```

Para guia completo de deploy e migração para banco de dados, veja:
📖 [Como Tornar o App Funcional](./ComoTornarAppFuncional.md)

---

## 🎓 Guias e Documentação

### Para Desenvolvedores
- 📘 [Guidelines de Desenvolvimento](./guidelines/Guidelines.md)
- 🔧 [Padrões de Código](./guidelines/Guidelines.md#padrões-de-código)
- 🎨 [Guia de Estilização](./guidelines/Guidelines.md#estilização-com-tailwind)

### Para Deploy
- 🚀 [Guia Completo de Deploy](./ComoTornarAppFuncional.md)
- 🗄️ [Configuração do Banco de Dados](./ComoTornarAppFuncional.md#configuração-supabase)
- 🔒 [Segurança e Autenticação](./ComoTornarAppFuncional.md#implementando-autenticação)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona novo recurso
fix: corrige bug
docs: atualiza documentação
refactor: refatora código
style: ajusta formatação
test: adiciona testes
chore: tarefas de manutenção
```

---

## 📝 Roadmap

### Versão 2.1 (Próxima)
- [ ] Integração com banco de dados
- [ ] API REST
- [ ] Autenticação JWT
- [ ] Backup automático

### Versão 2.2
- [ ] App mobile (React Native)
- [ ] Modo offline
- [ ] Impressora térmica
- [ ] Relatórios em PDF

### Versão 3.0
- [ ] Multi-estabelecimento
- [ ] Integração fiscal
- [ ] BI avançado
- [ ] App do garçom

---

## 🐛 Problemas Conhecidos

- [ ] Scroll em alguns modais pode não funcionar no Safari
- [ ] Gráficos podem demorar a carregar com muitos dados
- [ ] Dark mode ainda não implementado

Reporte bugs em: [Issues](https://github.com/seu-usuario/barconnect/issues)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**BarConnect Team**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: contato@barconnect.com

---

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com) pelos componentes
- [Lucide](https://lucide.dev) pelos ícones
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
- Comunidade React por todo suporte

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- 📧 Email: suporte@barconnect.com
- 💬 Discord: [Link do servidor]
- 📚 Documentação: [Link da documentação]

---

<div align="center">

**⭐ Se este projeto te ajudou, deixe uma estrela!**

Feito com ❤️ por desenvolvedores para desenvolvedores

[⬆ Voltar ao topo](#-barconnect---erp-para-hotéis-de-pequeno-porte)

</div>