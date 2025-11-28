# 🔄 Estrategia de Refactorización Incremental

**Objetivo:** Refactorizar la aplicación sin romper funcionalidad existente, permitiendo pruebas continuas y rollback rápido.

---

## 📋 **Principios Fundamentales**

### 1. **Regla de Oro: Nunca Romper Main**
- `main` siempre debe estar funcional y desplegable
- Todo cambio debe pasar por PR + revisión
- CI/CD debe pasar antes de merge

### 2. **Boy Scout Rule**
> "Deja el código mejor de como lo encontraste"

Cada vez que toques un archivo, mejóralo un poco:
- Agrega un test
- Mejora nombres de variables
- Extrae una función pequeña
- Agrega types/PropTypes

### 3. **Strangler Fig Pattern**
Crear código nuevo al lado del viejo, migrar gradualmente, eliminar viejo al final.

```
Old Code ████████░░░░  →  ████░░░░░░░░  →  ░░░░░░░░░░░░  New Code
```

---

## 🌳 **Git Branching Strategy**

### Estructura de Branches

```
main (producción)
  ├── develop (desarrollo activo)
  │   ├── feature/refactor-auth          # Autenticación
  │   ├── feature/refactor-create-user   # Componente específico
  │   ├── feature/shared-components      # Componentes compartidos
  │   ├── feature/remove-jquery          # Limpieza de dependencias
  │   └── feature/add-tests              # Tests
  │
  └── hotfix/*                           # Fixes urgentes
```

### Workflow

```bash
# 1. Siempre partir desde develop actualizado
git checkout develop
git pull origin develop

# 2. Crear branch para refactorización específica
git checkout -b feature/refactor-create-banca

# 3. Hacer cambios pequeños e incrementales
# 4. Commit frecuentes con mensajes claros

git add .
git commit -m "refactor: extract GeneralTab from CreateBanca"

# 5. Push y crear PR cuando esté listo
git push -u origin feature/refactor-create-banca

# 6. PR → Review → Merge a develop
# 7. Probar en develop
# 8. Merge a main cuando esté estable
```

---

## 📦 **Estrategia por Capas (Bottom-Up)**

Refactorizar de abajo hacia arriba: primero utilidades, luego componentes pequeños, finalmente componentes grandes.

### Capa 1: Fundamentos (Semana 1-2) ✅ SEGURO

**No rompe nada existente, solo agrega:**

```bash
# Branch: feature/foundation
```

**1.1 Crear carpetas nuevas (sin tocar las viejas)**

```
src/
├── components/        # OLD - NO TOCAR AÚN
├── shared/           # NEW - Componentes reutilizables
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.jsx
│   │   └── index.js
│   ├── Input/
│   └── Modal/
├── hooks/            # NEW - Custom hooks
│   ├── useAuth.js
│   ├── useForm.js
│   └── useApi.js
└── utils/            # Mejorar existente
    ├── validators.js      # NEW
    ├── secureStorage.js   # NEW
    └── errorHandler.js    # NEW
```

**1.2 Agregar tests básicos**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js'
  }
})
```

**Prueba que funciona:**
```bash
npm run dev  # App sigue funcionando igual
npm test     # Tests nuevos pasan
```

✅ **Merge a develop** cuando:
- App funciona igual que antes
- Tests pasan
- No hay warnings en consola

---

### Capa 2: Componentes Pequeños (Semana 3-4) ✅ BAJO RIESGO

**Migrar componentes simples uno por uno:**

```bash
# Branch: feature/migrate-modals
```

**Estrategia de migración paralela:**

```
src/components/
├── PasswordModal.jsx           # OLD - Mantener temporalmente
├── ChangePasswordModal.jsx     # OLD - Mantener temporalmente
└── shared/
    └── Modal/
        ├── PasswordModal.jsx   # NEW - Versión refactorizada
        ├── PasswordModal.test.jsx
        └── index.js
```

**Paso a paso:**

1. **Crear nueva versión en `shared/`**
```javascript
// src/shared/Modal/PasswordModal.jsx
import { useState } from 'react'
import BaseModal from './BaseModal'

