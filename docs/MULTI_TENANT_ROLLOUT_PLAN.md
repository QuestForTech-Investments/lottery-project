# Multi-Tenant Rollout Plan

**Estado:** Borrador para revisión (V4 — incluye sync de resultados + filtro Grupo en Ventas del Día)
**Autor:** Claude + Oliver
**Última actualización:** 2026-06-02

---

## 1. Visión

Pasar de un sistema mono-cliente (Lottobook) a una arquitectura **multi-deployment independiente**:

- Cada cliente es un sistema completo y autónomo (frontend + API + DB propios, dominio propio, branding propio).
- El código vive en **un solo repositorio** con un sistema de "themes" que permite UI/branding distinto por cliente sin forks.
- **La Central** (`lacentralnumbers.com`) es un cliente más con todas las funcionalidades normales (vende tickets, opera bancas, etc.), y adicionalmente:
   - Su superadmin puede consultar **ventas del día** de los otros clientes (ej. Lottobook) vía un dropdown "Grupo" en la página Ventas del Día.
   - Soporta **sync bidireccional de resultados** con partners: publicar un sorteo en La Central replica a Lottobook automáticamente y viceversa (configurable por partner).
- Toda interacción entre tenants es vía HTTP con API key compartida — sin acoplamiento de DB, sin SSO, sin dependencias en tiempo de boot.
- En V1 hay 2 deployments: **Lottobook** (existente, mínimos cambios funcionales) y **La Central** (nuevo, cliente + visión consolidada).

## 2. Decisiones cerradas

| # | Decisión | Elección |
|---|---|---|
| 1 | DNS | Dominios separados (no subdominios) |
| 2 | Repositorio | Monorepo con `themes/` por tenant |
| 3 | Comunicación central ↔ tenants | HTTP pull con API key compartida |
| 4 | Alcance del central en V1 | (a) Ver ventas del día de partners vía dropdown "Grupo" en página existente. (b) Sync bidireccional de resultados de sorteos con partners. |
| 5 | API | Una imagen, un deployment por tenant (mismo código, distinto `appsettings`) |
| 6 | DB | Una DB Azure SQL por tenant |
| 7 | Frontend | Un build por tenant via `VITE_TENANT=xxx npm run build` |
| 8 | Cliente nuevo | **La Central** — dominio `lacentralnumbers.com` |
| 9 | Lottobook | Se mantiene **igual** (mismo branding, mismo dominio, sin cambios funcionales visibles) |
| 10 | Rol del central | La Central **es un cliente más** (vende, opera bancas, etc.). Su superadmin puede ver las ventas del día de los partners desde el dropdown "Grupo" en la página de Ventas del Día. No hay módulo nuevo, solo un filtro extra. |
| 11 | Login del central | Login propio de cliente, **no SSO**. El usuario superadmin de La Central es el único con acceso a ver Lottobook |
| 12 | Admin de `external_tenants` | Vía UI dentro de La Central, gestionada por el superadmin |
| 13 | Regulatorio | Sin requisitos especiales |
| 14 | Infraestructura V1 | **2 Azure SQL + 2 App Services + 2 Static Web Apps** (Lottobook + La Central) |
| 15 | Compartir resultados | Sync **bidireccional opt-in por partner**. Cuando dos tenants tienen el toggle activo entre sí, publicar un resultado en cualquiera se replica al otro. Granularidad por partner: La Central puede compartir con Lottobook y no con Cliente Z. |
| 16 | Resolución de conflictos | **First-write-wins** por `(lottery_code, draw_code, result_date)`. Si llega un push de un resultado que ya existe, NO sobreescribe — solo loguea si los números difieren (warning para revisar manualmente). |
| 17 | UX de ver ventas de otros tenants | **NO es página separada**. Se agrega un dropdown **"Grupo"** en la página existente de Ventas del Día. Para Lottobook: el dropdown solo contiene "Lottobook". Para La Central: contiene "La Central" + cada partner activo con `can_view_today_sales=true`. La página renderiza igual independientemente del grupo seleccionado, solo cambia el origen de los datos. |

## 3. Arquitectura final

```
┌───────────────────────────┐         ┌───────────────────────────┐
│  lottobook.net (SWA)      │         │  lacentralnumbers.com(SWA)│
│  build: VITE_TENANT=      │         │  build: VITE_TENANT=      │
│           lottobook       │         │           lacentral       │
└────────────┬──────────────┘         └────────────┬──────────────┘
             │                                     │
             ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│  Lottobook API            │         │  La Central API           │
│  (App Service)            │         │  (App Service)            │
│  appsettings: lottobook   │         │  appsettings: lacentral   │
└────────────┬──────────────┘         └────────────┬──────────────┘
             │                                     │
             ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│  lottery-db-lottobook     │         │  lottery-db-lacentral     │
│  (Azure SQL)              │         │  (Azure SQL — incluye     │
│                           │         │   tabla external_tenants) │
└───────────────────────────┘         └───────────────────────────┘

         La Central API consulta a Lottobook por HTTP cuando su
         superadmin selecciona "Lottobook" en el dropdown "Grupo"
         de la página Ventas del Día:

         GET https://api.lottobook.net/api/public/today-sales
            con header X-Central-Key: <key compartida>
```

