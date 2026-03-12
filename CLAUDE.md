<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# WanderBite Workspace

## Stack
- **Angular** ~21.2.0, **Nx** 22.5.4, **PrimNG** 21.1.3
- **Bundler:** Webpack Module Federation (`@nx/module-federation`)
- **Unit tests:** Jest (`jest-preset-angular`)
- **E2E tests:** Cypress (`@nx/cypress`)
- **Package manager:** npm

## Project Structure
```
apps/
  shell/          # Host app — port 4200, deployed: Netlify
  homepage/       # Angular remote — port 4201, deployed: wanderbite-homepage.netlify.app
  destinations/   # Angular remote — port 4202, deployed: wanderbite-destinations.netlify.app
  food/           # Angular remote — port 4203, deployed: wanderbite-food.vercel.app
  activities/     # React remote — port 4204, deployed: wanderbite-activities.vercel.app
libs/
  shared/utils/   # CityStateService (signal-based), shared types
```

## Apps Overview

### shell
- Bootstraps via `main.ts` → `bootstrap.ts` (async boundary required for MFE)
- `app.config.ts`: `provideRouter`, `provideHttpClient(withFetch())`, `providePrimeNG({ ripple: true })`
- `app.routes.ts`: lazy loads `homepage/Routes`, `destinations/Routes`, `food/Routes`; `/activities` → `ActivitiesPageComponent`
- `module-federation.config.ts`: registers Angular remotes (homepage, destinations, food) with dev/prod URL switching
- **activities is NOT in shell's MF config** — loaded via script tag (see Cross-Framework Loading below)

### homepage
- Component: `HomeComponent` (`apps/homepage/src/app/home/`)
- Nav links: Destinations, Restaurants

### destinations
- Component: `DestinationComponent` (`apps/destinations/src/app/destination/`)
- City search via Open-Meteo geocoding API (no auth needed)
- Featured destinations have hardcoded lat/lon coordinates
- After selecting a city, shows **"🍽️ Explore Restaurants"** button in the hero header
- Navigates to `/food?city=Paris&lat=48.8566&lon=2.3522`

### activities (React)
- **Framework:** React 19 + custom webpack (NOT Angular, NOT NX Angular MF)
- Component: `App.tsx` (`apps/activities/src/app/`)
- Exposes: `mount(el, city, lat, lon)` via `src/app/mount.tsx`
- Webpack: `@nx/webpack:webpack` executor with custom `webpack.config.ts`
  - Standard `webpack/lib/container/ModuleFederationPlugin` (NOT `@module-federation/enhanced`)
  - `filename: 'remoteEntry.js'`, explicit `publicPath: 'http://localhost:4204/'` in dev
  - `babel-loader` for JSX/TSX, `style-loader`+`css-loader` for CSS
  - `devServer.port: 4204` must be set in webpack config (executor ignores project.json port)
- Overpass API: `tourism=attraction|museum|viewpoint`, 5km radius, 20 results, 15s timeout
- Images: type-mapped Unsplash URLs (no API key)
- CSS class prefix: `ac-`

### food (restaurants)
- Component: `RestaurantsComponent` (`apps/food/src/app/remote-entry/restaurants/`)
- `RestaurantService`: Overpass API with 3-mirror fallback (rate-limit resilience)
  - Primary: `overpass.openstreetmap.fr`
  - Fallback 1: `overpass.kumi.systems`
  - Fallback 2: `overpass-api.de`
- Reads city/lat/lon from **URL query params** via `URLSearchParams(window.location.search)` (NOT `ActivatedRoute` — MFE injection boundary issue)
- Must call `ChangeDetectorRef.detectChanges()` after HTTP response (withFetch() zone issue in MFE)
- Restaurant images: cuisine-type mapped Unsplash URLs (no API key)
- Back button uses `Location.back()`

## Data Flow
```
Destinations → select city → "Explore Restaurants" / "Explore Activities" buttons
  → router.navigate(['/food' | '/activities'], { queryParams: { city, lat, lon } })
  → Component reads window.location.search (NOT ActivatedRoute)
  → Overpass API query → cards
```

## Cross-Framework Loading (Angular shell → React activities)

**Why NOT Module Federation:** Shell uses `@module-federation/enhanced` (via NX) which loads remotes
with `import * as` (ES module syntax). Standard webpack MF outputs CommonJS IIFE — `import * as foo`
gives `{ default: container }` so `foo.get` is undefined → `fn is not a function` error.

**Solution — Script tag loading in `ActivitiesPageComponent`:**
```typescript
// Shell's ActivitiesPageComponent.ngOnInit():
const script = document.createElement('script');
script.src = 'http://localhost:4204/remoteEntry.js';
script.onload = () => {
  const container = (window as any)['activities'];  // set by remoteEntry IIFE
  container.get('./mount').then((factory) => {
    const mod = factory();
    this.unmount = mod.mount(this.container.nativeElement, city, lat, lon);
  });
};
document.head.appendChild(script);
```
- No `import('activities/mount')` — activities is NOT in shell's webpack MF config
- No `activities.d.ts` type declaration needed (uses `any`)
- React `mount()` returns unmount function, called in `ngOnDestroy`

