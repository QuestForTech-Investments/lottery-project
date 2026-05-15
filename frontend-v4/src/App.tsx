import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy } from 'react'

// Eager load: Login page (first page users see)
import LoginMUI from '@pages/LoginMUI'
import PrivateRoute from '@components/common/PrivateRoute'
import PermissionGuard from '@components/common/PermissionGuard'
import ErrorBoundary from '@components/common/ErrorBoundary'
import MainLayout from '@components/layout/MainLayout'
import LazyRoute from '@components/common/LazyRoute'

const DashboardMUI = lazy(() => import('@pages/DashboardMUI'))

// User feature components
const CreateUserMUI = lazy(() => import('@components/features/users/CreateUser'))
const EditUserMUI = lazy(() => import('@components/features/users/EditUser'))
const UserListMUI = lazy(() => import('@components/features/users/UserList'))
const UsersTabbedMUI = lazy(() => import('@components/features/users/UsersTabbed'))
const UserAdministratorsMUI = lazy(() => import('@components/features/users/UserAdministrators'))
const UserSessionsMUI = lazy(() => import('@components/features/users/UserSessions'))
const UserBlockedSessionsMUI = lazy(() => import('@components/features/users/UserBlockedSessions'))

// Betting Pools feature components
const BettingPoolsListMUI = lazy(() => import('@components/features/betting-pools/BettingPoolsList'))
const CreateBettingPoolMUI = lazy(() => import('@components/features/betting-pools/CreateBettingPool'))
const EditBettingPoolMUI = lazy(() => import('@components/features/betting-pools/EditBettingPool'))
const UserBettingPoolsMUI = lazy(() => import('@components/features/betting-pools/UserBettingPools'))
const MassEditBettingPoolsMUI = lazy(() => import('@components/features/betting-pools/MassEditBettingPools'))
const BettingPoolAccessMUI = lazy(() => import('@components/features/betting-pools/BettingPoolAccess'))
const CleanPendingPaymentsMUI = lazy(() => import('@components/features/betting-pools/CleanPendingPayments'))
const BettingPoolsWithoutSalesMUI = lazy(() => import('@components/features/betting-pools/BettingPoolsWithoutSales'))
const DaysWithoutSalesReportMUI = lazy(() => import('@components/features/betting-pools/DaysWithoutSalesReport'))

// Zones feature components
const ZonesListMUI = lazy(() => import('@components/features/zones/ZonesList'))
const CreateZoneMUI = lazy(() => import('@components/features/zones/CreateZone'))
const EditZoneMUI = lazy(() => import('@components/features/zones/EditZone'))
const ManageZonesMUI = lazy(() => import('@components/features/zones/ManageZones'))

// Tickets feature components
const CreateTicketsMUI = lazy(() => import('@components/features/tickets/CreateTickets'))
const TicketMonitoringMUI = lazy(() => import('@components/features/tickets/TicketMonitoring'))
const ExternalAgentsMonitoringMUI = lazy(() => import('@components/features/tickets/ExternalAgentsMonitoring'))
const PlayMonitoringMUI = lazy(() => import('@components/features/tickets/PlayMonitoring'))
const WinningPlaysMUI = lazy(() => import('@components/features/tickets/WinningPlays'))
const BlackboardMUI = lazy(() => import('@components/features/tickets/Blackboard'))
const ImportedPoolMUI = lazy(() => import('@components/features/tickets/ImportedPool'))
const ExportedPoolMUI = lazy(() => import('@components/features/tickets/ExportedPool'))
const TicketAnomaliesMUI = lazy(() => import('@components/features/tickets/TicketAnomalies'))

// Sales feature components
const DailySalesMUI = lazy(() => import('@components/features/sales/DailySales'))
const HistoricalSalesMUI = lazy(() => import('@components/features/sales/HistoricalSales'))
const SalesByDateMUI = lazy(() => import('@components/features/sales/SalesByDate'))
const PlayTypePrizesMUI = lazy(() => import('@components/features/sales/PlayTypePrizes'))
const PlayTypePrizesPercentagesMUI = lazy(() => import('@components/features/sales/PlayTypePrizesPercentages'))
const BettingPoolSalesMUI = lazy(() => import('@components/features/sales/BettingPoolSales'))
const ZoneSalesMUI = lazy(() => import('@components/features/sales/ZoneSales'))

