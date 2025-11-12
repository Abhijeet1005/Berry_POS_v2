# Swagger API Documentation

## 🎯 Access the API Documentation

### **Local Development:**
```
http://localhost:3000/api-docs
```

### **Production:**
```
https://api.berryblocks.com/api-docs
```

---

## ✅ **Status: COMPLETE**

All 19 modules have Swagger documentation:

1. ✅ **Authentication** - Staff/Admin login, JWT tokens
2. ✅ **Customer Auth** - Customer OTP-based authentication (NEW)
3. ✅ **Tenants** - Multi-tenant management
4. ✅ **Menu** - Dishes, categories, images
5. ✅ **Orders** - Order management, KOT generation
6. ✅ **Payments** - Payment processing, Razorpay integration
7. ✅ **Tables** - Table management, QR codes
8. ✅ **Staff** - Staff management, performance tracking
9. ✅ **AI** - AI-powered dish profiling, recommendations
10. ✅ **Loyalty** - Loyalty points, rewards
11. ✅ **Feedback** - Customer feedback, sentiment analysis
12. ✅ **Coupons** - Coupon management, validation
13. ✅ **Valet** - Valet parking services
14. ✅ **Reservations** - Table reservations, pre-orders
15. ✅ **Analytics** - Sales analytics, reports
16. ✅ **Notifications** - Push, SMS, email notifications
17. ✅ **Sync** - Offline sync, conflict resolution
18. ✅ **Admin** - Admin panel, subscriptions, tickets
19. ✅ **Audit** - Audit logs, activity tracking

---

## 🆕 **What's New (Just Added):**

### **Customer Module Documentation:**

#### **Authentication Endpoints:**
- `POST /customer/auth/register` - Register new customer
- `POST /customer/auth/login` - Login (sends OTP)
- `POST /customer/auth/verify-otp` - Verify OTP and get token

#### **Customer Endpoints:**
- `GET /customer/menu` - Browse menu (public)
- `GET /customer/profile` - Get profile
- `PUT /customer/profile` - Update profile
- `GET /customer/cart` - Get cart
- `POST /customer/cart` - Add to cart
- `PUT /customer/cart/:itemId` - Update cart item
- `DELETE /customer/cart/:itemId` - Remove from cart
- `DELETE /customer/cart` - Clear cart
- `POST /customer/orders` - Place order
- `GET /customer/orders` - Get order history
- `GET /customer/orders/:id` - Get order details
- `POST /customer/orders/:id/cancel` - Cancel order

---

## 🔐 **Authentication in Swagger UI:**

### **For Staff/Admin Endpoints:**
1. Click the **"Authorize"** button (top-right)
2. Select **"bearerAuth"**
3. Enter your JWT token from login
4. Click **"Authorize"**

### **For Customer Endpoints:**
1. Click the **"Authorize"** button
2. Select **"customerAuth"**
3. Enter customer JWT token from OTP verification
4. Click **"Authorize"**

---

## 📋 **Features:**

✅ **Interactive API Testing** - Try endpoints directly from browser
✅ **Request/Response Examples** - See sample data
✅ **Schema Definitions** - Understand data structures
✅ **Authentication Support** - Test protected endpoints
✅ **Error Responses** - See all possible error codes
✅ **Query Parameters** - Filter, pagination, search
✅ **Request Validation** - See required fields

---

## 🎨 **Swagger UI Features:**

### **Try It Out:**
1. Click on any endpoint
2. Click **"Try it out"**
3. Fill in parameters/body
4. Click **"Execute"**
5. See the response

### **Download OpenAPI Spec:**
```
http://localhost:3000/api-docs.json
```

Use this JSON file to:
- Generate client SDKs
- Import into Postman
- Share with frontend team
- Generate documentation

---

## 📊 **API Statistics:**

- **Total Endpoints**: 100+
- **Authentication Methods**: 2 (Staff JWT, Customer JWT)
- **Modules**: 19
- **Tags**: 20
- **Schemas**: 30+

---

## 🚀 **Usage Examples:**

### **1. Test Customer Registration:**
1. Go to `http://localhost:3000/api-docs`
2. Find **"Customer Auth"** section
3. Click on `POST /customer/auth/register`
4. Click **"Try it out"**
5. Fill in the request body:
   ```json
   {
     "tenantId": "your_tenant_id",
     "phone": "9876543210",
     "name": "John Customer",
     "email": "customer@example.com"
   }
   ```
6. Click **"Execute"**
7. Check server console for OTP

### **2. Test Menu Browsing:**
1. Find **"Customer"** section
2. Click on `GET /customer/menu`
3. Click **"Try it out"**
4. Enter `outletId` parameter
5. Click **"Execute"**
6. See the menu response

### **3. Test Protected Endpoints:**
1. First, authenticate (get token)
2. Click **"Authorize"** button
3. Enter token
4. Try any protected endpoint

---

## 🔧 **Configuration:**

The Swagger configuration is in `src/config/swagger.js`:

```javascript
{
  title: 'Berry & Blocks POS API',
  version: '1.0.0',
  servers: [
    'http://localhost:3000',
    'https://api.berryblocks.com'
  ]
}
```

---

## 📝 **Adding New Endpoints:**

When you add new endpoints, document them using JSDoc comments:

```javascript
/**
 * @swagger
 * /your/endpoint:
 *   post:
 *     summary: Your endpoint description
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

---

## ✅ **Verification:**

To verify Swagger is working:

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Open browser:**
   ```
   http://localhost:3000/api-docs
   ```

3. **You should see:**
   - Berry & Blocks POS API title
   - All 20 tags/sections
   - 100+ endpoints
   - Interactive UI

---

## 🐛 **Troubleshooting:**

### **Swagger UI not loading:**
- Check if server is running on port 3000
- Check browser console for errors
- Verify `swagger-ui-express` is installed

### **Endpoints not showing:**
- Check if swagger.js files exist in modules
- Verify JSDoc comments are correct
- Restart server after adding new docs

### **Authentication not working:**
- Make sure you clicked "Authorize"
- Verify token is valid (not expired)
- Check token format (should be just the token, not "Bearer token")

---

**Last Updated**: 2025-11-06
**Status**: ✅ COMPLETE - All modules documented
**Access**: http://localhost:3000/api-docs
