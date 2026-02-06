# Fase 3 — UI de Jugadas Ganadoras

## Objetivo
Mejorar el componente `/tickets/winners` para que sea completamente funcional y usable por operadores.

## Entradas
- Cálculo automático funcionando (Fase 2)
- Datos de ganadores disponibles en API
- Componente `WinningPlays` existente

## Tareas

### 3.1 Auditar componente actual
- [ ] Revisar `WinningPlays/index.tsx`
- [ ] Identificar funcionalidades existentes
- [ ] Identificar funcionalidades faltantes
- [ ] Revisar integración con API

### 3.2 Mejorar filtros
- [ ] Agregar filtro por banca específica
- [ ] Agregar filtro por estado de pago (Todos/Pagado/Pendiente)
- [ ] Agregar filtro por rango de monto
- [ ] Mejorar selector de fechas (presets: Hoy, Ayer, Semana)
- [ ] Agregar botón "Limpiar filtros"

### 3.3 Mejorar tabla de resultados
- [ ] Columnas: Ticket, Tipo, Número, Apuesta, Premio, Estado, Acciones
- [ ] Ordenamiento por columna
- [ ] Paginación mejorada
- [ ] Fila expandible con detalle de ticket
- [ ] Resaltar premios grandes (> X monto)

### 3.4 Agregar acciones inline
- [ ] Botón "Ver Ticket" → abre modal con detalle
- [ ] Botón "Marcar Pagado" → llama API (ver Fase 4)
- [ ] Indicador visual de estado (chip verde/amarillo)

### 3.5 Agregar totales y resumen
- [ ] Total de jugadas ganadoras
- [ ] Suma total de premios pendientes
- [ ] Suma total de premios pagados
- [ ] Número de tickets únicos

### 3.6 Implementar exportación
- [ ] Botón "Exportar Excel"
- [ ] Botón "Exportar PDF"
- [ ] Incluir filtros aplicados en reporte
- [ ] Incluir totales en reporte

### 3.7 Responsive y UX
- [ ] Verificar funcionamiento en móvil
- [ ] Loading states mientras carga
- [ ] Empty state cuando no hay resultados
- [ ] Mensajes de error claros

## Decisiones a tomar
1. ¿Qué monto se considera "premio grande" para resaltar?
2. ¿Modal de detalle o página separada para ticket?
3. ¿Exportación en frontend o endpoint de API?

## Criterios de finalización
- [ ] Todos los filtros funcionando
- [ ] Tabla con ordenamiento y paginación
- [ ] Acciones inline operativas
- [ ] Totales visibles
- [ ] Exportación a Excel/PDF
- [ ] Responsive funcionando
- [ ] Probado por usuario final

## Resultado
*(Se llenará al cerrar la fase)*
