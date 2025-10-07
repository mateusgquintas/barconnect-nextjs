# 🔧 Script para Corrigir Imports com Versões

## ⚠️ IMPORTANTE

Você está no **projeto React original** (Figma Make).  
Os imports com `@versão` só funcionam aqui no Figma Make, **NÃO** em projetos Next.js normais!

Se você está tentando fazer deploy ou build do Next.js, use os guias corretos.

---

## 📋 Lista de Correções Necessárias

Encontrei **MUITOS** arquivos com imports versiona dos. Aqui está o que precisa ser corrigido:

### No VS Code - Find & Replace Global

1. Aperte `Ctrl+Shift+H` (Windows) ou `Cmd+Shift+H` (Mac)
2. **Ative "Use Regular Expression"** (ícone `.*` na barra)
3. Execute CADA substituição abaixo, UMA POR VEZ:

---

### 🔄 Substituições

#### 1. Radix UI - Accordion
```
Find: @radix-ui/react-accordion@[0-9.]+
Replace: @radix-ui/react-accordion
```

#### 2. Radix UI - Alert Dialog
```
Find: @radix-ui/react-alert-dialog@[0-9.]+
Replace: @radix-ui/react-alert-dialog
```

#### 3. Radix UI - Aspect Ratio
```
Find: @radix-ui/react-aspect-ratio@[0-9.]+
Replace: @radix-ui/react-aspect-ratio
```

#### 4. Radix UI - Avatar
```
Find: @radix-ui/react-avatar@[0-9.]+
Replace: @radix-ui/react-avatar
```

#### 5. Radix UI - Checkbox
```
Find: @radix-ui/react-checkbox@[0-9.]+
Replace: @radix-ui/react-checkbox
```

#### 6. Radix UI - Collapsible
```
Find: @radix-ui/react-collapsible@[0-9.]+
Replace: @radix-ui/react-collapsible
```

#### 7. Radix UI - Context Menu
```
Find: @radix-ui/react-context-menu@[0-9.]+
Replace: @radix-ui/react-context-menu
```

#### 8. Radix UI - Dialog
```
Find: @radix-ui/react-dialog@[0-9.]+
Replace: @radix-ui/react-dialog
```

#### 9. Radix UI - Dropdown Menu
```
Find: @radix-ui/react-dropdown-menu@[0-9.]+
Replace: @radix-ui/react-dropdown-menu
```

#### 10. Radix UI - Hover Card
```
Find: @radix-ui/react-hover-card@[0-9.]+
Replace: @radix-ui/react-hover-card
```

#### 11. Radix UI - Label
```
Find: @radix-ui/react-label@[0-9.]+
Replace: @radix-ui/react-label
```

#### 12. Radix UI - Menubar
```
Find: @radix-ui/react-menubar@[0-9.]+
Replace: @radix-ui/react-menubar
```

#### 13. Radix UI - Navigation Menu
```
Find: @radix-ui/react-navigation-menu@[0-9.]+
Replace: @radix-ui/react-navigation-menu
```

#### 14. Radix UI - Popover
```
Find: @radix-ui/react-popover@[0-9.]+
Replace: @radix-ui/react-popover
```

#### 15. Radix UI - Progress
```
Find: @radix-ui/react-progress@[0-9.]+
Replace: @radix-ui/react-progress
```

#### 16. Radix UI - Radio Group
```
Find: @radix-ui/react-radio-group@[0-9.]+
Replace: @radix-ui/react-radio-group
```

#### 17. Radix UI - Scroll Area
```
Find: @radix-ui/react-scroll-area@[0-9.]+
Replace: @radix-ui/react-scroll-area
```

#### 18. Radix UI - Select
```
Find: @radix-ui/react-select@[0-9.]+
Replace: @radix-ui/react-select
```

#### 19. Radix UI - Separator
```
Find: @radix-ui/react-separator@[0-9.]+
Replace: @radix-ui/react-separator
```

#### 20. Radix UI - Slider
```
Find: @radix-ui/react-slider@[0-9.]+
Replace: @radix-ui/react-slider
```

#### 21. Radix UI - Switch
```
Find: @radix-ui/react-switch@[0-9.]+
Replace: @radix-ui/react-switch
```

#### 22. Radix UI - Tabs
```
Find: @radix-ui/react-tabs@[0-9.]+
Replace: @radix-ui/react-tabs
```

#### 23. Radix UI - Toast
```
Find: @radix-ui/react-toast@[0-9.]+
Replace: @radix-ui/react-toast
```

#### 24. Radix UI - Toggle
```
Find: @radix-ui/react-toggle@[0-9.]+
Replace: @radix-ui/react-toggle
```

#### 25. Radix UI - Tooltip
```
Find: @radix-ui/react-tooltip@[0-9.]+
Replace: @radix-ui/react-tooltip
```

#### 26. Lucide React
```
Find: lucide-react@[0-9.]+
Replace: lucide-react
```

#### 27. Class Variance Authority
```
Find: class-variance-authority@[0-9.]+
Replace: class-variance-authority
```

#### 28. React Day Picker
```
Find: react-day-picker@[0-9.]+
Replace: react-day-picker
```

#### 29. Embla Carousel
```
Find: embla-carousel-react@[0-9.]+
Replace: embla-carousel-react
```

#### 30. Recharts
```
Find: recharts@[0-9.]+
Replace: recharts
```

#### 31. CMDK
```
Find: cmdk@[0-9.]+
Replace: cmdk
```

#### 32. Vaul (Drawer)
```
Find: vaul@[0-9.]+
Replace: vaul
```

#### 33. Input OTP
```
Find: input-otp@[0-9.]+
Replace: input-otp
```

#### 34. React Hook Form ⚠️ ESPECIAL
```
Find: from "react-hook-form@7.55.0"
Replace: from "react-hook-form@7.55.0"
```
**NÃO MUDE** - React Hook Form PRECISA da versão específica!

---

## ⚡ Atalho Rápido (Avançado)

Se você sabe usar RegEx, pode fazer TUDO de uma vez:

1. `Ctrl+Shift+H`
2. **Ative RegEx** (ícone `.*`)
3. **Find:** `(@radix-ui/react-[a-z-]+|lucide-react|class-variance-authority|react-day-picker|embla-carousel-react|recharts|cmdk|vaul|input-otp)@[0-9.]+`
4. **Replace:** `$1`
5. **MAS CUIDADO!** Teste antes em 1 arquivo só

---

## 💾 APÓS AS SUBSTITUIÇÕES

1. **File → Save All** (`Ctrl+K S` ou `Cmd+K S`)
2. Reinicie o terminal se estiver rodando `npm run dev`
3. Teste se compilou sem erros

---

## ❌ Se Ainda Tiver Erros

**"Module not found: Can't resolve 'xxx'"**

Significa que a dependência não está instalada. Rode:

```bash
npm install xxx
```

Exemplo:
```bash
npm install @radix-ui/react-slot
npm install lucide-react
npm install class-variance-authority
```

---

## 🎯 Verificação Final

Depois de corrigir tudo, não deve haver NENHUM import com `@` seguido de número.

**❌ ERRADO:**
```tsx
import { Button } from "lucide-react@0.487.0";
```

**✅ CORRETO:**
```tsx
import { Button } from "lucide-react";
```

---

**IMPORTANTE:** Este script é para corrigir o projeto React atual para funcionar fora do Figma Make!
