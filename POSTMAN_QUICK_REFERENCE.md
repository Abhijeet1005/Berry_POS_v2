# Berry & Blocks POS - Postman Quick Reference

## 🚀 Quick Setup (5 Steps)

```
1. Import: Berry_Blocks_POS_Complete_Collection.json
2. Create Environment with base_url: http://localhost:3000/api/v1
3. Start Server: npm start
4. Run: Health Check
5. Run: Login (saves token automatically)
```

## 📊 Collection Stats

| Category | Endpoints |
|----------|-----------|
| **Total Endpoints** | 150+ |
| **Modules** | 19 |
| **Auto-Saved Variables** | 15 |
| **Public Endpoints** | 5 |
| **Admin-Only Endpoints** | 30+ |

## 🔑 Essential Endpoints

### First-Time Setup
```
POST /auth/register          → Register admin user
POST /auth/login             → Login (saves token)
POST /tenants                → Create company/outlet
POST /categories             → Add menu categories
POST /dishes                 → Add menu items
POST /tables                 → Setup tables
```

### Daily Operations
```
POST /orders                 → Create order
POST /orders/:id/kot         → Send to kitchen
PATCH /orders/:id/status     → Update order
POST /payments               → Process payment
GET /payments/:id/receipt    → Print receipt
```

### Customer Self-Service
```
POST /customer/auth/register → Customer signup
POST /customer/auth/login    → Request OTP
POST /customer/auth/verify-otp → Verify & login
GET /customer/menu           → Browse menu (public)
POST /customer/cart          → Add to cart
POST /customer/orders        → Place order
```

## 🎯 Common Workflows

### 1️⃣ New Restaurant Setup (8 requests)
```
1. Health Check
2. Create Tenant (Company)
3. Create Tenant (Outlet)
4. Register User
5. Login
6. Create Category
7. Create Dish
8. Create Table
```

### 2️⃣ Process Order (5 requests)
```
1. Create Order
2. Generate KOT
3. Update Order Status → "preparing"
4. Update Order Status → "ready"
5. Create Payment
```

### 3️⃣ Customer Journey (7 requests)
```
1. Get Menu (public)
2. Customer Register
3. Customer Login
4. Verify OTP
5. Add to Cart
6. Place Order
7. Get Order Status
```

## 🔐 Authentication

### Bearer Token (Auto-Managed)
```javascript
// Automatically set after login
Authorization: Bearer {{access_token}}
```

### Public Endpoints (No Auth Required)
```
GET  /health
POST /auth/register
POST /auth/login
POST /auth/forgot-password
GET  /customer/menu
```

## 📦 Auto-Saved Variables

After running these requests, IDs are automatically saved:

| Request | Saves Variable |
|---------|----------------|
| Login | `access_token`, `refresh_token` |
| Create Tenant | `tenant_id` or `outlet_id` |
| Create Category | `category_id` |
| Create Dish | `dish_id` |
| Create Table | `table_id` |
| Create Order | `order_id` |
| Create Payment | `payment_id` |
| Customer Register | `customer_id` |
| Create Staff | `staff_id` |
| Create Reservation | `reservation_id` |
| Create Coupon | `coupon_id` |
| Create Feedback | `feedback_id` |

## 🎨 Module Quick Access

### Core Operations
- 🔐 **Auth**: 7 endpoints
- 🏢 **Tenants**: 4 endpoints
- 📋 **Categories**: 4 endpoints
- 🍽️ **Dishes**: 6 endpoints
- 🪑 **Tables**: 6 endpoints
- 📦 **Orders**: 6 endpoints
- 💳 **Payments**: 8 endpoints

### Customer Features
- 👥 **Customer Self-Service**: 14 endpoints
- 🎁 **Loyalty**: 6 endpoints
- 🎟️ **Coupons**: 7 endpoints
- ⭐ **Feedback**: 6 endpoints
- 📅 **Reservations**: 7 endpoints

### Management
- 👨‍💼 **Staff**: 7 endpoints
- 📊 **Analytics**: 6 endpoints
- 🔍 **Audit**: 3 endpoints
- ⚙️ **Admin**: 20 endpoints

### Advanced Features
- 🤖 **AI**: 4 endpoints
- 🚗 **Valet**: 6 endpoints
- 🔔 **Notifications**: 9 endpoints
- 🔄 **Sync**: 5 endpoints

## 🔧 Common Query Parameters

```
?outletId={{outlet_id}}           → Filter by outlet
?startDate=2025-01-01             → Start date
?endDate=2025-12-31               → End date
?status=pending                   → Filter by status
?page=1&limit=20                  → Pagination
?query=paneer                     → Search term
?dietaryTags=veg                  → Filter by diet
```

## 💡 Pro Tips

1. **Run in Order**: Follow the numbered workflows
2. **Check Tests Tab**: See auto-save scripts
3. **Use Variables**: Reference saved IDs with `{{variable}}`
4. **Save Responses**: Keep examples for reference
5. **Organize**: Use folders to group related requests

## 🚨 Troubleshooting

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Run Login request again |
| 403 Forbidden | Check user role/permissions |
| 404 Not Found | Verify ID in environment variables |
| 500 Server Error | Check server logs in `logs/` |

## 📱 API Documentation

**Swagger UI**: http://localhost:3000/api-docs

## 🎯 Testing Checklist

- [ ] Health check passes
- [ ] Can register and login
- [ ] Can create tenant/outlet
- [ ] Can create menu items
- [ ] Can create orders
- [ ] Can process payments
- [ ] Customer can browse menu
- [ ] Customer can place order
- [ ] Analytics endpoints work
- [ ] Admin panel accessible

## 📞 Support

- **Logs**: `logs/combined-*.log`
- **Config**: `.env` file
- **Docs**: `API_DOCUMENTATION.md`

---

**Version**: 2.0.0 | **Last Updated**: October 2025
