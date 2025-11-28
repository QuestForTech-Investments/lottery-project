# Architecture Recommendations - Lottery Web Application

## Executive Summary

This document outlines a recommended folder structure reorganization for the Lottery Web Application to improve maintainability, scalability, and developer experience. The current application is in excellent shape after cleanup (27.7 MB removed, 76% bundle reduction, 0 vulnerabilities), but would benefit from a feature-based architecture.

**Status**: Ready for future implementation
**Risk Level**: Medium (requires updating 100+ import statements)
**Estimated Effort**: 4-6 hours
**Recommended Timeline**: During next major feature sprint or maintenance window

---

## Current State Analysis

### ✅ Strengths
- Clean, modern Material-UI implementation
- Optimized build configuration (185 KB main bundle)
- Zero security vulnerabilities
- All legacy code eliminated
- Consistent component patterns
- Working dev and production builds

### ⚠️ Areas for Improvement
- Flat component structure (`src/components/` contains 20+ components)
- Mixed concerns (features, layouts, common components in same folder)
- No clear feature boundaries
- Difficult to locate components as app scales
- Import paths not reflecting logical grouping

---

## Proposed Architecture

### Feature-Based Folder Structure

```
src/
├── features/                    # Feature modules (business domains)
│   ├── bancas/                 # Bancas (branches) management
│   │   ├── components/
│   │   │   ├── BancasListMUI/
│   │   │   ├── CreateBancaMUI/
│   │   │   └── EditBancaMUI/
│   │   ├── hooks/
│   │   │   ├── useBancasList.js
│   │   │   ├── useCreateBanca.js
│   │   │   └── useEditBanca.js
│   │   └── services/
│   │       └── bancasApi.js
│   │
│   ├── tickets/                # Ticket management
│   │   ├── components/
│   │   │   ├── CreateTicketMUI/
│   │   │   └── TicketsListMUI/
│   │   └── hooks/
│   │
│   ├── users/                  # User management
│   │   ├── components/
│   │   │   ├── CreateUserMUI/
│   │   │   ├── EditUserMUI/
│   │   │   ├── UserIniciosSesion/
│   │   │   └── UsersListMUI/
│   │   └── hooks/
│   │       ├── useCreateUserForm.js
│   │       └── useEditUserForm.js
│   │
│   ├── dashboard/              # Dashboard & analytics
│   │   ├── components/
│   │   │   └── DashboardMUI/
│   │   └── hooks/
│   │       └── useDashboardData.js
│   │
│   └── auth/                   # Authentication
│       ├── components/
│       │   └── LoginMUI/
│       └── hooks/
│           └── useAuth.js
│
├── shared/                     # Shared/reusable components
│   ├── components/             # UI components used across features
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── Footer.jsx
│   │   ├── common/
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── ReactMultiselect.jsx
│   │   │   ├── BranchSelector.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── modals/
│   │       └── ChangePasswordModal.jsx
│   │
│   ├── hooks/                  # Reusable custom hooks
│   │   ├── useTime.js
│   │   └── useDebounce.js
│   │
│   └── utils/                  # Utility functions
│       ├── logger.js
│       └── validators.js
│
├── core/                       # Core app infrastructure
│   ├── config/
│   │   ├── i18n.js
│   │   └── routes.js
│   ├── services/
│   │   ├── api.js
│   │   └── httpClient.js
│   ├── theme/
│   │   └── muiTheme.js
│   └── constants/
│       └── menuItems.js
│
├── pages/                      # Route-level page components (lightweight wrappers)
│   ├── DashboardMUI.jsx
│   └── NotFound.jsx
│
├── assets/                     # Static assets
│   ├── images/
│   └── styles/
│
├── App.jsx                     # Root application component
└── main.jsx                    # Entry point
```

---

## Benefits of This Architecture

### 1. **Feature Isolation**
- Each feature module is self-contained
- Easy to locate all code related to a specific business domain
- Reduces cognitive load when working on a feature
- Clear ownership boundaries for teams

### 2. **Scalability**
- New features can be added as new folders without cluttering existing structure
- Easy to remove/deprecate entire features
- Supports code splitting by feature
- Natural boundaries for lazy loading

### 3. **Maintainability**
- Clear separation of concerns (features vs shared vs core)
- Easier onboarding for new developers
- Predictable file locations
- Import paths reflect logical grouping

