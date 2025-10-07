# 🤖 Setup Automático - ERP Hotelaria

> **Cole e execute! Tudo será criado automaticamente!**

---

## 🚀 OPÇÃO 1: Script Windows (PowerShell)

Salve como `setup-automatico.ps1` e execute:

```powershell
# ========================================
# Setup Automático - ERP Hotelaria
# Windows PowerShell
# ========================================

Write-Host "🚀 Iniciando setup automático..." -ForegroundColor Green
Write-Host ""

# 1. Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 2. Criar projeto Next.js
Write-Host ""
Write-Host "🏗️  Criando projeto Next.js..." -ForegroundColor Yellow
$projectName = Read-Host "Nome do projeto (Enter para 'erp-hotelaria')"
if ([string]::IsNullOrWhiteSpace($projectName)) {
    $projectName = "erp-hotelaria"
}

npx create-next-app@latest $projectName `
    --typescript `
    --tailwind `
    --app `
    --no-src-dir `
    --import-alias "@/*"

cd $projectName

# 3. Instalar dependências
Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow

# Radix UI
npm install @radix-ui/react-accordion `
    @radix-ui/react-alert-dialog `
    @radix-ui/react-avatar `
    @radix-ui/react-checkbox `
    @radix-ui/react-dialog `
    @radix-ui/react-dropdown-menu `
    @radix-ui/react-label `
    @radix-ui/react-popover `
    @radix-ui/react-progress `
    @radix-ui/react-radio-group `
    @radix-ui/react-scroll-area `
    @radix-ui/react-select `
    @radix-ui/react-separator `
    @radix-ui/react-slider `
    @radix-ui/react-switch `
    @radix-ui/react-tabs `
    @radix-ui/react-toast `
    @radix-ui/react-tooltip `
    @radix-ui/react-slot

# Utilitários
npm install class-variance-authority clsx tailwind-merge lucide-react sonner recharts

# Formulários
npm install react-hook-form@7.55.0 zod @hookform/resolvers

# Datas
npm install date-fns

# Supabase
npm install @supabase/supabase-js @supabase/ssr

Write-Host "✓ Dependências instaladas!" -ForegroundColor Green

# 4. Criar estrutura de pastas
Write-Host ""
Write-Host "📁 Criando estrutura de pastas..." -ForegroundColor Yellow

$folders = @(
    "components/ui",
    "components/pdv",
    "components/hotel",
    "components/estoque",
    "components/dashboard",
    "components/financeiro",
    "lib/supabase",
    "hooks",
    "types",
    "utils",
    "public"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Write-Host "✓ Pastas criadas!" -ForegroundColor Green

# 5. Criar arquivos base
Write-Host ""
Write-Host "📝 Criando arquivos base..." -ForegroundColor Yellow

# lib/utils.ts
@"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
"@ | Out-File -FilePath "lib/utils.ts" -Encoding UTF8

# lib/supabase/client.ts
@"
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
"@ | Out-File -FilePath "lib/supabase/client.ts" -Encoding UTF8

# lib/supabase/server.ts
@"
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, '', ...options })
          } catch (error) {
            // Server Component
          }
        },
      },
    }
  )
}
"@ | Out-File -FilePath "lib/supabase/server.ts" -Encoding UTF8

# .env.example
@"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.example" -Encoding UTF8

# Copiar para .env.local
Copy-Item ".env.example" -Destination ".env.local"

Write-Host "✓ Arquivos criados!" -ForegroundColor Green

# 6. Finalizar
Write-Host ""
Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o Supabase:"
Write-Host "   • Acesse: https://supabase.com"
Write-Host "   • Crie um projeto"
Write-Host "   • Copie as credenciais para .env.local"
Write-Host ""
Write-Host "2. Rode o projeto:"
Write-Host "   • npm run dev"
Write-Host ""
Write-Host "3. Acesse:"
Write-Host "   • http://localhost:3000"
Write-Host ""
Write-Host "💡 Leia: SETUP-NEXTJS-COMPLETO.md para mais detalhes" -ForegroundColor Yellow
```

### Como Executar:

```powershell
# Abra PowerShell como Administrador
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup-automatico.ps1
```

---

## 🐧 OPÇÃO 2: Script Mac/Linux (Bash)

Salve como `setup-automatico.sh` e execute:

```bash
#!/bin/bash

# ========================================
# Setup Automático - ERP Hotelaria
# Mac/Linux Bash
# ========================================

echo "🚀 Iniciando setup automático..."
echo ""

# 1. Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js não encontrado!"
    echo "   Instale em: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js instalado: $NODE_VERSION"

# 2. Criar projeto Next.js
echo ""
echo "🏗️  Criando projeto Next.js..."
read -p "Nome do projeto (Enter para 'erp-hotelaria'): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-erp-hotelaria}

npx create-next-app@latest "$PROJECT_NAME" \
    --typescript \
    --tailwind \
    --app \
    --no-src-dir \
    --import-alias "@/*"

cd "$PROJECT_NAME" || exit

