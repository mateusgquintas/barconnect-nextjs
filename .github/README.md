# .github Directory

Este diretório contém configurações e instruções para GitHub e AI agents.

## 📄 Arquivos

### `copilot-instructions.md`
**Instruções oficiais para AI Coding Agents** (GitHub Copilot, Claude, etc.)

Documenta:
- Arquitetura do projeto e decisões de design
- Padrões de código e convenções
- Workflows de desenvolvimento (testes, deploy, database)
- Exemplos práticos de tarefas comuns
- Troubleshooting e anti-patterns

**Quando atualizar:**
- Após mudanças arquiteturais significativas
- Novos padrões/convenções adotados
- Novas variáveis de ambiente requeridas
- Mudanças na infraestrutura de testes

**Como validar:**
```powershell
.\.github\validate-instructions.ps1
```

### `validate-instructions.ps1`
Script PowerShell para validar a integridade do `copilot-instructions.md`.

Verifica:
- ✅ Presença de todas as seções obrigatórias
- ✅ Referências aos arquivos críticos do projeto
- ✅ Formato de versão e data
- ✅ Exemplos de código (TypeScript e Bash)

**Uso:**
```powershell
# No diretório raiz do projeto
.\.github\validate-instructions.ps1
```

## 🔄 Fluxo de Atualização

1. Faça mudanças em `copilot-instructions.md`
2. Atualize número de versão e data no topo
3. Execute validação: `.\.github\validate-instructions.ps1`
4. Se passar, commit as mudanças
5. Se falhar, corrija os problemas apontados

## 📚 Recursos

- [GitHub Copilot Instructions Docs](https://aka.ms/vscode-instructions-docs)
- [Documentação do Projeto](../docs/INDICE-DOCUMENTACAO.md)
