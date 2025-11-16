UPDATE dbo.prize_fields SET default_multiplier = 56.00, updated_at = GETUTCDATE() WHERE field_code = 'DIRECTO_PRIMER_PAGO';
SELECT @@ROWCOUNT AS RowsAffected;