const PasswordModal = ({ isOpen, onClose, onSave }) => {
  // Versión refactorizada con tests
  return <BaseModal>{/* ... */}</BaseModal>
}

export default PasswordModal
```

2. **Agregar tests**
```javascript
// src/shared/Modal/PasswordModal.test.jsx
import { render, screen } from '@testing-library/react'
import PasswordModal from './PasswordModal'

test('renders password modal', () => {
  render(<PasswordModal isOpen={true} />)
  expect(screen.getByText(/contraseña/i)).toBeInTheDocument()
})
```

3. **Actualizar imports EN UN SOLO COMPONENTE primero**
```javascript
// src/components/UserList.jsx
// ANTES
// import PasswordModal from './PasswordModal'

// DESPUÉS
import PasswordModal from '@/shared/Modal/PasswordModal'
```

4. **Probar ese componente específicamente**
```bash
npm run dev
# Ir a /usuarios
# Probar modal de contraseña
# Verificar que funciona
```

5. **Si funciona, migrar otros componentes que usan ese modal**

6. **Cuando todos migren, eliminar el viejo**
```bash
git rm src/components/PasswordModal.jsx  # SOLO cuando nadie lo use
```

**Checklist antes de merge:**
- [ ] Nueva versión funciona igual que la vieja
- [ ] Tests pasan
- [ ] Al menos 1 componente usa la nueva versión
- [ ] No hay console.errors

---

### Capa 3: Estado Global (Semana 5) ⚠️ RIESGO MEDIO

**Agregar Context API SIN romper código existente:**

```bash
# Branch: feature/add-auth-context
```

**3.1 Crear AuthContext (sin usar todavía)**

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import secureStorage from '@/utils/secureStorage'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay sesión
    const token = secureStorage.getToken()
    if (token) {
      // Validar token
      setUser({ /* datos del usuario */ })
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    // Implementar login
  }

  const logout = () => {
    secureStorage.removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

**3.2 Envolver App (no rompe nada)**

```javascript
// src/main.jsx
import { AuthProvider } from '@/context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

**3.3 Migrar UN componente a la vez**

```javascript
// src/components/Header.jsx
import { useAuth } from '@/context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()

  // Usar el context en lugar de localStorage directo
  if (user) {
    return <div>Bienvenido {user.name}</div>
  }

  return <div>No autenticado</div>
}
```

**Probar:**
```bash
npm run dev
# Verificar que Header sigue mostrando usuario
# Verificar que logout funciona
# Verificar console - no debe haber errors
```

**Migrar siguiente componente solo si el anterior funciona.**

---

### Capa 4: God Component (Semana 6-8) ⚠️ ALTO RIESGO

**CreateBanca.jsx (1,580 líneas) - Estrategia especial:**

```bash
# Branch: feature/refactor-create-banca
```

**Enfoque: Crear nueva versión PARALELA**

```
src/components/
├── CreateBanca.jsx           # OLD - Mantener funcionando
└── CreateBanca/              # NEW - Versión refactorizada
    ├── index.jsx             # Container principal
    ├── tabs/
    │   ├── GeneralTab.jsx
    │   ├── ConfigTab.jsx
    │   └── ...
    ├── hooks/
    │   └── useBranchForm.js
    └── CreateBanca.test.jsx
```

**4.1 Crear versión nueva completa**

```javascript
// src/components/CreateBanca/index.jsx
import { useState } from 'react'
import GeneralTab from './tabs/GeneralTab'
import useBranchForm from './hooks/useBranchForm'

const CreateBancaNew = () => {
  const { formData, handleChange, handleSubmit } = useBranchForm()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <GeneralTab data={formData} onChange={handleChange} />
        {/* Otros tabs */}
      </Tabs>
    </div>
  )
}

export default CreateBancaNew
```

**4.2 Agregar FEATURE FLAG en App.jsx**

