# Fase 5 — Reportes de Premios

## Objetivo
Crear reportes analíticos sobre premios pagados, pendientes y rentabilidad.

## Entradas
- Flujo de pago completo (Fase 4)
- Datos históricos de premios
- Requisitos de reportes de negocio

## Tareas

### 5.1 Reporte: Premios por Período
- [ ] Filtros: fecha inicio, fecha fin, estado
- [ ] Métricas: total premios, cantidad, promedio
- [ ] Gráfico de barras por día
- [ ] Exportable a Excel

### 5.2 Reporte: Premios por Banca
- [ ] Filtros: período, zona
- [ ] Columnas: banca, premios pagados, premios pendientes, total
- [ ] Ordenable por cualquier columna
- [ ] Drill-down a detalle de banca

### 5.3 Reporte: Premios por Zona
- [ ] Agrupado por zona
- [ ] Métricas: total premios, % del total
- [ ] Gráfico de torta
- [ ] Comparativo con período anterior

### 5.4 Reporte: Premios por Tipo de Juego
- [ ] Agrupado por bet_type
- [ ] Métricas: cantidad ganadores, total premios, premio promedio
- [ ] Identificar tipos más "costosos"
- [ ] Comparativo histórico

### 5.5 Reporte: Rentabilidad
- [ ] Ventas vs Premios por período
- [ ] Ventas vs Premios por banca
- [ ] Ventas vs Premios por tipo de juego
- [ ] Margen = Ventas - Premios
- [ ] % de rentabilidad

### 5.6 Dashboard de Premios
- [ ] KPIs en cards: Premios Hoy, Pendientes, Pagados
- [ ] Gráfico de tendencia últimos 7 días
- [ ] Top 5 bancas con más premios
- [ ] Alertas de premios grandes pendientes

### 5.7 Endpoints de API para reportes
- [ ] `GET /api/reports/prizes/by-period`
- [ ] `GET /api/reports/prizes/by-betting-pool`
- [ ] `GET /api/reports/prizes/by-zone`
- [ ] `GET /api/reports/prizes/by-bet-type`
- [ ] `GET /api/reports/prizes/profitability`

## Decisiones a tomar
1. ¿Reportes en tiempo real o precalculados?
2. ¿Cuánto histórico mantener accesible?
3. ¿Qué roles pueden ver qué reportes?

## Criterios de finalización
- [ ] Reporte por período funcionando
- [ ] Reporte por banca funcionando
- [ ] Reporte por zona funcionando
- [ ] Reporte por tipo de juego funcionando
- [ ] Reporte de rentabilidad funcionando
- [ ] Dashboard de premios implementado
- [ ] Exportación a Excel en todos los reportes

## Resultado
*(Se llenará al cerrar la fase)*
