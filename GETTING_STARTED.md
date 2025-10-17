# Getting Started with Berry & Blocks POS System

This guide will help you set up and start using the Berry & Blocks POS system from scratch.

## Table of Contents
1. [Installation](#installation)
2. [Initial Setup](#initial-setup)
3. [Creating Your First Tenant](#creating-your-first-tenant)
4. [Setting Up Your Restaurant](#setting-up-your-restaurant)
5. [Adding Menu Items](#adding-menu-items)
6. [Managing Tables](#managing-tables)
7. [Processing Orders](#processing-orders)
8. [Handling Payments](#handling-payments)
9. [User Roles & Permissions](#user-roles--permissions)

---

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB 6 or higher
- Redis 7 or higher

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd berry-blocks-pos-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/berry-blocks

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-refresh-secret-change-this

# Optional: Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Step 3: Start Services

```bash
# Start MongoDB (if not running)
mongod

# Start Redis (if not running)
redis-server

# Start the application
npm start

# For development with auto-reload
npm run dev
```

The server will start at `http://localhost:3000`

---

## Initial Setup

### Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

---

## Creating Your First Tenant

### Scenario 1: Single Restaurant (Standalone Outlet)

If you're running a single restaurant:

**Step 1: Register as Admin**

```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "owner@myrestaurant.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "role": "admin",
  "tenantId": "TEMP_ID",  // Will be replaced
  "outletId": "TEMP_ID"   // Will be replaced
}
```

**Step 2: Create Your Outlet Tenant**

```bash
POST http://localhost:3000/api/v1/tenants
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "type": "outlet",
  "name": "My Restaurant",
  "contactInfo": {
    "email": "contact@myrestaurant.com",
    "phone": "9876543210",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    }
  }
}
```

### Scenario 2: Restaurant Chain (Company → Brands → Outlets)

If you're managing multiple brands/outlets:

**Step 1: Create Company**

```bash
POST http://localhost:3000/api/v1/tenants
Authorization: Bearer <admin_token>

{
  "type": "company",
  "name": "Restaurant Group Inc",
  "contactInfo": {
    "email": "admin@restaurantgroup.com",
    "phone": "9876543210",
    "address": {
      "street": "Corporate Office",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400001"
    }
  }
}
```

**Step 2: Create Brand Under Company**

```bash
POST http://localhost:3000/api/v1/tenants

{
  "type": "brand",
  "name": "Pizza Paradise",
  "parentId": "<company_id>",
  "contactInfo": {
    "email": "pizza@restaurantgroup.com",
    "phone": "9876543211"
  }
}
```

**Step 3: Create Outlets Under Brand**

```bash
POST http://localhost:3000/api/v1/tenants/<brand_id>/outlets

{
  "name": "Pizza Paradise - Andheri",
  "contactInfo": {
    "email": "andheri@pizzaparadise.com",
    "phone": "9876543212",
    "address": {
      "street": "456 Link Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "zipCode": "400053"
    }
  }
}
```

---

## Setting Up Your Restaurant

### 1. Create Staff Users

**Manager:**
```bash
POST http://localhost:3000/api/v1/auth/register

{
  "email": "manager@myrestaurant.com",
  "password": "ManagerPass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543213",
  "role": "manager",
  "tenantId": "<your_tenant_id>",
  "outletId": "<your_outlet_id>"
}
```

**Captain (Waiter):**
```bash
POST http://localhost:3000/api/v1/auth/register

{
  "email": "captain@myrestaurant.com",
  "password": "CaptainPass123!",
  "firstName": "Raj",
  "lastName": "Kumar",
  "phone": "9876543214",
  "role": "captain",
  "tenantId": "<your_tenant_id>",
  "outletId": "<your_outlet_id>"
}
```

**Cashier:**
```bash
POST http://localhost:3000/api/v1/auth/register

{
  "email": "cashier@myrestaurant.com",
  "password": "CashierPass123!",
  "firstName": "Priya",
  "lastName": "Sharma",
  "phone": "9876543215",
  "role": "cashier",
  "tenantId": "<your_tenant_id>",
  "outletId": "<your_outlet_id>"
}
```

---

## Adding Menu Items

### Step 1: Create Categories

```bash
POST http://localhost:3000/api/v1/categories
Authorization: Bearer <token>

{
  "name": "Starters",
  "description": "Appetizers and starters",
  "kitchenSection": "kitchen",
  "displayOrder": 1
}
```

```bash
POST http://localhost:3000/api/v1/categories

{
  "name": "Main Course",
  "description": "Main dishes",
  "kitchenSection": "kitchen",
  "displayOrder": 2
}
```

```bash
POST http://localhost:3000/api/v1/categories

{
  "name": "Beverages",
  "description": "Drinks and beverages",
  "kitchenSection": "bar",
  "displayOrder": 3
}
```

### Step 2: Add Dishes

```bash
POST http://localhost:3000/api/v1/dishes
Authorization: Bearer <token>

{
  "outletId": "<your_outlet_id>",
  "name": "Paneer Tikka",
  "description": {
    "short": "Grilled cottage cheese with spices",
    "detailed": "Marinated cottage cheese cubes grilled to perfection with Indian spices"
  },
  "categoryId": "<starters_category_id>",
  "price": 250,
  "dietaryTags": ["veg", "jain"],
  "allergens": ["dairy"],
  "ingredients": ["paneer", "yogurt", "spices", "bell peppers"],
  "prepTime": 20,
  "stock": 50,
  "taxRate": 5
}
```

```bash
POST http://localhost:3000/api/v1/dishes

{
  "outletId": "<your_outlet_id>",
  "name": "Butter Chicken",
  "description": {
    "short": "Creamy tomato-based chicken curry",
    "detailed": "Tender chicken pieces in rich tomato and butter gravy"
  },
  "categoryId": "<main_course_category_id>",
  "price": 350,
  "portionSizes": [
    { "name": "Half", "price": 200, "servings": 1 },
    { "name": "Full", "price": 350, "servings": 2 }
  ],
  "dietaryTags": ["non-veg"],
  "allergens": ["dairy"],
  "ingredients": ["chicken", "tomato", "butter", "cream", "spices"],
  "prepTime": 25,
  "stock": 30,
  "taxRate": 5
}
```

---

## Managing Tables

### Create Tables

```bash
POST http://localhost:3000/api/v1/tables
Authorization: Bearer <token>

{
  "outletId": "<your_outlet_id>",
  "tableNumber": "T1",
  "capacity": 4,
  "section": "Main Hall"
}
```

```bash
POST http://localhost:3000/api/v1/tables

{
  "outletId": "<your_outlet_id>",
  "tableNumber": "T2",
  "capacity": 2,
  "section": "Main Hall"
}
```

### Get Table QR Code

```bash
GET http://localhost:3000/api/v1/tables/<table_id>/qr
Authorization: Bearer <token>
```

The QR code can be printed and placed on tables for contactless ordering.

---

## Processing Orders

### Step 1: Create an Order

```bash
POST http://localhost:3000/api/v1/orders
Authorization: Bearer <captain_token>

{
  "outletId": "<your_outlet_id>",
  "tableId": "<table_id>",
  "orderType": "dine-in",
  "items": [
    {
      "dishId": "<paneer_tikka_id>",
      "quantity": 1
    },
    {
      "dishId": "<butter_chicken_id>",
      "quantity": 1,
      "portionSize": "Full",
      "customization": "Less spicy"
    }
  ],
  "specialInstructions": "Customer prefers less oil"
}
```

### Step 2: Generate KOT (Kitchen Order Ticket)

```bash
POST http://localhost:3000/api/v1/orders/<order_id>/kot
Authorization: Bearer <token>
```

This automatically routes items to appropriate kitchen sections.

### Step 3: Update KOT Status (Kitchen Staff)

```bash
PATCH http://localhost:3000/api/v1/kots/<kot_id>/status
Authorization: Bearer <kitchen_token>

{
  "status": "preparing"
}
```

```bash
PATCH http://localhost:3000/api/v1/kots/<kot_id>/status

{
  "status": "ready"
}
```

---

## Handling Payments

### Option 1: Cash Payment

```bash
POST http://localhost:3000/api/v1/payments
Authorization: Bearer <cashier_token>

{
  "orderId": "<order_id>",
  "amount": 600,
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 600
    }
  ]
}
```

### Option 2: Split Payment

```bash
POST http://localhost:3000/api/v1/payments/split
Authorization: Bearer <cashier_token>

{
  "orderId": "<order_id>",
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 300
    },
    {
      "method": "card",
      "amount": 300,
      "transactionId": "TXN123456"
    }
  ]
}
```

### Option 3: Online Payment (Razorpay)

**Step 1: Create Razorpay Order**
```bash
POST http://localhost:3000/api/v1/payments/razorpay/create-order
Authorization: Bearer <token>

{
  "orderId": "<order_id>",
  "amount": 600
}
```

**Step 2: Verify Payment (after customer pays)**
```bash
POST http://localhost:3000/api/v1/payments/razorpay/verify
Authorization: Bearer <token>

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

### Get Receipt

```bash
GET http://localhost:3000/api/v1/payments/<payment_id>/receipt
Authorization: Bearer <token>
```

---

## User Roles & Permissions

### Admin
- Full system access
- Manage tenants, users, subscriptions
- Access all features

### Manager
- Manage menu (dishes, categories)
- Manage staff
- View reports and analytics
- Manage coupons and campaigns
- Handle refunds

### Captain (Waiter)
- Take orders
- Manage tables
- View menu
- Update order status
- Cannot access payments or reports

### Cashier
- Process payments
- View orders
- Generate receipts
- Cannot modify menu or orders

### Kitchen Staff
- View KOTs
- Update KOT status
- View dish details
- Cannot access other modules

---

## Quick Start Checklist

- [ ] Install Node.js, MongoDB, Redis
- [ ] Clone repository and install dependencies
- [ ] Configure `.env` file
- [ ] Start services (MongoDB, Redis, App)
- [ ] Register admin user
- [ ] Create tenant (company/brand/outlet)
- [ ] Create staff users (manager, captain, cashier)
- [ ] Create menu categories
- [ ] Add dishes to menu
- [ ] Create tables with QR codes
- [ ] Test order flow: Create order → Generate KOT → Process payment
- [ ] Print table QR codes

---

## Common Workflows

### Daily Opening
1. Manager logs in
2. Checks stock levels
3. Updates dish availability
4. Reviews staff schedule

### Taking an Order
1. Captain scans table QR or selects table
2. Creates order with items
3. Generates KOT
4. Kitchen receives KOT and starts preparation
5. Captain serves when ready

### Closing an Order
1. Customer requests bill
2. Cashier views order total
3. Processes payment (cash/card/split)
4. Generates receipt
5. Table status updates to available

### End of Day
1. Manager reviews sales reports
2. Checks inventory
3. Reviews staff performance
4. Closes day in system

---

## API Documentation

Once the server is running, access the full API documentation at:
```
http://localhost:3000/api-docs
```

---

## Support & Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

**Redis Connection Failed**
- Ensure Redis is running: `redis-server`
- Check Redis host/port in `.env`

**Authentication Errors**
- Verify JWT secrets are set in `.env`
- Check token expiration
- Ensure user has correct role/permissions

**Payment Failures**
- For Razorpay: Verify API keys
- Check webhook configuration
- Verify signature validation

---

## Next Steps

- Set up automated backups
- Configure email/SMS notifications
- Integrate WhatsApp Business API
- Set up analytics dashboards
- Configure loyalty programs
- Add more staff users
- Customize receipt templates

---

## Security Best Practices

1. **Change default secrets** in `.env`
2. **Use strong passwords** for all users
3. **Enable 2FA** for admin accounts
4. **Regular backups** of MongoDB
5. **HTTPS in production** (use reverse proxy like Nginx)
6. **Rate limiting** is enabled by default
7. **Keep dependencies updated**: `npm audit fix`

---

For more detailed information, refer to the main [README.md](README.md) file.