```javascript
// src/App.jsx
import CreateBanca from './components/CreateBanca'           // OLD
import CreateBancaNew from './components/CreateBanca/index' // NEW

// Feature flag temporal
const USE_NEW_CREATE_BANCA = import.meta.env.VITE_USE_NEW_CREATE_BANCA === 'true'

const App = () => {
  return (
    <Routes>
      <Route
        path="/bancas/crear"
        element={USE_NEW_CREATE_BANCA ? <CreateBancaNew /> : <CreateBanca />}
      />
    </Routes>
  )
}
```

**4.3 Probar con feature flag**

```bash
# .env.local
VITE_USE_NEW_CREATE_BANCA=true
```

```bash
npm run dev
# Ir a /bancas/crear
# Probar TODA la funcionalidad
# Crear banca completa
# Verificar que se guarda correctamente
```

**4.4 Testing A/B (1 semana de pruebas)**

```javascript
// Agregar toggle en UI para probar ambas versiones
const [useNewVersion, setUseNewVersion] = useState(false)

return (
  <>
    <button onClick={() => setUseNewVersion(!useNewVersion)}>
      {useNewVersion ? 'Usar versión vieja' : 'Usar versión nueva'}
    </button>
    {useNewVersion ? <CreateBancaNew /> : <CreateBanca />}
  </>
)
```

**Probar exhaustivamente:**
- [ ] Crear banca completa
- [ ] Validaciones funcionan
- [ ] Todos los tabs cargan
- [ ] Se guarda correctamente
- [ ] Editar banca funciona
- [ ] No hay errores en console
- [ ] Performance es igual o mejor

**4.5 Solo cuando esté 100% probado:**

```javascript
// Remover feature flag, usar solo nueva versión
<Route path="/bancas/crear" element={<CreateBancaNew />} />
```

```bash
# Eliminar versión vieja
git rm src/components/CreateBanca.jsx
```

---

## 🧪 **Testing Continuo**

### Estrategia de Testing Incremental

**Regla: Cada PR debe agregar tests**

```javascript
// Ejemplo: PR para refactorizar Button
// Debe incluir:
// 1. Componente refactorizado
// 2. Tests del componente
// 3. Actualización de al menos 1 componente que lo usa
```

**Setup de testing desde Semana 1:**

```bash
# package.json
{
  "scripts": {
    "dev": "vite",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

**Pre-commit hook para prevenir regresiones:**

```bash
# .husky/pre-commit
#!/bin/sh
npm run test:coverage
```

**Coverage incremental:**
- Semana 1: 0% → 10%
- Semana 2: 10% → 20%
- Semana 4: 20% → 40%
- Semana 8: 40% → 60%
- Semana 10: 60% → 75%

---

## 🔄 **Proceso de Merge Seguro**

### Checklist antes de cada PR

```markdown
## Checklist de PR

### Funcionalidad
- [ ] App funciona en desarrollo (`npm run dev`)
- [ ] App funciona en build (`npm run build && npm run preview`)
- [ ] No hay console.errors
- [ ] No hay console.warnings nuevos
- [ ] Funcionalidad afectada probada manualmente

### Tests
- [ ] Tests pasan (`npm test`)
- [ ] Coverage no disminuyó
- [ ] Componentes nuevos tienen tests
- [ ] Funciones nuevas tienen tests

### Code Quality
- [ ] ESLint pasa (`npm run lint`)
- [ ] No hay código comentado
- [ ] No hay TODOs sin issue
- [ ] Nombres descriptivos

### Performance
- [ ] Bundle size no aumentó significativamente
- [ ] No hay re-renders innecesarios
- [ ] Images optimizadas (si aplica)

### Seguridad
- [ ] No hay credenciales hardcodeadas
- [ ] Inputs validados
- [ ] XSS prevention verificado

### Documentación
- [ ] README actualizado (si aplica)
- [ ] Comentarios en código complejo
- [ ] PropTypes/TypeScript (si aplica)
```

---

## 🚨 **Plan de Rollback**

### Si algo sale mal

**Opción 1: Revert del merge**
```bash
# Encontrar el commit del merge
git log --oneline

