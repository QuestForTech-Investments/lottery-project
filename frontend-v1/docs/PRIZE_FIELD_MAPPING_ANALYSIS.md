# Prize Field Mapping System - Architectural Analysis

## Executive Summary

**RECOMMENDATION: SIMPLIFY - The 3-layer conversion system can be eliminated or drastically simplified.**

With the recent database update that added descriptive `field_name` values, the complex `premioFieldConverter.js` mapping system is now **mostly redundant**. The current system maintains 3 different formats across the stack, which adds unnecessary complexity and maintenance burden.

---

## Current Architecture

### 3-Layer Format System

The current implementation manages **THREE different formats** for the same data:

#### 1. **Frontend Format** (Component State)
- **Pattern**: `{lottery}_{betType}_{fieldName}`
- **Casing**: camelCase for field names
- **Example**: `general_directo_primerPago`
- **Usage**: Component state in CreateBanca.jsx, EditBanca.jsx
- **Total fields in formData**: ~80+ prize fields

#### 2. **JSON API Format** (Intermediate Layer)
- **Pattern**: snake_case field names
- **Example**: `{ directo: { primer_pago: 56, segundo_pago: 28 } }`
- **Usage**: Internal conversion between frontend and backend
- **Purpose**: "User-friendly" intermediate format

#### 3. **Database Format** (API Responses)
- **Field Code**: UPPERCASE_SNAKE_CASE
- **Field Name**: Descriptive user-friendly text (NEW!)
- **Example**:
  ```json
  {
    "fieldCode": "DIRECTO_PRIMER_PAGO",
    "fieldName": "Directo - Primer Pago",
    "defaultMultiplier": 56
  }
  ```

---

## Database Schema (Updated)

### `prize_fields` Table Structure

```sql
prize_field_id    INT PRIMARY KEY
bet_type_id       INT (FK to bet_types)
field_code        VARCHAR(100)   -- "DIRECTO_PRIMER_PAGO" (technical identifier)
field_name        VARCHAR(255)   -- "Directo - Primer Pago" (descriptive, user-friendly)
default_multiplier DECIMAL(18,4)
display_order     INT
is_active         BIT
```

**Key Change**: `field_name` is now descriptive instead of generic ("Primer Pago" → "Directo - Primer Pago")

---

## Current Mapping System: `premioFieldConverter.js`

### File Location
`/home/jorge/projects/LottoWebApp/src/utils/premioFieldConverter.js`

### What It Does

1. **BET_TYPE_JSON_TO_DB** (24 bet types)
   - Maps: `'directo'` → `'DIRECTO'`
   - Maps: `'cash3_straight'` → `'PICK_THREE_STRAIGHT'`
   - 24 bet type mappings

2. **FIELD_JSON_TO_DB** (88 field mappings across 24 bet types)
   - Maps: `directo.primer_pago` → `DIRECTO_PRIMER_PAGO`
   - Maps: `cash3_box.3_way_2_identicos` → `CASH3_BOX_PRIMER_PAGO`
   - 88 total field mappings

3. **Conversion Functions**
   - `jsonToDbFieldCode()` - JSON → DB field code
   - `dbFieldCodeToJson()` - DB → JSON (reverse lookup)
   - `apiResponseToJsonConfig()` - API response → intermediate JSON
   - `jsonConfigToApiPayload()` - JSON → API payload
   - `getEmptyJsonConfigStructure()` - Generate empty structure

### Total Code Size
- **486 lines** of mapping logic
- **24 bet types** mapped
- **88 field mappings** maintained manually

---

## Usage Analysis

### Where It's Used

#### 1. **CreateBanca.jsx** (Lines 6-7, 365-371, 765-771)

**Line 365-371**: Loading default values on component mount
```javascript
const prizeFieldsResponse = await getPrizeFields();
const defaultJson = apiResponseToJsonConfig(prizeFieldsResponse);
const premiosFormData = jsonConfigToFormData(defaultJson.config, 'general');
setFormData(prev => ({ ...prev, ...premiosFormData }));
```

**Line 765-771**: Saving prize configuration
```javascript
const jsonConfig = formDataToJsonConfig(generalPremioData, 'general');
const prizeFieldsResponse = await getPrizeFields();
const premioPayload = jsonConfigToApiPayload(jsonConfig, prizeFieldsResponse);
const premioResponse = await saveBancaPrizeConfig(createdBranchId, premioPayload);
```

