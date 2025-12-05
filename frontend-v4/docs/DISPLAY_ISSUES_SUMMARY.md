# Frontend-v4 Display Issues - Quick Reference

**Generated:** 2025-12-03
**Status:** Ready for Playwright Agent Visual Verification

---

## Quick Stats

- **Files Analyzed:** 8 core files (services + components)
- **Issues Found:** 12 (4 high priority, 5 medium, 3 low)
- **Overall Health:** 7.5/10
- **Recommendation:** Safe for production with minor fixes

---

## Critical Issues (Fix Before Production)

### 1. Currency Formatting Inconsistency
**Location:** `/src/components/features/tickets/CreateTickets/index.tsx` (lines 162, 172, 1118)

**Problem:**
```typescript
// CURRENT (Wrong)
${bet.betAmount.toFixed(2)}  // No thousand separators

// SHOULD BE
{formatCurrency(bet.betAmount)}  // "$1,234.56"
```

**Impact:** Large amounts look unprofessional (10000.00 vs $10,000.00)

**Fix:** Search and replace all `.toFixed(2)` in display contexts

---

### 2. Date Formatting Without Timezone
**Location:** `/src/services/ticketService.ts` (line 158)

**Problem:**
```typescript
// CURRENT (Wrong)
fecha: new Date(ticket.createdAt).toLocaleDateString()
// Uses browser timezone - different for each user!

// SHOULD BE
fecha: new Date(ticket.createdAt).toLocaleDateString('es-US', {
  timeZone: 'America/Santo_Domingo'
})
```

**Impact:** Lottery draw times may show incorrectly for users in different timezones

**Fix:** Create centralized date formatter with timezone

---

### 3. Missing Currency Format in Ticket Mapping
**Location:** `/src/services/ticketService.ts` (lines 160, 161)

**Problem:**
```typescript
// CURRENT (Wrong)
monto: ticket.grandTotal,        // Raw number: 1234.56
premio: ticket.totalPrize || 0,  // Raw number: 500

// SHOULD BE
monto: formatCurrency(ticket.grandTotal),     // "$1,234.56"
premio: formatCurrency(ticket.totalPrize || 0)  // "$500.00"
```

**Impact:** Ticket display shows raw numbers without formatting

**Fix:** Apply formatCurrency() in mapTicketResponse

---

### 4. No Centralized Formatting Utilities
**Location:** Missing file

**Problem:** Each component defines its own formatCurrency()

**Impact:**
- Inconsistent formatting across app
- Duplicated code (3+ locations)
- Hard to maintain

**Fix:** Create `/src/utils/formatters.ts` with:
- formatCurrency()
- formatNumber()
- formatPercentage()
- formatDate()

---

## Medium Priority Issues

### 5. Hardcoded Draw Categories
**Location:** `/src/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab.tsx` (lines 94-180)

**Problem:** Draw categories hardcoded in component
```typescript
const DOMINICAN_DRAWS = ['NACIONAL', 'LA PRIMERA', ...];
const USA_DRAWS = ['NEW YORK DAY', 'FLORIDA AM', ...];
```

**Impact:** Must update code when draws change

**Recommendation:** Move to database or config file

---

### 6. Bet Type Name Display
**Location:** Multiple components

**Problem:** Names shown "as-is" from API with inconsistencies:
- "CASH3_STRAIGHT" (has underscore)
- "PALÉ" (has accent)
- "PICK TWO FRONT" (has spaces)

**Recommendation:** Create display name formatter or verify exact match with Vue.js

---

### 7. No Loading State for Status Toggle
**Location:** `/src/components/features/betting-pools/BettingPoolsList/index.tsx` (line 109)

**Problem:** Switch toggles immediately, no feedback during API call

**Impact:** User doesn't know if toggle succeeded

**Fix:** Add loading state to Switch component

---

## Low Priority Issues

### 8. Bet Type Filtering Logic
**Location:** `/src/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab.tsx`

**Status:** ✅ Logic looks correct, needs visual verification

**Action:** Playwright agent should verify bet types shown match Vue.js for each draw

---

### 9. Draw Color Display
**Location:** `/src/components/features/tickets/CreateTickets/index.tsx` (line 359)

**Status:** ✅ Colors come from database, fallback to gray

