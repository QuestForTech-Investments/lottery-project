# Frontend V3 - Lottery System

Production-ready React + TypeScript + Vite frontend for the Lottery System.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Production Build](#production-build)
- [Key Features](#key-features)
- [Troubleshooting](#troubleshooting)

---

## Architecture

Frontend-v3 is a modern, production-ready React application built with TypeScript and Vite. It follows a feature-based architecture with clear separation of concerns:

- **Component-based UI**: Feature modules organized by domain (users, draws, etc.)
- **Centralized State**: Zustand for global state management
- **Server State**: TanStack Query (React Query) for API data fetching and caching
- **Type Safety**: Full TypeScript strict mode
- **Error Handling**: Global ErrorBoundary with environment-aware logging
- **Production Logging**: Environment-based logger (DEV: all logs + localStorage, PROD: errors/warnings only)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 5.2.0 | Build tool & dev server |
| **Material-UI** | 7.3.5 | Component library |
| **TanStack Query** | 5.90.10 | Server state management |
| **Zustand** | 5.0.8 | Client state management |
| **React Router** | 6.30.2 | Routing |
| **Axios** | 1.13.2 | HTTP client |
| **React Hook Form** | 7.66.1 | Form management |
| **Zod** | 4.1.13 | Schema validation |
| **Vitest** | 3.2.4 | Unit testing |
| **Playwright** | 1.57.0 | E2E testing |

## Project Structure

```
frontend-v3/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components (ErrorBoundary, etc.)
│   │   ├── features/        # Feature-specific components
│   │   │   └── users/       # Users module (UserList, CreateUser, etc.)
│   │   └── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── hooks/               # Custom React hooks
│   │   ├── useDebouncedValue.ts
│   │   └── useUsers.ts
│   ├── services/            # API services
│   │   ├── api/             # API clients
│   │   │   ├── auth.ts
│   │   │   └── client.ts
│   │   └── userService.ts
│   ├── stores/              # Zustand stores
│   │   └── userStore.ts
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   │   └── logger.ts        # Environment-aware logger
│   ├── test/                # Test setup
│   │   └── setup.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── tests/                   # E2E tests (Playwright)
├── vitest.config.ts         # Vitest configuration
├── playwright.config.ts     # Playwright configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- API Backend running on `http://localhost:5000` (see `../api/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:4004`

### Environment Variables

Currently, the API base URL is hardcoded in `src/services/api/client.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000'
```

To configure this via environment variables:
1. Create `.env` file
2. Add `VITE_API_BASE_URL=http://localhost:5000`
3. Update `client.ts` to use `import.meta.env.VITE_API_BASE_URL`

## Development

### Available Scripts

```bash
npm run dev          # Start dev server (port 4004)
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run unit tests (watch mode)
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Generate test coverage report
```

### Code Quality

- **TypeScript Strict Mode**: Enabled
- **ESLint**: Configured with React + TypeScript rules
- **Test Coverage**: Auth service, User service (33+ tests)

### Logging

The centralized logger (`src/utils/logger.ts`) has environment-aware behavior:

**Development:**
- All log levels (info, success, warning, error, debug)
- Logs stored in localStorage for debugging
- Fancy colored console output

**Production:**
- Only errors and warnings logged to console
- No localStorage logging (GDPR compliant)
- Simple console.error/console.warn output

**Usage:**
```typescript
import * as logger from '@/utils/logger'

logger.info('CATEGORY', 'Message', optionalData)
logger.error('API', 'Failed to fetch users', error)
logger.debug('DEBUG', 'Component rendered', { props })
```

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

**Test Files:**
- `src/services/api/auth.test.ts` - Auth service (15 tests)
- `src/services/userService.test.ts` - User service (33 tests)
- `src/hooks/useDebouncedValue.test.ts` - Hook test (4 tests)

### E2E Tests (Playwright)

```bash
# Run Playwright tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test tests/users.spec.ts
```

## Production Build

### Building

```bash
# Create optimized production build
npm run build

# Output: dist/
```

**Build Optimizations:**
- Tree-shaking (ReactQueryDevtools excluded in production)
- Code splitting
- Minification
- Source maps (optional)

### Preview Build

```bash
npm run preview
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints point to production API
- [ ] Source maps disabled (or restricted)
- [ ] Test coverage >= 80%
- [ ] No console.log in production code
- [ ] Error tracking configured (logger captures errors)
- [ ] CORS configured on API
- [ ] HTTPS enabled

## Key Features

### Error Handling

- **ErrorBoundary**: Catches unhandled errors in component tree
  - Development: Shows detailed error + stack trace
  - Production: Shows user-friendly error message
  - Logs all errors via centralized logger

**Usage:**
```tsx
// Already integrated in main.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<CustomError />}>
  <MyComponent />
</ErrorBoundary>
```

### State Management

**Server State (TanStack Query):**
```typescript
// Custom hook pattern
const { data, isLoading, error } = useUsers({
  page: 1,
  pageSize: 10
})
```

**Client State (Zustand):**
```typescript
// Zustand store
const selectedUser = useUserStore(state => state.selectedUser)
const setSelectedUser = useUserStore(state => state.setSelectedUser)
```

### Performance Optimizations

- Lazy loading of DevTools (0KB in production)
- Debounced search inputs (`useDebouncedValue` hook)
- React Query caching (5min stale time)
- Code splitting via React.lazy()

## Troubleshooting

### Port Already in Use

If port 4004 is in use, Vite will auto-increment to 4005. Check `vite.config.ts`:
```typescript
server: {
  port: 4004,
  strictPort: false, // Auto-increment if busy
}
```

### API Connection Errors

1. Verify API is running: `curl http://localhost:5000/health`
2. Check CORS: API must allow `http://localhost:4004`
3. Check `src/services/api/client.ts` for correct base URL

### Test Failures

```bash
# Clear test cache
rm -rf node_modules/.vitest

# Reinstall dependencies
npm install

# Run tests again
npm test
```

### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clean build
npm run build
```

---

**Last Updated:** 2025-01-26
**Version:** 1.0.0
**Maintainer:** Development Team
