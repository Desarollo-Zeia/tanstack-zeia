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
│       ├── components/
│       │   ├── header.tsx     # Top bar with user, theme toggle, logout
│       │   ├── sidebar.tsx    # Dynamic navigation from energy_modules
│       │   └── shell.tsx      # Layout wrapper (Header + Sidebar + Main)
│       └── pages/             # (placeholder for future page components)
├── hooks/
│   └── use-theme.ts           # Dark/light mode toggle, persists to localStorage
├── lib/
│   ├── utils.ts               # cn() helper for conditional Tailwind classes
│   └── api-client.ts          # (placeholder for future API client)
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
pnpm preview  # Preview production build
pnpm lint     # Run ESLint
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
