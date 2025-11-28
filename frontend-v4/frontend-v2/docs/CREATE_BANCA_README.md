# Formulario de Crear Banca

Este documento describe el formulario de crear banca implementado en React para la aplicación LottoWebApp.

## Características

### 🎯 Funcionalidades Principales

- **Formulario completo de creación de banca** con validaciones
- **Sistema de pestañas** para organizar diferentes secciones
- **Sección de copia de plantilla** con selector de bancas existentes
- **Validaciones de formulario** en tiempo real
- **Diseño responsivo** que se adapta a diferentes tamaños de pantalla

### 📋 Campos del Formulario

#### Pestaña General
- **Nombre**: Nombre de la banca (requerido)
- **Nombre de usuario**: Usuario para acceso (requerido)
- **Contraseña**: Contraseña de acceso (requerido)
- **Confirmación de contraseña**: Verificación de contraseña (requerido)
- **Número**: Código único generado automáticamente (LAN-0519)
- **Ubicación**: Ubicación física de la banca
- **Referencia**: Referencia adicional
- **Comentario**: Comentarios adicionales

#### Pestañas Adicionales
- Configuración
- Pies de página
- Premios & Comisiones
- Horarios de sorteos
- Sorteos
- Estilos
- Gastos automáticos

### 🎨 Características de Diseño

- **Estilo moderno** con tarjetas y sombras
- **Pestañas interactivas** con transiciones suaves
- **Multiselect personalizado** para selección de plantillas
- **Botones de toggle** para campos de plantilla
- **Validación visual** con colores de estado

## Archivos Creados

### 1. Componente Principal
- `src/components/CreateBanca.jsx` - Componente React principal

### 2. Estilos
- `src/assets/css/create-banca.css` - Estilos específicos del formulario

### 3. Configuración de Rutas
- `src/App.jsx` - Ruta agregada: `/bancas/crear`

### 4. Archivos de Demostración
- `create-banca-demo.html` - Demostración HTML estática
- `CREATE_BANCA_README.md` - Este archivo de documentación

## Uso

### Acceso al Formulario
```
http://localhost:3000/bancas/crear
```

### Navegación
El formulario se puede acceder desde:
- Lista de bancas (botón "Crear Nueva Banca")
- Menú de navegación principal
- Enlaces directos

### Validaciones

#### Campos Requeridos
- Nombre de la banca
- Nombre de usuario
- Contraseña
- Confirmación de contraseña

#### Validaciones Específicas
- Las contraseñas deben coincidir
- El código se genera automáticamente
- Validación en tiempo real

### Funcionalidad de Plantilla

#### Selección de Plantilla
- Dropdown con lista de bancas existentes
- Búsqueda y filtrado
- Selección múltiple de campos a copiar

#### Campos de Plantilla Disponibles
- ✅ Configuración
- ✅ Pies de página
- ✅ Premios & Comisiones
- ✅ Horarios de sorteos
- ✅ Sorteos
- ✅ Estilos
- ✅ Reglas

## Estructura del Código

### Estado del Componente
```javascript
const [formData, setFormData] = useState({
  name: '',
  username: '',
  password: '',
  password_confirmation: '',
  code: 'LAN-0519',
  location: '',
  reference: '',
  comment: ''
});
```

### Funciones Principales
- `handleInputChange()` - Manejo de cambios en inputs
- `handleTemplateSelect()` - Selección de plantilla
- `handleFieldToggle()` - Toggle de campos de plantilla
- `handleSubmit()` - Envío del formulario con validaciones

## Estilos CSS

### Clases Principales
- `.el-tabs` - Sistema de pestañas
- `.multiselect` - Selector personalizado
- `.btn-group-toggle` - Botones de toggle
- `.card-task` - Tarjetas del formulario

### Responsive Design
- Breakpoints para móviles y tablets
- Adaptación de pestañas en pantallas pequeñas
- Formulario optimizado para touch

## Integración con API

### Endpoint de Creación
```javascript
// Ejemplo de integración
const createBanca = async (formData) => {
  const response = await fetch('/api/bancas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  });
  return response.json();
};
```

### Datos Enviados
```javascript
{
  name: "Nombre de la banca",
  username: "usuario_banca",
  password: "contraseña_segura",
  location: "Ubicación",
  reference: "Referencia",
  comment: "Comentarios",
  templateId: "ID_de_plantilla_seleccionada",
  templateFields: ["configuration", "footers", "prizes-commissions"]
}
```

## Próximos Pasos

### Funcionalidades Pendientes
1. **Implementar pestañas adicionales** (Configuración, Estilos, etc.)
2. **Integración con API** para guardado de datos
3. **Validaciones avanzadas** (formato de usuario, fortaleza de contraseña)
4. **Carga de plantillas** desde base de datos
5. **Notificaciones** de éxito/error
6. **Historial de cambios** y auditoría

### Mejoras de UX
1. **Autocompletado** en campos de ubicación
2. **Generación automática** de códigos únicos
3. **Vista previa** de la banca antes de crear
4. **Plantillas predefinidas** por tipo de banca

## Tecnologías Utilizadas

- **React 18** - Framework principal
- **React Router** - Navegación
- **CSS3** - Estilos personalizados
- **Bootstrap 5** - Framework CSS base
- **JavaScript ES6+** - Lógica del componente

## Contribución

Para contribuir al desarrollo de este formulario:

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/mejora-formulario-banca`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/mejora-formulario-banca`
5. Crear Pull Request

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- Crear issue en el repositorio
- Describir el problema o funcionalidad deseada
- Incluir pasos para reproducir (si aplica)
- Adjuntar capturas de pantalla (si aplica)







