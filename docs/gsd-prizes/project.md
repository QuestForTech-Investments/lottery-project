# Proyecto: Sistema de Cálculo de Premios

## Nombre
Prize Calculation System (PCS)

## Descripción
Sistema completo para calcular, validar y pagar premios de lotería basado en resultados oficiales y configuraciones de multiplicadores por banca/sorteo.

## Objetivo principal
Automatizar el cálculo de premios cuando se publican resultados, identificar tickets ganadores, y gestionar el flujo de pago.

## Alcance (IN)
- Cálculo automático de premios al publicar resultados
- Identificación de jugadas ganadoras por ticket
- Configuración de multiplicadores (sistema → banca → sorteo)
- Visualización de jugadas ganadoras con filtros
- Marcado de premios como pagados
- Reportes de premios por período/banca/zona
- Validación de límites antes de pagar

## Fuera de alcance (OUT)
- Modificación del sistema de creación de tickets
- Cambios en el flujo de ingreso de resultados
- Sistema de notificaciones push
- Integración con pasarelas de pago externas

## Usuarios objetivo
- **Administradores**: Configuran premios, aprueban pagos grandes
- **Operadores de banca**: Ven ganadores, marcan como pagado
- **Sistema automático**: Calcula premios al publicar resultados

## Restricciones
- Base de datos Azure SQL Server existente
- API .NET 8.0 existente
- Frontend React + MUI existente
- No romper funcionalidad actual de tickets/resultados

## Stack tecnológico
| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript + MUI |
| Backend | .NET 8.0 + EF Core |
| Database | Azure SQL Server |
| Hosting | Azure Static Web Apps + Azure App Service |

## Principios del proyecto
1. **Precisión ante velocidad** - Un cálculo de premio incorrecto es crítico
2. **Auditoría completa** - Todo cambio de premio debe quedar registrado
3. **Cascada clara** - sorteo > banca > sistema, sin ambigüedades
4. **Idempotencia** - Recalcular debe dar el mismo resultado
5. **Separación de concerns** - Cálculo ≠ Pago ≠ Reporte
