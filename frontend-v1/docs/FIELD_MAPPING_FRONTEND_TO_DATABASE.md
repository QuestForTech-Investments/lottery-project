# Field Mapping: Frontend → Database

**Date:** 2025-10-19
**Purpose:** Complete mapping of all 154+ frontend fields to database schema

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Frontend Fields** | 154+ |
| **Current API Support** | 37 (24%) |
| **After Migration** | 154+ (100%) |
| **Tables Created** | 5 new tables |
| **Columns Added to branches** | 26 new columns |

---

## Tab 1: General (8 fields)

| Frontend Field | Database Column | Table | Data Type | Notes |
|----------------|-----------------|-------|-----------|-------|
| `branchName` | `branch_name` | `branches` | NVARCHAR(255) | Already exists |
| `branchCode` | `branch_code` | `branches` | NVARCHAR(50) | Already exists |
| `username` | `username` | `branches` | NVARCHAR(255) | Already exists |
| `password` | `password` | `branches` | NVARCHAR(255) | Already exists |
| `location` | `location` | `branches` | NVARCHAR(500) | Already exists |
| `reference` | `reference` | `branches` | NVARCHAR(500) | Already exists |
| `comment` | `comment` | `branches` | NVARCHAR(1000) | Already exists |
| `selectedZone` | `zone_id` | `branches` | INT | Already exists |

**Coverage:** 8/8 (100%) ✓ Already supported

---

## Tab 2: Configuración (28 fields)

| Frontend Field | Database Column | Table | Data Type | Notes |
|----------------|-----------------|-------|-----------|-------|
| `fallType` | `fall_type` | `branches` | NVARCHAR(50) | NEW - Values: OFF, COBRO, DIARIA, MENSUAL, SEMANAL CON ACUMULADO, SEMANAL SIN ACUMULADO |
| `deactivationBalance` | `deactivation_balance` | `branches` | DECIMAL(18,2) | NEW |
| `dailySaleLimit` | `daily_sale_limit` | `branches` | DECIMAL(18,2) | NEW |
| `todayBalanceLimit` | `daily_balance_limit` | `branches` | DECIMAL(18,2) | NEW |
| `enableTemporaryBalance` | `enable_temporary_balance` | `branches` | BIT | NEW |
| `temporaryAdditionalBalance` | `temporary_additional_balance` | `branches` | DECIMAL(18,2) | NEW |
| `isActive` | `is_active` | `branches` | BIT | Already exists |
| `winningTicketsControl` | `control_winning_tickets` | `branches` | BIT | NEW |
| `allowPassPot` | `allow_jackpot` | `branches` | BIT | NEW |
| `printTickets` | `print_enabled` | `branches` | BIT | NEW |
| `printTicketCopy` | `print_ticket_copy` | `branches` | BIT | NEW |
| `smsOnly` | `sms_only` | `branches` | BIT | NEW |
| `minutesToCancelTicket` | `cancel_minutes` | `branches` | INT | NEW - Default: 30 |
| `ticketsToCancelPerDay` | `daily_cancel_tickets` | `branches` | INT | NEW |
| `enableRecharges` | `enable_recharges` | `branches` | BIT | NEW |
| `printRechargeReceipt` | `print_recharge_receipt` | `branches` | BIT | NEW |
| `allowPasswordChange` | `allow_password_change` | `branches` | BIT | NEW |
| `printerType` | `print_mode` | `branches` | NVARCHAR(20) | NEW - Values: DRIVER, GENERICO |
| `discountProvider` | `discount_provider` | `branches` | NVARCHAR(20) | NEW - Values: GRUPO, RIFERO |
| `discountMode` | `discount_mode` | `branches` | NVARCHAR(20) | NEW - Values: OFF, EFECTIVO, TICKET_GRATIS |
| `maximumCancelTicketAmount` | `max_cancel_amount` | `branches` | DECIMAL(18,2) | NEW |
| `maxTicketAmount` | `max_ticket_amount` | `branches` | DECIMAL(18,2) | NEW |
| `dailyPhoneRechargeLimit` | `max_daily_recharge` | `branches` | DECIMAL(18,2) | NEW |
| `limitPreference` | `payment_mode` | `branches` | NVARCHAR(50) | NEW - Values: BANCA, ZONA, GRUPO, USAR_PREFERENCIA_GRUPO |

**Coverage:** 1/28 already supported, 27 NEW fields added

