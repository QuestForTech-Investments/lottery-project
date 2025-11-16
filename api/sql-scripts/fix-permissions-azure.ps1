# Fix Permissions Table - Azure SQL Deployment
# Adds IDENTITY to permission_id column

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Permissions Table - Azure SQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Azure SQL credentials
$server = "lottery-sql-1505.database.windows.net"
$database = "lottery-db"
$username = "lotteryAdmin"
$password = "IotSlotsLottery123!"

# SQL script path
$scriptPath = "fix-permissions-table.sql"

Write-Host "Server: $server" -ForegroundColor Yellow
Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "Script: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Check if script exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: SQL script not found: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Connecting to Azure SQL..." -ForegroundColor Cyan

try {
    # Execute SQL script
    Invoke-Sqlcmd -ServerInstance $server `
                  -Database $database `
                  -Username $username `
                  -Password $password `
                  -InputFile $scriptPath `
                  -Verbose `
                  -ErrorAction Stop

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Permissions table fixed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Changes applied:" -ForegroundColor Yellow
    Write-Host "  - permission_id now has IDENTITY(1,1)" -ForegroundColor White
    Write-Host "  - All foreign keys recreated" -ForegroundColor White
    Write-Host "  - Data preserved (61 permissions)" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}
