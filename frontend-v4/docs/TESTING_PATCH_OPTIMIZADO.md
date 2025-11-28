# Guía de Testing - Funcionalidad PATCH Optimizada

## Resumen

Este documento proporciona instrucciones paso a paso para verificar que la funcionalidad de actualización optimizada de bancas funciona correctamente en el Frontend V2.

---

## Pre-requisitos

### 1. Backend en ejecución

```bash
# Terminal 1 - Iniciar API
cd /home/jorge/projects/Lottery-Project/LottoApi
dotnet run

# Verificar que esté corriendo en http://localhost:5000
# Deberías ver: Now listening on: http://localhost:5000
```

### 2. Frontend en desarrollo

```bash
# Terminal 2 - Iniciar Frontend
cd /home/jorge/projects/Lottery-Project/LottoWebApp
npm run dev

# Deberías ver: Local: http://localhost:4000
```

### 3. Consola del navegador abierta

- Abre Chrome DevTools (F12)
- Ve a la pestaña "Console"
- Limpia la consola (Ctrl+L)

---

## Tests Funcionales

### TEST 1: Verificar método PATCH en api.js

**Objetivo:** Confirmar que el método PATCH está disponible

**Pasos:**
1. Abre la consola del navegador (F12)
2. Ejecuta el siguiente código:

```javascript
import('/src/services/api.js').then(module => {
  const api = module.api;
  console.log('Métodos disponibles:', Object.keys(api));
  console.log('PATCH disponible:', typeof api.patch === 'function');
});
```

**Resultado esperado:**
```
Métodos disponibles: ['get', 'post', 'put', 'patch', 'delete']
PATCH disponible: true
```

---

### TEST 2: Verificar branchService.js

**Objetivo:** Confirmar que branchService exporta las funciones correctas

**Pasos:**
1. En la consola del navegador:

```javascript
import('/src/services/branchService.js').then(module => {
  console.log('Funciones exportadas:', Object.keys(module.default));
  console.log('getBranchWithConfig:', typeof module.getBranchWithConfig);
  console.log('updateBranchConfig:', typeof module.updateBranchConfig);
  console.log('updateBranch:', typeof module.updateBranch);
});
```

**Resultado esperado:**
```
Funciones exportadas: ['getBranches', 'getBranchById', 'getBranchWithConfig', ...]
getBranchWithConfig: function
updateBranchConfig: function
updateBranch: function
```

---

### TEST 3: Verificar prizeFieldService.js

**Objetivo:** Confirmar que prizeFieldService tiene todas las funciones necesarias

**Pasos:**
1. En la consola del navegador:

```javascript
import('/src/services/prizeFieldService.js').then(module => {
  console.log('Funciones exportadas:', Object.keys(module.default));
  console.log('getPrizeFields:', typeof module.getPrizeFields);
  console.log('patchBancaPrizeConfig:', typeof module.patchBancaPrizeConfig);
  console.log('getBancaPrizeConfig:', typeof module.getBancaPrizeConfig);
});
```

**Resultado esperado:**
```
Funciones exportadas: ['getPrizeFields', 'getBetTypes', 'patchBancaPrizeConfig', ...]
getPrizeFields: function
patchBancaPrizeConfig: function
getBancaPrizeConfig: function
```

---

### TEST 4: Navegar a EditBanca

**Objetivo:** Verificar que EditBanca.jsx carga sin errores

**Pasos:**
1. En el navegador, ve a: `http://localhost:4000`
2. Inicia sesión si es necesario
3. Navega a la sección de "Bancas" o "Betting Pools"
4. Haz clic en "Editar" en cualquier banca existente
5. Observa la consola del navegador

**Resultado esperado:**
- La página de edición carga correctamente
- No hay errores en la consola
- Puedes ver los tabs: General, Premios y Comisiones, Horarios de Sorteos, etc.

**Logs esperados en consola:**
```
🔍 [PRIZE SERVICE] Calling GET /betting-pools/{id}/prize-config
✅ [PRIZE SERVICE] Returning response directly: [...]
```

---

### TEST 5: Test de actualización con PATCH

**Objetivo:** Verificar que patchBancaPrizeConfig funciona correctamente

**Preparación:**
1. Navega a EditBanca de una banca de prueba
2. Ve al tab "Premios y Comisiones"
3. Cambia SOLO UN campo (por ejemplo, "Directo - Primer Pago" de 60.00 a 65.00)
4. Abre DevTools → Network tab
5. Filtra por "prize-config"

**Pasos:**
1. Haz clic en "Guardar" o "Actualizar"
2. Observa la Network tab
3. Observa la consola

**Resultado esperado en Network:**
```
Request URL: http://localhost:5000/api/betting-pools/{id}/prize-config
Request Method: PATCH
Status Code: 200 OK
```

**Payload esperado (Request):**
```json
{
  "prizeConfigs": [
    {
      "prizeFieldId": 1,
      "fieldCode": "DIRECTO_PRIMER_PAGO",
      "value": 65.00
    }
  ]
}
```

