-- Verificar configuración de Pick Two (bet_type_id 15)
SELECT
  bt.bet_type_id,
  bt.bet_type_code,
  bt.bet_type_name,
  pt.prize_type_id,
  pt.field_code,
  pt.field_name,
  pt.default_multiplier,
  pt.display_order
FROM bet_types bt
LEFT JOIN prize_types pt ON bt.bet_type_id = pt.bet_type_id
WHERE bt.bet_type_id = 15
ORDER BY pt.display_order;
