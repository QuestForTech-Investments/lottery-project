---
id: task-1
title: Fix 401 Unauthorized error in V1 frontend sortition service
status: Done
assignee: [Claude]
created_date: '2025-11-14 20:59'
labels: [bug, frontend-v1, authentication]
dependencies: []
---

## Problem
V1 frontend `sortitionService.js` was making direct `fetch()` calls to `/api/betting-pools/9/draws` without JWT authentication tokens, resulting in 401 Unauthorized errors.

## Solution
Refactored `sortitionService.js` to use the centralized `api.js` helper which automatically includes JWT Bearer tokens in all requests.

### Files Modified
- `/home/jorge/projects/LottoWebApp/src/services/sortitionService.js`

### Changes
- `getBettingPoolDraws()`: Changed from `fetch()` → `api.get()`
- `saveBettingPoolDraws()`: Changed from `fetch()` → `api.post()`
- `deleteBettingPoolDraw()`: Changed from `fetch()` → `api.delete()`
- `getLotteries()`: Changed from `fetch()` → `api.get()`

## Testing
✅ Authentication headers now included in all API calls
✅ 401 errors resolved

