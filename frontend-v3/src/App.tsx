/**
 * App Component
 * Main application component with routing and providers
 * Cloned from frontend-v2 with TypeScript typing
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { theme } from '@/theme';

// Eager load: Login page (first page users see)
import LoginMUI from '@/pages/LoginMUI';
import DashboardMUI from '@/pages/DashboardMUI';
import MainLayout from '@/components/layout/MainLayout';
import PrivateRoute from '@/components/auth/PrivateRoute';

// Lazy load: User feature components
const UserListMUI = lazy(() => import('@/components/features/users/UserList'));
const CreateUserMUI = lazy(() => import('@/components/features/users/CreateUser'));
const EditUserMUI = lazy(() => import('@/components/features/users/EditUser'));
const UserAdministratorsMUI = lazy(() => import('@/components/features/users/UserAdministrators'));
const UserSessionsMUI = lazy(() => import('@/components/features/users/UserSessions'));
const UserBlockedSessionsMUI = lazy(() => import('@/components/features/users/UserBlockedSessions'));
const UserBettingPoolsMUI = lazy(() => import('@/components/features/betting-pools/UserBettingPools'));

// Lazy load: Betting Pools feature components
const BettingPoolsListMUI = lazy(() => import('@/components/features/betting-pools/BettingPoolsList'));
const CreateBettingPoolMUI = lazy(() => import('@/components/features/betting-pools/CreateBettingPool'));
const EditBettingPoolMUI = lazy(() => import('@/components/features/betting-pools/EditBettingPool'));

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%',
    }}
  >
    <CircularProgress size={40} sx={{ color: '#4dd4d4' }} />
  </Box>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Login routes - No lazy loading (first page) */}
          <Route path="/" element={<LoginMUI />} />
          <Route path="/login" element={<LoginMUI />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout>
                  <DashboardMUI />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* User Management Routes */}
          <Route
            path="/users/list"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UserListMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CreateUserMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/edit/:userId"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <EditUserMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/administrators"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UserAdministratorsMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/login-history"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UserSessionsMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/blocked-sessions"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UserBlockedSessionsMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users/betting-pools"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UserBettingPoolsMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Betting Pools Management Routes */}
          <Route
            path="/betting-pools/list"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <BettingPoolsListMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/betting-pools/new"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CreateBettingPoolMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/betting-pools/edit/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <EditBettingPoolMUI />
                  </Suspense>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
