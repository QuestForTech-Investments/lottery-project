import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from '@components/layout/MainLayout'
import Dashboard from '@pages/Dashboard'
import Login from '@pages/Login'
import CreateUser from '@components/CreateUser'
import UserList from '@components/UserList'
import UserBancas from '@components/UserBancas'
import BancasList from '@components/BancasList'
import CreateBanca from '@components/CreateBanca'
import CreateTickets from '@components/CreateTickets'
import TicketMonitoring from '@components/TicketMonitoring'
import ExternalAgentsMonitoring from '@components/ExternalAgentsMonitoring'
import PlayMonitoring from '@components/PlayMonitoring'
import WinningPlays from '@components/WinningPlays'
import Blackboard from '@components/Blackboard'
import ImportedPool from '@components/ImportedPool'
import ExportedPool from '@components/ExportedPool'
import TicketAnomalies from '@components/TicketAnomalies'
import EditBanca from '@components/EditBanca'
import MassEditBancas from '@components/MassEditBancas'
import BancaAccess from '@components/BancaAccess'
import CleanPendingPayments from '@components/CleanPendingPayments'
import BettingPoolsWithoutSales from '@components/BettingPoolsWithoutSales'
import DaysWithoutSalesReport from '@components/DaysWithoutSalesReport'
import UserAdministradores from '@components/UserAdministradores'
import UserIniciosSesion from '@components/UserIniciosSesion'
import UserSesionesBloqueadas from '@components/UserSesionesBloqueadas'
import DebugPanel from '@components/common/DebugPanel'
import PrivateRoute from '@components/common/PrivateRoute'
import TestPermissions from '@components/TestPermissions'
import EditUser from '@components/EditUser'
import TestMultiZone from '@components/TestMultiZone'
import TestReactMultiselect from '@components/TestReactMultiselect'
import TestToggleBranch from '@components/TestToggleBranch'
import ZonesList from '@components/ZonesList'
import CreateZone from '@components/CreateZone'
import EditZone from '@components/EditZone'
import ManageZones from '@components/ManageZones'
import SorteosList from '@components/SorteosList'
import CreateSorteo from '@components/CreateSorteo'
import DailySales from '@components/DailySales'
import HistoricalSales from '@components/HistoricalSales'
import SalesByDate from '@components/SalesByDate'
import PlayTypePrizes from '@components/PlayTypePrizes'
import PlayTypePrizesPercentages from '@components/PlayTypePrizesPercentages'
import BettingPoolSales from '@components/BettingPoolSales'
import ZoneSales from '@components/ZoneSales'
import Results from '@components/Results'
import BettingPoolBalances from '@components/balances/BettingPoolBalances'
import BankBalances from '@components/balances/BankBalances'
import ZoneBalances from '@components/balances/ZoneBalances'
import GroupBalances from '@components/balances/GroupBalances'
import CollectionsPaymentsList from '@components/CollectionsPaymentsList'
import TransactionsList from '@components/transactions/TransactionsList'
import TransactionsByBettingPool from '@components/transactions/TransactionsByBettingPool'
import TransactionGroupsList from '@components/transactions/TransactionGroupsList'
import TransactionApprovals from '@components/transactions/TransactionApprovals'
import TransactionsSummary from '@components/transactions/TransactionsSummary'
import ExpenseCategories from '@components/expenses/ExpenseCategories'
import CreateLoan from '@components/loans/CreateLoan'
import LoansList from '@components/loans/LoansList'
import ManageExcesses from '@components/excedentes/ManageExcesses'
import ExcessesReport from '@components/excedentes/ExcessesReport'
import LimitsList from '@components/limites/LimitsList'
import CreateLimit from '@components/limites/CreateLimit'
import AutomaticLimits from '@components/limites/AutomaticLimits'
import DeleteLimits from '@components/limites/DeleteLimits'
import HotNumbers from '@components/limites/HotNumbers'
import DebtCollectors from '@components/collectors/DebtCollectors'
import ManageDebtCollectors from '@components/collectors/ManageDebtCollectors'
import DrawsList from '@components/sorteos/DrawsList'
import DrawSchedules from '@components/sorteos/DrawSchedules'

