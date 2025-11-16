#!/usr/bin/env python3
"""
Extract stored procedures and views individually to avoid truncation
"""

import subprocess
import sys

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
        '-h', '-1',  # No headers
        '-W',  # Remove trailing spaces
        '-w', '8000'  # Wide output
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip()

def get_sp_names():
    """Get list of stored procedure names"""
    query = "SELECT name FROM sys.procedures WHERE type = 'P' ORDER BY name"
    output = run_query(query)
    names = [line.strip() for line in output.split('\n') if line.strip() and 'rows affected' not in line]
    return names

def get_view_names():
    """Get list of view names"""
    query = "SELECT name FROM sys.views ORDER BY name"
    output = run_query(query)
    names = [line.strip() for line in output.split('\n') if line.strip() and 'rows affected' not in line]
    return names

def get_sp_definition(sp_name):
    """Get complete definition of a stored procedure"""
    query = f"SELECT OBJECT_DEFINITION(OBJECT_ID('{sp_name}'))"
    definition = run_query(query)
    # Remove the "rows affected" line
    lines = definition.split('\n')
    definition = '\n'.join(line for line in lines if 'rows affected' not in line)
    return definition.strip()

def get_view_definition(view_name):
    """Get complete definition of a view"""
    query = f"SELECT OBJECT_DEFINITION(OBJECT_ID('{view_name}'))"
    definition = run_query(query)
    # Remove the "rows affected" line
    lines = definition.split('\n')
    definition = '\n'.join(line for line in lines if 'rows affected' not in line)
    return definition.strip()

def main():
    print("Extracting stored procedures...")
    sp_names = get_sp_names()
    print(f"Found {len(sp_names)} stored procedures")

    print("\nExtracting views...")
    view_names = get_view_names()
    print(f"Found {len(view_names)} views")

    # Extract stored procedures
    print("\nExtracting stored procedure definitions...")
    stored_procedures = {}
    for sp_name in sp_names:
        print(f"  - {sp_name}")
        definition = get_sp_definition(sp_name)
        stored_procedures[sp_name] = definition

    # Extract views
    print("\nExtracting view definitions...")
    views = {}
    for view_name in view_names:
        print(f"  - {view_name}")
        definition = get_view_definition(view_name)
        views[view_name] = definition

    # Generate SQL script for stored procedures
    sp_script = "-- ============================================\n"
    sp_script += "-- CREATE STORED PROCEDURES\n"
    sp_script += "-- ============================================\n\n"

    for sp_name, definition in stored_procedures.items():
        sp_script += f"-- Stored Procedure: {sp_name}\n"
        sp_script += definition
        sp_script += "\nGO\n\n"

    # Generate SQL script for views
    view_script = "-- ============================================\n"
    view_script += "-- CREATE VIEWS\n"
    view_script += "-- ============================================\n\n"

    for view_name, definition in views.items():
        view_script += f"-- View: {view_name}\n"
        view_script += definition
        view_script += "\nGO\n\n"

    # Write to files
    with open('/home/jorge/projects/Lottery-Database/stored_procedures.sql', 'w', encoding='utf-8') as f:
        f.write(sp_script)

    with open('/home/jorge/projects/Lottery-Database/views.sql', 'w', encoding='utf-8') as f:
        f.write(view_script)

    print(f"\n✓ Stored procedures saved to: /home/jorge/projects/Lottery-Database/stored_procedures.sql")
    print(f"✓ Views saved to: /home/jorge/projects/Lottery-Database/views.sql")
    print(f"\nSummary:")
    print(f"  - Stored Procedures: {len(stored_procedures)}")
    print(f"  - Views: {len(views)}")

    return stored_procedures, views

if __name__ == '__main__':
    main()
