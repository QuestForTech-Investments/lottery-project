#!/usr/bin/env python3
"""
Final comprehensive extraction using sys.sql_modules
"""

import subprocess
from datetime import datetime

# Connection details
SERVER = "lottery-sql-1505.database.windows.net"
DATABASE = "lottery-db"
USER = "lotteryAdmin"
PASSWORD = "IotSlotsLottery123"

def run_query(query):
    """Execute SQL query using sqlcmd"""
    cmd = [
        '/opt/mssql-tools18/bin/sqlcmd',
        '-S', SERVER,
        '-d', DATABASE,
        '-U', USER,
        '-P', PASSWORD,
        '-C',
        '-Q', query,
        '-w', '65535',
        '-y', '0'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def get_object_names(object_type):
    """Get list of object names (P=procedures, V=views)"""
    if object_type == 'P':
        query = "SELECT name FROM sys.procedures WHERE type = 'P' ORDER BY name"
    else:
        query = "SELECT name FROM sys.views ORDER BY name"

    output = run_query(query)
    lines = [line.strip() for line in output.split('\n')]
    # Extract names (skip headers, separator, and footer)
    names = []
    for line in lines[2:]:  # Skip first two lines (header + separator)
        if line and 'rows affected' not in line and line.strip():
            names.append(line.strip())
    return names

def get_definition(object_name, object_type):
    """Get object definition from sys.sql_modules"""
    if object_type == 'P':
        query = f"""
SELECT m.definition
FROM sys.sql_modules m
INNER JOIN sys.procedures p ON m.object_id = p.object_id
WHERE p.name = '{object_name}'
"""
    else:  # V for views
        query = f"""
SELECT m.definition
FROM sys.sql_modules m
INNER JOIN sys.views v ON m.object_id = v.object_id
WHERE v.name = '{object_name}'
"""

    output = run_query(query)
    # Clean output - remove header and footer
    lines = output.split('\n')
    # Remove rows affected line
    definition_lines = [line for line in lines if 'rows affected' not in line]
    return '\n'.join(definition_lines).strip()

def main():
    print("="* 60)
    print("Extracting Complete Azure SQL Database Schema")
    print(f"Server: {SERVER}")
    print(f"Database: {DATABASE}")
    print("="* 60)

    # Get object names
    print("\nStep 1: Getting object names...")
    sp_names = get_object_names('P')
    view_names = get_object_names('V')

    print(f"  ✓ Found {len(sp_names)} stored procedures")
    print(f"  ✓ Found {len(view_names)} views")

    # Extract stored procedures
    print("\nStep 2: Extracting stored procedures...")
    stored_procedures = {}
    for i, sp_name in enumerate(sp_names, 1):
        print(f"  [{i}/{len(sp_names)}] {sp_name}")
        definition = get_definition(sp_name, 'P')
        stored_procedures[sp_name] = definition

    # Extract views
    print("\nStep 3: Extracting views...")
    views = {}
    for i, view_name in enumerate(view_names, 1):
        print(f"  [{i}/{len(view_names)}] {view_name}")
        definition = get_definition(view_name, 'V')
        views[view_name] = definition

    # Now merge with the existing table schema
    print("\nStep 4: Reading existing table schema...")
    with open('/home/jorge/projects/Lottery-Database/lottery_database_azure_v2.sql', 'r', encoding='utf-8') as f:
        existing_schema = f.read()

    # Find where to insert SPs and Views (replace the empty sections)
    print("\nStep 5: Merging complete schema...")

    # Find the stored procedures section
    sp_section_start = existing_schema.find("-- CREATE STORED PROCEDURES")
    view_section_start = existing_schema.find("-- CREATE VIEWS")

    # Build new SP section
    sp_script = "-- CREATE STORED PROCEDURES\n"
    sp_script += "-- ============================================\n\n"

    for sp_name in sorted(stored_procedures.keys()):
        sp_script += f"-- Stored Procedure: {sp_name}\n"
        sp_script += stored_procedures[sp_name]
        sp_script += "\nGO\n\n"

    # Build new View section
    view_script = "-- CREATE VIEWS\n"
    view_script += "-- ============================================\n\n"

    for view_name in sorted(views.keys()):
        view_script += f"-- View: {view_name}\n"
        view_script += views[view_name]
        view_script += "\nGO\n\n"

    # Reconstruct the complete schema
    # Take everything up to SP section
    before_sp = existing_schema[:sp_section_start]

    # Add new SP section
    complete_schema = before_sp + sp_script + "\n" + view_script

    # Update header with correct info
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    header = f"""-- ============================================
-- Lottery Database - Complete Schema
-- Generated: {current_time}
-- Tables: 47 | Stored Procedures: {len(stored_procedures)} | Views: {len(views)}
-- ============================================
-- Server: {SERVER}
-- Database: {DATABASE}
-- ============================================

"""

    # Replace old header
    schema_start = complete_schema.find("USE [lottery-db];")
    complete_schema = header + complete_schema[schema_start:]

    # Write final schema
    output_file = '/home/jorge/projects/Lottery-Database/lottery_database_azure_v2.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(complete_schema)

    print(f"\n{'='*60}")
    print("✓ Extraction Complete!")
    print(f"{'='*60}")
    print(f"\nOutput file: {output_file}")
    print(f"\nFinal Summary:")
    print(f"  - Tables: 47")
    print(f"  - Stored Procedures: {len(stored_procedures)}")
    print(f"  - Views: {len(views)}")
    print(f"  - Primary Keys: 44")
    print(f"  - Foreign Keys: 62")
    print(f"  - Indexes: 85")

    # Also create separate files for SPs and Views for easy reference
    with open('/home/jorge/projects/Lottery-Database/stored_procedures_final.sql', 'w', encoding='utf-8') as f:
        f.write(sp_script)

    with open('/home/jorge/projects/Lottery-Database/views_final.sql', 'w', encoding='utf-8') as f:
        f.write(view_script)

    print(f"\n✓ Also saved separate files:")
    print(f"  - /home/jorge/projects/Lottery-Database/stored_procedures_final.sql")
    print(f"  - /home/jorge/projects/Lottery-Database/views_final.sql")

if __name__ == '__main__':
    main()