function App() {
  return (
    <>
      <DebugPanel />
      <Router>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard route */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        } />

        {/* Protected internal routes */}
        <Route path="/*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/usuarios/crear" element={<CreateUser />} />
                <Route path="/usuarios/editar/:userId" element={<EditUser />} />
                <Route path="/usuarios/lista" element={<UserList />} />
                <Route path="/usuarios/bancas" element={<UserBancas />} />
                <Route path="/bancas/lista" element={<BancasList />} />
                <Route path="/bancas/crear" element={<CreateBanca />} />
                <Route path="/bancas/editar/:id" element={<EditBanca />} />
                <Route path="/bancas/edicion-masiva" element={<MassEditBancas />} />
                <Route path="/bancas/acceso" element={<BancaAccess />} />
                <Route path="/bancas/limpiar-pendientes" element={<CleanPendingPayments />} />
                <Route path="/bancas/sin-ventas" element={<BettingPoolsWithoutSales />} />
                <Route path="/bancas/reporte-dias" element={<DaysWithoutSalesReport />} />
                <Route path="/tickets/crear" element={<CreateTickets />} />
                <Route path="/tickets/monitoreo" element={<TicketMonitoring />} />
                <Route path="/tickets/agentes-externos" element={<ExternalAgentsMonitoring />} />
                <Route path="/tickets/jugadas" element={<PlayMonitoring />} />
                <Route path="/tickets/ganadoras" element={<WinningPlays />} />
                <Route path="/tickets/pizarra" element={<Blackboard />} />
                <Route path="/tickets/bote-importado" element={<ImportedPool />} />
                <Route path="/tickets/bote-exportado" element={<ExportedPool />} />
                <Route path="/tickets/anomalias" element={<TicketAnomalies />} />
                <Route path="/usuarios/administradores" element={<UserAdministradores />} />
                <Route path="/usuarios/inicios-sesion" element={<UserIniciosSesion />} />
                <Route path="/usuarios/sesiones-bloqueadas" element={<UserSesionesBloqueadas />} />
                <Route path="/zones/list" element={<ZonesList />} />
                <Route path="/zones/new" element={<CreateZone />} />
                <Route path="/zones/edit/:id" element={<EditZone />} />
                <Route path="/zones/manage" element={<ManageZones />} />
                <Route path="/sorteos/lista" element={<SorteosList />} />
                <Route path="/sorteos/crear" element={<CreateSorteo />} />
                <Route path="/ventas/dia" element={<DailySales />} />
                <Route path="/ventas/historico" element={<HistoricalSales />} />
                <Route path="/ventas/por-fecha" element={<SalesByDate />} />
                <Route path="/ventas/premios-jugada" element={<PlayTypePrizes />} />
                <Route path="/ventas/porcentajes" element={<PlayTypePrizesPercentages />} />
                <Route path="/ventas/banca" element={<BettingPoolSales />} />
                <Route path="/ventas/zona" element={<ZoneSales />} />
                <Route path="/resultados" element={<Results />} />
                <Route path="/balances/bancas" element={<BettingPoolBalances />} />
                <Route path="/balances/bancos" element={<BankBalances />} />
                <Route path="/balances/zonas" element={<ZoneBalances />} />
                <Route path="/balances/grupos" element={<GroupBalances />} />
                <Route path="/cobros-pagos/lista" element={<CollectionsPaymentsList />} />
                <Route path="/accountable-transactions" element={<TransactionsList />} />
                <Route path="/accountable-transactions/betting-pool" element={<TransactionsByBettingPool />} />
                <Route path="/accountable-transactions/summary" element={<TransactionsSummary />} />
                <Route path="/accountable-transactions-groups" element={<TransactionGroupsList />} />
                <Route path="/accountable-transaction-approvals" element={<TransactionApprovals />} />
                <Route path="/expenses/categories" element={<ExpenseCategories />} />
                <Route path="/prestamos/crear" element={<CreateLoan />} />
                <Route path="/prestamos/lista" element={<LoansList />} />
                <Route path="/excedentes/manejar" element={<ManageExcesses />} />
                <Route path="/excedentes/reporte" element={<ExcessesReport />} />
                <Route path="/limites/lista" element={<LimitsList />} />
                <Route path="/limites/crear" element={<CreateLimit />} />
                <Route path="/limites/automaticos" element={<AutomaticLimits />} />
                <Route path="/limites/eliminar" element={<DeleteLimits />} />
                <Route path="/limites/numeros-calientes" element={<HotNumbers />} />
                <Route path="/cobradores" element={<DebtCollectors />} />
                <Route path="/manejo-cobradores" element={<ManageDebtCollectors />} />
                <Route path="/sorteos/lista" element={<DrawsList />} />
                <Route path="/sorteos/horarios" element={<DrawSchedules />} />
                <Route path="/test/permissions" element={<TestPermissions />} />
                <Route path="/test/multi-zone" element={<TestMultiZone />} />
                <Route path="/test/react-multiselect" element={<TestReactMultiselect />} />
                <Route path="/test/toggle-branch" element={<TestToggleBranch />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
    </>
  )
}

export default App

