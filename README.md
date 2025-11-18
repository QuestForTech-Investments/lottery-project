# Lottery Project - Sistema de Lotería

Sistema completo de gestión de lotería con frontend dual (V1 Bootstrap + V2 Material-UI) y backend .NET.

## 📦 Estructura del Proyecto

```
lottery-project/
├── frontend-v1/          # Frontend Bootstrap 5 (Puerto 4200)
├── frontend-v2/          # Frontend Material-UI (Puerto 4000)
├── api/                  # Backend .NET 8.0 (Puerto 5000)
├── database/             # Scripts SQL y migraciones
├── docs/                 # Documentación
├── CLAUDE.md            # Documentación completa del proyecto
├── DESIGN_SYSTEM.md     # Sistema de diseño
└── scripts/             # Scripts de utilidad
```

## 🚀 Inicio Rápido

### Opción 1: Iniciar con nohup (Recomendado)

```bash
cd /home/jorge/projects/lottery-project
./start-all.sh
```

Este comando iniciará:
- ✅ API (.NET) en `http://localhost:5000`
- ✅ Frontend V1 en `http://localhost:4200`
- ✅ Frontend V2 en `http://localhost:4000`

**Los servicios seguirán corriendo aunque cierres la sesión SSH** gracias a `nohup`.

### Opción 2: Iniciar con tmux (Experimental)

```bash
./start-all-tmux.sh
```

Usa tmux para gestionar los servicios en ventanas separadas. Permite adjuntarse a la sesión para ver logs en tiempo real.

### Verificar estado

```bash
./status.sh
```

### Detener todos los servicios

```bash
./stop-all.sh
```

## 📝 Logs

Los logs se guardan en `/tmp/`:

```bash
# Ver logs en tiempo real
tail -f /tmp/lottery-api.log    # API
tail -f /tmp/lottery-v1.log     # Frontend V1
tail -f /tmp/lottery-v2.log     # Frontend V2
```

## 🔑 Credenciales de Prueba

- **Usuario:** `admin`
- **Contraseña:** `Admin123456`

## 🌐 URLs de Acceso

- **Frontend V1:** http://88.223.95.55:4200 (Bootstrap)
- **Frontend V2:** http://88.223.95.55:4000 (Material-UI)
- **API:** http://88.223.95.55:5000

## 📚 Módulos Implementados

### ✅ Completados
- Dashboard
- Bancas (CRUD + Edición Masiva)
- Usuarios
- Zonas
- Balances
- Ventas
- Transacciones
- Préstamos
- **EXCEDENTES** (Nuevo - 2025-11-18)
  - Manejar excedentes (25 campos numéricos)
  - Reporte de excedentes (filtros multi-select)

### 🚧 Pendientes
- Tickets
- Resultados
- Límites
- Sorteos
- Cobradores
- Agentes Externos

## 🛠️ Desarrollo Manual

Si prefieres iniciar los servicios manualmente:

### API (.NET)
```bash
cd api/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"
```

### Frontend V1
```bash
cd frontend-v1
npm run dev
```

### Frontend V2
```bash
cd frontend-v2
npm run dev
```

## 🔧 Troubleshooting

### Los servicios no inician
```bash
# Verificar puertos ocupados
lsof -ti:5000  # API
lsof -ti:4200  # V1
lsof -ti:4000  # V2

# Detener servicios previos
./stop-all.sh

# Reiniciar
./start-all.sh
```

### Ver logs de errores
```bash
# API
cat /tmp/lottery-api.log

# V1
cat /tmp/lottery-v1.log

# V2
cat /tmp/lottery-v2.log
```

### Limpiar logs antiguos
```bash
rm /tmp/lottery-*.log
```

## 📖 Documentación

- **CLAUDE.md** - Documentación completa del proyecto, arquitectura y fixes
- **DESIGN_SYSTEM.md** - Sistema de diseño (colores, tipografía, componentes)
- **docs/migration/** - Análisis de la aplicación Vue.js original

## 🎯 Stack Tecnológico

- **Frontend V1:** React 18 + Vite + Bootstrap 5
- **Frontend V2:** React 18 + Vite + Material-UI v5
- **Backend:** .NET 8.0 + Entity Framework Core
- **Database:** SQL Server (Azure SQL)

## 📞 Soporte

Para más información, consulta `CLAUDE.md` en la raíz del proyecto.
