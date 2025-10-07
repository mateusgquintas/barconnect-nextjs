#!/bin/bash

# 🔧 Script de Correção Automática de Imports
# Use este script no projeto Next.js para corrigir todos os imports com versão

echo "🔍 Corrigindo imports com versões..."

# Função para substituir em todos os arquivos .tsx
function fix_imports() {
    # Radix UI
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-accordion@[0-9.]*/@radix-ui\/react-accordion/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-alert-dialog@[0-9.]*/@radix-ui\/react-alert-dialog/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-aspect-ratio@[0-9.]*/@radix-ui\/react-aspect-ratio/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-avatar@[0-9.]*/@radix-ui\/react-avatar/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-checkbox@[0-9.]*/@radix-ui\/react-checkbox/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-collapsible@[0-9.]*/@radix-ui\/react-collapsible/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-context-menu@[0-9.]*/@radix-ui\/react-context-menu/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-dialog@[0-9.]*/@radix-ui\/react-dialog/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-dropdown-menu@[0-9.]*/@radix-ui\/react-dropdown-menu/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-hover-card@[0-9.]*/@radix-ui\/react-hover-card/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-label@[0-9.]*/@radix-ui\/react-label/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-menubar@[0-9.]*/@radix-ui\/react-menubar/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-navigation-menu@[0-9.]*/@radix-ui\/react-navigation-menu/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-popover@[0-9.]*/@radix-ui\/react-popover/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-progress@[0-9.]*/@radix-ui\/react-progress/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-radio-group@[0-9.]*/@radix-ui\/react-radio-group/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-scroll-area@[0-9.]*/@radix-ui\/react-scroll-area/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-select@[0-9.]*/@radix-ui\/react-select/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-separator@[0-9.]*/@radix-ui\/react-separator/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-slider@[0-9.]*/@radix-ui\/react-slider/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-switch@[0-9.]*/@radix-ui\/react-switch/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-tabs@[0-9.]*/@radix-ui\/react-tabs/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-toast@[0-9.]*/@radix-ui\/react-toast/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-toggle@[0-9.]*/@radix-ui\/react-toggle/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-tooltip@[0-9.]*/@radix-ui\/react-tooltip/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/@radix-ui\/react-slot@[0-9.]*/@radix-ui\/react-slot/g' {} \;
    
    # Outras bibliotecas
    find . -name "*.tsx" -type f -exec sed -i 's/lucide-react@[0-9.]*/lucide-react/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/class-variance-authority@[0-9.]*/class-variance-authority/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/react-day-picker@[0-9.]*/react-day-picker/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/embla-carousel-react@[0-9.]*/embla-carousel-react/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/recharts@[0-9.]*/recharts/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/cmdk@[0-9.]*/cmdk/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/vaul@[0-9.]*/vaul/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/input-otp@[0-9.]*/input-otp/g' {} \;
    find . -name "*.tsx" -type f -exec sed -i 's/react-resizable-panels@[0-9.]*/react-resizable-panels/g' {} \;
    
    # EXCEÇÃO: react-hook-form PRECISA da versão
    # Não vamos mexer nele!
    
    echo "✅ Imports corrigidos!"
}

# Executar correções
fix_imports

echo ""
echo "🎯 Próximos passos:"
echo "1. Rode: npm install"
echo "2. Rode: npm run build"
echo "3. Se der erro, me avise!"
