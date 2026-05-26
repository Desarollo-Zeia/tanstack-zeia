# AGENTS.md - Zeia Energy Dashboard

## Project Overview

SPA (Single Page Application) for energy monitoring and management built for ZEIA Technologies Peru.
- **Framework**: React 19 + TypeScript
- **Router**: TanStack Router (file-based routing)
- **State Management**: TanStack Query (server state)
- **Styling**: Tailwind CSS v3 + custom design system
- **UI Components**: Custom components (shadcn/ui-inspired but fully custom)
- **Architecture**: Feature-based folder structure

---

## Tech Stack & Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.4 | UI framework |
| `react-dom` | ^19.2.4 | DOM renderer |
| `@tanstack/react-router` | ^1.168.19 | File-based routing |
| `@tanstack/react-query` | ^5.99.0 | Server state management |
| `lucide-react` | ^1.16.0 | Icons |
| `class-variance-authority` | ^0.7.1 | Component variants |
| `clsx` | ^2.1.1 | Conditional classes |
| `tailwind-merge` | ^3.6.0 | Tailwind class merging |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^8.0.4 | Build tool |
| `@vitejs/plugin-react` | ^6.0.1 | React plugin for Vite |
| `@tanstack/router-plugin` | ^1.167.21 | File-based route generation |
| `tailwindcss` | ^3.4.19 | CSS framework |
| `typescript` | ~6.0.2 | Type checking |
| `postcss` | ^8.5.15 | CSS processing |
| `autoprefixer` | ^10.5.0 | CSS autoprefixing |
| `vitest` | ^4.1.7 | Test runner (unit/integration) |
| `@testing-library/react` | ^16.3.2 | Component testing utilities |
| `@testing-library/jest-dom` | ^6.9.1 | DOM matchers (toBeInTheDocument, etc.) |
| `@testing-library/user-event` | ^14.6.1 | Simulate user interactions |
| `jsdom` | ^29.1.1 | DOM environment for tests |

### NOT Using (intentionally excluded)
- ❌ `@tanstack/react-start` — This is a pure SPA, NOT SSR
- ❌ `babel-plugin-react-compiler` — Removed for simplicity
- ❌ `@rolldown/plugin-babel` — Removed for simplicity

---

## Available Skills

This project has access to the following skills in `.agents/skills/` (project-local):

### 1. `frontend-design`
**Location**: `.agents/skills/frontend-design/SKILL.md`

**Use when**: Building or styling ANY web UI component, page, or interface.

**Key principles**:
- Choose a BOLD aesthetic direction (never generic)
- Use distinctive typography (avoid Inter, Roboto, Arial)
- Commit to cohesive color themes with CSS variables
- Use animations and micro-interactions
- Create unexpected layouts (asymmetry, overlap, diagonal flow)
- Add atmospheric backgrounds (textures, gradients, noise)
- NEVER use generic "AI slop" aesthetics

### 2. `tanstack-router-best-practices`
**Location**: `.agents/skills/tanstack-router-best-practices/SKILL.md`

**Use when**: Working with routing, navigation, route guards, or file-based routes.

### 3. `tanstack-query-best-practices`
**Location**: `.agents/skills/tanstack-query-best-practices/SKILL.md`

**Use when**: Working with data fetching, caching, mutations, or server state.

### 4. `find-skills`
**Location**: `.agents/skills/find-skills/SKILL.md`

**Use when**: Need to discover or install additional skills.

---

## Critical Technical Decisions

### 1. SPA (Single Page Application)
This project is intentionally a **pure SPA**, NOT SSR.
- Build output: Static files in `dist/` (no server-side rendering)
- No `@tanstack/react-start` or server functions
- Can be served from any static CDN

### 2. File-Based Routing with TanStack Router
Routes are auto-generated from files in `src/routes/`.
- Route tree is auto-generated via `@tanstack/router-plugin/vite`
- **NEVER** manually edit `src/routeTree.gen.ts` — it is auto-generated
- To regenerate routes: `pnpx @tanstack/router-cli generate`