**Logs esperados en consola:**
```
📤 [PATCH] Enviando 1 cambios a banca {id}
✅ [PATCH] Actualización exitosa: 1 campos actualizados
```

**Comparación de tamaños:**
- PATCH payload: ~100-200 bytes
- POST payload anterior: ~15,000 bytes (99% reducción!)

---

### TEST 6: Test de múltiples cambios

**Objetivo:** Verificar PATCH con múltiples campos

**Pasos:**
1. En EditBanca, cambia 3-5 campos diferentes
2. Observa Network tab
3. Haz clic en "Guardar"

**Resultado esperado:**
```
📤 [PATCH] Enviando 5 cambios a banca {id}
✅ [PATCH] Actualización exitosa: 5 campos actualizados
```

**Payload esperado:**
```json
{
  "prizeConfigs": [
    { "prizeFieldId": 1, "fieldCode": "DIRECTO_PRIMER_PAGO", "value": 65.00 },
    { "prizeFieldId": 2, "fieldCode": "DIRECTO_SEGUNDO_PAGO", "value": 5.00 },
    { "prizeFieldId": 3, "fieldCode": "DIRECTO_TERCER_PAGO", "value": 3.00 },
    ...
  ]
}
```

---

### TEST 7: Test de configuración general

**Objetivo:** Verificar que updateBranchConfig funciona

**Pasos:**
1. En EditBanca, ve al tab "General"
2. Cambia alguna configuración (ej: "Límite de venta diaria")
3. Observa Network tab
4. Haz clic en "Guardar"

**Resultado esperado en Network:**
```
Request URL: http://localhost:5000/api/betting-pools/{id}/config
Request Method: POST
Status Code: 200 OK
```

**Logs esperados:**
```
API_REQUEST POST /betting-pools/{id}/config
API_SUCCESS POST /betting-pools/{id}/config
```

---

### TEST 8: Test de carga inicial

**Objetivo:** Verificar que getBranchWithConfig funciona

**Pasos:**
1. Recarga la página de EditBanca (Ctrl+R)
2. Observa la consola
3. Observa Network tab

**Resultado esperado en Network:**
```
GET /api/betting-pools/{id}/config → 200 OK
GET /api/betting-pools/{id}/prize-config → 200 OK
GET /api/prize-fields → 200 OK (o desde cache)
```

**Logs esperados:**
```
API_REQUEST GET /betting-pools/{id}/config
API_SUCCESS GET /betting-pools/{id}/config
🔍 [PRIZE SERVICE] Calling GET /betting-pools/{id}/prize-config
✅ [PRIZE SERVICE] Returning response directly: [...]
📥 Obteniendo campos de premios...
✅ Campos de premios obtenidos: 24 bet types
```

---

## Tests de Rendimiento

### TEST 9: Comparar tiempos PATCH vs POST

**Setup:**
1. Usa Chrome DevTools → Network tab
2. Habilita "Preserve log"
3. Mira la columna "Time"

**Escenario 1 - POST completo (150 campos):**
```
POST /api/betting-pools/9/prize-config
Time: ~800-1200ms
Size: ~15KB
```

**Escenario 2 - PATCH parcial (1 campo):**
```
PATCH /api/betting-pools/9/prize-config
Time: ~40-80ms
Size: ~200 bytes
```

**Mejora esperada:**
- Tiempo: 95% más rápido
- Tamaño: 99% más pequeño

---

### TEST 10: Test de rendimiento con DevTools

**Objetivo:** Medir performance exacta

**Pasos:**
1. Abre DevTools → Performance tab
2. Haz clic en "Record"
3. Cambia un campo en EditBanca
4. Haz clic en "Guardar"
5. Detén la grabación
6. Busca la llamada PATCH en el timeline

**Métricas a verificar:**
- Request Duration: < 100ms
- Response Time: < 50ms
- Total Time: < 150ms

---

## Tests de Errores

### TEST 11: Manejo de errores de red

**Objetivo:** Verificar que los errores se manejan correctamente

**Pasos:**
1. Detén el backend API (Ctrl+C en la terminal)
2. Intenta guardar cambios en EditBanca
3. Observa la consola

**Resultado esperado:**
```
❌ Error al actualizar configuración de premios para banca {id}: Network Error
⚠️ No hay conexión con el servidor API
```

**UI esperada:**
- Mensaje de error amigable al usuario
- No se rompe la aplicación

---

### TEST 12: Manejo de errores de validación

**Objetivo:** Verificar errores del backend

**Pasos:**
1. Reinicia el backend
2. Intenta enviar un valor inválido (ej: valor negativo)
3. Observa la respuesta

**Resultado esperado:**
```
❌ Error al actualizar configuración de premios para banca {id}: Error 400
```

---

## Tests de Integración

### TEST 13: Flujo completo de edición

**Objetivo:** Test end-to-end completo

**Pasos:**
1. Navega a Bancas
2. Selecciona una banca
3. Haz clic en "Editar"
4. Cambia configuración general (tab General)
5. Guarda
6. Cambia premios y comisiones (tab Premios)
7. Guarda
8. Verifica que ambos cambios se guardaron
9. Recarga la página
10. Verifica que los cambios persisten

