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
import type { TenantFeatureFlags } from '../tenant.types'

export interface MenuItem {
  id: string
  /**
   * i18n key used by the sidebar — looked up with `t(label)`. If the key isn't
   * present in the active locale, i18next falls back to the key string itself,
   * so any unset entries fail safe rather than producing blanks.
   */
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
  /**
   * Optional tenant feature flag. When set, the item is hidden unless
   * `tenantConfig.features[feature] === true`. Used for entries that only
   * apply to certain tenants (e.g. partner admin for tenants that have
   * `externalTenantsAdmin = true`).
   */
  feature?: keyof TenantFeatureFlags
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'menu.home', icon: AccountBalance, path: '/dashboard', permission: 'ADMIN_DASHBOARD' },
  {
    id: 'sales',
    label: 'menu.sales',
    icon: Description,
    permission: ['VIEW_SALES', 'CHANGE_GAME_PRIZES'],
    submenu: [
      { id: 'sales-day', label: 'menu.salesDay', shortcut: 'D', path: '/sales/day', permission: 'VIEW_SALES' },
      { id: 'sales-history', label: 'menu.salesHistory', shortcut: 'H', path: '/sales/history', permission: 'VIEW_SALES' },
      { id: 'sales-by-date', label: 'menu.salesByDate', shortcut: 'V', path: '/sales/by-date', permission: 'VIEW_SALES' },
      { id: 'sales-prizes', label: 'menu.salesPrizes', shortcut: 'P', path: '/sales/prizes', permission: 'CHANGE_GAME_PRIZES' },
      { id: 'sales-percentages', label: 'menu.salesPercentages', shortcut: 'P', path: '/sales/percentages', permission: 'CHANGE_GAME_PRIZES' },
      { id: 'sales-betting-pools', label: 'menu.salesBettingPools', shortcut: 'B', path: '/sales/betting-pools', permission: 'VIEW_SALES' },
      { id: 'sales-zones', label: 'menu.salesZones', shortcut: 'Z', path: '/sales/zones', permission: 'VIEW_SALES' }
    ]
  },
  {
    id: 'tickets',
    label: 'menu.tickets',
    icon: Tag,
    permission: ['SELL_TICKETS', 'TICKET_MONITORING'],
    submenu: [
      { id: 'create-ticket', label: 'menu.ticketsCreate', shortcut: 'C', path: '/tickets/new', permission: 'SELL_TICKETS' },
      { id: 'monitoring', label: 'menu.ticketsMonitoring', shortcut: 'M', path: '/tickets/monitoring', permission: 'TICKET_MONITORING' },
      { id: 'plays', label: 'menu.ticketsPlays', shortcut: 'J', path: '/tickets/plays', permission: 'TICKET_MONITORING' },
      { id: 'winning-plays', label: 'menu.ticketsWinners', shortcut: 'J', path: '/tickets/winners', permission: 'TICKET_MONITORING' },
      { id: 'board', label: 'menu.ticketsBoard', shortcut: 'P', path: '/tickets/board', permission: 'TICKET_MONITORING' }
    ]
  },
  { id: 'results', label: 'menu.results', icon: Description, path: '/results', permission: ['PUBLISH_TODAY_RESULTS', 'PUBLISH_PAST_RESULTS', 'PUBLISH_RESULTS_QUICK'] },
  {
    id: 'betting-pools',
    label: 'menu.bettingPools',
    icon: Store,
    permission: 'BANK_ACCESS',
    submenu: [
      { id: 'betting-pools-list', label: 'menu.bpList', shortcut: 'L', path: '/betting-pools/list', permission: 'BANK_ACCESS' },
      { id: 'create-betting-pool', label: 'menu.bpCreate', shortcut: 'C', path: '/betting-pools/new', permission: 'CREATE_BANKS' },
      { id: 'bulk-edit', label: 'menu.bpBulkEdit', shortcut: 'E', path: '/betting-pools/mass-edit', permission: 'MANAGE_BANKS' },
      { id: 'clear-pending', label: 'menu.bpClearPending', shortcut: 'L', path: '/betting-pools/clear-pending' },
      { id: 'no-sales-list', label: 'menu.bpNoSales', shortcut: 'L', path: '/betting-pools/no-sales', permission: 'VIEW_BANKS_NO_SALES' },
      { id: 'days-report', label: 'menu.bpDaysReport', shortcut: 'R', path: '/betting-pools/days-report', permission: 'VIEW_BANKS_NO_SALES' }
    ]
  },
  {
    id: 'balances',
    label: 'menu.balances',
    icon: Coins,
    submenu: [
      { id: 'balances-betting-pools', label: 'menu.balancesBP', shortcut: 'B', path: '/balances/betting-pools', permission: 'BALANCE_BANKS' },
      { id: 'balances-banks', label: 'menu.balancesBanks', shortcut: 'B', path: '/balances/banks', permission: 'BALANCE_FINANCIAL_BANKS' },
      { id: 'balances-zones', label: 'menu.balancesZones', shortcut: 'Z', path: '/balances/zones', permission: 'BALANCE_ZONES' }
    ]
  },
  {
    id: 'users',
    label: 'menu.users',
    icon: People,
    submenu: [
      { id: 'users-list', label: 'menu.usersList', shortcut: 'L', path: '/users/list', permission: 'MANAGE_USERS' },
      { id: 'create-user', label: 'menu.usersCreate', shortcut: 'C', path: '/users/new', permission: 'MANAGE_USERS' },
      { id: 'login-history', label: 'menu.usersLoginHistory', shortcut: 'I', path: '/users/login-history', permission: 'VIEW_LOGIN_SESSIONS' },
      { id: 'blocked-sessions', label: 'menu.usersBlockedSessions', shortcut: 'S', path: '/users/blocked-sessions', permission: 'VIEW_LOGIN_SESSIONS' }
    ]
  },
  {
    id: 'collections-payments',
    label: 'menu.collectionsPayments',
    icon: Coins,
    submenu: [
      { id: 'collections-list', label: 'menu.cpList', shortcut: 'L', path: '/collections-payments/list',
        permission: ['CREATE_PAYMENTS', 'CREATE_COLLECTIONS', 'PAYMENTS_COLLECTIONS_QUICK'] }
    ]
  },
  {
    id: 'transactions',
    label: 'menu.transactions',
    icon: CreditCard,
    submenu: [
      { id: 'transactions-list', label: 'menu.txList', shortcut: 'L', path: '/accountable-transactions', permission: 'MANAGE_TRANSACTIONS' },
      { id: 'transactions-by-groups', label: 'menu.txGroups', shortcut: 'L', path: '/accountable-transactions-groups', permission: 'VIEW_ALL_TRANSACTION_GROUPS' },
      { id: 'approvals', label: 'menu.txApprovals', shortcut: 'A', path: '/accountable-transaction-approvals', permission: 'TRANSACTION_APPROVE' },
      { id: 'summary', label: 'menu.txSummary', shortcut: 'R', path: '/accountable-transactions/summary', permission: 'MANAGE_TRANSACTIONS' },
      { id: 'transactions-betting-pools', label: 'menu.txBP', shortcut: 'B', path: '/accountable-transactions/betting-pool', permission: 'MANAGE_TRANSACTIONS' },
      { id: 'expense-categories', label: 'menu.expenseCategories', shortcut: 'C', path: '/expenses/categories', permission: 'CREATE_EXPENSE_CATEGORIES' }
    ]
  },
  {
    id: 'loans',
    label: 'menu.loans',
    icon: PieChart,
    permission: 'MANAGE_LOANS',
    submenu: [
      { id: 'create-loan', label: 'menu.loansCreate', shortcut: 'C', path: '/loans/new', permission: 'MANAGE_LOANS' },
      { id: 'loans-list', label: 'menu.loansList', shortcut: 'L', path: '/loans/list', permission: 'MANAGE_LOANS' }
    ]
  },
  {
    id: 'limits',
    label: 'menu.limits',
    icon: BarChart,
    submenu: [
      { id: 'limits-list', label: 'menu.limitsList', shortcut: 'L', path: '/limits/list', permission: 'MANAGE_LIMITS' },
      { id: 'create-limit', label: 'menu.limitsCreate', shortcut: 'C', path: '/limits/new', permission: 'MANAGE_LIMITS' },
      { id: 'limit-defaults', label: 'menu.limitsConfig', shortcut: 'C', path: '/limits/defaults', permission: 'MANAGE_LIMIT_DEFAULTS' },
      { id: 'automatic-limits', label: 'menu.limitsAuto', shortcut: 'L', path: '/limits/automatic', permission: 'MANAGE_AUTOMATIC_LIMITS' },
      { id: 'delete-limit', label: 'menu.limitsDelete', shortcut: 'E', path: '/limits/delete', permission: 'MANAGE_LIMITS' },
      { id: 'hot-numbers', label: 'menu.limitsHot', shortcut: 'N', path: '/limits/hot-numbers', permission: 'MANAGE_HOT_NUMBERS' },
      { id: 'blocked-numbers', label: 'menu.limitsBlocked', shortcut: 'B', path: '/limits/blocked-numbers', permission: 'MANAGE_BLOCKED_NUMBERS' }
    ]
  },
  {
    id: 'draws',
    label: 'menu.draws',
    icon: MenuBook,
    submenu: [
      { id: 'draws-list', label: 'menu.drawsList', shortcut: 'L', path: '/draws/list', permission: 'MANAGE_DRAWS' },
      { id: 'schedules', label: 'menu.drawsSchedule', shortcut: 'H', path: '/draws/schedules', permission: 'MANAGE_DRAW_SCHEDULES' }
    ]
  },
  {
    id: 'my-group',
    label: 'menu.myGroup',
    icon: MenuBook,
    permission: 'MANAGE_MY_GROUP',
    submenu: [
      { id: 'group-configuration', label: 'menu.myGroupConfig', shortcut: 'C', path: '/my-group/configuration', permission: 'MANAGE_MY_GROUP' }
    ]
  },
  { id: 'warnings', label: 'menu.warnings', icon: WarningIcon, path: '/warnings', permission: 'VIEW_ANOMALIES' },
  {
    id: 'zones',
    label: 'menu.zones',
    icon: LocationOn,
    permission: ['ZONE_ACCESS', 'CREATE_ZONES', 'MANAGE_ZONES'],
    submenu: [
      { id: 'zones-list', label: 'menu.zonesList', shortcut: 'L', path: '/zones/list', permission: 'ZONE_ACCESS' },
      { id: 'create-zone', label: 'menu.zonesCreate', shortcut: 'C', path: '/zones/new', permission: 'CREATE_ZONES' },
      { id: 'manage-zones', label: 'menu.zonesManage', shortcut: 'M', path: '/zones/manage', permission: 'MANAGE_ZONES' }
    ]
  },
  {
    id: 'entities',
    label: 'menu.entities',
    icon: AccountBalance,
    permission: 'MANAGE_ACCOUNTING_ENTITIES',
    submenu: [
      { id: 'entities-list', label: 'menu.entitiesList', shortcut: 'L', path: '/entities/list', permission: 'MANAGE_ACCOUNTING_ENTITIES' },
      { id: 'create-entity', label: 'menu.entitiesCreate', shortcut: 'C', path: '/entities/new', permission: 'MANAGE_ACCOUNTING_ENTITIES' }
    ]
  },
  {
    id: 'receivers',
    label: 'menu.emailReceivers',
    icon: Email,
    permission: 'MANAGE_EMAIL_RECIPIENTS',
    submenu: [
      { id: 'receivers-list', label: 'menu.erList', shortcut: 'L', path: '/receivers/list', permission: 'MANAGE_EMAIL_RECIPIENTS' },
      { id: 'create-receiver', label: 'menu.erCreate', shortcut: 'C', path: '/receivers/new', permission: 'MANAGE_EMAIL_RECIPIENTS' }
    ]
  },
  { id: 'notifications', label: 'menu.notifications', icon: Chat, path: '/notifications', permission: 'SEND_NOTIFICATIONS' }
];
