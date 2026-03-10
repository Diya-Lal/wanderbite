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
- Angular ~21.1.0, Nx 22.5.x
- Bundler: **Webpack** (`@angular-devkit/build-angular`)
- Unit tests: **Jest** (`jest-preset-angular`)
- E2E tests: **Cypress** (`@nx/cypress`)
- Package manager: **npm**

## Project Structure
```
apps/
  shell/          # Main Angular host app (webpack, jest, cypress)
libs/             # Shared libraries
```

## Common Commands
```bash
# Serve
npm exec nx serve shell

# Build
npm exec nx build shell

# Unit tests
npm exec nx test shell

# E2E tests
npm exec nx e2e shell

# Generate a library
NX_IGNORE_UNSUPPORTED_TS_SETUP=true npm exec nx g @nx/angular:lib libs/<name> --unitTestRunner=jest --no-interactive

# Generate a component in a lib
NX_IGNORE_UNSUPPORTED_TS_SETUP=true npm exec nx g @nx/angular:component <name> --project=<lib>
```

## Important Notes
- Always prefix `nx` commands with `NX_IGNORE_UNSUPPORTED_TS_SETUP=true` when generating Angular artifacts (workspace uses project references)
- Shell `app.config.ts` must have `provideHttpClient(withFetch())` if any services use HttpClient
- After fixing build issues, run `npm exec nx reset` to clear stale cache
