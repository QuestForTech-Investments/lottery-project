# 🚀 INICIO RÁPIDO - GESTIÓN DE SORTEOS Y PREMIOS

**Fecha preparación:** 2025-11-07
**Para implementar:** Mañana temprano
**Estimación:** 8-11 días (2 semanas)

---

## ☕ ANTES DE EMPEZAR (5 minutos)

### 1. Revisar documentación principal:
```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp/docs/

# ORDEN DE LECTURA RECOMENDADO:
1. README_DRAWS_MANAGEMENT.md           # Índice (5 min)
2. RESUMEN_EJECUTIVO_DRAWS_MANAGEMENT.md # Estrategia (10 min)
3. ANALISIS_ARQUITECTURA_DRAWS_MANAGEMENT.md # Diseño técnico (30 min)
4. CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md   # Código listo (referencia)
```

### 2. Verificar entorno:
```bash
# API corriendo
curl http://localhost:5000/health

# Frontend corriendo
curl http://localhost:3000

# Base de datos accesible
# Server: lottery-sql-1505.database.windows.net
# Database: lottery-db
```

---

## 🎯 PLAN DE ACCIÓN PARA HOY

### OPCIÓN A: BACKEND PRIMERO (Recomendado)
**Duración:** 2-3 días
**Prioridad:** Alta

#### Tareas:
1. ✅ Crear migración SQL
   - Archivo: `CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md` → Sección "1. Backend: Database Migration"
   - Copiar script completo (300+ líneas)
   - Ejecutar en Azure SQL

2. ✅ Crear controller C#
   - Ubicación: `/home/jorge/projects/Lottery-Apis/src/LotteryApi/Controllers/DrawBetTypeConfigController.cs`
   - Código completo en: `CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md` → Sección "2. Backend: C# Controller"

3. ✅ Crear DTOs
   - Ubicación: `/home/jorge/projects/Lottery-Apis/src/LotteryApi/DTOs/DrawDto.cs`
   - Código en documentación

4. ✅ Testing
   - Probar endpoints con Swagger
   - Tests unitarios básicos

### OPCIÓN B: FRONTEND PRIMERO
**Duración:** 2-3 días
**Prioridad:** Media

#### Tareas:
1. ✅ Crear servicio API
   - Ubicación: `/home/jorge/projects/Lottery-Project/LottoWebApp/src/services/drawService.js`
   - Código completo en: `CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md` → Sección "3. Frontend: Services"

2. ✅ Crear hooks personalizados
   - `useDrawsList.js`
   - `useDrawForm.js`
   - `useDrawBetTypes.js`

3. ✅ Crear componentes UI
   - DrawsList/
   - DrawModal/
   - DrawBetTypesConfig.jsx

---

## 📁 ESTRUCTURA DE ARCHIVOS A CREAR

### Backend (.NET Core 8)
```
/home/jorge/projects/Lottery-Apis/
├── SqlRunner/
│   └── migrations/
│       └── create_draw_bet_type_config.sql  ⭐ NUEVO
├── src/LotteryApi/
│   ├── Controllers/
│   │   └── DrawBetTypeConfigController.cs   ⭐ NUEVO
│   ├── DTOs/
│   │   ├── DrawBetTypeConfigDto.cs          ⭐ NUEVO
│   │   └── DrawDto.cs                       ⭐ ACTUALIZAR
│   └── Models/
│       └── DrawBetTypeConfig.cs             ⭐ NUEVO
```

### Frontend (React 18)
```
/home/jorge/projects/Lottery-Project/LottoWebApp/
├── src/
│   ├── services/
│   │   └── drawService.js                   ⭐ NUEVO (9 métodos)
│   ├── components/features/draws/           ⭐ CARPETA NUEVA
│   │   ├── DrawsList/
│   │   │   ├── index.jsx
│   │   │   ├── DrawsTable.jsx
│   │   │   ├── DrawsFilters.jsx
│   │   │   └── hooks/
│   │   │       └── useDrawsList.js
│   │   ├── DrawModal/
│   │   │   ├── index.jsx
│   │   │   └── hooks/
│   │   │       └── useDrawModal.js
│   │   └── DrawForm/
│   │       ├── DrawFormFields.jsx
│   │       ├── DrawBetTypesConfig.jsx
│   │       └── hooks/
│   │           ├── useDrawForm.js
│   │           └── useDrawBetTypes.js
│   └── tests/
│       └── draws/                           ⭐ CARPETA NUEVA
│           ├── draw-creation.spec.js
│           └── draw-bet-types-config.spec.js
```

---

## 🔥 COMANDOS RÁPIDOS

### 1. Backend: Ejecutar migración SQL
```bash
cd /home/jorge/projects/Lottery-Apis/SqlRunner

# Copiar script desde docs a SqlRunner/migrations/
cp /home/jorge/projects/Lottery-Project/LottoWebApp/docs/CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md .
# Extraer sección SQL manualmente

# Ejecutar con SqlRunner
dotnet run
```

