-- Cleanup incorrect Anguilla results
-- Only Anguila 10am (draw_id 159) should have results
-- Remove results for:
-- - Anguila 1pm (draw_id 160)
-- - Anguila 6PM (draw_id 146)
-- - Anguila 9pm (draw_id 154)

-- First show what will be deleted
SELECT r.result_id, d.draw_name, r.winning_number, r.result_date
FROM results r
JOIN draws d ON r.draw_id = d.draw_id
WHERE r.draw_id IN (160, 146, 154)
ORDER BY r.result_date DESC;

-- Delete the incorrect results
DELETE FROM results
WHERE draw_id IN (160, 146, 154);

-- Verify only Anguila 10am remains
SELECT r.result_id, d.draw_name, r.winning_number, r.result_date
FROM results r
JOIN draws d ON r.draw_id = d.draw_id
WHERE d.draw_name LIKE '%nguila%'
ORDER BY r.result_date DESC;
