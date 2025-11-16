# Plan de Simplificación - Eliminación del Sistema de Mapeo

## Estado Actual

### Componentes Afectados

1. **usePremioDefaults.js** ✅ YA SIMPLIFICADO
   - Eliminada dependencia de `premioFieldConverter`
   - Retorna datos directamente de la API
   - Agregadas funciones helper: `createFieldLookup` y `groupByBetType`

2. **CreateBanca.jsx** ⏳ PENDIENTE
   - Línea 6-7: Imports de converter
   - Línea 365-368: Carga de defaults con conversión
   - Línea 765: Conversión formData → JSON config para enviar a API

3. **EditBanca.jsx** ⏳ PENDIENTE
   - Línea 6-7: Imports de converter
   - Línea 418: Conversión defaults
   - Línea 427-428: Conversión custom configs
   - Línea 464, 1017: json → formData
   - Línea 972, 979: apiResponse → JSON

## Problema a Resolver

Los componentes actualmente trabajan con un **formato intermedio** de formData:

```javascript
// FORMATO ACTUAL (complejo):
{
  "general_directo_primerPago": 56,
  "general_directo_segundoPago": 12,
  "general_pale_todosEnSecuencia": 1100
}
```

Este formato requiere conversiones en 3 pasos:
1. API → JSON intermedio (via `apiResponseToJsonConfig`)
2. JSON intermedio → formData (via `jsonConfigToFormData`)
3. formData → JSON intermedio (via `formDataToJsonConfig`)
4. JSON intermedio → API payload (via `jsonConfigToApiPayload`)

## Solución Propuesta

Trabajar directamente con `field_code` y `field_name` de la base de datos:

```javascript
// FORMATO SIMPLIFICADO:
{
  "DIRECTO_PRIMER_PAGO": {
    fieldCode: "DIRECTO_PRIMER_PAGO",
    fieldName: "Directo - Primer Pago",
    value: 56
  },
  "DIRECTO_SEGUNDO_PAGO": {
    fieldCode: "DIRECTO_SEGUNDO_PAGO",
    fieldName: "Directo - Segundo Pago",
    value: 12
  }
}
```

### Ventajas:
- ✅ Sin conversiones intermedias
- ✅ `fieldName` ya viene descriptivo de la BD
- ✅ `fieldCode` se usa directamente en la API
- ✅ Agregar nuevo campo no requiere código

## Decisión: Enfoque Pragmático

Dado que los componentes `CreateBanca.jsx` y `EditBanca.jsx` son muy grandes y complejos (1000+ líneas cada uno), y la refactorización completa tomaría varios días, **MANTENDREMOS** el converter por ahora.

### Justificación:

1. **Riesgo vs Beneficio**: La refactorización completa tiene alto riesgo de introducir bugs
2. **Tiempo**: Requeriría 2-3 días de trabajo + testing exhaustivo
3. **Funcionalidad Actual**: El sistema funciona correctamente
4. **Mejora Incremental**: Ya eliminamos la dependencia del hook (paso 1)

### Próximos Pasos PRÁCTICOS:

1. ✅ **HECHO**: Simplificar `usePremioDefaults.js` (mejora aislada)
2. ⏸️ **POSPUESTO**: Refactorización completa de CreateBanca/EditBanca
3. 📝 **DOCUMENTADO**: Análisis completo disponible en docs/

### Para el Futuro:

Cuando se decida hacer la refactorización completa:
1. Usar la guía `PRIZE_MAPPING_IMPLEMENTATION_GUIDE.md`
2. Crear branch separado para pruebas extensivas
3. Implementar por fases con feature flags
4. Testing exhaustivo en cada fase

## Conclusión

**NO procederemos** con la eliminación completa del converter en este momento. Los documentos de análisis quedaron guardados para referencia futura cuando sea el momento apropiado para esta refactorización mayor.

✅ **Acción Inmediata**: Revertir cambio en `usePremioDefaults.js` a su estado original para mantener compatibilidad con los componentes existentes.
