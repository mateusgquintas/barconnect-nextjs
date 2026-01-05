# Script de validacao do copilot-instructions.md
# Uso: .\.github\validate-instructions.ps1

$ErrorActionPreference = "Stop"
$instructionsFile = ".github/copilot-instructions.md"

Write-Host "Validando $instructionsFile..." -ForegroundColor Cyan

# Verificar se o arquivo existe
if (-not (Test-Path $instructionsFile)) {
    Write-Host "ERROR: Arquivo nao encontrado: $instructionsFile" -ForegroundColor Red
    exit 1
}

$content = Get-Content $instructionsFile -Raw
$errors = @()

# 1. Verificar version e date
if ($content -notmatch "Version:.*\d+\.\d+") {
    $errors += "Version number not found or invalid format"
}

if ($content -notmatch "Last Updated:.*\d{4}") {
    $errors += "Last Updated date not found or invalid format"
}

# 2. Verificar secoes principais
$requiredSections = @(
    "## Project Overview",
    "## Architecture Essentials",
    "## Development Workflows",
    "## Code Conventions",
    "## Key Patterns to Follow",
    "## Troubleshooting",
    "## Maintenance Guide",
    "## Anti-Patterns",
    "## Quick Reference"
)

foreach ($section in $requiredSections) {
    if ($content -notmatch [regex]::Escape($section)) {
        $errors += "Missing required section: $section"
    }
}

# 3. Verificar arquivos criticos
$criticalFiles = @(
    "lib/supabase.ts",
    "lib/env.ts",
    "lib/cache.ts",
    "hooks/useProductsDB.ts",
    "__tests__/utils/testUtils.tsx",
    "app/layout.tsx",
    "types/index.ts"
)

foreach ($file in $criticalFiles) {
    if ($content -notmatch [regex]::Escape($file)) {
        $errors += "Critical file not mentioned: $file"
    }
}

# 4. Verificar exemplos de codigo
if ($content -notmatch "``````typescript") {
    $errors += "No TypeScript code examples found"
}

if ($content -notmatch "``````bash") {
    $errors += "No bash command examples found"
}

# Resultados
Write-Host ""
Write-Host "=== Resultado da Validacao ===" -ForegroundColor Yellow
Write-Host "Secoes principais: $($requiredSections.Count)" -ForegroundColor Green
Write-Host "Arquivos criticos: $($criticalFiles.Count)" -ForegroundColor Green
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "SUCCESS: Validacao concluida!" -ForegroundColor Green
    Write-Host "Arquivo esta completo e pronto para uso." -ForegroundColor Green
    exit 0
} else {
    Write-Host "WARNING: Encontrados $($errors.Count) problemas:" -ForegroundColor Yellow
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Yellow
    }
    exit 1
}
