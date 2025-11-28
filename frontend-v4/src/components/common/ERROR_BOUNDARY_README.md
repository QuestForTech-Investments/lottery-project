# 🛡️ Error Boundary - Documentación

## ¿Qué es un Error Boundary?

Un Error Boundary es un componente de React que captura errores de JavaScript en cualquier parte del árbol de componentes hijo, registra esos errores y muestra una UI de respaldo en lugar de que toda la aplicación se rompa.

## 📁 Archivos

- **ErrorBoundary.jsx** - Componente de clase que captura errores
- **ErrorFallback.jsx** - UI que se muestra cuando hay un error
- **ErrorBoundaryTest.jsx** - Componente de prueba (remover en producción)

## 🚀 Cómo está implementado

### En App.jsx

```javascript
<ErrorBoundary>
  <Router>
    {/* Toda la aplicación está protegida */}
  </Router>
</ErrorBoundary>
```

### Protección granular en rutas

```javascript
<ErrorBoundary>
  <Suspense fallback={<LazyLoadingFallback />}>
    <MainLayout>
      <DashboardMUI />
    </MainLayout>
  </Suspense>
</ErrorBoundary>
```

## ✅ Qué errores captura

- ✅ Errores durante el render
- ✅ Errores en lifecycle methods
- ✅ Errores en constructores
- ✅ Errores en event handlers (si lanzan durante render)

## ❌ Qué errores NO captura

- ❌ Errores en event handlers (async)
- ❌ Errores en setTimeout/setInterval
- ❌ Errores en Promises sin catch
- ❌ Errores del lado del servidor (SSR)
- ❌ Errores en el mismo Error Boundary

## 🧪 Cómo probar

### Opción 1: Usar el componente de prueba

```javascript
// En cualquier página (ej: DashboardMUI.jsx)
import ErrorBoundaryTest from '@components/common/ErrorBoundaryTest';

function DashboardMUI() {
  return (
    <Box>
      {/* Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && <ErrorBoundaryTest />}

      {/* Resto del dashboard */}
    </Box>
  );
}
```

### Opción 2: Lanzar error manual

```javascript
// En cualquier componente
const handleClick = () => {
  throw new Error('Test error!');
};

<Button onClick={handleClick}>Throw Error</Button>
```

### Opción 3: Error durante render

```javascript
function ComponenteThatCrashes() {
  const data = null;
  return <div>{data.map(...)}</div>; // Crash: cannot read map of null
}
```

## 🎨 Características del ErrorFallback

1. **Animación del ícono** - Ícono de error con animación pulse
2. **Múltiples opciones de recuperación:**
   - 🔄 Intentar de nuevo (reset error boundary)
   - 🏠 Ir al inicio (navega a /dashboard)
   - 🔃 Recargar página (window.reload)
3. **Detalles técnicos colapsables** - Para desarrolladores
4. **Contador de errores** - Muestra si el error se repite
5. **Responsive** - Funciona en móvil y desktop

## 📊 Logging

Los errores capturados se registran en:

1. **Console** - `console.error()`
2. **Logger service** - `logger.error('ERROR_BOUNDARY', ...)`
3. **LocalStorage** - Via logger service

### Integración con servicios externos (opcional)

Puedes descomentar y configurar en `ErrorBoundary.jsx`:

```javascript
// Sentry
if (window.Sentry) {
  window.Sentry.captureException(error, {
    contexts: { react: { componentStack: errorInfo.componentStack } }
  });
}

// LogRocket
if (window.LogRocket) {
  window.LogRocket.captureException(error);
}
```

## 🔧 Configuración Avanzada

### Custom Fallback UI

```javascript
<ErrorBoundary fallback={<MiCustomUI />}>
  <MiComponente />
</ErrorBoundary>
```

### Callback on Reset

```javascript
<ErrorBoundary onReset={() => console.log('Error boundary reset')}>
  <MiComponente />
</ErrorBoundary>
```

## 🏗️ Arquitectura

```
App.jsx (ErrorBoundary global)
  └── Router
      └── Routes
          ├── Login (sin ErrorBoundary adicional)
          └── Protected Routes (cada una con ErrorBoundary)
              └── Suspense (lazy loading)
                  └── MainLayout
                      └── Componentes de página
```

**Beneficios de esta arquitectura:**

1. Si la página de login falla, aún puedes intentar recargar
2. Si una ruta protegida falla, otras rutas siguen funcionando
3. El error no crashea toda la app

## 📱 Experiencia de Usuario

**Antes de ErrorBoundary:**
```
Usuario navega → Error ocurre → Pantalla blanca → Usuario confundido
```

**Con ErrorBoundary:**
```
Usuario navega → Error ocurre → UI amigable → Usuario puede recuperarse
```

## 🔐 Producción

### Qué hacer:

1. ✅ Mantener ErrorBoundary activo
2. ✅ Mantener ErrorFallback
3. ✅ Configurar servicio de tracking (Sentry, LogRocket)
4. ❌ Remover ErrorBoundaryTest o ponerlo detrás de flag

### Configurar Sentry (ejemplo):

```bash
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

```javascript
// ErrorBoundary.jsx (descomentar)
if (window.Sentry) {
  window.Sentry.captureException(error, {
    contexts: { react: { componentStack: errorInfo.componentStack } }
  });
}
```

## 📚 Referencias

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in React](https://kentcdodds.com/blog/use-react-error-boundary)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)

## ✨ Próximas Mejoras

- [ ] Integrar con Sentry o similar
- [ ] Agregar tests unitarios
- [ ] Agregar analytics cuando ocurre un error
- [ ] Crear diferentes fallbacks para diferentes tipos de errores
- [ ] Agregar botón "Reportar problema" que envíe log al backend

---

**Implementado:** 2025-10-30
**Última actualización:** 2025-10-30
**Estado:** ✅ Producción Ready
