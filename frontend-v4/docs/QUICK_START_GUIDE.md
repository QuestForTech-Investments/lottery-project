# 🚀 Quick Start Guide - User Management

## ✅ Ready to Test!

Everything is configured and ready to use. Follow these steps to test the user creation form.

---

## 📋 Prerequisites

1. **Backend API must be running:**
   ```
   https://localhost:7001/api
   ```

2. **Database must be accessible:**
   ```
   Azure SQL Database: lottery-sql-1505.database.windows.net
   Database: LottoTest
   ```

3. **Frontend dependencies installed:**
   ```bash
   npm install
   ```

---

## 🎯 Steps to Test

### **1. Verify Configuration**

Check that `.env` file exists with:
```env
VITE_API_BASE_URL=https://localhost:7001/api
```

### **2. Start the Development Server**

```bash
npm run dev
```

The app should open automatically at: `http://localhost:3000`

### **3. Navigate to Create User Page**

Option A: Click on "Usuarios" → "Crear Usuario" in the sidebar

Option B: Go directly to: `http://localhost:3000/usuarios/crear`

### **4. Fill the Form**

**Required Fields:**
- **Usuario:** `test_user_01` (min 3 characters)
- **Nombre Completo:** `Test User One`
- **Contraseña:** `TestPass123!` (min 8 chars, 1 uppercase, 1 number)
- **Confirmar:** `TestPass123!` (must match password)
- **Rol:** Select any role from dropdown (e.g., "Operador")

**Optional Fields:**
- **Email:** `test@example.com`
- **Teléfono:** `809-555-0123`
- **Zona:** Select a zone
- **Sucursal:** Will populate after selecting zone
- **Comisión (%):** `2.50`
- **Estado:** Toggle Active/Inactive

### **5. Preview Permissions (Optional)**

After selecting a role, click "▼ Ver permisos del rol" to see what permissions that role includes.

### **6. Submit the Form**

Click "Crear Usuario" button

**Expected Behavior:**
- Button shows loading state: "Creando usuario..."
- Form is validated
- POST request sent to `/api/users`
- Success message appears: "✅ Usuario creado exitosamente"
- After 2 seconds, redirects to user list

---

## 🔍 Testing Scenarios

### **✅ Test Case 1: Successful Creation**
```
Username: testuser01
Full Name: Test User
Email: test@example.com
Password: SecurePass123!
Confirm: SecurePass123!
Role: Select any role
Zone: Select any zone
```
**Expected:** User created successfully, redirected to list

### **✅ Test Case 2: Password Validation**
```
Password: weak
```
**Expected:** Error: "La contraseña debe tener al menos 8 caracteres"

### **✅ Test Case 3: Password Mismatch**
```
Password: SecurePass123!
Confirm: DifferentPass123!
```
**Expected:** Error: "Las contraseñas no coinciden"

### **✅ Test Case 4: Invalid Email**
```
Email: notanemail
```
**Expected:** Error: "El email no es válido"

### **✅ Test Case 5: Missing Required Fields**
```
Leave Username empty
```
**Expected:** Error: "El usuario es requerido"

### **✅ Test Case 6: Role Not Selected**
```
Don't select a role
```
**Expected:** Error: "Debe seleccionar un rol"

### **✅ Test Case 7: Commission Out of Range**
```
Commission: 150
```
**Expected:** Error: "La comisión debe estar entre 0 y 100"

### **✅ Test Case 8: Branch Without Zone**
```
Try to select branch without selecting zone first
```
**Expected:** Branch selector disabled with message "Primero seleccione una zona"

---

## 🐛 Troubleshooting

### **Problem: "Cargando roles..." stays forever**

**Cause:** API is not reachable or roles endpoint failing

**Solution:**
1. Verify API is running at `https://localhost:7001`
2. Check browser console for errors
3. Test API directly: `GET https://localhost:7001/api/roles`
4. If using HTTPS, may need to accept self-signed certificate

### **Problem: "Error al cargar las zonas"**

**Cause:** Zones endpoint not responding

**Solution:**
1. Test zones endpoint: `GET https://localhost:7001/api/zones`
2. Check API logs for errors
3. Verify database connection

### **Problem: Form submission fails with CORS error**

**Cause:** API CORS not configured for localhost:3000

**Solution:**
1. Check API CORS configuration in .NET
2. Verify `AllowAnyOrigin()` is set in API startup

### **Problem: "Network Error" on submit**

**Cause:** Cannot reach API server

**Solution:**
1. Verify API is running
2. Check `.env` file has correct URL
3. Restart frontend dev server after changing `.env`

### **Problem: Form doesn't reset after success**

**Cause:** JavaScript error in form reset logic

**Solution:**
1. Check browser console for errors
2. Refresh page and try again

---

## 📊 API Endpoints Being Called

When you use the form, these API calls are made:

1. **On page load:**
   ```
   GET /api/roles        -> Loads roles for selector
   GET /api/zones        -> Loads zones for selector
   ```

2. **When role is selected:**
   ```
   GET /api/roles/{id}   -> Gets role details with permissions
   ```

3. **When zone is selected:**
   ```
   GET /api/branches/by-zone/{zoneId}  -> Loads branches
   ```

4. **On form submit:**
   ```
   POST /api/users       -> Creates the user
   ```

---

## 📝 Sample API Request

When you submit the form, this is sent to the API:

```json
POST /api/users
Content-Type: application/json

{
  "username": "testuser01",
  "password": "SecurePass123!",
  "fullName": "Test User One",
  "email": "test@example.com",
  "phone": "809-555-0123",
  "roleId": 28,
  "zoneId": 1,
  "branchId": 1,
  "commissionRate": 2.50,
  "isActive": true
}
```

---

## 📝 Sample API Response

Successful response:

```json
{
  "success": true,
  "data": {
    "userId": 123,
    "username": "testuser01",
    "fullName": "Test User One",
    "email": "test@example.com",
    "phone": "809-555-0123",
    "role": {
      "roleId": 28,
      "name": "Operador"
    },
    "zone": {
      "zoneId": 1,
      "name": "Zona Norte"
    },
    "branch": {
      "branchId": 1,
      "name": "Sucursal Central"
    },
    "commissionRate": 2.50,
    "isActive": true,
    "createdAt": "2025-10-13T15:30:00Z"
  },
  "message": "User created successfully"
}
```

---

## 🎨 Features to Test

- [ ] Form loads without errors
- [ ] Role selector populates
- [ ] Zone selector populates
- [ ] Branch selector becomes enabled after zone selection
- [ ] Permission viewer shows when role selected
- [ ] Real-time validation on password field
- [ ] Email validation works
- [ ] Required field indicators (*) show
- [ ] Loading spinner shows during submission
- [ ] Success message appears after creation
- [ ] Form resets after successful creation
- [ ] Auto-redirect to user list works
- [ ] Cancel button navigates to user list
- [ ] All error messages display properly

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Form loads with all selectors populated from API
2. ✅ Validations show errors in real-time
3. ✅ Form submits successfully to API
4. ✅ Success message appears
5. ✅ User is redirected to user list after 2 seconds

---

## 📞 Need Help?

1. Check browser DevTools Console for errors
2. Check browser Network tab for API calls
3. Verify API is running and accessible
4. Check `.env` configuration
5. Restart development server

---

## 🎉 Congratulations!

If all tests pass, your user management system is **fully functional** and ready for production use!

---

**Created:** October 13, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