### 3. Routing Structure
All energy-related routes use the `/energia/` prefix (matching the API response):

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/routes/index.tsx` | Landing page with module selection card |
| `/energia/login` | `src/routes/energia/login.tsx` | Authentication page |
| `/energia/dashboard/panel` | `src/routes/energia/dashboard/panel.tsx` | Panel Dashboard |
| `/energia/dashboard/home` | `src/routes/energia/dashboard/home.tsx` | Análisis por Indicador |
| `/energia/dashboard/monitoreo` | `src/routes/energia/dashboard/monitoreo.tsx` | Monitoreo de Potencia |
| `/energia/dashboard/desbalance` | `src/routes/energia/dashboard/desbalance.tsx` | Desbalance de Carga |
| `/energia/dashboard/tarifario` | `src/routes/energia/dashboard/tarifario.tsx` | Consumo Tarifario |
| `/energia/dashboard/comparador` | `src/routes/energia/dashboard/comparador.tsx` | Comparación por Día |

**Note**: The old routes `/login`, `/dashboard/*` have been REMOVED.

### 4. Layout Pattern
Each dashboard page wraps itself with `DashboardShell` (NOT using `__layout.tsx`):
```tsx
import { DashboardShell } from '@/features/dashboard/components/shell'

function MyPage() {
  return (
    <DashboardShell>
      {/* page content */}
    </DashboardShell>
  )
}
```

`DashboardShell` renders: Header + Sidebar + Main content area

### 5. Authentication Flow
```
User clicks "Acceder al Sistema" on /
  → navigates to /energia/login
  → enters email + password
  → POST to https://api.energy.zeia.com.pe/api/v1/accounts/request-token/
  → on success: saves { token, user } to localStorage (key: 'zeia-auth')
  → redirects to first energy_modules child URL from API response
  → DashboardShell renders with sidebar from user.energy_modules