### 4. **Testability**
- Feature-specific tests can live alongside feature code
- Easier to mock dependencies within feature boundaries
- Shared components can have their own test suites

### 5. **Reusability**
- Clear distinction between feature-specific and shared components
- Prevents accidental coupling between features
- Encourages proper abstraction of common functionality

---

## Migration Guide

### Phase 1: Create Folder Structure (5 min)

```bash
# Run from project root
mkdir -p src/features/{bancas,tickets,users,dashboard,auth}/{components,hooks,services}
mkdir -p src/shared/{components,hooks,utils}
mkdir -p src/shared/components/{layout,common,modals}
mkdir -p src/core/{config,services,theme,constants}
```

### Phase 2: Move Components (30-45 min)

#### 2.1 Move Feature Components

```bash
# Bancas feature
mv src/components/BancasListMUI src/features/bancas/components/
mv src/components/CreateBancaMUI src/features/bancas/components/
mv src/components/EditBancaMUI src/features/bancas/components/

# Tickets feature
mv src/components/CreateTicketMUI src/features/tickets/components/
mv src/components/TicketsListMUI src/features/tickets/components/

# Users feature
mv src/components/CreateUserMUI src/features/users/components/
mv src/components/EditUserMUI src/features/users/components/
mv src/components/UserIniciosSesion src/features/users/components/
mv src/components/UsersListMUI src/features/users/components/

# Dashboard feature
mv src/pages/DashboardMUI src/features/dashboard/components/

# Auth feature
mv src/pages/LoginMUI src/features/auth/components/
```

#### 2.2 Move Shared Components

```bash
# Layout components
mv src/components/layout/Header.jsx src/shared/components/layout/
mv src/components/layout/Sidebar.jsx src/shared/components/layout/
mv src/components/layout/MainLayout.jsx src/shared/components/layout/
mv src/components/layout/Footer.jsx src/shared/components/layout/

# Common components
mv src/components/common/LanguageSelector.jsx src/shared/components/common/
mv src/components/common/ReactMultiselect.jsx src/shared/components/common/
mv src/components/common/BranchSelector.jsx src/shared/components/common/

# Modals
mv src/components/modals/ChangePasswordModal.jsx src/shared/components/modals/
```

#### 2.3 Move Core Files

```bash
# Configuration
mv src/config/i18n.js src/core/config/

# Services
mv src/services/api.js src/core/services/

# Theme
mv src/theme/muiTheme.js src/core/theme/

# Constants
mv src/constants/menuItems.js src/core/constants/
```

#### 2.4 Move Hooks and Utils

```bash
# Hooks
mv src/hooks/useTime.js src/shared/hooks/

# Utils
mv src/utils/logger.js src/shared/utils/
```

### Phase 3: Update Vite Config Aliases (10 min)

Update `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // Feature aliases
      '@features': path.resolve(__dirname, './src/features'),
      '@bancas': path.resolve(__dirname, './src/features/bancas'),
      '@tickets': path.resolve(__dirname, './src/features/tickets'),
      '@users': path.resolve(__dirname, './src/features/users'),
      '@dashboard': path.resolve(__dirname, './src/features/dashboard'),
      '@auth': path.resolve(__dirname, './src/features/auth'),

      // Shared aliases
      '@shared': path.resolve(__dirname, './src/shared'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),

      // Core aliases
      '@core': path.resolve(__dirname, './src/core'),
      '@config': path.resolve(__dirname, './src/core/config'),
      '@services': path.resolve(__dirname, './src/core/services'),
      '@theme': path.resolve(__dirname, './src/core/theme'),
      '@constants': path.resolve(__dirname, './src/core/constants'),

      // Legacy (for backwards compatibility during migration)
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  // ... rest of config
})
```

### Phase 4: Update Import Statements (2-3 hours)

#### 4.1 Update App.jsx

**Before:**
```javascript
import MainLayout from '@components/layout/MainLayout'
import DashboardMUI from '@pages/DashboardMUI'
import LoginMUI from '@pages/LoginMUI'
import BancasListMUI from '@components/BancasListMUI'
import CreateUserMUI from '@components/CreateUserMUI'
```

**After:**
```javascript
import MainLayout from '@shared/components/layout/MainLayout'
import DashboardMUI from '@features/dashboard/components/DashboardMUI'
import LoginMUI from '@features/auth/components/LoginMUI'
import BancasListMUI from '@features/bancas/components/BancasListMUI'
import CreateUserMUI from '@features/users/components/CreateUserMUI'
```

