# Lottery Project - Sistema de Lotería

Sistema completo de gestión de lotería con frontend React + TypeScript + Material-UI y backend .NET.

## 📦 Estructura del Proyecto

```
lottery-project/
├── frontend-v4/          # Frontend React + TypeScript + MUI (Puerto 4001)
├── api/                  # Backend .NET 8.0 (Puerto 5000)
├── database/             # Scripts SQL y documentación BD
├── docs/                 # Documentación general
├── CLAUDE.md             # Guía de desarrollo y convenciones
└── DESIGN_SYSTEM.md      # Sistema de diseño
```

## 🚀 Inicio Rápido

### API (.NET)
```bash
cd api/src/LotteryApi
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
lsof -ti:4001  # Frontend
lsof -ti:5000  # API
```

## 🔑 Credenciales de Prueba

- **Usuario:** `admin`
- **Contraseña:** `Admin123456`

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:4001
- **API:** http://localhost:5000
- **Swagger:** http://localhost:5000/swagger

## 📚 Módulos Implementados

### Dashboard
- Panel principal con widgets de cobros/pagos

### Usuarios
- Lista con tabs (Todos, Administradores, Bancas)
- Crear / Editar usuario
- Historial de sesiones
- Sesiones bloqueadas

### Bancas (Betting Pools)
- Lista completa con filtros
- Crear / Editar banca (tabs: General, Sorteos, Premios, Comisiones, etc.)
- Edición masiva
- Control de acceso
- Limpiar pendientes de pago
- Lista sin ventas
- Reporte de días sin venta

### Tickets
- Crear ticket (TPV)
- Monitoreo de tickets
- Monitoreo de agentes externos
- Monitor de jugadas
- Jugadas ganadoras
- Pizarra
- Anomalías

### Ventas
- Ventas del día
- Histórico de ventas
- Ventas por fecha
- Premios por jugada
- Porcentajes
- Ventas por banca
- Ventas por zona

### Resultados
- Publicación y consulta de resultados de lotería

### Balances
- Balance por bancas
- Balance por bancos
- Balance por zonas
- Balance por grupos

### Transacciones
- Lista de transacciones
- Transacciones por banca
- Lista por grupos
- Aprobaciones
- Resumen
- Categorías de gastos

### Límites
- Lista de límites
- Crear límite
- Límites automáticos
- Eliminar límites
- Números calientes

### Zonas
- Lista de zonas
- Crear / Editar zona
- Manejar zonas

### Sorteos
- Lista de sorteos
- Horarios

### Otros Módulos
- Préstamos (crear, listar)
- Excedentes (manejar, reportes)
- Cobradores
- Manejo de cobradores
- Agentes externos
- Entidades contables
- Receptores de correo
- Cobros/Pagos
- Configuración de grupo
- Monitor F8

## 🎯 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | React 18 + Vite + TypeScript + Material-UI v5 |
| Backend | .NET 8.0 + Entity Framework Core 8.0 |
| Database | Azure SQL Server |

## 📖 Documentación

- **[CLAUDE.md](./CLAUDE.md)** - Guía completa de desarrollo, rutas y convenciones
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Sistema de diseño (colores, tipografía)
- **[docs/TPV_ROUTING_ARCHITECTURE.md](./docs/TPV_ROUTING_ARCHITECTURE.md)** - Arquitectura de routing TPV vs Admin

## 📞 Soporte

Para más información, consulta `CLAUDE.md` en la raíz del proyecto.