```

### 6. Dynamic Sidebar from API Response
The sidebar is **100% dynamic** based on the login API response.
- `user.energy_modules` contains the navigation structure
- Each module has `name`, `url`, `icon` (base64 SVG), `is_active`, and `children[]`
- The sidebar renders these modules and their children automatically
- Icons are base64 SVG strings decoded and rendered with `dangerouslySetInnerHTML`
- Active state is determined by comparing `currentPath` with each link's `url`

### 7. Theme System
- **Light mode** is default
- **Dark mode** toggled via `useTheme()` hook (adds/removes `dark` class on `<html>`)
- CSS variables defined in `src/styles/globals.css`
- Tailwind config has custom colors mapped to CSS variables

---

## Project Architecture

```
src/
├── components/ui/              # Reusable UI primitives (Button, Card, Input, Label)
│   ├── button.tsx             # Executive-styled buttons with glow hover
│   ├── card.tsx               # Cards with shadow-soft, rounded-xl
│   ├── input.tsx              # Form inputs with focus ring
│   └── label.tsx              # Uppercase labels with tracking
├── features/
│   ├── auth/
│   │   ├── types.ts           # AuthResponse, User, Company, EnergyModule, etc.
│   │   ├── api/
│   │   │   └── request-token.ts  # POST login mutation
│   │   └── hooks/
│   │       └── use-auth.ts    # localStorage auth state management
│   └── dashboard/
│       ├── types.ts           # Headquarter, ElectricalPanel, MeasurementPoint, Consumption types
│       ├── api/
│   │   │   ├── headquarters.ts   # GET /user/headquarters/
│   │   │   ├── consumption.ts    # GET /headquarter/{id}/electrical_panel/{id}/consumption-distribution/
│   │   │   └── measurement-points.ts  # GET /headquarter/{id}/measurement-points/
│   │   ├── hooks/
│   │   │   └── use-dashboard-filters.ts  # URL params ↔ state + auto-selection logic
│       ├── components/
│       │   ├── header.tsx     # Top bar with user, theme toggle, logout
│       │   ├── sidebar.tsx    # Dynamic navigation from energy_modules
│       │   ├── filters.tsx    # Sede + Panel + DateRange picker
│       │   └── shell.tsx      # Layout wrapper (Header + Sidebar + Main)
│       └── pages/             # (placeholder for future page components)
├── hooks/
│   └── use-theme.ts           # Dark/light mode toggle, persists to localStorage
├── lib/
│   ├── utils.ts               # cn() helper for conditional Tailwind classes
│   └── api-client.ts          # Base apiFetch with auth header from localStorage
├── routes/                    # TanStack file-based routes
│   ├── __root.tsx             # Root layout with QueryClientProvider
│   ├── index.tsx              # Landing page "Acceder al Sistema"
│   ├── profile.tsx            # (legacy, can be removed)
│   └── energia/
│       ├── login.tsx          # Login page with "Volver a módulos" button
│       └── dashboard/
│           ├── panel.tsx      # Panel Dashboard
│           ├── home.tsx       # Análisis por Indicador
│           ├── monitoreo.tsx  # Monitoreo de Potencia
│           ├── desbalance.tsx # Desbalance de Carga
│           ├── tarifario.tsx  # Consumo Tarifario
│           └── comparador.tsx # Comparación por Día
├── styles/
│   └── globals.css            # Tailwind directives, CSS variables, custom classes
├── main.tsx                   # Entry point, ReactDOM.createRoot
├── router.tsx                 # createRouter with routeTree
└── routeTree.gen.ts           # AUTO-GENERATED by TanStack Router
```

---

## Design System

### Aesthetic Direction: "Executive Energy"
Premium, clean, corporate-futuristic dashboard for industrial energy monitoring.
Mix of Swiss Grid (premium/confiable) + Grid Control (técnico sutil) + Electric Flow (animaciones mínimas).

### Typography
| Role | Font | Weights |
|------|------|---------|
| Body / Headers / UI | `Poppins` | 300, 400, 500, 600, 700 |
| Numbers / KPIs / Monospace | `JetBrains Mono` | 400, 500, 600, 700 |

Google Fonts loaded in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Colors (Zeia Energy Palette)

**Light Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FAFAF5` | Page background (warm white) |
| Card | `#FFFFFF` | Cards, panels |
| Text Primary | `#1C1C1E` | Main text (warm black) |
| Text Secondary | `#4D5A63` | Subtitles |
| Text Muted | `#8E8E93` | Labels, hints |
| Primary | `#00B7CA` | Buttons, active states |
| Primary Hover | `#009EAE` | Button hover |
| Primary Light | `#E6F9FB` | Highlights, badges |
| Border | `#E8E8E3` | Borders, dividers |
| Success | `#2EC4B6` | OK status, online |
| Warning | `#FF6B35` | Caution, alerts |
| Danger | `#E71D36` | Errors, critical |
| Info | `#00B7CA` | Information |

**Dark Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#1C1C1E` | Page background |
| Card | `#2C2C2E` | Cards, panels |
| Text Primary | `#F5F5F0` | Main text |
| Text Secondary | `#A1A1AA` | Subtitles |
| Primary | `#5EDFFF` | Brighter cyan for dark |
| Border | `#3A3A3C` | Borders |

### Custom CSS Classes (globals.css)
| Class | Description |
|-------|-------------|
| `.card-executive` | White card, rounded-xl, soft shadow, hover elevation |
| `.input-executive` | Input with border, rounded-lg, focus ring |
| `.btn-executive` | Base button with rounded-lg |
| `.btn-executive-primary` | Primary button with glow hover |
| `.btn-executive-outline` | Outline primary button |
| `.label-executive` | 11px uppercase label with wide tracking |
| `.kpi-value` | 4xl monospace number for KPIs |
| `.section-title` | xl semibold title |

### Shadow Tokens (Tailwind)
| Token | Value |
|-------|-------|
| `shadow-soft` | `0 2px 8px rgba(0,0,0,0.04)` |
| `shadow-medium` | `0 4px 16px rgba(0,0,0,0.06)` |
| `shadow-glow` | `0 0 20px rgba(0,183,202,0.15)` |

### Border Radius
- Default: `0.75rem` (12px)
- Buttons: `0.5rem` (8px)
- Badges: `9999px` (full rounded)

---

## API Integration