#### 4.2 Update Feature Components

**Example: EditUserMUI**

**Before:**
```javascript
import PermissionsSelector from '../CreateUserMUI/PermissionsSelector'
import ReactMultiselect from '../common/ReactMultiselect'
import BranchSelector from '../common/BranchSelector'
import * as logger from '@/utils/logger'
```

**After:**
```javascript
import PermissionsSelector from '@users/components/CreateUserMUI/PermissionsSelector'
import ReactMultiselect from '@shared/components/common/ReactMultiselect'
import BranchSelector from '@shared/components/common/BranchSelector'
import * as logger from '@utils/logger'
```

#### 4.3 Update Layout Components

**Example: Header.jsx**

**Before:**
```javascript
import { useTime } from '@hooks/useTime'
import LanguageSelector from '@components/common/LanguageSelector'
import ChangePasswordModal from '@components/modals/ChangePasswordModal'
```

**After:**
```javascript
import { useTime } from '@hooks/useTime'
import LanguageSelector from '@shared/components/common/LanguageSelector'
import ChangePasswordModal from '@shared/components/modals/ChangePasswordModal'
```

#### 4.4 Update Sidebar.jsx

**Before:**
```javascript
import { MENU_ITEMS } from '@constants/menuItems'
```

**After:**
```javascript
import { MENU_ITEMS } from '@constants/menuItems'
// No change needed - alias already points to core/constants
```

### Phase 5: Testing & Validation (30 min)

```bash
# 1. Clear all caches
rm -rf node_modules/.vite
rm -rf dist

# 2. Restart dev server
npm run dev

# 3. Test key features:
# - Navigate to Dashboard
# - Navigate to Bancas List
# - Navigate to Users List
# - Navigate to Create User
# - Navigate to Edit User
# - Test sidebar navigation
# - Test header quick access buttons
# - Test language selector
# - Test change password modal

# 4. Run production build
npm run build

# 5. Verify build output
npm run preview

# 6. Check for any console errors or warnings
```

---

## Implementation Checklist

- [ ] **Backup current state** (git commit or create branch)
- [ ] **Stop dev server** to release file locks
- [ ] **Phase 1**: Create all folders
- [ ] **Phase 2**: Move all components
  - [ ] Move bancas components
  - [ ] Move tickets components
  - [ ] Move users components
  - [ ] Move dashboard components
  - [ ] Move auth components
  - [ ] Move layout components
  - [ ] Move common components
  - [ ] Move modals
  - [ ] Move core files
  - [ ] Move hooks
  - [ ] Move utils
- [ ] **Phase 3**: Update vite.config.js aliases
- [ ] **Phase 4**: Update imports
  - [ ] Update App.jsx
  - [ ] Update all feature components (20+ files)
  - [ ] Update all shared components (10+ files)
  - [ ] Update all hooks
  - [ ] Update main.jsx if needed
- [ ] **Phase 5**: Testing
  - [ ] Dev server runs without errors
  - [ ] All routes navigate correctly
  - [ ] All components render properly
  - [ ] Production build succeeds
  - [ ] Build size remains optimized
  - [ ] No new console errors
- [ ] **Phase 6**: Cleanup
  - [ ] Remove old empty folders
  - [ ] Update README if exists
  - [ ] Commit changes with descriptive message
  - [ ] Create PR for team review

---

## Common Import Patterns Reference

### Feature Components
```javascript
// Bancas
import BancasListMUI from '@features/bancas/components/BancasListMUI'
import CreateBancaMUI from '@features/bancas/components/CreateBancaMUI'
import EditBancaMUI from '@features/bancas/components/EditBancaMUI'

// Users
import UsersListMUI from '@features/users/components/UsersListMUI'
import CreateUserMUI from '@features/users/components/CreateUserMUI'
import EditUserMUI from '@features/users/components/EditUserMUI'

// Tickets
import CreateTicketMUI from '@features/tickets/components/CreateTicketMUI'

// Dashboard
import DashboardMUI from '@features/dashboard/components/DashboardMUI'

// Auth
import LoginMUI from '@features/auth/components/LoginMUI'
```

