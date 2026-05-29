-- Email send log — one row per "Monitoreo de Jugadas" delivery attempt fired
-- when a lottery result is published. Lets ops answer "did the email reach
-- receiver X for draw Y?" without checking SMTP logs, and gives us the
-- idempotency check that prevents double-sends if a result is re-saved.
--
-- Status values:
--   SENT            → SMTP accepted the message.
--   FAILED          → SMTP rejected (error_message holds the reason).
--   SKIPPED_EMPTY   → Receiver had no plays in any of their zones for that
--                    draw/date — no email goes out (would just be empty).
--
-- Idempotent: guarded with IF NOT EXISTS so it can be re-run safely.

IF OBJECT_ID('dbo.email_send_log', 'U') IS NULL
BEGIN
  CREATE TABLE email_send_log (
    send_log_id INT IDENTITY(1,1) PRIMARY KEY,
    email_receiver_id INT NOT NULL,
    draw_id INT NOT NULL,
    result_date DATE NOT NULL,
    status NVARCHAR(20) NOT NULL,           -- 'SENT' | 'FAILED' | 'SKIPPED_EMPTY'
    subject NVARCHAR(500) NULL,
    error_message NVARCHAR(2000) NULL,
    sent_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_email_send_log_receiver
      FOREIGN KEY (email_receiver_id) REFERENCES email_receivers(email_receiver_id) ON DELETE CASCADE,
    CONSTRAINT FK_email_send_log_draw
      FOREIGN KEY (draw_id) REFERENCES draws(draw_id)
  );

  -- Idempotency: at most one SENT row per (receiver, draw, date). FAILED rows
  -- don't block a retry — only successful sends should suppress duplicates.
  -- We enforce uniqueness in code (notifier checks before sending) so this
  -- filtered index is a backstop, not the gate.
  CREATE UNIQUE INDEX UX_email_send_log_sent_once
    ON email_send_log(email_receiver_id, draw_id, result_date)
    WHERE status = 'SENT';

  CREATE INDEX IX_email_send_log_draw_date
    ON email_send_log(draw_id, result_date, sent_at DESC);
END;
