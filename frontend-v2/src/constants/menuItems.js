import {
  AccountBalance,
  Description,
  Tag,
  Store,
  MonetizationOn as Coins,
  People,
  CreditCard,
  PieChart,
  BarChart,
  Chat,
  MenuBook,
  List,
  Email,
  LocationOn
} from '@mui/icons-material';

export const MENU_ITEMS = [
  { id: 'home', label: 'INICIO', icon: AccountBalance, path: '/dashboard' },
  {
    id: 'sales',
    label: 'VENTAS',
    icon: Description,
    submenu: [
      { id: 'sales-day', label: 'Del día', shortcut: 'D', path: '/sales/day' },
      { id: 'sales-history', label: 'Histórico', shortcut: 'H', path: '/sales/history' },
      { id: 'sales-by-date', label: 'Ventas por fecha', shortcut: 'V', path: '/sales/by-date' },
      { id: 'sales-prizes', label: 'Premios por jugada', shortcut: 'P', path: '/sales/prizes' },
      { id: 'sales-percentages', label: 'Porcentajes', shortcut: 'P', path: '/sales/percentages' },
      { id: 'sales-betting-pools', label: 'Bancas', shortcut: 'B', path: '/sales/betting-pools' },
      { id: 'sales-zones', label: 'Zonas', shortcut: 'Z', path: '/sales/zones' }
    ]
  },
  {
    id: 'tickets',
    label: 'TICKETS',
    icon: Tag,
    submenu: [
      { id: 'create-ticket', label: 'Crear', shortcut: 'C', path: '/tickets/new' },
      { id: 'monitoring', label: 'Monitoreo', shortcut: 'M', path: '/tickets/monitoring' },
      { id: 'external-agents-monitoring', label: 'Monitoreo de agentes externos', shortcut: 'M', path: '/tickets/external-agents' },
      { id: 'plays', label: 'Jugadas', shortcut: 'J', path: '/tickets/plays' },
      { id: 'winning-plays', label: 'Jugadas ganadoras', shortcut: 'J', path: '/tickets/winners' },
      { id: 'board', label: 'Pizarra', shortcut: 'P', path: '/tickets/board' },
      { id: 'imported-pool', label: 'Bote importado', shortcut: 'B', path: '/tickets/imported-pool' },
      { id: 'exported-pool', label: 'Bote Exportado', shortcut: 'B', path: '/tickets/exported-pool' },
      { id: 'anomalies', label: 'Anomalías', shortcut: 'A', path: '/tickets/anomalies' }
    ]
  },
  { id: 'results', label: 'RESULTADOS', icon: Description, path: '/results' },
  {
    id: 'betting-pools',
    label: 'BANCAS',
    icon: Store,
    submenu: [
      { id: 'betting-pools-list', label: 'Lista', shortcut: 'L', path: '/betting-pools/list' },
      { id: 'create-betting-pool', label: 'Crear', shortcut: 'C', path: '/betting-pools/new' },
      { id: 'bulk-edit', label: 'Edicion masiva', shortcut: 'E', path: '/betting-pools/mass-edit' },
      { id: 'access', label: 'Acceso', shortcut: 'A', path: '/betting-pools/access' },
      { id: 'clear-pending', label: 'Limpiar pendientes de pago', shortcut: 'L', path: '/betting-pools/clear-pending' },
      { id: 'no-sales-list', label: 'Lista sin ventas', shortcut: 'L', path: '/betting-pools/no-sales' },
      { id: 'days-report', label: 'Reporte de dias sin venta', shortcut: 'R', path: '/betting-pools/days-report' }
    ]
  },
  {
    id: 'balances',
    label: 'BALANCES',
    icon: Coins,
    submenu: [
      { id: 'balances-betting-pools', label: 'Bancas', shortcut: 'B', path: '/balances/betting-pools' },
      { id: 'balances-banks', label: 'Bancos', shortcut: 'B', path: '/balances/banks' },
      { id: 'balances-zones', label: 'Zonas', shortcut: 'Z', path: '/balances/zones' },
      { id: 'balances-groups', label: 'Grupos', shortcut: 'G', path: '/balances/groups' }
    ]
  },
  {
    id: 'users',
    label: 'USUARIOS',
    icon: People,
    submenu: [
      { id: 'users-list', label: 'Lista', shortcut: 'L', path: '/users/list' },
      { id: 'users-betting-pools', label: 'Bancas', shortcut: 'B', path: '/users/betting-pools' },
      { id: 'administrators', label: 'Administradores', shortcut: 'A', path: '/users/administrators' },
      { id: 'create-user', label: 'Crear', shortcut: 'C', path: '/users/new' },
      { id: 'login-history', label: 'Inicios de sesión', shortcut: 'I', path: '/users/login-history' },
      { id: 'blocked-sessions', label: 'Sesiones bloqueadas', shortcut: 'S', path: '/users/blocked-sessions' }
    ]
  },
  {
    id: 'collections-payments',
    label: 'COBROS / PAGOS',
    icon: Coins,
    submenu: [
      { id: 'collections-list', label: 'Lista', shortcut: 'L', path: '/collections-payments/list' }
    ]
  },
  {
    id: 'transactions',
    label: 'TRANSACCIONES',
    icon: CreditCard,
    submenu: [
      { id: 'transactions-list', label: 'Lista', shortcut: 'L', path: '/transactions/list' },
      { id: 'transactions-by-groups', label: 'Lista por grupos', shortcut: 'L', path: '/transactions/groups' },
      { id: 'approvals', label: 'Aprobaciones', shortcut: 'A', path: '/transactions/approvals' },
      { id: 'summary', label: 'Resumen', shortcut: 'R', path: '/transactions/summary' },
      { id: 'transactions-betting-pools', label: 'Bancas', shortcut: 'B', path: '/transactions/betting-pools' },
      { id: 'expense-categories', label: 'Categorías de gastos', shortcut: 'C', path: '/transactions/categories' }
    ]
  },
  {
    id: 'loans',
    label: 'PRÉSTAMOS',
    icon: PieChart,
    submenu: [
      { id: 'create-loan', label: 'Crear', shortcut: 'C', path: '/loans/new' },
      { id: 'loans-list', label: 'Lista', shortcut: 'L', path: '/loans/list' }
    ]
  },
  {
    id: 'surpluses',
    label: 'EXCEDENTES',
    icon: Description,
    submenu: [
      { id: 'manage-surpluses', label: 'Manejar', shortcut: 'M', path: '/surpluses/manage' },
      { id: 'surpluses-report', label: 'Reporte', shortcut: 'R', path: '/surpluses/report' }
    ]
  },
  {
    id: 'limits',
    label: 'LÍMITES',
    icon: BarChart,
    submenu: [
      { id: 'limits-list', label: 'Lista', shortcut: 'L', path: '/limits/list' },
      { id: 'create-limit', label: 'Crear', shortcut: 'C', path: '/limits/new' },
      { id: 'automatic-limits', label: 'Límites automáticos', shortcut: 'L', path: '/limits/automatic' },
      { id: 'delete-limit', label: 'Eliminar', shortcut: 'E', path: '/limits/delete' },
      { id: 'hot-numbers', label: 'Números calientes', shortcut: 'N', path: '/limits/hot-numbers' }
    ]
  },
  { id: 'collectors', label: 'COBRADORES', icon: Chat, path: '/collectors' },
  {
    id: 'draws',
    label: 'SORTEOS',
    icon: MenuBook,
    submenu: [
      { id: 'draws-list', label: 'Lista', shortcut: 'L', path: '/draws/list' },
      { id: 'schedules', label: 'Horario', shortcut: 'H', path: '/draws/schedules' }
    ]
  },
  { id: 'collector-management', label: 'MANEJO DE COBRADORES', icon: People, path: '/collector-management' },
  {
    id: 'my-group',
    label: 'MI GRUPO',
    icon: MenuBook,
    submenu: [
      { id: 'group-configuration', label: 'Configuración', shortcut: 'C', path: '/my-group/configuration' }
    ]
  },
  {
    id: 'external-agents',
    label: 'AGENTES EXTERNOS',
    icon: Description,
    submenu: [
      { id: 'create-agent', label: 'Crear', shortcut: 'C', path: '/external-agents/new' },
      { id: 'agents-list', label: 'Lista', shortcut: 'L', path: '/external-agents/list' }
    ]
  },
  { id: 'f8', label: '[F8]', icon: List, path: '/f8' },
  {
    id: 'zones',
    label: 'ZONAS',
    icon: LocationOn,
    submenu: [
      { id: 'zones-list', label: 'Lista', shortcut: 'L', path: '/zones/list' },
      { id: 'create-zone', label: 'Crear', shortcut: 'C', path: '/zones/new' },
      { id: 'manage-zones', label: 'Manejar', shortcut: 'M', path: '/zones/manage' }
    ]
  },
  {
    id: 'entities',
    label: 'ENTIDADES CONTABLES',
    icon: AccountBalance,
    submenu: [
      { id: 'entities-list', label: 'Lista', shortcut: 'L', path: '/entities/list' },
      { id: 'create-entity', label: 'Crear', shortcut: 'C', path: '/entities/new' }
    ]
  },
  {
    id: 'receivers',
    label: 'RECEPTORES DE CORREO',
    icon: Email,
    submenu: [
      { id: 'receivers-list', label: 'Lista', shortcut: 'L', path: '/receivers/list' },
      { id: 'create-receiver', label: 'Crear', shortcut: 'C', path: '/receivers/new' }
    ]
  },
  { id: 'notifications', label: 'NOTIFICACIONES', icon: Chat, path: '/notifications' }
];
