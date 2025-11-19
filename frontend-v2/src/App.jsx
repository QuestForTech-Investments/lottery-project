import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Eager load: Login page (first page users see)
import LoginMUI from '@pages/LoginMUI'
import DebugPanel from '@components/common/DebugPanel'
import PrivateRoute from '@components/common/PrivateRoute'
import ErrorBoundary from '@components/common/ErrorBoundary'
import MainLayout from '@components/layout/MainLayout'

// Lazy load: Everything else
import LazyLoadingFallback from '@components/common/LazyLoadingFallback'

const DashboardMUI = lazy(() => import('@pages/DashboardMUI'))

// User feature components
const CreateUserMUI = lazy(() => import('@components/features/users/CreateUser'))
const EditUserMUI = lazy(() => import('@components/features/users/EditUser'))
const UserListMUI = lazy(() => import('@components/features/users/UserList'))
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
                      <DashboardMUI />
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
                          <Route path="/" element={<DashboardMUI />} />
                          <Route path="/users/new" element={<CreateUserMUI />} />
                          <Route path="/users/edit/:userId" element={<EditUserMUI />} />
                          <Route path="/users/list" element={<UserListMUI />} />
                          <Route path="/users/betting-pools" element={<UserBettingPoolsMUI />} />
                          <Route path="/betting-pools/list" element={<BettingPoolsListMUI />} />
                          <Route path="/betting-pools/new" element={<CreateBettingPoolMUI />} />
                          <Route path="/betting-pools/edit/:id" element={<EditBettingPoolMUI />} />
                          <Route path="/betting-pools/mass-edit" element={<MassEditBettingPoolsMUI />} />
                          <Route path="/betting-pools/access" element={<BettingPoolAccessMUI />} />
                          <Route path="/betting-pools/clear-pending" element={<CleanPendingPaymentsMUI />} />
                          <Route path="/betting-pools/no-sales" element={<BettingPoolsWithoutSalesMUI />} />
                          <Route path="/betting-pools/days-report" element={<DaysWithoutSalesReportMUI />} />
                          <Route path="/tickets/new" element={<CreateTicketsMUI />} />
                          <Route path="/tickets/monitoring" element={<TicketMonitoringMUI />} />
                          <Route path="/tickets/external-agents" element={<ExternalAgentsMonitoringMUI />} />
                          <Route path="/tickets/plays" element={<PlayMonitoringMUI />} />
                          <Route path="/tickets/winners" element={<WinningPlaysMUI />} />
                          <Route path="/tickets/board" element={<BlackboardMUI />} />
                          <Route path="/tickets/imported-pool" element={<ImportedPoolMUI />} />
                          <Route path="/tickets/exported-pool" element={<ExportedPoolMUI />} />
                          <Route path="/tickets/anomalies" element={<TicketAnomaliesMUI />} />
                          <Route path="/sales/day" element={<DailySalesMUI />} />
                          <Route path="/sales/history" element={<HistoricalSalesMUI />} />
                          <Route path="/sales/by-date" element={<SalesByDateMUI />} />
                          <Route path="/sales/prizes" element={<PlayTypePrizesMUI />} />
                          <Route path="/sales/percentages" element={<PlayTypePrizesPercentagesMUI />} />
                          <Route path="/sales/betting-pools" element={<BettingPoolSalesMUI />} />
                          <Route path="/sales/zones" element={<ZoneSalesMUI />} />
                          <Route path="/users/administrators" element={<UserAdministratorsMUI />} />
                          <Route path="/users/login-history" element={<UserSessionsMUI />} />
                          <Route path="/users/blocked-sessions" element={<UserBlockedSessionsMUI />} />
                          <Route path="/zones/list" element={<ZonesListMUI />} />
                          <Route path="/zones/new" element={<CreateZoneMUI />} />
                          <Route path="/zones/edit/:id" element={<EditZoneMUI />} />
                          <Route path="/zones/manage" element={<ManageZonesMUI />} />
                          <Route path="/results" element={<ResultsMUI />} />
                          <Route path="/balances/betting-pools" element={<BettingPoolBalancesMUI />} />
                          <Route path="/balances/banks" element={<BankBalancesMUI />} />
                          <Route path="/balances/zones" element={<ZoneBalancesMUI />} />
                          <Route path="/balances/groups" element={<GroupBalancesMUI />} />
                          <Route path="/collections-payments/list" element={<CollectionsPaymentsListMUI />} />
                          <Route path="/accountable-transactions" element={<Suspense fallback={<LazyLoadingFallback />}><TransactionsListMUI /></Suspense>} />
                          <Route path="/accountable-transactions/betting-pool" element={<Suspense fallback={<LazyLoadingFallback />}><TransactionsByBettingPoolMUI /></Suspense>} />
                          <Route path="/accountable-transactions/summary" element={<Suspense fallback={<LazyLoadingFallback />}><TransactionsSummaryMUI /></Suspense>} />
                          <Route path="/accountable-transactions-groups" element={<Suspense fallback={<LazyLoadingFallback />}><TransactionGroupsListMUI /></Suspense>} />
                          <Route path="/accountable-transaction-approvals" element={<Suspense fallback={<LazyLoadingFallback />}><TransactionApprovalsMUI /></Suspense>} />
                          <Route path="/expenses/categories" element={<Suspense fallback={<LazyLoadingFallback />}><ExpenseCategoriesMUI /></Suspense>} />
                          <Route path="/loans/new" element={<Suspense fallback={<LazyLoadingFallback />}><CreateLoanMUI /></Suspense>} />
                          <Route path="/loans/list" element={<Suspense fallback={<LazyLoadingFallback />}><LoansListMUI /></Suspense>} />
                          <Route path="/surpluses/manage" element={<Suspense fallback={<LazyLoadingFallback />}><ManageExcessesMUI /></Suspense>} />
                          <Route path="/surpluses/report" element={<Suspense fallback={<LazyLoadingFallback />}><ExcessesReportMUI /></Suspense>} />
                          <Route path="/limits/list" element={<Suspense fallback={<LazyLoadingFallback />}><LimitsListMUI /></Suspense>} />
                          <Route path="/limits/new" element={<Suspense fallback={<LazyLoadingFallback />}><CreateLimitMUI /></Suspense>} />
                          <Route path="/limits/automatic" element={<Suspense fallback={<LazyLoadingFallback />}><AutomaticLimitsMUI /></Suspense>} />
                          <Route path="/limits/delete" element={<Suspense fallback={<LazyLoadingFallback />}><DeleteLimitsMUI /></Suspense>} />
                          <Route path="/limits/hot-numbers" element={<Suspense fallback={<LazyLoadingFallback />}><HotNumbersMUI /></Suspense>} />
                          <Route path="/collectors" element={<Suspense fallback={<LazyLoadingFallback />}><DebtCollectorsMUI /></Suspense>} />
                          <Route path="/collector-management" element={<Suspense fallback={<LazyLoadingFallback />}><ManageDebtCollectorsMUI /></Suspense>} />
                          <Route path="/draws/list" element={<Suspense fallback={<LazyLoadingFallback />}><DrawsListMUI /></Suspense>} />
                          <Route path="/draws/schedules" element={<Suspense fallback={<LazyLoadingFallback />}><DrawSchedulesMUI /></Suspense>} />
                          <Route path="/entities/list" element={<Suspense fallback={<LazyLoadingFallback />}><AccountableEntitiesMUI /></Suspense>} />
                          <Route path="/entities/new" element={<Suspense fallback={<LazyLoadingFallback />}><CreateAccountableEntityMUI /></Suspense>} />
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