Las dos columnas son **completamente independientes**. La Central opera como cliente normal todo el tiempo. Solo cuando el superadmin selecciona "Lottobook" en el filtro Grupo, se hace la llamada HTTP a Lottobook. Si Lottobook está caído, La Central sigue funcionando y se muestra un error en esa vista solamente.

## 4. Estructura del monorepo (cambios al árbol)

```
lottery-project/
├── api/                                # SIN cambios estructurales mayores
│   └── src/LotteryApi/
│       ├── Controllers/
│       │   ├── PublicController.cs     # ★ NUEVO — endpoints públicos:
│       │   │                            #     GET  /api/public/today-sales
│       │   │                            #     POST /api/public/results/inbound (sync resultados)
│       │   ├── ExternalTenantsController.cs  # ★ NUEVO — CRUD de partners (compartido en todos)
│       │   └── ResultsController.cs    # ★ MODIFICADO — push outbound al guardar resultado
│       ├── Models/
│       │   └── ExternalTenant.cs       # ★ NUEVO
│       ├── Services/
│       │   └── ResultSyncService.cs    # ★ NUEVO — push outbound + recibir inbound
│       ├── appsettings.Production.json # ★ Por tenant (gitignored ya)
│       └── ...
├── frontend-v4/
│   ├── src/
│   │   ├── components/                 # Compartidos por todos los tenants
│   │   │   └── features/
│   │   │       ├── sales/
│   │   │       │   └── DailySalesMUI.tsx  # ★ MODIFICADO — agregar dropdown "Grupo"
│   │   │       └── external-tenants/   # ★ NUEVO — solo admin (no página de ventas separada)
│   │   │           └── ExternalTenantsAdmin.tsx
│   │   ├── pages/                      # Compartidos
│   │   ├── themes/                     # ★ NUEVO
│   │   │   ├── lottobook/
│   │   │   │   ├── assets/
│   │   │   │   │   ├── logo.svg
│   │   │   │   │   ├── login-bg.jpg
│   │   │   │   │   └── favicon.ico
│   │   │   │   ├── theme.ts            # Colores, tipografía, MUI overrides
│   │   │   │   └── config.ts           # systemName, features.externalTenantsAdmin (true/false)
│   │   │   │                            # (NO Login.tsx en V1 — usa el compartido)
│   │   │   └── lacentral/
│   │   │       ├── assets/
│   │   │       │   ├── logo.svg
│   │   │       │   ├── login-bg.jpg
│   │   │       │   └── favicon.ico
│   │   │       ├── theme.ts
│   │   │       └── config.ts           # systemName='La Central', features.externalTenantsAdmin=true
│   │   │                                # (NO Login.tsx — usa el compartido, solo cambia logo/colores/copy)
│   │   └── tenant.ts                   # ★ Helper tipado que re-exporta theme/config desde @theme,
│   │                                    # da autocompletado de TypeScript y un punto único de import
│   └── vite.config.ts                  # ★ Alias dinámico `@theme` por VITE_TENANT
├── database/
│   └── migrations/
│       ├── 001_baseline.sql            # ★ Schema completo desde cero (idempotente)
│       ├── 002_email_receivers.sql
│       ├── ...                          # Migraciones incrementales que ya existen
│       └── NNN_external_tenants.sql    # ★ Tabla de partners (en TODOS los tenants)
└── scripts/
    └── provision-tenant.ps1            # ★ NUEVO — automatiza onboarding
```

**Notas clave:**
- **No hay página separada de ventas externas**. La página de Ventas del Día gana un dropdown "Grupo" que, según el tenant seleccionado, jala los datos local o desde el partner via HTTP proxy. Mismo render, mismas columnas, mismo formato — solo cambia el origen.
- Para tenants sin partners (Lottobook V1), el dropdown solo muestra el tenant local; visualmente queda igual a hoy.
- Existe la página `ExternalTenantsAdmin` para gestionar la lista de partners (CRUD, flags, api keys). Esa sí es una página nueva, gated por permiso. Lottobook puede tenerla también (para configurar el sync de resultados con La Central) o se hace por SQL si se prefiere.
- En el API, el `ExternalTenantsController` y la tabla `external_tenants` existen en **todos** los deployments — porque Lottobook también necesita conocer a La Central como partner para el sync bidireccional de resultados.

## 5. Fases

### Fase 1 — Cimientos del monorepo (no toca producción)

**Objetivo:** dejar el código listo para empacar múltiples deployments. Lottobook sigue funcionando idéntico durante toda esta fase.

