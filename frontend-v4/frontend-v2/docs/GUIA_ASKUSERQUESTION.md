# 📋 Guía de AskUserQuestion - Decisiones Interactivas

## ¿Qué es AskUserQuestion?

Es una herramienta que permite a Claude Code hacer preguntas al usuario y obtener respuestas durante la ejecución. Perfecto para:
- Elegir entre opciones de diseño
- Confirmar acciones importantes
- Seleccionar configuraciones
- Obtener preferencias del usuario

---

## 🎯 Características

- ✅ **1-4 preguntas** en una sola llamada
- ✅ **Selección simple** (radio buttons)
- ✅ **Selección múltiple** (checkboxes)
- ✅ **Opción "Other"** automática para texto libre
- ✅ **Descripciones** para cada opción
- ✅ **Headers** cortos para identificación rápida

---

## 📝 Ejemplo 1: Selección Simple (Una Opción)

### Caso: Elegir estilo de diseño

```javascript
AskUserQuestion({
  questions: [{
    question: "¿Qué estilo de diseño prefieres para la aplicación?",
    header: "Diseño",
    options: [
      {
        label: "Modern Gradient",
        description: "Gradientes vibrantes con efecto glassmorphism. Ideal para apps modernas."
      },
      {
        label: "Dark Mode Premium",
        description: "Modo oscuro elegante con acentos neón. Perfecto para fintech."
      },
      {
        label: "Neumorphism Soft",
        description: "Efectos 3D suaves y minimalistas. Excelente para apps de salud."
      }
    ],
    multiSelect: false
  }]
})
```

**Respuesta del usuario:**
```
Diseño: "Modern Gradient"
```

---

## 📝 Ejemplo 2: Selección Múltiple

### Caso: Elegir características a implementar

```javascript
AskUserQuestion({
  questions: [{
    question: "¿Qué características quieres implementar en esta fase?",
    header: "Features",
    options: [
      {
        label: "Dark Mode Toggle",
        description: "Permitir al usuario cambiar entre modo claro y oscuro"
      },
      {
        label: "Animaciones",
        description: "Agregar transiciones y micro-interacciones"
      },
      {
        label: "Notificaciones Push",
        description: "Sistema de notificaciones en tiempo real"
      },
      {
        label: "Exportar PDF",
        description: "Funcionalidad para exportar reportes a PDF"
      }
    ],
    multiSelect: true  // Puede seleccionar múltiples
  }]
})
```

**Respuesta del usuario:**
```
Features: ["Dark Mode Toggle", "Animaciones"]
```

---

## 📝 Ejemplo 3: Múltiples Preguntas

### Caso: Configuración completa de un feature

```javascript
AskUserQuestion({
  questions: [
    {
      question: "¿Qué librería de gráficos prefieres?",
      header: "Charts",
      options: [
        { label: "Chart.js", description: "Simple, ligera, fácil de usar" },
        { label: "Recharts", description: "Componentes React, muy personalizable" },
        { label: "Victory", description: "Animaciones elegantes, modular" }
      ],
      multiSelect: false
    },
    {
      question: "¿Qué tipos de gráficos necesitas?",
      header: "Types",
      options: [
        { label: "Barras", description: "Comparar valores entre categorías" },
        { label: "Líneas", description: "Mostrar tendencias en el tiempo" },
        { label: "Pastel", description: "Mostrar proporciones" },
        { label: "Area", description: "Volumen acumulado en el tiempo" }
      ],
      multiSelect: true
    },
    {
      question: "¿Prefieres tema claro u oscuro para los gráficos?",
      header: "Theme",
      options: [
        { label: "Claro", description: "Fondo blanco, colores vibrantes" },
        { label: "Oscuro", description: "Fondo oscuro, colores neón" }
      ],
      multiSelect: false
    }
  ]
})
```

**Respuesta del usuario:**
```
Charts: "Recharts"
Types: ["Barras", "Líneas", "Area"]
Theme: "Oscuro"
```

---

## 📝 Ejemplo 4: Confirmación de Acción Importante

### Caso: Confirmar antes de eliminar datos

```javascript
AskUserQuestion({
  questions: [{
    question: "¿Estás seguro de que quieres eliminar todos los datos antiguos? Esta acción no se puede deshacer.",
    header: "Confirmar",
    options: [
      {
        label: "Sí, eliminar",
        description: "Eliminar permanentemente datos de más de 6 meses"
      },
      {
        label: "No, cancelar",
        description: "Mantener todos los datos y cancelar la operación"
      }
    ],
    multiSelect: false
  }]
})
```

