# 🚀 Getting Started with Berry & Blocks POS System

Complete guide to set up and run your restaurant POS system in 30 minutes.

## 📋 Quick Navigation

- [Prerequisites](#prerequisites) - What you need installed
- [Installation](#installation) - Get the code running
- [First Setup](#first-setup) - Create your restaurant
- [Menu Setup](#menu-setup) - Add categories and dishes
- [Table Setup](#table-setup) - Configure tables
- [Order Flow](#order-flow) - Process your first order
- [Testing](#testing) - Use Postman collection
- [Troubleshooting](#troubleshooting) - Common issues

---

## Prerequisites

### Required Software

| Software | Version | Download | Required? |
|----------|---------|----------|-----------|
| Node.js | 18+ | https://nodejs.org | ✅ Yes |
| MongoDB | 5.0+ | https://mongodb.com/download | ✅ Yes |
| Redis | 6.0+ | https://redis.io/download | ⚠️ Optional |
| Git | Latest | https://git-scm.com | ✅ Yes |

**Note:** Redis is optional - the app works without it (just no caching).

### Verify Installation

```bash
node --version   # Should show v18.0.0 or higher
npm --version    # Should show 9.0.0 or higher
mongod --version # Should show MongoDB version
git --version    # Should show Git version
```

---

## Installation

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd berry-blocks-pos-backend
```

### 2. Install Dependencies

```bash
npm install
# Wait 2-3 minutes for installation
```

### 3. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env file with your settings
```

**Minimum Required Configuration:**

```env
# Server
NODE_ENV=development
PORT=3000

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/berry-blocks-pos

# JWT Secrets (REQUIRED - Change these!)
JWT_SECRET=change-this-to-random-64-char-string
JWT_REFRESH_SECRET=change-this-to-another-random-string

# Redis (OPTIONAL)
REDIS_HOST=localhost
REDIS_PORT=6379

# Razorpay (OPTIONAL - for online payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Generate Secure Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run twice, use output for JWT_SECRET and JWT_REFRESH_SECRET
```

### 4. Start Services

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Redis (optional)
redis-server

# Terminal 3: Start Application
npm run dev
```

**Expected Output:**
```
✓ MongoDB connected successfully
✓ Redis connected (or warning if not available)
✓ Server started on port 3000
✓ API Docs: http://localhost:3000/api-docs
```

### 5. Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok",...}
```

**Open API Documentation:**
http://localhost:3000/api-docs

---

## First Setup

### Understanding the Setup Flow

To avoid the chicken-and-egg problem (needing a tenant to create an admin, but needing an admin to create a tenant), we follow this approach:

```
1. Create Global/Super Admin (no tenant required)
   ↓
2. Login as Global Admin
   ↓
3. Create Tenant/Outlet
   ↓
4. Create Outlet Admin (linked to tenant)
   ↓
5. Outlet Admin manages their restaurant
```

### Step 1: Create Global Admin (First Time Only)

**This is a special admin that can create tenants. You only do this once.**

#### Option A: Using the Setup Script (Recommended)

```bash
# Run the global admin creation script
node scripts/createGlobalAdmin.js

# Follow the prompts to enter email and password
# Or provide via environment variables:
ADMIN_EMAIL=superadmin@berryblocks.com ADMIN_PASSWORD=SuperAdmin123! node scripts/createGlobalAdmin.js
```

**The script will:**
- ✅ Check if global admin already exists
- ✅ Validate email and password
- ✅ Create the global admin account
- ✅ Display credentials and next steps

#### Option B: Using API (Manual)

```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "superadmin@berryblocks.com",
  "password": "SuperAdmin123!@#",
  "firstName": "Super",
  "lastName": "Admin",
  "phone": "9999999999",
  "role": "admin",
  "tenantId": "global",
  "outletId": "global"
}
```

**💾 Save the `accessToken` from response!**

**⚠️ Important Notes:**
- Use `"tenantId": "global"` and `"outletId": "global"` for the super admin
- This admin can create tenants and manage the entire system
- Keep these credentials secure - this is your master account
- You only create this once during initial setup

### Step 2: Login as Global Admin

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "superadmin@berryblocks.com",
  "password": "SuperAdmin123!@#"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "superadmin@berryblocks.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "..."
    }
  }
}
```

**💾 Save this token - use it for creating tenants!**

### Step 3: Create Your Restaurant (Tenant/Outlet)

**Now use the global admin token to create your restaurant:**

```bash
POST http://localhost:3000/api/v1/tenants
Authorization: Bearer <global_admin_token>
Content-Type: application/json

{
  "type": "outlet",
  "name": "My Restaurant",
  "contactInfo": {
    "email": "contact@myrestaurant.com",
    "phone": "9876543210",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    }
  },
  "settings": {
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "taxRate": 5,
    "serviceCharge": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67123abc456def789...",
    "type": "outlet",
    "name": "My Restaurant",
    ...
  }
}
```

**💾 Save the `_id` - this is your `outlet_id`!**

### Step 4: Create Outlet Admin

**Create an admin specifically for this restaurant:**

```bash
POST http://localhost:3000/api/v1/auth/register
Authorization: Bearer <global_admin_token>
Content-Type: application/json

{
  "email": "admin@myrestaurant.com",
  "password": "Admin123!@#",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "role": "admin",
  "tenantId": "<outlet_id_from_step_3>",
  "outletId": "<outlet_id_from_step_3>"
}
```

**💾 Save the outlet admin credentials!**

### Step 5: Login as Outlet Admin

**From now on, use the outlet admin for daily operations:**

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@myrestaurant.com",
  "password": "Admin123!@#"
}
```

**Use this token for all restaurant operations:**
```
Authorization: Bearer <outlet_admin_token>
```

### Setup Summary

| Account | Purpose | When to Use |
|---------|---------|-------------|
| **Global Admin** | Create tenants, system-wide management | Initial setup, adding new restaurants |
| **Outlet Admin** | Manage specific restaurant | Daily operations, menu, staff, orders |

**🎯 You're now ready to set up your menu, tables, and start taking orders!**

---

## Managing Multiple Restaurants

### Adding More Restaurants

If you want to add more restaurant locations, use the **Global Admin** account:

**1. Login as Global Admin:**
```bash
POST http://localhost:3000/api/v1/auth/login

{
  "email": "superadmin@berryblocks.com",
  "password": "SuperAdmin123!@#"
}
```

**2. Create New Outlet:**
```bash
POST http://localhost:3000/api/v1/tenants
Authorization: Bearer <global_admin_token>

{
  "type": "outlet",
  "name": "My Restaurant - Branch 2",
  "contactInfo": {
    "email": "branch2@myrestaurant.com",
    "phone": "9876543211",
    "address": {
      "street": "456 Another St",
      "city": "Delhi",
      "state": "Delhi",
      "country": "India",
      "zipCode": "110001"
    }
  }
}
```

**3. Create Admin for New Outlet:**
```bash
POST http://localhost:3000/api/v1/auth/register
Authorization: Bearer <global_admin_token>

{
  "email": "admin.branch2@myrestaurant.com",
  "password": "Admin123!@#",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543211",
  "role": "admin",
  "tenantId": "<new_outlet_id>",
  "outletId": "<new_outlet_id>"
}
```

### Restaurant Chain Structure

For restaurant chains with multiple brands:

**1. Create Company (Parent):**
```bash
POST http://localhost:3000/api/v1/tenants
Authorization: Bearer <global_admin_token>

{
  "type": "company",
  "name": "Restaurant Group Inc",
  "contactInfo": {
    "email": "admin@restaurantgroup.com",
    "phone": "9876543200"
  }
}
```

**2. Create Outlets Under Company:**
```bash
POST http://localhost:3000/api/v1/tenants
Authorization: Bearer <global_admin_token>

{
  "type": "outlet",
  "name": "Pizza Paradise - Andheri",
  "parentTenant": "<company_id>",
  "contactInfo": {
    "email": "andheri@pizzaparadise.com",
    "phone": "9876543201",
    "address": { ... }
  }
}
```

---

## Menu Setup

### Create Categories

```bash
POST http://localhost:3000/api/v1/categories
Authorization: Bearer <token>
Content-Type: application/json

# Starters
{"name": "Starters", "description": "Appetizers", "kitchenSection": "kitchen", "displayOrder": 1}

# Main Course
{"name": "Main Course", "description": "Main dishes", "kitchenSection": "kitchen", "displayOrder": 2}

# Beverages
{"name": "Beverages", "description": "Drinks", "kitchenSection": "bar", "displayOrder": 3}

# Desserts
{"name": "Desserts", "description": "Sweets", "kitchenSection": "dessert", "displayOrder": 4}
```

### Add Dishes

**Vegetarian Dish:**
```bash
POST http://localhost:3000/api/v1/dishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "outletId": "<your_outlet_id>",
  "name": "Paneer Tikka",
  "description": {
    "short": "Grilled cottage cheese",
    "detailed": "Marinated paneer grilled with spices"
  },
  "categoryId": "<starters_category_id>",
  "price": 250,
  "dietaryTags": ["veg"],
  "allergens": ["dairy"],
  "ingredients": ["paneer", "yogurt", "spices"],
  "prepTime": 20,
  "stock": 50,
  "taxRate": 5,
  "isAvailable": true
}
```

**Non-Vegetarian Dish:**
```bash
POST http://localhost:3000/api/v1/dishes

{
  "outletId": "<your_outlet_id>",
  "name": "Butter Chicken",
  "description": {
    "short": "Creamy chicken curry",
    "detailed": "Tender chicken in rich tomato gravy"
  },
  "categoryId": "<main_course_category_id>",
  "price": 350,
  "dietaryTags": ["non-veg"],
  "allergens": ["dairy"],
  "ingredients": ["chicken", "tomato", "butter", "cream"],
  "prepTime": 25,
  "stock": 30,
  "taxRate": 5,
  "isAvailable": true
}
```

**Beverage:**
```bash
POST http://localhost:3000/api/v1/dishes

{
  "outletId": "<your_outlet_id>",
  "name": "Mango Lassi",
  "description": {
    "short": "Sweet mango yogurt drink",
    "detailed": "Fresh mango blended with yogurt"
  },
  "categoryId": "<beverages_category_id>",
  "price": 80,
  "dietaryTags": ["veg"],
  "allergens": ["dairy"],
  "prepTime": 5,
  "stock": 100,
  "taxRate": 5,
  "isAvailable": true
}
```

---

## Table Setup

### Create Tables

```bash
POST http://localhost:3000/api/v1/tables
Authorization: Bearer <token>
Content-Type: application/json

# Table 1
{"outletId": "<outlet_id>", "tableNumber": "T1", "capacity": 4, "section": "Main Hall"}

# Table 2
{"outletId": "<outlet_id>", "tableNumber": "T2", "capacity": 2, "section": "Main Hall"}

# Table 3
{"outletId": "<outlet_id>", "tableNumber": "T3", "capacity": 6, "section": "Private"}

# Table 4
{"outletId": "<outlet_id>", "tableNumber": "T4", "capacity": 4, "section": "Outdoor"}
```

### Generate QR Codes

```bash
GET http://localhost:3000/api/v1/tables/<table_id>/qr
Authorization: Bearer <token>
```

**Print and place QR codes on tables for customer self-service ordering.**

---

## Order Flow

### Complete Order Example

**1. Create Order:**
```bash
POST http://localhost:3000/api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "outletId": "<outlet_id>",
  "tableId": "<table_id>",
  "orderType": "dine-in",
  "items": [
    {
      "dishId": "<paneer_tikka_id>",
      "quantity": 2,
      "customization": "Less spicy"
    },
    {
      "dishId": "<butter_chicken_id>",
      "quantity": 1
    },
    {
      "dishId": "<mango_lassi_id>",
      "quantity": 2
    }
  ],
  "specialInstructions": "Customer prefers less oil"
}
```

**2. Generate KOT (Kitchen Order Ticket):**
```bash
POST http://localhost:3000/api/v1/orders/<order_id>/kot
Authorization: Bearer <token>
```

**3. Update Order Status:**
```bash
PATCH http://localhost:3000/api/v1/orders/<order_id>/status
Authorization: Bearer <token>
Content-Type: application/json

{"status": "confirmed"}    # Order confirmed
{"status": "preparing"}    # Kitchen preparing
{"status": "ready"}        # Food ready
{"status": "served"}       # Food served
```

**4. Process Payment:**
```bash
POST http://localhost:3000/api/v1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "<order_id>",
  "amount": 680,
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 680
    }
  ]
}
```

**5. Get Receipt:**
```bash
GET http://localhost:3000/api/v1/payments/<payment_id>/receipt
Authorization: Bearer <token>
```

---

## Customer Self-Service

### Customer Flow

**1. Customer Scans QR Code** → Opens menu

**2. Customer Registers:**
```bash
POST http://localhost:3000/api/v1/customer/auth/register
Content-Type: application/json

{
  "phone": "9876543210",
  "name": "Customer Name",
  "email": "customer@example.com"
}
```

**3. Customer Receives OTP** → Verifies

**4. Customer Browses Menu:**
```bash
GET http://localhost:3000/api/v1/customer/menu?outletId=<outlet_id>
# No authentication required
```

**5. Customer Adds to Cart:**
```bash
POST http://localhost:3000/api/v1/customer/cart
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "dishId": "<dish_id>",
  "quantity": 2,
  "customization": "Extra spicy"
}
```

**6. Customer Places Order:**
```bash
POST http://localhost:3000/api/v1/customer/orders
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "tableId": "<table_id>",
  "orderType": "dine-in"
}
```

**7. Customer Tracks Order** → Real-time updates via Socket.io

---

## Testing with Postman

### Import Collection

1. **Import Collection:**
   - File: `Berry_Blocks_POS_Complete_Collection.json`
   - Contains 150+ endpoints

2. **Import Environment:**
   - File: `Berry_Blocks_POS_Environment.postman_environment.json`
   - Pre-configured variables

3. **Select Environment:**
   - Click environment dropdown
   - Select "Berry & Blocks POS - Local"

### Quick Test Workflow

1. **Health Check** → Verify server
2. **Create Tenant** → Save `tenant_id`
3. **Register User** → Save `access_token`
4. **Login** → Get fresh token
5. **Create Category** → Save `category_id`
6. **Create Dish** → Save `dish_id`
7. **Create Table** → Save `table_id`
8. **Create Order** → Save `order_id`
9. **Process Payment** → Complete!

**All IDs are auto-saved in Postman environment variables!**

---

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod

# Or on Windows
net start MongoDB
```

### Redis Connection Failed

**This is OK!** The app works without Redis.

To enable Redis:
```bash
# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### Authentication Errors

1. **Check JWT secrets** are set in `.env`
2. **Token expired** → Login again
3. **Wrong role** → Check user permissions

### Cannot Create Order

1. **Check dish exists** and `isAvailable: true`
2. **Check table exists** and status is `available`
3. **Check stock** if `trackInventory: true`

### Payment Fails

1. **Verify order total** matches payment amount
2. **Check order status** is not already `completed`
3. **For Razorpay:** Verify API keys in `.env`

---

## User Roles & Permissions

| Role | Can Do |
|------|--------|
| **Admin** | Everything - full system access |
| **Manager** | Menu, staff, reports, coupons, refunds |
| **Captain** | Orders, tables, KOT updates |
| **Cashier** | Payments, receipts, view orders |
| **Kitchen Staff** | View KOTs, update cooking status |
| **Customer** | Browse menu, order, track, feedback |

---

## Next Steps

### Production Deployment

1. **Set up MongoDB Atlas** (cloud database)
2. **Set up Redis Cloud** (optional)
3. **Configure environment variables** on hosting platform
4. **Enable HTTPS** (use Nginx or hosting platform SSL)
5. **Set up backups** (MongoDB automated backups)

### Advanced Features

- **Loyalty Program** → Reward repeat customers
- **Coupons & Discounts** → Marketing campaigns
- **Reservations** → Table booking system
- **Analytics** → Sales reports and insights
- **AI Recommendations** → Personalized suggestions
- **Valet Service** → Parking management
- **Feedback System** → Customer reviews

### Documentation

- **API Docs:** http://localhost:3000/api-docs
- **Postman Guide:** `POSTMAN_COLLECTION_GUIDE.md`
- **Backend Architecture:** `BACKEND_ARCHITECTURE.md`
- **Database Schema:** `BACKEND_DATABASE_SCHEMA.md`
- **Data Flow:** `BACKEND_DATA_FLOW.md`

---

## Quick Reference

### Essential Endpoints

```bash
# Health
GET /health

# Auth
POST /api/v1/auth/register
POST /api/v1/auth/login

# Menu
GET  /api/v1/categories
GET  /api/v1/dishes
POST /api/v1/dishes

# Orders
POST /api/v1/orders
GET  /api/v1/orders/:id
POST /api/v1/orders/:id/kot

# Payments
POST /api/v1/payments
GET  /api/v1/payments/:id/receipt

# Customer
GET  /api/v1/customer/menu
POST /api/v1/customer/orders
```

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/berry-blocks-pos
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>

# Optional
REDIS_HOST=localhost
RAZORPAY_KEY_ID=<your_key>
OPENAI_API_KEY=<your_key>
```

---

## Support

- **Documentation:** Check `docs/` folder
- **API Reference:** http://localhost:3000/api-docs
- **Postman Collection:** Test all endpoints
- **Logs:** Check `logs/` directory

---

**🎉 You're all set! Start building your restaurant POS system!**

For detailed information, see:
- `README.md` - Project overview
- `API_DOCUMENTATION.md` - Complete API reference
- `BACKEND_ARCHITECTURE.md` - System architecture
- `POSTMAN_COLLECTION_GUIDE.md` - Testing guide