### Authentication Endpoint
```
POST https://api.energy.zeia.com.pe/api/v1/accounts/request-token/
```
**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```typescript
interface AuthResponse {
  token: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    companies: Array<{ id: number; name: string; role: string }>
    is_user_energy_monitoring: boolean
    energy_modules: Array<{
      name: string
      url: string | null
      icon: string          // base64 SVG
      is_active: boolean
      children: Array<{
        name: string
        url: string | null
        icon: string        // base64 SVG
      }>
    }>
    is_user_quality_air_auto: boolean
    is_user_thermal_comfort: boolean
  }
}
```

### Auth Storage
- **Key**: `zeia-auth`
- **Format**: `{ token: string, user: User }`
- **Storage**: `localStorage`

## Data Fetching Standards

This project follows a strict pattern for data fetching, query state, loading UI, and URL-driven filters. **All dashboard modules must follow these standards.** The reference implementation is `src/routes/energia/dashboard/panel.tsx`.

### 1. URL as Source of Truth for Filters

Dashboard filters (sede, panel, dates, etc.) are **shared across components** and must live in the URL, NOT in React state.

- Each route defines `validateSearch` to parse and type URL params.
- Both the filter bar and the page content read from `useSearch()`.
- Filter handlers call `navigate({ search: { ... } })` to update the URL.

```tsx
// Route file
export const Route = createFileRoute('/energia/dashboard/panel')({
  component: PanelPage,
  validateSearch: (search) => ({
    sede: typeof search.sede === 'string' ? search.sede : undefined,
    panel: typeof search.panel === 'string' ? search.panel : undefined,
    desde: typeof search.desde === 'string' ? search.desde : undefined,
    hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
  }),
})

// Page component
const search = useSearch({ from: '/energia/dashboard/panel' })
const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
```

**Never do this:**
```tsx
// ❌ BAD: local useState diverges between components
const [sede, setSede] = useState(67)
```

### 2. Filter Hook Pattern

Each module that needs filters creates its own hook in `features/{module}/hooks/use-{module}-filters.ts`. It:

1. Reads filter values from `useSearch()`
2. Fetches reference data (e.g., headquarters) via `useQuery`
3. Auto-selects defaults on mount if URL params are missing
4. Exposes `isReady` (all required params present)
5. Provides typed handlers that navigate to update the URL