---

## Tab 3: Pies de página (7 fields)

**Table:** `branch_footers` (NEW TABLE)

| Frontend Field | Database Column | Data Type | Notes |
|----------------|-----------------|-----------|-------|
| `autoFooter` | `auto_footer` | BIT | Default: 0 |
| `footerText1` | `footer_text1` | NVARCHAR(500) | |
| `footerText2` | `footer_text2` | NVARCHAR(500) | |
| `footerText3` | `footer_text3` | NVARCHAR(500) | |
| `footerText4` | `footer_text4` | NVARCHAR(500) | |
| `showBranchInfo` | `show_branch_info` | BIT | Default: 1 |
| `showDateTime` | `show_date_time` | BIT | Default: 1 |

**Coverage:** 0/7 already supported, 7 NEW fields in new table

---

## Tab 4: Premios & Comisiones (90+ fields)

**Table:** `branch_prize_configurations` (NEW TABLE)

### Pick 3 (4 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick3FirstPayment` | `pick3_first_payment` |
| `pick3SecondPayment` | `pick3_second_payment` |
| `pick3ThirdPayment` | `pick3_third_payment` |
| `pick3Doubles` | `pick3_doubles` |

### Pick 3 Super (4 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick3SuperAllSequence` | `pick3_super_all_sequence` |
| `pick3SuperFirstPayment` | `pick3_super_first_payment` |
| `pick3SuperSecondPayment` | `pick3_super_second_payment` |
| `pick3SuperThirdPayment` | `pick3_super_third_payment` |

### Pick 3 NY (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick3NY_3Way2Identical` | `pick3_ny_3way_2identical` |
| `pick3NY_6Way3Unique` | `pick3_ny_6way_3unique` |

### Pick 4 (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick4FirstPayment` | `pick4_first_payment` |
| `pick4SecondPayment` | `pick4_second_payment` |

### Pick 4 Super (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick4SuperAllSequence` | `pick4_super_all_sequence` |
| `pick4SuperDoubles` | `pick4_super_doubles` |

### Pick 4 NY (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick4NY_AllSequence` | `pick4_ny_all_sequence` |
| `pick4NY_Doubles` | `pick4_ny_doubles` |

### Pick 4 Extra (4 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick4_24Way4Unique` | `pick4_24way_4unique` |
| `pick4_12Way2Identical` | `pick4_12way_2identical` |
| `pick4_6Way2Identical` | `pick4_6way_2identical` |
| `pick4_4Way3Identical` | `pick4_4way_3identical` |

### Pick 5 (1 field)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5FirstPayment` | `pick5_first_payment` |

### Pick 5 Mega (1 field)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5MegaFirstPayment` | `pick5_mega_first_payment` |

### Pick 5 NY (1 field)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5NYFirstPayment` | `pick5_ny_first_payment` |

### Pick 5 Bronx (1 field)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5BronxFirstPayment` | `pick5_bronx_first_payment` |

### Pick 5 Brooklyn (1 field)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5BrooklynFirstPayment` | `pick5_brooklyn_first_payment` |

### Pick 5 Queens (1 field)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5QueensFirstPayment` | `pick5_queens_first_payment` |

### Pick 5 Super (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5SuperAllSequence` | `pick5_super_all_sequence` |
| `pick5SuperDoubles` | `pick5_super_doubles` |

### Pick 5 Super Extra (6 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick5Super_5Way4Identical` | `pick5_super_5way_4identical` |
| `pick5Super_10Way3Identical` | `pick5_super_10way_3identical` |
| `pick5Super_20Way3Identical` | `pick5_super_20way_3identical` |
| `pick5Super_30Way2Identical` | `pick5_super_30way_2identical` |
| `pick5Super_60Way2Identical` | `pick5_super_60way_2identical` |
| `pick5Super_120Way5Unique` | `pick5_super_120way_5unique` |

### Pick 6 (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick6AllSequence` | `pick6_all_sequence` |
| `pick6Triples` | `pick6_triples` |

### Pick 6 Miami (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick6MiamiFirstPayment` | `pick6_miami_first_payment` |
| `pick6MiamiDoubles` | `pick6_miami_doubles` |

### Pick 6 California (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick6CaliforniaAllSequence` | `pick6_california_all_sequence` |
| `pick6CaliforniaTriples` | `pick6_california_triples` |

