# Análisis de Aplicación Vue.js - la-numbers.apk.lol

**Fecha de análisis:** 2025-11-16
**Analizado con:** Playwright MCP
**Propósito:** Migración a React + Vite

---

## 1. INFORMACIÓN GENERAL

### Aplicación Original
- **URL:** https://la-numbers.apk.lol
- **Framework:** Vue.js (con Webpack)
- **Routing:** Vue Router (Hash mode `/#/`)
- **Credenciales de prueba:**
  - Usuario: `oliver`
  - Contraseña: `oliver0597@`

### API Backend
- **Base URL:** `https://api.lotocompany.com/api/v1/`
- **Autenticación:** Token de sesión
- **WebSocket:** Conectado para tiempo real
- **Versionado:** API v1

---

## 2. ENDPOINTS DE API DESCUBIERTOS

### Autenticación y Sesión
```
GET  /sessions/params?domain={domain}    # Parámetros de sesión por dominio
POST /sessions                            # Login (201 Created)
GET  /sessions                            # Info sesión actual
```

### Dashboard y Home
```
GET /home?category=1                      # Dashboard datos categoría 1
GET /home?category=2                      # Dashboard datos categoría 2
GET /notifications                        # Notificaciones del usuario
GET /anomaly?category=2                   # Anomalías detectadas
GET /group-security?category=2            # Seguridad del grupo
GET /chat?category=2                      # Chat (404 - no implementado)
```

### Bancas (Betting Pools)
```
PATCH /betting-pools                      # Actualizar bancas
GET   /betting-pools/params?category=2    # Parámetros de bancas
```

### Tickets
```
GET /tickets/params/create?category=1     # Parámetros para crear ticket
```

### Resultados
```
GET /results?date=&currentDate=&category=1    # Resultados de sorteos
GET /results/params?category=1                 # Parámetros de resultados
```

---

## 3. ESTRUCTURA DE RUTAS (70+ rutas)

### Dashboard
```
#/dashboard                               # Panel principal
```

### Ventas
```
#/sales/daily                            # Ventas del día
#/sales/historical                       # Histórico de ventas
#/sales/by-date                          # Ventas por fecha
#/sales/betting-pool                     # Ventas por banca
#/sales/zones                            # Ventas por zona
#/play-type-prizes                       # Premios por jugada
#/play-type-prizes-percentages           # Porcentajes de premios
```

### Tickets
```
#/tickets/create                         # Crear ticket
#/tickets                                # Monitor de tickets
#/external-tickets                       # Tickets de agentes externos
#/play-amounts                           # Jugadas
#/winning-plays                          # Jugadas ganadoras
#/blackboard                             # Pizarra
#/imported-plays                         # Bote importado
#/exported-plays                         # Bote exportado
#/anomalies                              # Anomalías
```

### Resultados
```
#/results                                # Ver/Publicar resultados
```

### Bancas
```
#/betting-pools                          # Lista de bancas
#/betting-pools/new                      # Crear banca
#/betting-pools/mass-edit                # Edición masiva
#/betting-pool-access                    # Acceso a bancas
#/betting-pool-play-monitor              # Monitor de jugadas [F8]
#/clean-pending-for-payment              # Limpiar pendientes
#/betting-pools-without-sales            # Bancas sin ventas
#/days-without-sales                     # Reporte días sin venta
```

### Balances
```
#/balances/betting-pools                 # Balances de bancas
#/balances/banks                         # Balances de bancos
#/balances/zones                         # Balances por zona
#/balances/groups                        # Balances por grupo
```

### Usuarios
```
#/users                                  # Lista de usuarios
#/users/new                              # Crear usuario
#/users/administrators                   # Administradores
#/pool-users                             # Usuarios de bancas
#/login-logs                             # Logs de inicio de sesión
#/group-security/blocked-logins          # Sesiones bloqueadas
```