1. **Crear el baseline de migraciones**
   - Exportar el schema actual de `lottery-db` (tablas, índices, FKs, triggers, datos seed: roles, permisos, sorteos base).
   - Volcarlo en `database/migrations/001_baseline.sql` con `IF NOT EXISTS` guards (idempotente).
   - Verificar que `SqlRunner` corre `001_baseline.sql` contra una DB vacía y produce el schema completo.
   - **Criterio:** levantar una DB local nueva y aplicar todas las migraciones → API arranca contra esa DB.

2. **Estructura de `themes/`**
   - Crear `frontend-v4/src/themes/lottobook/` y mover ahí el logo actual, favicon, y todas las constantes de branding hardcodeadas.
   - Crear `themes/lottobook/theme.ts` con la paleta actual (`#51cbce`, etc.).
   - Crear `themes/lottobook/config.ts` con `systemName: 'Lottobook'`, `features: { loans: true, cashback: true, externalTenantsAdmin: true, ... }`. La Central también tendrá `externalTenantsAdmin: true` cuando se cree su theme en Fase 4.
   - **Extraer strings hardcodeados de `Login.tsx`** (cualquier mención literal a "Lottobook", emails de soporte específicos, copy del título, etc.) a `config.ts`. El componente Login ahora lee todo desde `tenantConfig.*` para que La Central pueda parametrizarlo sin crear su propio componente.

3. **Alias `@theme` en vite**
   - Editar `vite.config.ts` para que `@theme` resuelva a `src/themes/${process.env.VITE_TENANT ?? 'lottobook'}`.
   - Reemplazar imports de logo/branding en componentes compartidos por `import logo from '@theme/assets/logo.svg'`.
   - Verificar `npm run dev` y `VITE_TENANT=lottobook npm run build` ambos funcionan idénticos a hoy.

4. **Feature flags por tenant**
   - El menú lateral lee `tenantConfig.features` y oculta entradas deshabilitadas.
   - Las rutas en `App.tsx` también chequean el flag (defense in depth).
   - Backend NO necesita conocer features (cada tenant solo verá lo que su frontend muestre; los endpoints siguen existiendo).

**Criterio global de Fase 1:** PR único, mergea a `main`, redeploya Lottobook con el código nuevo → todo funciona igual visualmente y funcionalmente.

---

### Fase 2 — Endpoint público de ventas del día

**Objetivo:** que cualquier deployment del sistema pueda exponer un resumen de ventas del día protegido por API key.

5. **Crear `PublicController`** en `api/src/LotteryApi/Controllers/PublicController.cs`
   - Endpoint: `GET /api/public/today-sales?date=2026-05-31` (date opcional, default hoy en TZ de negocio).
   - Auth: header `X-Central-Key`, comparado contra `appsettings.PublicApi.CentralKey`. Si no coincide → 401.
   - Sin JWT, sin sesión, sin permisos de usuario.
   - Devuelve:
     ```json
     {
       "tenantCode": "lottobook",
       "tenantName": "Lottobook",
       "date": "2026-05-31",
       "currency": "DOP",
       "totalSold": 123456.78,
       "totalPrizes": 23456.78,
       "totalCommissions": 12345.00,
       "totalNet": 87655.00,
       "ticketCount": 4321
     }
     ```
   - Reutiliza la query existente de `SalesReportsController.GetDailySalesSummary` (filtro por `CreatedAt`, ya alineado con la nueva semántica de ventas).

6. **Configuración**
   - Agregar a `appsettings.Production.json` (sin commitear):
     ```json
     "PublicApi": {
       "CentralKey": "<random 64 chars>",
       "TenantCode": "lottobook",
       "TenantName": "Lottobook"
     }
     ```

7. **Documentación del contrato**
   - Documentar request/response en `docs/PUBLIC_API.md` (o sección de este archivo) para que el central sepa qué esperar.
   - Versionar la ruta: `/api/public/v1/today-sales`. Si en el futuro cambia el contrato, sale `v2`.

**Criterio:** desde Postman, con la key correcta, obtienes el resumen de Lottobook. Sin key, 401.

---

### Fase 3 — Filtro "Grupo" en Ventas del Día + Sync de resultados

**Objetivo:** construir TODO el código de la interacción entre tenants. Gated por feature flags para que Lottobook redeploya sin cambios visibles. Incluye migraciones de schema que se aplican TANTO al baseline (clientes nuevos) COMO a la DB existente de Lottobook (script incremental).

#### 3.0 Cambios de schema en tablas existentes (prerequisito para sync de resultados)

8. **Agregar `draw_code` inmutable a la tabla `draws`** (`database/migrations/NNN_add_draw_code.sql`)
   - Columna `NVARCHAR(50) NULL` inicialmente (para no romper rows existentes).
   - Backfill: `UPDATE draws SET draw_code = UPPER(REPLACE(draw_name, ' ', '_'))` (o lo que decida el operador — debe ser único y estable).
   - Después del backfill: agregar `UNIQUE INDEX (draw_code)` + `ALTER COLUMN NOT NULL`.
   - **Razón**: el sync de resultados usa `(lottery_code, draw_code)` para identificar un sorteo entre tenants. `draw_id` es local a cada tenant y `draw_name` puede cambiar — necesitamos un código inmutable y compartido.
   - Mismo tratamiento para `lottery_code` si no existe ya (verificar en el modelo `Lottery`).
   - Esta migración se aplica a las dos DBs (Lottobook actual + La Central nueva) y a cualquier cliente futuro.

