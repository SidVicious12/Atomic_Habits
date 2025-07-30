# Configuration Guide for Claude Usage

Below is a concise “Claude-aware” reference to every configuration-type file in this repository.  For each file you will find:

* **Purpose** – what the file controls / why it matters
* **When to use it** – typical situations for consulting or editing it (especially with Claude)
* **Where it is consumed** – the runtime or build-time location that reads it

---

## Top-level project configuration

| File | Purpose | When to use | Consumed by |
|------|---------|-------------|-------------|
| `.env` | Environment variables (API keys, DB URLs, ports) | Whenever running locally or deploying; never commit secrets | `vite`, Node scripts, test runners via `dotenv` |
| `.eslintrc.cjs` | ESLint rules for TypeScript/React front-end | Before fixing style issues with Claude; during `npm run lint` | ESLint CLI and IDE plug-ins |
| `tailwind.config.js` | Design-system tokens (colors, spacing, break-points) | When adding brand colors/utilities | Tailwind at build-time & runtime class names |
| `postcss.config.js` | Declares PostCSS plug-ins (`tailwindcss`, `autoprefixer`) | Rarely changed—only for CSS tool-chain tweaks | PostCSS in the Vite pipeline |
| `vite.config.js` | Vite bundler options (aliases, SSR flags, plug-ins) | When adjusting dev server, proxy, output dir | `vite` during `npm run dev` / `build` |
| `tsconfig.json` | Primary TypeScript compiler options | Change module resolution, base URL, strictness | `tsc`, IDE IntelliSense, Vite type-check |
| `tsconfig.node.json` | Node-specific tsconfig referenced from root | If you add Node TypeScript scripts | `ts-node`, `tsc --build` |
| `package.json` / `package-lock.json` | Dependency list and lockfile | On library upgrades/additions | `npm`, `vite`, CI |
| `components.json` | Maps UI components for docs/generators | When updating design-system docs | Storybook or custom generators |
| `create_daily_logs_table.sql` & other *.sql | DB schema migrations/seeds | When evolving database | `psql`, migration tools |
| `convert.js`, `debug-tables.mjs`, `transformOutput.js`, `scripts/*` | Utility/ETL Node scripts | Run via `node`; review when debugging data flows | Node runtime |

---

## Backend (`habit-tracker-backend/`)

* `.gitignore` – ignore rules for the back-end directory.
* No dedicated `package.json`, indicating a minimal or non-Node back-end. Create one if you expand the server.

---

## Data files (`src/data/*.json`)

These JSON files are **application data**, not configuration. Claude should not modify them unless you explicitly request changes.

---

## Quick decision matrix: when to involve Claude

* **Lint / style fixes** → `.eslintrc.cjs`
* **Type-checking or path-alias issues** → `tsconfig.json` / `tsconfig.node.json`
* **Theme or design tokens** → `tailwind.config.js` (+ maybe `postcss.config.js`)
* **Build / dev-server tweaks** → `vite.config.js`
* **Secrets or environment URLs** → `.env`
* **Dependency changes** → `package.json`

---

## Suggested workflow

1. Open `.env`, `vite.config.js`, `tailwind.config.js`, and `tsconfig.json` in your editor so Claude can cross-reference them when coding.
2. When adding a library, ask Claude to update `package.json` **and** any `tsconfig` path mappings.
3. For styling work, mention the relevant Tailwind tokens so Claude updates both the component code and `tailwind.config.js`.
4. For build errors, provide the error output plus the relevant config—Claude can usually pinpoint the mis-configuration.

---

> **Need more detail?**  Ask Claude to dive into any specific file, section, or example usage.