#### 2. **EditBanca.jsx** (Lines 6, 418, 427-428, 972, 979)

**Line 418-428**: Loading existing values
```javascript
const prizeFieldsResponse = await getPrizeFields();
const defaultJson = apiResponseToJsonConfig(prizeFieldsResponse);

const customConfigs = await getBancaPrizeConfig(id);
if (customConfigs && customConfigs.length > 0) {
  customJson = apiResponseToJsonConfig(customConfigs);
}

// Merge custom over defaults
const mergedJson = { ...defaultJson.config };
Object.entries(customJson.config).forEach(([betType, customFields]) => {
  mergedJson[betType] = { ...(defaultJson.config[betType] || {}), ...customFields };
});
```

#### 3. **usePremioDefaults.js** (Lines 7, 29)

**Custom hook for loading defaults**
```javascript
const response = await getPrizeFields();
const jsonConfig = apiResponseToJsonConfig(response);
setPrizeFieldsData(jsonConfig);
```

**Also provides**:
- `jsonConfigToFormData()` - JSON → frontend form fields
- `formDataToJsonConfig()` - Frontend form fields → JSON

---

## API Endpoints Structure

### From `/home/jorge/projects/LottoWebApp/src/services/prizeFieldService.js`

#### 1. `GET /prize-fields` - Get all defaults
**Response Structure:**
```json
[
  {
    "betTypeCode": "DIRECTO",
    "betTypeName": "Directo",
    "prizeFields": [
      {
        "prizeFieldId": 1,
        "fieldCode": "DIRECTO_PRIMER_PAGO",
        "fieldName": "Directo - Primer Pago",
        "defaultMultiplier": 56.00
      }
    ]
  }
]
```

#### 2. `GET /betting-pools/{id}/prize-config` - Get custom values
**Response Structure:**
```json
[
  {
    "prizeFieldId": 1,
    "fieldCode": "DIRECTO_PRIMER_PAGO",
    "customValue": 88.88
  }
]
```

#### 3. `POST /betting-pools/{id}/prize-config` - Save custom values
**Request Payload:**
```json
{
  "prizeConfigs": [
    {
      "prizeFieldId": 1,
      "fieldCode": "DIRECTO_PRIMER_PAGO",
      "value": 88.88
    }
  ]
}
```

---

## Problems with Current System

### 1. **Triple Format Complexity**
- Frontend uses `general_directo_primerPago`
- Intermediate uses `directo.primer_pago`
- API uses `DIRECTO_PRIMER_PAGO`
- **Why?** Originally because `field_name` was generic ("Primer Pago")

### 2. **Maintenance Burden**
- **486 lines** of mapping code
- **88 manual mappings** that must stay in sync with database
- Any new prize field requires updating 3+ places

### 3. **Error-Prone**
- Manual string mappings can have typos
- Easy to get out of sync with database
- Hard to debug conversion issues

### 4. **Performance Overhead**
- Multiple conversion passes on every load/save
- Unnecessary data transformations
- Additional memory overhead

### 5. **Now Redundant**
- With descriptive `field_name` in database, the intermediate "user-friendly" layer is pointless
- `field_code` already serves as the technical identifier
- `field_name` already serves as the display name

---

## Proposed Simplified Architecture

### Option 1: Use field_code Throughout (RECOMMENDED)

**Single Format Everywhere**
- Frontend: `general_DIRECTO_PRIMER_PAGO` (or just use object structure)
- API: `DIRECTO_PRIMER_PAGO`
- Display: Use `field_name` from API response

**Benefits:**
- ✅ Eliminate 486 lines of mapping code
- ✅ Single source of truth (database)
- ✅ No conversion overhead
- ✅ New fields work automatically
- ✅ Easier to maintain and debug

**Changes Required:**
1. Update CreateBanca/EditBanca to store prizes as:
   ```javascript
   formData.prizes = {
     DIRECTO_PRIMER_PAGO: 56,
     DIRECTO_SEGUNDO_PAGO: 28
   }
   ```

2. Update PremiosComisionesTab to render fields dynamically from API:
   ```javascript
   prizeFields.map(field => (
     <input
       key={field.fieldCode}
       name={field.fieldCode}
       value={formData.prizes[field.fieldCode] || field.defaultMultiplier}
       label={field.fieldName}  // "Directo - Primer Pago"
     />
   ))
   ```

