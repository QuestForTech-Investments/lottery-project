# 🌍 Sistema de Internacionalización (i18n)

Este proyecto utiliza **react-i18next** para soportar múltiples idiomas.

## 📚 Idiomas Soportados

- 🇪🇸 **Español (es)** - Idioma por defecto
- 🇬🇧 **Inglés (en)**
- 🇫🇷 **Francés (fr)**

## 📁 Estructura de Archivos

```
src/i18n/
├── config.js           # Configuración de i18next
└── locales/
    ├── es.json         # Traducciones en español
    ├── en.json         # Traducciones en inglés
    └── fr.json         # Traducciones en francés
```

## 🎯 Cómo Usar en Componentes

### 1. Importar el hook

```jsx
import { useTranslation } from 'react-i18next';
```

### 2. Usar en el componente

```jsx
function MiComponente() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.create')}</button>
    </div>
  );
}
```

## ➕ Agregar Nuevas Traducciones

### 1. Edita los archivos JSON

Agrega la nueva clave en **los 3 idiomas**:

**es.json:**
```json
{
  "miSeccion": {
    "miTexto": "Hola Mundo"
  }
}
```

**en.json:**
```json
{
  "miSeccion": {
    "miTexto": "Hello World"
  }
}
```

**fr.json:**
```json
{
  "miSeccion": {
    "miTexto": "Bonjour le monde"
  }
}
```

### 2. Usa la traducción

```jsx
{t('miSeccion.miTexto')}
```

## 🔄 Cambiar Idioma Programáticamente

```jsx
import { useTranslation } from 'react-i18next';

function MiComponente() {
  const { i18n } = useTranslation();

  const cambiarIdioma = (codigoIdioma) => {
    i18n.changeLanguage(codigoIdioma); // 'es', 'en', 'fr'
  };

  return (
    <button onClick={() => cambiarIdioma('en')}>
      Cambiar a Inglés
    </button>
  );
}
```

## 💾 Persistencia

El idioma seleccionado se guarda automáticamente en `localStorage` y se restaura cuando el usuario vuelve a la aplicación.

## 🎨 Selector de Idioma

Ya está implementado en el `Header` de la aplicación. Los usuarios pueden cambiar el idioma desde ahí.

## 📝 Buenas Prácticas

1. **Organiza las traducciones por secciones** (common, dashboard, widgets, etc.)
2. **Usa nombres descriptivos** para las claves
3. **Mantén consistencia** entre los archivos de idioma
4. **Agrega todas las traducciones al mismo tiempo** (no dejes idiomas incompletos)
5. **Usa `common` para textos reutilizables** (botones, mensajes, etc.)

## 🆕 Agregar un Nuevo Idioma

### 1. Crea el archivo de traducciones

```
src/i18n/locales/it.json
```

### 2. Importa en `config.js`

```javascript
import it from './locales/it.json'

const resources = {
  es: { translation: es },
  en: { translation: en },
  fr: { translation: fr },
  it: { translation: it } // Nuevo
}
```

### 3. Agrégalo a los idiomas soportados

```javascript
supportedLngs: ['es', 'en', 'fr', 'it']
```

### 4. Actualiza el `LanguageSelector`

Agrega el nuevo idioma al array:

```javascript
const languages = [
  { code: 'es', name: 'language.spanish', flag: '🇪🇸' },
  { code: 'en', name: 'language.english', flag: '🇬🇧' },
  { code: 'fr', name: 'language.french', flag: '🇫🇷' },
  { code: 'it', name: 'language.italian', flag: '🇮🇹' }
]
```

## 🔍 Obtener el Idioma Actual

```jsx
const { i18n } = useTranslation();
const idiomaActual = i18n.language; // 'es', 'en', 'fr'
```

## 🌐 Detección Automática

El sistema detecta automáticamente el idioma del navegador del usuario al cargar la aplicación por primera vez. Si el idioma del navegador no está soportado, usará español como predeterminado.

