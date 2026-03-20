-- Limit defaults table: stores default amounts per game type for zona and banca
-- Used when auto-creating zona limits (on zone creation) and pre-filling banca limits

CREATE TABLE limit_defaults (
    limit_default_id INT IDENTITY(1,1) PRIMARY KEY,
    default_type VARCHAR(20) NOT NULL, -- 'zona' or 'banca'
    game_type_id INT NOT NULL,
    max_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NULL,
    updated_by INT NULL,
    CONSTRAINT FK_limit_defaults_game_type FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id),
    CONSTRAINT UQ_limit_defaults_type_game UNIQUE (default_type, game_type_id)
);

-- Seed default values for all game types (zona defaults)
INSERT INTO limit_defaults (default_type, game_type_id, max_amount)
SELECT 'zona', game_type_id, 500.00
FROM game_types WHERE is_active = 1;

-- Seed default values for all game types (banca defaults)
INSERT INTO limit_defaults (default_type, game_type_id, max_amount)
SELECT 'banca', game_type_id, 200.00
FROM game_types WHERE is_active = 1;

-- Add MANAGE_LIMIT_DEFAULTS permission
INSERT INTO permissions (permission_code, permission_name, category, description, is_active)
VALUES ('MANAGE_LIMIT_DEFAULTS', 'Configurar límites por defecto', 'Limits', 'Permite modificar los montos por defecto para límites de zona y banca', 1);
