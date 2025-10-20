# Berry & Blocks POS - Complete Postman Collection Guide

## 📦 Collection Overview

This comprehensive Postman collection includes **ALL** API endpoints for the Berry & Blocks POS System, covering 19+ modules with 150+ endpoints.

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select `Berry_Blocks_POS_Complete_Collection.json`
4. The collection will be imported with all folders and requests

### 2. Set Up Environment

Create a new environment in Postman with these variables:

```
base_url: http://localhost:3000/api/v1
access_token: (will be auto-set after login)
refresh_token: (will be auto-set after login)
tenant_id: (will be auto-set after tenant creation)
outlet_id: (will be auto-set after outlet creation)
category_id: (will be auto-set after category creation)
dish_id: (will be auto-set after dish creation)
table_id: (will be auto-set after table creation)
order_id: (will be auto-set after order creation)
payment_id: (will be auto-set after payment creation)
customer_id: (will be auto-set after customer registration)
staff_id: (will be auto-set after staff creation)
reservation_id: (will be auto-set after reservation creation)
coupon_id: (will be auto-set after coupon creation)
feedback_id: (will be auto-set after feedback creation)
```

### 3. Start the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

## 📋 Collection Structure

### 🏥 Health Check
- Check server status

### 🔐 Authentication (7 endpoints)
- Register User
- Login (auto-saves access token)
- Logout
- Refresh Token
- Forgot Password
- Enable 2FA
- Verify 2FA

### 🏢 Tenants (4 endpoints)
- Create Tenant (Company)
- Create Tenant (Outlet)
- Get Tenant
- Get Tenant Hierarchy

### 📋 Categories (4 endpoints)
- Create Category
- Get All Categories
- Get Category
- Update Category

### 🍽️ Dishes (6 endpoints)
- Create Dish
- Get All Dishes
- Search Dishes
- Get Dish
- Update Dish
- Update Stock

### 🪑 Tables (6 endpoints)
- Create Table
- Get All Tables
- Get Table
- Get Table QR Code
- Update Table Status
- Transfer Order

### 📦 Orders (6 endpoints)
- Create Order
- Get All Orders
- Get Order
- Update Order Status
- Generate KOT
- Get Orders by Table

### 📝 KOT (2 endpoints)
- Get All KOTs
- Update KOT Status

### 💳 Payments (8 endpoints)
- Create Payment (Cash)
- Create Split Payment
- Create Razorpay Order
- Verify Razorpay Payment
- Get Payment
- Get Payments by Order
- Get Receipt
- Process Refund

### 👥 Customer Self-Service (14 endpoints)
- Customer Register
- Customer Login
- Verify OTP
- Get Menu (Public)
- Get Customer Profile
- Update Customer Profile
- Get Cart
- Add to Cart
- Update Cart Item
- Remove from Cart
- Clear Cart
- Place Order
- Get Customer Orders
- Cancel Order

### 👨‍💼 Staff Management (7 endpoints)
- Create Staff
- Get All Staff
- Get Staff by Outlet
- Get Staff by ID
- Update Staff
- Delete Staff
- Get Staff Performance

### 📅 Reservations (7 endpoints)
- Create Reservation
- Get All Reservations
- Get Availability
- Get Reservation by ID
- Update Reservation
- Cancel Reservation
- Add Pre-Order

### 🎁 Loyalty Program (6 endpoints)
- Get Customer Loyalty
- Earn Points
- Redeem Points
- Get Loyalty Rules
- Update Loyalty Rules
- Get Loyalty History

### 🎟️ Coupons (7 endpoints)
- Create Coupon
- Get All Coupons
- Validate Coupon
- Get Coupon by Code
- Update Coupon
- Delete Coupon
- Get Coupon Usage

### ⭐ Feedback (6 endpoints)
- Create Feedback
- Get All Feedback
- Get Feedback Analytics
- Get Feedback by Order
- Get Feedback by ID
- Respond to Feedback

### 📊 Analytics (6 endpoints)
- Get Sales Analytics
- Get Dish Analytics
- Get Customer Analytics
- Get Staff Analytics
- Get Campaign Analytics
- Export Report

### 🤖 AI Features (4 endpoints)
- Generate Dish Profile
- Analyze Nutrition
- Get Recommendations
- Update Taste Profile

### 🚗 Valet Service (6 endpoints)
- Create Valet Request
- Get Active Valet Requests
- Get Valet Performance
- Get Customer Valet Requests
- Get Valet Request by ID
- Update Valet Status

### 🔔 Notifications (9 endpoints)
- Send Notification
- Get Notification by ID
- Get User Notifications
- Create Template
- Get All Templates
- Get Template by ID
- Update Template
- Delete Template

### 🔄 Sync (5 endpoints)
- Push Sync
- Pull Sync
- Get Sync Status
- Resolve Conflict
- Retry Failed Sync

### 🔍 Audit Logs (3 endpoints)
- Get Audit Logs
- Get Audit Statistics
- Export Audit Logs