### Transacciones y Cobros/Pagos
```
#/simplified-accountable-transaction-groups  # Grupos simplificados
#/accountable-transactions                   # Lista de transacciones
#/accountable-transaction-groups             # Lista por grupos
#/accountable-transaction-approvals          # Aprobaciones
#/accountable-transactions/summary           # Resumen
#/accountable-transactions/betting-pool      # Por banca
#/expenses/categories                        # Categorías de gastos
```

### Préstamos
```
#/loans/create                           # Crear préstamo
#/loans                                  # Lista de préstamos
```

### Excedentes
```
#/excesses                               # Manejar excedentes
#/excesses-report                        # Reporte de excedentes
```

### Límites
```
#/limits                                 # Lista de límites
#/limits/new                             # Crear límite
#/limits/automatic                       # Límites automáticos
#/limits/destroy                         # Eliminar límites
#/limits/hot-numbers                     # Números calientes
```

### Cobradores
```
#/debt-collector                         # Cobradores
#/manage-debt-collector                  # Manejo de cobradores
```

### Sorteos
```
#/sortition-informations                 # Lista de sorteos
#/sortition-schedules                    # Horarios de sorteos
```

### Configuración y Otros
```
#/my-group/configuration                 # Configuración de mi grupo
#/external-agents/create                 # Crear agente externo
#/external-agents                        # Lista de agentes externos
#/zones                                  # Lista de zonas
#/zones/new                              # Crear zona
#/zones/manage                           # Manejar zonas
#/accountable-entities                   # Entidades contables
#/accountable-entities/new               # Crear entidad contable
#/mail-receptors                         # Receptores de correo
#/mail-receptors/new                     # Crear receptor
#/notifications/new                      # Notificaciones
```

---

## 4. MÓDULOS DEL SISTEMA

### Módulos Principales (23)
1. **Inicio** - Dashboard principal
2. **Ventas** - Gestión de ventas y reportes
3. **Tickets** - Crear y monitorear tickets
4. **Resultados** - Publicación de resultados
5. **Bancas** - CRUD de bancas (betting pools)
6. **Balances** - Reportes financieros
7. **Usuarios** - Gestión de usuarios
8. **Cobros / Pagos** - Transacciones
9. **Transacciones** - Contabilidad
10. **Préstamos** - Sistema de préstamos
11. **Excedentes** - Gestión de excedentes
12. **Límites** - Control de límites de apuestas
13. **Cobradores** - Gestión de cobradores
14. **Sorteos** - Configuración de loterías
15. **Manejo de cobradores** - Administración
16. **Mi Grupo** - Configuración del grupo
17. **Agentes Externos** - Integraciones externas
18. **[F8]** - Monitor rápido de jugadas
19. **Zonas** - Geografía y distribución
20. **Entidades contables** - Contabilidad
21. **Receptores de correo** - Notificaciones email
22. **Notificaciones** - Sistema de avisos
23. **Aprobaciones** - Workflow de aprobación

---

## 5. LOTERÍAS/SORTEOS DISPONIBLES (70+)

### Loterías de Anguila
- Anguila 10am
- Anguila 1pm
- Anguila 6PM
- Anguila 9pm

### Loterías Dominicanas
- REAL
- GANA MAS
- LA PRIMERA
- LA PRIMERA 8PM
- LA SUERTE
- LA SUERTE 6:00pm
- LOTEDOM
- NACIONAL
- QUINIELA PALE
- LOTEKA
- LA CHICA
- DIARIA 11AM
- DIARIA 3PM
- DIARIA 9PM

### Loterías USA - Texas
- TEXAS MORNING
- TEXAS DAY
- TEXAS EVENING
- TEXAS NIGHT

### Loterías USA - New York
- NEW YORK DAY
- NEW YORK NIGHT
- NY AM 6x1
- NY PM 6x1

### Loterías USA - Florida
- FLORIDA AM
- FLORIDA PM
- FL AM 6X1
- FL PM 6X1
- FL PICK2 AM
- FL PICK2 PM

