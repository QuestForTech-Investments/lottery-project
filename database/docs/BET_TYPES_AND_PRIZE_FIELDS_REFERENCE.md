# Lottery Database - Bet Types and Prize Fields Reference

**Last Updated:** 2025-11-02
**Database:** lottery-db
**Server:** lottery-sql-1505.database.windows.net

---

## Table of Contents

1. [Overview](#overview)
2. [Bet Types Reference](#bet-types-reference)
3. [Prize Fields Reference](#prize-fields-reference)
4. [Database Schema](#database-schema)
5. [Change Log](#change-log)

---

## Overview

This document provides the complete reference for all bet types and their associated prize fields in the lottery system.

**Summary:**
- **Total Bet Types:** 23
- **Total Prize Fields:** 50
- **Active Bet Types:** 23
- **Active Prize Fields:** 50

---

## Bet Types Reference

### Complete List of Bet Types

| # | Code | Name | Description | Display Order |
|---|------|------|-------------|---------------|
| 1 | DIRECTO | Directo | Straight bet on exact number in exact position | 1 |
| 2 | PALÉ | Palé | Two digits in any order | 2 |
| 3 | TRIPLETA | Tripleta | Three digits in any order | 3 |
| 4 | SUPER PALÉ | Super Palé | Enhanced pale bet with higher payout | 4 |
| 5 | PICK TWO FRONT | Pick Two Front | First two digits exact order | 5 |
| 6 | PICK TWO BACK | Pick Two Back | Last two digits exact order | 6 |
| 7 | PICK TWO MIDDLE | Pick Two Middle | Middle two digits exact order | 7 |
| 8 | CASH3 STRAIGHT | Cash3 Straight | Three digits in exact order (Cash3) | 8 |
| 9 | CASH3 BOX | Cash3 Box | Three digits in any order (Cash3) | 9 |
| 10 | CASH3 FRONT STRAIGHT | Cash3 Front Straight | First three digits in exact order (Cash3) | 10 |
| 11 | CASH3 BACK STRAIGHT | Cash3 Back Straight | Last three digits in exact order (Cash3) | 11 |
| 12 | PLAY4 STRAIGHT | Play4 Straight | Four digits in exact order (Play4) | 12 |
| 13 | PLAY4 BOX | Play4 Box | Four digits in any order (Play4) | 13 |
| 14 | BOLITA 1 | Bolita 1 | Bolita game type 1 | 14 |
| 15 | BOLITA 2 | Bolita 2 | Bolita game type 2 | 15 |
| 16 | SINGULACIÓN 1 | Singulación 1 | Singulation game type 1 | 16 |
| 17 | SINGULACIÓN 2 | Singulación 2 | Singulation game type 2 | 17 |
| 18 | SINGULACIÓN 3 | Singulación 3 | Singulation game type 3 | 18 |
| 19 | PICK5 STRAIGHT | Pick5 Straight | Five digits in exact order | 19 |
| 20 | PICK5 BOX | Pick5 Box | Five digits in any order | 20 |
| 21 | PICK TWO | Pick Two | Two digits exact order (generic) | 21 |
| 22 | CASH3 FRONT BOX | Cash3 Front Box | First three digits in any order (Cash3) | 22 |
| 23 | CASH3 BACK BOX | Cash3 Back Box | Last three digits in any order (Cash3) | 23 |

---

## Prize Fields Reference

### 1. DIRECTO (4 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| DIRECTO_PRIMER_PAGO | Directo - Primer Pago | 56.00 |
| DIRECTO_SEGUNDO_PAGO | Directo - Segundo Pago | 12.00 |
| DIRECTO_TERCER_PAGO | Directo - Tercer Pago | 4.00 |
| DIRECTO_DOBLES | Directo - Dobles | 56.00 |

### 2. PALÉ (4 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PALE_TODOS_EN_SECUENCIA | Pale - Todos en secuencia | 1100.00 |
| PALE_PRIMER_PAGO | Pale - Primer Pago | 1100.00 |
| PALE_SEGUNDO_PAGO | Pale - Segundo Pago | 1100.00 |
| PALE_TERCER_PAGO | Pale - Tercer Pago | 100.00 |

### 3. TRIPLETA (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| TRIPLETA_PRIMER_PAGO | Tripleta - Primer Pago | 10000.00 |
| TRIPLETA_SEGUNDO_PAGO | Tripleta - Segundo Pago | 100.00 |

### 4. SUPER PALÉ (1 field)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| SUPER_PALE_PRIMER_PAGO | Super Pale - Primer Pago | 2000.00 |

### 5. PICK TWO FRONT (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PICK_TWO_FRONT_PRIMER_PAGO | Pick Two Front - Primer Pago | 75.00 |
| PICK_TWO_FRONT_DOBLES | Pick Two Front - Dobles | 75.00 |

### 6. PICK TWO BACK (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PICK_TWO_BACK_PRIMER_PAGO | Pick Two Back - Primer Pago | 75.00 |
| PICK_TWO_BACK_DOBLES | Pick Two Back - Dobles | 75.00 |

### 7. PICK TWO MIDDLE (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PICK_TWO_MIDDLE_PRIMER_PAGO | Pick Two Middle - Primer Pago | 75.00 |
| PICK_TWO_MIDDLE_DOBLES | Pick Two Middle - Dobles | 75.00 |

### 8. CASH3 STRAIGHT (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| CASH3_STRAIGHT_TODOS_EN_SECUENCIA | Cash3 Straight - Todos en secuencia | 600.00 |
| CASH3_STRAIGHT_TRIPLES | Cash3 Straight - Triples | 600.00 |

### 9. CASH3 BOX (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| CASH3_BOX_3WAY | Cash3 Box - 3-Way: 2 idénticos | 100.00 |
| CASH3_BOX_6WAY | Cash3 Box - 6-Way: 3 únicos | 100.00 |

### 10. CASH3 FRONT STRAIGHT (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| CASH3_FRONT_STRAIGHT_TODOS_EN_SECUENCIA | Cash3 Front Straight - Todos en secuencia | 600.00 |
| CASH3_FRONT_STRAIGHT_TRIPLES | Cash3 Front Straight - Triples | 600.00 |

### 11. CASH3 BACK STRAIGHT (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| CASH3_BACK_STRAIGHT_TODOS_EN_SECUENCIA | Cash3 Back Straight - Todos en secuencia | 600.00 |
| CASH3_BACK_STRAIGHT_TRIPLES | Cash3 Back Straight - Triples | 600.00 |

### 12. PLAY4 STRAIGHT (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PLAY4_STRAIGHT_TODOS_EN_SECUENCIA | Play4 Straight - Todos en secuencia | 5000.00 |
| PLAY4_STRAIGHT_DOBLES | Play4 Straight - Dobles | 5000.00 |

### 13. PLAY4 BOX (4 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PLAY4_BOX_24WAY | Play4 Box - 24-Way: 4 únicos | 200.00 |
| PLAY4_BOX_12WAY | Play4 Box - 12-Way: 2 idénticos | 200.00 |
| PLAY4_BOX_6WAY | Play4 Box - 6-Way: 2 idénticos | 200.00 |
| PLAY4_BOX_4WAY | Play4 Box - 4-Way: 3 idénticos | 200.00 |

### 14. BOLITA 1 (1 field)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| BOLITA_1_PRIMER_PAGO | Bolita 1 - Primer Pago | 75.00 |

### 15. BOLITA 2 (1 field)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| BOLITA_2_PRIMER_PAGO | Bolita 2 - Primer Pago | 75.00 |

### 16. SINGULACIÓN 1 (1 field)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| SINGULACION_1_PRIMER_PAGO | Singulación 1 - Primer Pago | 9.00 |

### 17. SINGULACIÓN 2 (1 field)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| SINGULACION_2_PRIMER_PAGO | Singulación 2 - Primer Pago | 9.00 |

### 18. SINGULACIÓN 3 (1 field)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| SINGULACION_3_PRIMER_PAGO | Singulación 3 - Primer Pago | 9.00 |

### 19. PICK5 STRAIGHT (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PICK5_STRAIGHT_TODOS_EN_SECUENCIA | Pick5 Straight - Todos en secuencia | 30000.00 |
| PICK5_STRAIGHT_DOBLES | Pick5 Straight - Dobles | 30000.00 |

### 20. PICK5 BOX (6 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PICK5_BOX_5WAY | Pick5 Box - 5-Way: 4 idénticos | 10000.00 |
| PICK5_BOX_10WAY | Pick5 Box - 10-Way: 3 idénticos | 5000.00 |
| PICK5_BOX_20WAY | Pick5 Box - 20-Way: 3 idénticos | 2500.00 |
| PICK5_BOX_30WAY | Pick5 Box - 30-Way: 2 idénticos | 1660.00 |
| PICK5_BOX_60WAY | Pick5 Box - 60-Way: 2 idénticos | 830.00 |
| PICK5_BOX_120WAY | Pick5 Box - 120-Way: 5 únicos | 416.00 |

### 21. PICK TWO (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| PICK_TWO_PRIMER_PAGO | Pick Two - Primer Pago | 75.00 |
| PICK_TWO_DOBLES | Pick Two - Dobles | 75.00 |

### 22. CASH3 FRONT BOX (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| CASH3_FRONT_BOX_3WAY | Cash3 Front Box - 3-Way: 2 idénticos | 100.00 |
| CASH3_FRONT_BOX_6WAY | Cash3 Front Box - 6-Way: 3 únicos | 100.00 |

### 23. CASH3 BACK BOX (2 fields)

| Field Code | Field Name | Default Multiplier |
|------------|------------|-------------------|
| CASH3_BACK_BOX_3WAY | Cash3 Back Box - 3-Way: 2 idénticos | 100.00 |
| CASH3_BACK_BOX_6WAY | Cash3 Back Box - 6-Way: 3 únicos | 100.00 |

---

## Database Schema

### Table: `bet_types`

```sql
CREATE TABLE bet_types (
    bet_type_id INT IDENTITY(1,1) PRIMARY KEY,
    bet_type_code NVARCHAR(50) NOT NULL UNIQUE,
    bet_type_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    display_order INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

### Table: `prize_fields`

```sql
CREATE TABLE prize_fields (
    prize_field_id INT IDENTITY(1,1) PRIMARY KEY,
    bet_type_id INT NOT NULL,
    field_code NVARCHAR(100) NOT NULL,
    field_name NVARCHAR(255) NOT NULL,
    default_multiplier DECIMAL(18,2) NOT NULL DEFAULT 0,
    min_multiplier DECIMAL(18,2) NOT NULL DEFAULT 0,
    max_multiplier DECIMAL(18,2) NOT NULL DEFAULT 9999999.99,
    display_order INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_prize_fields_bet_types FOREIGN KEY (bet_type_id) REFERENCES bet_types(bet_type_id),
    CONSTRAINT UQ_prize_fields_field_code UNIQUE (bet_type_id, field_code)
);
```

### Indexes

```sql
-- Bet Types
CREATE INDEX IX_bet_types_code ON bet_types(bet_type_code) WHERE is_active = 1;
CREATE INDEX IX_bet_types_active_order ON bet_types(is_active, display_order);

-- Prize Fields
CREATE INDEX IX_prize_fields_bet_type ON prize_fields(bet_type_id) WHERE is_active = 1;
CREATE INDEX IX_prize_fields_code ON prize_fields(field_code) WHERE is_active = 1;
CREATE INDEX IX_prize_fields_active_order ON prize_fields(bet_type_id, is_active, display_order);
```

---

## Change Log

### 2025-11-02 - Prize Fields Update

**Changes:**
- ✅ Corrected all bet type names (PALE → PALÉ with accent)
- ✅ Updated all 50 prize fields with descriptive `field_name` values
- ✅ Corrected all `default_multiplier` values to match specifications
- ✅ Added missing bet types: CASH3 STRAIGHT, CASH3 BOX, etc.
- ✅ Removed incorrect CASH4 references (changed to CASH3)

**Files Updated:**
- `MIGRATION_PRIZE_FIELDS_UPDATE_2025-11-02.sql` - Migration script
- `BET_TYPES_AND_PRIZE_FIELDS_REFERENCE.md` - This document
- `database_schema_documentation.md` - Schema documentation

**Database Impact:**
- All existing betting pool configurations remain compatible
- Frontend applications now use `field_code` directly (no conversion needed)
- Eliminated 486-line `premioFieldConverter.js` mapping system

### Previous Updates

See `SCHEMA_UPDATES_2025-10-22.md` for previous database changes.

---

## Notes

### Field Naming Convention

**field_code:** UPPERCASE_SNAKE_CASE
- Example: `DIRECTO_PRIMER_PAGO`, `PALE_TODOS_EN_SECUENCIA`
- Used as unique technical identifier
- Used directly in API and frontend

**field_name:** Descriptive Spanish text
- Example: "Directo - Primer Pago", "Pale - Todos en secuencia"
- Used for display in UI
- Eliminates need for hardcoded labels

### Default Multiplier Ranges

- **Minimum:** 0.00 (all fields)
- **Maximum:** 9,999,999.99 (standard), 100,000.00 (some high-value fields)
- **Default Values:** Range from 4.00 (Directo Tercer Pago) to 30,000.00 (Pick5 Straight)

### Active vs Inactive Records

- All current records have `is_active = 1`
- Inactive records preserved for historical data
- Use `WHERE is_active = 1` in queries for current data

---

**End of Document**
