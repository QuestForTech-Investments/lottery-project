# 🧪 Cómo Probar el Error Boundary

## Opción 1: Usar el componente de prueba (MÁS FÁCIL)

### Paso 1: Agregar el componente de prueba al Dashboard

Edita `src/pages/DashboardMUI.jsx` y agrega al inicio:

```javascript
import ErrorBoundaryTest from '@components/common/ErrorBoundaryTest';

function DashboardMUI() {
  return (
    <Box>
      {/* Solo en desarrollo */}
      <ErrorBoundaryTest />

      {/* Resto del dashboard */}
      ...
    </Box>
  );
}
```

### Paso 2: Ejecutar la app

```bash
npm run dev
```

### Paso 3: Navegar al Dashboard

1. Abre http://localhost:4000
2. Haz login
3. Verás un panel naranja con el título "Error Boundary Test Component"

### Paso 4: Probar el error

1. Click en el botón **"Throw Render Error"**
2. Verás que aparece la pantalla de error (ErrorFallback)
3. Prueba las opciones de recuperación:
   - **Intentar de nuevo** - Resetea el error boundary
   - **Ir al inicio** - Navega a /dashboard
   - **Recargar página** - Recarga todo
4. Click en **"Ver detalles técnicos"** para ver el stack trace

### Paso 5: Remover el componente de prueba

Una vez probado, comenta o elimina `<ErrorBoundaryTest />` del Dashboard.

---

## Opción 2: Simular error en código (AVANZADO)

### En cualquier componente existente:

```javascript
// Agregar un botón temporal
<Button onClick={() => {
  throw new Error('Test error!');
}}>
  Simular Error
</Button>
```

### O forzar un error durante render:

```javascript
function MiComponente() {
  const data = null;

  // Esto causará un error: Cannot read property 'map' of null
  return (
    <div>
      {data.map(item => <div key={item}>{item}</div>)}
    </div>
  );
}
```

---

## ✅ Qué deberías ver cuando funciona:

1. **Antes del error:**
   - App funciona normal

2. **Después del error:**
   - ❌ NO deberías ver pantalla blanca
   - ✅ Deberías ver la UI de ErrorFallback:
     - Ícono de error rojo pulsando
     - Mensaje "¡Oops! Algo salió mal"
     - 3 botones de recuperación
     - Opción de ver detalles técnicos

3. **En la consola:**
   - Error logged con `🔴 ErrorBoundary caught an error:`
   - Stack trace completo

4. **En localStorage:**
   - Error guardado en `app_debug_logs`
   - Ver con: `localStorage.getItem('app_debug_logs')`

---

## 🐛 Troubleshooting

### El error no se captura

**Posible causa:** Errores async no son capturados por ErrorBoundary

**Solución:** Solo errores durante el render son capturados. Para errores async usa try/catch:

```javascript
const handleClick = async () => {
  try {
    await fetchData();
  } catch (error) {
    // Manejar aquí
  }
};
```

### Pantalla blanca aún aparece

**Posible causa:** ErrorBoundary no está envolviendo el componente

**Solución:** Verificar que ErrorBoundary está en App.jsx alrededor del Router

---

## 📚 Más información

Ver: `src/components/common/ERROR_BOUNDARY_README.md`