### What was tried and failed (do NOT retry these):
1. **`@module-federation/enhanced/webpack` in activities** → generates enhanced container with
   `__webpack_require__.federation.bundlerRuntime.initContainerEntry` — shell's enhanced runtime
   calls `external.get` which resolves to `undefined` because the init protocol mismatches.
2. **`remoteEntry.mjs` with shell's auto-appended extension** → Shell uses `import * as` to load
   `.mjs` files. Activities outputs CommonJS IIFE (not real ES module), so `import * as foo` gives
   `{ default: container }` — `foo.get` is undefined. The `.mjs` extension tricks the shell into
   ES-module loading mode even though the file is CommonJS.
3. **`experiments.outputModule: true` in activities webpack** → Standard `webpack/lib/container/
   ModuleFederationPlugin` doesn't support ES module output format for container entries.
   The build log shows `[javascript module]` but the file is still a IIFE without `export` statements.
4. **Registering activities in shell's `module-federation.config.ts`** → Any MF-based loading fails
   due to the CommonJS/ES-module boundary. Script tag loading bypasses this entirely.

## Critical MFE Rules

### Angular singletons require root package.json entries
`withModuleFederation` reads versions from **root `package.json`** to share Angular as singleton.
Must include: `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`,
`@angular/platform-browser`, `@angular/compiler`, `rxjs`, `primeng`, `@primeuix/themes`, `tslib`.
Warning: `"Could not find a version for @angular/core"` → NG0203 at runtime.

### Async bootstrap boundary (required for all apps)
`main.ts` must be: `import('./bootstrap').catch(err => console.error(err))`
Synchronous bootstrap breaks MFE shared singleton resolution.

### Shell is the root injector
- Shell `app.config.ts` must provide `provideHttpClient(withFetch())` and `providePrimeNG`
- Remote `app.config.ts` only applies when the remote runs standalone
- `ActivatedRoute` injection can fail across MFE bundle boundaries — use `URLSearchParams` instead

### tsconfig path aliases enable shell compilation of remotes
`tsconfig.base.json` paths:
```json
"homepage/Routes":     ["apps/homepage/src/app/remote-entry/entry.routes.ts"],
"destinations/Routes": ["apps/destinations/src/app/remote-entry/entry.routes.ts"],
"food/Routes":         ["apps/food/src/app/remote-entry/entry.routes.ts"]
```
Shell compiles remote components via these aliases — remote imports must resolve in shell's TS context.
Shell `tsconfig.json` must have `"moduleResolution": "bundler"` and `"module": "preserve"`.

### module-federation exposes paths
Must use `resolve(__dirname, ...)` not relative paths:
```ts
exposes: { './Routes': resolve(__dirname, 'src/app/remote-entry/entry.routes.ts') }
```

### Stale cache causes phantom errors
After fixing source files: `npm exec nx reset` before serving.

### PrimNG v21 usage
- Use `AutoComplete` standalone component, NOT `AutoCompleteModule`
- Import: `import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete'`
- `DecimalPipe` must be in standalone component `imports` array for `| number` pipe

## Common Commands
```bash
# Serve all 5 apps together
npx nx run-many -t serve -p shell homepage destinations food activities --parallel=5

# Serve single app
npx nx serve activities

# Build for production
npx nx build activities --configuration=production

# Clear stale cache (do this after fixing errors — stale cache replays old errors)
npm exec nx reset

# Deploy to Vercel
vercel deploy dist/apps/food --prod --yes
vercel deploy dist/apps/activities --prod --yes
```

## Deployment
| App | Platform | URL |
|-----|----------|-----|
| shell | Netlify | (main site) |
| homepage | Netlify | wanderbite-homepage.netlify.app |
| destinations | Netlify | wanderbite-destinations.netlify.app |
| food | Vercel | wanderbite-food.vercel.app |
| activities | Vercel | wanderbite-activities.vercel.app |

### Netlify build budget fix
Shell `project.json` `anyComponentStyle` budget must be large enough for all remote SCSS
compiled via path aliases. Current: `maximumWarning: 12kb`, `maximumError: 24kb`.

## Design System
- Fonts: `Cormorant Garamond` (headings/serif), `Jost` (body/UI)
- Colors: `$gold: #c9a96e`, `$dark: #080d1a`, `$dark-card: #111827`
- Pattern: dark luxury travel aesthetic, gold accents, subtle animations (`riseIn`, `spin`)
- CSS class prefixes: `wb-` (shell/global), `ds-` (destinations), `rs-` (restaurants)
