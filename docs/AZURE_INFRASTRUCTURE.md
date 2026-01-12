# Azure Infrastructure - Lottery Project

> Documentación completa de todos los recursos de Azure utilizados en el proyecto de lotería.

**Subscription:** IotSlots
**Tenant:** vsoftware-solutions.com
**Resource Group:** rg-lottery-api
**Primary Location:** West US 2
**Secondary Location:** East US (storage/registry)

---

## Resumen de Recursos

| Recurso | Tipo | SKU/Tier | Ubicación | Estado |
|---------|------|----------|-----------|--------|
| lottery-sql-1505 | SQL Server | v12.0 | westus2 | Ready |
| lottery-db | SQL Database | Standard S50 | westus2 | Online |
| LottoTest | SQL Database | Basic | westus2 | Online |
| lottery-api-prod | App Service | P1v3 | westus2 | Running |
| lottery-api-app | App Service | B1 | westus2 | Running |
| lottery-app-plan | App Service Plan | PremiumV3 P1v3 | westus2 | Ready |
| lottery-api-plan | App Service Plan | Basic B1 | westus2 | Ready |
| lottery-frontend-prod | Static Web App | Standard | westus2 | Ready |
| lottery-redis-cache | Redis Cache | Basic C0 | westus2 | Succeeded |
| lotteryicons | Storage Account | Standard_LRS | eastus | Available |
| lotteryregiot3291 | Container Registry | Basic | eastus | Ready |

---

## 1. SQL Server

### lottery-sql-1505

**Tipo:** Azure SQL Server
**FQDN:** `lottery-sql-1505.database.windows.net`
**Puerto:** 1433
**Versión:** 12.0
**Admin Login:** lotteryAdmin
**Estado:** Ready

### Bases de Datos

#### lottery-db (Produccion/Desarrollo)

| Propiedad | Valor |
|-----------|-------|
| **Tier** | Standard |
| **Capacity** | 50 DTU |
| **Max Size** | 2 GB |
| **Uso** | Base de datos principal |

**Connection String (.NET):**
```
Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=NewLottery2025;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

#### LottoTest (Testing)

| Propiedad | Valor |
|-----------|-------|
| **Tier** | Basic |
| **Capacity** | 5 DTU |
| **Max Size** | 2 GB |
| **Uso** | Ambiente de pruebas |

---

## 2. App Services

### lottery-api-prod (Produccion)

| Propiedad | Valor |
|-----------|-------|
| **URL** | https://lottery-api-prod.azurewebsites.net |
| **Plan** | lottery-app-plan (PremiumV3 P1v3) |
| **OS** | Linux |
| **Estado** | Running |
| **HTTPS Only** | No |

### lottery-api-app (Desarrollo/Staging)

| Propiedad | Valor |
|-----------|-------|
| **URL** | https://lottery-api-app.azurewebsites.net |
| **Plan** | lottery-api-plan (Basic B1) |
| **OS** | Linux |
| **Estado** | Running |
| **HTTPS Only** | Yes |

### App Service Plans

| Plan | Tier | SKU | Sites | Estado |
|------|------|-----|-------|--------|
| lottery-app-plan | PremiumV3 | P1v3 | 1 | Ready |
| lottery-api-plan | Basic | B1 | 1 | Ready |

---

## 3. Static Web App (Frontend)

### lottery-frontend-prod

| Propiedad | Valor |
|-----------|-------|
| **URL** | https://proud-coast-0a06d9c1e.4.azurestaticapps.net |
| **SKU** | Standard |
| **Uso** | Frontend React (frontend-v4) |

---

## 4. Redis Cache

### lottery-redis-cache

| Propiedad | Valor |
|-----------|-------|
| **Host** | lottery-redis-cache.redis.cache.windows.net |
| **Puerto** | 6379 (non-SSL) |
| **Puerto SSL** | 6380 |
| **SKU** | Basic |
| **Family** | C |
| **Capacity** | 0 (250 MB) |
| **Version** | 6.0 |
| **Estado** | Succeeded |

**Connection String:**
```
lottery-redis-cache.redis.cache.windows.net:6380,password=<access-key>,ssl=True,abortConnect=False
```

**Uso:** Cache distribuido para sesiones, datos frecuentes, rate limiting.

---

## 5. Storage Account

### lotteryicons

| Propiedad | Valor |
|-----------|-------|
| **Blob Endpoint** | https://lotteryicons.blob.core.windows.net/ |
| **SKU** | Standard_LRS |
| **Kind** | StorageV2 |
| **Access Tier** | Hot |
| **Ubicacion** | East US |

**Uso:** Almacenamiento de iconos, imagenes y assets estaticos.

---

## 6. Container Registry

### lotteryregiot3291

| Propiedad | Valor |
|-----------|-------|
| **Login Server** | lotteryregiot3291.azurecr.io |
| **SKU** | Basic |
| **Admin Enabled** | Yes |
| **Ubicacion** | East US |

**Uso:** Registro de imagenes Docker para despliegues containerizados.

**Login:**
```bash
az acr login --name lotteryregiot3291
docker login lotteryregiot3291.azurecr.io
```

---

## Arquitectura de Red

```
                                    ┌─────────────────────────────┐
                                    │         INTERNET            │
                                    └─────────────┬───────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
                    ▼                             ▼                             ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
    │   lottery-frontend-prod   │   │    lottery-api-prod       │   │    lottery-api-app        │
    │   (Static Web App)        │   │    (App Service P1v3)     │   │    (App Service B1)       │
    │   proud-coast-0a06d9c1e   │   │    PRODUCCION             │   │    DESARROLLO             │
    └───────────────────────────┘   └─────────────┬─────────────┘   └─────────────┬─────────────┘
                                                  │                               │
                                                  └───────────┬───────────────────┘
                                                              │
                                    ┌─────────────────────────┼─────────────────────────┐
                                    │                         │                         │
                                    ▼                         ▼                         ▼
                    ┌───────────────────────────┐   ┌─────────────────┐   ┌───────────────────────────┐
                    │   lottery-sql-1505        │   │ lottery-redis   │   │     lotteryicons          │
                    │   (Azure SQL Server)      │   │ (Redis Cache)   │   │   (Storage Account)       │
                    │   ├── lottery-db          │   │   Basic C0      │   │   Blob Storage            │
                    │   └── LottoTest           │   └─────────────────┘   └───────────────────────────┘
                    └───────────────────────────┘
