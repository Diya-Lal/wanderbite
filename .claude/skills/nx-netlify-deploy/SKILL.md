---
name: nx-netlify-deploy
description: >
  Step-by-step guide for deploying Nx monorepo apps (especially Angular Module Federation / MFE) to Netlify.
  Use this skill whenever the user wants to deploy an Nx workspace to Netlify, host an Angular MFE on Netlify,
  set up Netlify sites for shell + remote apps, debug Netlify build failures for Nx projects, configure
  module-federation.config.ts for production URLs, or asks how to get their Nx build working on Netlify.
  Trigger even if they just say "deploy to Netlify", "Netlify build failing", or "host my Nx app".
---

# Nx + Netlify Deployment Guide

This guide covers deploying an Nx monorepo with Webpack Module Federation (MFE) to Netlify.
The key challenge: Netlify expects a single-app repo; Nx is a monorepo. Every step here exists to bridge that gap.

---

## 1. Workspace Prerequisites

Before touching Netlify, confirm the workspace is in order:

- `nx` is in **devDependencies** in the root `package.json` (not global)
- Root `package.json` and `package-lock.json` both exist and are committed
- If the project uses Angular + peer-heavy libraries (PrimNG, Angular Material), add a root `.npmrc`:

```
legacy-peer-deps=true
```

This ensures `npm ci` resolves peer deps the same way locally and on Netlify.

---

## 2. Add Build Scripts to Root `package.json`

Netlify runs commands from the **repo root**. Add a script for each app so the build command is short and unambiguous:

```json
"scripts": {
  "build:shell":        "nx build shell        --configuration=production",
  "build:homepage":     "nx build homepage     --configuration=production",
  "build:destinations": "nx build destinations --configuration=production"
}
```

Why scripts instead of `npm exec nx build shell` directly? Shorter Netlify build command, easier to test locally, and no `npm exec` lookup overhead.

---

## 3. Root `netlify.toml`

One file at the **repo root** handles shared rules for all sites. Keep app-specific build settings in the Netlify UI — not in per-app toml files (they cause path resolution problems in monorepos).

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

> ⚠️ **Do not add `NODE_ENV = "production"` to `[build.environment]` here.**
> npm 8+ treats `NODE_ENV=production` as `--omit=dev`, which skips devDependencies.
> Since `nx`, `@angular/cli`, and all build tools are devDeps, the build will fail with
> "Could not find Nx modules". The `--configuration=production` flag in the build script
> already handles Angular's production optimizations.

---

## 4. Netlify Site Configuration (per app)

Create one Netlify site per app. Configure each in **Netlify UI → Site settings → Build & deploy**:

| Setting                      | Value                                          |
| ---------------------------- | ---------------------------------------------- |
| Base directory               | *(leave blank — repo root)*                    |
| Build command                | `npm ci --include=dev && npm run build:<app>`  |
| Publish directory            | `dist/apps/<app>`                              |
| Netlify config file path     | *(leave blank — uses root netlify.toml)*       |

**Why `npm ci --include=dev`?**
- `npm ci` is reliable in CI — installs exactly what's in the lockfile, no surprises
- `--include=dev` overrides any `NODE_ENV=production` effect, ensuring devDeps (including nx) are always installed

**Examples:**

| App           | Build command                                    | Publish dir            |
| ------------- | ------------------------------------------------ | ---------------------- |
| shell         | `npm ci --include=dev && npm run build:shell`        | `dist/apps/shell`        |
| homepage      | `npm ci --include=dev && npm run build:homepage`     | `dist/apps/homepage`     |
| destinations  | `npm ci --include=dev && npm run build:destinations` | `dist/apps/destinations` |

> ⚠️ **Never use `cd <subdir>` in the build command.** Netlify always runs from the repo root
> (`/opt/build/repo`). Adding `cd ../..` or similar will navigate above the repo root to `/opt`,
> causing `EACCES: permission denied` on `/opt/package-lock.json`.

---

## 5. Module Federation Config (Shell)

