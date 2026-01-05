# BarConnect - AI Coding Agent Instructions

> **Version:** 1.0 | **Last Updated:** December 2025  
> **Maintainer:** Update after major architectural changes or new patterns  
> **Quick Links:** [Tests](#testing-423-tests) | [Database](#database-strategy-critical) | [Workflows](#development-workflows) | [Patterns](#key-patterns-to-follow)

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture Essentials](#architecture-essentials)
  - [Database Strategy](#database-strategy-critical)
  - [Data Access Pattern](#data-access-pattern)
  - [Service Layer](#service-layer)
- [Development Workflows](#development-workflows)
  - [Testing](#testing-423-tests)
  - [Database Management](#database-management)
  - [Build & Deploy](#build--deploy)
- [Code Conventions](#code-conventions)
  - [Components](#components)
  - [Styling](#styling)
  - [State Management](#state-management)
  - [TypeScript](#typescript)
- [Key Patterns to Follow](#key-patterns-to-follow)
- [Common Tasks & Examples](#common-tasks--examples)
- [Troubleshooting](#troubleshooting)
- [Maintenance Guide](#maintenance-guide)
- [Anti-Patterns](#anti-patterns-avoid)
- [Quick Reference](#quick-reference)
- [Additional Resources](#-additional-resources)
- [Getting Started](#-getting-started-for-new-ai-agents)
- [Project Health Metrics](#-project-health-metrics)

---

## Project Overview
**BarConnect** - Next.js 15 bar/hotel management system with POS, inventory, hotel agenda, and financial dashboards.

**Tech Stack:** Next.js 15 (App Router) • React 19 • TypeScript 5 • Supabase (PostgreSQL) • Tailwind CSS • shadcn/ui  
**Key Features:** Point of Sale • Tab Management • Hotel Reservations • Financial Analytics • PWA Support  
**Database:** Supabase with intelligent mock fallback for offline development

## Architecture Essentials

### Database Strategy (Critical)
**File:** `lib/supabase.ts` | **Validation:** `lib/env.ts`

**Auto-Detection Logic:**
```typescript
// Mock mode activates when:
// 1. NEXT_PUBLIC_USE_SUPABASE_MOCK=true (explicit)
// 2. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY

// Development: Warns and uses mock
// Production: Throws error if env vars missing
```

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_USE_SUPABASE_MOCK=false  # Optional: force mock in dev
```

**Why this matters:** Allows development without Supabase setup, but ensures production always has real database.

### Data Access Pattern
**Rule:** ALL database operations MUST use custom hooks (never direct Supabase calls in components)

**Available Hooks:**
| Hook | Purpose | Key Methods | Cache Key Pattern |
|------|---------|-------------|-------------------|
| `useProductsDB` | Products/inventory | `fetchProducts`, `updateStock`, `addProduct` | `products:list` |
| `useSalesDB` | Sales records | `registerSale`, `getSales` | `sales:*` |
| `useComandasDB` | Tab/order management | `openComanda`, `closeComanda` | `comandas:*` |
| `useTransactionsDB` | Financial transactions | `addTransaction`, `getTransactions` | `transactions:*` |

**Cache Pattern Example:**
```typescript
// In hook: Read with cache
const result = await withCache('products:list', async () => {
  const { data } = await supabase.from('products').select('*');
  return data;
}, { ttlMs: 8000 }); // Custom TTL

// After mutation: Invalidate cache
await supabase.from('products').update({ stock: newStock });
invalidateCache(/products:list/);
await fetchProducts({ force: true }); // Refresh immediately
```

### Service Layer
**File:** `lib/salesService.ts`

**Purpose:** Orchestrates complex multi-table transactions (sales → transactions → inventory updates)

**Transaction Flow:**
1. Register sale in `sales` table
2. Create transaction record in `transactions` table  
3. Update product stock in `products` table
4. Handle localStorage fallback if Supabase unavailable

**When to use:** Any operation touching multiple tables atomically.

## Development Workflows

### Testing (423+ tests)
```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage report
```
- Test files in `__tests__/` follow naming: `Component.test.tsx`, `service.integration.test.ts`
- Use `TestDataFactory` from `__tests__/utils/testUtils.tsx` for consistent test data
- Coverage thresholds: 30% statements, 20% branches (enforced in jest.config.js)
- Performance/accessibility tests use `.comprehensive.test.tsx` suffix

### Database Management
```bash
npm run supabase:menu                    # Interactive menu
npm run supabase:clean-transactional     # Clear sales/transactions only
npm run supabase:diagnostic              # Connection diagnostics
```
See `scripts/supabase-orchestrator.js` for full command list.

### Build & Deploy
```bash
npm run check           # Full validation (build + tests)
npm run typecheck       # TypeScript validation only
```
Next.js app auto-deploys to Vercel. Debug pages (`/debug-*`, `/test-*`) are protected by `DebugPageWrapper` requiring auth.

## Code Conventions

### Components
- **Client components**: Mark with `'use client'` directive (most UI components)
- **UI components**: Use shadcn/ui from `components/ui/` (built with Radix UI + CVA)
- **Performance**: Apply `React.memo` to expensive components (see `components/agenda/DayOccupancyBar.tsx`)
- **Error boundaries**: Global boundary at `app/error.tsx`, 404 at `app/not-found.tsx`

### Styling
- Tailwind CSS with `cn()` utility from `lib/utils.ts` for conditional classes
- Custom fonts: Geist Sans + Geist Mono configured in `app/layout.tsx`
- Print styles in `app/print.css` for reports

### State Management
- **React Context**: `AuthContext` and `DateFilterContext` wrap entire app in `app/layout.tsx`
- **No global state library**: Use contexts for shared state, hooks for data fetching
- **Date filtering**: `useDateFilter()` provides period-based filtering for dashboards
- **Creating new contexts**: Always add provider to `app/layout.tsx`, never in individual pages

### TypeScript
- **Strict mode**: Enabled in `tsconfig.json`
- **Path alias**: `@/*` maps to project root
- **Type definitions**: All types in `types/index.ts`

**Core Types:**
```typescript
// types/index.ts
Product        // id, name, price, stock, category, subcategory
OrderItem      // product, quantity
SaleRecord     // id, items, total, paymentMethod, date, time
Transaction    // id, type, description, amount, category, date
Comanda        // id, number, customerName, items, createdAt
PaymentMethod  // 'cash' | 'credit' | 'debit' | 'pix'
```

**Type import pattern:**
```typescript
import { Product, SaleRecord, PaymentMethod } from '@/types';
```

## Key Patterns to Follow

### Adding Database Interactions
1. Create/modify hook in `hooks/` (never inline Supabase calls)
2. Use `withCache()` wrapper for reads with appropriate TTL
3. Call `invalidateCache()` after mutations
4. Handle errors with `toast.error()` from `sonner`
5. Update loading states consistently

### Creating New Pages
1. Add route in `app/` following App Router conventions
2. Wrap debug/admin pages with `DebugPageWrapper` for auth protection
3. Add metadata in page file or layout
4. Register in navigation (e.g., `components/Header.tsx`)

### Writing Tests
1. Import `render` and `TestDataFactory` from `__tests__/utils/testUtils.tsx`
2. Use factory methods for all test data (avoid hardcoded objects)
3. Test user interactions, not implementation details
4. Integration tests for flows that span multiple components/services
5. Mock Supabase responses at hook level, not globally

### Logging
Use `utils/logger.ts` instead of console:
- `logger.debug()` - Development only
- `logger.error()` - Always logged
- `logger.warn()` - Development only

## Common Tasks & Examples

### Task: Add a New Product Field

<details>
<summary>Click to expand complete example</summary>

**1. Update TypeScript Types** (`types/index.ts`)
```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  subcategory?: string;
  newField?: string; // Add here
}
```

**2. Update Hook** (`hooks/useProductsDB.ts`)
```typescript
const addProduct = async (product: Omit<Product, 'id'>) => {
  const payload = {
    name: product.name,
    price: product.price,
    stock: product.stock,
    newField: product.newField ?? null, // Add here
  };
  const { error } = await supabase.from('products').insert([payload]);
  if (error) throw error;
  invalidateCache(/products:list/);
};
```

**3. Update Test Factory** (`__tests__/utils/testUtils.tsx`)
```typescript
createProduct: (overrides: Partial<Product> = {}): Product => ({
  id: `prod-${++__idCounters.product}`,
  name: 'Test Product',
  price: 10.0,
  stock: 100,
  newField: 'default', // Add here
  ...overrides,
})
```

**4. Add Test** (`__tests__/useProductsDB.newField.test.ts`)
```typescript
import { TestDataFactory } from './utils/testUtils';

it('should save product with new field', async () => {
  const product = TestDataFactory.createProduct({ 
    newField: 'test-value' 
  });
  await hook.addProduct(product);
  expect(mockSupabase.insert).toHaveBeenCalledWith(
    expect.objectContaining({ newField: 'test-value' })
  );
});
```

**5. Update Migration** (`supabase/migrations/YYYYMMDDHHMMSS_add_product_field.sql`)
```sql
ALTER TABLE products ADD COLUMN new_field TEXT;
```

</details>

### Task: Create a New Dashboard Page

<details>
<summary>Click to expand complete example</summary>

**1. Create Page File** (`app/dashboard-new/page.tsx`)
```typescript
'use client'
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useProductsDB } from '@/hooks/useProductsDB';

export default function NewDashboardPage() {
  const { startDate, endDate } = useDateFilter();
  const { products, loading } = useProductsDB();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">New Dashboard</h1>
      {/* Your content */}
    </div>
  );
}
```

**2. Add to Navigation** (`components/Header.tsx`)
```typescript
<Link href="/dashboard-new">New Dashboard</Link>
```

**3. Add Test** (`__tests__/DashboardNew.test.tsx`)
```typescript
import { render, screen } from './utils/testUtils';
import DashboardNewPage from '@/app/dashboard-new/page';

it('renders dashboard title', () => {
  render(<DashboardNewPage />);
  expect(screen.getByText('New Dashboard')).toBeInTheDocument();
});
```

</details>

### Task: Fix a Supabase Connection Issue

<details>
<summary>Click to expand troubleshooting steps</summary>

**1. Check Environment Variables**
```bash
npm run supabase:diagnostic
```

**2. Verify Supabase Client Status**
```typescript
// Add to any component temporarily
console.log('📊 Supabase Status:', {
  isUsingMock: isSupabaseMock,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
});
```

**3. Test Connection Manually**
```bash
node scripts/diagnostic-database.js
```

**4. Common Fixes**
- Missing `.env.local` → Copy from `.env.example` and fill values
- Wrong URL format → Ensure `https://` prefix
- CORS issues → Check Supabase dashboard > Settings > API
- Mock mode unintended → Set `NEXT_PUBLIC_USE_SUPABASE_MOCK=false`
- Authentication errors → Verify auth is disabled in Supabase client config

</details>

---

## Troubleshooting

### "Cache not invalidating after mutation"
**Symptom:** UI shows stale data after create/update/delete  
**Solution:** 
```typescript
// After ANY mutation, ALWAYS call:
invalidateCache(/relevant-pattern/);
await fetchData({ force: true }); // Immediate refresh
```

### "Tests failing with Supabase connection error"
**Symptom:** Tests try to connect to real Supabase  
**Solution:** Mock at hook level, not Supabase level:
```typescript
jest.mock('@/hooks/useProductsDB', () => ({
  useProductsDB: () => ({ products: [], loading: false })
}));
```

### "TypeScript error: Property doesn't exist"
**Symptom:** New field added to DB but TS complains  
**Solution:** Update in this order: `types/` → `hooks/` → components → tests

### "Debug page accessible without login"
**Symptom:** Security issue on debug routes  
**Solution:** Wrap page with `<DebugPageWrapper title="...">`:
```typescript
import DebugPageWrapper from '@/components/DebugPageWrapper';

export default function DebugPage() {
  return (
    <DebugPageWrapper title="Debug Page">
      {/* content */}
    </DebugPageWrapper>
  );
}
```

---

## Maintenance Guide

### When to Update This File

✅ **Update immediately when:**
- Adding new architectural patterns (e.g., new service layer)
- Changing database access patterns
- Adding new required environment variables
- Modifying test infrastructure
- Creating new code conventions that differ from Next.js defaults

⏸️ **Don't update for:**
- Individual component additions (unless it establishes new pattern)
- Bug fixes that don't change architecture
- Content/copy changes
- Minor dependency updates

### How to Update

1. **Add new pattern to relevant section** with concrete example
2. **Update version & date** at top of file
3. **Add to troubleshooting** if new pattern has common issues
4. **Update table of contents** if adding new major section
5. **Test example code** - ensure all examples actually work

### Validation Checklist

Before committing changes to this file:
- [ ] All file paths are correct and current
- [ ] Code examples use real types/imports from codebase
- [ ] Examples follow current conventions (check recent PRs)
- [ ] Links to sections work correctly
- [ ] No outdated technology mentioned (check package.json)

---

## Anti-Patterns (Avoid)

| ❌ Never Do This | ✅ Do This Instead | Why |
|------------------|-------------------|-----|
| Direct Supabase calls in components | Use hooks from `hooks/` | Centralized data access, easier testing |
| Mutations without cache invalidation | Always call `invalidateCache()` | Prevents stale data in UI |
| Hardcoded test data | Use `TestDataFactory` | Consistency, easier maintenance |
| `console.log()` | Use `logger` from `utils/logger.ts` | Environment-aware logging |
| New context without provider in `layout.tsx` | Add to root layout | Context available everywhere |
| Debug pages without auth | Wrap with `DebugPageWrapper` | Security requirement |
| Mixing snake_case and camelCase | Use camelCase in TS, snake_case in SQL | Consistency with ecosystem |

---

## Quick Reference

### Most Used Commands
```bash
npm run dev                          # Start development server
npm run check                        # Full validation (build + test)
npm test                             # Run test suite
npm run supabase:clean-transactional # Clear transactional data
npm run supabase:diagnostic          # Database diagnostics
```

### Most Important Files
- `lib/supabase.ts` - Database client configuration
- `lib/cache.ts` - Caching layer
- `app/layout.tsx` - Root layout with providers
- `types/index.ts` - TypeScript type definitions
- `__tests__/utils/testUtils.tsx` - Test factories

### Getting Helption

---

## 🔗 Additional Resources

### Integration Points

**Vercel Analytics & Speed Insights**
- Files: `@vercel/analytics` and `@vercel/speed-insights` in `app/layout.tsx`
- Auto-tracks page views and Core Web Vitals
- No additional configuration needed

**PWA Support**
- Manifest: `/public/manifest.json`
- Icons: `/public/icons/` (192x192 and 512x512)
- Service worker: Configure in `next.config.ts` if needed
- Apple-specific meta tags in `app/layout.tsx`

### Documentation Structure

**Main Documentation** (`docs/` directory):
```
docs/
├── INDICE-DOCUMENTACAO.md    # Master index - START HERE
├── architecture/              # System design & decisions
├── guides/                    # Step-by-step tutorials
└── archived/                  # Historical documentation
```

**Database Documentation:**
- `database/README.md` - Database scripts & maintenance
- `supabase/migrations/` - Schema migration history (source of truth)
- `supabase/README.md` - Supabase-specific setup

**Key Documents:**
- `DEPLOY_GUIDE.md` - Production deployment checklist
- `TESTING_INFRASTRUCTURE.md` - Testing architecture details
- `PWA-SETUP.md` - Progressive Web App configuration

---

## 🚀 Getting Started (For New AI Agents)

### First-Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment (choose one):
# Option A: Use mock database (no setup needed)
# Option B: Use real Supabase
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Verify setup
npm run supabase:diagnostic

# 4. Run tests to ensure everything works
npm test

# 5. Start development server
npm run dev
```

### Understanding the Codebase (30-min orientation)

**Read these files first (in order):**
1. [README.md](../README.md) - Project overview & features
2. `lib/supabase.ts` - Database client & mock strategy
3. `hooks/useProductsDB.ts` - Example of data access pattern
4. `__tests__/useProductsDB.test.ts` - Example of testing pattern

**Key concepts to understand:**
- ✅ All DB access through custom hooks
- ✅ Cache invalidation after mutations
- ✅ TestDataFactory for consistent test data
- ✅ DebugPageWrapper for protected routes

**Try this exercise:**
1. Find product catalog: `app/page.tsx` → `components/ProductCatalog.tsx`
2. Trace data flow: Component → Hook → Supabase → Cache
3. Find corresponding test: `__tests__/ProductCatalog.test.tsx`
4. Run test: `npm test ProductCatalog`

---

## 📊 Project Health Metrics

**Current Status:**
- ✅ 423+ tests passing
- ✅ 30% code coverage (statements)
- ✅ TypeScript strict mode
- ✅ Zero ESLint errors (builds with ignore)
- ✅ Production-ready deployment on Vercel

**Quality Targets:**
- Maintain test coverage above 30%
- All PRs must pass `npm run check`
- New features require tests
- Breaking changes need migration guide

---

_Last verified: December 2025 | Version 1.0 | For updates to this file, see [Maintenance Guide](#maintenance-guide)_
❌ Hardcoded test data (use TestDataFactory)  
❌ console.log (use logger utility)  
❌ Creating context providers without wrapping in layout.tsx  
❌ Debug pages without DebugPageWrapper protection
