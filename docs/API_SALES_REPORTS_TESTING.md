# Testing: Sales Reports API Endpoints

## Fecha: 2025-11-26

Este documento contiene ejemplos de pruebas con curl para los endpoints de reportes de ventas implementados.

---

## Pre-requisitos

1. **API corriendo en puerto 5000**
   ```bash
   cd /home/jorge/projects/lottery-project/api/src/LotteryApi
   export DOTNET_ROOT=$HOME/.dotnet
   export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
   dotnet run --urls "http://0.0.0.0:5000"
   ```

2. **Obtener token de autenticación** (si el endpoint requiere autenticación)
   ```bash
   TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin123456"}' \
     | jq -r '.token')

   echo $TOKEN
   ```

---

## 1. Reporte de Ventas por Banca y Sorteo

### Endpoint Principal

**POST** `/api/reports/sales/by-betting-pool-draw`

### Ejemplo 1: Reporte básico (todas las bancas, todos los sorteos)

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-31T23:59:59"
  }' | jq .
```

### Ejemplo 2: Filtrar por sorteos específicos

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-31T23:59:59",
    "drawIds": [1, 2, 3, 45]
  }' | jq .
```

### Ejemplo 3: Filtrar por zonas específicas

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-31T23:59:59",
    "zoneIds": [1, 2]
  }' | jq .
```

### Ejemplo 4: Filtrar por sorteos Y zonas

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-01-31T23:59:59",
    "drawIds": [1, 2, 3],
    "zoneIds": [1]
  }' | jq .
```

### Ejemplo 5: Reporte del día actual

```bash
TODAY=$(date +%Y-%m-%d)

curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"startDate\": \"${TODAY}T00:00:00\",
    \"endDate\": \"${TODAY}T23:59:59\"
  }" | jq .
```

### Respuesta esperada

```json
{
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-01-31T23:59:59",
  "totalNet": 46576.41,
  "bettingPools": [
    {
      "bettingPoolId": 380,
      "bettingPoolName": "LIDIA (GF)",
      "bettingPoolCode": "LAN-0380",
      "zoneId": 1,
      "zoneName": "GRUPO GUYANA (OMAR)",
      "totalSold": 8841.40,
      "totalPrizes": 5335.00,
      "totalCommissions": 1768.28,
      "totalNet": 1738.12
    }
  ],
  "totalCount": 112,
  "summary": {
    "totalSold": 340910.44,
    "totalPrizes": 225081.50,
    "totalCommissions": 69252.53,
    "totalNet": 46576.41
  }
}
```

---

## 2. Resumen de Ventas Diarias

### Endpoint

**GET** `/api/reports/sales/daily-summary`

### Ejemplo 1: Resumen del día actual (por defecto)

```bash
curl -X GET http://localhost:5000/api/reports/sales/daily-summary \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Ejemplo 2: Resumen de una fecha específica

```bash
curl -X GET "http://localhost:5000/api/reports/sales/daily-summary?date=2025-01-15" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Respuesta esperada

```json
{
  "totalSold": 45320.50,
  "totalPrizes": 12500.00,
  "totalCommissions": 9064.10,
  "totalNet": 23756.40
}
```

---

## 3. Ventas por Banca (Simplificado)

### Endpoint

**GET** `/api/reports/sales/by-betting-pool`

### Ejemplo 1: Todas las bancas en un rango de fechas

```bash
curl -X GET "http://localhost:5000/api/reports/sales/by-betting-pool?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Ejemplo 2: Filtrar por zona

```bash
curl -X GET "http://localhost:5000/api/reports/sales/by-betting-pool?startDate=2025-01-01&endDate=2025-01-31&zoneId=1" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Ejemplo 3: Ventas de hoy por zona

```bash
TODAY=$(date +%Y-%m-%d)

curl -X GET "http://localhost:5000/api/reports/sales/by-betting-pool?startDate=${TODAY}&endDate=${TODAY}&zoneId=1" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Respuesta esperada

```json
[
  {
    "bettingPoolId": 380,
    "bettingPoolName": "LIDIA (GF)",
    "bettingPoolCode": "LAN-0380",
    "zoneId": 1,
    "zoneName": "GRUPO GUYANA (OMAR)",
    "totalSold": 8841.40,
    "totalPrizes": 5335.00,
    "totalCommissions": 1768.28,
    "totalNet": 1738.12
  }
]
```

---

## Casos de Error

### Error 1: Fecha de fin menor que fecha de inicio

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2025-01-31T00:00:00",
    "endDate": "2025-01-01T23:59:59"
  }' | jq .
```

**Respuesta esperada:**
```json
{
  "message": "La fecha de fin debe ser mayor o igual a la fecha de inicio"
}
```

### Error 2: Fechas no proporcionadas (validación)

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}' | jq .
```

**Respuesta esperada:**
```json
{
  "errors": {
    "StartDate": ["La fecha de inicio es requerida"],
    "EndDate": ["La fecha de fin es requerida"]
  }
}
```

---

## Testing con datos reales

### 1. Verificar que existen tickets en la base de datos

```bash
# Listar primeros 5 tickets
curl -X GET "http://localhost:5000/api/tickets?page=1&pageSize=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 2. Verificar zonas existentes

```bash
curl -X GET "http://localhost:5000/api/zones" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 3. Verificar sorteos activos

```bash
curl -X GET "http://localhost:5000/api/draws" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 4. Ejecutar reporte con datos reales

Una vez verificados los IDs, ejecutar el reporte con esos valores:

```bash
curl -X POST http://localhost:5000/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2024-01-01T00:00:00",
    "endDate": "2025-12-31T23:59:59",
    "drawIds": [1, 2],
    "zoneIds": [1]
  }' | jq .
```

---

## Script de prueba completo

Guardar como `test-sales-reports.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000"

echo "=== Testing Sales Reports API ==="
echo ""

# 1. Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123456"}' \
  | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "ERROR: Failed to get token"
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# 2. Daily Summary
echo "2. Testing daily summary..."
curl -s -X GET "${API_URL}/api/reports/sales/daily-summary" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 3. Sales by Betting Pool
echo "3. Testing sales by betting pool..."
TODAY=$(date +%Y-%m-%d)
curl -s -X GET "${API_URL}/api/reports/sales/by-betting-pool?startDate=${TODAY}&endDate=${TODAY}" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. Main Report
echo "4. Testing main sales report..."
curl -s -X POST ${API_URL}/api/reports/sales/by-betting-pool-draw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"startDate\": \"${TODAY}T00:00:00\",
    \"endDate\": \"${TODAY}T23:59:59\"
  }" | jq .
echo ""

echo "=== Tests completed ==="
```

Ejecutar:
```bash
chmod +x test-sales-reports.sh
./test-sales-reports.sh
```

---

## Notas

1. **jq no instalado**: Si `jq` no está disponible, remover `| jq .` de los comandos
2. **Sin autenticación**: Si el endpoint no requiere auth, remover el header `Authorization`
3. **Fechas**: Asegurar formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss`)
4. **Zona horaria**: Las fechas se almacenan en UTC en la BD

---

**Última actualización:** 2025-11-26
