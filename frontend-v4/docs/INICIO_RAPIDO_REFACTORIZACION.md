# 🚀 Inicio Rápido - Primera Semana de Refactorización

**Objetivo:** Empezar HOY con refactorizaciones seguras y de bajo riesgo.

---

## ⚡ Día 1: Setup Inicial (2 horas)

### Paso 1: Crear branch develop

```bash
cd /mnt/h/GIT/Lottery-Project
git checkout main
git pull origin main

# Crear develop
git checkout -b develop
git push -u origin develop
```

### Paso 2: Proteger credenciales (URGENTE)

```bash
cd LottoApi

# 1. Backup del archivo actual
cp appsettings.json appsettings.json.backup

# 2. Crear ejemplo sin credenciales
cat > appsettings.example.json << 'EOF'
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;User ID=YOUR_USER;Password=YOUR_PASSWORD;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here-min-32-characters",
    "Issuer": "LotteryAPI",
    "Audience": "LotteryAPI-Users",
    "ExpiryMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
EOF

# 3. Agregar a .gitignore
echo "appsettings.json" >> .gitignore
echo "appsettings.*.json" >> .gitignore
echo "!appsettings.example.json" >> .gitignore

# 4. Commit
git add .gitignore appsettings.example.json
git commit -m "security: protect credentials in appsettings.json"
git push origin develop
```

**⚠️ IMPORTANTE:** Después de esto, cambiar la contraseña de la base de datos.

### Paso 3: Setup Testing

```bash
cd LottoWebApp

# Instalar dependencias de testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```javascript
// Crear vitest.config.js
cat > vitest.config.js << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
EOF
```

```javascript
// Crear tests/setup.js
mkdir -p tests
cat > tests/setup.js << 'EOF'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
EOF
```

```json
// Agregar scripts en package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch"
  }
}
```

```bash
# Probar que funciona
npm test
```

✅ **Commit:**
```bash
git add .
git commit -m "chore: setup vitest for testing"
git push origin develop
```

---

## ⚡ Día 2-3: Eliminar jQuery (3 horas)

### Paso 1: Crear branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/remove-jquery
```

### Paso 2: Eliminar jQuery de main.jsx

```javascript
// src/main.jsx
// ELIMINAR estas líneas:
// import $ from 'jquery'
// window.$ = window.jQuery = $
// import 'popper.js'
// import 'bootstrap/dist/js/bootstrap.bundle.min'
```

### Paso 3: Desinstalar dependencias

```bash
npm uninstall jquery popper.js bootstrap
```

### Paso 4: Probar que funciona

```bash
npm run dev
# Navegar por toda la app
# Verificar que no hay errores en consola
```

✅ **Si todo funciona:**
```bash
git add .
git commit -m "refactor: remove jQuery and Bootstrap JS"
git push -u origin feature/remove-jquery

# Crear PR en GitHub
# Merge a develop
```

---

## ⚡ Día 4-5: Primer Componente Compartido (4 horas)

### Paso 1: Crear estructura

```bash
git checkout develop
git pull origin develop
git checkout -b feature/shared-button
```

```bash
mkdir -p src/shared/Button
```

### Paso 2: Crear Button componente

```javascript
// src/shared/Button/Button.jsx
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }

  const disabledStyles = 'opacity-50 cursor-not-allowed'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${(disabled || loading) ? disabledStyles : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}

export default Button
```

```javascript
// src/shared/Button/index.js
export { default } from './Button'
```

### Paso 3: Crear test

```javascript
// src/shared/Button/Button.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await userEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })
})
```

### Paso 4: Probar

```bash
npm test
# Debe pasar todos los tests

npm run dev
# App debe seguir funcionando
```

### Paso 5: Usar en un componente existente

```javascript
// src/components/CreateUser.jsx
import Button from '@/shared/Button'

// Buscar botones y reemplazar uno:
// ANTES:
// <button className="..." onClick={handleSubmit}>Crear Usuario</button>

// DESPUÉS:
<Button variant="primary" onClick={handleSubmit}>
  Crear Usuario
</Button>
```

### Paso 6: Probar CreateUser

```bash
npm run dev
# Ir a /usuarios/crear
# Verificar que botón se ve bien
# Verificar que funciona al hacer click
```

✅ **Commit y merge:**
```bash
git add .
git commit -m "feat: add shared Button component with tests"
git push -u origin feature/shared-button

# Crear PR
# Merge a develop
```

---

## 📊 Checklist Semanal

### Semana 1 - Tareas Completadas

- [ ] ✅ Branch develop creado
- [ ] ✅ Credenciales protegidas
- [ ] ✅ Testing configurado
- [ ] ✅ jQuery eliminado
- [ ] ✅ Primer componente compartido (Button)
- [ ] 🎯 Segundo componente compartido (Input)
- [ ] 🎯 Tercer componente compartido (Modal)

### Métricas Objetivo Semana 1

- **Test Coverage:** 0% → 10%
- **Componentes compartidos:** 0 → 3
- **PRs mergeados:** 3-5
- **App funcional:** ✅ SÍ

---

## 🎯 Próxima Semana (Preview)

### Semana 2: Más Componentes + Security

**Objetivos:**
- Input component + tests
- Modal component + tests
- Select component + tests
- Agregar CSP headers
- Migrar 2-3 componentes a usar shared

**Target Coverage:** 20%

---

## 💡 Tips para el Éxito

### ✅ Haz esto

1. **PRs pequeños** (< 300 líneas)
2. **Commits frecuentes** (cada hora)
3. **Probar SIEMPRE** antes de push
4. **Un cambio a la vez**
5. **Tests primero** (opcional TDD)

### ❌ Evita esto

1. **PRs gigantes** (> 1000 líneas)
2. **Cambios directos en main**
3. **Push sin probar**
4. **Múltiples features en un PR**
5. **Código sin tests**

---

## 🆘 Si algo sale mal

### Problema: Tests no corren

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm test
```

### Problema: App no funciona después de cambio

```bash
# Ver qué cambió
git diff

# Revertir último commit (mantiene cambios)
git reset --soft HEAD~1

# O deshacer completamente
git reset --hard HEAD~1
```

### Problema: Conflictos en merge

```bash
# Actualizar tu branch con develop
git checkout feature/tu-branch
git pull origin develop

# Resolver conflictos
# Probar que funciona
git add .
git commit -m "merge: resolve conflicts with develop"
```

---

## 📞 Recursos

- **Estrategia completa:** `docs/ESTRATEGIA_REFACTORIZACION_INCREMENTAL.md`
- **Plan original:** `docs/PLAN_REFACTORIZACION_FRONTEND.md`
- **Vitest docs:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/react

---

## ✅ Resumen del Día 1

Al final del primer día deberías tener:

1. ✅ Branch `develop` creado
2. ✅ Credenciales protegidas
3. ✅ Testing configurado y funcionando
4. ✅ App corriendo sin errores

**Tiempo total:** ~2 horas
**Riesgo:** ⭐ Muy bajo
**Beneficio:** 🚀 Alto (base sólida para refactorización)

---

¡Empieza ahora! 🚀