// Results feature components
const ResultsMUI = lazy(() => import('@components/features/results/Results'))

// Balances feature components
const BettingPoolBalancesMUI = lazy(() => import('@components/features/balances/BettingPoolBalances'))
const BankBalancesMUI = lazy(() => import('@components/features/balances/BankBalances'))
const ZoneBalancesMUI = lazy(() => import('@components/features/balances/ZoneBalances'))
// GroupBalancesMUI removed — BALANCE_GROUPS permission deactivated

// Payments feature components
const CollectionsPaymentsListMUI = lazy(() => import('@components/features/payments/CollectionsPaymentsList'))

// Transactions feature components
const TransactionsListMUI = lazy(() => import('@components/features/transactions/TransactionsList'))
const TransactionsByBettingPoolMUI = lazy(() => import('@components/features/transactions/TransactionsByBettingPool'))
const TransactionGroupsListMUI = lazy(() => import('@components/features/transactions/TransactionGroupsList'))
const TransactionApprovalsMUI = lazy(() => import('@components/features/transactions/TransactionApprovals'))
const TransactionsSummaryMUI = lazy(() => import('@components/features/transactions/TransactionsSummary'))

// Expenses feature components
const ExpenseCategoriesMUI = lazy(() => import('@components/features/expenses/ExpenseCategories'))

// Loans feature components
const CreateLoanMUI = lazy(() => import('@components/features/loans/CreateLoan'))
const LoansListMUI = lazy(() => import('@components/features/loans/LoansList'))

// Excesses feature components
const ManageExcessesMUI = lazy(() => import('@components/features/excesses/ManageExcesses'))
const ExcessesReportMUI = lazy(() => import('@components/features/excesses/ExcessesReport'))

// Limits feature components
const LimitsListMUI = lazy(() => import('@components/features/limits/LimitsList'))
const CreateLimitMUI = lazy(() => import('@components/features/limits/CreateLimit'))
const LimitDefaultsMUI = lazy(() => import('@components/features/limits/LimitDefaults'))
const AutomaticLimitsMUI = lazy(() => import('@components/features/limits/AutomaticLimits'))
const DeleteLimitsMUI = lazy(() => import('@components/features/limits/DeleteLimits'))
const HotNumbersMUI = lazy(() => import('@components/features/limits/HotNumbers'))
const BlockedNumbersMUI = lazy(() => import('@components/features/limits/BlockedNumbersList'))

// Collectors feature components
const DebtCollectorsMUI = lazy(() => import('@components/features/collectors/DebtCollectors'))
const ManageDebtCollectorsMUI = lazy(() => import('@components/features/collectors/ManageDebtCollectors'))

// Draws feature components
const DrawsListMUI = lazy(() => import('@components/features/draws/DrawsList'))
const DrawSchedulesMUI = lazy(() => import('@components/features/draws/DrawSchedules'))

// Accountable Entities feature components
const AccountableEntitiesMUI = lazy(() => import('@components/features/accountable-entities/AccountableEntities'))
const CreateAccountableEntityMUI = lazy(() => import('@components/features/accountable-entities/CreateAccountableEntity'))
const EditAccountableEntityMUI = lazy(() => import('@components/features/accountable-entities/EditAccountableEntity'))

// My Group feature components
const GroupConfigurationMUI = lazy(() => import('@components/features/my-group/GroupConfiguration'))

// Warnings feature components
const WarningsListMUI = lazy(() => import('@components/features/warnings/WarningsList'))

// F8 Monitor feature component
const F8MonitorMUI = lazy(() => import('@components/features/f8/F8Monitor'))

// External Agents feature components
const CreateExternalAgentMUI = lazy(() => import('@components/features/external-agents/CreateExternalAgent'))
const ExternalAgentsListMUI = lazy(() => import('@components/features/external-agents/ExternalAgentsList'))

// Email Receivers feature components
const CreateEmailReceiverMUI = lazy(() => import('@components/features/email-receivers/CreateEmailReceiver'))
const EmailReceiversListMUI = lazy(() => import('@components/features/email-receivers/EmailReceiversList'))

