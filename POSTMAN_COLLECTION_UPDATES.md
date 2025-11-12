# Postman Collection Updates - Customer Module

## ✅ Changes Made

### Berry_Blocks_POS_Complete_Collection.json

### Berry_Blocks_POS_Environment.postman_environment.json

### 1. **Place Order Endpoint - UPDATED** ✏️

**Previous (Incorrect)**:
```json
{
  "tableId": "{{table_id}}",
  "orderType": "dine-in",
  "specialInstructions": "Please serve quickly"
}
```

**Updated to 3 separate examples**:

#### a) Place Order (Dine-in)
```json
{
  "outletId": "{{outlet_id}}",
  "orderType": "dine-in",
  "tableId": "{{table_id}}",
  "paymentMethod": "cash"
}
```

#### b) Place Order (Takeaway) - NEW
```json
{
  "outletId": "{{outlet_id}}",
  "orderType": "takeaway",
  "paymentMethod": "upi"
}
```

#### c) Place Order (Delivery) - NEW
```json
{
  "outletId": "{{outlet_id}}",
  "orderType": "delivery",
  "deliveryAddress": {
    "address": "123 Main Street, Apartment 4B",
    "landmark": "Near Central Park",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "paymentMethod": "card"
}
```

**Why**: 
- Added required `outletId` field
- Added required `paymentMethod` field
- Created separate examples for each order type
- Added proper `deliveryAddress` structure for delivery orders

---

### 2. **Add to Cart Endpoint - UPDATED** ✏️

**Previous**:
```json
{
  "dishId": "{{dish_id}}",
  "quantity": 2,
  "customization": "Extra spicy"
}
```

**Updated**:
```json
{
  "dishId": "{{dish_id}}",
  "quantity": 2,
  "specialInstructions": "Extra spicy"
}
```

**Why**: Field name changed from `customization` to `specialInstructions` to match validation schema

---

### 3. **Customer Authentication - ADDED** 🆕

**Added to all protected customer endpoints**:
- Bearer token authentication using `{{customer_token}}`
- Auto-saves token after OTP verification

**Protected Endpoints** (now with auth):
- Get Customer Profile
- Update Customer Profile
- Get Cart
- Add to Cart
- Update Cart Item
- Remove from Cart
- Clear Cart
- Place Order (all 3 variants)
- Get Customer Orders
- Get Customer Order by ID
- Cancel Order

**Test Script Added to "Verify OTP"**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('customer_token', response.data.token);
    pm.environment.set('customer_id', response.data.customer.id);
    console.log('✅ Customer token saved to environment');
}
```

---

### 4. **Update Customer Profile - ENHANCED** ✏️

**Previous**:
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

**Updated**:
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "addresses": [
    {
      "type": "home",
      "address": "123 Main Street, Apartment 4B",
      "landmark": "Near Central Park",
      "city": "Mumbai",
      "pincode": "400001"
    },
    {
      "type": "work",
      "address": "456 Business Plaza, 5th Floor",
      "landmark": "Opposite Metro Station",
      "city": "Mumbai",
      "pincode": "400002"
    }
  ]
}
```

**Why**: Added support for the new `addresses` array field in Customer model

---

---

## 🔧 Environment Variables Added

**Berry_Blocks_POS_Environment.postman_environment.json**:

1. **customer_token** (secret) - Stores JWT token for customer authentication
2. **kot_id** (default) - Stores KOT ID for testing KOT endpoints

---

## 📋 Endpoints That Remain Unchanged

These endpoints are already correct and don't need updates:

✅ **Customer Register** - `POST /customer/auth/register`
✅ **Customer Login** - `POST /customer/auth/login`
✅ **Verify OTP** - `POST /customer/auth/verify-otp`
✅ **Get Menu (Public)** - `GET /customer/menu`
✅ **Get Customer Profile** - `GET /customer/profile`
✅ **Get Cart** - `GET /customer/cart`
✅ **Update Cart Item** - `PUT /customer/cart/:itemId`
✅ **Remove from Cart** - `DELETE /customer/cart/:itemId`
✅ **Clear Cart** - `DELETE /customer/cart`
✅ **Get Customer Orders** - `GET /customer/orders`
✅ **Get Customer Order by ID** - `GET /customer/orders/:id`
✅ **Cancel Order** - `POST /customer/orders/:id/cancel`

---

## 🔐 Authentication Setup

### For Customer Endpoints:

1. **Public Endpoints** (No auth required):
   - `POST /customer/auth/register`
   - `POST /customer/auth/login`
   - `POST /customer/auth/verify-otp`
   - `GET /customer/menu`

2. **Protected Endpoints** (Require Bearer token):
   - All other `/customer/*` endpoints

### How to Set Up Authentication:

1. **Register or Login**:
   - Use `POST /customer/auth/register` or `POST /customer/auth/login`
   - You'll receive an OTP (check server console in development)

2. **Verify OTP**:
   - Use `POST /customer/auth/verify-otp` with the OTP
   - The token will be **automatically saved** to `{{customer_token}}` environment variable
   - ✅ No manual setup needed!

3. **Use Protected Endpoints**:
   - All protected customer endpoints are **pre-configured** with Bearer token authentication
   - They automatically use `{{customer_token}}` from the environment
   - ✅ Just call the endpoints - authentication is handled automatically!

---

## 🧪 Testing Flow

### Complete Customer Journey:

1. **Register** → `POST /customer/auth/register`
2. **Verify OTP** → `POST /customer/auth/verify-otp` (save token)
3. **Browse Menu** → `GET /customer/menu?outletId={{outlet_id}}`
4. **Add to Cart** → `POST /customer/cart` (multiple times)
5. **View Cart** → `GET /customer/cart`
6. **Update Cart** → `PUT /customer/cart/:itemId`
7. **Place Order** → `POST /customer/orders`
8. **View Orders** → `GET /customer/orders`
9. **View Order Details** → `GET /customer/orders/:id`
10. **Cancel Order** (optional) → `POST /customer/orders/:id/cancel`

---

## 📝 Environment Variables Needed

Make sure these variables are set in your Postman environment:

```
base_url = http://localhost:3000/api/v1
outlet_id = <your_outlet_id>
dish_id = <your_dish_id>
table_id = <your_table_id>
order_id = <your_order_id>
customer_token = <set_automatically_after_otp_verification>
```

---

## ⚠️ Important Notes

1. **OTP in Development**: 
   - OTPs are printed to the server console
   - Look for: `⚠️ DEVELOPMENT MODE - OTP for 9876543210: 123456`

2. **Cart Behavior**:
   - Cart is stored in memory (will be lost on server restart)
   - In production, this will use Redis

3. **Payment Processing**:
   - Currently only validates payment method
   - Actual payment processing not implemented yet
   - All orders are created with 'pending' status

4. **Stock Management**:
   - Stock is now properly decremented when orders are placed
   - Check dish availability before adding to cart

---

## 🔄 Migration Notes

If you have existing Postman collections:

1. **Update "Place Order" requests** to include:
   - `outletId` (required)
   - `paymentMethod` (required)
   - Proper `deliveryAddress` structure for delivery orders

2. **Update "Add to Cart" requests**:
   - Change `customization` to `specialInstructions`

3. **Update "Update Profile" requests**:
   - Add `addresses` array if you want to save customer addresses

---

**Last Updated**: 2025-11-06
**Collection Version**: 2.0
**Status**: ✅ Ready for Testing