#### 3.1 Tabla `external_tenants` compartida

9. **Migración de schema** (`database/migrations/NNN_external_tenants.sql`, corre en **TODOS** los tenants):
   ```sql
   CREATE TABLE external_tenants (
     external_tenant_id INT IDENTITY PRIMARY KEY,
     tenant_code        NVARCHAR(50)  NOT NULL UNIQUE,
     display_name       NVARCHAR(200) NOT NULL,
     api_base_url       NVARCHAR(500) NOT NULL,
     api_key            NVARCHAR(500) NOT NULL,   -- key para llamar al partner (outbound)
     logo_url           NVARCHAR(500) NULL,
     sort_order         INT NOT NULL DEFAULT 0,
     is_active          BIT NOT NULL DEFAULT 1,

     -- Flags por feature: cada uno habilita una funcionalidad de manera independiente.
     can_view_today_sales BIT NOT NULL DEFAULT 0, -- yo puedo leer su /today-sales
     share_results        BIT NOT NULL DEFAULT 0, -- sync bidireccional de resultados

     created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
     updated_at  DATETIME2 NULL
   );
   ```
   - El `api_key` es la key que se envía como `X-Central-Key` en cada llamada al partner. Cada tenant tiene su propia key inbound en `appsettings.PublicApi.CentralKey`.
   - Lottobook tendrá la fila de La Central. La Central tendrá la fila de Lottobook. Sync mutuo, configurado en ambas DBs.

#### 3.2 Filtro "Grupo" en Ventas del Día (cross-tenant proxy)

10. **Endpoints públicos en `PublicController`** (todos los tenants los exponen)
    - `GET /api/public/today-sales` → totales del día (ya existe en Fase 2).
    - `GET /api/public/today-sales/by-banca?date=...` → breakdown por banca.
    - `GET /api/public/today-sales/by-draw?date=...` → breakdown por sorteo.
    - `GET /api/public/today-sales/by-zone?date=...` → breakdown por zona (opcional V1, depende de si DailySales lo muestra).
    - Todos protegidos con `X-Central-Key`.
    - Reutilizan internamente las queries existentes de `SalesReportsController` para no duplicar lógica.

11. **Backend — `ExternalTenantsController`** (proxy hacia partners)
    - `GET /api/external-tenants` → lista activos (permiso `VIEW_EXTERNAL_TENANTS`).
    - `POST/PUT/DELETE /api/external-tenants` → CRUD (permiso `MANAGE_EXTERNAL_TENANTS`).
    - `GET /api/external-tenants/{id}/today-sales` → proxy a `/api/public/today-sales` del partner.
    - `GET /api/external-tenants/{id}/today-sales/by-banca?date=...` → proxy.
    - `GET /api/external-tenants/{id}/today-sales/by-draw?date=...` → proxy.
    - Cliente HTTP con `IHttpClientFactory`, timeout 5s, sin retries.
    - El `api_key` del partner NUNCA va al browser — solo el API la usa al hacer el proxy.

12. **Frontend — modificar `DailySalesMUI`**
    - Agregar dropdown "Grupo" arriba de los filtros existentes.
    - Cargar opciones al mount: siempre incluye `{ id: 'self', label: tenantConfig.systemName }` + lista de `/api/external-tenants` con `can_view_today_sales=true`.
    - Si el dropdown solo tiene una opción (caso Lottobook V1): ocultarlo para no confundir al usuario.
    - Cuando cambia la selección, swap del data source:
      - `'self'` → endpoints locales existentes (`/api/sales-reports/...`).
      - `'external-<id>'` → endpoints proxy (`/api/external-tenants/{id}/today-sales/...`).
    - Resto del componente (tabla, totales, exports a PDF) no cambia — recibe la misma forma de datos.
    - **Importante**: deshabilitar acciones de mutación cuando se está viendo un tenant externo (no se puede editar tickets de otro sistema desde el grupo selector).

13. **Frontend — página `ExternalTenantsAdmin`**
    - `components/features/external-tenants/ExternalTenantsAdmin.tsx`: CRUD de partners. Generador de api key. Toggles `can_view_today_sales` y `share_results`. Botón "regenerar key" con confirmación.
    - Ruta `/external-tenants` gated por `tenantConfig.features.externalTenantsAdmin`. Ambos tenants la tendrán habilitada en V1 (Lottobook necesita configurar a La Central para el sync de resultados bidireccional).

