# Configuración de la API

## Variables de Entorno

Para configurar la URL de la API, puedes usar las siguientes variables de entorno:

### Archivo `.env.local` (recomendado para desarrollo)

```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Development Configuration
VITE_NODE_ENV=development
```

### Archivo `.env` (para configuración general)

```bash
# API Configuration
VITE_API_URL=http://localhost:5000
```

## Configuración por Defecto

Si no se especifica `VITE_API_URL`, el sistema usará por defecto:
- **Desarrollo**: `http://localhost:5000`
- **Producción**: Se debe configurar explícitamente

## Uso en el Código

```javascript
import { API_URL, API_ENDPOINTS, buildApiUrl } from '../config/apiConfig';

// Usar URL base
const response = await fetch(`${API_URL}/api/users`);

// Usar función helper
const response = await fetch(buildApiUrl(API_ENDPOINTS.USERS));
```

## Configuración de Producción

Para producción, configura las variables de entorno en tu servidor:

```bash
VITE_API_URL=https://api.tu-dominio.com
VITE_NODE_ENV=production
```

## Verificación

El sistema mostrará la configuración en la consola durante el desarrollo:

```
🔧 API Configuration: {
  API_URL: "http://localhost:5000",
  NODE_ENV: "development",
  isDevelopment: true,
  isProduction: false
}
```
