import {
  Home,
  AttachMoney as DollarSign,
  ConfirmationNumber as Ticket,
  EmojiEvents as Award,
  Store,
  PieChart,
  People as Users,
  CreditCard,
  SwapHoriz as ArrowLeftRight,
  TrendingUp,
  Security as Shield,
  Person as UserCheck,
  MonetizationOn as Coins,
  Business as Building2,
  Mail,
  Notifications as Bell,
  LocationOn
} from '@mui/icons-material';

export const MENU_ITEMS = [
  { id: 'inicio', label: 'INICIO', icon: 'nc-bank', path: '/dashboard' },
  {
    id: 'ventas',
    label: 'VENTAS',
    icon: 'nc-paper',
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
    icon: 'nc-tag-content',
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
  { id: 'resultados', label: 'RESULTADOS', icon: 'nc-paper', path: '/resultados' },
  {
    id: 'bancas',
    label: 'BANCAS',
    icon: 'nc-shop',
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
    icon: 'nc-money-coins',
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
    icon: 'nc-single-02',
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
    icon: 'nc-money-coins',
    submenu: [
      { id: 'lista-cobros', label: 'Lista', shortcut: 'L', path: '/cobros-pagos/lista' }
    ]
  },
  {
    id: 'transacciones',
    label: 'TRANSACCIONES',
    icon: 'nc-credit-card',
    submenu: [
      { id: 'lista-transacciones', label: 'Lista', shortcut: 'L', path: '/accountable-transactions' },
      { id: 'lista-grupos', label: 'Lista por grupos', shortcut: 'L', path: '/accountable-transactions-groups' },
      { id: 'aprobaciones', label: 'Aprobaciones', shortcut: 'A', path: '/accountable-transaction-approvals' },
      { id: 'resumen', label: 'Resumen', shortcut: 'R', path: '/accountable-transactions/summary' },
      { id: 'trans-bancas', label: 'Bancas', shortcut: 'B', path: '/accountable-transactions/betting-pool' },
      { id: 'categorias-gastos', label: 'Categorías de gastos', shortcut: 'C', path: '/expenses/categories' }
    ]
  },
  {
    id: 'prestamos',
    label: 'PRÉSTAMOS',
    icon: 'nc-chart-pie-36',
    submenu: [
      { id: 'crear-prestamo', label: 'Crear', shortcut: 'C', path: '/prestamos/crear' },
      { id: 'lista-prestamos', label: 'Lista', shortcut: 'L', path: '/prestamos/lista' }
    ]
  },
  {
    id: 'excedentes',
    label: 'EXCEDENTES',
    icon: 'nc-paper',
    submenu: [
      { id: 'manejar-excedentes', label: 'Manejar', shortcut: 'M', path: '/excedentes/manejar' },
      { id: 'reporte-excedentes', label: 'Reporte', shortcut: 'R', path: '/excedentes/reporte' }
    ]
  },
  {
    id: 'limites',
    label: 'LÍMITES',
    icon: 'nc-chart-bar-32',
    submenu: [
      { id: 'lista-limites', label: 'Lista', shortcut: 'L', path: '/limites/lista' },
      { id: 'crear-limite', label: 'Crear', shortcut: 'C', path: '/limites/crear' },
      { id: 'limites-automaticos', label: 'Límites automáticos', shortcut: 'L', path: '/limites/automaticos' },
      { id: 'eliminar-limite', label: 'Eliminar', shortcut: 'E', path: '/limites/eliminar' },
      { id: 'numeros-calientes', label: 'Números calientes', shortcut: 'N', path: '/limites/numeros-calientes' }
    ]
  },
  { id: 'cobradores', label: 'COBRADORES', icon: 'nc-chat-33', path: '/cobradores' },
  {
    id: 'sorteos',
    label: 'SORTEOS',
    icon: 'nc-book-bookmark',
    submenu: [
      { id: 'lista-sorteos', label: 'Lista', shortcut: 'L', path: '/sorteos/lista' },
      { id: 'crear-sorteo', label: 'Crear', shortcut: 'C', path: '/sorteos/crear' },
      { id: 'horarios', label: 'Horario', shortcut: 'H', path: '/sorteos/horarios' }
    ]
  },
  { id: 'manejo-cobradores', label: 'MANEJO DE COBRADORES', icon: 'nc-single-02', path: '/manejo-cobradores' },
  {
    id: 'mi-grupo',
    label: 'MI GRUPO',
    icon: 'nc-book-bookmark',
    submenu: [
      { id: 'configuracion-grupo', label: 'Configuración', shortcut: 'C', path: '/mi-grupo/configuracion' }
    ]
  },
  {
    id: 'agentes-externos',
    label: 'AGENTES EXTERNOS',
    icon: 'nc-paper',
    submenu: [
      { id: 'crear-agente', label: 'Crear', shortcut: 'C', path: '/agentes-externos/crear' },
      { id: 'lista-agentes', label: 'Lista', shortcut: 'L', path: '/agentes-externos/lista' }
    ]
  },
  { id: 'f8', label: '[F8]', icon: 'nc-bullet-list-67', path: '/f8' },
  {
    id: 'zonas',
    label: 'ZONAS',
    icon: LocationOn,
    submenu: [
      { id: 'lista-zonas', label: 'Lista', shortcut: 'L', path: '/zones/list' },
      { id: 'crear-zona', label: 'Crear', shortcut: 'C', path: '/zones/new' },
      { id: 'manejar-zonas', label: 'Manejar', shortcut: 'M', path: '/zones/manage' }
    ]
  },
  {
    id: 'entidades',
    label: 'ENTIDADES CONTABLES',
    icon: 'nc-bank',
    submenu: [
      { id: 'lista-entidades', label: 'Lista', shortcut: 'L', path: '/entidades/lista' },
      { id: 'crear-entidad', label: 'Crear', shortcut: 'C', path: '/entidades/crear' }
    ]
  },
  {
    id: 'receptores',
    label: 'RECEPTORES DE CORREO',
    icon: 'nc-email-85',
    submenu: [
      { id: 'lista-receptores', label: 'Lista', shortcut: 'L', path: '/receptores-correo/lista' },
      { id: 'crear-receptor', label: 'Crear', shortcut: 'C', path: '/receptores-correo/crear' }
    ]
  },
  { id: 'notificaciones', label: 'NOTIFICACIONES', icon: 'nc-chat-33', path: '/notificaciones' }
];
