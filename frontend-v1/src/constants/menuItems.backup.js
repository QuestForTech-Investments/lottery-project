import {
  Home,
  DollarSign,
  Ticket,
  Award,
  Store,
  PieChart,
  Users,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Shield,
  UserCheck,
  Coins,
  Building2,
  Mail,
  Bell
} from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'inicio', label: 'INICIO', icon: Home, path: '/' },
  {
    id: 'ventas',
    label: 'VENTAS',
    icon: DollarSign,
    submenu: [
      { id: 'venta-dia', label: 'Del día', shortcut: 'D', path: '/ventas/dia' },
      { id: 'historico', label: 'Histórico', shortcut: 'H', path: '/ventas/historico' },
      { id: 'ventas-fecha', label: 'Ventas por fecha', shortcut: 'V', path: '/ventas/fecha' },
      { id: 'premios-jugada', label: 'Premios por jugada', shortcut: 'P', path: '/ventas/premios' },
      { id: 'porcentajes', label: 'Porcentajes', shortcut: 'P', path: '/ventas/porcentajes' },
      { id: 'ventas-banca', label: 'Bancas', shortcut: 'B', path: '/ventas/bancas' },
      { id: 'zonas', label: 'Zonas', shortcut: 'Z', path: '/ventas/zonas' }
    ]
  },
  {
    id: 'tickets',
    label: 'TICKETS',
    icon: Ticket,
    submenu: [
      { id: 'crear-ticket', label: 'Crear', shortcut: 'C', path: '/tickets/crear' },
      { id: 'monitoreo', label: 'Monitoreo', shortcut: 'M', path: '/tickets/monitoreo' },
      { id: 'agentes-externos-m', label: 'Monitoreo de agentes externos', shortcut: 'M', path: '/tickets/agentes-externos' },
      { id: 'jugadas', label: 'Jugadas', shortcut: 'J', path: '/tickets/jugadas' },
      { id: 'jugadas-ganadoras', label: 'Jugadas ganadoras', shortcut: 'J', path: '/tickets/ganadoras' },
      { id: 'pizarra', label: 'Pizarra', shortcut: 'P', path: '/tickets/pizarra' },
      { id: 'bote-importado', label: 'Bote importado', shortcut: 'B', path: '/tickets/bote-importado' },
      { id: 'bote-exportado', label: 'Bote Exportado', shortcut: 'B', path: '/tickets/bote-exportado' },
      { id: 'anomalias', label: 'Anomalías', shortcut: 'A', path: '/tickets/anomalias' }
    ]
  },
  { id: 'resultados', label: 'RESULTADOS', icon: Award, path: '/resultados' },
  {
    id: 'bancas',
    label: 'BANCAS',
    icon: Store,
    submenu: [
      { id: 'lista-bancas', label: 'Lista', shortcut: 'L', path: '/bancas/lista' },
      { id: 'crear-banca', label: 'Crear', shortcut: 'C', path: '/bancas/crear' },
      { id: 'edicion-masiva', label: 'Edicion masiva', shortcut: 'E', path: '/bancas/edicion-masiva' },
      { id: 'acceso', label: 'Acceso', shortcut: 'A', path: '/bancas/acceso' },
      { id: 'limpiar-pendiente', label: 'Limpiar pendientes de pago', shortcut: 'L', path: '/bancas/limpiar-pendientes' },
      { id: 'lista-sin-ventas', label: 'Lista sin ventas', shortcut: 'L', path: '/bancas/sin-ventas' },
      { id: 'reporte-dias', label: 'Reporte de dias sin venta', shortcut: 'R', path: '/bancas/reporte-dias' }
    ]
  },
  {
    id: 'balances',
    label: 'BALANCES',
    icon: PieChart,
    submenu: [
      { id: 'balances-bancas', label: 'Bancas', shortcut: 'B', path: '/balances/bancas' },
      { id: 'balances-bancos', label: 'Bancos', shortcut: 'B', path: '/balances/bancos' },
      { id: 'balances-zonas', label: 'Zonas', shortcut: 'Z', path: '/balances/zonas' },
      { id: 'balances-grupos', label: 'Grupos', shortcut: 'G', path: '/balances/grupos' }
    ]
  },
  {
    id: 'usuarios',
    label: 'USUARIOS',
    icon: Users,
    submenu: [
      { id: 'lista-usuarios', label: 'Lista', shortcut: 'L', path: '/usuarios/lista' },
      { id: 'usuarios-bancas', label: 'Bancas', shortcut: 'B', path: '/usuarios/bancas' },
      { id: 'administradores', label: 'Administradores', shortcut: 'A', path: '/usuarios/administradores' },
      { id: 'crear-usuario', label: 'Crear', shortcut: 'C', path: '/usuarios/crear' },
      { id: 'inicios-sesion', label: 'Inicios de sesión', shortcut: 'I', path: '/usuarios/inicios-sesion' },
      { id: 'sesiones-bloqueadas', label: 'Sesiones bloqueadas', shortcut: 'S', path: '/usuarios/sesiones-bloqueadas' }
    ]
  },
  {
    id: 'cobros-pagos',
    label: 'COBROS / PAGOS',
    icon: CreditCard,
    submenu: [
      { id: 'lista-cobros', label: 'Lista', shortcut: 'L', path: '/cobros-pagos/lista' }
    ]
  },
  {
    id: 'transacciones',
    label: 'TRANSACCIONES',
    icon: ArrowLeftRight,
    submenu: [
      { id: 'lista-transacciones', label: 'Lista', shortcut: 'L', path: '/transacciones/lista' },
      { id: 'lista-grupos', label: 'Lista por grupos', shortcut: 'L', path: '/transacciones/grupos' },
      { id: 'aprobaciones', label: 'Aprobaciones', shortcut: 'A', path: '/transacciones/aprobaciones' },
      { id: 'resumen', label: 'Resumen', shortcut: 'R', path: '/transacciones/resumen' },
      { id: 'trans-bancas', label: 'Bancas', shortcut: 'B', path: '/transacciones/bancas' },
      { id: 'categorias-gastos', label: 'Categorías de gastos', shortcut: 'C', path: '/transacciones/categorias' }
    ]
  },
  {
    id: 'prestamos',
    label: 'PRÉSTAMOS',
    icon: TrendingUp,
    submenu: [
      { id: 'crear-prestamo', label: 'Crear', shortcut: 'C', path: '/prestamos/crear' },
      { id: 'lista-prestamos', label: 'Lista', shortcut: 'L', path: '/prestamos/lista' }
    ]
  },
  {
    id: 'excedentes',
    label: 'EXCEDENTES',
    icon: TrendingUp,
    submenu: [
      { id: 'manejar-excedentes', label: 'Manejar', shortcut: 'M', path: '/excedentes/manejar' },
      { id: 'reporte-excedentes', label: 'Reporte', shortcut: 'R', path: '/excedentes/reporte' }
    ]
  },
  {
    id: 'limites',
    label: 'LÍMITES',
    icon: Shield,
    submenu: [
      { id: 'lista-limites', label: 'Lista', shortcut: 'L', path: '/limites/lista' },
      { id: 'crear-limite', label: 'Crear', shortcut: 'C', path: '/limites/crear' },
      { id: 'limites-automaticos', label: 'Límites automáticos', shortcut: 'L', path: '/limites/automaticos' },
      { id: 'eliminar-limite', label: 'Eliminar', shortcut: 'E', path: '/limites/eliminar' },
      { id: 'numeros-calientes', label: 'Números calientes', shortcut: 'N', path: '/limites/numeros-calientes' }
    ]
  },
  { id: 'cobradores', label: 'COBRADORES', icon: UserCheck, path: '/cobradores' },
  {
    id: 'sorteos',
    label: 'SORTEOS',
    icon: Coins,
    submenu: [
      { id: 'lista-sorteos', label: 'Lista', shortcut: 'L', path: '/sorteos/lista' },
      { id: 'horarios', label: 'Horario', shortcut: 'H', path: '/sorteos/horarios' }
    ]
  },
  { id: 'manejo-cobradores', label: 'MANEJO DE COBRADORES', icon: UserCheck, path: '/manejo-cobradores' },
  {
    id: 'mi-grupo',
    label: 'MI GRUPO',
    icon: Users,
    submenu: [
      { id: 'configuracion-grupo', label: 'Configuración', shortcut: 'C', path: '/mi-grupo/configuracion' }
    ]
  },
  {
    id: 'agentes-externos',
    label: 'AGENTES EXTERNOS',
    icon: Users,
    submenu: [
      { id: 'crear-agente', label: 'Crear', shortcut: 'C', path: '/agentes-externos/crear' },
      { id: 'lista-agentes', label: 'Lista', shortcut: 'L', path: '/agentes-externos/lista' }
    ]
  },
  { id: 'f8', label: '[F8]', icon: Bell, path: '/f8' },
  {
    id: 'entidades',
    label: 'ENTIDADES CONTABLES',
    icon: Building2,
    submenu: [
      { id: 'lista-entidades', label: 'Lista', shortcut: 'L', path: '/entidades/lista' },
      { id: 'crear-entidad', label: 'Crear', shortcut: 'C', path: '/entidades/crear' }
    ]
  },
  {
    id: 'receptores',
    label: 'RECEPTORES DE CORREO',
    icon: Mail,
    submenu: [
      { id: 'lista-receptores', label: 'Lista', shortcut: 'L', path: '/receptores/lista' },
      { id: 'crear-receptor', label: 'Crear', shortcut: 'C', path: '/receptores/crear' }
    ]
  },
  { id: 'notificaciones', label: 'NOTIFICACIONES', icon: Bell, path: '/notificaciones' }
];

