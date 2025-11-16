# Análisis y Arquitectura: Sistema de Gestión de Sorteos y Tipos de Premios

**Fecha:** 2025-11-06
**Autor:** React Performance Optimizer Agent
**Proyecto:** Lottery Management System B2B2C

---

## TABLA DE CONTENIDOS

1. [Estado Actual del Sistema](#1-estado-actual-del-sistema)
2. [Análisis de Código Existente](#2-análisis-de-código-existente)
3. [Propuesta de Arquitectura](#3-propuesta-de-arquitectura)
4. [Estructura de Archivos y Componentes](#4-estructura-de-archivos-y-componentes)
5. [API Endpoints Necesarios](#5-api-endpoints-necesarios)
6. [Diseño de Componentes React](#6-diseño-de-componentes-react)
7. [Gestión de Estado y Hooks](#7-gestión-de-estado-y-hooks)
8. [Flujo de Usuario (UX)](#8-flujo-de-usuario-ux)
9. [Consideraciones Especiales](#9-consideraciones-especiales)
10. [Plan de Implementación](#10-plan-de-implementación)

---

## 1. ESTADO ACTUAL DEL SISTEMA

### 1.1 Entidades de Base de Datos Existentes

```sql
-- Tabla principal de loterías
lotteries (69 registros)
├── lottery_id (PK)
├── lottery_name
├── country_id
└── is_active

-- Tabla de sorteos/draws
draws (116 registros)
├── draw_id (PK)
├── lottery_id (FK → lotteries)
├── draw_name
├── draw_time (TimeSpan)
├── abbreviation
├── display_color
└── is_active

-- Tabla de tipos de apuesta (premio system)
bet_types (33 registros)
├── bet_type_id (PK)
├── bet_type_code (ej: DIRECTO, PALE, TRIPLETA)
├── bet_type_name
└── is_active

-- Tabla N:M entre lotteries y bet_types (RECIÉN IMPLEMENTADA)
lottery_bet_type_compatibility (275 registros)
├── compatibility_id (PK)
├── lottery_id (FK → lotteries)
├── bet_type_id (FK → bet_types)
├── is_active
├── created_at
└── updated_at

-- Tabla N:M entre betting_pools y draws
betting_pool_draws
├── betting_pool_draw_id (PK)
├── betting_pool_id (FK)
├── draw_id (FK)
└── is_active
```

### 1.2 Sistema Actual de Premios Implementado

**Frontend:**
- **Archivo:** `/src/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab.jsx`
- **Funcionalidad actual:**
  - Carga dinámica de tipos de apuesta por lotería
  - Sistema de 3 niveles de tabs (Premios/Comisiones/Comisiones2 → Loterías → Campos)
  - Copia automática de valores "General" a loterías específicas
  - Manejo de 70+ loterías con scroll horizontal

**Backend:**
- **Endpoint:** `GET /api/lotteries/{id}/bet-types`
- **Controlador:** `LotteriesController.cs`
- **Servicio:** `lotteryService.js` (frontend)
- **Hook:** `useCompleteBettingPoolForm.js`

### 1.3 Sistema Actual de Sorteos

**Tab existente:** `SorteosTab.jsx`
- **Problema:** Lista hardcoded de loterías (no usa API)
- **Funcionalidad:** Solo selección de loterías predefinidas
- **NO permite:** Crear/editar/desactivar sorteos

**Backend:**
- **Modelo:** `Draw.cs` con todas las propiedades
- **Controlador:** `DrawsController.cs` con CRUD completo
- **Endpoints disponibles:**
  - `GET /api/draws` - Con paginación
  - `GET /api/draws/{id}` - Obtener un sorteo
  - `GET /api/draws/lottery/{lotteryId}` - Sorteos por lotería
  - `POST /api/draws` - Crear sorteo
  - `PUT /api/draws/{id}` - Actualizar sorteo
  - `DELETE /api/draws/{id}` - Eliminar sorteo

---

## 2. ANÁLISIS DE CÓDIGO EXISTENTE

### 2.1 Patrones de Diseño Identificados

#### 2.1.1 Estructura de Tabs
```
CreateBettingPool/
├── index.jsx (Componente principal con 8 tabs)
├── tabs/
│   ├── GeneralTab.jsx
│   ├── ConfigurationTab.jsx
│   ├── PrizesTab.jsx ✅ (Referencia para arquitectura)
│   ├── SorteosTab.jsx ⚠️ (Necesita refactorización)
│   ├── SchedulesTab.jsx
│   ├── FootersTab.jsx
│   ├── StylesTab.jsx
│   └── AutoExpensesTab.jsx
└── hooks/
    ├── useCompleteBettingPoolForm.js ✅ (Centraliza estado)
    └── useCreateBettingPoolForm.js
```

#### 2.1.2 Patrón de Hooks Personalizados
```javascript
// Hook centralizado para todo el formulario
useCompleteBettingPoolForm.js
├── Estado: formData (168 campos)
├── UI: loading, errors, success, activeTab
├── Data: zones, lotteries (cargadas de API)
├── Handlers: handleChange, handleSubmit
└── Utils: copyScheduleToAll, validateForm

// Patrón observado para nuevas funcionalidades:
useDrawManagement.js (A CREAR)
├── Estado: draws, selectedDraw, filters
├── UI: loading, errors, modalOpen
├── Data: lotteries (de API)
├── Handlers: handleCreate, handleUpdate, handleDelete
└── Utils: validateDraw, filterDraws
```

#### 2.1.3 Patrón de Servicios API
```javascript
// lotteryService.js - Patrón existente
export const getBetTypesByLottery = async (lotteryId) => {
  const response = await api.get(`/lotteries/${lotteryId}/bet-types`);
  return {
    success: true,
    data: response
  };
}

// Patrón a seguir para draws:
drawService.js (A CREAR)
├── getAllDraws(params)
├── getDrawById(id)
├── getDrawsByLottery(lotteryId)
├── createDraw(drawData)
├── updateDraw(id, drawData)
└── deleteDraw(id)
```

### 2.2 Componentes Reutilizables Existentes

```javascript
// Material-UI Components utilizados consistentemente:
- Accordion/AccordionSummary/AccordionDetails (PrizesTab)
- Tabs/Tab (navegación multinivel)
- TextField (formularios)
- Button/IconButton (acciones)
- Alert/CircularProgress (feedback)
- Paper/Box/Grid (layout)
- Chip (etiquetas, filtros)
- Modal (diálogos - patrón común en MUI)

// Componentes custom existentes:
- ErrorBoundary (/src/components/common/ErrorBoundary.jsx)
- LazyLoadingFallback (para Suspense)
- Pagination (/src/components/shared/Pagination.jsx)
```

### 2.3 Patrón de Manejo de Estado

```javascript
// De useCompleteBettingPoolForm.js:

// 1. Estado inicial centralizado
const getInitialFormData = (defaultValue) => ({
  field1: '',
  field2: '',
  // ... 168 campos
});

// 2. Validación antes de submit
const validateForm = () => {
  const newErrors = {};
  if (!formData.required) {
    newErrors.required = 'Campo requerido';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// 3. Handler unificado
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: null }));
  }
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// 4. Reset después de submit exitoso
const resetFormToDefaults = (newCode) => {
  setFormData(getInitialFormData(newCode));
  setErrors({});
  setActiveTab(0);
};
```

### 2.4 Optimizaciones de Performance Existentes

```javascript
// PrizesTab.jsx usa React.memo con comparación personalizada:
const arePropsEqual = (prevProps, nextProps) => {
  // Solo compara campos relevantes para evitar re-renders innecesarios
  if (prevProps.handleChange !== nextProps.handleChange) return false;
  if (prevProps.bettingPoolId !== nextProps.bettingPoolId) return false;

  // Deep comparison solo de campos con prefijo de lotería
  const prevKeys = Object.keys(prevProps.formData || {}).filter(key => key.includes('_'));
  const nextKeys = Object.keys(nextProps.formData || {}).filter(key => key.includes('_'));

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of nextKeys) {
    if (prevProps.formData[key] !== nextProps.formData[key]) return false;
  }

  return true; // No cambios relevantes, skip re-render
};

export default React.memo(PrizesTab, arePropsEqual);
```

---

## 3. PROPUESTA DE ARQUITECTURA

### 3.1 Visión General de las Dos Funcionalidades

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOTTERY MANAGEMENT SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FUNCIONALIDAD 1: GESTIÓN DE SORTEOS (DRAWS)                      │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │ • Crear nuevos sorteos por lotería                        │    │
│  │ • Editar sorteos existentes                               │    │
│  │ • Activar/desactivar sorteos                              │    │
│  │ • Vista de lista con filtros                              │    │
│  │ • Validación de horarios duplicados                       │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓                                        │
│  FUNCIONALIDAD 2: CONFIGURACIÓN DE PREMIOS POR SORTEO             │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │ • Seleccionar bet_types disponibles para cada sorteo      │    │
│  │ • Herencia desde lottery_bet_type_compatibility           │    │
│  │ • Copiar configuración entre sorteos                      │    │
│  │ • Activar/desactivar tipos individuales                   │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Relación entre Entidades

```
┌─────────────┐
│  lotteries  │ (69 registros)
└──────┬──────┘
       │ 1:N
       ├────────────────────────────────┐
       │                                │
       ↓                                ↓
┌─────────────┐              ┌──────────────────────────────┐
│    draws    │ (116)        │ lottery_bet_type_compatibility│ (275)
└──────┬──────┘              └────────────┬─────────────────┘
       │                                  │
       │ 1:N                         N:M  │
       │                                  │
       ↓                                  ↓
┌──────────────────────┐         ┌────────────────┐
│ draw_bet_type_config │ (NUEVO) │   bet_types    │ (33)
│                      │         └────────────────┘
│ • draw_id            │
│ • bet_type_id        │
│ • is_active          │
│ • custom_settings    │
└──────────────────────┘

FLUJO LÓGICO:
1. Lotería define bet_types compatibles → lottery_bet_type_compatibility
2. Sorteo hereda bet_types de su lotería
3. Usuario puede activar/desactivar bet_types específicos por sorteo
4. draw_bet_type_config guarda configuración específica del sorteo
```

### 3.3 Arquitectura de Componentes Propuesta

```
src/components/features/
└── draws/                           (NUEVO: feature completo)
    ├── DrawsList/                   (Vista principal de sorteos)
    │   ├── index.jsx
    │   ├── DrawsTable.jsx           (Tabla con filtros)
    │   ├── DrawsFilters.jsx         (Filtros de búsqueda)
    │   └── hooks/
    │       └── useDrawsList.js      (Lógica de lista)
    │
    ├── DrawForm/                    (Formulario crear/editar)
    │   ├── index.jsx                (Componente principal)
    │   ├── DrawFormFields.jsx       (Campos del formulario)
    │   ├── DrawBetTypesConfig.jsx   (Config de tipos de premio)
    │   └── hooks/
    │       ├── useDrawForm.js       (Lógica del formulario)
    │       └── useDrawBetTypes.js   (Gestión de bet_types)
    │
    └── DrawModal/                   (Modal reutilizable)
        ├── index.jsx
        └── hooks/
            └── useDrawModal.js

COMPONENTES COMUNES REUTILIZABLES:
src/components/common/
├── BetTypeSelector.jsx              (Selector de tipos de premio)
├── LotterySelector.jsx              (Selector de loterías)
└── TimeRangePicker.jsx              (Selector de horarios)
```

---

## 4. ESTRUCTURA DE ARCHIVOS Y COMPONENTES

### 4.1 Servicio API para Draws

**Archivo:** `/src/services/drawService.js`

```javascript
/**
 * Draw Service
 * Gestión de sorteos (draws) del sistema
 */

import api from './api';

/**
 * Obtener todos los sorteos con paginación y filtros
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.pageNumber - Número de página
 * @param {number} params.pageSize - Tamaño de página
 * @param {number} params.lotteryId - Filtrar por lotería
 * @param {boolean} params.isActive - Filtrar por estado
 * @returns {Promise<Object>} - Sorteos paginados
 */
export const getAllDraws = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);
  if (params.lotteryId) queryParams.append('lotteryId', params.lotteryId);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const query = queryParams.toString();
  const response = await api.get(`/draws${query ? `?${query}` : ''}`);

  return {
    success: true,
    data: response
  };
};

/**
 * Obtener sorteo por ID
 * @param {number} id - ID del sorteo
 * @returns {Promise<Object>}
 */
export const getDrawById = async (id) => {
  const response = await api.get(`/draws/${id}`);
  return {
    success: true,
    data: response
  };
};

/**
 * Obtener sorteos de una lotería
 * @param {number} lotteryId - ID de la lotería
 * @returns {Promise<Object>}
 */
export const getDrawsByLottery = async (lotteryId) => {
  const response = await api.get(`/draws/lottery/${lotteryId}`);
  return {
    success: true,
    data: response
  };
};

/**
 * Crear un nuevo sorteo
 * @param {Object} drawData - Datos del sorteo
 * @returns {Promise<Object>}
 */
export const createDraw = async (drawData) => {
  const response = await api.post('/draws', drawData);
  return {
    success: true,
    data: response
  };
};

/**
 * Actualizar un sorteo existente
 * @param {number} id - ID del sorteo
 * @param {Object} drawData - Datos actualizados
 * @returns {Promise<Object>}
 */
export const updateDraw = async (id, drawData) => {
  const response = await api.put(`/draws/${id}`, drawData);
  return {
    success: true,
    data: response
  };
};

/**
 * Eliminar un sorteo
 * @param {number} id - ID del sorteo
 * @returns {Promise<Object>}
 */
export const deleteDraw = async (id) => {
  await api.delete(`/draws/${id}`);
  return {
    success: true
  };
};

/**
 * Obtener tipos de apuesta configurados para un sorteo
 * @param {number} drawId - ID del sorteo
 * @returns {Promise<Object>}
 */
export const getDrawBetTypes = async (drawId) => {
  const response = await api.get(`/draws/${drawId}/bet-types`);
  return {
    success: true,
    data: response
  };
};

/**
 * Actualizar tipos de apuesta de un sorteo
 * @param {number} drawId - ID del sorteo
 * @param {Array<number>} betTypeIds - IDs de bet_types a activar
 * @returns {Promise<Object>}
 */
export const updateDrawBetTypes = async (drawId, betTypeIds) => {
  const response = await api.put(`/draws/${drawId}/bet-types`, { betTypeIds });
  return {
    success: true,
    data: response
  };
};

/**
 * Copiar configuración de premios de un sorteo a otro
 * @param {number} sourceDrawId - ID del sorteo origen
 * @param {number} targetDrawId - ID del sorteo destino
 * @returns {Promise<Object>}
 */
export const copyDrawBetTypesConfig = async (sourceDrawId, targetDrawId) => {
  const response = await api.post(`/draws/${targetDrawId}/copy-bet-types`, {
    sourceDrawId
  });
  return {
    success: true,
    data: response
  };
};
```

### 4.2 Hook Principal para Gestión de Sorteos

**Archivo:** `/src/components/features/draws/DrawsList/hooks/useDrawsList.js`

```javascript
import { useState, useEffect, useCallback } from 'react';
import { getAllDraws, deleteDraw } from '@/services/drawService';
import { getAllLotteries } from '@/services/lotteryService';

/**
 * Hook personalizado para gestionar la lista de sorteos
 * Incluye: paginación, filtros, búsqueda, CRUD operations
 */
const useDrawsList = () => {
  // Estado para los datos
  const [draws, setDraws] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  // Estado para filtros
  const [filters, setFilters] = useState({
    search: '',
    lotteryId: '',
    isActive: true
  });

  // Estado UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'

  /**
   * Cargar sorteos desde la API
   */
  const loadDraws = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        ...filters
      };

      const response = await getAllDraws(params);

      if (response.success && response.data) {
        setDraws(response.data.items || []);
        setPagination({
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages
        });
      }
    } catch (err) {
      console.error('Error loading draws:', err);
      setError(err.message || 'Error al cargar sorteos');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, filters]);

  /**
   * Cargar loterías para filtros y formularios
   */
  const loadLotteries = useCallback(async () => {
    try {
      const response = await getAllLotteries({ loadAll: true, isActive: true });
      if (response.success && response.data) {
        setLotteries(response.data);
      }
    } catch (err) {
      console.error('Error loading lotteries:', err);
    }
  }, []);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadDraws();
    loadLotteries();
  }, [loadDraws, loadLotteries]);

  /**
   * Manejar cambio de filtros
   */
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageNumber: 1 })); // Reset a primera página
  };

  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  /**
   * Abrir modal para crear sorteo
   */
  const handleCreate = () => {
    setSelectedDraw(null);
    setModalMode('create');
    setModalOpen(true);
  };

  /**
   * Abrir modal para editar sorteo
   */
  const handleEdit = (draw) => {
    setSelectedDraw(draw);
    setModalMode('edit');
    setModalOpen(true);
  };

  /**
   * Abrir modal para ver detalles
   */
  const handleView = (draw) => {
    setSelectedDraw(draw);
    setModalMode('view');
    setModalOpen(true);
  };

  /**
   * Eliminar sorteo
   */
  const handleDelete = async (drawId) => {
    if (!window.confirm('¿Está seguro de eliminar este sorteo?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDraw(drawId);
      await loadDraws(); // Recargar lista
    } catch (err) {
      console.error('Error deleting draw:', err);
      setError('Error al eliminar sorteo');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar modal y recargar si hubo cambios
   */
  const handleCloseModal = async (shouldReload = false) => {
    setModalOpen(false);
    setSelectedDraw(null);

    if (shouldReload) {
      await loadDraws();
    }
  };

  return {
    // Data
    draws,
    lotteries,
    pagination,
    filters,

    // UI State
    loading,
    error,
    selectedDraw,
    modalOpen,
    modalMode,

    // Handlers
    handleFilterChange,
    handlePageChange,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseModal,
    loadDraws
  };
};

export default useDrawsList;
```

### 4.3 Hook para Formulario de Sorteo

**Archivo:** `/src/components/features/draws/DrawForm/hooks/useDrawForm.js`

```javascript
import { useState, useEffect } from 'react';
import { createDraw, updateDraw, getDrawById } from '@/services/drawService';
import { getAllLotteries } from '@/services/lotteryService';

/**
 * Hook para gestionar el formulario de creación/edición de sorteos
 */
const useDrawForm = (drawId = null, onSuccess = null) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    lotteryId: '',
    drawName: '',
    drawTime: '12:00',
    description: '',
    abbreviation: '',
    displayColor: '#000000',
    isActive: true
  });

  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Cargar sorteo existente si estamos en modo edición
   */
  useEffect(() => {
    if (drawId) {
      loadDraw(drawId);
    }
  }, [drawId]);

  /**
   * Cargar loterías disponibles
   */
  useEffect(() => {
    loadLotteries();
  }, []);

  const loadDraw = async (id) => {
    try {
      setLoadingData(true);
      const response = await getDrawById(id);

      if (response.success && response.data) {
        setFormData({
          lotteryId: response.data.lotteryId,
          drawName: response.data.drawName,
          drawTime: response.data.drawTime,
          description: response.data.description || '',
          abbreviation: response.data.abbreviation || '',
          displayColor: response.data.displayColor || '#000000',
          isActive: response.data.isActive
        });
      }
    } catch (err) {
      console.error('Error loading draw:', err);
      setErrors({ submit: 'Error al cargar sorteo' });
    } finally {
      setLoadingData(false);
    }
  };

  const loadLotteries = async () => {
    try {
      const response = await getAllLotteries({ loadAll: true, isActive: true });
      if (response.success && response.data) {
        setLotteries(response.data);
      }
    } catch (err) {
      console.error('Error loading lotteries:', err);
    }
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.lotteryId) {
      newErrors.lotteryId = 'Debe seleccionar una lotería';
    }

    if (!formData.drawName.trim()) {
      newErrors.drawName = 'El nombre del sorteo es requerido';
    }

    if (!formData.drawTime) {
      newErrors.drawTime = 'La hora del sorteo es requerida';
    }

    // Validar formato de hora (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (formData.drawTime && !timeRegex.test(formData.drawTime)) {
      newErrors.drawTime = 'Formato de hora inválido (use HH:mm)';
    }

    if (formData.abbreviation && formData.abbreviation.length > 10) {
      newErrors.abbreviation = 'La abreviación no puede exceder 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Preparar datos para la API
      const drawData = {
        lotteryId: parseInt(formData.lotteryId),
        drawName: formData.drawName,
        drawTime: formData.drawTime,
        description: formData.description || null,
        abbreviation: formData.abbreviation || null,
        displayColor: formData.displayColor || '#000000',
        isActive: formData.isActive
      };

      let response;
      if (drawId) {
        // Actualizar sorteo existente
        response = await updateDraw(drawId, drawData);
      } else {
        // Crear nuevo sorteo
        response = await createDraw(drawData);
      }

      if (response.success) {
        // Llamar callback de éxito
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (err) {
      console.error('Error submitting draw:', err);
      setErrors({
        submit: err.message || `Error al ${drawId ? 'actualizar' : 'crear'} sorteo`
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    lotteries,
    loading,
    loadingData,
    errors,
    handleChange,
    handleSubmit
  };
};

export default useDrawForm;
```

---

## 5. API ENDPOINTS NECESARIOS

### 5.1 Endpoints Existentes en Backend (✅ Ya implementados)

```csharp
// DrawsController.cs

✅ GET    /api/draws                          // Obtener todos con paginación
✅ GET    /api/draws/{id}                     // Obtener por ID
✅ GET    /api/draws/lottery/{lotteryId}      // Obtener por lotería
✅ POST   /api/draws                          // Crear nuevo
✅ PUT    /api/draws/{id}                     // Actualizar
✅ DELETE /api/draws/{id}                     // Eliminar
```

### 5.2 Endpoints NUEVOS Necesarios (⚠️ Falta implementar en backend)

**Gestión de Tipos de Premio por Sorteo:**

```csharp
// Controlador: DrawBetTypeConfigController.cs (NUEVO)

⚠️ GET    /api/draws/{drawId}/bet-types
// Obtener tipos de apuesta configurados para un sorteo
// Response: Array de bet_types con configuración

⚠️ PUT    /api/draws/{drawId}/bet-types
// Actualizar tipos de apuesta activos para un sorteo
// Request: { betTypeIds: [1, 2, 3] }

⚠️ POST   /api/draws/{drawId}/bet-types/copy
// Copiar configuración de tipos de premio de otro sorteo
// Request: { sourceDrawId: 5 }

⚠️ GET    /api/draws/{drawId}/available-bet-types
// Obtener tipos de apuesta disponibles (heredados de la lotería)
// Basado en lottery_bet_type_compatibility
```

**Tabla necesaria en Base de Datos:**

```sql
-- NUEVA TABLA: draw_bet_type_config
CREATE TABLE draw_bet_type_config (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    draw_id INT NOT NULL,
    bet_type_id INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    custom_multiplier DECIMAL(10,2) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_draw_bet_type_config_draw
        FOREIGN KEY (draw_id) REFERENCES draws(draw_id) ON DELETE CASCADE,

    CONSTRAINT FK_draw_bet_type_config_bet_type
        FOREIGN KEY (bet_type_id) REFERENCES bet_types(bet_type_id) ON DELETE CASCADE,

    CONSTRAINT UQ_draw_bet_type
        UNIQUE (draw_id, bet_type_id)
);

CREATE INDEX IX_draw_bet_type_config_draw
    ON draw_bet_type_config(draw_id, is_active);

CREATE INDEX IX_draw_bet_type_config_bet_type
    ON draw_bet_type_config(bet_type_id, is_active);
```

---

## 6. DISEÑO DE COMPONENTES REACT

### 6.1 Componente Principal: DrawsList

**Archivo:** `/src/components/features/draws/DrawsList/index.jsx`

```javascript
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import useDrawsList from './hooks/useDrawsList';
import DrawsTable from './DrawsTable';
import DrawsFilters from './DrawsFilters';
import DrawModal from '../DrawModal';
import Pagination from '@/components/shared/Pagination';

/**
 * DrawsList - Vista principal de gestión de sorteos
 */
const DrawsList = () => {
  const {
    draws,
    lotteries,
    pagination,
    filters,
    loading,
    error,
    selectedDraw,
    modalOpen,
    modalMode,
    handleFilterChange,
    handlePageChange,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleCloseModal,
    loadDraws
  } = useDrawsList();

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              Gestión de Sorteos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={loading}
            >
              Nuevo Sorteo
            </Button>
          </Box>
        </Box>

        {/* Filtros */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <DrawsFilters
            filters={filters}
            lotteries={lotteries}
            onFilterChange={handleFilterChange}
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => {}}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tabla de Sorteos */}
            <DrawsTable
              draws={draws}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />

            {/* Paginación */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Pagination
                currentPage={pagination.pageNumber}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalCount}
                onPageChange={handlePageChange}
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Modal de Crear/Editar */}
      {modalOpen && (
        <DrawModal
          open={modalOpen}
          mode={modalMode}
          draw={selectedDraw}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};

export default DrawsList;
```

### 6.2 Componente: DrawsTable

**Archivo:** `/src/components/features/draws/DrawsList/DrawsTable.jsx`

```javascript
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

/**
 * DrawsTable - Tabla de sorteos con acciones
 */
const DrawsTable = ({ draws, onEdit, onView, onDelete }) => {
  /**
   * Formatear hora (TimeSpan a HH:mm)
   */
  const formatTime = (timeSpan) => {
    if (!timeSpan) return '--:--';

    // Si viene como string "HH:mm:ss" o TimeSpan
    const parts = timeSpan.toString().split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }

    return timeSpan;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Lotería</TableCell>
            <TableCell>Hora</TableCell>
            <TableCell>Abreviación</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {draws.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No se encontraron sorteos
              </TableCell>
            </TableRow>
          ) : (
            draws.map((draw) => (
              <TableRow key={draw.drawId} hover>
                <TableCell>{draw.drawId}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {draw.displayColor && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: draw.displayColor,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      />
                    )}
                    {draw.drawName}
                  </Box>
                </TableCell>
                <TableCell>{draw.lotteryName || '--'}</TableCell>
                <TableCell>{formatTime(draw.drawTime)}</TableCell>
                <TableCell>{draw.abbreviation || '--'}</TableCell>
                <TableCell>
                  <Chip
                    label={draw.isActive ? 'Activo' : 'Inactivo'}
                    color={draw.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      onClick={() => onView(draw)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(draw)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(draw.drawId)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DrawsTable;
```

### 6.3 Componente: DrawModal

**Archivo:** `/src/components/features/draws/DrawModal/index.jsx`

```javascript
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Grid
} from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import useDrawForm from '../DrawForm/hooks/useDrawForm';

/**
 * DrawModal - Modal para crear/editar sorteos
 */
const DrawModal = ({ open, mode, draw, onClose }) => {
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const drawId = draw?.drawId || null;

  const {
    formData,
    lotteries,
    loading,
    loadingData,
    errors,
    handleChange,
    handleSubmit
  } = useDrawForm(drawId, (createdDraw) => {
    // Callback de éxito
    onClose(true); // true = reload list
  });

  const handleFormSubmit = async (e) => {
    await handleSubmit(e);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>
          {isViewMode ? 'Ver Sorteo' : isEditMode ? 'Editar Sorteo' : 'Crear Nuevo Sorteo'}
        </DialogTitle>

        <DialogContent>
          {loadingData ? (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {/* Error Alert */}
              {errors.submit && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.submit}
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Selección de Lotería */}
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.lotteryId}>
                    <InputLabel>Lotería *</InputLabel>
                    <Select
                      name="lotteryId"
                      value={formData.lotteryId}
                      onChange={handleChange}
                      label="Lotería *"
                      disabled={isViewMode}
                    >
                      <MenuItem value="">
                        <em>Seleccione una lotería</em>
                      </MenuItem>
                      {lotteries.map((lottery) => (
                        <MenuItem key={lottery.lotteryId} value={lottery.lotteryId}>
                          {lottery.lotteryName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.lotteryId && (
                      <FormHelperText error>{errors.lotteryId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Nombre del Sorteo */}
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    required
                    label="Nombre del Sorteo"
                    name="drawName"
                    value={formData.drawName}
                    onChange={handleChange}
                    error={!!errors.drawName}
                    helperText={errors.drawName}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* Hora del Sorteo */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    type="time"
                    label="Hora del Sorteo"
                    name="drawTime"
                    value={formData.drawTime}
                    onChange={handleChange}
                    error={!!errors.drawTime}
                    helperText={errors.drawTime || 'Formato: HH:mm'}
                    disabled={isViewMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Abreviación */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Abreviación"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleChange}
                    error={!!errors.abbreviation}
                    helperText={errors.abbreviation || 'Máx. 10 caracteres'}
                    disabled={isViewMode}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>

                {/* Color de Display */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label="Color de Visualización"
                    name="displayColor"
                    value={formData.displayColor}
                    onChange={handleChange}
                    disabled={isViewMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Descripción */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Descripción"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* Estado Activo */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleChange}
                        name="isActive"
                        disabled={isViewMode}
                      />
                    }
                    label="Sorteo Activo"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => onClose(false)}
            startIcon={<CloseIcon />}
          >
            {isViewMode ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!isViewMode && (
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading || loadingData}
            >
              {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Sorteo'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DrawModal;
```

---

## 7. GESTIÓN DE ESTADO Y HOOKS

### 7.1 Patrón de Estado Centralizado

**Para la funcionalidad de sorteos, utilizaremos hooks locales en lugar de Context API** porque:

1. **Scope limitado:** Solo se usa en 2-3 componentes
2. **No hay estado compartido global:** Cada vista maneja su propio estado
3. **Performance:** Evita re-renders innecesarios
4. **Simplicidad:** Más fácil de mantener

```javascript
// Estructura de estado en useDrawsList:
{
  // Data
  draws: [],
  lotteries: [],
  pagination: { pageNumber, pageSize, totalCount, totalPages },
  filters: { search, lotteryId, isActive },

  // UI
  loading: false,
  error: null,
  selectedDraw: null,
  modalOpen: false,
  modalMode: 'create'
}

// Estructura de estado en useDrawForm:
{
  formData: {
    lotteryId: '',
    drawName: '',
    drawTime: '',
    description: '',
    abbreviation: '',
    displayColor: '#000000',
    isActive: true
  },
  lotteries: [],
  loading: false,
  loadingData: false,
  errors: {}
}
```

### 7.2 Optimización de Re-renders

```javascript
// Usar React.memo en componentes que reciben muchos props
const DrawsTable = React.memo(({ draws, onEdit, onView, onDelete }) => {
  // ...
}, (prevProps, nextProps) => {
  // Solo re-renderizar si draws cambia
  return prevProps.draws === nextProps.draws;
});

// Usar useCallback para funciones que se pasan como props
const handleEdit = useCallback((draw) => {
  setSelectedDraw(draw);
  setModalMode('edit');
  setModalOpen(true);
}, []);

// Usar useMemo para cálculos costosos
const filteredDraws = useMemo(() => {
  return draws.filter(draw =>
    draw.drawName.toLowerCase().includes(filters.search.toLowerCase())
  );
}, [draws, filters.search]);
```

---

## 8. FLUJO DE USUARIO (UX)

### 8.1 User Journey: Crear Nuevo Sorteo

```
1. Usuario navega a "Gestión de Sorteos"
   └─> Visualiza lista de sorteos existentes

2. Hace clic en "Nuevo Sorteo"
   └─> Se abre modal con formulario

3. Completa campos del formulario:
   ├─> Selecciona lotería (obligatorio)
   ├─> Ingresa nombre del sorteo (obligatorio)
   ├─> Selecciona hora (obligatorio)
   ├─> Abreviación (opcional)
   ├─> Color (opcional)
   ├─> Descripción (opcional)
   └─> Estado activo (default: true)

4. Valida horarios duplicados:
   ├─> Si ya existe otro sorteo a la misma hora en la misma lotería
   └─> Muestra warning (no bloqueante)

5. Hace clic en "Crear Sorteo"
   ├─> Backend valida datos
   ├─> Crea registro en tabla `draws`
   └─> Hereda bet_types de la lotería automáticamente

6. Modal se cierra
   └─> Lista se actualiza mostrando el nuevo sorteo

7. OPCIONAL: Usuario puede configurar tipos de premio
   └─> Ir a "Configurar Premios" (Funcionalidad 2)
```

### 8.2 User Journey: Configurar Tipos de Premio por Sorteo

```
1. Usuario selecciona un sorteo de la lista
   └─> Hace clic en "Configurar Premios" o ícono de edición

2. Se abre modal/vista con dos secciones:

   A) SECCIÓN 1: Tipos de Premio Disponibles
      ├─> Muestra todos los bet_types heredados de la lotería
      ├─> Cada tipo tiene checkbox para activar/desactivar
      └─> Por defecto: todos activos

   B) SECCIÓN 2: Copiar Configuración
      ├─> Dropdown para seleccionar sorteo origen
      ├─> Botón "Copiar Configuración"
      └─> Copia todos los bet_types activos del sorteo origen

3. Usuario activa/desactiva tipos individuales
   └─> Cambios se guardan en `draw_bet_type_config`

4. O usuario copia config de otro sorteo
   ├─> Selecciona sorteo de la misma lotería
   ├─> Sistema valida compatibilidad
   └─> Copia configuración completa

5. Hace clic en "Guardar Configuración"
   ├─> Backend valida que al menos 1 bet_type esté activo
   ├─> Guarda en `draw_bet_type_config`
   └─> Muestra confirmación

6. Usuario puede ver resumen:
   └─> "5 de 8 tipos de premio activos para este sorteo"
```

### 8.3 Wireframe Conceptual

```
┌───────────────────────────────────────────────────────────────┐
│ Gestión de Sorteos                          [+ Nuevo Sorteo] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Filtros:                                                      │
│ [Buscar...] [Lotería: Todas ▼] [Estado: Activo ▼] [Buscar]  │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ ID │ Nombre      │ Lotería      │ Hora  │ Abr. │ Estado │   │
├────┼─────────────┼──────────────┼───────┼──────┼────────┼───┤
│ 1  │ LA PRIMERA  │ DOM. AM      │ 12:00 │ LP   │ ●Activo│⚙ │
│ 2  │ FLORIDA AM  │ FLORIDA      │ 13:30 │ FL   │ ●Activo│⚙ │
│ 3  │ NY DAY      │ NEW YORK     │ 14:00 │ NYD  │ ○Inact.│⚙ │
└────┴─────────────┴──────────────┴───────┴──────┴────────┴───┘
                                    Página 1 de 6 (116 sorteos)
```

**Modal de Crear/Editar:**

```
┌───────────────────────────────────────────────────────────────┐
│ Crear Nuevo Sorteo                                     [✕]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Lotería *                                                     │
│ [Seleccione una lotería          ▼]                          │
│                                                               │
│ Nombre del Sorteo *              Hora *                      │
│ [LA PRIMERA 12:00 PM        ]    [12:00]                     │
│                                                               │
│ Abreviación                      Color                       │
│ [LP                         ]    [🎨 #FF0000]                │
│                                                               │
│ Descripción                                                   │
│ [Sorteo de mediodía          ]                               │
│ [                             ]                               │
│                                                               │
│ [✓] Sorteo Activo                                            │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                               [Cancelar] [Crear Sorteo ✓]    │
└───────────────────────────────────────────────────────────────┘
```

---

## 9. CONSIDERACIONES ESPECIALES

### 9.1 Validación de Horarios Duplicados

**Escenario:** Usuario intenta crear sorteo a las 12:00 PM, pero ya existe otro sorteo de la misma lotería a esa hora.

**Solución implementada:**

```javascript
// En useDrawForm.js - validateForm()
const validateForm = () => {
  const newErrors = {};

  // ... otras validaciones

  // Validar horarios duplicados (solo warning, no bloqueante)
  if (formData.drawTime && formData.lotteryId) {
    const existingDraw = await checkDuplicateDrawTime(
      formData.lotteryId,
      formData.drawTime,
      drawId // null si es creación, ID si es edición
    );

    if (existingDraw) {
      newErrors.drawTime = `⚠️ Ya existe el sorteo "${existingDraw.drawName}" a esta hora para esta lotería`;
      // NO bloquea submit, solo advierte
    }
  }

  setErrors(newErrors);
  return true; // Permitir submit con warning
};
```

### 9.2 Herencia de Bet Types

**Flujo automático al crear un sorteo:**

```
1. Usuario crea sorteo para lotería "LA PRIMERA"
   └─> lottery_id = 43

2. Backend consulta lottery_bet_type_compatibility
   └─> Encuentra: DIRECTO, PALE, SUPER_PALE, TRIPLETA

3. Backend crea registros en draw_bet_type_config:
   ├─> (draw_id=150, bet_type_id=1, is_active=true)  // DIRECTO
   ├─> (draw_id=150, bet_type_id=2, is_active=true)  // PALE
   ├─> (draw_id=150, bet_type_id=7, is_active=true)  // SUPER_PALE
   └─> (draw_id=150, bet_type_id=3, is_active=true)  // TRIPLETA

4. Usuario puede desactivar tipos individuales después
```

### 9.3 Copiar Configuración entre Sorteos

**Escenario:** Usuario quiere copiar config de "LA PRIMERA 12:00" a "LA PRIMERA 18:00"

**Validaciones:**

```javascript
// Endpoint: POST /api/draws/{targetDrawId}/copy-bet-types
// Request: { sourceDrawId: 5 }

// Backend valida:
1. Ambos sorteos deben existir
2. Ambos sorteos deben ser de la MISMA lotería
3. Sorteo origen debe tener al menos 1 bet_type activo

// Si válido:
1. Elimina config actual del sorteo destino
2. Copia TODOS los registros de draw_bet_type_config del origen
3. Retorna cantidad de tipos copiados
```

### 9.4 Impacto en Apuestas Activas

**Pregunta crítica:** ¿Qué pasa si un sorteo ya tiene apuestas activas (tickets) y el usuario desactiva un bet_type?

**Solución recomendada:**

```javascript
// Backend debe validar:
const hasActiveTickets = await checkActiveTickets(drawId, betTypeId);

if (hasActiveTickets) {
  throw new Error(
    'No se puede desactivar este tipo de premio porque ya existen apuestas activas. ' +
    'Espere a que el sorteo finalice o contacte al administrador.'
  );
}

// Frontend muestra error al usuario:
<Alert severity="error">
  No se puede desactivar "Directo" porque ya hay 25 apuestas activas
  para este sorteo con este tipo de juego.
</Alert>
```

**Alternativa menos restrictiva:**

```javascript
// Permitir desactivar pero mostrar warning:
<Alert severity="warning">
  ⚠️ Hay 25 apuestas activas con "Directo".
  Si desactiva este tipo, las apuestas existentes seguirán siendo válidas
  pero no se permitirán nuevas apuestas de este tipo.
</Alert>
```

### 9.5 Performance: Carga de Sorteos

**Optimización para 100+ sorteos:**

```javascript
// En DrawsList, implementar:

1. Paginación real (no virtual scroll por ahora)
   └─> pageSize = 20 sorteos por página
   └─> Backend maneja paginación

2. Lazy loading de detalles
   └─> Lista solo muestra: ID, nombre, lotería, hora
   └─> Al hacer clic en "Ver", cargar todos los detalles

3. Debounce en búsqueda
   └─> Esperar 300ms después del último keystroke

4. Cache de loterías
   └─> Cargar lista de loterías una sola vez
   └─> Guardar en localStorage si es necesario
```

---

## 10. PLAN DE IMPLEMENTACIÓN

### FASE 1: Backend API (Prioridad: ALTA)

**Duración estimada:** 2-3 días

**Tareas:**

1. ✅ **Draws CRUD ya existe** - DrawsController.cs completo
2. ⚠️ **Crear tabla `draw_bet_type_config`** (SQL)
   - Script de migración
   - Constraints y foreign keys
   - Indexes
3. ⚠️ **Crear `DrawBetTypeConfigController.cs`**
   - GET /api/draws/{id}/bet-types
   - PUT /api/draws/{id}/bet-types
   - POST /api/draws/{id}/bet-types/copy
   - GET /api/draws/{id}/available-bet-types
4. ⚠️ **Lógica de herencia automática**
   - Al crear draw, copiar bet_types de lottery_bet_type_compatibility
5. ⚠️ **Validaciones**
   - Horarios duplicados (warning)
   - Tickets activos (bloqueo)
   - Same lottery para copy config

**Entregables:**
- Script SQL: `create_draw_bet_type_config.sql`
- Controlador: `DrawBetTypeConfigController.cs`
- DTOs: `DrawBetTypeConfigDto.cs`
- Tests: 10+ unit tests

---

### FASE 2: Frontend - Servicio y Hooks (Prioridad: ALTA)

**Duración estimada:** 1-2 días

**Tareas:**

1. **Crear `drawService.js`**
   - getAllDraws, getDrawById, getDrawsByLottery
   - createDraw, updateDraw, deleteDraw
   - getDrawBetTypes, updateDrawBetTypes, copyDrawBetTypesConfig
2. **Crear `useDrawsList.js`**
   - Estado: draws, pagination, filters
   - Handlers: CRUD operations
   - Load data on mount
3. **Crear `useDrawForm.js`**
   - Estado: formData, errors, loading
   - Validaciones
   - Submit handler
4. **Crear `useDrawBetTypes.js`**
   - Cargar bet_types disponibles
   - Toggle individual
   - Copy from another draw

**Entregables:**
- `/src/services/drawService.js`
- `/src/components/features/draws/DrawsList/hooks/useDrawsList.js`
- `/src/components/features/draws/DrawForm/hooks/useDrawForm.js`
- `/src/components/features/draws/DrawForm/hooks/useDrawBetTypes.js`

---

### FASE 3: Frontend - Componentes UI (Prioridad: MEDIA)

**Duración estimada:** 2-3 días

**Tareas:**

1. **DrawsList/**
   - index.jsx (componente principal)
   - DrawsTable.jsx (tabla con acciones)
   - DrawsFilters.jsx (búsqueda y filtros)
2. **DrawModal/**
   - index.jsx (modal crear/editar)
3. **DrawForm/**
   - DrawFormFields.jsx (campos del formulario)
   - DrawBetTypesConfig.jsx (config de premios)
4. **Componentes comunes**
   - LotterySelector.jsx
   - TimeRangePicker.jsx

**Entregables:**
- 8 archivos .jsx
- Estilos consistentes con Material-UI
- Responsive design

---

### FASE 4: Integración y Testing (Prioridad: ALTA)

**Duración estimada:** 2 días

**Tareas:**

1. **Testing de integración**
   - Crear sorteo desde UI
   - Editar sorteo
   - Eliminar sorteo
   - Copiar configuración
2. **Testing de validaciones**
   - Horarios duplicados
   - Tickets activos
   - Formulario incompleto
3. **Testing de performance**
   - 100+ sorteos en lista
   - Búsqueda y filtros
   - Paginación
4. **Testing de UX**
   - Mensajes de error claros
   - Loading states
   - Success feedback

**Entregables:**
- Plan de testing
- Checklist de QA
- Bugs documentados y resueltos

---

### FASE 5: Documentación (Prioridad: MEDIA)

**Duración estimada:** 1 día

**Tareas:**

1. **README del feature**
   - Cómo usar la funcionalidad
   - Screenshots
2. **API Documentation**
   - Swagger annotations
   - Postman collection actualizada
3. **Database Documentation**
   - ER diagram actualizado
   - Descripción de tabla nueva
4. **Frontend Documentation**
   - Storybook para componentes (opcional)
   - JSDoc en hooks

**Entregables:**
- `/docs/DRAWS_MANAGEMENT_USER_GUIDE.md`
- `/docs/API_DRAWS_ENDPOINTS.md`
- Swagger actualizado
- ER diagram actualizado

---

## RESUMEN EJECUTIVO

### Componentes a Crear

**Backend (5 archivos):**
- `create_draw_bet_type_config.sql` (migración)
- `DrawBetTypeConfigController.cs`
- `DrawBetTypeConfigDto.cs`
- `DrawBetTypeConfigRepository.cs`
- Tests unitarios

**Frontend (12 archivos):**
- `drawService.js`
- `useDrawsList.js`
- `useDrawForm.js`
- `useDrawBetTypes.js`
- `DrawsList/index.jsx`
- `DrawsTable.jsx`
- `DrawsFilters.jsx`
- `DrawModal/index.jsx`
- `DrawFormFields.jsx`
- `DrawBetTypesConfig.jsx`
- `LotterySelector.jsx`
- `TimeRangePicker.jsx`

### Endpoints API Necesarios

**Existentes (6):**
- ✅ GET /api/draws
- ✅ GET /api/draws/{id}
- ✅ GET /api/draws/lottery/{lotteryId}
- ✅ POST /api/draws
- ✅ PUT /api/draws/{id}
- ✅ DELETE /api/draws/{id}

**Nuevos (4):**
- ⚠️ GET /api/draws/{id}/bet-types
- ⚠️ PUT /api/draws/{id}/bet-types
- ⚠️ POST /api/draws/{id}/bet-types/copy
- ⚠️ GET /api/draws/{id}/available-bet-types

### Tiempo Total Estimado

- **Fase 1 (Backend):** 2-3 días
- **Fase 2 (Servicios):** 1-2 días
- **Fase 3 (UI):** 2-3 días
- **Fase 4 (Testing):** 2 días
- **Fase 5 (Docs):** 1 día

**Total: 8-11 días** (aproximadamente 2 semanas de trabajo)

### Riesgos Identificados

1. **Alto:** Validación de tickets activos - necesita lógica compleja
2. **Medio:** Performance con 100+ sorteos - requiere paginación real
3. **Bajo:** Horarios duplicados - solo warning, no bloqueante

### Próximos Pasos Inmediatos

1. ✅ **Revisar y aprobar este documento**
2. ⚠️ **Crear ticket/issue en repositorio para tracking**
3. ⚠️ **Iniciar Fase 1: Backend API**
   - Crear branch: `feature/draw-management`
   - Escribir script SQL
   - Implementar controller

---

**Fin del documento**

*Última actualización: 2025-11-06*
*Versión: 1.0*
