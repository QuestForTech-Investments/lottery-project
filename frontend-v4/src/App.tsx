import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy } from 'react'

// Eager load: Login page (first page users see)
import LoginMUI from '@pages/LoginMUI'
import DebugPanel from '@components/common/DebugPanel'
import PrivateRoute from '@components/common/PrivateRoute'
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
const GroupBalancesMUI = lazy(() => import('@components/features/balances/GroupBalances'))

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
const AutomaticLimitsMUI = lazy(() => import('@components/features/limits/AutomaticLimits'))
const DeleteLimitsMUI = lazy(() => import('@components/features/limits/DeleteLimits'))
const HotNumbersMUI = lazy(() => import('@components/features/limits/HotNumbers'))

// Collectors feature components
const DebtCollectorsMUI = lazy(() => import('@components/features/collectors/DebtCollectors'))
const ManageDebtCollectorsMUI = lazy(() => import('@components/features/collectors/ManageDebtCollectors'))

// Draws feature components
const DrawsListMUI = lazy(() => import('@components/features/draws/DrawsList'))
const DrawSchedulesMUI = lazy(() => import('@components/features/draws/DrawSchedules'))

// Accountable Entities feature components
const AccountableEntitiesMUI = lazy(() => import('@components/features/accountable-entities/AccountableEntities'))
const CreateAccountableEntityMUI = lazy(() => import('@components/features/accountable-entities/CreateAccountableEntity'))

