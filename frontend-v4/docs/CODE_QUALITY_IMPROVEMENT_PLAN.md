# Frontend-v4 Code Quality Improvement Plan

> **Goal:** Transform functional code into maintainable, professional-grade code without breaking existing functionality.

**Created:** 2024-11-28
**Status:** In Progress
**Priority:** High

---

## Table of Contents

1. [Quick Wins (Safe Changes)](#1-quick-wins-safe-changes)
2. [Console.log Cleanup](#2-consolelog-cleanup)
3. [Comments Standardization](#3-comments-standardization)
4. [Type Centralization](#4-type-centralization)
5. [Large File Refactoring](#5-large-file-refactoring)
6. [Theme Constants](#6-theme-constants)
7. [Progress Tracking](#7-progress-tracking)

---

## 1. Quick Wins (Safe Changes)

These changes have zero risk of breaking functionality.

### 1.1 Remove Emoji from Console Statements

**Files affected:** ~50 files
**Risk:** None
**Time estimate:** 1 hour

```bash
# Find all emoji console statements
grep -rn "console\." src --include="*.ts" --include="*.tsx" | grep -E "[^\x00-\x7F]" | wc -l
```

**Pattern to replace:**
```typescript
// Before
console.log('🔵 [HOOK] Loading data...');
console.log('✅ Success');
console.log('❌ Error:', error);

// After
console.log('[HOOK] Loading data...');
console.log('[SUCCESS] Data loaded');
console.log('[ERROR]', error);
```

**Status:** [ ] Not Started

---

### 1.2 Standardize Console Log Format

**Recommended format:**
```typescript
// Debug (remove in production)
console.log('[DEBUG][ComponentName] message', data);

// Info
console.log('[INFO][ServiceName] message');

// Warning
console.warn('[WARN][Context] message');

// Error
console.error('[ERROR][Context] message', error);
```

**Status:** [ ] Not Started

---

## 2. Console.log Cleanup

### 2.1 Current State

| Type | Count | Action |
|------|-------|--------|
| console.log | ~350 | Convert to logger or remove |
| console.warn | ~30 | Keep important ones |
| console.error | ~27 | Keep all |

### 2.2 Create Logger Utility

**File:** `src/utils/logger.ts`

```typescript
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (context: string, message: string, data?: unknown) => {
    if (isDev) {
      console.log(`[DEBUG][${context}] ${message}`, data ?? '');
    }
  },

  info: (context: string, message: string, data?: unknown) => {
    if (isDev) {
      console.log(`[INFO][${context}] ${message}`, data ?? '');
    }
  },

  warn: (context: string, message: string, data?: unknown) => {
    console.warn(`[WARN][${context}] ${message}`, data ?? '');
  },

  error: (context: string, message: string, error?: unknown) => {
    console.error(`[ERROR][${context}] ${message}`, error ?? '');
  },
};
```

**Status:** [ ] Not Started

### 2.3 Files with Most Console Statements (Priority Order)

| File | Count | Priority |
|------|-------|----------|
| `useEditBettingPoolForm.ts` | 80+ | HIGH |
| `useCompleteBettingPoolForm.ts` | 50+ | HIGH |
| `PrizesTab.tsx` | 40+ | HIGH |
| `bettingPoolService.ts` | 30+ | MEDIUM |
| `prizeService.ts` | 25+ | MEDIUM |

**Status:** [ ] Not Started

---

## 3. Comments Standardization

### 3.1 Rules

1. **All comments in English**
2. **No obvious comments** (don't comment what code already says)
3. **JSDoc for public functions**
4. **TODO format:** `// TODO(author): description`

### 3.2 Spanish Comments to Translate

```bash
# Find Spanish comments (words with accents or Spanish patterns)
grep -rn "// [A-Z]" src --include="*.ts" --include="*.tsx" | grep -iE "para|cuando|desde|hacia|usuario|datos|error|guardar|cargar"
```

**Common patterns to fix:**

```typescript
// Before
// Ignorar si el usuario está en un textarea
// Guardar los datos en la base de datos
// Verificar si existe

// After
// Ignore if user is in a textarea
// Save data to database
// Check if exists
```

**Status:** [ ] Not Started

---

## 4. Type Centralization

### 4.1 Current Problem

Types are defined locally in multiple files:
- `BetType` defined in 4+ places
- `PrizeField` defined in 3+ places
- `FormData` defined in 2+ places

### 4.2 Proposed Structure

```
src/types/
├── index.ts           # Re-exports all types
├── user.ts            # User-related types (exists)
├── betting-pool.ts    # BettingPool, FormData, Config
├── prize.ts           # BetType, PrizeField, PrizeConfig
├── draw.ts            # Draw, Schedule, Lottery
├── zone.ts            # Zone types
├── api.ts             # ApiResponse, PaginatedResponse
└── common.ts          # Shared utility types
```

### 4.3 Migration Steps

1. [ ] Create type files with canonical definitions
2. [ ] Export from `src/types/index.ts`
3. [ ] Update imports in services (one at a time)
4. [ ] Update imports in components (one at a time)
5. [ ] Remove local type definitions
6. [ ] Run typecheck after each file

**Status:** [ ] Not Started

---

## 5. Large File Refactoring

### 5.1 Files Requiring Refactoring

| File | Lines | Target | Strategy |
|------|-------|--------|----------|
| `useEditBettingPoolForm.ts` | 1,679 | <400 | Split into multiple hooks |
| `PrizesTab.tsx` | 1,237 | <300 | Extract sub-components |
| `MassEditBettingPools/index.tsx` | 914 | <400 | Split logic into hooks |
| `useCompleteBettingPoolForm.ts` | 895 | <400 | Split into multiple hooks |
| `HistoricalSales/index.tsx` | 873 | <400 | Extract table, filters |
| `CreateTickets/index.tsx` | 865 | <400 | Extract sub-components |

### 5.2 Refactoring Strategy for useEditBettingPoolForm.ts

**Current responsibilities (too many):**
1. Form state management
2. API calls (6+ endpoints)
3. Data transformation
4. Validation
5. Prize configuration
6. Schedule management
7. Draw management

**Proposed split:**

```
hooks/
├── useEditBettingPoolForm.ts      # Main hook (orchestrator) ~200 lines
├── useBettingPoolData.ts          # Load/save betting pool ~150 lines
├── useBettingPoolPrizes.ts        # Prize configuration ~200 lines
├── useBettingPoolSchedules.ts     # Schedule management ~150 lines
├── useBettingPoolDraws.ts         # Draw selection ~150 lines
└── useBettingPoolValidation.ts    # Form validation ~100 lines
```

**Status:** [ ] Not Started

---

## 6. Theme Constants

### 6.1 Current Problem

Magic numbers scattered in `sx` props:
```typescript
sx={{ p: 3, mb: 2, borderRadius: 1 }}
```

### 6.2 Proposed Solution

**File:** `src/theme/spacing.ts`
```typescript
export const SPACING = {
  page: { p: 3 },
  card: { p: 2 },
  section: { mb: 3 },
  field: { mb: 2 },
} as const;
```

**File:** `src/theme/colors.ts`
```typescript
export const COLORS = {
  primary: '#51cbce',
  primaryHover: '#45b8bb',
  success: '#28a745',
  error: '#dc3545',
  background: '#f5f5f5',
  text: '#2c2c2c',
} as const;
```

**Status:** [ ] Not Started

---

## 7. Progress Tracking

### Phase 1: Quick Wins (Week 1)
- [ ] Remove emojis from console statements
- [ ] Translate Spanish comments to English
- [ ] Create logger utility
- [ ] Replace console.log in 3 priority files

### Phase 2: Type Centralization (Week 2)
- [ ] Create `src/types/` structure
- [ ] Migrate `BetType` to central location
- [ ] Migrate `PrizeField` to central location
- [ ] Migrate API response types

### Phase 3: Refactoring (Week 3-4)
- [ ] Split `useEditBettingPoolForm.ts`
- [ ] Split `PrizesTab.tsx`
- [ ] Extract reusable components

### Phase 4: Polish (Week 5)
- [ ] Theme constants
- [ ] Remove dead code
- [ ] Final review

---

## Commands Reference

```bash
# Check for emojis in code
grep -rn "console\." src --include="*.ts" --include="*.tsx" | grep -P "[^\x00-\x7F]"

# Count console statements
grep -rn "console\." src --include="*.ts" --include="*.tsx" | wc -l

# Find Spanish comments
grep -rn "// " src --include="*.ts" --include="*.tsx" | grep -iE "para |cuando |desde |hacia |usuario|datos |guardar|cargar|verificar|obtener"

# Check file sizes
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20

# Run typecheck
npm run typecheck

# Run build
npm run build
```

---

## Safety Rules

1. **Always run `npm run typecheck` after changes**
2. **Commit after each completed section**
3. **Test in browser after refactoring**
4. **One file at a time for refactoring**
5. **Never change logic while cleaning up**

---

## Notes

- This document will be updated as work progresses
- Check off items as they are completed
- Add new issues discovered during cleanup
