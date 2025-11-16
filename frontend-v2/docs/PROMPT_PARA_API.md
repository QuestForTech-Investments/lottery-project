# 🔧 Prompt para Modificar la API - Campos Obligatorios de Usuarios

---

## 📋 **Problema Actual:**

El DTO `CreateUserWithPermissionsRequest` tiene el campo `FullName` marcado como `[Required]`, pero en la base de datos este campo es **NULL** (opcional).

Esto causa que el formulario del frontend falle al crear usuarios porque no queremos mostrar el campo "Nombre Completo".

---

## 🎯 **Tarea:**

Modificar el archivo `DTOs.cs` para que **solo los campos obligatorios en la base de datos** sean `[Required]` en el DTO.

---

## 📊 **Campos Obligatorios según Base de Datos:**

En la tabla `users`, solo estos campos son **NOT NULL**:

1. `username` (NVARCHAR(50), NOT NULL, UNIQUE)
2. `password_hash` (NVARCHAR(255), NOT NULL)
3. `role_id` (INT, NOT NULL, FK)

**Todos los demás campos son NULL o tienen DEFAULT.**

---

## 🔧 **Cambios Necesarios en `DTOs.cs`:**

### **Actualizar el DTO `CreateUserWithPermissionsRequest`:**

**ANTES:**
```csharp
public class CreateUserWithPermissionsRequest
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    public string Password { get; set; }
    
    [Required]
    public string FullName { get; set; }  // ❌ Esto está mal
    
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? RoleId { get; set; }
    public int? ZoneId { get; set; }
    public int? BranchId { get; set; }
    public decimal? CommissionRate { get; set; }
    public bool? IsActive { get; set; }
    public List<int>? PermissionIds { get; set; }
}
```

**DESPUÉS (Correcto):**
```csharp
public class CreateUserWithPermissionsRequest
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    public string Password { get; set; }
    
    [Required]
    public int? RoleId { get; set; }  // ✅ Obligatorio según BD
    
    // OPCIONALES - Sin [Required]
    public string? FullName { get; set; }  // ✅ Ahora opcional
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? ZoneId { get; set; }
    public int? BranchId { get; set; }
    public decimal? CommissionRate { get; set; }
    public bool? IsActive { get; set; }
    public List<int>? PermissionIds { get; set; }
}
```

---

## 📝 **También Actualizar (si existe):**

### **`CreateUserRequest` (endpoint /api/users):**

**ANTES:**
```csharp
public class CreateUserRequest
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    public string Password { get; set; }
    
    [Required]
    public string FullName { get; set; }  // ❌ Quitar [Required]
    
    [Required]
    public int? RoleId { get; set; }
    
    // ... otros campos
}
```

**DESPUÉS:**
```csharp
public class CreateUserRequest
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    public string Password { get; set; }
    
    [Required]
    public int? RoleId { get; set; }
    
    // OPCIONALES
    public string? FullName { get; set; }  // ✅ Sin [Required]
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? ZoneId { get; set; }
    public int? BranchId { get; set; }
    public decimal? CommissionRate { get; set; }
    public bool? IsActive { get; set; }
}
```

---

## ✅ **Resultado Esperado:**

Después del cambio, el frontend podrá crear usuarios con solo:

```json
POST /api/users/with-permissions

{
  "username": "jorge",
  "password": "Test123!",
  "roleId": 28,
  "zoneId": 1,              // opcional
  "branchId": 1,            // opcional
  "permissionIds": [1, 2, 3],
  "isActive": true
}
```

**Sin necesidad de enviar `fullName`, `email`, `phone`.**

---

## 📚 **Actualizar Documentación:**

Después de hacer el cambio, por favor actualiza:

1. **`🔐 Sistema de Permisos Directo - Documentación Completa.md`**
   - Actualizar ejemplos de requests
   - Marcar `FullName` como opcional

2. **`🔌 Documentación Completa de la API - Sistema de Lotería.md`**
   - Actualizar sección de DTOs
   - Actualizar ejemplos de crear usuario

---

## 🧪 **Probar Después del Cambio:**

```bash
# Test con campos mínimos
POST /api/users/with-permissions
{
  "username": "test01",
  "password": "Test123!",
  "roleId": 28,
  "permissionIds": [1]
}

# Debería retornar: 200 OK con usuario creado
```

---

## 📋 **Resumen de Cambios:**

```
✅ Quitar [Required] de FullName en CreateUserWithPermissionsRequest
✅ Quitar [Required] de FullName en CreateUserRequest (si existe)
✅ Quitar [Required] de Email (s
i lo tiene)
✅ Quitar [Required] de Phone (si lo tiene)
✅ Mantener [Required] solo en: Username, Password, RoleId
✅ Actualizar documentación
✅ Probar endpoint con datos mínimos
```

---

**Esto alineará la API con la estructura real de la base de datos y permitirá que el formulario del frontend funcione sin campos innecesarios.** ✅