**Note:** The auto-selection logic uses `useEffect` + `useRef` to avoid loops. This is the **only** valid exception to the "no setState in useEffect" rule (see Rule #1 in Codebase Rules).

### 3. API Functions

Place pure async functions in `features/{module}/api/*.ts`. They:

- Accept typed arguments (never read from URL or state directly)
- Build query strings and paths
- Delegate the actual fetch to `apiFetch<T>()` from `src/lib/api-client.ts`

```ts
export function fetchConsumptionDistribution(
  headquarterId: number,
  panelId: number,
  dateAfter: string,
  dateBefore: string
): Promise<ConsumptionDistributionResponse> {
  const params = new URLSearchParams({ date_after: dateAfter, date_before: dateBefore })
  return apiFetch<ConsumptionDistributionResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/consumption-distribution/?${params.toString()}`
  )
}
```

**Do NOT access `localStorage` directly in feature code.** `apiFetch` handles auth automatically.

### 4. TanStack Query Rules

- **Cache keys must include ALL variables** that affect the response.
- Use `enabled: isReady` to prevent firing requests with missing params.
- Never build `queryKey` or `queryFn` that depend on incomplete state.

```ts
const { data, isLoading } = useQuery({
  queryKey: ['consumption-distribution', sedeId, panelId, dateAfterStr, dateBeforeStr],
  queryFn: () => fetchConsumptionDistribution(sedeId!, panelId!, dateAfterStr, dateBeforeStr),
  enabled: isReady,
})
```

### 5. Loading States & Empty States

Every module must handle three UI states explicitly:

| State | Pattern |
|-------|---------|
| **Loading filters** | Skeleton pulse in filter controls (see `filters.tsx`) |
| **Loading data** | Centered spinner with "Cargando datos..." in the content area |
| **Empty / no selection** | Centered message with icon guiding the user to select filters |
| **Error** | Inline message or toast (do not crash the page) |

KPI cards must show skeleton placeholders while their data is loading:

```tsx
{kpi.isLoading ? (
  <div className="space-y-2">
    <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
  </div>
) : (
  <div className="text-2xl font-bold text-text-primary">{kpi.value}</div>
)}
```

### 6. Extending Filters

The standard supports additional filters beyond sede/panel/dates:

- Add them to `validateSearch` in the route file.
- Add them to the hook's return type and handlers.
- Include them in the `queryKey` array.

> **For specific endpoint details** (URLs, query params, response types), see the `README.md` inside each feature's `api/` folder:
> - `src/features/dashboard/api/README.md`
> - `src/features/auth/api/README.md`

---

## Protocolo de Comunicación: @Z-MOD / @Z-SEC

Use these keywords to request new dashboard work. After you send the keyword, I will ask the follow-up questions needed to proceed.

### @Z-MOD — Nuevo Módulo Completo

Use when you want a **new full page** with all its sections.

**What happens next:** I will ask for:
1. **Route path** — Where in `/energia/dashboard/...`
2. **Global filters** — Which of the standard filters apply (sede, panel, dates, others)
3. **Page layout** — High-level structure (KPIs row, main chart, side table, etc.)
4. **Sections** — One by one:
   - Position on the page
   - Endpoint (reference the `README.md` in the feature's `api/` folder or provide a new one)
   - What data to render and how
5. **Loading & empty states** — Any custom behavior beyond the standard

### @Z-SEC — Agregar Sección a Módulo Existente

Use when you want to **add a new section** to a page that already exists.

**What happens next:** I will ask for:
1. **Target module** — Which existing route
2. **Position** — Where on the page (above, below, left, right of existing sections)
3. **Endpoint** — Same as above
4. **Data & UI** — What to render
5. **Filters interaction** — Does this section use the same filters or need new ones?

### @Z-LIST — Listar Secciones de un Módulo

Use when you want to know **what sections a module currently has**.

**What happens next:** I will ask for:
1. **Target module** — Which route (e.g., `/energia/dashboard/panel`)

Then I will reply with the list of sections registered for that module.

---

## Dashboard Module Sections Registry

| Module | Route | Sections |
|--------|-------|----------|
| Panel Dashboard | `/energia/dashboard/panel` | Filter Bar, KPI Row, Split View (Chart Section + Data List), Data Table |
| Análisis por Indicador | `/energia/dashboard/home` | Filter Bar, Split View (Readings Table + Readings Graph) |
| Monitoreo de Potencia | `/energia/dashboard/monitoreo` | (pending) |
| Desbalance de Carga | `/energia/dashboard/desbalance` | (pending) |
| Consumo Tarifario | `/energia/dashboard/tarifario` | (pending) |
| Comparación por Día | `/energia/dashboard/comparador` | (pending) |

> **Note:** `(pending)` modules have no sections yet. They will be filled as they are built via `@Z-MOD`.

---

## Section Taxonomy (Dashboard UI)

| Section Name | Description | Typical Content |
|--------------|-------------|-----------------|
| **Filter Bar** | Horizontal controls row | Selects, date pickers, toggles |
| **KPI Row** | Horizontal row of metric cards | 2–6 cards with value + label |
| **Chart Section** | Visualization container | Pie, bar, line, area charts |
| **Data List** | Read-only list of items | Rows with labels, values, percentages |
| **Data Table** | Structured table with headers | Sortable columns, pagination |
| **Split View** | Two-column layout inside a card | Chart + List, or two charts |
| **Summary Card** | Large card with context | Descriptions, alerts, summaries |
| **Timeline** | Chronological event list | Logs, readings, notifications |

---

## Component Conventions

### Button Variants
```tsx
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Danger</Button>
<Button variant="link">Link</Button>
```

### Conditional Classes
Always use `cn()` from `@/lib/utils`:
```tsx
className={cn(
  'base-classes',
  conditional && 'conditional-classes',
  className
)}
```

### Imports
- Use `@/` alias for all `src/` imports
- UI components: `@/components/ui/*`
- Features: `@/features/*/components/*`
- Hooks: `@/hooks/*`
- Utils: `@/lib/*`

---

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Production build (tsc + vite)
pnpm test     # Run all tests (Vitest, single pass)
pnpm preview  # Preview production build
pnpm lint     # Run ESLint
```

---

## Testing Strategy

### Philosophy
- **Test real behavior**: Tests must exercise the actual code paths the user will hit
- **Real API calls**: Whenever possible, hit the real endpoints (see `request-token.test.ts`). This catches API drift, CORS issues, and real HTTP error paths
- **No API mocking (MSW)**: This project intentionally does NOT use Mock Service Worker. Tests must either use real endpoints or mock `fetch`/`vi.fn()` at the unit level only
- **localStorage is mocked globally**: All tests get a fresh `localStorage` mock automatically via `src/test/setup.ts`

### Test Configuration

**File**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 15000, // 15s for real API calls
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Setup file**: `src/test/setup.ts`
- Auto-imports `@testing-library/jest-dom` matchers
- Provides a fully mocked `localStorage` that is **cleared before each test**
- No need to mock `localStorage` manually in individual test files

### Test File Location & Naming

| Target | Test file location | Naming |
|--------|-------------------|--------|
| Hook (`use-auth.ts`) | Same directory | `use-auth.test.tsx` |
| API function (`request-token.ts`) | Same directory | `request-token.test.ts` |
| Route/Component (`login.tsx`) | Same directory | `login.test.tsx` |

**Rule**: Place the test file in the **same directory** as the file being tested. Do not create a separate `tests/` folder at the root.

**Exception for route files**: If the test lives inside `src/routes/`, prefix the filename with `-` so TanStack Router ignores it (e.g. `-login.test.tsx` instead of `login.test.tsx`).

### Testing Patterns by Layer

#### 1. Hooks (Unit)
Use `renderHook` from `@testing-library/react`. Always wrap in a minimal JSX wrapper if the hook depends on context/providers.

```tsx
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './use-auth'

describe('useAuth', () => {
  it('reads existing auth from localStorage on mount', () => {
    localStorage.setItem('zeia-auth', JSON.stringify({ token: 'abc', user: { ... } }))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

**Key rule**: `localStorage` is pre-mocked. Just call `localStorage.setItem()` / `localStorage.clear()` directly.

#### 2. API Functions (Unit with `vi.fn()` mocks)
Mock `fetch` or the internal `apiFetch` helper with `vi.fn()` to test URL construction, headers, error handling, and response parsing without hitting the real network.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchHeadquarters } from './headquarters'
import * as apiClient from '@/lib/api-client'

describe('fetchHeadquarters', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      results: [],
    })

    await fetchHeadquarters()

    expect(apiFetchSpy).toHaveBeenCalledWith('/user/headquarters/')
  })
})
```

**Key rules**:
- Mock at the `apiFetch` level (not global `fetch`) to test the function's contract
- For real endpoint verification, use curl or a one-off script, not unit tests
- Assert on the exact path and query params built by the function

#### 3. Dashboard Filters Hook (Integration)
Test with `renderHook` wrapped in `QueryClientProvider`. Mock `@tanstack/react-router` and the API module.

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardFilters } from './use-dashboard-filters'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({ sede: '67', panel: '39' }),
}))

vi.mock('../api/headquarters', () => ({
  fetchHeadquarters: vi.fn().mockResolvedValue({
    count: 1,
    results: [{ id: 67, name: 'Salaverry', is_active: true, electrical_panels: [...] }],
  }),
}))

describe('useDashboardFilters', () => {
  it('auto-selects first active headquarter and panel on mount', async () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(67)
      expect(result.current.panelId).toBe(39)
    })
  })
})
```

**Key rules**:
- Mock router search params to simulate URL state
- Mock API modules (not global fetch) to control data
- Use `waitFor` for async assertions after effects run

#### 4. API Client (Unit)
Test the base `apiFetch` helper: token reading, header construction, error handling.

```ts
import { apiFetch } from '@/lib/api-client'

describe('apiFetch', () => {
  it('includes Authorization header with token from localStorage', async () => {
    localStorage.setItem('zeia-auth', JSON.stringify({ token: 'my-token' }))
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: true }), { status: 200 })
    )

    await apiFetch('/test')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Token my-token',
        }),
      })
    )
  })
})
```

#### 5. Components / Routes (UI + Integration)
Render with real TanStack Query `QueryClientProvider`. Do NOT mock the router unless absolutely necessary.

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './login'

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('LoginPage', () => {
  it('muestra error al enviar credenciales inválidas', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByPlaceholderText(/usuario@zeia.com.pe/i), 'fake@email.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión. Verifique sus credenciales.')).toBeInTheDocument()
    })
  })
})
```

**Key rules**:
- Use `userEvent.setup()` for all interactions (more realistic than `fireEvent`)
- Use `waitFor` when asserting on async UI changes (mutations, API responses)
- Mock `@tanstack/react-router` only at the `vi.mock()` level if the component calls `useRouter()`

### Running Tests

```bash
# Run all tests once (CI mode)
pnpm test --run

# Run tests in watch mode (dev)
pnpm test

# Run a single file
pnpm test --run src/features/auth/hooks/use-auth.test.tsx

# Run with coverage
pnpm test --run --coverage
```

---

## Codebase Rules & Conventions for Future Agents

### 1. NEVER use `useEffect` to sync React state to React state

**Problem:** Calling `setState` inside `useEffect` causes cascading renders and is flagged by ESLint (`react-hooks/set-state-in-effect`).

**Rule:** If you need to derive state from props or URL params, compute it **during render** (use `useMemo` for expensive computations) or use a **reducer pattern** (e.g. `useReducer`, TanStack Store, Zustand). Never use `useEffect` + `setState` to "sync" one piece of state to another.

**Bad (DO NOT DO THIS):**
```tsx
const [x, setX] = useState(props.initialX)

// ❌ ESLint error: setState in effect
useEffect(() => {
  setX(props.initialX)
}, [props.initialX])
```

**Good:**
```tsx
// ✅ Compute directly during render
const x = props.initialX ?? defaultValue

// ✅ Or use useMemo for derived state
const derived = useMemo(() => computeFrom(props), [props])

// ✅ If complex, useReducer + dispatch from event handlers
const [state, dispatch] = useReducer(reducer, initialState)
```

**Exception:** The existing `use-dashboard-filters.ts` intentionally uses `setState` in `useEffect` for URL → state synchronization because TanStack Router search params are external to React. This is the ONLY valid use case. **Do not copy this pattern for new code.**

### 2. TanStack Router file-based routes: Do NOT export non-component code from route files

**Rule:** Every file in `src/routes/` must export ONLY `Route` (from `createFileRoute`) and its component. Exporting extra functions, constants, or hooks triggers `react-refresh/only-export-components` warning.

**Solution:** If a route needs helper functions, place them in a separate file in `src/features/` or `src/lib/`.

**Bad:**
```tsx
// src/routes/energia/dashboard/panel.tsx
export const Route = createFileRoute('/energia/dashboard/panel')({...})

export function PanelPage() { ... }

export function formatDateISO(date: Date) { ... }  // ❌ Extra export
```

**Good:**
```tsx
// src/routes/energia/dashboard/panel.tsx
import { formatDateISO } from '@/lib/date-utils'  // ✅ Imported from lib

export const Route = createFileRoute('/energia/dashboard/panel')({...})

function PanelPage() { ... }
```

### 3. Dashboard Filters: Shared state lives in URL params, NOT in React state

**Rule:** The dashboard filters (sede, panel, dates) are **shared across components** (`filters.tsx` renders controls, `panel.tsx` reads values). The single source of truth is **TanStack Router URL search params**. Both components read from the URL via `useSearch()`.

**Never do this:**
```tsx
// ❌ BAD: Two separate useState hooks
// In filters.tsx:
const [sede, setSede] = useState(67)

// In panel.tsx:
const [sede, setSede] = useState(67)  // Diverges from filters.tsx!
```

**Do this instead:**
```tsx
// ✅ GOOD: Both read from the same URL params
const search = useSearch({ from: '/energia/dashboard/panel' })
const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
```

### 4. API client: Always read token from localStorage via `apiFetch()`

**Rule:** Never hardcode tokens or access `localStorage` directly in feature code. Use `apiFetch<T>(path)` from `src/lib/api-client.ts` which handles auth automatically.

```ts
import { apiFetch } from '@/lib/api-client'

export function fetchMyData() {
  return apiFetch<MyResponseType>('/my-endpoint/')
}
```

### 5. TanStack Query: Cache keys must include ALL variables

**Rule:** `queryKey` arrays must include every parameter that affects the data. Otherwise stale data is shown.

```ts
// ✅ Correct: includes sede, panel, and dates
const { data } = useQuery({
  queryKey: ['consumption', sedeId, panelId, dateAfterStr, dateBeforeStr],
  queryFn: () => fetchConsumption(sedeId, panelId, dateAfterStr, dateBeforeStr),
  enabled: isReady,
})

// ❌ Wrong: missing date params → stale data when dates change
queryKey: ['consumption', sedeId, panelId]
```

### 6. Custom UI components: Do NOT use empty object interfaces

**Rule:** ESLint (`@typescript-eslint/no-empty-object-type`) flags interfaces that just extend another type with no additions. Use `type` instead.

```ts
// ❌ ESLint error
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// ✅ Correct
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
```

### 7. Build, Lint, Test: Must pass before finishing

**Rule:** Every change MUST pass these three commands before considering done:

```bash
pnpm build   # TypeScript + Vite build — must be clean
pnpm lint    # ESLint — 0 errors, 0 warnings
pnpm test --run  # All tests must pass
```

**If ESLint reports errors, fix them.** Do not disable rules blindly. Only disable rules at `eslint.config.js` level if the entire team agrees on the exception (e.g. `react-hooks/set-state-in-effect` for the URL sync pattern).

### 8. No Mock Service Worker (MSW)

**Rule:** This project does NOT use MSW. Tests either:
- Hit real endpoints (for integration tests with real auth tokens)
- Mock `vi.fn()` at the `apiFetch` level (for unit tests testing URL construction, headers, error handling)

### 9. Test files: Same directory, prefixed with `-` for routes

| Target | Location | Naming |
|--------|----------|--------|
| Any file in `src/` except routes | Same directory | `filename.test.ts` or `filename.test.tsx` |
| Route files in `src/routes/` | Same directory | `-filename.test.tsx` (prefix with `-`) |

**Why?** TanStack Router auto-generates routes from files in `src/routes/`. A file named `login.test.tsx` would be registered as a route. Prefixing with `-` makes TanStack Router ignore it.

### 10. SVG Icons from API: Remove fill, force stroke currentColor

**Rule:** Icons from the backend (`user.energy_modules[].icon`) are base64 SVGs. When rendering via `dangerouslySetInnerHTML`, always:
1. Strip any `fill="..."` attributes → replace with `fill="none"`
2. Force `stroke="currentColor"` so the icon inherits the text color

```tsx
<span
  dangerouslySetInnerHTML={{
    __html: svgContent
      .replace(/fill="[^"]*"/g, 'fill="none"')
      .replace(/stroke="[^"]*"/g, 'stroke="currentColor"'),
  }}
/>
```

---

## Regenerating Routes

If you add/modify/delete route files, regenerate the route tree:

```bash
pnpx @tanstack/router-cli generate
```

This updates `src/routeTree.gen.ts` automatically.

---

## Important Notes for Future Agents

1. **NEVER** manually edit `src/routeTree.gen.ts` — it is auto-generated
2. **This is a SPA** — no SSR, no server functions, no `@tanstack/react-start`
3. **Routes must use `/energia/` prefix** — matches the API response URLs
4. **Sidebar is 100% dynamic** — driven by `user.energy_modules` from login response
5. **Use the skills** — Check `.agents/skills/` before implementing UI/routing/data fetching
6. **Dark mode** — Toggle adds/removes `dark` class on `<html>`, CSS variables handle the rest
7. **Authentication** — Check `localStorage.getItem('zeia-auth')` for session state
8. **Build must pass** — Always run `pnpm build` before finishing

---

## Skill Loading Checklist

Before implementing, verify:
- [ ] UI work? → Read `frontend-design` skill
- [ ] Routing? → Read `tanstack-router-best-practices` skill
- [ ] Data fetching? → Read `tanstack-query-best-practices` skill
- [ ] New capability? → Use `find-skills` to search
