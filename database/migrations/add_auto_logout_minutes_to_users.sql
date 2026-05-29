-- Per-user idle auto-logout (admins). Mirrors what BettingPoolConfig has for
-- POS users, but stored on the user row so admins can be configured one-by-one
-- from the "Editar usuario" screen.
--
-- Semantics:
--   NULL  → use system default (15 min — current hardcoded behavior).
--   0     → disable auto-logout for this user.
--   > 0   → log out after that many idle minutes.
--
-- Idempotent: only adds the column when missing.

IF COL_LENGTH('dbo.users', 'auto_logout_minutes') IS NULL
BEGIN
  ALTER TABLE users ADD auto_logout_minutes INT NULL;
END;
