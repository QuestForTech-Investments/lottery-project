# Azure Deployment - Lottery System

Documentacion del despliegue en Azure del sistema de loteria.

**Fecha de despliegue:** 2026-01-10
**Region:** West US 2

---

## URLs de Produccion

| Componente | URL |
|------------|-----|
| **Frontend** | https://proud-coast-0a06d9c1e.4.azurestaticapps.net |
| **API** | https://lottery-api-prod.azurewebsites.net |
| **Swagger** | https://lottery-api-prod.azurewebsites.net/swagger |

---

## Recursos de Azure

### Suscripcion
- **Nombre:** IotSlots
- **ID:** e77b9ae7-629f-4fe4-b6d2-048b3e8de197
- **Resource Group:** rg-lottery-api

### App Service (API .NET 8)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | lottery-api-prod |
| **Plan** | lottery-app-plan |
| **SKU** | Premium V3 (P1v3) |
| **Region** | West US 2 |
| **Runtime** | .NET 8.0 (Linux) |
| **Always On** | Habilitado |
| **HTTP/2** | Habilitado |

### Static Web App (Frontend React)
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | lottery-frontend-prod |
| **SKU** | Standard |
| **Region** | West US 2 |
| **Hostname** | proud-coast-0a06d9c1e.4.azurestaticapps.net |

### Azure SQL Database
| Propiedad | Valor |
|-----------|-------|
| **Server** | lottery-sql-1505.database.windows.net |
| **Database** | lottery-db |
| **SKU** | Standard S2 (50 DTUs) |
| **Region** | West US 2 |

### Azure Redis Cache
| Propiedad | Valor |
|-----------|-------|
| **Nombre** | lottery-redis-cache |
| **Hostname** | lottery-redis-cache.redis.cache.windows.net |
| **Puerto** | 6380 (SSL) |
| **SKU** | Basic C0 (250 MB) |
| **Region** | West US 2 |

---

## Credenciales

### Base de Datos SQL
```
Server:   lottery-sql-1505.database.windows.net,1433
Database: lottery-db
User:     lotteryAdmin
Password: [Obtener desde Azure Portal > SQL Server > Connection Strings]
```

**Connection String:**
```
Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=[SQL_PASSWORD];Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### Aplicacion (Login)
```
Usuario:  admin
Password: [Configurado en la base de datos]
```

### JWT Configuration
```
Key:      [Configurado en Azure App Service > Configuration]
Issuer:   LotteryApi
Audience: LotteryApi
Expiry:   0.25 hours (15 minutos)
```

### Redis Cache
```
Hostname: lottery-redis-cache.redis.cache.windows.net
Port:     6380
Password: [Obtener desde Azure Portal > Redis Cache > Access Keys]
SSL:      True
```

**Connection String:**
```
lottery-redis-cache.redis.cache.windows.net:6380,password=[ACCESS_KEY],ssl=True,abortConnect=False
```

### Static Web App - Deployment Token
```
[Obtener desde Azure Portal > Static Web App > Manage deployment token]
```

---

## Configuracion de CORS

Origins permitidos en la API:
- https://proud-coast-0a06d9c1e.4.azurestaticapps.net
- http://localhost:4001
- http://localhost:3000

---

## Costos Estimados (USD/mes)

| Servicio | SKU | Costo |
|----------|-----|-------|
| App Service Plan | P1v3 | ~$81 |
| Static Web App | Standard | ~$9 |
| Azure SQL | S2 (50 DTUs) | ~$75 |
| Azure Redis Cache | Basic C0 | ~$16 |
| **Total** | | **~$181** |

---

## Rendimiento Medido (2026-01-10)

### Frontend (Static Web App)
| Metrica | Tiempo |
|---------|--------|
| Carga total | 362ms |
| DOM Content Loaded | 361ms |
| Time to First Byte | 36ms |
| DNS Lookup | 94ms |

### API (App Service)
| Endpoint | Tiempo |
|----------|--------|
| auth/login (cold) | ~4,200ms |
| auth/login (warm) | ~300-500ms |
| betting-pools | ~665ms |
| reports/sales | ~336-757ms |

---

## Comandos Utiles

### Desplegar API
```bash
# Build
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
cd api/src/LotteryApi
dotnet publish -c Release -o ./publish

# Crear zip
python3 -c "import shutil; shutil.make_archive('deploy', 'zip', 'publish')"

# Desplegar
az webapp deploy --resource-group rg-lottery-api --name lottery-api-prod --src-path deploy.zip --type zip
```

### Desplegar Frontend
```bash
cd frontend-v4

# Build con URL de produccion
VITE_API_BASE_URL=https://lottery-api-prod.azurewebsites.net/api npm run build

# Desplegar
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token "$SWA_DEPLOYMENT_TOKEN" \
  --env production