---

## 📝 Ejemplo 5: Configuración de Testing

### Caso: Elegir estrategia de pruebas

```javascript
AskUserQuestion({
  questions: [
    {
      question: "¿Qué framework de testing quieres usar?",
      header: "Framework",
      options: [
        { label: "Jest", description: "Rápido, todo en uno, gran ecosistema" },
        { label: "Vitest", description: "Compatible con Vite, muy rápido" },
        { label: "Mocha", description: "Flexible, muchas opciones de configuración" }
      ],
      multiSelect: false
    },
    {
      question: "¿Qué tipos de tests quieres implementar?",
      header: "Test Types",
      options: [
        { label: "Unit Tests", description: "Pruebas de funciones y componentes individuales" },
        { label: "Integration", description: "Pruebas de interacción entre módulos" },
        { label: "E2E", description: "Pruebas end-to-end con Playwright/Cypress" },
        { label: "Visual", description: "Pruebas de regresión visual" }
      ],
      multiSelect: true
    }
  ]
})
```

---

## 🎯 Casos de Uso Comunes

### 1. **Arquitectura y Diseño**
```javascript
"¿Qué arquitectura de carpetas prefieres?"
"¿Usamos TypeScript o JavaScript?"
"¿Qué sistema de estilos: CSS Modules, Styled Components, o Tailwind?"
```

### 2. **Dependencias y Librerías**
```javascript
"¿Qué router usamos: React Router o TanStack Router?"
"¿Qué estado global: Redux, Zustand, o Context API?"
"¿Qué librería de formularios: React Hook Form o Formik?"
```

### 3. **Optimización**
```javascript
"¿Qué priorizar: tamaño del bundle o velocidad de desarrollo?"
"¿Implementar code splitting ahora o después?"
"¿Cuántos componentes memoizar: todos, críticos, o ninguno?"
```

### 4. **Features**
```javascript
"¿Qué características del dashboard implementar primero?"
"¿Agregar autenticación con Google, GitHub, o solo email?"
"¿Sistema de permisos simple o granular?"
```

### 5. **Refactoring**
```javascript
"¿Refactorizar todo de una vez o de forma incremental?"
"¿Actualizar dependencias mayores ahora o después del release?"
"¿Mantener compatibilidad con código legacy?"
```

---

## ⚙️ Mejores Prácticas

### ✅ **DO (Hacer)**

1. **Headers cortos y descriptivos** (max 12 caracteres)
   ```javascript
   header: "DB Type"      // ✅ Bueno
   header: "Database"     // ✅ Bueno
   ```

2. **Descripciones claras y útiles**
   ```javascript
   description: "PostgreSQL: Robusto, ACID compliant, excelente para relaciones complejas"  // ✅
   ```

3. **2-4 opciones por pregunta**
   ```javascript
   options: [
     { label: "Opción 1", description: "..." },
     { label: "Opción 2", description: "..." },
     { label: "Opción 3", description: "..." }
   ]  // ✅ Rango ideal
   ```

4. **Preguntas específicas y claras**
   ```javascript
   question: "¿Qué base de datos prefieres para producción?"  // ✅ Específico
   ```

### ❌ **DON'T (Evitar)**

1. **Headers muy largos**
   ```javascript
   header: "Database Selection"  // ❌ Demasiado largo (>12 chars)
   ```

2. **Demasiadas opciones**
   ```javascript
   options: [/* 10 opciones */]  // ❌ Abrumador
   ```

3. **Preguntas ambiguas**
   ```javascript
   question: "¿Qué prefieres?"  // ❌ No está claro de qué
   ```

4. **Descripciones vacías o inútiles**
   ```javascript
   description: "Esta es la opción 1"  // ❌ No aporta valor
   ```

---

## 🔄 Flujo de Trabajo Típico

### Paso 1: Claude detecta necesidad de decisión
```
Claude: "Necesito saber qué librería de UI usar..."
```

### Paso 2: Claude usa AskUserQuestion
```javascript
AskUserQuestion({
  questions: [{
    question: "¿Qué librería de componentes UI prefieres?",
    header: "UI Library",
    options: [
      { label: "Material-UI", description: "..." },
      { label: "Ant Design", description: "..." },
      { label: "Chakra UI", description: "..." }
    ],
    multiSelect: false
  }]
})
```

### Paso 3: Usuario responde en la interfaz
```
UI Library: "Material-UI"
```

### Paso 4: Claude continúa con la respuesta
```
Claude: "Perfecto, voy a instalar Material-UI y configurar el theme..."
```