The shell needs to know where to load remotes — different URLs for dev vs. production:

```ts
import { ModuleFederationConfig } from '@nx/module-federation';

const isProduction = process.env['NODE_ENV'] === 'production';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: [
    ['homepage',     isProduction ? 'https://your-homepage.netlify.app'     : 'http://localhost:4201'],
    ['destinations', isProduction ? 'https://your-destinations.netlify.app' : 'http://localhost:4202'],
  ],
};

export default config;
```

**Alternative — use Netlify environment variables** (avoids hardcoding URLs):

```ts
const isProduction = process.env['NODE_ENV'] === 'production';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: [
    ['homepage',     isProduction ? process.env['HOMEPAGE_URL']!     : 'http://localhost:4201'],
    ['destinations', isProduction ? process.env['DESTINATIONS_URL']! : 'http://localhost:4202'],
  ],
};
```

Set `HOMEPAGE_URL` and `DESTINATIONS_URL` in each site's Netlify environment variables.

---

## 6. Deploy Order

Module Federation requires remotes to be live before the shell tries to load them.

1. Deploy **remote apps first** (homepage, destinations, etc.)
2. Wait for their deployments to succeed
3. Copy the deployed URLs into `module-federation.config.ts` (or set env vars)
4. Deploy **shell last**

After deploying remotes, verify `remoteEntry.mjs` is accessible:
```
https://your-homepage.netlify.app/remoteEntry.mjs
https://your-destinations.netlify.app/remoteEntry.mjs
```
If these return 404, check the publish directory setting.

---

## 7. Local Build Verification

Before pushing, confirm the production build works locally:

```bash
npm ci --include=dev
npm run build:homepage
npm run build:destinations
npm run build:shell
```

Each `dist/apps/<app>/` should contain:
- `index.html`
- `main.js`
- `remoteEntry.mjs` *(remotes only)*

---

## 8. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `NX Could not find Nx modules at "/opt/build/repo"` | `NODE_ENV=production` caused devDeps to be skipped, so nx wasn't installed | Remove `NODE_ENV=production` from `netlify.toml`; use `npm ci --include=dev` |
| `sh: nx: not found` | nx not in devDependencies or install failed | Add `nx` to root `devDependencies`; use `npm ci --include=dev` |
| `EACCES: permission denied, open '/opt/package-lock.json'` | Build command used `cd ../..`, navigating above the repo root | Remove any `cd` from the build command; Netlify already runs from repo root |
| `When resolving config file … /net` (TOML parse error) | `netlify.toml` has invalid syntax or `publish` path uses `../../` above repo root | Use `dist/apps/<app>` as publish dir (relative to repo root, no `../..`) |
| CORS errors loading `remoteEntry.mjs` | No CORS headers on remote sites | Add `Access-Control-Allow-Origin: "*"` headers in root `netlify.toml` |
| Remotes fail to load in shell | Shell deployed before remotes, or wrong production URLs | Deploy remotes first; update shell's `module-federation.config.ts` with real URLs |
| `npm warn exec … will be installed: nx@X.X.X` | Nx not in local node_modules, npm is downloading it fresh | Run `npm ci --include=dev` before `npm exec nx` |

---

## 9. Final Verification Checklist

- [ ] Root `.npmrc` has `legacy-peer-deps=true` (if project uses Angular with peer-heavy libs)
- [ ] Root `package.json` has build scripts for each app
- [ ] Root `netlify.toml` has redirects + CORS headers, **no** `NODE_ENV=production`
- [ ] Each Netlify site has base directory blank (repo root)
- [ ] Each build command uses `npm ci --include=dev && npm run build:<app>`
- [ ] Each publish directory is `dist/apps/<app>` (no `../..`)
- [ ] Remotes deployed before shell
- [ ] Shell's `module-federation.config.ts` has correct production URLs
- [ ] `remoteEntry.mjs` URLs load successfully in browser
- [ ] SPA routing works (test direct URL refresh — should not 404)
