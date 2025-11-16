# Deploy Lottery API to Azure App Service
# This script builds and deploys the Lottery API to Azure App Service

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-lottery-api",

    [Parameter(Mandatory=$false)]
    [string]$AppServicePlan = "plan-lottery-api",

    [Parameter(Mandatory=$false)]
    [string]$AppName = "lottery-api-2025",

    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",

    [Parameter(Mandatory=$false)]
    [string]$DbConnectionString = "",

    [Parameter(Mandatory=$false)]
    [string]$JwtSecretKey = ""
)

Write-Host "======================================"
Write-Host "Lottery API - Azure Deployment Script"
Write-Host "======================================"
Write-Host ""

# Check if Azure CLI is installed
Write-Host "Checking Azure CLI installation..."
$azInstalled = Get-Command az -ErrorAction SilentlyContinue
if (-not $azInstalled)
{
    Write-Host "ERROR: Azure CLI is not installed. Please install from https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}
Write-Host "Azure CLI found: $(az version --query '\"azure-cli\"' -o tsv)" -ForegroundColor Green

# Check if logged in to Azure
Write-Host "Checking Azure login status..."
$account = az account show 2>$null
if (-not $account)
{
    Write-Host "Not logged in to Azure. Please login..." -ForegroundColor Yellow
    az login
}
else
{
    Write-Host "Logged in to Azure" -ForegroundColor Green
}

# Step 1: Build the application
Write-Host ""
Write-Host "Step 1: Building the application..." -ForegroundColor Cyan
cd src/LotteryApi
dotnet restore
if ($LASTEXITCODE -ne 0)
{
    Write-Host "ERROR: dotnet restore failed" -ForegroundColor Red
    exit 1
}

dotnet build --configuration Release
if ($LASTEXITCODE -ne 0)
{
    Write-Host "ERROR: dotnet build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Build completed successfully" -ForegroundColor Green

# Step 2: Publish the application
Write-Host ""
Write-Host "Step 2: Publishing the application..." -ForegroundColor Cyan
dotnet publish --configuration Release --output ../../publish
if ($LASTEXITCODE -ne 0)
{
    Write-Host "ERROR: dotnet publish failed" -ForegroundColor Red
    exit 1
}
Write-Host "Publish completed successfully" -ForegroundColor Green

# Step 3: Create resource group if it doesn't exist
Write-Host ""
Write-Host "Step 3: Creating resource group '$ResourceGroupName'..." -ForegroundColor Cyan
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false")
{
    az group create --name $ResourceGroupName --location $Location
    Write-Host "Resource group created" -ForegroundColor Green
}
else
{
    Write-Host "Resource group already exists" -ForegroundColor Yellow
}

# Step 4: Create App Service Plan if it doesn't exist
Write-Host ""
Write-Host "Step 4: Creating App Service Plan '$AppServicePlan'..." -ForegroundColor Cyan
$planExists = az appservice plan show --name $AppServicePlan --resource-group $ResourceGroupName 2>$null
if (-not $planExists)
{
    az appservice plan create --name $AppServicePlan --resource-group $ResourceGroupName --sku B1 --is-linux
    Write-Host "App Service Plan created" -ForegroundColor Green
}
else
{
    Write-Host "App Service Plan already exists" -ForegroundColor Yellow
}

# Step 5: Create Web App if it doesn't exist
Write-Host ""
Write-Host "Step 5: Creating Web App '$AppName'..." -ForegroundColor Cyan
$appExists = az webapp show --name $AppName --resource-group $ResourceGroupName 2>$null
if (-not $appExists)
{
    az webapp create --name $AppName --resource-group $ResourceGroupName --plan $AppServicePlan --runtime "DOTNETCORE:8.0"
    Write-Host "Web App created" -ForegroundColor Green
}
else
{
    Write-Host "Web App already exists" -ForegroundColor Yellow
}

# Step 6: Configure App Settings
Write-Host ""
Write-Host "Step 6: Configuring App Settings..." -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($DbConnectionString))
{
    Write-Host "WARNING: Database connection string not provided. Skipping DB configuration." -ForegroundColor Yellow
    Write-Host "Please configure LOTTERY_DB_CONNECTION_STRING in Azure Portal manually." -ForegroundColor Yellow
}
else
{
    az webapp config appsettings set --name $AppName --resource-group $ResourceGroupName --settings `
        LOTTERY_DB_CONNECTION_STRING="$DbConnectionString"
    Write-Host "Database connection string configured" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty($JwtSecretKey))
{
    Write-Host "WARNING: JWT secret key not provided. Skipping JWT configuration." -ForegroundColor Yellow
    Write-Host "Please configure JWT_SECRET_KEY in Azure Portal manually." -ForegroundColor Yellow
}
else
{
    az webapp config appsettings set --name $AppName --resource-group $ResourceGroupName --settings `
        JWT_SECRET_KEY="$JwtSecretKey"
    Write-Host "JWT secret key configured" -ForegroundColor Green
}

az webapp config appsettings set --name $AppName --resource-group $ResourceGroupName --settings `
    ASPNETCORE_ENVIRONMENT="Production"
Write-Host "Environment set to Production" -ForegroundColor Green

# Step 7: Create deployment package
Write-Host ""
Write-Host "Step 7: Creating deployment package..." -ForegroundColor Cyan
cd ../../publish
Compress-Archive -Path * -DestinationPath ../lottery-api-deploy.zip -Force
cd ..
Write-Host "Deployment package created: lottery-api-deploy.zip" -ForegroundColor Green

# Step 8: Deploy to Azure
Write-Host ""
Write-Host "Step 8: Deploying to Azure App Service..." -ForegroundColor Cyan
az webapp deployment source config-zip --name $AppName --resource-group $ResourceGroupName --src lottery-api-deploy.zip
if ($LASTEXITCODE -ne 0)
{
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "Deployment completed successfully" -ForegroundColor Green

# Step 9: Get App URL
Write-Host ""
Write-Host "======================================"
Write-Host "Deployment Summary"
Write-Host "======================================"
$appUrl = az webapp show --name $AppName --resource-group $ResourceGroupName --query "defaultHostName" -o tsv
Write-Host "App Name: $AppName" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Cyan
Write-Host "App URL: https://$appUrl" -ForegroundColor Cyan
Write-Host "Swagger: https://$appUrl/swagger" -ForegroundColor Cyan
Write-Host "Health: https://$appUrl/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green

# Cleanup
Remove-Item lottery-api-deploy.zip -Force
Remove-Item publish -Recurse -Force

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify the app is running: https://$appUrl/health" -ForegroundColor Yellow
Write-Host "2. Test the API with Swagger: https://$appUrl/swagger" -ForegroundColor Yellow
if ([string]::IsNullOrEmpty($DbConnectionString) -or [string]::IsNullOrEmpty($JwtSecretKey))
{
    Write-Host "3. Configure missing settings in Azure Portal -> Configuration -> Application settings" -ForegroundColor Yellow
}
Write-Host ""
