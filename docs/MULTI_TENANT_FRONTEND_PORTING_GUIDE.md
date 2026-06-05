# Multi-Tenant Frontend Porting Guide

How to bring another frontend (Vue legacy, mobile shell, second React app, etc.) under the same multi-tenant umbrella we set up in `frontend-v4` (Lottobook + La Central).

This isn't React-specific — the **concepts** are framework-agnostic. The `frontend-v4` examples show how we wired it in Vite + React; map them to whatever build tool the other frontend uses (webpack, vite, Vue CLI, ESBuild, Metro for React Native, etc.).

---

## 1. The core idea

**One codebase, one build per tenant, one deployment per tenant.** Each tenant is identified by a stable lowercase `tenantCode` (e.g. `lottobook`, `lacentral`). At build time the active tenant is selected via an env var (`VITE_TENANT` in our setup). Everything tenant-specific lives under `themes/<tenantCode>/` so the build can pull in the right config, logo, etc. without touching shared code.

Runtime tenant identity is **never** detected from the URL or user input — it's baked into the bundle at build time. This avoids a class of "tenant A leaked into tenant B" bugs.

---

## 2. What needs to be per-tenant

| Concern | Where it lives in v4 | Why |
|--------|----------------------|-----|
| **Brand name + product title** | `themes/<tenant>/config.ts` → `systemName`, `documentTitle` | Shown in sidebar, browser tab, headers |
| **Logo + favicon** | `themes/<tenant>/assets/logo.png`, `favicon.png` | Replaced at build time |
| **Login background** | `themes/<tenant>/assets/login-background.mp4` (or image) | Brand-specific visual |
| **Default UI language** | `config.ts` → `defaultLanguage` | La Central defaults to English, Lottobook to Spanish |
| **API base URL** | `.env.<tenant>` or CI matrix env var | Each tenant has its own API App Service |
| **CSP / connect-src** | `themes/<tenant>/staticwebapp.config.json` | CSP must allow that tenant's API domain |
| **Feature flags** | `config.ts` → `features.*` | Granular on/off per tenant (e.g. `externalTenantsAdmin`) |

Things that should **NOT** be per-tenant (shared codebase):
- Pages, routes, components, business logic
- Translation keys (just the default language differs)
- API client code (URL is the only difference; injected via env)

---

## 3. Concrete file layout (v4 reference)

```
frontend-v4/
├── src/
│   ├── tenant.types.ts          # TypeScript shape of TenantConfig
│   ├── tenant.ts                # Re-exports the active tenant's config
│   └── themes/
│       ├── lottobook/
│       │   ├── config.ts        # const config: TenantConfig = { ... }
│       │   ├── staticwebapp.config.json
│       │   └── assets/
│       │       ├── favicon.png
│       │       └── logo.png
│       └── lacentral/
│           ├── config.ts
│           ├── staticwebapp.config.json
│           └── assets/
│               ├── favicon.png
│               ├── logo.png
│               └── login-background.mp4
├── .env                         # VITE_API_BASE_URL=http://localhost:5001/api (dev)
├── .env.production              # default URL; CI overrides per tenant
├── vite.config.ts               # reads VITE_TENANT, aliases @tenant, copies assets
└── index.html                   # uses %VITE_APP_TITLE% placeholder
```

`@tenant` is a build-time alias resolved by Vite:
```ts
// vite.config.ts
const tenant = process.env.VITE_TENANT ?? 'lottobook'
alias: { '@tenant': path.resolve(__dirname, `./src/themes/${tenant}`) }
```

So `import tenantConfig from '@tenant/config'` lands in `themes/lottobook/config.ts` or `themes/lacentral/config.ts` depending on the build. **One import, zero conditionals in shared code.**

`index.html` title is replaced at build time:
```html
<title>%VITE_APP_TITLE%</title>
```
And `vite.config.ts` injects the right value by reading the tenant's `config.ts` (looks for `documentTitle`, falls back to `systemName`).

---

## 4. The TenantConfig shape

The interface every tenant must implement. Adding a new field here makes TypeScript yell at any tenant whose `config.ts` is out of date — that's the whole point.

