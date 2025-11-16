# Services Documentation

This directory contains all API service modules for the Lottery Management System.

## 📚 Available Services

### 1. **User Service** (`userService.js`)
Handles all user-related operations.

**Key Methods:**
- `getAllUsers(params)` - Get users with pagination and filters
- `getUserById(userId)` - Get specific user details
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update user information
- `changePassword(userId, passwordData)` - Change user password
- `deactivateUser(userId)` - Deactivate user
- `checkUsernameAvailability(username)` - Check if username is available

**Example:**
```javascript
import { userService } from '@/services'

// Create new user
const newUser = await userService.createUser({
  username: 'john_doe',
  password: 'SecurePass123!',
  email: 'john@example.com',
  fullName: 'John Doe',
  phone: '809-555-0123',
  roleId: 28,
  zoneId: 1,
  branchId: 1,
  commissionRate: 2.50,
  isActive: true
})

// Get users with pagination
const users = await userService.getAllUsers({
  page: 1,
  pageSize: 20,
  search: 'john',
  roleId: 28
})
```

---

### 2. **Role Service** (`roleService.js`)
Manages roles and role-permission assignments.

**Key Methods:**
- `getAllRoles(includePermissions)` - Get all roles
- `getRoleById(roleId)` - Get specific role
- `getRolePermissions(roleId)` - Get role's permissions
- `createRole(roleData)` - Create new role
- `assignPermissionsToRole(roleId, permissionIds)` - Assign permissions
- `removePermissionFromRole(roleId, permissionId)` - Remove permission
- `getActiveRoles()` - Get active roles only

**Example:**
```javascript
import { roleService } from '@/services'

// Get all roles with permissions
const roles = await roleService.getAllRoles(true)

// Get role details with permissions
const roleDetails = await roleService.getRoleFullDetails(25)

// Assign permissions to role
await roleService.assignPermissionsToRole(28, [1, 2, 3, 17, 18, 19])
```

---

### 3. **Zone Service** (`zoneService.js`)
Handles geographic zones management.

**Key Methods:**
- `getAllZones(includeStats)` - Get all zones
- `getZoneById(zoneId)` - Get specific zone
- `getZoneBranches(zoneId)` - Get zone's branches
- `getZoneUsers(zoneId)` - Get zone's users
- `createZone(zoneData)` - Create new zone
- `getActiveZones()` - Get active zones only

**Example:**
```javascript
import { zoneService } from '@/services'

// Get all zones
const zones = await zoneService.getActiveZones()

// Get zone with full details
const zoneDetails = await zoneService.getZoneFullDetails(1)
```

---

### 4. **Branch Service** (`branchService.js`)
Manages branches (sucursales) operations.

**Key Methods:**
- `getAllBranches(params)` - Get all branches
- `getBranchById(branchId)` - Get specific branch
- `getBranchesByZone(zoneId)` - Get branches by zone
- `getBranchUsers(branchId)` - Get branch's users
- `createBranch(branchData)` - Create new branch
- `getActiveBranches(zoneId)` - Get active branches

**Example:**
```javascript
import { branchService } from '@/services'

// Get branches by zone
const branches = await branchService.getBranchesByZone(1)

// Create new branch
const newBranch = await branchService.createBranch({
  zoneId: 1,
  branchName: 'Sucursal Norte',
  branchCode: 'SN001',
  address: 'Calle Principal 123',
  phone: '809-555-0100',
  commissionRate: 5.00,
  isActive: true
})
```

---

### 5. **Permission Service** (`permissionService.js`)
Manages system permissions.

**Key Methods:**
- `getAllPermissions(category)` - Get all permissions
- `getPermissionCategories()` - Get permissions grouped by category
- `getPermissionById(permissionId)` - Get specific permission
- `getUnassignedPermissions(roleId)` - Get unassigned permissions for a role
- `searchPermissions(query)` - Search permissions
- `getPermissionsGroupedByCategory()` - Get grouped permissions

**Example:**
```javascript
import { permissionService } from '@/services'

// Get all permissions grouped by category
const permissionsByCategory = await permissionService.getPermissionCategories()

// Get unassigned permissions for a role
const unassigned = await permissionService.getUnassignedPermissions(28)
```

---

## 🔧 Base API Service

All services use the base `api.js` module which provides:

- `api.get(endpoint, options)` - GET requests
- `api.post(endpoint, data, options)` - POST requests
- `api.put(endpoint, data, options)` - PUT requests
- `api.delete(endpoint, options)` - DELETE requests

**Configuration:**
The API base URL is configured via environment variable:
```env
VITE_API_BASE_URL=https://localhost:7001/api
```

---

## 📦 Import Examples

**Import specific service:**
```javascript
import { userService } from '@/services'
```

**Import specific methods:**
```javascript
import { getAllUsers, createUser } from '@/services/userService'
```

**Import multiple services:**
```javascript
import { userService, roleService, zoneService } from '@/services'
```

---

## 🛡️ Error Handling

All services return promises that should be handled with try-catch:

```javascript
try {
  const users = await userService.getAllUsers({ page: 1, pageSize: 20 })
  console.log('Users:', users)
} catch (error) {
  console.error('Error fetching users:', error)
  // Handle error appropriately
}
```

Use the `apiErrorHandler` utility for consistent error handling:

```javascript
import { handleApiError } from '@/utils'

try {
  const users = await userService.getAllUsers()
} catch (error) {
  const message = handleApiError(error, showNotification)
  console.error(message)
}
```

---

## 📊 API Response Format

All API responses follow this standard format:

```javascript
{
  success: true,
  data: {
    // Response data
  },
  message: "Operation completed successfully",
  count: 10, // For list responses
  pagination: { // For paginated responses
    currentPage: 1,
    pageSize: 20,
    totalCount: 100,
    totalPages: 5
  }
}
```

---

## 🔐 Authentication

Most endpoints require authentication. The API service automatically includes the JWT token from localStorage (if implemented).

To add authentication to the API service, update `api.js`:

```javascript
const token = localStorage.getItem('authToken')
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}
```

---

## 🚀 Next Steps

1. Implement authentication token handling in `api.js`
2. Add interceptors for token refresh
3. Implement request/response logging
4. Add offline queue for failed requests
5. Implement caching strategy for frequently accessed data

---

**Last Updated:** October 13, 2025
**API Version:** 1.0
**Framework:** .NET 8.0