**Resultado esperado:**
- Todos los cambios se guardan correctamente
- No hay errores en consola
- Los cambios persisten después de recargar
- El rendimiento es rápido (< 100ms por request)

---

### TEST 14: Test con múltiples usuarios

**Objetivo:** Verificar concurrencia

**Pasos:**
1. Abre EditBanca en dos ventanas diferentes (misma banca)
2. En ventana 1: cambia campo A
3. En ventana 2: cambia campo B
4. Guarda en ventana 1
5. Guarda en ventana 2
6. Verifica que ambos cambios se guardaron

**Resultado esperado:**
- Ambos cambios se guardan correctamente
- No hay conflictos
- PATCH atómico previene pérdida de datos

---

## Checklist de Verificación Final

Marca cada item después de verificar:

### Funcionalidad Básica
- [ ] api.js tiene método PATCH
- [ ] branchService.js existe y exporta funciones correctas
- [ ] prizeFieldService.js existe y exporta funciones correctas
- [ ] EditBanca.jsx carga sin errores
- [ ] No hay errores en la consola del navegador
- [ ] Build de producción exitoso (`npm run build`)

### Funcionalidad PATCH
- [ ] patchBancaPrizeConfig envía request PATCH
- [ ] Solo envía campos que cambiaron
- [ ] Payload es < 1KB para cambios pequeños
- [ ] Respuesta es < 100ms
- [ ] Logging muestra cantidad correcta de cambios

### Compatibilidad
- [ ] getBranchWithConfig funciona
- [ ] updateBranchConfig funciona
- [ ] updateBranch funciona
- [ ] Todos los tabs de EditBanca funcionan
- [ ] Guardar y cargar funciona correctamente

### Rendimiento
- [ ] PATCH es significativamente más rápido que POST
- [ ] Payload reducido en ~99%
- [ ] No hay lag en la UI
- [ ] Network requests son eficientes

### Manejo de Errores
- [ ] Errores de red se manejan correctamente
- [ ] Errores de validación se muestran al usuario
- [ ] No hay crashes o pantallas blancas
- [ ] Mensajes de error son claros

---

## Métricas de Éxito

### Rendimiento Objetivo

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Tiempo PATCH | < 100ms | ⬜ |
| Payload size | < 1KB | ⬜ |
| Mejora vs POST | > 90% | ⬜ |
| Build time | < 30s | ⬜ |
| Carga inicial | < 2s | ⬜ |

### Funcionalidad Objetivo

| Feature | Estado |
|---------|--------|
| Método PATCH implementado | ⬜ |
| branchService.js creado | ⬜ |
| prizeFieldService.js creado | ⬜ |
| EditBanca compatible | ⬜ |
| Tests pasados | ⬜ |

---

## Comandos Útiles para Testing

### Ver logs en tiempo real

```bash
# Backend logs
cd /home/jorge/projects/Lottery-Project/LottoApi
dotnet run | grep -E "(PATCH|prize-config)"

# Frontend logs
cd /home/jorge/projects/Lottery-Project/LottoWebApp
npm run dev | grep -E "(PATCH|prize)"
```

### Limpiar y reconstruir

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp
rm -rf node_modules dist
npm install
npm run build
```

### Verificar archivos creados

```bash
ls -la src/services/branchService.js
ls -la src/services/prizeFieldService.js
grep -n "patch:" src/services/api.js
```

---

## Troubleshooting

### Problema: "PATCH is not a function"

**Solución:**
```bash
# Verifica que api.js tenga el método PATCH
grep -A 5 "patch:" /home/jorge/projects/Lottery-Project/LottoWebApp/src/services/api.js

# Recarga la página con cache limpio (Ctrl+Shift+R)
```

---

### Problema: "Cannot find module branchService"

**Solución:**
```bash
# Verifica que el archivo existe
ls -la /home/jorge/projects/Lottery-Project/LottoWebApp/src/services/branchService.js

# Reinicia el dev server
npm run dev
```

---

### Problema: "Network Error" o "CORS"

**Solución:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:5000/health

# Verifica el proxy en vite.config.js
grep -A 10 "proxy" vite.config.js
```

---

### Problema: Cambios no se guardan

**Solución:**
1. Abre DevTools → Network tab
2. Busca el request PATCH
3. Verifica el payload y response
4. Revisa logs del backend
5. Verifica que el bettingPoolId sea correcto

---

## Conclusión

Una vez completados todos los tests, deberías tener:

✅ Funcionalidad PATCH 100% operativa
✅ Rendimiento 95% mejorado
✅ EditBanca funcionando perfectamente
✅ Sin errores en consola
✅ Build de producción exitoso

**Fecha de testing:** _______________
**Testeado por:** _______________
**Resultado final:** ⬜ PASS  ⬜ FAIL

---

**Notas adicionales:**
```
[Espacio para notas del testing]
```