function App() {
  return (
    <>
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Login routes - No lazy loading (first page) */}
            <Route path="/" element={<LoginMUI />} />
            <Route path="/login" element={<LoginMUI />} />

            {/* Dashboard route - With lazy loading and authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <MainLayout>
                      <PermissionGuard permission="ADMIN_DASHBOARD">
                        <LazyRoute component={DashboardMUI} />
                      </PermissionGuard>
                    </MainLayout>
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />

            {/* All other routes - With lazy loading and authentication */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <MainLayout>
                      <Routes>
                          {/* Dashboard */}
                          <Route path="/" element={
                            <PermissionGuard permission="ADMIN_DASHBOARD">
                              <LazyRoute component={DashboardMUI} />
                            </PermissionGuard>
                          } />

                          {/* Users */}
                          <Route path="/users/new" element={
                            <PermissionGuard permission="MANAGE_USERS">
                              <LazyRoute component={CreateUserMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/edit/:userId" element={
                            <PermissionGuard permission="MANAGE_USERS">
                              <LazyRoute component={EditUserMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/list" element={
                            <PermissionGuard permission="MANAGE_USERS">
                              <LazyRoute component={UsersTabbedMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/all" element={
                            <PermissionGuard permission="MANAGE_USERS">
                              <LazyRoute component={UserListMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/betting-pools" element={
                            <PermissionGuard permission="MANAGE_USERS">
                              <LazyRoute component={UserBettingPoolsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/administrators" element={
                            <PermissionGuard permission="MANAGE_USERS">
                              <LazyRoute component={UserAdministratorsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/login-history" element={
                            <PermissionGuard permission="VIEW_LOGIN_SESSIONS">
                              <LazyRoute component={UserSessionsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/users/blocked-sessions" element={
                            <PermissionGuard permission="VIEW_LOGIN_SESSIONS">
                              <LazyRoute component={UserBlockedSessionsMUI} />
                            </PermissionGuard>
                          } />

                          {/* Betting Pools */}
                          <Route path="/betting-pools/list" element={
                            <PermissionGuard permission="BANK_ACCESS">
                              <LazyRoute component={BettingPoolsListMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/betting-pools/new" element={
                            <PermissionGuard permission="CREATE_BANKS">
                              <LazyRoute component={CreateBettingPoolMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/betting-pools/edit/:id" element={
                            <PermissionGuard permission="MANAGE_BANKS">
                              <LazyRoute component={EditBettingPoolMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/betting-pools/mass-edit" element={
                            <PermissionGuard permission="MANAGE_BANKS">
                              <LazyRoute component={MassEditBettingPoolsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/betting-pools/access" element={<LazyRoute component={BettingPoolAccessMUI} />} />
                          <Route path="/betting-pools/clear-pending" element={<LazyRoute component={CleanPendingPaymentsMUI} />} />
                          <Route path="/betting-pools/no-sales" element={
                            <PermissionGuard permission="VIEW_BANKS_NO_SALES">
                              <LazyRoute component={BettingPoolsWithoutSalesMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/betting-pools/days-report" element={
                            <PermissionGuard permission="VIEW_BANKS_NO_SALES">
                              <LazyRoute component={DaysWithoutSalesReportMUI} />
                            </PermissionGuard>
                          } />

                          {/* Tickets */}
                          <Route path="/tickets/new" element={<PermissionGuard permission="SELL_TICKETS"><LazyRoute component={CreateTicketsMUI} /></PermissionGuard>} />
                          <Route path="/tickets/monitoring" element={<PermissionGuard permission="TICKET_MONITORING"><LazyRoute component={TicketMonitoringMUI} /></PermissionGuard>} />
                          <Route path="/tickets/external-agents" element={<LazyRoute component={ExternalAgentsMonitoringMUI} />} />
                          <Route path="/tickets/plays" element={<PermissionGuard permission="TICKET_MONITORING"><LazyRoute component={PlayMonitoringMUI} /></PermissionGuard>} />
                          <Route path="/tickets/winners" element={<PermissionGuard permission="TICKET_MONITORING"><LazyRoute component={WinningPlaysMUI} /></PermissionGuard>} />
                          <Route path="/tickets/board" element={<PermissionGuard permission="TICKET_MONITORING"><LazyRoute component={BlackboardMUI} /></PermissionGuard>} />
                          <Route path="/tickets/imported-pool" element={<LazyRoute component={ImportedPoolMUI} />} />
                          <Route path="/tickets/exported-pool" element={<LazyRoute component={ExportedPoolMUI} />} />
                          <Route path="/tickets/anomalies" element={<PermissionGuard permission="VIEW_ANOMALIES"><LazyRoute component={TicketAnomaliesMUI} /></PermissionGuard>} />

                          {/* Sales */}
                          <Route path="/sales/day" element={<PermissionGuard permission="VIEW_SALES"><LazyRoute component={DailySalesMUI} /></PermissionGuard>} />
                          <Route path="/sales/history" element={<PermissionGuard permission="VIEW_SALES"><LazyRoute component={HistoricalSalesMUI} /></PermissionGuard>} />
                          <Route path="/sales/by-date" element={<PermissionGuard permission="VIEW_SALES"><LazyRoute component={SalesByDateMUI} /></PermissionGuard>} />
                          <Route path="/sales/prizes" element={<PermissionGuard permission="CHANGE_GAME_PRIZES"><LazyRoute component={PlayTypePrizesMUI} /></PermissionGuard>} />
                          <Route path="/sales/percentages" element={<PermissionGuard permission="CHANGE_GAME_PRIZES"><LazyRoute component={PlayTypePrizesPercentagesMUI} /></PermissionGuard>} />
                          <Route path="/sales/betting-pools" element={<PermissionGuard permission="VIEW_SALES"><LazyRoute component={BettingPoolSalesMUI} /></PermissionGuard>} />
                          <Route path="/sales/zones" element={<PermissionGuard permission="VIEW_SALES"><LazyRoute component={ZoneSalesMUI} /></PermissionGuard>} />

                          {/* Zones */}
                          <Route path="/zones/list" element={<LazyRoute component={ZonesListMUI} />} />
                          <Route path="/zones/new" element={<LazyRoute component={CreateZoneMUI} />} />
                          <Route path="/zones/edit/:id" element={<LazyRoute component={EditZoneMUI} />} />
                          <Route path="/zones/manage" element={<LazyRoute component={ManageZonesMUI} />} />

                          {/* Results */}
                          <Route path="/results" element={
                            <PermissionGuard permission={['PUBLISH_TODAY_RESULTS', 'PUBLISH_PAST_RESULTS', 'PUBLISH_RESULTS_QUICK']}>
                              <LazyRoute component={ResultsMUI} />
                            </PermissionGuard>
                          } />

                          {/* Balances */}
                          <Route path="/balances/betting-pools" element={
                            <PermissionGuard permission="BALANCE_BANKS">
                              <LazyRoute component={BettingPoolBalancesMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/balances/banks" element={
                            <PermissionGuard permission="BALANCE_FINANCIAL_BANKS">
                              <LazyRoute component={BankBalancesMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/balances/zones" element={
                            <PermissionGuard permission="BALANCE_ZONES">
                              <LazyRoute component={ZoneBalancesMUI} />
                            </PermissionGuard>
                          } />
                          {/* /balances/groups removed — BALANCE_GROUPS permission deactivated */}

                          {/* Payments */}
                          <Route path="/collections-payments/list" element={
                            <PermissionGuard permission={['CREATE_PAYMENTS', 'CREATE_COLLECTIONS', 'PAYMENTS_COLLECTIONS_QUICK']}>
                              <LazyRoute component={CollectionsPaymentsListMUI} />
                            </PermissionGuard>
                          } />

                          {/* Transactions */}
                          <Route path="/accountable-transactions" element={
                            <PermissionGuard permission="MANAGE_TRANSACTIONS">
                              <LazyRoute component={TransactionsListMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/accountable-transactions/betting-pool" element={
                            <PermissionGuard permission="MANAGE_TRANSACTIONS">
                              <LazyRoute component={TransactionsByBettingPoolMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/accountable-transactions/summary" element={
                            <PermissionGuard permission="MANAGE_TRANSACTIONS">
                              <LazyRoute component={TransactionsSummaryMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/accountable-transactions-groups" element={
                            <PermissionGuard permission="VIEW_ALL_TRANSACTION_GROUPS">
                              <LazyRoute component={TransactionGroupsListMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/accountable-transaction-approvals" element={
                            <PermissionGuard permission="TRANSACTION_APPROVE">
                              <LazyRoute component={TransactionApprovalsMUI} />
                            </PermissionGuard>
                          } />

                          {/* Expenses */}
                          <Route path="/expenses/categories" element={
                            <PermissionGuard permission="CREATE_EXPENSE_CATEGORIES">
                              <LazyRoute component={ExpenseCategoriesMUI} />
                            </PermissionGuard>
                          } />

                          {/* Loans */}
                          <Route path="/loans/new" element={
                            <PermissionGuard permission="MANAGE_LOANS">
                              <LazyRoute component={CreateLoanMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/loans/list" element={
                            <PermissionGuard permission="MANAGE_LOANS">
                              <LazyRoute component={LoansListMUI} />
                            </PermissionGuard>
                          } />

                          {/* Surpluses */}
                          <Route path="/surpluses/manage" element={<LazyRoute component={ManageExcessesMUI} />} />
                          <Route path="/surpluses/report" element={<LazyRoute component={ExcessesReportMUI} />} />

                          {/* Limits */}
                          <Route path="/limits/list" element={
                            <PermissionGuard permission="MANAGE_LIMITS">
                              <LazyRoute component={LimitsListMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/limits/new" element={
                            <PermissionGuard permission="MANAGE_LIMITS">
                              <LazyRoute component={CreateLimitMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/limits/defaults" element={
                            <PermissionGuard permission="MANAGE_LIMIT_DEFAULTS">
                              <LazyRoute component={LimitDefaultsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/limits/automatic" element={
                            <PermissionGuard permission="MANAGE_AUTOMATIC_LIMITS">
                              <LazyRoute component={AutomaticLimitsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/limits/delete" element={
                            <PermissionGuard permission="MANAGE_LIMITS">
                              <LazyRoute component={DeleteLimitsMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/limits/hot-numbers" element={
                            <PermissionGuard permission="MANAGE_HOT_NUMBERS">
                              <LazyRoute component={HotNumbersMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/limits/blocked-numbers" element={
                            <PermissionGuard permission="MANAGE_BLOCKED_NUMBERS">
                              <LazyRoute component={BlockedNumbersMUI} />
                            </PermissionGuard>
                          } />

                          {/* Collectors */}
                          <Route path="/collectors" element={<LazyRoute component={DebtCollectorsMUI} />} />
                          <Route path="/collector-management" element={<LazyRoute component={ManageDebtCollectorsMUI} />} />

                          {/* Draws */}
                          <Route path="/draws/list" element={
                            <PermissionGuard permission="MANAGE_DRAWS">
                              <LazyRoute component={DrawsListMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/draws/schedules" element={
                            <PermissionGuard permission="MANAGE_DRAW_SCHEDULES">
                              <LazyRoute component={DrawSchedulesMUI} />
                            </PermissionGuard>
                          } />

                          {/* Entities */}
                          <Route path="/entities/list" element={<LazyRoute component={AccountableEntitiesMUI} />} />
                          <Route path="/entities/new" element={<LazyRoute component={CreateAccountableEntityMUI} />} />
                          <Route path="/entities/edit/:id" element={<LazyRoute component={EditAccountableEntityMUI} />} />

                          {/* Configuration */}
                          <Route path="/my-group/configuration" element={
                            <PermissionGuard permission="MANAGE_MY_GROUP">
                              <LazyRoute component={GroupConfigurationMUI} />
                            </PermissionGuard>
                          } />

                          {/* Warnings */}
                          <Route path="/warnings" element={<LazyRoute component={WarningsListMUI} />} />

                          {/* Monitoring */}
                          <Route path="/f8" element={<LazyRoute component={F8MonitorMUI} />} />

                          {/* External Agents */}
                          <Route path="/external-agents/new" element={<LazyRoute component={CreateExternalAgentMUI} />} />
                          <Route path="/external-agents/list" element={<LazyRoute component={ExternalAgentsListMUI} />} />

                          {/* Email Receivers */}
                          <Route path="/receivers/new" element={
                            <PermissionGuard permission="MANAGE_EMAIL_RECIPIENTS">
                              <LazyRoute component={CreateEmailReceiverMUI} />
                            </PermissionGuard>
                          } />
                          <Route path="/receivers/list" element={
                            <PermissionGuard permission="MANAGE_EMAIL_RECIPIENTS">
                              <LazyRoute component={EmailReceiversListMUI} />
                            </PermissionGuard>
                          } />
                        </Routes>
                      </MainLayout>
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ErrorBoundary>
    </>
  )
}

export default App