# Revertir
git revert -m 1 <commit-hash>
git push origin develop
```

**Opción 2: Feature flag OFF**
```bash
# .env.local
VITE_USE_NEW_CREATE_BANCA=false
```

**Opción 3: Rollback completo**
```bash
# Volver a commit anterior
git reset --hard HEAD~1
git push -f origin develop  # Solo en emergencias
```

---

## 📅 **Plan Semanal Detallado**

### **Semana 1: Setup + Limpieza Urgente**

**Lunes - Miércoles:**
```bash
git checkout -b feature/critical-cleanup
```

- [ ] Cambiar contraseña de BD
- [ ] Mover credenciales a .env
- [ ] Eliminar jQuery
- [ ] Limpiar archivos .backup
- [ ] Setup testing (Vitest)

**Prueba:**
```bash
npm run dev
# Verificar que todo funciona igual
npm test
# Debe correr (aunque no haya tests aún)
```

**Jueves - Viernes:**
```bash
git checkout -b feature/shared-components
```

- [ ] Crear `src/shared/Button/`
- [ ] Crear `src/shared/Input/`
- [ ] Crear tests básicos
- [ ] Documentar en Storybook (opcional)

**Merge:** Fin de semana

---

### **Semana 2: Componentes Básicos**

**Objetivo:** 3-4 componentes compartidos + 20% coverage

```bash
git checkout -b feature/more-shared-components
```

- [ ] Shared Modal (BaseModal)
- [ ] Shared Select
- [ ] Shared Toggle
- [ ] Migrar PasswordModal a usar BaseModal

**Testing:**
```bash
npm run test:coverage
# Target: 20% coverage
```

**Deploy a staging:**
```bash
git checkout develop
git merge feature/more-shared-components
# Deploy a staging para pruebas
```

---

### **Semana 3: AuthContext + Security**

```bash
git checkout -b feature/auth-context
```

- [ ] Crear AuthContext
- [ ] Crear secureStorage
- [ ] Migrar Header a usar AuthContext
- [ ] Migrar Sidebar a usar AuthContext
- [ ] Agregar CSP headers

**Pruebas críticas:**
```bash
# Login/Logout debe funcionar
# Refresh page debe mantener sesión
# Token expiration debe funcionar
```

---

### **Semana 4-5: Componentes Medianos**

**Un componente a la vez:**

**Semana 4: CreateUser**
```bash
git checkout -b feature/refactor-create-user
```

- [ ] Extraer custom hooks (useUserForm)
- [ ] Separar validaciones
- [ ] Agregar tests
- [ ] Migrar a usar shared components

**Semana 5: UserList**
```bash
git checkout -b feature/refactor-user-list
```

- [ ] Extraer tabla reutilizable
- [ ] Paginación en hook
- [ ] Tests de integración

---

### **Semana 6-8: CreateBanca (God Component)**

**Semana 6:**
- Crear estructura de carpetas
- Implementar tabs separados
- Custom hooks

**Semana 7:**
- Terminar implementación
- Tests exhaustivos
- Feature flag

**Semana 8:**
- Testing A/B
- Bug fixing
- Merge cuando esté 100% probado

---

### **Semana 9: CSS Migration**

```bash
git checkout -b feature/remove-bootstrap
```

**Estrategia:**
- Migrar componente por componente
- Probar cada uno
- Eliminar Bootstrap al final

---

### **Semana 10: Polish + CI/CD**

- [ ] Setup GitHub Actions
- [ ] Pre-commit hooks
- [ ] Lighthouse audit
- [ ] Final cleanup
- [ ] Documentation

---

## 🎯 **Cómo Probar en Cada Fase**

### Testing Checklist por Componente

**Cuando migres un componente:**

1. **Prueba visual:**
```bash
npm run dev
# Navega al componente
# Interactúa con todos los elementos
# Verifica estilos
```

2. **Prueba funcional:**
```javascript
// Ejemplo: CreateUser
- [ ] Submit con datos válidos
- [ ] Submit con datos inválidos
- [ ] Validaciones en tiempo real
- [ ] Mensajes de error
- [ ] Mensajes de éxito
- [ ] Navegación después de crear
```

3. **Prueba de integración:**
```bash
# Flujo completo
- [ ] Login
- [ ] Navegar a crear usuario
- [ ] Crear usuario
- [ ] Verificar en lista
- [ ] Editar usuario
- [ ] Eliminar usuario
- [ ] Logout
```

4. **Prueba de regresión:**
```bash
# Verificar que NO rompiste nada más
- [ ] Otros componentes siguen funcionando
- [ ] Rutas funcionan
- [ ] API calls funcionan
```

---

## 📊 **Métricas de Progreso**

### Dashboard de Progreso (crear en README)

```markdown
## 🚀 Progreso de Refactorización