**Action:** Verify colors match Vue.js exactly

---

### 10. Number Formatting in Bets
**Location:** `/src/components/features/tickets/CreateTickets/index.tsx` (lines 83-101)

**Status:** ✅ Smart formatting logic present

**Action:** Verify output matches Vue.js:
- "23" → "23" (directo)
- "2321" → "23-21" (palé)
- "224466" → "22-44-66" (tripleta)
- "123" → "123" (cash3 - no hyphens)

---

## Items Requiring Playwright Agent Verification

### Visual Comparisons Needed

1. **Ticket Display**
   - [ ] Number formatting matches
   - [ ] Currency format matches
   - [ ] Date/time format matches
   - [ ] Status labels match

2. **Draw/Lottery Names**
   - [ ] Exact text matches
   - [ ] Case matches
   - [ ] Abbreviations match

3. **Bet Type Names**
   - [ ] Display format matches
   - [ ] Accent marks correct
   - [ ] Spacing correct

4. **Prize Configuration**
   - [ ] Field labels match
   - [ ] Default values match
   - [ ] Ranges match

5. **Colors**
   - [ ] Draw colors match
   - [ ] Status colors match
   - [ ] Button colors match

### Test Scenarios for Playwright

```javascript
// Test 1: Compare ticket creation form
test('ticket creation matches vue.js', async () => {
  // Navigate to create ticket
  // Select same betting pool in both apps
  // Compare draw list colors and names
  // Create bet with "23" - verify displays as "23"
  // Create bet with "2321" - verify displays as "23-21"
  // Create bet with amount "1000" - verify displays as "$1,000.00"
});

// Test 2: Compare prize configuration
test('prize config matches vue.js', async () => {
  // Navigate to prizes tab
  // Select "General" tab
  // Compare bet type names
  // Compare field labels
  // Compare default values
});

// Test 3: Compare ticket monitoring
test('ticket display matches vue.js', async () => {
  // Navigate to ticket monitoring
  // Compare date format
  // Compare currency format
  // Compare status labels
});
```

---

## Action Plan

### Immediate (Before Visual Testing)

1. ✅ Create `/src/utils/formatters.ts`
2. ✅ Replace `.toFixed(2)` with `formatCurrency()` in CreateTickets
3. ✅ Update `ticketService.ts` date and currency formatting
4. ✅ Add timezone to all date formatting

### After Code Fixes (Playwright Agent)

5. ⏳ Run visual comparison tests
6. ⏳ Document any visual differences found
7. ⏳ Verify draw names match exactly
8. ⏳ Verify bet type names match exactly
9. ⏳ Verify colors match exactly

### Optional Improvements

10. 🔵 Move draw categories to database
11. 🔵 Add loading states to toggles
12. 🔵 Create display name mapping layer
13. 🔵 Add unit tests for formatters

---

## Files to Edit

### High Priority
1. `/src/utils/formatters.ts` (CREATE NEW)
2. `/src/services/ticketService.ts` (EDIT - lines 158-161)
3. `/src/components/features/tickets/CreateTickets/index.tsx` (EDIT - lines 162, 172, 1118)
4. `/src/components/features/betting-pools/BettingPoolsList/index.tsx` (EDIT - use centralized formatter)

### Medium Priority
5. `/src/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab.tsx` (REVIEW - draw categories)
6. All components using dates (ADD timezone)

---

## Success Criteria

**Ready for Production When:**
- ✅ All HIGH priority issues fixed
- ✅ Centralized formatters created and used
- ✅ Playwright visual comparison tests pass
- ✅ No display differences vs. Vue.js (or documented and approved)

---

## Notes for Playwright Agent

**Focus Areas:**
1. Compare side-by-side: Vue.js app vs frontend-v4
2. Same test data in both apps (same betting pool, same draws)
3. Screenshot key screens for comparison
4. Log any differences in:
   - Text content (names, labels)
   - Number formats
   - Date/time formats
   - Colors
   - Layout/spacing

**Test Credentials:**
- Username: `admin`
- Password: `Admin123456`
- Test Betting Pool: ID 9, Code RB003333

**Vue.js App URL:** https://la-numbers.apk.lol
**Frontend-v4 URL:** http://localhost:4000 (or port in use)

---

**End of Summary**
