# Lottery Project - Sistema de Lotería

Sistema completo de gestión de lotería con frontend React + TypeScript + Material-UI y backend .NET.

## 📦 Estructura del Proyecto

```
lottery-project/
├── frontend-v4/          # Frontend React + TypeScript + MUI (Puerto 5173)
├── api/                  # Backend .NET 8.0 (Puerto 5000)
├── database/             # Scripts SQL y migraciones
├── docs/                 # Documentación
├── CLAUDE.md            # Documentación completa del proyecto
├── DESIGN_SYSTEM.md     # Sistema de diseño
└── scripts/             # Scripts de utilidad
```

## 🚀 Inicio Rápido

### API (.NET)
```bash
cd api/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"
```

### Frontend
```bash
cd frontend-v4
npm install
npm run dev
```

### Verificar puertos
```bash
lsof -ti:5173  # Frontend
lsof -ti:5000  # API
```

## 🔑 Credenciales de Prueba

- **Usuario:** `admin`
- **Contraseña:** `Admin123456`

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5000

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
- Excedentes

### 🚧 Pendientes
- Tickets
- Resultados
- Límites
- Sorteos
- Cobradores
- Agentes Externos

## 📖 Documentación

- **CLAUDE.md** - Documentación completa del proyecto, arquitectura y fixes
- **DESIGN_SYSTEM.md** - Sistema de diseño (colores, tipografía, componentes)
- **docs/migration/** - Análisis de la aplicación Vue.js original

## 🎯 Stack Tecnológico

- **Frontend:** React 18 + Vite + TypeScript + Material-UI v5
- **Backend:** .NET 8.0 + Entity Framework Core
- **Database:** SQL Server (Azure SQL)

## 📞 Soporte

Para más información, consulta `CLAUDE.md` en la raíz del proyecto.
