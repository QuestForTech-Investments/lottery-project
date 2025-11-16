# 🔷 Azure SQL Database - Guía Completa de Gestión
**Sistema de Lotería - Deployment y Administración**
**Fecha:** 22 de Octubre, 2025
**Plataformas:** WSL (Ubuntu) + PowerShell + Azure Portal

---

## 📋 TABLA DE CONTENIDO

1. [Prerequisitos](#1-prerequisitos)
2. [Instalación de Herramientas](#2-instalación-de-herramientas)
3. [Login a Azure](#3-login-a-azure)
4. [Crear Recursos en Azure](#4-crear-recursos-en-azure)
5. [Configurar Firewall](#5-configurar-firewall)
6. [Deployment de Base de Datos](#6-deployment-de-base-de-datos)
7. [Conectar desde WSL](#7-conectar-desde-wsl)
8. [Conectar desde PowerShell](#8-conectar-desde-powershell)
9. [Gestión de Usuarios y Permisos](#9-gestión-de-usuarios-y-permisos)
10. [Backup y Restore](#10-backup-y-restore)
11. [Monitoreo y Troubleshooting](#11-monitoreo-y-troubleshooting)
12. [Scripts Útiles](#12-scripts-útiles)
13. [Seguridad y Mejores Prácticas](#13-seguridad-y-mejores-prácticas)

---

## 1. PREREQUISITOS

### Información Necesaria

```bash
# Información de tu suscripción Azure (obtenla del cliente)
AZURE_SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
AZURE_TENANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
AZURE_RESOURCE_GROUP="lottery-rg"
AZURE_LOCATION="eastus"  # o la región que prefieras

# Información del servidor SQL
SQL_SERVER_NAME="lottery-sql-server"  # Debe ser único globalmente
SQL_ADMIN_USER="sqladmin"
SQL_ADMIN_PASSWORD="TuPasswordSegura123!"  # Cambiar!!!

# Información de la base de datos
DATABASE_NAME="lottery_database"
DATABASE_TIER="Standard"  # Basic, Standard, Premium
DATABASE_SIZE="S2"        # S0, S1, S2, S3, etc.
```

### Requisitos del Sistema

- **WSL**: Ubuntu 20.04+ (o cualquier distro Linux)
- **PowerShell**: 7.0+ (PowerShell Core)
- **Conexión a Internet**: Para acceder a Azure
- **Permisos**: Contributor o Owner en la suscripción Azure

---

## 2. INSTALACIÓN DE HERRAMIENTAS

### 2.1 Instalación en WSL (Ubuntu)

```bash
# ============================================
# PASO 1: Actualizar sistema
# ============================================
sudo apt update && sudo apt upgrade -y

# ============================================
# PASO 2: Instalar Azure CLI
# ============================================
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verificar instalación
az --version

# ============================================
# PASO 3: Instalar SQL Server Command Line Tools
# ============================================

# Agregar repositorio de Microsoft
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | sudo tee /etc/apt/sources.list.d/msprod.list

# Actualizar e instalar
sudo apt update
sudo ACCEPT_EULA=Y apt install -y mssql-tools unixodbc-dev

# Agregar al PATH
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
source ~/.bashrc

# Verificar instalación
sqlcmd -?

# ============================================
# PASO 4: Instalar Azure Data Studio (Opcional pero recomendado)
# ============================================

# Descargar .deb desde https://docs.microsoft.com/sql/azure-data-studio/download
cd ~/Downloads
wget https://go.microsoft.com/fwlink/?linkid=2215435 -O azuredatastudio-linux.deb

# Instalar
sudo apt install -y ./azuredatastudio-linux.deb

# Ejecutar
azuredatastudio &

# ============================================
# PASO 5: Instalar Git LFS (para archivos grandes)
# ============================================
sudo apt install -y git-lfs
git lfs install
```

### 2.2 Instalación en PowerShell (Windows)

```powershell
# ============================================
# PASO 1: Instalar Azure CLI (si no está instalado)
# ============================================

# Opción A: Con Winget
winget install -e --id Microsoft.AzureCLI

# Opción B: Con MSI Installer
# Descargar de: https://aka.ms/installazurecliwindows
# Ejecutar el instalador

# Verificar instalación
az --version

# ============================================
# PASO 2: Instalar SQL Server Module para PowerShell
# ============================================

# Instalar módulo SqlServer
Install-Module -Name SqlServer -AllowClobber -Force

# Verificar instalación
Get-Module -ListAvailable -Name SqlServer

# ============================================
# PASO 3: Instalar Azure PowerShell Module
# ============================================

Install-Module -Name Az -AllowClobber -Scope CurrentUser -Force

# Verificar instalación
Get-Module -ListAvailable -Name Az

# ============================================
# PASO 4: Actualizar PowerShell a versión 7+ (si es necesario)
# ============================================

winget install --id Microsoft.Powershell --source winget

# ============================================
# PASO 5: Instalar Azure Data Studio (Opcional)
# ============================================

winget install -e --id Microsoft.AzureDataStudio
```

---

## 3. LOGIN A AZURE

### 3.1 Login desde WSL (Azure CLI)

```bash
# ============================================
# MÉTODO 1: Login Interactivo (Recomendado)
# ============================================

az login

# Se abrirá un navegador para autenticación
# Seguir las instrucciones en pantalla

# Verificar que estás logueado
az account show

# Listar todas las suscripciones disponibles
az account list --output table

# Seleccionar suscripción específica
az account set --subscription "nombre-de-tu-suscripcion"
# O por ID
az account set --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# ============================================
# MÉTODO 2: Login con Service Principal (CI/CD)
# ============================================

az login --service-principal \
  --username <app-id> \
  --password <password-or-cert> \
  --tenant <tenant-id>

# ============================================
# MÉTODO 3: Login con Device Code (para servidores sin browser)
# ============================================

az login --use-device-code

# Seguir las instrucciones mostradas en pantalla
```

### 3.2 Login desde PowerShell

```powershell
# ============================================
# MÉTODO 1: Login Interactivo
# ============================================

Connect-AzAccount

# Verificar conexión
Get-AzContext

# Listar suscripciones
Get-AzSubscription

# Seleccionar suscripción
Set-AzContext -SubscriptionId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# ============================================
# MÉTODO 2: Login con Service Principal
# ============================================

$appId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$password = ConvertTo-SecureString "tu-password" -AsPlainText -Force
$credential = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $appId, $password

Connect-AzAccount -ServicePrincipal -Credential $credential -Tenant "tenant-id"
```

### 3.3 Verificar Conexión

```bash
# WSL (Azure CLI)
az account show --output table

# PowerShell
Get-AzContext | Format-List
```

---

## 4. CREAR RECURSOS EN AZURE

### 4.1 Crear Resource Group

#### Desde WSL (Azure CLI):

```bash
# Crear resource group
az group create \
  --name lottery-rg \
  --location eastus

# Verificar creación
az group show --name lottery-rg --output table

# Listar todos los resource groups
az group list --output table
```

#### Desde PowerShell:

```powershell
# Crear resource group
New-AzResourceGroup `
  -Name "lottery-rg" `
  -Location "eastus"

# Verificar creación
Get-AzResourceGroup -Name "lottery-rg"

# Listar todos los resource groups
Get-AzResourceGroup | Format-Table
```

### 4.2 Crear SQL Server

#### Desde WSL (Azure CLI):

```bash
# Variables
SERVER_NAME="lottery-sql-server"  # Cambiar - debe ser único globalmente
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="TuPasswordSegura123!"  # CAMBIAR!!!
RESOURCE_GROUP="lottery-rg"
LOCATION="eastus"

# Crear SQL Server
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

# Verificar creación
az sql server show \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --output table

# Obtener FQDN del servidor
az sql server show \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "fullyQualifiedDomainName" \
  --output tsv
```

#### Desde PowerShell:

```powershell
# Variables
$serverName = "lottery-sql-server"
$adminUser = "sqladmin"
$adminPassword = ConvertTo-SecureString "TuPasswordSegura123!" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($adminUser, $adminPassword)
$resourceGroup = "lottery-rg"
$location = "eastus"

# Crear SQL Server
New-AzSqlServer `
  -ServerName $serverName `
  -ResourceGroupName $resourceGroup `
  -Location $location `
  -SqlAdministratorCredentials $credential

# Verificar creación
Get-AzSqlServer `
  -ServerName $serverName `
  -ResourceGroupName $resourceGroup
```

### 4.3 Crear Base de Datos

#### Desde WSL (Azure CLI):

```bash
# Variables
DATABASE_NAME="lottery_database"
SERVER_NAME="lottery-sql-server"
RESOURCE_GROUP="lottery-rg"

# Opción 1: Standard Tier (Recomendado para producción)
az sql db create \
  --name $DATABASE_NAME \
  --server $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --service-objective S2 \
  --edition Standard

# Opción 2: Basic Tier (Desarrollo/Testing)
az sql db create \
  --name $DATABASE_NAME \
  --server $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --service-objective Basic \
  --edition Basic

# Opción 3: Serverless (Escalado automático)
az sql db create \
  --name $DATABASE_NAME \
  --server $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --edition GeneralPurpose \
  --compute-model Serverless \
  --family Gen5 \
  --capacity 2 \
  --auto-pause-delay 60

# Verificar creación
az sql db show \
  --name $DATABASE_NAME \
  --server $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --output table

# Ver información de conexión
az sql db show-connection-string \
  --client sqlcmd \
  --name $DATABASE_NAME \
  --server $SERVER_NAME
```

#### Desde PowerShell:

```powershell
# Variables
$databaseName = "lottery_database"
$serverName = "lottery-sql-server"
$resourceGroup = "lottery-rg"

# Crear base de datos - Standard Tier
New-AzSqlDatabase `
  -ResourceGroupName $resourceGroup `
  -ServerName $serverName `
  -DatabaseName $databaseName `
  -Edition "Standard" `
  -RequestedServiceObjectiveName "S2"

# Verificar creación
Get-AzSqlDatabase `
  -ResourceGroupName $resourceGroup `
  -ServerName $serverName `
  -DatabaseName $databaseName
```

---

## 5. CONFIGURAR FIREWALL

**IMPORTANTE:** Azure SQL bloquea todas las conexiones por defecto. Debes agregar reglas de firewall.

### 5.1 Permitir tu IP Actual

#### Desde WSL (Azure CLI):

```bash
# Obtener tu IP pública
MY_IP=$(curl -s https://ifconfig.me)
echo "Mi IP: $MY_IP"

# Agregar regla de firewall para tu IP
az sql server firewall-rule create \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP

# Listar reglas de firewall
az sql server firewall-rule list \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --output table
```

#### Desde PowerShell:

```powershell
# Obtener tu IP pública
$myIP = (Invoke-WebRequest -Uri "https://ifconfig.me").Content.Trim()
Write-Host "Mi IP: $myIP"

# Agregar regla de firewall
New-AzSqlServerFirewallRule `
  -ResourceGroupName "lottery-rg" `
  -ServerName "lottery-sql-server" `
  -FirewallRuleName "AllowMyIP" `
  -StartIpAddress $myIP `
  -EndIpAddress $myIP

# Listar reglas
Get-AzSqlServerFirewallRule `
  -ResourceGroupName "lottery-rg" `
  -ServerName "lottery-sql-server"
```

### 5.2 Permitir Servicios de Azure

```bash
# WSL - Permitir servicios de Azure (para Azure App Service, Functions, etc.)
az sql server firewall-rule create \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

```powershell
# PowerShell
New-AzSqlServerFirewallRule `
  -ResourceGroupName "lottery-rg" `
  -ServerName "lottery-sql-server" `
  -FirewallRuleName "AllowAzureServices" `
  -StartIpAddress "0.0.0.0" `
  -EndIpAddress "0.0.0.0"
```

### 5.3 Permitir Rango de IPs (Oficina, VPN, etc.)

```bash
# WSL - Permitir rango de IPs
az sql server firewall-rule create \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name AllowOfficeNetwork \
  --start-ip-address 203.0.113.0 \
  --end-ip-address 203.0.113.255
```

```powershell
# PowerShell
New-AzSqlServerFirewallRule `
  -ResourceGroupName "lottery-rg" `
  -ServerName "lottery-sql-server" `
  -FirewallRuleName "AllowOfficeNetwork" `
  -StartIpAddress "203.0.113.0" `
  -EndIpAddress "203.0.113.255"
```

---

## 6. DEPLOYMENT DE BASE DE DATOS

### 6.1 Preparar el Script SQL

```bash
# Navegar al directorio del proyecto
cd /mnt/h/GIT/Lottery-Database

# Verificar que el archivo existe
ls -lh lottery_database_complete.sql

# IMPORTANTE: El script debe tener estos ajustes para Azure SQL:

# 1. Remover/comentar comandos no soportados en Azure SQL:
#    - CREATE DATABASE (ya se creó desde Azure CLI)
#    - USE database (Azure SQL usa conexión directa)
#    - sp_configure
#    - Comandos de sistema

# Crear versión para Azure
cp lottery_database_complete.sql lottery_database_azure.sql

# Editar el archivo para Azure (manualmente o con sed)
```

**Modificaciones necesarias para Azure SQL:**

```sql
-- lottery_database_azure.sql
-- REMOVER estas líneas si existen:

-- CREATE DATABASE lottery_database;  -- Ya creado en Azure
-- GO
-- USE lottery_database;              -- No soportado en Azure SQL
-- GO

-- MANTENER todo lo demás:
-- - CREATE TABLE
-- - CREATE INDEX
-- - CREATE VIEW
-- - CREATE PROCEDURE
-- - INSERT datos
-- Etc.
```

### 6.2 Deploy desde WSL con sqlcmd

```bash
# Variables de conexión
SERVER="lottery-sql-server.database.windows.net"
DATABASE="lottery_database"
USER="sqladmin"
PASSWORD="TuPasswordSegura123!"

# Método 1: Ejecutar script completo
sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
  -i lottery_database_azure.sql \
  -o deployment_log.txt \
  -e

# Método 2: Ejecutar con archivo de variables
# Crear archivo de variables
cat > sql_vars.txt << EOF
SERVER=lottery-sql-server.database.windows.net
DATABASE=lottery_database
USER=sqladmin
PASSWORD=TuPasswordSegura123!
EOF

# Ejecutar usando variables
source sql_vars.txt
sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
  -i lottery_database_azure.sql

# Método 3: Ejecutar en modo interactivo
sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD

# En el prompt de sqlcmd:
# :r lottery_database_azure.sql
# GO
# EXIT

# Verificar deployment
echo "SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES;" | \
  sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD -h -1
```

### 6.3 Deploy desde PowerShell con Invoke-Sqlcmd

```powershell
# Variables
$server = "lottery-sql-server.database.windows.net"
$database = "lottery_database"
$username = "sqladmin"
$password = "TuPasswordSegura123!"

# Método 1: Ejecutar script completo
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -InputFile "H:\GIT\Lottery-Database\lottery_database_azure.sql" `
  -OutputSqlErrors $true `
  -Verbose

# Método 2: Ejecutar con manejo de errores
try {
    $result = Invoke-Sqlcmd `
      -ServerInstance $server `
      -Database $database `
      -Username $username `
      -Password $password `
      -InputFile "H:\GIT\Lottery-Database\lottery_database_azure.sql" `
      -QueryTimeout 0 `
      -ErrorAction Stop

    Write-Host "✅ Deployment exitoso" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error en deployment: $($_.Exception.Message)" -ForegroundColor Red
}

# Método 3: Ejecutar query directa
$query = "SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES;"
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query $query
```

### 6.4 Deploy con Azure Data Studio

```bash
# Desde WSL - Abrir Azure Data Studio
azuredatastudio &

# En Azure Data Studio:
# 1. New Connection
# 2. Connection type: Microsoft SQL Server
# 3. Server: lottery-sql-server.database.windows.net
# 4. Authentication: SQL Login
# 5. User name: sqladmin
# 6. Password: TuPasswordSegura123!
# 7. Database: lottery_database
# 8. Connect

# Abrir archivo SQL:
# File > Open File > lottery_database_azure.sql

# Ejecutar:
# Ctrl + Shift + E (Execute)
# O botón "Run"

# Ver progreso en el panel de mensajes
```

### 6.5 Deploy Incremental (Para Actualizaciones)

```bash
# Si ya tienes una base de datos y solo quieres aplicar cambios

# 1. Crear script de migración
cat > migration_001.sql << 'EOF'
-- Migration 001: Add new tables from 2025-10-22

-- Check if table exists before creating
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'limit_rules')
BEGIN
    CREATE TABLE [dbo].[limit_rules] (
        -- ... definición de tabla
    );
END
GO

-- Agregar columna si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('results') AND name = 'position'
)
BEGIN
    ALTER TABLE results ADD position INT NULL;
END
GO
EOF

# 2. Ejecutar migración
sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD -i migration_001.sql

# 3. Verificar
sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
  -Q "SELECT name FROM sys.tables WHERE name = 'limit_rules';"
```

---

## 7. CONECTAR DESDE WSL

### 7.1 sqlcmd - Command Line Interface

```bash
# Conexión básica
sqlcmd -S lottery-sql-server.database.windows.net \
  -d lottery_database \
  -U sqladmin \
  -P 'TuPasswordSegura123!'

# Conexión con encriptación (recomendado para producción)
sqlcmd -S lottery-sql-server.database.windows.net \
  -d lottery_database \
  -U sqladmin \
  -P 'TuPasswordSegura123!' \
  -N -C

# Ejecutar query directa
sqlcmd -S lottery-sql-server.database.windows.net \
  -d lottery_database \
  -U sqladmin \
  -P 'TuPasswordSegura123!' \
  -Q "SELECT COUNT(*) FROM tickets;"

# Ejecutar query y guardar resultado
sqlcmd -S lottery-sql-server.database.windows.net \
  -d lottery_database \
  -U sqladmin \
  -P 'TuPasswordSegura123!' \
  -Q "SELECT * FROM betting_pools;" \
  -o output.txt \
  -s "|" \
  -w 255

# Modo interactivo con mejor formato
sqlcmd -S lottery-sql-server.database.windows.net \
  -d lottery_database \
  -U sqladmin \
  -P 'TuPasswordSegura123!' \
  -Y 30

# Dentro del prompt:
# 1> SELECT pool_id, branch_name FROM betting_pools;
# 2> GO
# 3> EXIT
```

### 7.2 Crear Alias/Función para Conexión Rápida

```bash
# Agregar a ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# Azure SQL Connection
export LOTTERY_SQL_SERVER="lottery-sql-server.database.windows.net"
export LOTTERY_SQL_DB="lottery_database"
export LOTTERY_SQL_USER="sqladmin"

# Función para conectar rápido (sin password en archivo por seguridad)
lottery-sql() {
    read -sp "Password: " LOTTERY_SQL_PASS
    echo
    sqlcmd -S $LOTTERY_SQL_SERVER \
           -d $LOTTERY_SQL_DB \
           -U $LOTTERY_SQL_USER \
           -P $LOTTERY_SQL_PASS \
           -N -C
}

# Función para ejecutar query rápida
lottery-query() {
    read -sp "Password: " LOTTERY_SQL_PASS
    echo
    sqlcmd -S $LOTTERY_SQL_SERVER \
           -d $LOTTERY_SQL_DB \
           -U $LOTTERY_SQL_USER \
           -P $LOTTERY_SQL_PASS \
           -Q "$1" \
           -N -C
}

EOF

# Recargar bashrc
source ~/.bashrc

# Uso:
lottery-sql                          # Conexión interactiva
lottery-query "SELECT COUNT(*) FROM tickets;"  # Query directa
```

### 7.3 Connection String para Aplicaciones

```bash
# Node.js (mssql)
Server=lottery-sql-server.database.windows.net,1433;Database=lottery_database;User ID=sqladmin;Password=TuPasswordSegura123!;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;

# .NET (ADO.NET)
Server=tcp:lottery-sql-server.database.windows.net,1433;Initial Catalog=lottery_database;Persist Security Info=False;User ID=sqladmin;Password=TuPasswordSegura123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

# JDBC
jdbc:sqlserver://lottery-sql-server.database.windows.net:1433;database=lottery_database;user=sqladmin@lottery-sql-server;password=TuPasswordSegura123!;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;

# ODBC
Driver={ODBC Driver 17 for SQL Server};Server=tcp:lottery-sql-server.database.windows.net,1433;Database=lottery_database;Uid=sqladmin;Pwd=TuPasswordSegura123!;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;
```

---

## 8. CONECTAR DESDE POWERSHELL

### 8.1 Invoke-Sqlcmd

```powershell
# Variables de conexión
$server = "lottery-sql-server.database.windows.net"
$database = "lottery_database"
$username = "sqladmin"
$password = "TuPasswordSegura123!"

# Query simple
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query "SELECT COUNT(*) as ticket_count FROM tickets;"

# Query con resultado en variable
$result = Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query "SELECT * FROM betting_pools WHERE is_active = 1;"

# Mostrar resultado
$result | Format-Table

# Query desde archivo
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -InputFile "C:\queries\get_active_tickets.sql"

# Stored procedure
Invoke-Sqlcmd `
  -ServerInstance $server `
  -Database $database `
  -Username $username `
  -Password $password `
  -Query "EXEC sp_GetUserPermissions @user_id = 123;"
```

### 8.2 Crear Función Reutilizable

```powershell
# Agregar a $PROFILE (ejecutar: code $PROFILE)

function Connect-LotterySQL {
    param(
        [string]$Query,
        [string]$InputFile
    )

    $server = "lottery-sql-server.database.windows.net"
    $database = "lottery_database"
    $username = "sqladmin"

    # Pedir password de forma segura
    $securePassword = Read-Host "Password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

    $params = @{
        ServerInstance = $server
        Database = $database
        Username = $username
        Password = $password
    }

    if ($Query) {
        $params.Query = $Query
    }

    if ($InputFile) {
        $params.InputFile = $InputFile
    }

    try {
        $result = Invoke-Sqlcmd @params -ErrorAction Stop
        return $result
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Uso:
Connect-LotterySQL -Query "SELECT COUNT(*) FROM tickets;"
Connect-LotterySQL -InputFile "C:\scripts\query.sql"
```

### 8.3 SMO (SQL Server Management Objects)

```powershell
# Instalación
Install-Module -Name SqlServer -AllowClobber

# Uso avanzado con SMO
$serverInstance = "lottery-sql-server.database.windows.net"
$database = "lottery_database"
$username = "sqladmin"
$password = "TuPasswordSegura123!"

# Crear conexión
$serverConnection = New-Object Microsoft.SqlServer.Management.Common.ServerConnection
$serverConnection.ServerInstance = $serverInstance
$serverConnection.LoginSecure = $false
$serverConnection.Login = $username
$serverConnection.Password = $password

# Crear objeto Server
$server = New-Object Microsoft.SqlServer.Management.Smo.Server($serverConnection)

# Obtener información del servidor
$server.Information.Version
$server.Information.Edition

# Obtener base de datos
$db = $server.Databases[$database]

# Listar tablas
$db.Tables | Select-Object Schema, Name, RowCount | Format-Table

# Listar stored procedures
$db.StoredProcedures | Where-Object {$_.IsSystemObject -eq $false} | Select-Object Schema, Name

# Obtener tamaño de base de datos
$db.Size
$db.SpaceAvailable
```

---

## 9. GESTIÓN DE USUARIOS Y PERMISOS

### 9.1 Crear Usuario de Solo Lectura

```sql
-- Conectar como admin
-- Ejecutar en master database

-- Crear login a nivel de servidor
CREATE LOGIN readonly_user WITH PASSWORD = 'ReadOnlyPass123!';
GO

-- Conectar a la base de datos lottery_database
USE lottery_database;
GO

-- Crear usuario en la base de datos
CREATE USER readonly_user FOR LOGIN readonly_user;
GO

-- Agregar a rol db_datareader
ALTER ROLE db_datareader ADD MEMBER readonly_user;
GO

-- Verificar
SELECT
    dp.name AS username,
    dp.type_desc,
    drole.name AS role_name
FROM sys.database_principals dp
LEFT JOIN sys.database_role_members drm ON dp.principal_id = drm.member_principal_id
LEFT JOIN sys.database_principals drole ON drm.role_principal_id = drole.principal_id
WHERE dp.name = 'readonly_user';
```

### 9.2 Crear Usuario de API (Read/Write sin Admin)

```sql
-- Crear login
CREATE LOGIN api_user WITH PASSWORD = 'ApiUserPass123!';
GO

USE lottery_database;
GO

-- Crear usuario
CREATE USER api_user FOR LOGIN api_user;
GO

-- Permisos de lectura y escritura
ALTER ROLE db_datareader ADD MEMBER api_user;
ALTER ROLE db_datawriter ADD MEMBER api_user;
GO

-- Permitir ejecutar stored procedures
GRANT EXECUTE TO api_user;
GO

-- Denegar permisos de DDL (no puede crear/modificar tablas)
DENY ALTER TO api_user;
DENY CREATE TABLE TO api_user;
DENY DROP TO api_user;
GO
```

### 9.3 Crear Usuario con Azure AD (Recomendado)

```bash
# Habilitar Azure AD Admin en el servidor
az sql server ad-admin create \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --display-name "SQL Admin" \
  --object-id "object-id-from-azure-ad"

# Conectar con Azure AD
sqlcmd -S lottery-sql-server.database.windows.net \
  -d lottery_database \
  -G \
  -U admin@yourdomain.com

# Crear usuario desde Azure AD
CREATE USER [user@yourdomain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [user@yourdomain.com];
```

### 9.4 Gestionar desde Azure CLI

```bash
# No hay comando directo, usar SQL queries con az sql db execute

# Ejecutar query SQL directa
az sql db query \
  --server lottery-sql-server \
  --name lottery_database \
  --admin-user sqladmin \
  --admin-password 'TuPasswordSegura123!' \
  --query-text "SELECT COUNT(*) FROM tickets;"
```

---

## 10. BACKUP Y RESTORE

### 10.1 Backup Automático (Incluido en Azure SQL)

Azure SQL Database incluye backups automáticos:
- **Backup completo:** Semanal
- **Backup diferencial:** Cada 12-24 horas
- **Backup de log:** Cada 5-10 minutos
- **Retención:** 7-35 días (configurable)

```bash
# Ver configuración de backup
az sql db show \
  --name lottery_database \
  --server lottery-sql-server \
  --resource-group lottery-rg \
  --query "{Name:name, BackupRetentionPeriod:retentionPolicyDays}"

# Configurar retención (7-35 días)
az sql db update \
  --name lottery_database \
  --server lottery-sql-server \
  --resource-group lottery-rg \
  --backup-storage-redundancy Local \
  --retention-days 14
```

### 10.2 Backup Manual (Long-Term Retention)

```bash
# Crear backup manual
az sql db ltr-backup create \
  --database lottery_database \
  --server lottery-sql-server \
  --resource-group lottery-rg

# Listar backups disponibles
az sql db ltr-backup list \
  --location eastus \
  --server lottery-sql-server

# Configurar política de retención a largo plazo
az sql db ltr-policy set \
  --database lottery_database \
  --server lottery-sql-server \
  --resource-group lottery-rg \
  --weekly-retention P4W \
  --monthly-retention P12M \
  --yearly-retention P5Y \
  --week-of-year 1
```

### 10.3 Export a BACPAC (Backup Portátil)

```bash
# Crear storage account para almacenar backup
az storage account create \
  --name lotterystorage123 \
  --resource-group lottery-rg \
  --location eastus \
  --sku Standard_LRS

# Obtener storage key
STORAGE_KEY=$(az storage account keys list \
  --account-name lotterystorage123 \
  --resource-group lottery-rg \
  --query "[0].value" -o tsv)

# Crear container
az storage container create \
  --name backups \
  --account-name lotterystorage123 \
  --account-key $STORAGE_KEY

# Exportar base de datos a BACPAC
az sql db export \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name lottery_database \
  --admin-user sqladmin \
  --admin-password 'TuPasswordSegura123!' \
  --storage-key-type StorageAccessKey \
  --storage-key $STORAGE_KEY \
  --storage-uri https://lotterystorage123.blob.core.windows.net/backups/lottery_database_$(date +%Y%m%d).bacpac

# Verificar progreso
az sql db export \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name lottery_database \
  --admin-user sqladmin \
  --admin-password 'TuPasswordSegura123!' \
  --storage-key-type StorageAccessKey \
  --storage-key $STORAGE_KEY \
  --storage-uri https://lotterystorage123.blob.core.windows.net/backups/lottery_database.bacpac \
  --operation-id <operation-id-from-previous-command>
```

### 10.4 Restore desde Backup

```bash
# Restore Point-in-Time (últimos 7-35 días)
az sql db restore \
  --dest-name lottery_database_restored \
  --server lottery-sql-server \
  --resource-group lottery-rg \
  --name lottery_database \
  --time "2025-10-21T10:00:00Z"

# Restore desde backup de retención a largo plazo
az sql db ltr-backup restore \
  --dest-database lottery_database_restored \
  --dest-resource-group lottery-rg \
  --dest-server lottery-sql-server \
  --backup-id <backup-resource-id>

# Import desde BACPAC
az sql db import \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name lottery_database_imported \
  --admin-user sqladmin \
  --admin-password 'TuPasswordSegura123!' \
  --storage-key-type StorageAccessKey \
  --storage-key $STORAGE_KEY \
  --storage-uri https://lotterystorage123.blob.core.windows.net/backups/lottery_database_20251022.bacpac
```

### 10.5 Descargar BACPAC Localmente

```bash
# WSL - Descargar backup BACPAC
az storage blob download \
  --account-name lotterystorage123 \
  --account-key $STORAGE_KEY \
  --container-name backups \
  --name lottery_database_20251022.bacpac \
  --file ~/backups/lottery_database_20251022.bacpac

# Verificar descarga
ls -lh ~/backups/lottery_database_20251022.bacpac
```

---

## 11. MONITOREO Y TROUBLESHOOTING

### 11.1 Ver Métricas de Performance

```bash
# Métricas de CPU
az monitor metrics list \
  --resource /subscriptions/{subscription-id}/resourceGroups/lottery-rg/providers/Microsoft.Sql/servers/lottery-sql-server/databases/lottery_database \
  --metric cpu_percent \
  --start-time 2025-10-22T00:00:00Z \
  --end-time 2025-10-22T23:59:59Z \
  --interval PT1H

# Métricas de Storage
az monitor metrics list \
  --resource /subscriptions/{subscription-id}/resourceGroups/lottery-rg/providers/Microsoft.Sql/servers/lottery-sql-server/databases/lottery_database \
  --metric storage_percent \
  --interval PT1H

# DTU usage (Database Transaction Units)
az monitor metrics list \
  --resource /subscriptions/{subscription-id}/resourceGroups/lottery-rg/providers/Microsoft.Sql/servers/lottery-sql-server/databases/lottery_database \
  --metric dtu_consumption_percent \
  --interval PT5M
```

### 11.2 Query Performance Insights

```sql
-- Top 10 queries más lentas
SELECT TOP 10
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS query_text,
    qs.execution_count,
    qs.total_worker_time / qs.execution_count AS avg_cpu_time,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;

-- Conexiones activas
SELECT
    DB_NAME(dbid) as DatabaseName,
    COUNT(dbid) as NumberOfConnections,
    loginame as LoginName
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid, loginame
ORDER BY NumberOfConnections DESC;

-- Bloqueos activos
SELECT
    blocking_session_id,
    wait_type,
    wait_time,
    wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;

-- Tamaño de base de datos
SELECT
    SUM(reserved_page_count) * 8.0 / 1024 / 1024 AS DatabaseSizeGB
FROM sys.dm_db_partition_stats;

-- Tamaño por tabla
SELECT
    t.name AS TableName,
    SUM(p.rows) AS RowCount,
    SUM(a.total_pages) * 8 / 1024 AS TotalSpaceMB,
    SUM(a.used_pages) * 8 / 1024 AS UsedSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.is_ms_shipped = 0
GROUP BY t.name
ORDER BY TotalSpaceMB DESC;
```

### 11.3 Ver Logs de Errores

```sql
-- Errores recientes de la tabla error_logs (nuestra tabla custom)
SELECT TOP 100
    error_id,
    error_number,
    error_message,
    error_severity,
    error_procedure,
    user_id,
    created_at
FROM error_logs
ORDER BY created_at DESC;

-- Errores por stored procedure
SELECT
    error_procedure,
    COUNT(*) as error_count,
    MAX(created_at) as last_error
FROM error_logs
WHERE created_at >= DATEADD(day, -7, GETDATE())
GROUP BY error_procedure
ORDER BY error_count DESC;
```

### 11.4 Alertas y Notificaciones

```bash
# Crear alerta de CPU alta
az monitor metrics alert create \
  --name HighCPUAlert \
  --resource-group lottery-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/lottery-rg/providers/Microsoft.Sql/servers/lottery-sql-server/databases/lottery_database \
  --condition "avg cpu_percent > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action /subscriptions/{subscription-id}/resourceGroups/lottery-rg/providers/microsoft.insights/actionGroups/admin-alerts

# Crear alerta de storage
az monitor metrics alert create \
  --name HighStorageAlert \
  --resource-group lottery-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/lottery-rg/providers/Microsoft.Sql/servers/lottery-sql-server/databases/lottery_database \
  --condition "avg storage_percent > 90" \
  --window-size 5m

# Listar alertas
az monitor metrics alert list \
  --resource-group lottery-rg
```

---

## 12. SCRIPTS ÚTILES

### 12.1 Script de Health Check

```bash
#!/bin/bash
# health_check.sh

SERVER="lottery-sql-server.database.windows.net"
DATABASE="lottery_database"
USER="sqladmin"

echo "🔍 Azure SQL Database Health Check"
echo "===================================="

# Leer password
read -sp "Password: " PASSWORD
echo

# Test conexión
echo "1. Testing connection..."
if sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD -Q "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Connection OK"
else
    echo "❌ Connection FAILED"
    exit 1
fi

# Contar tablas
echo "2. Checking tables..."
TABLE_COUNT=$(sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
    -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';" \
    -h -1 -W)
echo "   Tables: $TABLE_COUNT"

# Verificar tablas críticas
echo "3. Checking critical tables..."
for table in "tickets" "ticket_lines" "betting_pools" "users" "draws" "results" "limit_rules"; do
    EXISTS=$(sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
        -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '$table';" \
        -h -1 -W)
    if [ "$EXISTS" -eq "1" ]; then
        echo "   ✅ $table exists"
    else
        echo "   ❌ $table MISSING"
    fi
done

# Contar stored procedures
echo "4. Checking stored procedures..."
SP_COUNT=$(sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
    -Q "SELECT COUNT(*) FROM sys.procedures WHERE is_ms_shipped = 0;" \
    -h -1 -W)
echo "   Stored Procedures: $SP_COUNT"

# Check database size
echo "5. Checking database size..."
DB_SIZE=$(sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
    -Q "SELECT CAST(SUM(reserved_page_count) * 8.0 / 1024 / 1024 AS DECIMAL(10,2)) FROM sys.dm_db_partition_stats;" \
    -h -1 -W)
echo "   Database Size: ${DB_SIZE} GB"

# Check recent tickets
echo "6. Checking recent activity..."
RECENT_TICKETS=$(sqlcmd -S $SERVER -d $DATABASE -U $USER -P $PASSWORD \
    -Q "SELECT COUNT(*) FROM tickets WHERE created_at >= DATEADD(day, -1, GETDATE());" \
    -h -1 -W)
echo "   Tickets (last 24h): $RECENT_TICKETS"

echo "===================================="
echo "✅ Health check completed"
```

### 12.2 Script de Backup Automatizado

```bash
#!/bin/bash
# backup_database.sh

RESOURCE_GROUP="lottery-rg"
SERVER_NAME="lottery-sql-server"
DATABASE_NAME="lottery_database"
STORAGE_ACCOUNT="lotterystorage123"
CONTAINER="backups"
ADMIN_USER="sqladmin"

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${DATABASE_NAME}_${DATE}.bacpac"

echo "🔄 Starting backup: $BACKUP_NAME"

# Get storage key
STORAGE_KEY=$(az storage account keys list \
  --account-name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query "[0].value" -o tsv)

# Read admin password
read -sp "SQL Admin Password: " ADMIN_PASSWORD
echo

# Start export
echo "Exporting database..."
az sql db export \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --admin-user $ADMIN_USER \
  --admin-password "$ADMIN_PASSWORD" \
  --storage-key-type StorageAccessKey \
  --storage-key "$STORAGE_KEY" \
  --storage-uri "https://${STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER}/${BACKUP_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed: $BACKUP_NAME"

    # List recent backups
    echo "Recent backups:"
    az storage blob list \
      --account-name $STORAGE_ACCOUNT \
      --account-key "$STORAGE_KEY" \
      --container-name $CONTAINER \
      --query "[].{Name:name, Size:properties.contentLength, Modified:properties.lastModified}" \
      --output table
else
    echo "❌ Backup failed"
    exit 1
fi
```

### 12.3 Script PowerShell de Monitoreo

```powershell
# monitoring.ps1

param(
    [string]$ServerName = "lottery-sql-server.database.windows.net",
    [string]$DatabaseName = "lottery_database",
    [string]$Username = "sqladmin"
)

# Get credentials
$securePassword = Read-Host "Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host "`n📊 Database Monitoring Report" -ForegroundColor Cyan
Write-Host "================================`n"

# Connection stats
$query = @"
SELECT
    DB_NAME() as DatabaseName,
    (SELECT COUNT(*) FROM sys.dm_exec_connections) as ActiveConnections,
    (SELECT COUNT(*) FROM sys.dm_exec_requests WHERE blocking_session_id > 0) as BlockedSessions,
    (SELECT SUM(reserved_page_count) * 8.0 / 1024 / 1024 FROM sys.dm_db_partition_stats) as DatabaseSizeGB,
    (SELECT COUNT(*) FROM tickets WHERE created_at >= DATEADD(hour, -1, GETDATE())) as TicketsLastHour
"@

try {
    $stats = Invoke-Sqlcmd `
        -ServerInstance $ServerName `
        -Database $DatabaseName `
        -Username $Username `
        -Password $password `
        -Query $query

    Write-Host "Database: $($stats.DatabaseName)"
    Write-Host "Active Connections: $($stats.ActiveConnections)"
    Write-Host "Blocked Sessions: $($stats.BlockedSessions)"
    Write-Host "Database Size: $([Math]::Round($stats.DatabaseSizeGB, 2)) GB"
    Write-Host "Tickets (last hour): $($stats.TicketsLastHour)"

    # Top slow queries
    Write-Host "`nTop 5 Slowest Queries:" -ForegroundColor Yellow

    $slowQueries = @"
SELECT TOP 5
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1, 100) AS query_text,
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count / 1000 AS avg_ms
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_ms DESC
"@

    $queries = Invoke-Sqlcmd `
        -ServerInstance $ServerName `
        -Database $DatabaseName `
        -Username $Username `
        -Password $password `
        -Query $slowQueries

    $queries | Format-Table -AutoSize

    Write-Host "`n✅ Monitoring completed" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## 13. SEGURIDAD Y MEJORES PRÁCTICAS

### 13.1 Seguridad de Credenciales

**❌ NUNCA hacer:**
```bash
# NO almacenar passwords en scripts
PASSWORD="TuPasswordSegura123!"

# NO versionar credenciales en Git
git add config.sh  # si contiene passwords

# NO compartir connection strings con passwords
echo "Server=...;Password=MyPass123" > connection.txt
```

**✅ HACER:**
```bash
# Usar variables de entorno
export LOTTERY_SQL_PASSWORD="password"  # Solo en sesión actual

# Usar Azure Key Vault
az keyvault secret set \
  --vault-name lottery-keyvault \
  --name sql-admin-password \
  --value "TuPasswordSegura123!"

# Recuperar desde Key Vault
PASSWORD=$(az keyvault secret show \
  --vault-name lottery-keyvault \
  --name sql-admin-password \
  --query value -o tsv)

# Usar Managed Identity (para Azure resources)
az webapp identity assign --name myapp --resource-group lottery-rg
```

### 13.2 Habilitar Auditoría

```bash
# Habilitar auditoría a nivel de servidor
az sql server audit-policy update \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --state Enabled \
  --storage-account lotterystorage123

# Habilitar auditoría a nivel de base de datos
az sql db audit-policy update \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name lottery_database \
  --state Enabled \
  --storage-account lotterystorage123
```

### 13.3 Habilitar Advanced Threat Protection

```bash
# Habilitar ATP
az sql db threat-policy update \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --name lottery_database \
  --state Enabled \
  --email-account-admins true \
  --email-addresses admin@example.com
```

### 13.4 Transparent Data Encryption (TDE)

```bash
# TDE está habilitado por defecto en Azure SQL
# Verificar estado
az sql db tde show \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --database lottery_database

# Habilitar si está deshabilitado
az sql db tde set \
  --resource-group lottery-rg \
  --server lottery-sql-server \
  --database lottery_database \
  --status Enabled
```

### 13.5 Mejores Prácticas

```bash
# 1. Usar Connection Pooling en aplicaciones
# 2. Limitar firewall a IPs específicas (no 0.0.0.0-255.255.255.255)
# 3. Usar Azure AD Authentication cuando sea posible
# 4. Implementar retry logic en aplicaciones
# 5. Monitorear métricas de performance regularmente
# 6. Configurar alertas para CPU, Storage, DTU
# 7. Hacer backups regulares (automáticos + manuales)
# 8. Rotar passwords periódicamente
# 9. Usar Managed Identity para Azure resources
# 10. Revisar audit logs mensualmente
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial
- Azure SQL Database: https://docs.microsoft.com/azure/azure-sql/
- Azure CLI Reference: https://docs.microsoft.com/cli/azure/sql
- sqlcmd Utility: https://docs.microsoft.com/sql/tools/sqlcmd-utility
- Azure Data Studio: https://docs.microsoft.com/sql/azure-data-studio/

### Comandos Rápidos de Referencia

```bash
# Login
az login

# Set subscription
az account set --subscription "subscription-name"

# Create resources
az group create --name lottery-rg --location eastus
az sql server create --name lottery-sql-server --resource-group lottery-rg --location eastus --admin-user sqladmin --admin-password 'Pass123!'
az sql db create --name lottery_database --server lottery-sql-server --resource-group lottery-rg --service-objective S2

# Firewall
az sql server firewall-rule create --resource-group lottery-rg --server lottery-sql-server --name AllowMyIP --start-ip-address x.x.x.x --end-ip-address x.x.x.x

# Connect
sqlcmd -S lottery-sql-server.database.windows.net -d lottery_database -U sqladmin -P 'Pass123!'

# Backup/Restore
az sql db export --resource-group lottery-rg --server lottery-sql-server --name lottery_database --admin-user sqladmin --admin-password 'Pass123!' --storage-key-type StorageAccessKey --storage-key <key> --storage-uri <uri>

# Monitor
az monitor metrics list --resource <resource-id> --metric cpu_percent
```

---

## ✅ CHECKLIST DE DEPLOYMENT

```bash
☐ Cuenta de Azure activa
☐ Azure CLI instalado en WSL
☐ PowerShell 7+ instalado
☐ sqlcmd instalado
☐ Resource Group creado
☐ SQL Server creado
☐ Base de datos creada
☐ Regla de firewall configurada para tu IP
☐ Script SQL adaptado para Azure (sin USE, sin CREATE DATABASE)
☐ Script ejecutado exitosamente
☐ Usuarios creados (admin, api_user, readonly_user)
☐ Permisos asignados correctamente
☐ Backup automático configurado
☐ Alertas configuradas
☐ Connection strings probadas
☐ Documentación actualizada con URLs finales
```

---

## 🎉 CONCLUSIÓN

Con esta guía tienes todo lo necesario para:
- ✅ Instalar todas las herramientas necesarias
- ✅ Crear y configurar Azure SQL Database
- ✅ Hacer deployment del script de base de datos
- ✅ Conectar desde WSL y PowerShell
- ✅ Gestionar usuarios y permisos
- ✅ Hacer backups y restores
- ✅ Monitorear performance
- ✅ Aplicar seguridad y mejores prácticas

**¿Listo para empezar?**
1. Ejecuta los comandos de instalación (Sección 2)
2. Haz login a Azure (Sección 3)
3. Crea los recursos (Sección 4)
4. Configura firewall (Sección 5)
5. Deploy la base de datos (Sección 6)

---

**Generado:** 22 de Octubre, 2025
**Sistema:** Lottery Database - Azure SQL Deployment Guide
**Versión:** 1.0