### ⚙️ Admin Panel (20 endpoints)
- Get All Tenants
- Subscription Management (9 endpoints)
- Support Ticket Management (7 endpoints)
- Feature Toggle Management (4 endpoints)
- Get Admin Analytics

## 🔄 Typical Workflow

### Setup Flow (First Time)

1. **Health Check** - Verify server is running
2. **Create Tenant (Company)** - Creates company tenant
3. **Create Tenant (Outlet)** - Creates outlet under company
4. **Register User** - Register admin user
5. **Login** - Get access token (auto-saved)

### Menu Setup Flow

6. **Create Category** - Add menu categories
7. **Create Dish** - Add dishes to categories
8. **Create Table** - Set up tables

### Order Flow

9. **Create Order** - Place a new order
10. **Generate KOT** - Send to kitchen
11. **Update Order Status** - Track order progress
12. **Create Payment** - Process payment
13. **Get Receipt** - Generate receipt

### Customer Self-Service Flow

1. **Get Menu (Public)** - Browse menu without login
2. **Customer Register** - Register with phone
3. **Customer Login** - Request OTP
4. **Verify OTP** - Verify and login
5. **Add to Cart** - Add items
6. **Place Order** - Submit order
7. **Get Customer Orders** - Track orders

## 🔑 Authentication

Most endpoints require authentication. The collection uses Bearer Token authentication.

### Auto-Authentication
The collection automatically:
- Saves `access_token` after login
- Uses saved token for all authenticated requests
- Saves entity IDs for easy reference

### Manual Token Setup
If needed, manually set the token:
1. Login using the Login request
2. Copy the `accessToken` from response
3. Set it in environment variable `access_token`

## 📝 Notes

### Auto-Saved Variables
These requests automatically save IDs to environment:
- Login → `access_token`, `refresh_token`
- Create Tenant → `tenant_id` or `outlet_id`
- Create Category → `category_id`
- Create Dish → `dish_id`
- Create Table → `table_id`
- Create Order → `order_id`
- Create Payment → `payment_id`
- Customer Register → `customer_id`
- Create Staff → `staff_id`
- Create Reservation → `reservation_id`
- Create Coupon → `coupon_id`
- Create Feedback → `feedback_id`

### Placeholder Values
Some requests use placeholders like `<user_id>`, `<kot_id>`, etc.
Replace these with actual IDs from your data.

### Query Parameters
Many GET requests support filtering:
- `outletId` - Filter by outlet
- `startDate` / `endDate` - Date range
- `status` - Filter by status
- `page` / `limit` - Pagination

## 🎯 Testing Scenarios

### Scenario 1: Complete Restaurant Setup
1. Health Check
2. Create Company Tenant
3. Create Outlet Tenant
4. Register Admin User
5. Login
6. Create Categories
7. Create Dishes
8. Create Tables

### Scenario 2: Customer Order Journey
1. Customer Register
2. Customer Login
3. Verify OTP
4. Get Menu
5. Add to Cart
6. Place Order
7. Track Order Status

### Scenario 3: Payment Processing
1. Create Order
2. Create Payment (Cash/Card/Split)
3. Get Receipt
4. Process Refund (if needed)

### Scenario 4: Analytics & Reports
1. Get Sales Analytics
2. Get Dish Analytics
3. Get Customer Analytics
4. Export Report

## 🔧 Troubleshooting

### 401 Unauthorized
- Token expired → Use Refresh Token request
- Not logged in → Use Login request
- Wrong credentials → Check email/password

### 403 Forbidden
- Insufficient permissions
- Check user role (admin, manager, etc.)

### 404 Not Found
- Invalid ID in URL
- Resource doesn't exist
- Check environment variables

### 500 Server Error
- Check server logs
- Verify MongoDB connection
- Check .env configuration

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/api-docs
- **Server Logs**: Check `logs/` directory
- **Environment File**: `.env` in project root

## 🎉 Features Included

✅ Multi-tenant architecture
✅ Role-based access control (RBAC)
✅ Customer self-service ordering
✅ QR code table ordering
✅ Kitchen Order Tickets (KOT)
✅ Split payments
✅ Razorpay integration
✅ Loyalty program
✅ Coupon system
✅ Feedback & ratings
✅ Staff management
✅ Reservations with pre-orders
✅ Valet service
✅ AI-powered recommendations
✅ Real-time notifications
✅ Offline sync support
✅ Comprehensive analytics
✅ Audit logging
✅ Admin panel
✅ Feature toggles
✅ Subscription management

## 💡 Tips

1. **Use Folders**: Requests are organized in folders by module
2. **Run in Sequence**: Some requests depend on previous ones
3. **Check Tests**: Many requests have test scripts that auto-save variables
4. **Use Variables**: Leverage environment variables for dynamic values
5. **Save Responses**: Use Postman's save response feature for reference

---

**Total Endpoints**: 150+
**Modules**: 19
**Version**: 2.0.0

Happy Testing! 🚀
