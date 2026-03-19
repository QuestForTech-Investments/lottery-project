-- Per-game-type amounts for limit rules
-- Each limit rule can have different max amounts for each game type (directo, pale, tripleta, etc.)

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'limit_rule_amounts')
BEGIN
    CREATE TABLE limit_rule_amounts (
        limit_rule_amount_id INT IDENTITY(1,1) PRIMARY KEY,
        limit_rule_id INT NOT NULL,
        game_type_code VARCHAR(50) NOT NULL,
        max_amount DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_limit_rule_amounts_rule FOREIGN KEY (limit_rule_id)
            REFERENCES limit_rules(limit_rule_id) ON DELETE CASCADE,
        CONSTRAINT UQ_limit_rule_game_type UNIQUE (limit_rule_id, game_type_code)
    );

    CREATE INDEX IX_limit_rule_amounts_rule ON limit_rule_amounts(limit_rule_id);
END
GO