```

---

## URLs de Acceso

### Produccion

| Servicio | URL |
|----------|-----|
| Frontend | https://proud-coast-0a06d9c1e.4.azurestaticapps.net |
| API | https://lottery-api-prod.azurewebsites.net |
| API Swagger | https://lottery-api-prod.azurewebsites.net/swagger |

### Desarrollo/Staging

| Servicio | URL |
|----------|-----|
| API | https://lottery-api-app.azurewebsites.net |
| API Swagger | https://lottery-api-app.azurewebsites.net/swagger |

### Servicios Internos

| Servicio | Endpoint |
|----------|----------|
| SQL Server | lottery-sql-1505.database.windows.net:1433 |
| Redis | lottery-redis-cache.redis.cache.windows.net:6380 |
| Blob Storage | lotteryicons.blob.core.windows.net |
| Container Registry | lotteryregiot3291.azurecr.io |

---

## CI/CD

### GitHub Actions Workflow

**Archivo:** `api/.github/workflows/azure-deploy.yml`

```yaml
name: Deploy to Azure App Service
on:
  push:
    branches: [main]

env:
  AZURE_WEBAPP_NAME: 'lottery-api-app'
  DOTNET_VERSION: '8.0.x'
```

**Secretos requeridos:**
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Perfil de publicacion del App Service

---

## Comandos Utiles

### Verificar recursos

```bash
# Listar todos los recursos
az resource list --resource-group rg-lottery-api --output table

# Estado del SQL Server
az sql server show --name lottery-sql-1505 --resource-group rg-lottery-api

# Estado de Web Apps
az webapp list --resource-group rg-lottery-api --output table

# Estado de Redis
az redis show --name lottery-redis-cache --resource-group rg-lottery-api
```

### Firewall SQL

```bash
# Ver reglas de firewall
az sql server firewall-rule list --server lottery-sql-1505 --resource-group rg-lottery-api --output table

# Agregar IP actual
MY_IP=$(curl -s https://ifconfig.me)
az sql server firewall-rule create \
  --resource-group rg-lottery-api \
  --server lottery-sql-1505 \
  --name "MyIP-$(date +%Y%m%d)" \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP
```

### Logs de App Service

```bash
# Ver logs en tiempo real
az webapp log tail --name lottery-api-prod --resource-group rg-lottery-api

# Descargar logs
az webapp log download --name lottery-api-prod --resource-group rg-lottery-api
```

### Redis

```bash
# Obtener access keys
az redis list-keys --name lottery-redis-cache --resource-group rg-lottery-api

# Reiniciar cache
az redis force-reboot --name lottery-redis-cache --resource-group rg-lottery-api --reboot-type AllNodes
```

---

## Costos Estimados (USD/mes)

| Recurso | SKU | Costo Estimado |
|---------|-----|----------------|
| lottery-db | Standard S50 | ~$75 |
| LottoTest | Basic | ~$5 |
| lottery-app-plan | P1v3 | ~$138 |
| lottery-api-plan | B1 | ~$13 |
| lottery-frontend-prod | Standard | ~$9 |
| lottery-redis-cache | Basic C0 | ~$16 |
| lotteryicons | Standard_LRS | ~$2 |
| lotteryregiot3291 | Basic | ~$5 |
| **Total Estimado** | | **~$263/mes** |

*Nota: Costos aproximados basados en precios de Azure para West US 2. Los costos reales pueden variar.*

---

## Seguridad

### Credenciales (Ver archivo protegido)

Las credenciales se encuentran en `database/CREDENTIALS.md` (excluido de git).

### Mejores Practicas

- [ ] Habilitar HTTPS Only en lottery-api-prod
- [ ] Configurar Azure Key Vault para secretos
- [ ] Habilitar Azure AD authentication para SQL
- [ ] Configurar alertas de seguridad
- [ ] Revisar reglas de firewall periodicamente

---

## Documentacion Relacionada

| Documento | Descripcion |
|-----------|-------------|
| `database/CREDENTIALS.md` | Credenciales de acceso (protegido) |
| `database/docs_old/AZURE_SQL_SETUP_GUIDE.md` | Guia completa de Azure SQL |
| `database/docs_old/INSTRUCCIONES_DEPLOYMENT_AZURE.md` | Instrucciones de deployment |
| `api/CLAUDE.md` | Documentacion de la API |
| `api/ARCHITECTURE.md` | Arquitectura de la API |

---

**Ultima actualizacion:** 2026-01-12
**Generado por:** Claude Code
**Version:** 1.0
