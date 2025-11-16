$body = @{
    username = 'superadmin'
    password = 'Admin123!'
    fullName = 'Super Administrador'
    permissionIds = @(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61)
} | ConvertTo-Json

Write-Host "Creando super usuario con todos los permisos..."
Write-Host "Body: $body"

$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/users/with-permissions' -Method Post -Body $body -ContentType 'application/json'

$response | ConvertTo-Json -Depth 5
