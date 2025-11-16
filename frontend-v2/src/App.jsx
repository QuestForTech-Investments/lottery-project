import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Eager load: Login page (first page users see)
import LoginMUI from '@pages/LoginMUI'
import DebugPanel from '@components/common/DebugPanel'
import PrivateRoute from '@components/common/PrivateRoute'
import ErrorBoundary from '@components/common/ErrorBoundary'

// Lazy load: Everything else
import LazyLoadingFallback from '@components/common/LazyLoadingFallback'

const MainLayout = lazy(() => import('@components/layout/MainLayout'))
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

// Zones feature components
const ZonesListMUI = lazy(() => import('@components/features/zones/ZonesList'))
const CreateZoneMUI = lazy(() => import('@components/features/zones/CreateZone'))
const EditZoneMUI = lazy(() => import('@components/features/zones/EditZone'))
const ManageZonesMUI = lazy(() => import('@components/features/zones/ManageZones'))

// Tickets feature components
const CreateTicketsMUI = lazy(() => import('@components/features/tickets/CreateTickets'))

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
                    <Suspense fallback={<LazyLoadingFallback />}>
                      <MainLayout>
                        <DashboardMUI />
                      </MainLayout>
                    </Suspense>
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
                    <Suspense fallback={<LazyLoadingFallback />}>
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
                          <Route path="/tickets/new" element={<CreateTicketsMUI />} />
                          <Route path="/users/administrators" element={<UserAdministratorsMUI />} />
                          <Route path="/users/login-history" element={<UserSessionsMUI />} />
                          <Route path="/users/blocked-sessions" element={<UserBlockedSessionsMUI />} />
                          <Route path="/zones/list" element={<ZonesListMUI />} />
                          <Route path="/zones/new" element={<CreateZoneMUI />} />
                          <Route path="/zones/edit/:id" element={<EditZoneMUI />} />
                          <Route path="/zones/manage" element={<ManageZonesMUI />} />
                        </Routes>
                      </MainLayout>
                    </Suspense>
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