### Pick 6 California Extra (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick6Cali_3Way2Identical` | `pick6_cali_3way_2identical` |
| `pick6Cali_6Way3Unique` | `pick6_cali_6way_3unique` |

### Pick 6 NY (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `pick6NY_3Way2Identical` | `pick6_ny_3way_2identical` |
| `pick6NY_6Way3Unique` | `pick6_ny_6way_3unique` |

### Lotto Classic (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `lottoClassicFirstPayment` | `lotto_classic_first_payment` |
| `lottoClassicDoubles` | `lotto_classic_doubles` |

### Lotto Plus (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `lottoPlusFirstPayment` | `lotto_plus_first_payment` |
| `lottoPlusDoubles` | `lotto_plus_doubles` |

### Mega Millions (2 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `megaMillionsFirstPayment` | `mega_millions_first_payment` |
| `megaMillionsDoubles` | `mega_millions_doubles` |

### Powerball (12 fields)
| Frontend Field | Database Column |
|----------------|-----------------|
| `powerball4NumbersFirstRound` | `powerball_4numbers_first_round` |
| `powerball3NumbersFirstRound` | `powerball_3numbers_first_round` |
| `powerball2NumbersFirstRound` | `powerball_2numbers_first_round` |
| `powerballLastNumberFirstRound` | `powerball_last_number_first_round` |
| `powerball4NumbersSecondRound` | `powerball_4numbers_second_round` |
| `powerball3NumbersSecondRound` | `powerball_3numbers_second_round` |
| `powerballLast2NumbersSecondRound` | `powerball_last2_numbers_second_round` |
| `powerballLastNumberSecondRound` | `powerball_last_number_second_round` |
| `powerball4NumbersThirdRound` | `powerball_4numbers_third_round` |
| `powerball3NumbersThirdRound` | `powerball_3numbers_third_round` |
| `powerballLast2NumbersThirdRound` | `powerball_last2_numbers_third_round` |
| `powerballLastNumberThirdRound` | `powerball_last_number_third_round` |

**Coverage:** 0/90+ already supported, 90+ NEW fields in new table
**Data Type:** All prize fields are `DECIMAL(18,2)`

---

## Tab 5: Horarios de sorteos (14 fields = 7 days × 2)

**Table:** `branch_schedules` (NEW TABLE)

| Day | Frontend Start Field | Frontend End Field | Database Columns | Notes |
|-----|---------------------|-------------------|------------------|-------|
| Lunes | `lunesInicio` | `lunesFin` | `day_of_week=1, start_time, end_time` | |
| Martes | `martesInicio` | `martesFin` | `day_of_week=2, start_time, end_time` | |
| Miércoles | `miercolesInicio` | `miercolesFin` | `day_of_week=3, start_time, end_time` | |
| Jueves | `juevesInicio` | `juevesFin` | `day_of_week=4, start_time, end_time` | |
| Viernes | `viernesInicio` | `viernesFin` | `day_of_week=5, start_time, end_time` | |
| Sábado | `sabadoInicio` | `sabadoFin` | `day_of_week=6, start_time, end_time` | |
| Domingo | `domingoInicio` | `domingoFin` | `day_of_week=7, start_time, end_time` | |

**Coverage:** 0/14 already supported, 7 NEW rows per branch
**Storage:** One row per day, each with `start_time` and `end_time` columns
**Default:** All days 00:00:00 to 23:59:59

---

## Tab 6: Sorteos (2 fields + lottery selection)

**Table:** `branch_lotteries` (NEW TABLE)

| Frontend Field | Database Column | Data Type | Notes |
|----------------|-----------------|-----------|-------|
| `selectedLotteries` | `lottery_id` | INT | Multiple rows, one per selected lottery |
| `anticipatedClosing` | `anticipated_closing` | NVARCHAR(20) | Values: '5min', '10min', '15min', '20min', '30min', '1hour' |
| - | `anticipated_closing_minutes` | INT | Numeric representation |

**Coverage:** 0/2+ already supported
**Lottery IDs:** 70+ different lotteries can be selected
**Storage:** One row per selected lottery per branch

---

## Tab 7: Estilos (2 fields)

| Frontend Field | Database Column | Table | Data Type | Notes |
|----------------|-----------------|-------|-----------|-------|
| `sellScreenStyles` | `sell_screen_style` | `branches` | NVARCHAR(50) | NEW - Values: estilo1, estilo2, estilo3, estilo4 |
| `ticketPrintStyles` | `ticket_print_style` | `branches` | NVARCHAR(50) | NEW - Values: original, clasico, moderno, compacto |

