# 🔧 Script de Correção Automática de Imports - Windows PowerShell
# Use este script no projeto Next.js para corrigir todos os imports com versão

Write-Host "🔍 Corrigindo imports com versões..." -ForegroundColor Yellow

# Lista de substituições
$replacements = @{
    # Radix UI
    '@radix-ui/react-accordion@[\d.]+' = '@radix-ui/react-accordion'
    '@radix-ui/react-alert-dialog@[\d.]+' = '@radix-ui/react-alert-dialog'
    '@radix-ui/react-aspect-ratio@[\d.]+' = '@radix-ui/react-aspect-ratio'
    '@radix-ui/react-avatar@[\d.]+' = '@radix-ui/react-avatar'
    '@radix-ui/react-checkbox@[\d.]+' = '@radix-ui/react-checkbox'
    '@radix-ui/react-collapsible@[\d.]+' = '@radix-ui/react-collapsible'
    '@radix-ui/react-context-menu@[\d.]+' = '@radix-ui/react-context-menu'
    '@radix-ui/react-dialog@[\d.]+' = '@radix-ui/react-dialog'
    '@radix-ui/react-dropdown-menu@[\d.]+' = '@radix-ui/react-dropdown-menu'
    '@radix-ui/react-hover-card@[\d.]+' = '@radix-ui/react-hover-card'
    '@radix-ui/react-label@[\d.]+' = '@radix-ui/react-label'
    '@radix-ui/react-menubar@[\d.]+' = '@radix-ui/react-menubar'
    '@radix-ui/react-navigation-menu@[\d.]+' = '@radix-ui/react-navigation-menu'
    '@radix-ui/react-popover@[\d.]+' = '@radix-ui/react-popover'
    '@radix-ui/react-progress@[\d.]+' = '@radix-ui/react-progress'
    '@radix-ui/react-radio-group@[\d.]+' = '@radix-ui/react-radio-group'
    '@radix-ui/react-scroll-area@[\d.]+' = '@radix-ui/react-scroll-area'
    '@radix-ui/react-select@[\d.]+' = '@radix-ui/react-select'
    '@radix-ui/react-separator@[\d.]+' = '@radix-ui/react-separator'
    '@radix-ui/react-slider@[\d.]+' = '@radix-ui/react-slider'
    '@radix-ui/react-switch@[\d.]+' = '@radix-ui/react-switch'
    '@radix-ui/react-tabs@[\d.]+' = '@radix-ui/react-tabs'
    '@radix-ui/react-toast@[\d.]+' = '@radix-ui/react-toast'
    '@radix-ui/react-toggle@[\d.]+' = '@radix-ui/react-toggle'
    '@radix-ui/react-tooltip@[\d.]+' = '@radix-ui/react-tooltip'
    '@radix-ui/react-slot@[\d.]+' = '@radix-ui/react-slot'
    '@radix-ui/react-slot\.[\d.]+' = '@radix-ui/react-slot'  # Caso especial: ponto em vez de @
    
    # Outras bibliotecas
    'lucide-react@[\d.]+' = 'lucide-react'
    'class-variance-authority@[\d.]+' = 'class-variance-authority'
    'react-day-picker@[\d.]+' = 'react-day-picker'
    'embla-carousel-react@[\d.]+' = 'embla-carousel-react'
    'recharts@[\d.]+' = 'recharts'
    'cmdk@[\d.]+' = 'cmdk'
    'vaul@[\d.]+' = 'vaul'
    'input-otp@[\d.]+' = 'input-otp'
    'react-resizable-panels@[\d.]+' = 'react-resizable-panels'
}

# Encontrar todos os arquivos .tsx
$files = Get-ChildItem -Path . -Filter *.tsx -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules' }

$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    Write-Progress -Activity "Corrigindo imports" -Status "Processando $($file.Name)" -PercentComplete (($currentFile / $totalFiles) * 100)
    
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($pattern in $replacements.Keys) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacements[$pattern]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✅ Corrigido: $($file.Name)" -ForegroundColor Green
    }
}

Write-Progress -Activity "Corrigindo imports" -Completed

Write-Host ""
Write-Host "✅ Correção concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Rode: npm install"
Write-Host "2. Rode: npm run build"
Write-Host "3. Se der erro, me avise!"
