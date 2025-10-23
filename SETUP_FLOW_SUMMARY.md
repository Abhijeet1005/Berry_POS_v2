# Berry & Blocks POS - Setup Flow Summary

## The Chicken-and-Egg Problem - Solved! 🐔🥚

### The Problem

In a multi-tenant system, you need:
- A **tenant** to create an admin
- An **admin** to create a tenant

This creates a circular dependency!

### The Solution

We use a **Global Admin** approach:

```
Global Admin (no tenant required)
    ↓
Can create Tenants
    ↓
Can create Outlet Admins (linked to tenants)
    ↓
Outlet Admins manage their restaurants
```

---

## Setup Flow

### 1️⃣ First Time Setup (Do Once)

**Create Global Admin:**

```bash
# Option A: Using script (recommended)
npm run setup:admin

# Option B: Using script directly
node scripts/createGlobalAdmin.js

# Option C: Using API
POST /api/v1/auth/register
{
  "email": "superadmin@berryblocks.com",
  "password": "SuperAdmin123!",
  "role": "admin",
  "tenantId": "global",
  "outletId": "global",
  ...
}
```

**Result:** You now have a super admin that can create tenants.

---

### 2️⃣ Create Your First Restaurant

**Login as Global Admin:**
```bash
POST /api/v1/auth/login
{
  "email": "superadmin@berryblocks.com",
  "password": "SuperAdmin123!"
}
```

**Create Tenant/Outlet:**
```bash
POST /api/v1/tenants
Authorization: Bearer <global_admin_token>
{
  "type": "outlet",
  "name": "My Restaurant",
  ...
}
```

**Create Outlet Admin:**
```bash
POST /api/v1/auth/register
Authorization: Bearer <global_admin_token>
{
  "email": "admin@myrestaurant.com",
  "password": "Admin123!",
  "role": "admin",
  "tenantId": "<outlet_id>",
  "outletId": "<outlet_id>",
  ...
}
```

---

### 3️⃣ Daily Operations

**Login as Outlet Admin:**
```bash
POST /api/v1/auth/login
{
  "email": "admin@myrestaurant.com",
  "password": "Admin123!"
}
```

**Manage Restaurant:**
- Create menu categories and dishes
- Set up tables
- Create staff users
- Process orders
- Handle payments

---

## Account Types

| Account Type | Tenant ID | Purpose | When to Use |
|--------------|-----------|---------|-------------|
| **Global Admin** | `"global"` | Create tenants, system management | Initial setup, adding restaurants |
| **Outlet Admin** | `<outlet_id>` | Manage specific restaurant | Daily operations |
| **Staff** | `<outlet_id>` | Restaurant operations | Taking orders, payments, etc. |
| **Customer** | N/A | Self-service ordering | Customer-facing features |

---

## Adding More Restaurants

**Use Global Admin to:**

1. Login as global admin
2. Create new tenant/outlet
3. Create admin for that outlet
4. New admin manages their restaurant

**Example:**
```bash
# 1. Login as global admin
POST /api/v1/auth/login
{ "email": "superadmin@berryblocks.com", ... }

# 2. Create new outlet
POST /api/v1/tenants
Authorization: Bearer <global_admin_token>
{ "type": "outlet", "name": "Branch 2", ... }

# 3. Create admin for new outlet
POST /api/v1/auth/register
Authorization: Bearer <global_admin_token>
{
  "email": "admin.branch2@myrestaurant.com",
  "tenantId": "<new_outlet_id>",
  "outletId": "<new_outlet_id>",
  ...
}
```

---

## Restaurant Chain Structure

For multiple brands/locations:

```
Global Admin
    ↓
Company (Parent Tenant)
    ├── Outlet 1 (Brand A - Location 1)
    │   └── Outlet Admin 1
    ├── Outlet 2 (Brand A - Location 2)
    │   └── Outlet Admin 2
    └── Outlet 3 (Brand B - Location 1)
        └── Outlet Admin 3
```

**Create Company:**
```bash
POST /api/v1/tenants
Authorization: Bearer <global_admin_token>
{
  "type": "company",
  "name": "Restaurant Group Inc",
  ...
}
```

**Create Outlets Under Company:**
```bash
POST /api/v1/tenants
Authorization: Bearer <global_admin_token>
{
  "type": "outlet",
  "name": "Pizza Paradise - Andheri",
  "parentTenant": "<company_id>",
  ...
}
```

---

## Security Best Practices

### Global Admin

✅ **DO:**
- Keep credentials extremely secure
- Use strong, unique password
- Enable 2FA
- Limit access to trusted personnel only
- Use only for tenant creation and system management

❌ **DON'T:**
- Use for daily operations
- Share credentials
- Use weak passwords
- Store in plain text

### Outlet Admin

✅ **DO:**
- Create separate admin for each outlet
- Use strong passwords
- Enable 2FA
- Regular password changes
- Audit access logs

❌ **DON'T:**
- Share admin credentials with staff
- Use same password across outlets
- Give admin access unnecessarily

---

## Quick Reference

### Create Global Admin
```bash
npm run setup:admin
```

### Login as Global Admin
```bash
POST /api/v1/auth/login
{ "email": "superadmin@berryblocks.com", "password": "..." }
```

### Create Tenant
```bash
POST /api/v1/tenants
Authorization: Bearer <global_admin_token>
{ "type": "outlet", "name": "...", ... }
```

### Create Outlet Admin
```bash
POST /api/v1/auth/register
Authorization: Bearer <global_admin_token>
{
  "email": "admin@outlet.com",
  "tenantId": "<outlet_id>",
  "outletId": "<outlet_id>",
  ...
}
```

### Login as Outlet Admin
```bash
POST /api/v1/auth/login
{ "email": "admin@outlet.com", "password": "..." }
```

---

## Troubleshooting

### "User already exists"
- Email is already registered
- Use different email or reset password

### "Tenant not found"
- Verify tenant ID is correct
- Check tenant was created successfully

### "Unauthorized"
- Token expired - login again
- Wrong token - use correct admin token
- Insufficient permissions - check role

### "Cannot create tenant"
- Not logged in as global admin
- Token missing or invalid
- Check Authorization header

---

## Files

- **Setup Script**: `scripts/createGlobalAdmin.js`
- **Documentation**: `GETTING_STARTED.md`
- **Package Script**: `npm run setup:admin`

---

## Summary

1. **First Time**: Create global admin (once)
2. **Per Restaurant**: Create tenant + outlet admin
3. **Daily Use**: Login as outlet admin
4. **Add Restaurant**: Use global admin to create new tenant

This approach solves the chicken-and-egg problem and provides a secure, scalable way to manage multiple restaurants! 🎉
