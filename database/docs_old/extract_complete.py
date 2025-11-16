#!/usr/bin/env python3
"""
Extract complete stored procedures and views using sys.sql_modules
"""

import subprocess
import sys

# Connection details
SERVER = "lottery-sql-1505.database.windows.net"
DATABASE = "lottery-db"
USER = "lotteryAdmin"
PASSWORD = "IotSlotsLottery123"

def run_query_to_file(query, output_file):
    """Execute SQL query and save to file"""
    cmd = [
        '/opt/mssql-tools18/bin/sqlcmd',
        '-S', SERVER,
        '-d', DATABASE,
        '-U', USER,
        '-P', PASSWORD,
        '-C',
        '-Q', query,
        '-o', output_file,
        '-h', '-1',
        '-w', '65535',  # Maximum width
        '-y', '0'  # Variable length display
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def extract_sp_to_file(sp_name, output_file):
    """Extract a single stored procedure to file"""
    # Use sp_helptext which returns the full text
    query = f"EXEC sp_helptext '{sp_name}'"
    return run_query_to_file(query, output_file)

def extract_view_to_file(view_name, output_file):
    """Extract a single view to file"""
    query = f"EXEC sp_helptext '{view_name}'"
    return run_query_to_file(query, output_file)

def get_names(object_type):
    """Get list of object names"""
    if object_type == 'P':
        query = "SELECT name FROM sys.procedures WHERE type = 'P' ORDER BY name"
    else:  # 'V' for views
        query = "SELECT name FROM sys.views ORDER BY name"

    cmd = [
        '/opt/mssql-tools18/bin/sqlcmd',
        '-S', SERVER,
        '-d', DATABASE,
        '-U', USER,
        '-P', PASSWORD,
        '-C',
        '-Q', query,
        '-h', '-1',
        '-W'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    names = [line.strip() for line in result.stdout.split('\n')
             if line.strip() and 'rows affected' not in line]
    return names

def clean_sp_text(text):
    """Clean stored procedure text from sp_helptext output"""
    lines = text.split('\n')
    # Remove empty lines at start and end
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    # Remove "rows affected" line
    lines = [line for line in lines if 'rows affected' not in line.lower()]
    return '\n'.join(lines)

def main():
    import os
    temp_dir = '/home/jorge/projects/Lottery-Database/temp'
    os.makedirs(temp_dir, exist_ok=True)

    print("Extracting stored procedures...")
    sp_names = get_names('P')
    print(f"Found {len(sp_names)} stored procedures")

    stored_procedures = {}
    for sp_name in sp_names:
        print(f"  - Extracting {sp_name}")
        temp_file = f"{temp_dir}/{sp_name}.sql"
        if extract_sp_to_file(sp_name, temp_file):
            with open(temp_file, 'r', encoding='utf-8') as f:
                text = f.read()
                stored_procedures[sp_name] = clean_sp_text(text)
        else:
            print(f"    WARNING: Failed to extract {sp_name}")

    print("\nExtracting views...")
    view_names = get_names('V')
    print(f"Found {len(view_names)} views")

    views = {}
    for view_name in view_names:
        print(f"  - Extracting {view_name}")
        temp_file = f"{temp_dir}/{view_name}.sql"
        if extract_view_to_file(view_name, temp_file):
            with open(temp_file, 'r', encoding='utf-8') as f:
                text = f.read()
                views[view_name] = clean_sp_text(text)
        else:
            print(f"    WARNING: Failed to extract {view_name}")

    # Generate combined SQL script
    print("\nGenerating combined SQL script...")

    sp_script = "-- ============================================\n"
    sp_script += "-- CREATE STORED PROCEDURES\n"
    sp_script += f"-- Total: {len(stored_procedures)}\n"
    sp_script += "-- ============================================\n\n"

    for sp_name in sorted(stored_procedures.keys()):
        sp_script += f"-- Stored Procedure: {sp_name}\n"
        sp_script += stored_procedures[sp_name]
        sp_script += "\nGO\n\n"

    view_script = "-- ============================================\n"
    view_script += "-- CREATE VIEWS\n"
    view_script += f"-- Total: {len(views)}\n"
    view_script += "-- ============================================\n\n"

    for view_name in sorted(views.keys()):
        view_script += f"-- View: {view_name}\n"
        view_script += views[view_name]
        view_script += "\nGO\n\n"

    # Write to files
    sp_file = '/home/jorge/projects/Lottery-Database/stored_procedures_complete.sql'
    view_file = '/home/jorge/projects/Lottery-Database/views_complete.sql'

    with open(sp_file, 'w', encoding='utf-8') as f:
        f.write(sp_script)

    with open(view_file, 'w', encoding='utf-8') as f:
        f.write(view_script)

    print(f"\n✓ Stored procedures saved to: {sp_file}")
    print(f"✓ Views saved to: {view_file}")

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir)

    print(f"\nSummary:")
    print(f"  - Stored Procedures: {len(stored_procedures)}")
    print(f"  - Views: {len(views)}")

    return stored_procedures, views

if __name__ == '__main__':
    main()