---

## 🎨 Ejemplo Real: Modernización de UI

Imagina que Claude está modernizando la UI y necesita tu input:

```javascript
AskUserQuestion({
  questions: [
    {
      question: "¿Qué paleta de colores prefieres?",
      header: "Colors",
      options: [
        { label: "Indigo/Purple", description: "Moderno, profesional, vibrante" },
        { label: "Blue/Cyan", description: "Corporativo, confiable, fresco" },
        { label: "Green/Teal", description: "Natural, calmado, equilibrado" },
        { label: "Custom", description: "Define tus propios colores" }
      ],
      multiSelect: false
    },
    {
      question: "¿Qué efectos visuales quieres habilitar?",
      header: "Effects",
      options: [
        { label: "Glassmorphism", description: "Fondos translúcidos con blur" },
        { label: "Gradients", description: "Gradientes de color en botones y fondos" },
        { label: "Shadows", description: "Sombras suaves y modernas" },
        { label: "Animations", description: "Transiciones y micro-interacciones" }
      ],
      multiSelect: true
    },
    {
      question: "¿Border radius prefieres?",
      header: "Radius",
      options: [
        { label: "8px", description: "Sutilmente redondeado" },
        { label: "12px", description: "Moderadamente redondeado (recomendado)" },
        { label: "16px", description: "Muy redondeado, más suave" }
      ],
      multiSelect: false
    }
  ]
})
```

**Respuestas:**
```
Colors: "Indigo/Purple"
Effects: ["Glassmorphism", "Gradients", "Shadows", "Animations"]
Radius: "12px"
```

**Claude procede:**
```
Perfecto! Voy a:
1. Actualizar theme con paleta Indigo/Purple
2. Implementar glassmorphism en cards
3. Agregar gradientes a botones
4. Configurar shadows modernas
5. Agregar animaciones suaves
6. Establecer border-radius en 12px
```

---

## 💡 Tips Avanzados

### 1. **Combinar con TodoWrite**
```javascript
// Primero pregunta
AskUserQuestion({ ... })

// Luego crea todos basados en respuesta
TodoWrite({
  todos: [
    { content: "Implementar feature A", status: "pending" },
    { content: "Implementar feature B", status: "pending" }
  ]
})
```

### 2. **Usar "Other" para input custom**
El usuario siempre puede seleccionar "Other" y escribir texto libre:
```
User selects "Other" and types: "Quiero usar Svelte Material UI"
```

### 3. **Preguntas condicionales**
```javascript
// Primera pregunta
const response1 = AskUserQuestion({ ... })

// Segunda pregunta basada en respuesta 1
if (response1 === "TypeScript") {
  AskUserQuestion({
    question: "¿Qué configuración de TypeScript?"
    // ...
  })
}
```

---

## 🚀 Cuándo Usar AskUserQuestion

### ✅ **Usar cuando:**
- Hay múltiples opciones válidas
- La decisión afecta arquitectura o diseño significativo
- Necesitas confirmar una acción destructiva
- El usuario tiene preferencias personales (estilos, librerías)
- Hay trade-offs importantes a considerar

### ❌ **NO usar cuando:**
- Solo hay una opción obvia
- Son decisiones técnicas que no afectan al usuario
- Ya hay un estándar del proyecto establecido
- La pregunta es trivial o de implementación interna

---

## 📊 Resumen

| Aspecto | Detalle |
|---------|---------|
| **Preguntas por llamada** | 1-4 |
| **Opciones por pregunta** | 2-4 (recomendado) |
| **Header máximo** | 12 caracteres |
| **Tipos** | Single select, Multi select |
| **Opción "Other"** | Automática (texto libre) |
| **Uso** | Decisiones de arquitectura, diseño, configuración |

---

## 🎯 Próximos Pasos

Ahora que conoces `AskUserQuestion`, Claude puede:
1. **Preguntarte** cuando necesite una decisión
2. **Ofrecerte opciones** claras con descripciones
3. **Procesar tu respuesta** y continuar el trabajo
4. **Documentar** la decisión tomada

**Ejemplo de uso en esta sesión:**
```javascript
AskUserQuestion({
  questions: [{
    question: "¿Quieres que agregue más efectos visuales al diseño Modern Gradient actual?",
    header: "Effects",
    options: [
      { label: "Sí", description: "Agregar más animaciones y efectos hover" },
      { label: "No", description: "Mantener el diseño como está" }
    ],
    multiSelect: false
  }]
})
```

¡Ahora Claude puede ser mucho más interactivo contigo! 🎉