14. **Permisos nuevos** (seed): `VIEW_EXTERNAL_TENANTS`, `MANAGE_EXTERNAL_TENANTS`. Categoría "Sistemas Externos".
    - El seed se aplica en dos momentos:
      - Para clientes nuevos (La Central): durante el provisioning script (parte del seed inicial).
      - Para clientes existentes (Lottobook): incluido como `INSERT IF NOT EXISTS` en la migración `NNN_external_tenants.sql` para que al correrla, Lottobook gane los permisos sin pasos manuales. Asignar automáticamente al rol "Admin" si existe.
    - El dropdown "Grupo" en Ventas del Día NO requiere permiso extra — quien ya puede ver Ventas del Día puede usar el filtro. Si una opción no tiene `can_view_today_sales=true` no aparece.

#### 3.3 Módulo "Resultados Compartidos" (lógica compartida, activación por flag de partner)

15. **Endpoint público inbound — `POST /api/public/results/inbound`**
    - Auth: header `X-Central-Key` validado contra `appsettings.PublicApi.CentralKey`.
    - Además, valida que el `partner_code` enviado en el body coincida con un `external_tenants` activo y con `share_results=true`. Si no → 403.
    - Body:
      ```json
      {
        "partnerCode": "lacentral",
        "lotteryCode": "REAL",
        "drawCode": "REAL_TARDE",
        "resultDate": "2026-06-02",
        "num1": "23",
        "num2": "45",
        "num3": "67",
        "publishedAt": "2026-06-02T16:30:12Z",
        "publishedBy": "user@lacentral"
      }
      ```
    - Lógica:
      1. Resolver `draw_id` local por `(lottery_code, draw_code)`.
      2. Buscar resultado existente por `(draw_id, result_date)`.
      3. Si NO existe → insertar (first-write-wins, todo OK).
      4. Si existe Y los números coinciden → no-op.
      5. Si existe Y los números **NO** coinciden → loguear warning, NO sobreescribir. Inserta una fila en `result_sync_conflicts` (tabla auxiliar) para que el operador revise.

16. **Service `ResultSyncService`** (en `api/src/LotteryApi/Services/`)
    - `PushResultAsync(int resultId)`: llamado fire-and-forget desde `ResultsController` después de guardar un resultado.
    - Obtiene partners con `share_results=true && is_active=true`.
    - Para cada uno, POSTea al `/api/public/results/inbound` con su `api_key`.
    - Timeout 5s, sin retry agresivo (si falla, el operador puede reenviar manualmente desde la UI — ver item 19).
    - Loguea cada push con resultado (success/fail) en `result_sync_log` para auditoría.
    - Método público adicional `RetryPushAsync(int resultSyncLogId)` para reintentos desde la UI.

17. **Modificación de `ResultsController`**
    - En los 3 puntos donde se guarda un resultado (create, update, approve), después del `SaveChanges`, fire-and-forget `ResultSyncService.PushResultAsync(resultId)`.
    - Solo se ejecuta si hay partners con `share_results=true`. Si no hay, no se hace nada.
    - Nuevo endpoint `POST /api/results/{id}/resync` (permiso `MANAGE_RESULTS`) que vuelve a invocar `PushResultAsync(resultId)` — para el botón de re-push manual.

18. **Tabla auxiliar `result_sync_log`** (mismo migration que `external_tenants`):
    ```sql
    CREATE TABLE result_sync_log (
      sync_log_id INT IDENTITY PRIMARY KEY,
      direction   NVARCHAR(10) NOT NULL,  -- 'outbound' | 'inbound'
      partner_code NVARCHAR(50) NOT NULL,
      result_date  DATE NOT NULL,
      lottery_code NVARCHAR(50) NOT NULL,
      draw_code    NVARCHAR(50) NOT NULL,
      status       NVARCHAR(20) NOT NULL,  -- 'sent' | 'received' | 'conflict' | 'failed'
      error_message NVARCHAR(2000) NULL,
      payload_hash NVARCHAR(64) NULL,
      created_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    ```
    - Y `result_sync_conflicts` (similar pero solo para los casos de discrepancia, para revisar manualmente).

19. **Frontend — toggles del partner y herramientas de sync**
    - En `ExternalTenantsAdmin`, el form de cada partner incluye dos switches: "Compartir resultados (sync bidireccional)" y "Ver ventas del día". Cada uno corresponde a `share_results` / `can_view_today_sales`.
    - Tooltip explicativo: "Para que la sincronización funcione, el partner también debe tener este toggle activo en SU sistema, apuntando a este tenant."
    - Nueva página `ResultSyncLogPage.tsx` (admin) con dos tabs:
      - **Log**: tabla del `result_sync_log` con filtros por dirección, partner, status, fecha. Botón "Reintentar" en cada fila `failed` que llama `POST /api/results/{id}/resync`.
      - **Conflictos**: tabla del `result_sync_conflicts` con detalles (números locales vs los recibidos del partner). Acciones: "Aceptar local" (descarta el conflicto, mantiene lo local), "Aceptar del partner" (sobreescribe local con el del partner), "Marcar revisado" (no cambia datos, solo silencia el warning).
    - En la página de Resultados, agregar botón "Reenviar a partners" en cada resultado publicado (visible solo si hay partners con `share_results=true`).