```

### Ver logs de la API
```bash
az webapp log tail --name lottery-api-prod --resource-group rg-lottery-api
```

### Reiniciar API
```bash
az webapp restart --name lottery-api-prod --resource-group rg-lottery-api
```

### Ver configuracion
```bash
az webapp config show --name lottery-api-prod --resource-group rg-lottery-api
az webapp config appsettings list --name lottery-api-prod --resource-group rg-lottery-api
```

---

## GitHub Actions (Pendiente)

Los workflows estan creados pero no commiteados:
- `.github/workflows/deploy-api.yml`
- `.github/workflows/deploy-frontend.yml`

### Secrets requeridos en GitHub:
1. `AZURE_WEBAPP_PUBLISH_PROFILE` - Obtener con:
   ```bash
   az webapp deployment list-publishing-profiles --name lottery-api-prod --resource-group rg-lottery-api --xml
   ```

2. `AZURE_STATIC_WEB_APPS_API_TOKEN` - Ya documentado arriba

---

## Notas Importantes

1. **Always On habilitado:** La API no tendra cold starts despues de la primera peticion.

2. **Endpoint faltante:** `/api/banks` retorna 404. Considerar implementar o remover del frontend.

3. **Misma region:** Todos los recursos estan en West US 2 para minimizar latencia.

4. **HTTPS:** Ambos servicios usan HTTPS por defecto.

5. **Backup:** Azure SQL tiene backups automaticos habilitados.

---

---

## Correcciones Post-Despliegue (2026-01-10)

### Problema: Rutas API hardcodeadas
Algunos servicios usaban `/api/...` en lugar de la variable de entorno, causando que las peticiones fueran al frontend en lugar de la API.

### Archivos corregidos:
1. `frontend-v4/.env.production` - URL absoluta de API
2. `frontend-v4/public/staticwebapp.config.json` - Routing SPA
3. `frontend-v4/src/services/bettingPoolService.ts` - Variable de entorno
4. `frontend-v4/src/services/prizeService.ts` - Variable de entorno
5. `frontend-v4/src/components/features/betting-pools/EditBettingPool/hooks/useEditBettingPoolForm.ts` - Variable de entorno

### Solucion:
Todas las llamadas `fetch()` ahora usan:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
fetch(`${API_BASE}/endpoint`)
```

---

## Troubleshooting CORS (2026-01-12)

### Problema: Error 405 o "No se pudo conectar con el servidor"

Cuando se usa un dominio personalizado (ej: `lottobook.net`), pueden aparecer errores de CORS.

### Causa Raiz

**Conflicto entre CORS de Azure Platform y CORS de la aplicacion .NET.**

Azure App Service tiene su propio sistema de CORS a nivel de plataforma. Si la aplicacion .NET tambien tiene CORS configurado, ambos pueden entrar en conflicto y causar errores 400 en las solicitudes OPTIONS (preflight).

### Solucion

**Usar SOLO el CORS de la aplicacion .NET, NO el de Azure Platform.**

1. **Limpiar CORS de Azure Platform:**
```bash
az webapp cors remove --name lottery-api-prod --resource-group rg-lottery-api \
  --allowed-origins "*" "https://..." "http://localhost:..."
```

2. **Verificar que CORS de Azure este vacio:**
```bash
az webapp cors show --name lottery-api-prod --resource-group rg-lottery-api
# Debe mostrar: "allowedOrigins": []
```

3. **Configurar CORS en Program.cs:**
```csharp
// CORS debe ser el PRIMER middleware despues de app.Build()
app.UseCors("AllowAll");

// Despues van los demas middlewares
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseIpRateLimiting();
app.UseAuthentication();
app.UseAuthorization();
```

4. **Politica CORS en servicios:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

### Verificar que CORS funciona

```bash
# Test preflight (debe devolver 204 con headers CORS)
curl -siX OPTIONS "https://lottery-api-prod.azurewebsites.net/api/auth/login" \
  -H "Origin: https://lottobook.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"

# Respuesta esperada:
# HTTP/2 204
# access-control-allow-origin: *
# access-control-allow-methods: POST
# access-control-allow-headers: content-type
```

### Comandos utiles de CORS en Azure

```bash
# Ver configuracion CORS actual
az webapp cors show --name lottery-api-prod --resource-group rg-lottery-api

# Agregar origen (NO recomendado si usas CORS en la app)
az webapp cors add --name lottery-api-prod --resource-group rg-lottery-api \
  --allowed-origins "https://example.com"

# Remover origen
az webapp cors remove --name lottery-api-prod --resource-group rg-lottery-api \
  --allowed-origins "https://example.com"
```

### Regla de Oro

> **NUNCA uses CORS de Azure Platform Y CORS de .NET al mismo tiempo.**
> Elige uno u otro. Recomendacion: usar CORS de .NET para mayor control.

---

## Content Security Policy (CSP)

El frontend usa CSP configurado en `frontend-v4/public/staticwebapp.config.json`.

### Dominios permitidos actuales:

| Directiva | Dominios |
|-----------|----------|
| `default-src` | 'self', lottobook.net |
| `script-src` | 'self', 'unsafe-inline', 'unsafe-eval', lottobook.net |
| `style-src` | 'self', 'unsafe-inline', fonts.googleapis.com, lottobook.net |
| `font-src` | 'self', data:, fonts.gstatic.com |
| `connect-src` | 'self', lottery-api-prod.azurewebsites.net, lottobook.net |

### Agregar nuevo dominio al CSP

Editar `frontend-v4/public/staticwebapp.config.json` y agregar el dominio a las directivas necesarias.

---

**Ultima actualizacion:** 2026-01-12
