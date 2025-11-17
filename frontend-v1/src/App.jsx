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
                <Route path="/bancas/reporte-dias-sin-venta" element={<DaysWithoutSalesReport />} />
                <Route path="/tickets/crear" element={<CreateTickets />} />
                <Route path="/usuarios/administradores" element={<UserAdministradores />} />
                <Route path="/usuarios/inicios-sesion" element={<UserIniciosSesion />} />
                <Route path="/usuarios/sesiones-bloqueadas" element={<UserSesionesBloqueadas />} />
                <Route path="/zones/list" element={<ZonesList />} />
                <Route path="/zones/new" element={<CreateZone />} />
                <Route path="/zones/edit/:id" element={<EditZone />} />
                <Route path="/zones/manage" element={<ManageZones />} />
                <Route path="/sorteos/lista" element={<SorteosList />} />
                <Route path="/sorteos/crear" element={<CreateSorteo />} />
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