#### 3.4 Configuración por tenant

20. **`themes/lottobook/config.ts`**:
    - `features.externalTenantsAdmin = true`. Lottobook expone la página admin para que el superadmin de Lottobook agregue a La Central como partner del sync de resultados. (Evita configurar por SQL manual, que es más frágil.)
    - El dropdown "Grupo" en Ventas del Día aparecerá automáticamente si Lottobook llega a tener partners con `can_view_today_sales=true` (en V1 no los tendrá; el dropdown estará oculto).

21. **`themes/lacentral/config.ts`**:
    - `features.externalTenantsAdmin = true`. El superadmin de La Central administra desde ahí los partners.
    - Va a tener al menos un partner activo (Lottobook) → el dropdown "Grupo" aparece en Ventas del Día con 2 opciones.

#### 3.5 Aplicación de migraciones a Lottobook existente

22. **Script de migración incremental para Lottobook**
    - Las migraciones nuevas (`NNN_add_draw_code.sql`, `NNN_external_tenants.sql`) deben correrse contra la DB actual `lottery-db` de Lottobook DURANTE el deploy de Fase 3.
    - Orden recomendado:
      1. Backup de `lottery-db` antes de cualquier cosa (Azure SQL → "Restore point in time" lo cubre, pero crear un snapshot manual de seguridad).
      2. `cd api/SqlRunner && dotnet run --connection "<conn-string-lottobook>"` → corre las nuevas migraciones idempotentes.
      3. Verificar manualmente: `SELECT * FROM external_tenants` (debe devolver 0 filas pero no error), `SELECT draw_code FROM draws WHERE draw_code IS NULL` (debe devolver 0).
      4. Deploy del API con el código nuevo.
      5. Smoke test de Lottobook: login, ver ventas del día, crear ticket → todo igual a antes.
    - Si algo sale mal, revertir el deploy del API. La migración no rompe nada (todas las tablas/columnas nuevas son aditivas, sin breaking changes).

**Criterio Fase 3:** PR mergeado a `main`. Migración corrida en Lottobook. Lottobook redeploya y no cambia nada visible (los partners están vacíos, dropdown oculto). El código está listo: agregar partners en Fase 4 activa todo.

---

### Fase 4 — Deployment de La Central

**Objetivo:** levantar La Central como cliente operativo + activar partners para que se sincronicen ventas y resultados con Lottobook.

23. **Theme de La Central**
    - Crear `frontend-v4/src/themes/lacentral/` con logo propio, favicon, login-bg, theme.
    - `config.ts`: `systemName: 'La Central'`, `features.externalTenantsAdmin = true`, otros features según necesidad.
    - **NO crear `Login.tsx` propio** — La Central usa el login compartido con su logo y colores. Los "detallitos" que difieran entre Lottobook y La Central (copy del título, color del botón, link de soporte, etc.) están parametrizados via `config.ts` y `theme.ts` desde Fase 1.

24. **Provisioning script `scripts/provision-tenant.ps1`**
    - Argumentos: `--tenant-code lacentral --db-name lottery-db-lacentral --admin-email <admin> --api-base-url <url>`.
    - Acciones:
      1. Crea la DB (si no existe).
      2. Corre `database/migrations/*.sql` en orden (baseline + incrementales, incluye `external_tenants`, `result_sync_log` y `result_sync_conflicts` porque ahora son compartidas).
      3. Inserta admin user con password temporal.
      4. Inserta seed: sorteos base, roles, permisos (incluyendo `VIEW_EXTERNAL_TENANTS` / `MANAGE_EXTERNAL_TENANTS`, asignados al rol "Admin").
      5. Genera y guarda en pantalla el `CentralKey` (random 64 chars) que va al `appsettings.PublicApi.CentralKey` de este tenant.
      6. Imprime la connection string para configurar en el App Service.

25. **Provisioning Azure de La Central**
    - DB `lottery-db-lacentral` (Azure SQL, mismo server que Lottobook está bien para arrancar).
    - App Service `lacentral-api` con el publish del API.
    - Static Web App `lacentral-frontend`.
    - Configurar custom domain `lacentralnumbers.com` + SSL cert (Azure-managed).
    - Configurar `appsettings.Production.json` del API: connection string, SMTP, etc.

26. **Build + deploy del frontend**
    - `VITE_TENANT=lacentral npm run build` → deploy a la SWA.
    - Verificar branding correcto en `lacentralnumbers.com`.

27. **Habilitar endpoint público en Lottobook** (paso ligero)
    - Agregar `PublicApi.CentralKey: <random 64 chars>` al `appsettings` de Lottobook (App Service config).
    - Redeploy de Lottobook (sin cambios de código, solo config).
    - Verificar con `curl -H "X-Central-Key: ..." https://api.lottobook.net/api/public/today-sales`.

