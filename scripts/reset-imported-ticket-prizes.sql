-- Reset prizes for imported tickets from 2026-02-01
-- These tickets don't exist in the original system and were incorrectly matched to results

-- First, let's see what we're dealing with
SELECT
    'Before reset' as status,
    COUNT(*) as total_lines,
    SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winning_lines,
    SUM(prize_won) as total_prizes
FROM ticket_lines tl
JOIN tickets t ON t.ticket_id = tl.ticket_id
WHERE t.notes LIKE 'Imported from%'
  AND CAST(tl.draw_date AS DATE) = '2026-02-01';

-- Reset prizes and winner status for imported tickets
UPDATE tl
SET
    is_winner = 0,
    prize_won = 0,
    winning_position = NULL
FROM ticket_lines tl
JOIN tickets t ON t.ticket_id = tl.ticket_id
WHERE t.notes LIKE 'Imported from%'
  AND CAST(tl.draw_date AS DATE) = '2026-02-01';

-- Verify the reset
SELECT
    'After reset' as status,
    COUNT(*) as total_lines,
    SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winning_lines,
    SUM(prize_won) as total_prizes
FROM ticket_lines tl
JOIN tickets t ON t.ticket_id = tl.ticket_id
WHERE t.notes LIKE 'Imported from%'
  AND CAST(tl.draw_date AS DATE) = '2026-02-01';

-- Also update ticket totals
UPDATE t
SET prize_total = 0
FROM tickets t
WHERE t.notes LIKE 'Imported from%'
  AND EXISTS (
    SELECT 1 FROM ticket_lines tl
    WHERE tl.ticket_id = t.ticket_id
      AND CAST(tl.draw_date AS DATE) = '2026-02-01'
  );

PRINT 'Prizes reset for imported tickets from 2026-02-01';
PRINT 'The imported tickets should NOT be processed against results';
PRINT 'because they do not exist in the original system for this banca.';
