# Referencia de Colores y Abreviaturas de Sorteos

**Fuente:** Aplicación Vue.js original (https://la-numbers.apk.lol/#/sortition-informations)
**Fecha:** 2025-11-21

## Datos Extraídos de la Aplicación Original

| Nombre Sorteo | Abreviatura | Color (HEX) |
|---------------|-------------|-------------|
| Anguila 10am | AG AM | #FFEA00 |
| Anguila 1pm | AG PM | #FFEA00 |
| Anguila 6pm | AG NT | #FFEA00 |
| Anguila 9pm | AG 9PM | #FFEA00 |
| REAL | LR | #FF0000 |
| GANA MAS | GM | #FF0000 |
| FLORIDA AM | FL AM | #000000 |
| FLORIDA PM | FL PM | #15FF00 |
| NEW YORK DAY | NYAM | #0130FF |
| NEW YORK NIGHT | NY NT | #0130FF |
| GEORGIA-MID AM | GA AM | #F7A55B |
| GEORGIA EVENING | GA NT | #F7A55B |
| CALIFORNIA AM | CA AM | #D8FF00 |
| KING LOTTERY AM | KG AM | #FC03C6 |
| KING LOTTERY PM | KG PM | #FC03C6 |
| LOTEKA | LK | #0B6B00 |
| LEIDSA DIA | LS DIA | #000FAD |
| LEIDSA NOCHE | LS NT | #000FAD |
| LOTO POOL AM | LP AM | #40FF00 |
| LOTO POOL PM | LP PM | #40FF00 |
| NACIONAL DIA | NC DIA | #0390FC |
| NACIONAL NOCHE | NC NT | #0390FC |
| LA PRIMERA DIA | 1R DIA | #FCA503 |
| LA PRIMERA NOCHE | 1R NT | #FCA503 |
| QUINIELA PALE | QP | #6B03FC |
| LA SUERTE DIA | SU DIA | #FF0000 |
| LA SUERTE NT | SU NT | #FF0000 |
| CONNECTICUT AM | CT AM | #6494ED |
| CONNECTICUT PM | CT PM | #6494ED |
| MARYLAND AM | MD AM | #DC4556 |
| MARYLAND PM | MD PM | #DC4556 |
| MASS AM | MA AM | #015959 |
| MASS PM | MA PM | #015959 |
| NEW JERSEY AM | NJ AM | #DA8300 |
| NEW JERSEY PM | NJ PM | #DA8300 |
| OHIO AM | OH AM | #CC0000 |
| OHIO PM | OH PM | #CC0000 |
| PENN DAY | PA AM | #6D00CA |
| PENN NIGHT | PA PM | #6D00CA |
| MICHIGAN AM | MI AM | #005D8F |
| MICHIGAN PM | MI PM | #005D8F |
| SOUTH CAROLINA AM | SC AM | #F7B400 |
| SOUTH CAROLINA PM | SC PM | #F7B400 |
| VIRGINIA AM | VA AM | #2D54DB |
| VIRGINIA PM | VA PM | #2D54DB |
| WASHINGTON DC AM | DC AM | #BF1C1C |
| WASHINGTON DC PM | DC PM | #BF1C1C |
| DELAWARE AM | DE AM | #85DB6B |
| DELAWARE PM | DE PM | #85DB6B |
| NORTH CAROLINA AM | NC AM | #0091BA |
| NORTH CAROLINA PM | NC PM | #0091BA |
| TENNESSEE AM | TN AM | #F0630C |
| TENNESSEE PM | TN PM | #F0630C |
| RHODE ISLAND PM | RI PM | #6B5221 |
| TEXAS AM | TX AM | #A81C07 |
| TEXAS PM | TX PM | #A81C07 |
| INDIANA AM | IN AM | #00A859 |
| INDIANA PM | IN PM | #00A859 |
| KENTUCKY AM | KY AM | #1F61C2 |
| KENTUCKY PM | KY PM | #1F61C2 |
| DOMINICANA DIA | DM DIA | #03B1FC |
| DOMINICANA NT | DM NT | #03B1FC |
| ILLINOIS AM | IL AM | #F75A00 |
| ILLINOIS PM | IL PM | #F75A00 |
| MISSOURI AM | MO AM | #54C28C |
| MISSOURI PM | MO PM | #54C28C |
| NEW HAMPSHIRE AM | NH AM | #D173AF |
| NEW HAMPSHIRE PM | NH PM | #D173AF |

## Script SQL para Actualización Manual

```sql
-- Conéctese directamente a Azure SQL Database:
-- Server: lottery-sql-1505.database.windows.net
-- Database: lottery-db
-- User: lotteryAdmin
-- Password: NewLottery2025

-- Y ejecute estos UPDATEs directamente:

UPDATE draws SET abbreviation = 'FL PM', display_color = '#15FF00' WHERE draw_name = 'FLORIDA PM';
UPDATE draws SET abbreviation = 'NYAM', display_color = '#0130FF' WHERE draw_name = 'NEW YORK DAY';
UPDATE draws SET abbreviation = 'NY NT', display_color = '#0130FF' WHERE draw_name = 'NEW YORK NIGHT';
UPDATE draws SET abbreviation = 'GA AM', display_color = '#F7A55B' WHERE draw_name = 'GEORGIA-MID AM';
UPDATE draws SET abbreviation = 'GA NT', display_color = '#F7A55B' WHERE draw_name = 'GEORGIA EVENING';
-- ... (continuar con todos los sorteos)
```

## Problema Detectado

Las actualizaciones SQL ejecutadas via `SqlRunner` reportan éxito pero **no persisten en la base de datos**.

**Posibles causas:**
1. Problema de permisos del usuario `lotteryAdmin`
2. Trigger o constraint en la tabla `draws` que revierte cambios
3. Transacción no comprometida (aunque ADO.NET auto-commit está habilitado)
4. Cache en la API (aunque se reinició múltiples veces)

**Solución recomendada:**
Conectarse directamente a Azure SQL Database usando Azure Portal > Query Editor o SQL Server Management Studio y ejecutar los UPDATE manualmente.