```ts
export interface TenantConfig {
  /** Stable lowercase code used to derive build dirs, DB names, etc. */
  tenantCode: string
  /** Human-readable name shown in headers, titles, copy. */
  systemName: string
  /** Browser tab title. Falls back to systemName if unset. */
  documentTitle?: string
  /** Default UI language; per-user preference stored in localStorage wins. */
  defaultLanguage?: 'es' | 'en' | 'fr' | 'ht'
  versionLabel: string
  versionSubLabel?: string
  versionLink?: string
  login: { logoAlt: string; bareLayout?: boolean }
  sidebar: { title?: string; subtitle: string }
  features: { externalTenantsAdmin: boolean /* add more */ }
}
```

The other frontend should mirror this — same field names, same semantics. If their tech stack can't use TypeScript, define the same shape in JSDoc + a runtime validator.

---

## 5. Build-time tenant selection

The build command is just the default build with `VITE_TENANT` set:

```bash
VITE_TENANT=lottobook  VITE_API_BASE_URL=https://lottery-api-prod.azurewebsites.net/api  npm run build
VITE_TENANT=lacentral  VITE_API_BASE_URL=https://api.lacentralnumbers.com/api          npm run build
```

In CI (GitHub Actions) this becomes a matrix:

```yaml
jobs:
  build-and-deploy:
    strategy:
      matrix:
        include:
          - tenant: lottobook
            api_url: https://lottery-api-prod.azurewebsites.net/api
            token_secret_name: AZURE_STATIC_WEB_APPS_API_TOKEN
          - tenant: lacentral
            api_url: https://api.lacentralnumbers.com/api
            token_secret_name: AZURE_SWA_LACENTRAL_TOKEN
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend-v4
      - run: npm run build
        working-directory: frontend-v4
        env:
          VITE_TENANT: ${{ matrix.tenant }}
          VITE_API_BASE_URL: ${{ matrix.api_url }}
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets[matrix.token_secret_name] }}
          app_location: 'frontend-v4/dist'
          skip_app_build: true
```

Each tenant gets its own Static Web App (or hosting target) with its own deploy token. Adding a new tenant = add one entry to `matrix.include` + create the Azure resource + add the secret.

---

## 6. Assets pipeline

A small Vite plugin copies the active tenant's `favicon.png` and `staticwebapp.config.json` into `dist/` after build:

```ts
const tenantAssetsPlugin = {
  name: 'tenant-assets',
  closeBundle() {
    const tenantDir = path.resolve(__dirname, `./src/themes/${tenant}`)
    const distDir = path.resolve(__dirname, './dist')
    const copies = [
      [path.join(tenantDir, 'assets/favicon.png'),  path.join(distDir, 'favicon.png')],
      [path.join(tenantDir, 'staticwebapp.config.json'), path.join(distDir, 'staticwebapp.config.json')],
    ]
    for (const [src, dest] of copies) {
      if (fs.existsSync(src)) fs.copyFileSync(src, dest)
    }
  },
}
```

For the other frontend, the equivalent is: copy `themes/<tenant>/{favicon.png, host-config.json}` into the build output. Webpack has `copy-webpack-plugin`, Vue CLI has `transformIndexHtml`, etc.

**Gotcha**: `.gitignore` with `*.png` will silently exclude the tenant PNGs and the deploy will fail at the copy step. Either remove the wildcard ignore or add explicit exceptions:
```
*.png
!frontend-v4/src/themes/*/assets/*.png
```

---

## 7. Backend coupling (what the frontend has to know about the API)

The frontend doesn't authenticate the tenant separately — **each tenant has its own API App Service** with its own DB, and the frontend talks to its tenant's URL. The TenantCode the backend reports is configured server-side via `PublicApi__TenantCode` env var.

For the cross-tenant features (e.g. "Grupo" dropdown in Ventas del Día that shows partner tenant data), the frontend hits its **own** API, which acts as a proxy and calls the partner via the public API using an `X-Central-Key` header. The frontend never sees the partner directly — no extra auth needed on the client.