### Shared Components
```javascript
// Layout
import MainLayout from '@shared/components/layout/MainLayout'
import Header from '@shared/components/layout/Header'
import Sidebar from '@shared/components/layout/Sidebar'

// Common
import LanguageSelector from '@shared/components/common/LanguageSelector'
import ReactMultiselect from '@shared/components/common/ReactMultiselect'
import BranchSelector from '@shared/components/common/BranchSelector'

// Modals
import ChangePasswordModal from '@shared/components/modals/ChangePasswordModal'
```

### Core Files
```javascript
// Config
import i18n from '@core/config/i18n'

// Services
import api from '@core/services/api'

// Theme
import theme from '@core/theme/muiTheme'

// Constants
import { MENU_ITEMS } from '@core/constants/menuItems'
```

### Hooks & Utils
```javascript
// Hooks
import { useTime } from '@shared/hooks/useTime'

// Utils
import * as logger from '@shared/utils/logger'
```

---

## Best Practices

### 1. Feature Module Guidelines
- Keep features independent (no cross-feature imports)
- If sharing is needed, move to `shared/`
- Each feature should be deletable without breaking others
- Feature-specific hooks stay within the feature

### 2. Shared Component Guidelines
- Only promote to `shared/` if used by 2+ features
- Keep shared components generic and configurable
- Document props and usage examples
- Consider creating Storybook stories

### 3. Core Guidelines
- Core files should have no feature dependencies
- Configuration should be environment-aware
- Services should be framework-agnostic
- Constants should be truly global

### 4. Import Conventions
- Always use aliases (`@features`, `@shared`, `@core`)
- Avoid relative imports across folders (`../../../`)
- Group imports: external → core → shared → features
- Sort imports alphabetically within groups

### 5. File Naming
- Component folders: PascalCase (`CreateUserMUI/`)
- Component files: PascalCase (`CreateUserMUI/index.jsx`)
- Hook files: camelCase with `use` prefix (`useCreateUserForm.js`)
- Utility files: camelCase (`logger.js`, `validators.js`)
- Config files: camelCase (`i18n.js`, `routes.js`)

---

## Rollback Plan

If issues arise during migration:

```bash
# 1. Immediately stop migration
# 2. Revert to last commit
git reset --hard HEAD

# 3. Or checkout from backup branch
git checkout backup-before-restructure

# 4. Clear caches
rm -rf node_modules/.vite
rm -rf dist

# 5. Restart dev server
npm run dev
```

---

## Future Enhancements

Once folder structure is in place, consider:

1. **Feature-based code splitting**
   ```javascript
   const BancasListMUI = lazy(() => import('@features/bancas/components/BancasListMUI'))
   ```

2. **Feature-specific testing**
   ```
   src/features/users/
   ├── components/
   │   └── CreateUserMUI/
   │       ├── index.jsx
   │       └── CreateUserMUI.test.jsx
   ```

3. **Feature documentation**
   ```
   src/features/users/
   ├── README.md
   ├── components/
   └── hooks/
   ```

4. **Barrel exports**
   ```javascript
   // src/features/users/index.js
   export { default as UsersListMUI } from './components/UsersListMUI'
   export { default as CreateUserMUI } from './components/CreateUserMUI'
   export { default as EditUserMUI } from './components/EditUserMUI'
   ```

---

## When to Implement

**Recommended Timing:**
- During a planned maintenance window
- Before starting a major new feature
- After current sprint completes
- When team has bandwidth for testing

**Not Recommended:**
- During active feature development
- Right before a release
- When team is under deadline pressure
- If unfamiliar with the codebase

---

## Conclusion

This architecture reorganization is a valuable investment in the application's long-term maintainability. While the migration requires careful execution and thorough testing, the benefits of clear feature boundaries, improved developer experience, and better scalability make it worthwhile.

The current application is in excellent shape, so this migration can be scheduled when convenient rather than being urgent. Use this document as a reference guide when ready to proceed.

**Estimated Total Time**: 4-6 hours (including testing)
**Risk Level**: Medium (many imports to update)
**Confidence**: High (clear migration path with rollback plan)

---

## Questions or Issues?

If problems arise during implementation:
1. Check that all folder paths are correct
2. Verify vite.config.js aliases are updated
3. Clear Vite cache (`rm -rf node_modules/.vite`)
4. Restart dev server completely
5. Check browser console for import errors
6. Use git diff to see what changed

Remember: The current structure works perfectly. This reorganization is an enhancement, not a fix.