# 3. Instalar dependências
echo ""
echo "📦 Instalando dependências..."

# Radix UI
npm install @radix-ui/react-accordion \
    @radix-ui/react-alert-dialog \
    @radix-ui/react-avatar \
    @radix-ui/react-checkbox \
    @radix-ui/react-dialog \
    @radix-ui/react-dropdown-menu \
    @radix-ui/react-label \
    @radix-ui/react-popover \
    @radix-ui/react-progress \
    @radix-ui/react-radio-group \
    @radix-ui/react-scroll-area \
    @radix-ui/react-select \
    @radix-ui/react-separator \
    @radix-ui/react-slider \
    @radix-ui/react-switch \
    @radix-ui/react-tabs \
    @radix-ui/react-toast \
    @radix-ui/react-tooltip \
    @radix-ui/react-slot

# Utilitários
npm install class-variance-authority clsx tailwind-merge lucide-react sonner recharts

# Formulários
npm install react-hook-form@7.55.0 zod @hookform/resolvers

# Datas
npm install date-fns

# Supabase
npm install @supabase/supabase-js @supabase/ssr

echo "✓ Dependências instaladas!"

# 4. Criar estrutura de pastas
echo ""
echo "📁 Criando estrutura de pastas..."

mkdir -p components/{ui,pdv,hotel,estoque,dashboard,financeiro}
mkdir -p lib/supabase
mkdir -p hooks types utils public

echo "✓ Pastas criadas!"

# 5. Criar arquivos base
echo ""
echo "📝 Criando arquivos base..."

# lib/utils.ts
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# lib/supabase/client.ts
cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
EOF

# lib/supabase/server.ts
cat > lib/supabase/server.ts << 'EOF'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component
          }
        },
      },
    }
  )
}
EOF

# .env.example
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Copiar para .env.local
cp .env.example .env.local

echo "✓ Arquivos criados!"

# 6. Finalizar
echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o Supabase:"
echo "   • Acesse: https://supabase.com"
echo "   • Crie um projeto"
echo "   • Copie as credenciais para .env.local"
echo ""
echo "2. Rode o projeto:"
echo "   • npm run dev"
echo ""
echo "3. Acesse:"
echo "   • http://localhost:3000"
echo ""
echo "💡 Leia: SETUP-NEXTJS-COMPLETO.md para mais detalhes"
```

### Como Executar:

```bash
# Dar permissão de execução
chmod +x setup-automatico.sh

# Executar
./setup-automatico.sh
```

---

## ⚡ OPÇÃO 3: Uma Linha (Avançado)

### Windows:
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/seu-repo/setup.ps1" -OutFile "setup.ps1"; .\setup.ps1
```

### Mac/Linux:
```bash
curl -o setup.sh https://raw.githubusercontent.com/seu-repo/setup.sh && bash setup.sh
```

---

## 🎯 O Que o Script Faz?

1. ✅ Verifica se Node.js está instalado
2. ✅ Cria projeto Next.js com TypeScript
3. ✅ Instala TODAS as dependências necessárias
4. ✅ Cria estrutura de pastas completa
5. ✅ Cria arquivos de configuração do Supabase
6. ✅ Cria arquivo `.env.local` vazio para você preencher
7. ✅ Configura path aliases (`@/`)

---

## 📝 Depois do Script

### 1. Configure Supabase

Edite `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Copie Componentes

```bash
# Do projeto React antigo, copie:
cp -r ../figma-make/components/* ./components/
cp -r ../figma-make/hooks/* ./hooks/
cp -r ../figma-make/types/* ./types/
cp -r ../figma-make/utils/* ./utils/
```

### 3. Ajuste Imports

Rode o script de correção de imports (já criado anteriormente):
```bash
.\CORRECAO-AUTOMATICA.ps1  # Windows
# ou
./SCRIPT-CORRECAO-AUTOMATICA.sh  # Mac/Linux
```

### 4. Teste

```bash
npm run dev
```

---

## 🚨 Troubleshooting

### Erro: "comando não encontrado"

**Windows:**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

**Mac/Linux:**
```bash
chmod +x setup-automatico.sh
```

### Erro: "Node.js não encontrado"

1. Instale Node.js: https://nodejs.org
2. Reinicie o terminal
3. Tente novamente

### Erro: "npm install falhou"

```bash
# Limpe cache
npm cache clean --force

# Tente novamente
npm install
```

---

## ⏱️ Tempo Estimado

- **Setup automático:** 5-10 minutos
- **Configurar Supabase:** 10-15 minutos
- **Copiar componentes:** 5 minutos
- **Total:** ~30 minutos

---

## ✅ Checklist Final

Depois do script automático:

- [ ] Script executou sem erros
- [ ] Pasta `erp-hotelaria` foi criada
- [ ] Arquivo `.env.local` existe
- [ ] `npm run dev` funciona
- [ ] Pode acessar http://localhost:3000
- [ ] Pronto para copiar componentes!

---

**Próximo passo:** Configurar Supabase e copiar componentes do projeto React!

🚀 **Está pronto para começar?**