3. Remove:
   - `premioFieldConverter.js` (entire file)
   - `jsonConfigToFormData()` from usePremioDefaults.js
   - `formDataToJsonConfig()` from usePremioDefaults.js

### Option 2: Simplified 2-Layer System (Alternative)

Keep frontend format but simplify conversion:
- Frontend: `general_directo_primerPago` (for backwards compatibility)
- API: `DIRECTO_PRIMER_PAGO`
- Conversion: Simple algorithmic transformation (no manual mappings)

```javascript
// Convert frontend → API
function toFieldCode(frontendKey) {
  const [lottery, betType, ...fieldParts] = frontendKey.split('_');
  const fieldName = fieldParts.join('_').replace(/([A-Z])/g, '_$1');
  return `${betType.toUpperCase()}_${fieldName.toUpperCase()}`;
}

// Convert API → frontend
function fromFieldCode(fieldCode, lottery = 'general') {
  const [betType, ...fieldParts] = fieldCode.toLowerCase().split('_');
  const camelFieldName = fieldParts.join('_').replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return `${lottery}_${betType}_${camelFieldName}`;
}
```

**Benefits:**
- ✅ Reduce mapping code from 486 → ~20 lines
- ✅ Works for any new fields automatically
- ✅ Backwards compatible with existing code
- ⚠️ Still maintains dual format (but simpler)

---

## Migration Path (Option 1 - Recommended)

### Phase 1: Refactor Prize Field Storage (2-3 hours)

1. **Update Form Data Structure**
   ```javascript
   // OLD
   formData = {
     general_directo_primerPago: 56,
     general_pale_todosEnSecuencia: 28,
     // ... 80+ more fields
   }

   // NEW
   formData = {
     prizes: {
       DIRECTO_PRIMER_PAGO: 56,
       PALE_TODOS_EN_SECUENCIA: 28
     }
   }
   ```

2. **Update CreateBanca.jsx**
   - Load defaults directly from API (no conversion)
   - Store in `formData.prizes` object
   - Save directly to API (no conversion)

3. **Update EditBanca.jsx**
   - Same as CreateBanca
   - Merge custom values directly (no conversion)

### Phase 2: Refactor PremiosComisionesTab (3-4 hours)

1. **Dynamic Field Rendering**
   ```javascript
   // Fetch prize fields from API
   const prizeFields = await getPrizeFields();

   // Group by bet type
   const groupedFields = groupBy(prizeFields, 'betTypeCode');

   // Render dynamically
   Object.entries(groupedFields).map(([betType, fields]) => (
     <div key={betType}>
       <h3>{betType}</h3>
       {fields.map(field => (
         <TextField
           key={field.fieldCode}
           name={field.fieldCode}
           label={field.fieldName}  // "Directo - Primer Pago"
           value={formData.prizes[field.fieldCode] ?? field.defaultMultiplier}
           onChange={(e) => handlePrizeChange(field.fieldCode, e.target.value)}
         />
       ))}
     </div>
   ))
   ```

2. **Benefits of Dynamic Rendering**
   - No hardcoded field names
   - Automatically handles new prize fields
   - Uses descriptive `field_name` from database
   - Cleaner, more maintainable code

### Phase 3: Cleanup (1 hour)

1. **Remove Files**
   - Delete `/src/utils/premioFieldConverter.js`
   - Remove conversion functions from `usePremioDefaults.js`

2. **Update API Calls**
   - Simplify `saveBancaPrizeConfig` calls
   - Remove intermediate conversion steps

3. **Testing**
   - Test create new banca with prize config
   - Test edit existing banca
   - Test prize field display
   - Test save/load custom values

---

## Testing Strategy

### Unit Tests
```javascript
describe('Prize Field Management', () => {
  it('should load default prize values from API', async () => {
    const defaults = await getPrizeFields();
    expect(defaults[0].fieldCode).toBe('DIRECTO_PRIMER_PAGO');
    expect(defaults[0].fieldName).toBe('Directo - Primer Pago');
  });

  it('should save custom prize values without conversion', async () => {
    const payload = {
      prizeConfigs: [
        { prizeFieldId: 1, fieldCode: 'DIRECTO_PRIMER_PAGO', value: 88 }
      ]
    };
    const result = await saveBancaPrizeConfig(123, payload);
    expect(result.savedCount).toBe(1);
  });

  it('should merge custom values over defaults', () => {
    const defaults = { DIRECTO_PRIMER_PAGO: 56 };
    const custom = { DIRECTO_PRIMER_PAGO: 88 };
    const merged = { ...defaults, ...custom };
    expect(merged.DIRECTO_PRIMER_PAGO).toBe(88);
  });
});
```

