#!/usr/bin/env python3
"""
Generate complete SQL schema from Azure SQL Database
Extracts: Tables, Stored Procedures, Views
"""

import subprocess
import json
from datetime import datetime

# Connection details
SERVER = "lottery-sql-1505.database.windows.net"
DATABASE = "lottery-db"
USER = "lotteryAdmin"
PASSWORD = "IotSlotsLottery123"

def run_query(query, output_format='table'):
    """Execute SQL query using sqlcmd"""
    cmd = [
        '/opt/mssql-tools18/bin/sqlcmd',
        '-S', SERVER,
        '-d', DATABASE,
        '-U', USER,
        '-P', PASSWORD,
        '-C',
        '-Q', query,
        '-s', '|',  # Column separator
        '-W'  # Remove trailing spaces
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def get_tables_info():
    """Get all tables with column information"""
    query = """
    SELECT
        t.name AS TableName,
        c.name AS ColumnName,
        ty.name AS DataType,
        c.max_length AS MaxLength,
        c.precision AS Precision,
        c.scale AS Scale,
        c.is_nullable AS IsNullable,
        c.is_identity AS IsIdentity,
        ISNULL(CAST(ic.seed_value AS VARCHAR), '') AS IdentitySeed,
        ISNULL(CAST(ic.increment_value AS VARCHAR), '') AS IdentityIncrement,
        ISNULL(dc.definition, '') AS DefaultValue,
        c.column_id AS ColumnOrder
    FROM sys.tables t
    INNER JOIN sys.columns c ON t.object_id = c.object_id
    INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
    LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
    LEFT JOIN sys.identity_columns ic ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE t.type = 'U'
    ORDER BY t.name, c.column_id;
    """
    return run_query(query)

def get_primary_keys():
    """Get all primary key constraints"""
    query = """
    SELECT
        t.name AS TableName,
        kc.name AS ConstraintName,
        c.name AS ColumnName,
        ic.key_ordinal AS KeyOrder
    FROM sys.tables t
    INNER JOIN sys.key_constraints kc ON t.object_id = kc.parent_object_id
    INNER JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE kc.type = 'PK'
    ORDER BY t.name, ic.key_ordinal;
    """
    return run_query(query)

def get_foreign_keys():
    """Get all foreign key constraints"""
    query = """
    SELECT
        OBJECT_NAME(fk.parent_object_id) AS TableName,
        fk.name AS ConstraintName,
        COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
        OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
        COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn,
        fk.delete_referential_action_desc AS OnDelete,
        fk.update_referential_action_desc AS OnUpdate
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    ORDER BY TableName, ConstraintName;
    """
    return run_query(query)

def get_indexes():
    """Get all indexes (excluding primary keys)"""
    query = """
    SELECT
        t.name AS TableName,
        i.name AS IndexName,
        i.is_unique AS IsUnique,
        c.name AS ColumnName,
        ic.key_ordinal AS KeyOrder
    FROM sys.tables t
    INNER JOIN sys.indexes i ON t.object_id = i.object_id
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.is_primary_key = 0 AND i.type > 0
    ORDER BY t.name, i.name, ic.key_ordinal;
    """
    return run_query(query)

def get_stored_procedures():
    """Get all stored procedures with definitions"""
    query = """
    SELECT
        p.name AS ProcedureName,
        OBJECT_DEFINITION(p.object_id) AS Definition
    FROM sys.procedures p
    WHERE p.type = 'P'
    ORDER BY p.name;
    """
    return run_query(query)

def get_views():
    """Get all views with definitions"""
    query = """
    SELECT
        v.name AS ViewName,
        OBJECT_DEFINITION(v.object_id) AS Definition
    FROM sys.views v
    ORDER BY v.name;
    """
    return run_query(query)

def parse_table_output(output):
    """Parse sqlcmd table output into list of dictionaries"""
    lines = [line.strip() for line in output.split('\n') if line.strip()]
    if len(lines) < 3:
        return []

    # First line is headers
    headers = [h.strip() for h in lines[0].split('|')]

    # Skip separator line (index 1)
    data = []
    for line in lines[2:]:
        if '(' in line and 'rows affected' in line:
            break
        values = [v.strip() for v in line.split('|')]
        if len(values) == len(headers):
            row = dict(zip(headers, values))
            data.append(row)

    return data

def generate_data_type(col):
    """Generate SQL data type string from column info"""
    data_type = col['DataType']

    # Handle special types
    if data_type in ['nvarchar', 'varchar', 'nchar', 'char']:
        max_len = int(col['MaxLength'])
        if data_type.startswith('n'):
            max_len = max_len // 2  # nvarchar uses 2 bytes per char
        if max_len == -1:
            return f"{data_type}(MAX)"
        else:
            return f"{data_type}({max_len})"
    elif data_type in ['decimal', 'numeric']:
        precision = col['Precision']
        scale = col['Scale']
        return f"{data_type}({precision},{scale})"
    elif data_type in ['varbinary', 'binary']:
        max_len = int(col['MaxLength'])
        if max_len == -1:
            return f"{data_type}(MAX)"
        else:
            return f"{data_type}({max_len})"
    else:
        return data_type

def generate_create_table(table_name, columns, primary_keys, foreign_keys, indexes):
    """Generate CREATE TABLE statement"""
    sql = f"-- Table: {table_name}\n"
    sql += f"CREATE TABLE [{table_name}] (\n"

    # Add columns
    col_definitions = []
    for col in columns:
        if col['TableName'] != table_name:
            continue

        col_def = f"    [{col['ColumnName']}] {generate_data_type(col)}"

        # Add IDENTITY
        if col['IsIdentity'] == '1':
            seed = col.get('IdentitySeed', '1')
            incr = col.get('IdentityIncrement', '1')
            col_def += f" IDENTITY({seed},{incr})"

        # Add NULL/NOT NULL
        if col['IsNullable'] == '0':
            col_def += " NOT NULL"
        else:
            col_def += " NULL"

        # Add DEFAULT
        if col['DefaultValue']:
            col_def += f" DEFAULT {col['DefaultValue']}"

        col_definitions.append(col_def)

    sql += ',\n'.join(col_definitions)

    # Add PRIMARY KEY constraint
    table_pks = [pk for pk in primary_keys if pk['TableName'] == table_name]
    if table_pks:
        pk_name = table_pks[0]['ConstraintName']
        pk_cols = [pk['ColumnName'] for pk in sorted(table_pks, key=lambda x: int(x['KeyOrder']))]
        sql += f",\n    CONSTRAINT [{pk_name}] PRIMARY KEY CLUSTERED ({', '.join([f'[{col}]' for col in pk_cols])})"

    sql += "\n);\n"

    # Add FOREIGN KEY constraints
    table_fks = {}
    for fk in foreign_keys:
        if fk['TableName'] != table_name:
            continue
        fk_name = fk['ConstraintName']
        if fk_name not in table_fks:
            table_fks[fk_name] = []
        table_fks[fk_name].append(fk)

    for fk_name, fk_list in table_fks.items():
        fk = fk_list[0]
        cols = [f"[{f['ColumnName']}]" for f in fk_list]
        ref_cols = [f"[{f['ReferencedColumn']}]" for f in fk_list]
        sql += f"ALTER TABLE [{table_name}] ADD CONSTRAINT [{fk_name}] FOREIGN KEY ({', '.join(cols)}) "
        sql += f"REFERENCES [{fk['ReferencedTable']}] ({', '.join(ref_cols)})"

        if fk['OnDelete'] != 'NO_ACTION':
            sql += f" ON DELETE {fk['OnDelete'].replace('_', ' ')}"
        if fk['OnUpdate'] != 'NO_ACTION':
            sql += f" ON UPDATE {fk['OnUpdate'].replace('_', ' ')}"
        sql += ";\n"

    # Add indexes
    table_indexes = {}
    for idx in indexes:
        if idx['TableName'] != table_name:
            continue
        idx_name = idx['IndexName']
        if idx_name not in table_indexes:
            table_indexes[idx_name] = {
                'is_unique': idx['IsUnique'],
                'columns': []
            }
        table_indexes[idx_name]['columns'].append(idx['ColumnName'])

    for idx_name, idx_info in table_indexes.items():
        unique_str = "UNIQUE " if idx_info['is_unique'] == '1' else ""
        cols = ', '.join([f"[{col}]" for col in idx_info['columns']])
        sql += f"CREATE {unique_str}NONCLUSTERED INDEX [{idx_name}] ON [{table_name}] ({cols});\n"

    sql += "\n"
    return sql

def main():
    print("Extracting database schema from Azure SQL...")
    print(f"Server: {SERVER}")
    print(f"Database: {DATABASE}")
    print()

    # Get all schema information
    print("Fetching tables and columns...")
    tables_output = get_tables_info()
    tables_data = parse_table_output(tables_output)

    print("Fetching primary keys...")
    pk_output = get_primary_keys()
    pk_data = parse_table_output(pk_output)

    print("Fetching foreign keys...")
    fk_output = get_foreign_keys()
    fk_data = parse_table_output(fk_output)

    print("Fetching indexes...")
    idx_output = get_indexes()
    idx_data = parse_table_output(idx_output)

    print("Fetching stored procedures...")
    sp_output = get_stored_procedures()
    sp_data = parse_table_output(sp_output)

    print("Fetching views...")
    view_output = get_views()
    view_data = parse_table_output(view_output)

    # Get unique table names
    table_names = sorted(set(col['TableName'] for col in tables_data))

    print(f"\nFound:")
    print(f"  - {len(table_names)} tables")
    print(f"  - {len(sp_data)} stored procedures")
    print(f"  - {len(view_data)} views")
    print()

    # Generate SQL script
    print("Generating SQL script...")

    sql_script = f"""-- ============================================
-- Lottery Database - Complete Schema
-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- Tables: {len(table_names)} | Stored Procedures: {len(sp_data)} | Views: {len(view_data)}
-- ============================================
-- Server: {SERVER}
-- Database: {DATABASE}
-- ============================================

USE [{DATABASE}];
GO

-- ============================================
-- DROP EXISTING OBJECTS
-- ============================================

-- Drop foreign keys first
"""

    # Add DROP statements for foreign keys
    for fk in fk_data:
        sql_script += f"IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = '{fk['ConstraintName']}')\n"
        sql_script += f"    ALTER TABLE [{fk['TableName']}] DROP CONSTRAINT [{fk['ConstraintName']}];\n"

    sql_script += "\n-- Drop tables\n"
    for table in reversed(table_names):
        sql_script += f"IF OBJECT_ID('[{table}]', 'U') IS NOT NULL DROP TABLE [{table}];\n"

    sql_script += "\n-- Drop stored procedures\n"
    for sp in sp_data:
        sql_script += f"IF OBJECT_ID('[{sp['ProcedureName']}]', 'P') IS NOT NULL DROP PROCEDURE [{sp['ProcedureName']}];\n"

    sql_script += "\n-- Drop views\n"
    for view in view_data:
        sql_script += f"IF OBJECT_ID('[{view['ViewName']}]', 'V') IS NOT NULL DROP VIEW [{view['ViewName']}];\n"

    sql_script += "\nGO\n\n"

    # Add CREATE TABLE statements
    sql_script += "-- ============================================\n"
    sql_script += "-- CREATE TABLES\n"
    sql_script += "-- ============================================\n\n"

    for table in table_names:
        sql_script += generate_create_table(table, tables_data, pk_data, fk_data, idx_data)

    sql_script += "GO\n\n"

    # Add stored procedures
    sql_script += "-- ============================================\n"
    sql_script += "-- CREATE STORED PROCEDURES\n"
    sql_script += "-- ============================================\n\n"

    for sp in sp_data:
        sql_script += f"-- Stored Procedure: {sp['ProcedureName']}\n"
        sql_script += sp['Definition']
        sql_script += "\nGO\n\n"

    # Add views
    sql_script += "-- ============================================\n"
    sql_script += "-- CREATE VIEWS\n"
    sql_script += "-- ============================================\n\n"

    for view in view_data:
        sql_script += f"-- View: {view['ViewName']}\n"
        sql_script += view['Definition']
        sql_script += "\nGO\n\n"

    # Write to file
    output_file = '/home/jorge/projects/Lottery-Database/lottery_database_azure_v2.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_script)

    print(f"✓ Schema exported to: {output_file}")
    print(f"\nSummary:")
    print(f"  - Tables: {len(table_names)}")
    print(f"  - Stored Procedures: {len(sp_data)}")
    print(f"  - Views: {len(view_data)}")
    print(f"  - Primary Keys: {len(set(pk['ConstraintName'] for pk in pk_data))}")
    print(f"  - Foreign Keys: {len(set(fk['ConstraintName'] for fk in fk_data))}")
    print(f"  - Indexes: {len(set(idx['IndexName'] for idx in idx_data))}")

    return 0

if __name__ == '__main__':
    exit(main())