### Componentes Migrados: 8/36 (22%)
✅ Button
✅ Input
✅ Modal
✅ PasswordModal
✅ Header
✅ Sidebar
✅ CreateUser
✅ UserList
⏳ CreateBanca (En progreso)
⬜ BancasList
⬜ Dashboard
... (resto)

### Métricas
- **Test Coverage:** 35% (Target: 60%)
- **Bundle Size:** 750 KB (Target: <500 KB)
- **Lighthouse Score:** 75 (Target: 90+)
- **Dependencias removidas:** jQuery ✅, Bootstrap ⏳

### Semana Actual: 4/10
**Objetivo:** Refactorizar UserList y BancasList
```

---

## 🔧 **Herramientas de Ayuda**

### Scripts útiles

```javascript
// package.json
{
  "scripts": {
    // Desarrollo
    "dev": "vite",
    "dev:old": "VITE_USE_OLD_VERSION=true vite",

    // Testing
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",

    // Build
    "build": "vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",

    // Quality
    "lint": "eslint . --ext js,jsx",
    "lint:fix": "eslint . --ext js,jsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,json,css}\"",

    // Utilities
    "clean": "rm -rf node_modules dist",
    "reinstall": "npm run clean && npm install"
  }
}
```

### Git aliases útiles

```bash
# .gitconfig
[alias]
  # Ver estado bonito
  s = status -sb

  # Log bonito
  l = log --oneline --graph --decorate --all -20

  # Commit rápido
  c = commit -m

  # Push branch actual
  p = push -u origin HEAD

  # Revert último commit (sin perder cambios)
  undo = reset --soft HEAD^

  # Ver qué cambió
  changed = diff --name-only
```

---

## ✅ **Resumen Ejecutivo**

### Reglas de Oro

1. ✅ **Main siempre funciona** - nunca hacer push directo
2. ✅ **Un cambio a la vez** - PRs pequeños y frecuentes
3. ✅ **Probar antes de merge** - checklist completo
4. ✅ **Tests obligatorios** - coverage no puede bajar
5. ✅ **Feature flags** - para cambios grandes
6. ✅ **Rollback plan** - siempre tener plan B
7. ✅ **Documentar** - actualizar README con cada merge

### Workflow Diario

```bash
# Cada mañana
git checkout develop
git pull origin develop

# Trabajar en feature
git checkout -b feature/mi-mejora
# ... hacer cambios pequeños ...
git add .
git commit -m "refactor: descripción del cambio"

# Al terminar el día
git push -u origin feature/mi-mejora
# Crear PR si está listo

# Probar localmente SIEMPRE antes de PR
npm run dev
npm test
npm run build && npm run preview
```

### Señales de que vas bien

✅ App funciona igual que antes
✅ Tests pasan
✅ Coverage aumenta
✅ Bundle size igual o menor
✅ No hay warnings nuevos
✅ PRs pequeños (<500 líneas)
✅ Merges frecuentes (2-3 por semana)

### Señales de que algo va mal

❌ App no funciona
❌ Tests fallan
❌ Coverage baja
❌ Bundle size aumenta mucho
❌ Muchos warnings
❌ PRs gigantes (>1000 líneas)
❌ Branches que duran semanas

---

## 🎓 **Próximos Pasos**

1. **Lee este documento completo**
2. **Crea branch `develop` si no existe**
3. **Empieza con Semana 1: Critical Cleanup**
4. **Sigue el plan semana por semana**
5. **Documenta problemas y soluciones**

---

**Creado:** 19 de octubre de 2025
**Última actualización:** 19 de octubre de 2025
**Versión:** 1.0
