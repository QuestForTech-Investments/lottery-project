# Lottery API - Test Script
# Prueba rápida de la API desde Windows

$apiUrl = "http://172.19.169.103:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Lottery API - Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Checking API health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$apiUrl/health"
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Cannot connect to API" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Register User
Write-Host "2. Registering test user..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random -Maximum 9999)"
    password = "Test123456"
    email = "test$(Get-Random -Maximum 9999)@example.com"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$apiUrl/api/Auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "   User registered: $($registerResponse.username)" -ForegroundColor Green
    Write-Host "   Email: $($registerResponse.email)" -ForegroundColor Green
    $token = $registerResponse.token
    Write-Host "   Token obtained!" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red

    # Try login instead
    Write-Host ""
    Write-Host "3. Trying login with existing user..." -ForegroundColor Yellow
    $loginBody = @{
        username = "testuser"
        password = "Test123456"
    } | ConvertTo-Json

    try {
        $loginResponse = Invoke-RestMethod -Uri "$apiUrl/api/Auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        Write-Host "   Login successful!" -ForegroundColor Green
        $token = $loginResponse.token
    } catch {
        Write-Host "   ERROR: Cannot login" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 3. Test protected endpoint
Write-Host "4. Testing protected endpoint..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $lotteries = Invoke-RestMethod -Uri "$apiUrl/api/lotteries?page=1&pageSize=5" -Headers $headers
    Write-Host "   Lotteries found: $($lotteries.totalRecords)" -ForegroundColor Green
    Write-Host "   First lottery: $($lotteries.data[0].name)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Cannot access protected endpoint" -ForegroundColor Red
}

Write-Host ""

# 4. Get API Info
Write-Host "5. Getting API information..." -ForegroundColor Yellow
try {
    $info = Invoke-RestMethod -Uri "$apiUrl/api/info"
    Write-Host "   API Name: $($info.name)" -ForegroundColor Green
    Write-Host "   Version: $($info.version)" -ForegroundColor Green
    Write-Host "   Environment: $($info.environment)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Cannot get API info" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your JWT Token:" -ForegroundColor Yellow
Write-Host $token -ForegroundColor Cyan
Write-Host ""
Write-Host "Use this token in Swagger UI:" -ForegroundColor Yellow
Write-Host "1. Open: $apiUrl/" -ForegroundColor White
Write-Host "2. Click 'Authorize' button" -ForegroundColor White
Write-Host "3. Enter: Bearer $token" -ForegroundColor White
Write-Host ""