28. **Configurar partners en ambos lados** (la sincronización requiere ambos)
    - **En La Central** → External Tenants Admin → "Agregar Lottobook": code=`lottobook`, api_base_url=`https://api.lottobook.net`, api_key=`<la key inbound de Lottobook>`, `can_view_today_sales=true`, `share_results=true`.
    - **En Lottobook** → External Tenants Admin → "Agregar La Central": code=`lacentral`, api_base_url=`https://api.lacentralnumbers.com`, api_key=`<la key inbound de La Central>`, `can_view_today_sales=false`, `share_results=true`.
    - **Importante**: el sync es bidireccional y requiere ambas filas. Si solo se configura una, la dirección configurada funciona pero la otra falla con 403.

29. **Smoke test end-to-end**
    - Login en La Central como superadmin → crear ticket → confirmar que opera independiente.
    - Abrir Ventas del Día → ver dropdown "Grupo" con "La Central" y "Lottobook".
    - Seleccionar "Lottobook" → la página renderiza los totales del día de Lottobook (datos vienen via proxy HTTP).
    - Seleccionar "La Central" → vuelve a mostrar los datos locales.
    - Apagar API de Lottobook temporalmente → al seleccionar "Lottobook" debe mostrar un error claro (no crashear la página).
    - Test del sync de resultados:
      - Publicar un resultado en La Central → verificar que aparece en Lottobook automáticamente (en segundos).
      - Publicar un resultado en Lottobook → verificar que aparece en La Central.
      - Publicar el mismo sorteo en ambos al mismo tiempo con números distintos → verificar que el primero gana, el segundo loguea en `result_sync_conflicts`.
      - Apagar `share_results` para Lottobook en La Central → publicar resultado en La Central → confirmar que NO se replica a Lottobook.

**Criterio Fase 4:** La Central opera como cliente independiente. El superadmin ve el día de Lottobook seleccionándolo del dropdown "Grupo" en Ventas del Día. Sync de resultados funciona bidireccional. Lottobook sigue intacto.

---

## 6. Operación post-lanzamiento

### Cómo se hace un cambio de código compartido
1. PR a `main`.
2. CI corre tests y builds para los 2 tenants en paralelo (matrix: lottobook, lacentral).
3. Merge → CD despliega los 2 frontends y los 2 APIs simultáneamente (mismo binario en los APIs).
4. Las migraciones de DB se corren por tenant (con SqlRunner, contra cada connection string).

### Cómo se onboardea un cliente nuevo (a futuro)
1. Ejecutar `scripts/provision-tenant.ps1`.
2. Crear carpeta `themes/<código>/` con assets y config.
3. Agregar al matrix de CI/CD.
4. Configurar Azure (App Service + SWA + DNS).
5. Configurar `PublicApi.CentralKey` en su `appsettings`.
6. **Si se quiere visibilidad / sync con La Central** (recomendado pero opcional):
   - En La Central → External Tenants Admin → "Agregar `<código>`" con su `api_base_url` + la `api_key` inbound del nuevo cliente. Activar flags según necesidad (`can_view_today_sales`, `share_results`).
   - En el cliente nuevo → External Tenants Admin → "Agregar La Central" con la `api_key` inbound de La Central + los mismos flags activos (recordar que el sync es bidireccional y requiere ambas filas).

### Cómo se actualiza el branding de un cliente
- Solo editar `frontend-v4/src/themes/<código>/` y redesplegar ese frontend. El otro tenant no se toca.

### Cómo se aplica una migración de schema
- `cd api/SqlRunner && dotnet run --connection "Server=...;Database=lottery-db-lottobook;..."`
- Repetir contra `lottery-db-lacentral`. Automatizable en CD si los secrets están bien organizados.
- Todas las migraciones del baseline son compartidas (corren en todos los tenants). No hay migraciones tenant-specific en V1.

### Cómo el superadmin de La Central agrega un nuevo cliente externo
1. Login en `lacentralnumbers.com` como superadmin.
2. Menú → "Sistemas Externos" → "Administrar Partners".
3. Click "Agregar partner" → llenar code, name, API URL, API key.
4. Activar flags según necesidad:
   - `can_view_today_sales`: el partner aparece en el dropdown "Grupo" de Ventas del Día.
   - `share_results`: sync bidireccional de resultados.
5. Si `share_results=true`: coordinar con el admin del partner para que él también agregue una fila apuntando a La Central con el mismo flag activo (el sync requiere ambos lados).

### Cómo el superadmin de La Central ve las ventas del día de Lottobook
1. Login en La Central.
2. Menú → Ventas → Ventas del Día.
3. Dropdown "Grupo" arriba → seleccionar "Lottobook".
4. La página recarga con los datos de Lottobook (mismas tablas y totales que vería un usuario de Lottobook).
5. Seleccionar "La Central" para volver a los datos propios.