### Integration Tests
1. Create banca with custom prizes
2. Edit banca and verify values loaded correctly
3. Verify field names display descriptive text
4. Verify saves persist correctly

---

## Risk Assessment

### Low Risk
- ✅ API contract stays the same
- ✅ Database structure unchanged
- ✅ Only frontend refactoring
- ✅ Can test in isolation

### Medium Risk
- ⚠️ Need to test all prize field CRUD operations
- ⚠️ Need to verify existing data still works
- ⚠️ Need to update any tests that rely on old format

### Migration Impact
- **Existing Data**: No migration needed (API format unchanged)
- **Existing Code**: Only frontend components affected
- **API Endpoints**: No changes required
- **Database**: No changes required

---

## Cost-Benefit Analysis

### Current System Cost
- **Maintenance**: High (88 manual mappings)
- **Performance**: Medium (multiple conversions)
- **Complexity**: High (3 formats to understand)
- **Bug Risk**: High (manual sync required)
- **Onboarding**: Difficult (newcomers must understand 3 formats)

### Simplified System Benefits
- **Maintenance**: Low (data-driven)
- **Performance**: High (no conversions)
- **Complexity**: Low (single format)
- **Bug Risk**: Low (database is source of truth)
- **Onboarding**: Easy (straightforward structure)
- **Code Reduction**: -486 lines (-90%)

### Time Investment
- **Refactoring**: 6-8 hours
- **Testing**: 2-3 hours
- **Documentation**: 1 hour
- **Total**: ~1-2 days

### ROI
- **One-time cost**: 1-2 days
- **Ongoing savings**: ~2-4 hours/month (maintenance)
- **Payback period**: ~1-2 months
- **Long-term savings**: Significant (easier to add new prize fields)

---

## Recommendation

### Immediate Action: SIMPLIFY with Option 1

**Why:**
1. Database now has descriptive `field_name` - original reason for intermediate layer is gone
2. Current system is over-engineered for the problem
3. Maintenance burden will only grow as more prize fields are added
4. Simple, data-driven approach is more robust

**Next Steps:**
1. ✅ **Create feature branch**: `refactor/simplify-prize-mapping`
2. ✅ **Phase 1**: Refactor CreateBanca (3 hours)
3. ✅ **Phase 2**: Refactor EditBanca (3 hours)
4. ✅ **Phase 3**: Refactor PremiosComisionesTab (4 hours)
5. ✅ **Phase 4**: Test thoroughly (3 hours)
6. ✅ **Phase 5**: Remove old code and cleanup (1 hour)
7. ✅ **Phase 6**: Code review and merge

**Total Effort**: 1-2 days
**Expected Outcome**: -486 lines, simpler codebase, easier maintenance

---

## Additional Notes

### Why This Wasn't Obvious Before
The complexity was justified when:
- `field_name` was generic ("Primer Pago", "Segundo Pago")
- No way to distinguish between different bet types
- Needed frontend prefixing for context

### What Changed
- `field_name` is now descriptive ("Directo - Primer Pago")
- `field_code` is already unique and semantic
- Frontend can use `field_code` directly as identifier
- Display uses `field_name` from API

### Future Considerations
- New prize fields added to database work automatically
- No code changes needed for new bet types
- Display text controlled in database (easier to update)
- Internationalization becomes easier (add locale to field_name)

---

## Appendix: Code Examples

### Current Flow (Complex)
```
User enters value → formData (general_directo_primerPago)
                  ↓ formDataToJsonConfig
                  → JSON ({ directo: { primer_pago: 56 }})
                  ↓ jsonConfigToApiPayload
                  → API payload ([{ fieldCode: "DIRECTO_PRIMER_PAGO", value: 56 }])
                  ↓ API call
                  → Database
```

### Proposed Flow (Simple)
```
User enters value → formData.prizes (DIRECTO_PRIMER_PAGO: 56)
                  ↓ Direct API call
                  → Database
```

**Savings**: 2 conversion steps eliminated, ~400 lines of mapping code removed

---

**Document Version**: 1.0
**Date**: 2025-11-02
**Author**: Claude Code Assistant
**Status**: Recommendation Pending Review
