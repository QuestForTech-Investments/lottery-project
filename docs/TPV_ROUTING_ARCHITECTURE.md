# TPV Routing Architecture

## Overview

This document describes how the original Vue.js lottery application handles user routing based on user type (admin vs betting pool users).

**Key Finding:** The TPV (Terminal Punto de Venta) is **NOT** a separate application. It's the **same SPA** with different routes/layouts based on user type.

---

## Route Structure

```
https://la-numbers.apk.lol/
├── #/dashboard/*          → MainLayout (admin/central users)
├── #/betting-pool/*       → BettingPoolLayout (TPV - betting pool users)
├── #/personal/*           → PersonalClientLayout (personal clients)
├── #/sessions/new         → Login
├── #/personal/sessions/new → PersonalClientLogin
├── #/password/reset       → PasswordReset
├── #/apk                  → APK Download
└── #/404                  → NotFound
```

---

## TPV Routes (`/betting-pool`)

The TPV has a simplified interface with only 3 main features:

| Route | Component | Description |
|-------|-----------|-------------|
| `/betting-pool/ticket/create` | BettingPoolTicketCreate | Create/sell tickets |
| `/betting-pool/play-monitor` | BettingPoolPlayMonitor | Monitor bets/plays |
| `/betting-pool/historical-sale` | BettingPoolHistoricalSale | View sales history |

---

## User Type Determination

### JWT Token Structure

```javascript
// Admin User (oliver)
{
  "deviceType": 1,                    // 1 = Web Admin
  "bettingPool": null,                // null = no betting pool (admin)
  "privileges": [1, 2, 5, 6, ...],    // 60+ permissions
  "noAccessToOtherBettingPools": false,
  "groupId": 16,
  "userId": 78759,
  "username": "oliver",
  "timeZone": "America/New_York"
}

// Betting Pool User (TPV)
{
  "deviceType": 2,                    // 2 = TPV Device
  "bettingPool": {                    // Object = has betting pool
    "bettingPoolId": 123,
    "bettingPoolName": "Banca Demo",
    "bettingPoolCode": "BD001"
  },
  "privileges": [1, 2, 5],            // Limited permissions
  "noAccessToOtherBettingPools": true,
  "groupId": 16,
  "userId": 12345,
  "username": "demo"
}
```

### Vuex State

```javascript
{
  token: "eyJ0eXAiOiJKV1QiLCJhbGc...",
  user: {
    privileges: [...],
    deviceType: 1,              // 1 = admin, 2 = TPV
    userId: 78759,
    username: "oliver"
  },
  bettingPool: null,            // KEY FIELD: null = admin, {...} = TPV user
  isPersonalClient: false,
  dateDisplayFormat: "MM/dd/yyyy"
}
```

### Vuex Getters

```javascript
// Key getter for routing decision
isBettingPool: state => state.bettingPool !== null

// Other relevant getters
authenticated: state => !!state.token
bettingPool: state => state.bettingPool
user: state => state.user
```

---

## Routing Logic

### Navigation Guards

Each main route has a `beforeEnter` guard that checks user type:

```javascript
// Pseudo-code for route guards

// /dashboard (MainLayout) - Admin only
beforeEnter: (to, from, next) => {
  if (!store.getters.authenticated) {
    next('/sessions/new');
  } else if (store.getters.isBettingPool) {
    next('/betting-pool/ticket/create');  // Redirect TPV users
  } else if (store.state.isPersonalClient) {
    next('/personal');  // Redirect personal clients
  } else {
    next();  // Allow admin
  }
}

// /betting-pool (BettingPoolLayout) - TPV only
beforeEnter: (to, from, next) => {
  if (!store.getters.authenticated) {
    next('/sessions/new');
  } else if (!store.getters.isBettingPool) {
    next('/dashboard');  // Redirect non-TPV users
  } else {
    next();  // Allow TPV users
  }
}

// /personal (PersonalClientLayout) - Personal clients only
beforeEnter: (to, from, next) => {
  if (!store.getters.authenticated) {
    next('/personal/sessions/new');
  } else if (!store.state.isPersonalClient) {
    next('/dashboard');  // Redirect non-personal clients
  } else {
    next();  // Allow personal clients
  }
}
```

### Post-Login Redirect

After successful login, the application redirects based on:

| Condition | Redirect To |
|-----------|-------------|
| `bettingPool !== null` | `/betting-pool/ticket/create` |
| `isPersonalClient === true` | `/personal` |
| `bettingPool === null` | `/dashboard` |

---

## Implementation Guide for frontend-v4

### 1. Auth Service Enhancement

```typescript
// src/services/authService.ts

interface AuthResponse {
  token: string;
  expiresAt: string;
  user: {
    userId: number;
    username: string;
    deviceType: number;      // 1 = admin, 2 = TPV
    privileges: number[];
  };
  bettingPool: BettingPool | null;  // null = admin, object = TPV
}

interface BettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
}
```

### 2. Auth Context/Store

```typescript
// src/context/AuthContext.tsx or src/store/authSlice.ts

interface AuthState {
  token: string | null;
  user: User | null;
  bettingPool: BettingPool | null;
  isPersonalClient: boolean;
}

// Computed/derived values
const isBettingPoolUser = authState.bettingPool !== null;
const isAdmin = authState.bettingPool === null && !authState.isPersonalClient;
```

### 3. Route Configuration

```typescript
// src/routes/index.tsx

const routes = [
  // Admin routes
  {
    path: '/dashboard/*',
    element: <MainLayout />,
    guard: requireAdmin,
  },

  // TPV routes
  {
    path: '/tpv/*',
    element: <TPVLayout />,
    guard: requireBettingPool,
    children: [
      { path: 'tickets/create', element: <TPVTicketCreate /> },
      { path: 'play-monitor', element: <TPVPlayMonitor /> },
      { path: 'sales/history', element: <TPVSalesHistory /> },
    ]
  },

  // Login
  {
    path: '/login',
    element: <LoginPage />,
  }
];
```

### 4. Route Guards

```typescript
// src/guards/authGuards.ts

export const requireAdmin = () => {
  const { bettingPool, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (bettingPool !== null) {
    return <Navigate to="/tpv/tickets/create" />;
  }

  return null; // Allow access
};

export const requireBettingPool = () => {
  const { bettingPool, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (bettingPool === null) {
    return <Navigate to="/dashboard" />;
  }

  return null; // Allow access
};
```

### 5. Post-Login Navigation

```typescript
// src/pages/Login.tsx

const handleLoginSuccess = (authResponse: AuthResponse) => {
  // Store auth data
  setAuthState(authResponse);

  // Redirect based on user type
  if (authResponse.bettingPool !== null) {
    navigate('/tpv/tickets/create');
  } else {
    navigate('/dashboard');
  }
};
```

---

## Summary

| User Type | `bettingPool` | `deviceType` | Default Route | Layout |
|-----------|---------------|--------------|---------------|--------|
| Admin (Central) | `null` | `1` | `/dashboard` | MainLayout |
| Betting Pool (TPV) | `{...}` | `2` | `/betting-pool/ticket/create` | BettingPoolLayout |
| Personal Client | `null` | `1` | `/personal` | PersonalClientLayout |

---

**Document Created:** 2026-01-08
**Based on Analysis of:** https://la-numbers.apk.lol (Vue.js original app)
**Analysis Method:** Playwright browser automation + Vue DevTools inspection