### Loterías USA - Otros Estados
- INDIANA MIDDAY / EVENING
- GEORGIA-MID AM / EVENING / NIGHT
- NEW JERSEY AM / PM
- CONNECTICUT AM / PM
- PENN MIDDAY / EVENING
- MARYLAND MIDDAY / EVENING
- VIRGINIA AM / PM
- DELAWARE AM / PM
- SOUTH CAROLINA AM / PM
- CALIFORNIA AM / PM
- MASS AM / PM
- NORTH CAROLINA AM / PM
- CHICAGO AM / PM

### Loterías King
- King Lottery AM
- King Lottery PM

### Super Pale
- SUPER PALE TARDE
- SUPER PALE NY-FL AM
- SUPER PALE NY-FL PM
- SUPER PALE NOCHE

### Loterías Internacionales
- L.E. PUERTO RICO 2PM
- L.E. PUERTO RICO 10PM
- PANAMA MIERCOLES
- PANAMA DOMINGO

---

## 6. TIPOS DE APUESTA

### Categorías Principales
1. **Directo** - Apuesta a número directo
2. **Pale & Tripleta** - Combinaciones de 2-3 números
3. **Cash 3** - Formato específico
4. **Play 4 & Pick 5** - Juegos extendidos

### Estructura de Ticket
- **LOT** - Código de lotería
- **NUM** - Número apostado
- **Monto** - Cantidad apostada
- **Total** - Suma de apuestas

---

## 7. FUNCIONALIDADES DEL DASHBOARD

### Panel de Cobros & Pagos
- Tipo: Cobro / Pago (radio)
- Código de banca (selector)
- Banco (selector)
- Monto (input numérico)
- Botón "Crear"

### Jugadas por Sorteo
- Selector de sorteo
- Tabla de jugadas:
  - Tipo de jugada
  - Jugada (número)
  - Monto

### Publicación Rápida de Resultados
- Selector de sorteo
- Botón "Publicar"

### Bloqueo Rápido de Números
- Sorteo (selector)
- Tipo de jugada (selector)
- Jugada (input)
- Botones: "Agregar" / "Bloquear"

### Estadísticas
- Bancas vendiendo: por día (Viernes, Sábado, Hoy)
- Dashboard / Dashboard Operativo (tabs)

---

## 8. CARACTERÍSTICAS TÉCNICAS

### Frontend
- **Build:** Webpack (chunks con hashes)
- **CSS:** Separado en chunks
- **Lazy Loading:** Carga dinámica de módulos
- **Icons:** Nucleo Icons, Element Icons
- **Atributos Vue:** `data-v-*` para scoped CSS

### Comunicación
- **HTTP:** Axios o fetch para API REST
- **WebSocket:** Conexión persistente para tiempo real
- **Dominio dinámico:** Configurable por URL

### Seguridad
- Login con username/password
- Token de sesión
- Sesiones bloqueables
- Logs de acceso

---

## 9. NOTAS PARA MIGRACIÓN

### Prioridades
1. **Alta:** Login, Dashboard, Tickets, Resultados, Bancas
2. **Media:** Balances, Usuarios, Transacciones
3. **Baja:** Préstamos, Excedentes, Configuración

### Consideraciones
- Mantener estructura de rutas similar para facilitar transición
- Implementar WebSocket para funcionalidades en tiempo real
- Respetar sistema de categorías (category=1, category=2)
- El sistema maneja múltiples loterías/sorteos simultáneamente
- Importante: Sistema de impresión de tickets (Firefox Silent Print)

### Diferencias con API Actual (.NET)
- API original: `https://api.lotocompany.com/api/v1/`
- API nueva (.NET): `http://88.223.95.55:5000/api/`
- Necesario mapear endpoints equivalentes
- Adaptar DTOs y respuestas

---

## 10. PRÓXIMOS PASOS

1. [ ] Interceptar payloads completos de cada endpoint
2. [ ] Documentar estructura de datos (DTOs) de la API original
3. [ ] Mapear cada endpoint original → nuevo endpoint .NET
4. [ ] Replicar componentes Vue críticos en React
5. [ ] Implementar autenticación compatible
6. [ ] Configurar WebSocket en nuevo frontend
7. [ ] Crear tests de integración

---

**Documento generado automáticamente por Claude Code**
**Para uso interno del proyecto de migración**