So for the other frontend, the integration is just:
1. Build-time `VITE_API_BASE_URL` (or equivalent) points at the right API
2. JWT auth, login flow, all of that stays unchanged — same as single-tenant
3. If that frontend exposes cross-tenant UI (sales view, results sync, etc.), it queries the existing endpoints on its own API; no new backend wiring needed

---

## 8. Static Web App config per tenant

CSP is per-tenant because each tenant's API lives on a different domain.

```json
// themes/lacentral/staticwebapp.config.json
{
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://api.lacentralnumbers.com wss://api.lacentralnumbers.com; ..."
  },
  "navigationFallback": { "rewrite": "/index.html" }
}
```

For Lottobook, `connect-src` allows `https://lottery-api-prod.azurewebsites.net`. Both files are copied to `dist/` per the asset pipeline above.

The other frontend will need its equivalent (or `nginx.conf` block, or whatever its host uses) and the same per-tenant copy logic.

---

## 9. Step-by-step porting checklist

For the other frontend, in order:

1. **Pick a tenant slug list** that matches v4's exactly (`lottobook`, `lacentral`). Slugs MUST match — they're the contract between deployments.
2. **Create `themes/<tenant>/` folders** with placeholder `config.ts`, `assets/`, and host config file (CSP, nginx, etc.).
3. **Define the `TenantConfig` interface** mirroring v4's. Keep the field names identical.
4. **Add the build-time alias** so `@tenant/config` (or your equivalent import path) resolves to the active tenant's folder. Wire `VITE_TENANT` (or the equivalent env var for your build tool).
5. **Inject the document title** via your build tool's index.html templating, reading from the tenant config.
6. **Configure your API base URL via env**, NOT hardcoded. Use `VITE_API_BASE_URL` per tenant.
7. **Set up the asset copy plugin** (favicon + host config) so the build output ships the right files.
8. **Add a CI matrix** that builds + deploys one job per tenant, with per-tenant env vars and secrets.
9. **Update `.gitignore`** to NOT exclude tenant PNGs.
10. **Provision per-tenant deploys** (Static Web App + custom domain + SSL + DNS) for each tenant.
11. **Smoke test**: build locally for each tenant (`VITE_TENANT=lacentral npm run build`), inspect dist/, verify favicon + title + API URL match.
12. **Deploy**: push to main, verify the matrix runs all tenants in parallel.

---

## 10. What NOT to do

- ❌ Don't detect tenant at runtime from `window.location.hostname`. Brittle, slow, breaks local dev, and one bug leaks tenant A's branding into tenant B.
- ❌ Don't put tenant-specific code paths behind `if (tenant === 'X')`. Always use config flags (`config.features.X`) so adding a tenant doesn't require finding and editing N if-blocks.
- ❌ Don't share assets across tenants by importing from the same path. Always go through `@tenant/...` so the build can swap them.
- ❌ Don't bake tenant secrets (CentralKey, DB passwords) into the frontend. Those live server-side on the tenant's API App Service.
- ❌ Don't deploy all tenants to the same hosting target. Each tenant gets its own — different domain, different SSL, different deploy slot.

---

## 11. Quick reference — v4's exact wiring

For ground truth on how anything above looks in practice:

- Tenant interface: [`src/tenant.types.ts`](../frontend-v4/src/tenant.types.ts)
- Active tenant: [`src/tenant.ts`](../frontend-v4/src/tenant.ts)
- Lottobook config: [`src/themes/lottobook/config.ts`](../frontend-v4/src/themes/lottobook/config.ts)
- La Central config: [`src/themes/lacentral/config.ts`](../frontend-v4/src/themes/lacentral/config.ts)
- Build pipeline + alias + title injection + asset copy: [`vite.config.ts`](../frontend-v4/vite.config.ts)
- CI matrix: [`.github/workflows/deploy-frontend.yml`](../.github/workflows/deploy-frontend.yml)
- Per-tenant CSP: `src/themes/*/staticwebapp.config.json`
- Asset exemption from .gitignore: see root `.gitignore`

The other frontend's maintainer should be able to grep these files to see exactly what we did.
