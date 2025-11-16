# Lottery API - Endpoint Documentation

> Complete API reference with request/response examples for all endpoints.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Permissions](#permissions-endpoints)
  - [Lotteries](#lotteries-endpoints)
  - [Draws](#draws-endpoints)
  - [Betting Pools](#betting-pools-endpoints)
  - [Zones](#zones-endpoints)
  - [Prize Configuration](#prize-configuration-endpoints)
  - [Bet Types](#bet-types-endpoints)
  - [Game Types](#game-types-endpoints)

---

## Base URL

**Local Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-api.azurewebsites.net/api
```

---

## Authentication

Most endpoints require JWT Bearer token authentication.

### How to Authenticate

1. **Get Token:** Call `POST /api/auth/login`
2. **Use Token:** Include in all subsequent requests

```bash
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Expiration

- **Lifetime:** 12 hours
- **Refresh:** Re-authenticate before expiration
- **Storage:** Store securely (httpOnly cookies or secure storage)

---

## Response Format

### Success Response

```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "isActive": true
}
```

### Paginated Response

```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 150,
  "totalPages": 8
}
```

### Error Response (RFC 7807 Problem Details)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "User with ID 999 not found",
  "instance": "/api/users/999"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 201 Created | Resource created successfully |
| 400 Bad Request | Invalid input or validation error |
| 401 Unauthorized | Missing or invalid authentication |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource not found |
| 409 Conflict | Resource conflict (e.g., duplicate username) |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Server error |

---

## Rate Limiting

| Endpoint | Period | Limit |
|----------|--------|-------|
| All endpoints | 1 minute | 100 requests |
| All endpoints | 15 minutes | 500 requests |
| All endpoints | 1 hour | 2000 requests |
| `POST /api/auth/*` | 1 minute | 10 requests |

**Rate Limit Headers:**
```
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
X-Rate-Limit-Reset: 1642598400
```

---

## Endpoints

## Authentication Endpoints

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** None required

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsIm5iZiI6MTY0MjU5ODQwMCwiZXhwIjoxNjQyNjQxNjAwLCJpYXQiOjE2NDI1OTg0MDB9.xyz",
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "System Administrator",
  "role": "Admin",
  "expiresAt": "2025-01-13T23:59:59Z"
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

**Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

---

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepass123",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJ...",
  "username": "newuser",
  "email": "user@example.com",
  "fullName": "John Doe",
  "expiresAt": "2025-01-13T23:59:59Z"
}
```

**Errors:**
- `400 Bad Request` - Username already exists or validation error

**Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "securepass123",
    "email": "user@example.com",
    "fullName": "John Doe"
  }'
```

---

## Users Endpoints

### Get All Users

Retrieve paginated list of users with optional filters.

**Endpoint:** `GET /api/users`

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| pageSize | integer | No | 20 | Items per page (max 100) |
| search | string | No | null | Search in username, fullName, email |
| roleId | integer | No | null | Filter by role |
| zoneId | integer | No | null | Filter by zone |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "userId": 1,
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "System Administrator",
      "phone": "+1234567890",
      "roleId": 1,
      "roleName": "Admin",
      "commissionRate": 0.00,
      "isActive": true,
      "lastLoginAt": "2025-01-13T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-01-13T10:30:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 150
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/users?page=1&pageSize=20&search=admin" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get User by ID

Retrieve detailed information about a specific user.

**Endpoint:** `GET /api/users/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (integer) - User ID

**Response:** `200 OK`
```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "System Administrator",
  "phone": "+1234567890",
  "roleId": 1,
  "roleName": "Admin",
  "commissionRate": 0.00,
  "isActive": true,
  "lastLoginAt": "2025-01-13T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2025-01-13T10:30:00Z"
}
```

**Errors:**
- `404 Not Found` - User does not exist

**Example:**
```bash
curl -X GET "http://localhost:5000/api/users/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get User Permissions

Retrieve all permissions assigned to a user.

**Endpoint:** `GET /api/users/{userId}/permissions`

**Authentication:** Required

**Path Parameters:**
- `userId` (integer) - User ID

**Response:** `200 OK`
```json
[
  {
    "permissionId": 1,
    "permissionCode": "users:read",
    "permissionName": "View Users",
    "description": "Can view user list and details",
    "category": "Users",
    "isActive": true
  },
  {
    "permissionId": 2,
    "permissionCode": "users:write",
    "permissionName": "Manage Users",
    "description": "Can create, edit, and delete users",
    "category": "Users",
    "isActive": true
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/users/1/permissions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Create User

Create a new user account.

**Endpoint:** `POST /api/users`

**Authentication:** Required

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "roleId": 2,
  "zoneIds": [1, 2],
  "branchId": 5,
  "commissionRate": 10.50,
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "userId": 42,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "roleId": 2,
  "roleName": "Manager",
  "commissionRate": 10.50,
  "isActive": true,
  "createdAt": "2025-01-13T12:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Validation error or username already exists

**Example:**
```bash
curl -X POST "http://localhost:5000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "roleId": 2
  }'
```

---

### Update User

Update user information.

**Endpoint:** `PUT /api/users/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (integer) - User ID

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "email": "newemail@example.com",
  "phone": "+9876543210",
  "roleId": 3,
  "commissionRate": 12.00,
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "userId": 42,
  "username": "johndoe",
  "email": "newemail@example.com",
  "fullName": "John Doe Updated",
  "phone": "+9876543210",
  "roleId": 3,
  "roleName": "Supervisor",
  "commissionRate": 12.00,
  "isActive": true,
  "updatedAt": "2025-01-13T14:30:00Z"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:5000/api/users/42" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe Updated","email":"newemail@example.com"}'
```

---

### Update User Permissions

Assign or remove permissions for a user.

**Endpoint:** `PUT /api/users/{userId}/permissions`

**Authentication:** Required

**Path Parameters:**
- `userId` (integer) - User ID

**Request Body:**
```json
{
  "permissionIds": [1, 2, 5, 7]
}
```

**Response:** `200 OK`
```json
{
  "message": "Permissions updated successfully",
  "userId": 42,
  "permissionCount": 4
}
```

**Example:**
```bash
curl -X PUT "http://localhost:5000/api/users/42/permissions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionIds":[1,2,5,7]}'
```

---

### Delete User (Soft Delete)

Deactivate a user account (sets `isActive = false`).

**Endpoint:** `DELETE /api/users/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (integer) - User ID

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE "http://localhost:5000/api/users/42" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Permissions Endpoints

### Get All Permissions

Retrieve all available permissions.

**Endpoint:** `GET /api/permissions`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| pageSize | integer | No | 50 | Items per page |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "permissionId": 1,
      "permissionCode": "users:read",
      "permissionName": "View Users",
      "description": "Can view user list and details",
      "category": "Users",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 50,
  "totalCount": 25
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/permissions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Permissions Grouped by Category

Retrieve permissions organized by category for UI display.

**Endpoint:** `GET /api/permissions/categories`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "Users": [
    {
      "permissionId": 1,
      "permissionCode": "users:read",
      "permissionName": "View Users",
      "description": "Can view user list and details",
      "category": "Users",
      "isActive": true
    },
    {
      "permissionId": 2,
      "permissionCode": "users:write",
      "permissionName": "Manage Users",
      "description": "Can create, edit, and delete users",
      "category": "Users",
      "isActive": true
    }
  ],
  "Lotteries": [
    {
      "permissionId": 5,
      "permissionCode": "lotteries:read",
      "permissionName": "View Lotteries",
      "description": "Can view lottery configurations",
      "category": "Lotteries",
      "isActive": true
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/permissions/categories" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Lotteries Endpoints

### Get All Lotteries

Retrieve list of all lotteries.

**Endpoint:** `GET /api/lotteries`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| pageSize | integer | No | 20 | Items per page |
| isActive | boolean | No | null | Filter by active status |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "lotteryId": 1,
      "lotteryName": "Lotto Nacional",
      "lotteryCode": "LN",
      "description": "National lottery draw",
      "drawTime": "18:00:00",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 15
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/lotteries?isActive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Lottery by ID

Retrieve detailed information about a specific lottery.

**Endpoint:** `GET /api/lotteries/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (integer) - Lottery ID

**Response:** `200 OK`
```json
{
  "lotteryId": 1,
  "lotteryName": "Lotto Nacional",
  "lotteryCode": "LN",
  "description": "National lottery draw every evening",
  "drawTime": "18:00:00",
  "drawDays": "MTWTFSS",
  "minNumber": 0,
  "maxNumber": 99,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2025-01-10T12:00:00Z"
}
```

**Errors:**
- `404 Not Found` - Lottery does not exist

**Example:**
```bash
curl -X GET "http://localhost:5000/api/lotteries/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Draws Endpoints

### Get All Draws

Retrieve list of lottery draws.

**Endpoint:** `GET /api/draws`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lotteryId | integer | No | null | Filter by lottery |
| date | string | No | null | Filter by date (YYYY-MM-DD) |
| page | integer | No | 1 | Page number |
| pageSize | integer | No | 20 | Items per page |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "drawId": 101,
      "lotteryId": 1,
      "lotteryName": "Lotto Nacional",
      "drawDate": "2025-01-13",
      "drawTime": "18:00:00",
      "drawNumber": "12345",
      "status": "Completed",
      "winningNumbers": [7, 14, 21, 35, 42, 49],
      "jackpot": 1000000.00,
      "createdAt": "2025-01-13T18:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 500
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/draws?lotteryId=1&date=2025-01-13" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Betting Pools Endpoints

### Get All Betting Pools

Retrieve list of betting pools (bancas).

**Endpoint:** `GET /api/bettingpools`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| pageSize | integer | No | 20 | Items per page |
| zoneId | integer | No | null | Filter by zone |
| isActive | boolean | No | null | Filter by active status |
| search | string | No | null | Search in name and code |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "bettingPoolId": 1,
      "bettingPoolCode": "BC001",
      "bettingPoolName": "Banca Central",
      "zoneId": 1,
      "zoneName": "Zone North",
      "bankId": 5,
      "bankName": "Bank ABC",
      "isActive": true,
      "operatingHours": "08:00-20:00",
      "createdAt": "2024-06-01T00:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 45
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/bettingpools?zoneId=1&isActive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Betting Pool by ID

Retrieve detailed information about a specific betting pool.

**Endpoint:** `GET /api/bettingpools/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (integer) - Betting Pool ID

**Response:** `200 OK`
```json
{
  "bettingPoolId": 1,
  "bettingPoolCode": "BC001",
  "bettingPoolName": "Banca Central",
  "zoneId": 1,
  "zoneName": "Zone North",
  "bankId": 5,
  "bankName": "Bank ABC",
  "phone": "+1234567890",
  "email": "central@banca.com",
  "address": "123 Main Street",
  "commissionRate": 10.00,
  "isActive": true,
  "operatingHours": "08:00-20:00",
  "maxBetAmount": 50000.00,
  "minBetAmount": 10.00,
  "createdAt": "2024-06-01T00:00:00Z",
  "updatedAt": "2025-01-10T12:00:00Z"
}
```

**Errors:**
- `404 Not Found` - Betting pool does not exist

**Example:**
```bash
curl -X GET "http://localhost:5000/api/bettingpools/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Zones Endpoints

### Get All Zones

Retrieve list of zones (geographic organization).

**Endpoint:** `GET /api/zones`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| pageSize | integer | No | 20 | Items per page |
| countryId | integer | No | null | Filter by country |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "zoneId": 1,
      "zoneName": "Zone North",
      "zoneCode": "ZN01",
      "countryId": 1,
      "countryName": "United States",
      "description": "Northern region",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 12
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/zones" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Prize Configuration Endpoints

### Get Draw Prize Configuration

Retrieve prize configuration for a specific draw.

**Endpoint:** `GET /api/drawprizeconfig/{drawId}`

**Authentication:** Required

**Path Parameters:**
- `drawId` (integer) - Draw ID

**Response:** `200 OK`
```json
[
  {
    "configId": 1,
    "drawId": 101,
    "betTypeId": 1,
    "betTypeName": "Straight",
    "prizeAmount": 500.00,
    "isActive": true
  },
  {
    "configId": 2,
    "drawId": 101,
    "betTypeId": 2,
    "betTypeName": "Box",
    "prizeAmount": 100.00,
    "isActive": true
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/drawprizeconfig/101" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Banca Prize Configuration

Retrieve banca-specific prize overrides.

**Endpoint:** `GET /api/bancaprizeconfig/{bettingPoolId}`

**Authentication:** Required

**Path Parameters:**
- `bettingPoolId` (integer) - Betting Pool ID

**Response:** `200 OK`
```json
[
  {
    "configId": 1,
    "bettingPoolId": 1,
    "lotteryId": 1,
    "lotteryName": "Lotto Nacional",
    "betTypeId": 1,
    "betTypeName": "Straight",
    "prizeAmount": 550.00,
    "isActive": true,
    "createdAt": "2024-06-01T00:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/bancaprizeconfig/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Bet Types Endpoints

### Get All Bet Types

Retrieve list of available bet types.

**Endpoint:** `GET /api/bettypes`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "betTypeId": 1,
    "betTypeName": "Straight",
    "betTypeCode": "STR",
    "description": "Pick numbers in exact order",
    "multiplier": 1.0,
    "isActive": true
  },
  {
    "betTypeId": 2,
    "betTypeName": "Box",
    "betTypeCode": "BOX",
    "description": "Pick numbers in any order",
    "multiplier": 0.5,
    "isActive": true
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/bettypes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Game Types Endpoints

### Get All Game Types

Retrieve list of game types/categories.

**Endpoint:** `GET /api/gametypes`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "gameTypeId": 1,
    "gameTypeName": "Pick 3",
    "gameTypeCode": "P3",
    "description": "Pick 3 digit numbers",
    "numberCount": 3,
    "isActive": true
  },
  {
    "gameTypeId": 2,
    "gameTypeName": "Pick 4",
    "gameTypeCode": "P4",
    "description": "Pick 4 digit numbers",
    "numberCount": 4,
    "isActive": true
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/gametypes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Pagination Best Practices

### Standard Pagination Parameters

All list endpoints support pagination:

```
GET /api/users?page=1&pageSize=20
GET /api/lotteries?page=2&pageSize=50
GET /api/draws?page=1&pageSize=100
```

### Maximum Page Size

- **Default:** 20 items per page
- **Maximum:** 100 items per page
- **Recommendation:** Use 20-50 for optimal performance

### Response Metadata

```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 150,
  "totalPages": 8,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

---

## Filtering Best Practices

### String Search (Partial Match)

```bash
# Search users by username, fullName, or email
GET /api/users?search=john

# Search betting pools by name or code
GET /api/bettingpools?search=central
```

### Exact Match Filters

```bash
# Filter by specific values
GET /api/users?roleId=1
GET /api/draws?lotteryId=5
GET /api/bettingpools?zoneId=2
```

### Boolean Filters

```bash
# Filter by active status
GET /api/lotteries?isActive=true
GET /api/permissions?isActive=false
```

### Date Filters

```bash
# Filter by date (YYYY-MM-DD format)
GET /api/draws?date=2025-01-13

# Date range (if supported)
GET /api/draws?startDate=2025-01-01&endDate=2025-01-31
```

---

## Common Use Cases

### Use Case 1: User Login Flow

```bash
# 1. Login
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Response includes token
# {"token":"eyJ...","username":"admin",...}

# 2. Store token and use in subsequent requests
TOKEN="eyJ..."

# 3. Access protected endpoint
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Use Case 2: Create User with Permissions

```bash
TOKEN="your-jwt-token"

# 1. Create user
curl -X POST "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "roleId": 2
  }'

# Response: {"userId":42,...}

# 2. Assign permissions
curl -X PUT "http://localhost:5000/api/users/42/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionIds":[1,2,5,7]}'

# 3. Verify permissions
curl -X GET "http://localhost:5000/api/users/42/permissions" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Use Case 3: Get Today's Draws

```bash
TOKEN="your-jwt-token"
TODAY=$(date +%Y-%m-%d)

# Get all draws for today
curl -X GET "http://localhost:5000/api/draws?date=$TODAY" \
  -H "Authorization: Bearer $TOKEN"

# Filter by specific lottery
curl -X GET "http://localhost:5000/api/draws?date=$TODAY&lotteryId=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Use Case 4: Get Betting Pool Configuration

```bash
TOKEN="your-jwt-token"

# 1. Get betting pool details
curl -X GET "http://localhost:5000/api/bettingpools/1" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get prize configuration overrides
curl -X GET "http://localhost:5000/api/bancaprizeconfig/1" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get operating schedules
curl -X GET "http://localhost:5000/api/bettingpools/1/schedules" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

### Import Collection

1. Download Swagger JSON:
   ```
   http://localhost:5000/swagger/v1-openapi3/swagger.json
   ```

2. Import into Postman:
   - File → Import → Paste URL or Upload File

3. Configure Environment:
   - Create new environment "Lottery API - Local"
   - Add variable: `baseUrl` = `http://localhost:5000/api`
   - Add variable: `token` = (leave empty, will be set after login)

### Set Up Authentication

1. Create Login Request:
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Body: `{"username":"admin","password":"password123"}`

2. Add Test Script:
   ```javascript
   pm.environment.set("token", pm.response.json().token);
   ```

3. Set Authorization for Collection:
   - Collection → Authorization → Type: Bearer Token
   - Token: `{{token}}`

---

## Swagger UI

### Access Interactive Documentation

**Local:**
```
http://localhost:5000/swagger
```

**Features:**
- Try out all endpoints directly
- View request/response schemas
- Download OpenAPI specification
- Multiple format support (JSON, YAML)

### Available Versions

| Version | Endpoint |
|---------|----------|
| OpenAPI 3.0 (JSON) | `/swagger/v1-openapi3/swagger.json` |
| OpenAPI 3.0 (YAML) | `/swagger/v1-openapi3/swagger.yaml` |
| Swagger 2.0 (JSON) | `/swagger/v1-swagger2/swagger.json` |
| Swagger 2.0 (YAML) | `/swagger/v1-swagger2/swagger.yaml` |

---

## Support

For questions or issues:
- **Email:** support@lotteryapi.com
- **GitHub Issues:** [Report a bug](https://github.com/your-org/Lottery-Apis/issues)
- **Documentation:** [Full docs](https://github.com/your-org/Lottery-Apis/wiki)

---

**Last Updated:** 2025-01-13
**API Version:** 1.0