### 2. Backend: Crear controller
```bash
cd /home/jorge/projects/Lottery-Apis/src/LotteryApi/Controllers

# Crear archivo nuevo
touch DrawBetTypeConfigController.cs

# Copiar código desde CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md
# Sección: "2. Backend: C# Controller and API Endpoints"
```

### 3. Backend: Probar endpoints
```bash
# Arrancar API
cd /home/jorge/projects/Lottery-Apis/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"

# Abrir Swagger
# http://localhost:5000/swagger
```

### 4. Frontend: Crear estructura
```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp/src

# Crear carpetas
mkdir -p components/features/draws/{DrawsList,DrawModal,DrawForm}/{hooks,}
mkdir -p services
mkdir -p tests/draws

# Crear archivos base
touch services/drawService.js
touch components/features/draws/DrawsList/index.jsx
touch components/features/draws/DrawsList/hooks/useDrawsList.js
```

### 5. Frontend: Copiar código
```bash
# Abrir archivo de código
code /home/jorge/projects/Lottery-Project/LottoWebApp/docs/CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md

# Buscar secciones:
# - "3. Frontend: Services (drawService.js)"
# - "4. Frontend: Custom Hooks"
# - "5. Frontend: Components"
```

---

## ⚠️ PUNTOS CRÍTICOS A RECORDAR

### 1. Base de Datos
- ✅ Tabla `draw_bet_type_config` debe crearse PRIMERO
- ✅ Validar foreign keys correctas
- ✅ Probar stored procedures antes de usar en controller

### 2. Backend API
- ✅ Validación: No desactivar bet_types con tickets activos
- ✅ Herencia automática de bet_types de la lotería padre
- ✅ Endpoint de copia entre sorteos

### 3. Frontend
- ✅ Usar React.memo para optimizar DrawBetTypesConfig
- ✅ useCallback para evitar re-renders innecesarios
- ✅ Manejo de errores en todos los servicios

### 4. Testing
- ✅ Probar caso: Crear sorteo → Heredar bet_types automáticamente
- ✅ Probar caso: Desactivar bet_type con tickets activos (debe fallar)
- ✅ Probar caso: Copiar config entre sorteos

---

## 📊 MÉTRICAS DE ÉXITO

### Técnicas
- [ ] Migración SQL ejecutada sin errores
- [ ] 4 endpoints nuevos funcionando (200 OK en Swagger)
- [ ] Frontend carga lista de sorteos en <2s
- [ ] Configuración de bet_types se guarda correctamente
- [ ] Tests E2E pasando (mínimo 8 tests)

### Funcionales
- [ ] Usuario puede crear nuevo sorteo en <1 minuto
- [ ] Usuario puede configurar premios en <30 segundos
- [ ] Usuario puede copiar config de otro sorteo
- [ ] Validaciones funcionan (no desactivar con tickets activos)

---

## 🆘 SI NECESITAS AYUDA

### Durante implementación:
1. **Consultar documentación:**
   ```bash
   code /home/jorge/projects/Lottery-Project/LottoWebApp/docs/ANALISIS_ARQUITECTURA_DRAWS_MANAGEMENT.md
   ```

2. **Revisar código de ejemplo:**
   ```bash
   code /home/jorge/projects/Lottery-Project/LottoWebApp/docs/CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md
   ```

3. **Pedir ayuda específica:**
   - "Muéstrame el código del hook useDrawBetTypes"
   - "Explícame la validación de tickets activos"
   - "Cómo funciona la herencia de bet_types"

### Errores comunes:
- **Error SQL:** Verificar foreign keys en migración
- **Error 404 API:** Verificar que controller esté registrado
- **Error React:** Verificar imports de Material-UI

---

## ✅ CHECKLIST INICIO RÁPIDO (Mañana)

```
[ ] 1. Café ☕
[ ] 2. Abrir README_DRAWS_MANAGEMENT.md (5 min)
[ ] 3. Abrir RESUMEN_EJECUTIVO_DRAWS_MANAGEMENT.md (10 min)
[ ] 4. Decidir: ¿Backend o Frontend primero?
[ ] 5. Crear branch: git checkout -b feature/draw-management
[ ] 6. Empezar implementación (Fase 1 o Fase 2)
```

---

## 🎯 OBJETIVO DEL DÍA 1

**Backend:** Migración + Controller básico funcionando
**Frontend:** Servicio + Hook principal creado

**Al final del día deberías tener:**
- ✅ Tabla `draw_bet_type_config` en Azure SQL
- ✅ Endpoint `GET /api/draws/{id}/bet-types` funcionando
- ✅ `drawService.js` con métodos básicos
- ✅ Commit inicial en GitHub

---

**¡Éxito mañana! 🚀**

**Preparado por:** Claude Code
**Fecha:** 2025-11-07
**Documentación completa:** 154KB (4 archivos)
