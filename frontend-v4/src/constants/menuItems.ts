import type { SvgIconComponent } from '@mui/icons-material'
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
  Email,
  LocationOn,
  Warning as WarningIcon
} from '@mui/icons-material';

export interface MenuItem {
  id: string
  label: string
  icon?: SvgIconComponent
  path?: string
  shortcut?: string
  submenu?: MenuItem[]
  /**
   * Optional permission requirement to show this item.
   *   - undefined → visible to anyone authenticated.
   *   - string → user must hold this exact permission code.
   *   - string[] → user must hold AT LEAST ONE of the codes (OR-logic).
   */
  permission?: string | string[]
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'INICIO', icon: AccountBalance, path: '/dashboard', permission: 'ADMIN_DASHBOARD' },
  {
    id: 'sales',
    label: 'VENTAS',
    icon: Description,
    permission: ['VIEW_SALES', 'CHANGE_GAME_PRIZES'],
    submenu: [
      { id: 'sales-day', label: 'Del día', shortcut: 'D', path: '/sales/day', permission: 'VIEW_SALES' },
      { id: 'sales-history', label: 'Histórico', shortcut: 'H', path: '/sales/history', permission: 'VIEW_SALES' },
      { id: 'sales-by-date', label: 'Ventas por fecha', shortcut: 'V', path: '/sales/by-date', permission: 'VIEW_SALES' },
      { id: 'sales-prizes', label: 'Premios por jugada', shortcut: 'P', path: '/sales/prizes', permission: 'CHANGE_GAME_PRIZES' },
      { id: 'sales-percentages', label: 'Porcentajes', shortcut: 'P', path: '/sales/percentages', permission: 'CHANGE_GAME_PRIZES' },
      { id: 'sales-betting-pools', label: 'Bancas', shortcut: 'B', path: '/sales/betting-pools', permission: 'VIEW_SALES' },
      { id: 'sales-zones', label: 'Zonas', shortcut: 'Z', path: '/sales/zones', permission: 'VIEW_SALES' }
    ]
  },
  {
    id: 'tickets',
    label: 'TICKETS',
    icon: Tag,
    permission: ['SELL_TICKETS', 'TICKET_MONITORING'],
    submenu: [
      { id: 'create-ticket', label: 'Crear', shortcut: 'C', path: '/tickets/new', permission: 'SELL_TICKETS' },
      { id: 'monitoring', label: 'Monitoreo', shortcut: 'M', path: '/tickets/monitoring', permission: 'TICKET_MONITORING' },
      { id: 'plays', label: 'Jugadas', shortcut: 'J', path: '/tickets/plays', permission: 'TICKET_MONITORING' },
      { id: 'winning-plays', label: 'Jugadas ganadoras', shortcut: 'J', path: '/tickets/winners', permission: 'TICKET_MONITORING' },
      { id: 'board', label: 'Pizarra', shortcut: 'P', path: '/tickets/board', permission: 'TICKET_MONITORING' }
      // TODO: Habilitar cuando se implementen los endpoints de bote
      // { id: 'imported-pool', label: 'Bote importado', shortcut: 'B', path: '/tickets/imported-pool' },
      // { id: 'exported-pool', label: 'Bote Exportado', shortcut: 'B', path: '/tickets/exported-pool' },
    ]
  },
  { id: 'results', label: 'RESULTADOS', icon: Description, path: '/results', permission: ['PUBLISH_TODAY_RESULTS', 'PUBLISH_PAST_RESULTS', 'PUBLISH_RESULTS_QUICK'] },
  {
    id: 'betting-pools',
    label: 'BANCAS',
    icon: Store,
    permission: 'BANK_ACCESS',
    submenu: [
      { id: 'betting-pools-list', label: 'Lista', shortcut: 'L', path: '/betting-pools/list', permission: 'BANK_ACCESS' },
      { id: 'create-betting-pool', label: 'Crear', shortcut: 'C', path: '/betting-pools/new', permission: 'CREATE_BANKS' },
      { id: 'bulk-edit', label: 'Edicion masiva', shortcut: 'E', path: '/betting-pools/mass-edit', permission: 'MANAGE_BANKS' },
      { id: 'clear-pending', label: 'Limpiar pendientes de pago', shortcut: 'L', path: '/betting-pools/clear-pending' },
      { id: 'no-sales-list', label: 'Lista sin ventas', shortcut: 'L', path: '/betting-pools/no-sales', permission: 'VIEW_BANKS_NO_SALES' },
      { id: 'days-report', label: 'Reporte de dias sin venta', shortcut: 'R', path: '/betting-pools/days-report', permission: 'VIEW_BANKS_NO_SALES' }
    ]
  },
  {
    id: 'balances',
    label: 'BALANCES',
    icon: Coins,
    submenu: [
      { id: 'balances-betting-pools', label: 'Bancas', shortcut: 'B', path: '/balances/betting-pools', permission: 'BALANCE_BANKS' },
      { id: 'balances-banks', label: 'Bancos', shortcut: 'B', path: '/balances/banks', permission: 'BALANCE_FINANCIAL_BANKS' },
      { id: 'balances-zones', label: 'Zonas', shortcut: 'Z', path: '/balances/zones', permission: 'BALANCE_ZONES' }
    ]
  },
  {
    id: 'users',
    label: 'USUARIOS',
    icon: People,
    submenu: [
      { id: 'users-list', label: 'Lista', shortcut: 'L', path: '/users/list', permission: 'MANAGE_USERS' },
      { id: 'create-user', label: 'Crear', shortcut: 'C', path: '/users/new', permission: 'MANAGE_USERS' },
      { id: 'login-history', label: 'Inicios de sesión', shortcut: 'I', path: '/users/login-history', permission: 'VIEW_LOGIN_SESSIONS' },
      { id: 'blocked-sessions', label: 'Sesiones bloqueadas', shortcut: 'S', path: '/users/blocked-sessions', permission: 'VIEW_LOGIN_SESSIONS' }
    ]
  },
  {
    id: 'collections-payments',
    label: 'COBROS / PAGOS',
    icon: Coins,
    submenu: [
      { id: 'collections-list', label: 'Lista', shortcut: 'L', path: '/collections-payments/list',
        permission: ['CREATE_PAYMENTS', 'CREATE_COLLECTIONS', 'PAYMENTS_COLLECTIONS_QUICK'] }
    ]
  },
  {
    id: 'transactions',
    label: 'TRANSACCIONES',
    icon: CreditCard,
    submenu: [
      { id: 'transactions-list', label: 'Lista', shortcut: 'L', path: '/accountable-transactions', permission: 'MANAGE_TRANSACTIONS' },
      { id: 'transactions-by-groups', label: 'Lista por grupos', shortcut: 'L', path: '/accountable-transactions-groups', permission: 'VIEW_ALL_TRANSACTION_GROUPS' },
      { id: 'approvals', label: 'Aprobaciones', shortcut: 'A', path: '/accountable-transaction-approvals', permission: 'TRANSACTION_APPROVE' },
      { id: 'summary', label: 'Resumen', shortcut: 'R', path: '/accountable-transactions/summary', permission: 'MANAGE_TRANSACTIONS' },
      { id: 'transactions-betting-pools', label: 'Bancas', shortcut: 'B', path: '/accountable-transactions/betting-pool', permission: 'MANAGE_TRANSACTIONS' },
      { id: 'expense-categories', label: 'Categorías de gastos', shortcut: 'C', path: '/expenses/categories', permission: 'CREATE_EXPENSE_CATEGORIES' }
    ]
  },
  {
    id: 'loans',
    label: 'PRÉSTAMOS',
    icon: PieChart,
    permission: 'MANAGE_LOANS',
    submenu: [
      { id: 'create-loan', label: 'Crear', shortcut: 'C', path: '/loans/new', permission: 'MANAGE_LOANS' },
      { id: 'loans-list', label: 'Lista', shortcut: 'L', path: '/loans/list', permission: 'MANAGE_LOANS' }
    ]
  },
  {
    id: 'limits',
    label: 'LÍMITES',
    icon: BarChart,
    submenu: [
      { id: 'limits-list', label: 'Lista', shortcut: 'L', path: '/limits/list', permission: 'MANAGE_LIMITS' },
      { id: 'create-limit', label: 'Crear', shortcut: 'C', path: '/limits/new', permission: 'MANAGE_LIMITS' },
      { id: 'limit-defaults', label: 'Configuración', shortcut: 'C', path: '/limits/defaults', permission: 'MANAGE_LIMIT_DEFAULTS' },
      { id: 'automatic-limits', label: 'Límites automáticos', shortcut: 'L', path: '/limits/automatic', permission: 'MANAGE_AUTOMATIC_LIMITS' },
      { id: 'delete-limit', label: 'Eliminar', shortcut: 'E', path: '/limits/delete', permission: 'MANAGE_LIMITS' },
      { id: 'hot-numbers', label: 'Números calientes', shortcut: 'N', path: '/limits/hot-numbers', permission: 'MANAGE_HOT_NUMBERS' },
      { id: 'blocked-numbers', label: 'Números bloqueados', shortcut: 'B', path: '/limits/blocked-numbers', permission: 'MANAGE_BLOCKED_NUMBERS' }
    ]
  },
  {
    id: 'draws',
    label: 'SORTEOS',
    icon: MenuBook,
    submenu: [
      { id: 'draws-list', label: 'Lista', shortcut: 'L', path: '/draws/list', permission: 'MANAGE_DRAWS' },
      { id: 'schedules', label: 'Horario', shortcut: 'H', path: '/draws/schedules', permission: 'MANAGE_DRAW_SCHEDULES' }
    ]
  },
  {
    id: 'my-group',
    label: 'MI GRUPO',
    icon: MenuBook,
    permission: 'MANAGE_MY_GROUP',
    submenu: [
      { id: 'group-configuration', label: 'Configuración', shortcut: 'C', path: '/my-group/configuration', permission: 'MANAGE_MY_GROUP' }
    ]
  },
  { id: 'warnings', label: 'ADVERTENCIAS', icon: WarningIcon, path: '/warnings' },
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
    permission: 'MANAGE_EMAIL_RECIPIENTS',
    submenu: [
      { id: 'receivers-list', label: 'Lista', shortcut: 'L', path: '/receivers/list', permission: 'MANAGE_EMAIL_RECIPIENTS' },
      { id: 'create-receiver', label: 'Crear', shortcut: 'C', path: '/receivers/new', permission: 'MANAGE_EMAIL_RECIPIENTS' }
    ]
  },
  { id: 'notifications', label: 'NOTIFICACIONES', icon: Chat, path: '/notifications', permission: 'SEND_NOTIFICATIONS' }
];
