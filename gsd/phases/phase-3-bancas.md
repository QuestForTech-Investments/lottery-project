# Fase 3 — Configuración de Bancas

## Objetivo
Completar el CRUD de bancas con todas sus configuraciones: premios, comisiones, horarios, sorteos, usuarios.

## Entradas
- Módulo de bancas existente con lista y formularios
- API endpoints funcionando
- Configuración de premios/comisiones en edición

## Tareas

### Crear Banca
- [x] Formulario completo con tabs
- [x] Tab General (nombre, código, zona)
- [x] Tab Configuración
- [x] Tab Pies de Página
- [x] Tab Premios & Comisiones
- [x] Tab Horarios
- [x] Tab Sorteos
- [x] Tab Estilos
- [x] Tab Gastos Automáticos
- [x] **FIX:** Guardar comisiones al crear (b3b2dcd)
- [x] Crear usuario POS automáticamente
- [x] Deshabilitar autocompletado del navegador

### Editar Banca
- [x] Formulario completo con tabs
- [x] Cargar datos existentes
- [x] Guardar premios
- [x] Guardar comisiones
- [x] Guardar horarios
- [x] Redirigir a lista después de guardar

### Lista de Bancas
- [x] Tabla con paginación
- [x] Filtro por zona
- [x] Búsqueda rápida
- [x] Ordenamiento por columnas
- [x] Switch de activar/desactivar
- [x] Modal cambio de contraseña

### Edición Masiva
- [ ] Componente creado pero no conectado
- [ ] Verificar funcionalidad
- [ ] Conectar al menú

### Horarios de Sorteos (DrawSchedules)
- [x] Lista de horarios por sorteo
- [x] Expandir/colapsar sorteos
- [x] Editar horarios inline
- [x] TimePicker funcional
- [x] Guardar cambios

## Decisiones Tomadas
1. **Prefijo de código:** Cambiado de `LAN-` a `LB-` (LottoBook)
2. **Usuario POS:** Se crea automáticamente al crear banca
3. **Comisiones:** Se guardan via endpoint separado `/prizes-commissions`

## Criterios de Finalización
- [x] Crear banca guarda todos los datos incluyendo comisiones
- [x] Editar banca funciona completamente
- [ ] Edición masiva conectada y funcional
- [x] Sin bugs reportados en creación/edición

## Resultado
**Estado:** 95% completado
**Pendiente:** Solo edición masiva de bancas

---

**Última actualización:** 2026-02-06