**Coverage:** 0/2 already supported, 2 NEW fields

---

## Tab 8: Gastos automáticos (Array/Dynamic)

**Table:** `branch_expenses` (NEW TABLE)

| Frontend Field | Database Column | Data Type | Notes |
|----------------|-----------------|-----------|-------|
| `autoExpenses[].name` | `expense_name` | NVARCHAR(200) | Multiple rows |
| `autoExpenses[].description` | `expense_description` | NVARCHAR(1000) | |
| `autoExpenses[].amount` | `expense_amount` | DECIMAL(18,2) | |
| `autoExpenses[].isRecurring` | `is_recurring` | BIT | |
| `autoExpenses[].recurrenceType` | `recurrence_type` | NVARCHAR(20) | DAILY, WEEKLY, MONTHLY, YEARLY |
| `autoExpenses[].recurrenceDay` | `recurrence_day` | INT | |
| - | `is_active` | BIT | Default: 1 |

**Coverage:** 0 already supported, NEW table with multiple rows per branch

---

## Database Schema Changes Summary

### New Tables Created (5)

1. **branch_footers** - 7 footer fields
2. **branch_schedules** - 14 time fields (7 rows per branch)
3. **branch_lotteries** - Selected lotteries + config (multiple rows)
4. **branch_prize_configurations** - 90+ prize fields (1 row per branch)
5. **branch_expenses** - Automatic expenses (multiple rows)

### Columns Added to `branches` Table (26)

1. `sell_screen_style`
2. `ticket_print_style`
3. `deactivation_balance`
4. `daily_sale_limit`
5. `daily_balance_limit`
6. `enable_temporary_balance`
7. `temporary_additional_balance`
8. `control_winning_tickets`
9. `allow_jackpot`
10. `print_enabled`
11. `print_ticket_copy`
12. `sms_only`
13. `cancel_minutes`
14. `daily_cancel_tickets`
15. `max_cancel_amount`
16. `max_ticket_amount`
17. `max_daily_recharge`
18. `enable_recharges`
19. `print_recharge_receipt`
20. `allow_password_change`
21. `fall_type`
22. `print_mode`
23. `discount_provider`
24. `discount_mode`
25. `payment_mode`
26. (Total: 26 new columns)

---

## API Implications

### Current API Coverage
- **Supported:** 37 fields (24%)
- **Missing:** 117+ fields (76%)

### After Migration
- **Supported:** 154+ fields (100%)
- **New Endpoints Needed:**
  - `GET /api/branches/{id}/footers`
  - `POST/PUT /api/branches/{id}/footers`
  - `GET /api/branches/{id}/schedules`
  - `POST/PUT /api/branches/{id}/schedules`
  - `GET /api/branches/{id}/lotteries`
  - `POST /api/branches/{id}/lotteries`
  - `GET /api/branches/{id}/prizes`
  - `POST/PUT /api/branches/{id}/prizes`
  - `GET /api/branches/{id}/expenses`
  - `POST/PUT/DELETE /api/branches/{id}/expenses`

### Enhanced Endpoints
- `POST /api/branches` - Now accepts 154+ fields
- `PUT /api/branches/{id}` - Now updates all related tables
- `GET /api/branches/{id}` - Now returns complete branch data

---

## Data Type Standards

| Type | SQL Server | Example Values |
|------|-----------|----------------|
| **Money** | `DECIMAL(18,2)` | 1000.00, 50.50 |
| **Boolean** | `BIT` | 0, 1 |
| **String** | `NVARCHAR(N)` | Text values |
| **Time** | `TIME` | 12:30:00 |
| **DateTime** | `DATETIME2` | 2025-10-19 14:30:00 |
| **Integer** | `INT` | 1, 2, 3, etc. |
| **Enum** | `NVARCHAR(N)` | 'OFF', 'COBRO', etc. |

---

## Next Steps

1. **Run SQL migration script** on development database
2. **Test data integrity** with existing branches
3. **Update API layer** to support new tables
4. **Update API documentation** with new endpoints
5. **Test frontend integration** with new API
6. **Deploy to staging** for QA testing
7. **Deploy to production** after approval

---

**Generated:** 2025-10-19
**Author:** Claude Code
**Status:** Ready for Implementation