### Cómo se activa/desactiva el sync de resultados con un partner
- Toggle `share_results` en la fila del partner desde External Tenants Admin.
- Si desactivas en La Central → La Central deja de empujar Y de aceptar pushes inbound del partner.
- Para que el corte sea total, el partner también debe desactivar en su lado (defense in depth: el endpoint inbound valida el flag local antes de aceptar).

### Cómo se resuelve un conflicto de resultados
- Si dos tenants publicaron números distintos para el mismo `(lottery, draw, date)`, ambos quedan con SUS números (first-write-wins local).
- La discrepancia se loguea en `result_sync_conflicts` con detalles.
- Página "Conflictos de Sync" en admin muestra los pendientes → el operador revisa y corrige manualmente el que esté equivocado.

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Olvidar correr una migración en un tenant | Job de CD que corre `SqlRunner` contra cada connection string definido en secrets. Migraciones idempotentes. |
| Drift entre `themes/` y código compartido | PR review checklist: "¿cambios en componentes shared respetan props que cada theme espera?" + tests visuales con Playwright por tenant. |
| Cliente exige feature exclusiva que toca lógica de negocio | Primero intentar resolverlo con `tenantConfig.features.<x>` flag. Solo si es genuinamente único, abrir issue para evaluar si vale la pena. |
| API key del central comprometida | Rotación: regenerar en `external_tenants`, actualizar `appsettings` del tenant, redeploy. Tener documentado el procedimiento. |
| Un tenant cae y el central queda colgado esperando | Timeout de 5s + circuit breaker simple por tenant en el central. Mostrar "—" o ícono de error en la fila. |
| Bug en código compartido afecta a todos | Mismo riesgo que tienes hoy con Lottobook, pero ahora multiplicado por N. Compensa con tests + canary deploy (desplegar primero al cliente más chico). |
| Datos sensibles en logs cruzados | Cada deployment es independiente, logs van a su propio App Insights. No hay riesgo de cruce. |
| Conflicto de resultados (dos tenants publican números distintos) | First-write-wins local + tabla `result_sync_conflicts` para revisión manual. Operador resuelve desde UI. |
| Push de resultado falla por red intermitente | Loguear en `result_sync_log` con `status='failed'`. Sin retry agresivo: si los scrapers locales están corriendo en ambos lados, el partner detecta el faltante por su cuenta. Posible job nightly de "reconciliación" para reintentar fallos. |
| Sincronización en bucle (A pushea a B, B pushea de vuelta a A) | El handler inbound NO dispara push outbound. Solo `ResultsController.PostResult` (acción del operador o scraper local) dispara push. Inbound es read-only side. |

## 8. Estimación de esfuerzo

| Fase | Esfuerzo |
|---|---|
| 1 — Cimientos del monorepo (baseline migraciones, themes, vite alias, extraer strings del Login) | ~1-2 días |
| 2 — Endpoint público de ventas del día | ~½ día |
| 3 — `draw_code` + filtro "Grupo" + sync de resultados + admin partners + sync log page + migración a Lottobook | ~4-6 días |
| 4 — Deployment de La Central (provisioning + theme + smoke test) | ~1-2 días |
| **Total ingeniería** | **~6-10 días de trabajo concentrado** |

No incluye: diseño del theme de La Central (logo, colores, copy del login), configuración de Azure (lo hace Oliver: crear DB, App Service, SWA, DNS, SSL).

## 9. Pendientes de definir antes de arrancar

- [x] Nombre del segundo cliente y dominio. → **La Central, `lacentralnumbers.com`**
- [x] ¿Se mantiene Lottobook como "primer cliente" o se renombra todo el branding actual? → **Lottobook se queda igual**
- [x] ¿El Central tiene login propio o se accede vía SSO/admin global? → **Login propio, sin SSO; el superadmin tiene los permisos extra**
- [x] ¿Quién administra `external_tenants`? → **Superadmin de La Central, vía UI**
- [ ] **Estrategia de backups** — ⚠️ ÚNICO pendiente bloqueante para go-live de La Central (no para empezar Fase 1). Sugerencia: política Azure SQL automática "Long-term retention" por DB (default ya cubre 7-35 días). Decidir antes de Fase 4: ¿retención más larga? ¿geo-replication? ¿qué SLA prometemos a clientes?
- [x] Costo Azure proyectado. → **2 SQL + 2 App Service + 2 SWA. Sin límite duro fijado.**
- [x] ¿Regulatorio/contractual? → **Sin requisitos especiales**

### Pendiente menor sin bloqueo
- [x] ¿Login custom de La Central? → **Logo propio + algunos detalles, pero mismo layout que Lottobook.** Reusa el `Login.tsx` compartido, solo se parametriza via theme (logo, colores, copy del título). NO crear `themes/lacentral/Login.tsx`.

---

## Visto bueno

- [ ] Revisado por Oliver
- [ ] Aprobado para empezar Fase 1
