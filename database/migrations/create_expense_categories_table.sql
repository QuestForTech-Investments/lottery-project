-- Expense Categories table (parent-child hierarchy)
-- parent_category_id = NULL means it's a parent category
-- parent_category_id = <id> means it's a child category

CREATE TABLE expense_categories (
  category_id INT IDENTITY(1,1) PRIMARY KEY,
  category_name NVARCHAR(150) NOT NULL,
  parent_category_id INT NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  updated_at DATETIME2 NULL,
  FOREIGN KEY (parent_category_id) REFERENCES expense_categories(category_id)
);

CREATE INDEX IX_expense_categories_parent ON expense_categories(parent_category_id);
CREATE INDEX IX_expense_categories_active ON expense_categories(is_active);