// My Group feature components
const GroupConfigurationMUI = lazy(() => import('@components/features/my-group/GroupConfiguration'))

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
      <DebugPanel />
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
                      <LazyRoute component={DashboardMUI} />
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
                          <Route path="/" element={<LazyRoute component={DashboardMUI} />} />

                          {/* Users */}
                          <Route path="/users/new" element={<LazyRoute component={CreateUserMUI} />} />
                          <Route path="/users/edit/:userId" element={<LazyRoute component={EditUserMUI} />} />
                          <Route path="/users/list" element={<LazyRoute component={UsersTabbedMUI} />} />
                          <Route path="/users/all" element={<LazyRoute component={UserListMUI} />} />
                          <Route path="/users/betting-pools" element={<LazyRoute component={UserBettingPoolsMUI} />} />
                          <Route path="/users/administrators" element={<LazyRoute component={UserAdministratorsMUI} />} />
                          <Route path="/users/login-history" element={<LazyRoute component={UserSessionsMUI} />} />
                          <Route path="/users/blocked-sessions" element={<LazyRoute component={UserBlockedSessionsMUI} />} />

                          {/* Betting Pools */}
                          <Route path="/betting-pools/list" element={<LazyRoute component={BettingPoolsListMUI} />} />
                          <Route path="/betting-pools/new" element={<LazyRoute component={CreateBettingPoolMUI} />} />
                          <Route path="/betting-pools/edit/:id" element={<LazyRoute component={EditBettingPoolMUI} />} />
                          <Route path="/betting-pools/mass-edit" element={<LazyRoute component={MassEditBettingPoolsMUI} />} />
                          <Route path="/betting-pools/access" element={<LazyRoute component={BettingPoolAccessMUI} />} />
                          <Route path="/betting-pools/clear-pending" element={<LazyRoute component={CleanPendingPaymentsMUI} />} />
                          <Route path="/betting-pools/no-sales" element={<LazyRoute component={BettingPoolsWithoutSalesMUI} />} />
                          <Route path="/betting-pools/days-report" element={<LazyRoute component={DaysWithoutSalesReportMUI} />} />

                          {/* Tickets */}
                          <Route path="/tickets/new" element={<LazyRoute component={CreateTicketsMUI} />} />
                          <Route path="/tickets/monitoring" element={<LazyRoute component={TicketMonitoringMUI} />} />
                          <Route path="/tickets/external-agents" element={<LazyRoute component={ExternalAgentsMonitoringMUI} />} />
                          <Route path="/tickets/plays" element={<LazyRoute component={PlayMonitoringMUI} />} />
                          <Route path="/tickets/winners" element={<LazyRoute component={WinningPlaysMUI} />} />
                          <Route path="/tickets/board" element={<LazyRoute component={BlackboardMUI} />} />
                          <Route path="/tickets/imported-pool" element={<LazyRoute component={ImportedPoolMUI} />} />
                          <Route path="/tickets/exported-pool" element={<LazyRoute component={ExportedPoolMUI} />} />
                          <Route path="/tickets/anomalies" element={<LazyRoute component={TicketAnomaliesMUI} />} />

                          {/* Sales */}
                          <Route path="/sales/day" element={<LazyRoute component={DailySalesMUI} />} />
                          <Route path="/sales/history" element={<LazyRoute component={HistoricalSalesMUI} />} />
                          <Route path="/sales/by-date" element={<LazyRoute component={SalesByDateMUI} />} />
                          <Route path="/sales/prizes" element={<LazyRoute component={PlayTypePrizesMUI} />} />
                          <Route path="/sales/percentages" element={<LazyRoute component={PlayTypePrizesPercentagesMUI} />} />
                          <Route path="/sales/betting-pools" element={<LazyRoute component={BettingPoolSalesMUI} />} />
                          <Route path="/sales/zones" element={<LazyRoute component={ZoneSalesMUI} />} />

                          {/* Zones */}
                          <Route path="/zones/list" element={<LazyRoute component={ZonesListMUI} />} />
                          <Route path="/zones/new" element={<LazyRoute component={CreateZoneMUI} />} />
                          <Route path="/zones/edit/:id" element={<LazyRoute component={EditZoneMUI} />} />
                          <Route path="/zones/manage" element={<LazyRoute component={ManageZonesMUI} />} />

                          {/* Results */}
                          <Route path="/results" element={<LazyRoute component={ResultsMUI} />} />

                          {/* Balances */}
                          <Route path="/balances/betting-pools" element={<LazyRoute component={BettingPoolBalancesMUI} />} />
                          <Route path="/balances/banks" element={<LazyRoute component={BankBalancesMUI} />} />
                          <Route path="/balances/zones" element={<LazyRoute component={ZoneBalancesMUI} />} />
                          <Route path="/balances/groups" element={<LazyRoute component={GroupBalancesMUI} />} />

                          {/* Payments */}
                          <Route path="/collections-payments/list" element={<LazyRoute component={CollectionsPaymentsListMUI} />} />

                          {/* Transactions */}
                          <Route path="/accountable-transactions" element={<LazyRoute component={TransactionsListMUI} />} />
                          <Route path="/accountable-transactions/betting-pool" element={<LazyRoute component={TransactionsByBettingPoolMUI} />} />
                          <Route path="/accountable-transactions/summary" element={<LazyRoute component={TransactionsSummaryMUI} />} />
                          <Route path="/accountable-transactions-groups" element={<LazyRoute component={TransactionGroupsListMUI} />} />
                          <Route path="/accountable-transaction-approvals" element={<LazyRoute component={TransactionApprovalsMUI} />} />

                          {/* Expenses */}
                          <Route path="/expenses/categories" element={<LazyRoute component={ExpenseCategoriesMUI} />} />

                          {/* Loans */}
                          <Route path="/loans/new" element={<LazyRoute component={CreateLoanMUI} />} />
                          <Route path="/loans/list" element={<LazyRoute component={LoansListMUI} />} />

                          {/* Surpluses */}
                          <Route path="/surpluses/manage" element={<LazyRoute component={ManageExcessesMUI} />} />
                          <Route path="/surpluses/report" element={<LazyRoute component={ExcessesReportMUI} />} />

                          {/* Limits */}
                          <Route path="/limits/list" element={<LazyRoute component={LimitsListMUI} />} />
                          <Route path="/limits/new" element={<LazyRoute component={CreateLimitMUI} />} />
                          <Route path="/limits/automatic" element={<LazyRoute component={AutomaticLimitsMUI} />} />
                          <Route path="/limits/delete" element={<LazyRoute component={DeleteLimitsMUI} />} />
                          <Route path="/limits/hot-numbers" element={<LazyRoute component={HotNumbersMUI} />} />

                          {/* Collectors */}
                          <Route path="/collectors" element={<LazyRoute component={DebtCollectorsMUI} />} />
                          <Route path="/collector-management" element={<LazyRoute component={ManageDebtCollectorsMUI} />} />

                          {/* Draws */}
                          <Route path="/draws/list" element={<LazyRoute component={DrawsListMUI} />} />
                          <Route path="/draws/schedules" element={<LazyRoute component={DrawSchedulesMUI} />} />

                          {/* Entities */}
                          <Route path="/entities/list" element={<LazyRoute component={AccountableEntitiesMUI} />} />
                          <Route path="/entities/new" element={<LazyRoute component={CreateAccountableEntityMUI} />} />

                          {/* Configuration */}
                          <Route path="/my-group/configuration" element={<LazyRoute component={GroupConfigurationMUI} />} />

                          {/* Monitoring */}
                          <Route path="/f8" element={<LazyRoute component={F8MonitorMUI} />} />

                          {/* External Agents */}
                          <Route path="/external-agents/new" element={<LazyRoute component={CreateExternalAgentMUI} />} />
                          <Route path="/external-agents/list" element={<LazyRoute component={ExternalAgentsListMUI} />} />

                          {/* Email Receivers */}
                          <Route path="/receivers/new" element={<LazyRoute component={CreateEmailReceiverMUI} />} />
                          <Route path="/receivers/list" element={<LazyRoute component={EmailReceiversListMUI} />} />
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

