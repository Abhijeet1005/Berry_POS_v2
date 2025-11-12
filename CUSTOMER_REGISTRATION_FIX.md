# Customer Registration Fix - 401 Unauthorized Issue

## 🐛 Problem
Customer registration was returning `401 Unauthorized - No token provided` error.

## 🔍 Root Cause
The `injectTenantContext` middleware required authentication (which sets `req.tenantId`), but customer registration is a public endpoint that shouldn't require authentication.

## ✅ Solution
Created a custom `customerTenantMiddleware` that accepts `tenantId` from:
1. Request body (`body.tenantId`)
2. Query parameter (`query.tenantId`)
3. Header (`x-tenant-id`)
4. Auth middleware (for authenticated requests)

## 📝 Changes Made

### 1. Customer Routes (`src/modules/customer/customerRoutes.js`)
- ✅ Replaced `injectTenantContext` with custom `customerTenantMiddleware`
- ✅ Middleware now accepts tenantId from multiple sources
- ✅ Public endpoints (register, login, verify-otp) work without authentication

### 2. Customer Validation (`src/modules/customer/customerValidation.js`)
- ✅ Added `tenantId` as required field in `register` schema
- ✅ Added `tenantId` as required field in `login` schema
- ✅ Added `tenantId` as required field in `verifyOTP` schema

### 3. Postman Collection (`Berry_Blocks_POS_Complete_Collection.json`)
- ✅ Updated "Customer Register" to include `tenantId`
- ✅ Updated "Customer Login" to include `tenantId`
- ✅ Updated "Verify OTP" to include `tenantId`

## 🧪 How to Test

### Step 1: Get Your Tenant ID
First, you need a tenant ID. If you don't have one, create a tenant:

```bash
POST {{base_url}}/tenants
Authorization: Bearer {{access_token}}

{
  "name": "My Restaurant",
  "type": "outlet",
  "contactEmail": "restaurant@example.com",
  "contactPhone": "9876543210"
}
```

Save the returned `_id` as `{{tenant_id}}` in your Postman environment.

### Step 2: Register Customer
```bash
POST {{base_url}}/customer/auth/register

{
  "tenantId": "{{tenant_id}}",
  "phone": "9876543210",
  "name": "John Customer",
  "email": "customer@example.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "customerId": "...",
    "message": "OTP sent to your phone number"
  }
}
```

**Check Server Console** for OTP:
```
⚠️ DEVELOPMENT MODE - OTP for 9876543210: 123456
```

### Step 3: Verify OTP
```bash
POST {{base_url}}/customer/auth/verify-otp

{
  "tenantId": "{{tenant_id}}",
  "phone": "9876543210",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customer": {
      "id": "...",
      "name": "John Customer",
      "phone": "9876543210",
      "email": "customer@example.com",
      "loyaltyPoints": 0
    }
  }
}
```

The token is automatically saved to `{{customer_token}}` environment variable.

### Step 4: Use Protected Endpoints
Now you can use all protected customer endpoints:

```bash
GET {{base_url}}/customer/profile
Authorization: Bearer {{customer_token}}
```

## 🔄 Alternative: Using Header for TenantId

Instead of including `tenantId` in the body, you can use a header:

```bash
POST {{base_url}}/customer/auth/register
x-tenant-id: {{tenant_id}}

{
  "phone": "9876543210",
  "name": "John Customer",
  "email": "customer@example.com"
}
```

This is useful for mobile apps where you want to set the tenant once globally.

## 📋 Updated Request Examples

### Customer Register
```json
{
  "tenantId": "673b1234567890abcdef1234",
  "phone": "9876543210",
  "name": "John Customer",
  "email": "customer@example.com"
}
```

### Customer Login
```json
{
  "tenantId": "673b1234567890abcdef1234",
  "phone": "9876543210"
}
```

### Verify OTP
```json
{
  "tenantId": "673b1234567890abcdef1234",
  "phone": "9876543210",
  "otp": "123456"
}
```

## ⚠️ Important Notes

1. **TenantId is Required**: All customer auth endpoints now require `tenantId`
2. **Multi-Tenant Support**: Each customer belongs to a specific tenant (restaurant/outlet)
3. **OTP in Console**: In development, OTPs are printed to console (not sent via SMS)
4. **Token Auto-Save**: After OTP verification, token is automatically saved to Postman environment

## 🚀 Status

✅ **FIXED** - Customer registration now works without authentication
✅ **TESTED** - All customer endpoints validated
✅ **DOCUMENTED** - Postman collection updated

---

**Last Updated**: 2025-11-06
**Issue**: 401 Unauthorized on customer registration
**Status**: ✅ RESOLVED
