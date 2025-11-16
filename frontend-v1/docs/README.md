# 🎰 Lottery Management System

Sistema de gestión de lotería construido con React + Vite.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

### Build para Producción

```bash
npm run build
```

### Preview de Producción

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Sidebar, Header, MainLayout
│   ├── common/         # Botones, inputs, modales
│   └── widgets/        # Widgets del dashboard
├── pages/              # Páginas principales
│   ├── Inicio/
│   ├── Ventas/
│   ├── Tickets/
│   └── ...
├── hooks/              # Custom hooks
├── utils/              # Funciones auxiliares
├── constants/          # Configuraciones y constantes
├── services/           # Servicios API
└── styles/             # Estilos globales
```

## 🛠️ Tecnologías

- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

## 📝 Convenciones

- Componentes en PascalCase
- Archivos de utilidades en camelCase
- Constantes en UPPER_SNAKE_CASE
- Hooks personalizados con prefijo `use`
