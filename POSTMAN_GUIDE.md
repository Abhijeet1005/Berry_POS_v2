# Postman Collection Guide

This guide explains how to use the Postman collection to test the Berry & Blocks POS API.

## Import Collection

### Option 1: Import Files

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop or select these files:
   - `postman_collection.json`
   - `postman_environment.json`
4. Click **Import**

### Option 2: Import from URL (if hosted)

1. Click **Import** → **Link**
2. Paste the collection URL
3. Click **Continue** → **Import**

## Setup Environment

1. Click the environment dropdown (top right)
2. Select **Berry & Blocks POS - Local**
3. The environment variables will be automatically populated as you make requests

## Environment Variables

The collection uses these variables (auto-populated):

| Variable | Description | Auto-filled |
|----------|-------------|-------------|
| `base_url` | API base URL | ✓ |
| `access_token` | JWT access token | ✓ (after login) |
| `refresh_token` | JWT refresh token | ✓ (after login) |
| `tenant_id` | Tenant ID | ✓ (after tenant creation) |
| `outlet_id` | Outlet ID | ✓ (after outlet creation) |
| `category_id` | Category ID | ✓ (after category creation) |
| `dish_id` | Dish ID | ✓ (after dish creation) |
| `table_id` | Table ID | ✓ (after table creation) |
| `order_id` | Order ID | ✓ (after order creation) |
| `payment_id` | Payment ID | ✓ (after payment creation) |

## Quick Start Workflow

Follow these requests in order for a complete setup:

### 1. Health Check
```
GET Health Check
```
Verify the server is running.

### 2. Create Tenant
```
POST Tenants → Create Tenant (Outlet)
```
Creates your restaurant tenant. The `tenant_id` and `outlet_id` are auto-saved.

### 3. Register Admin User
```
POST Authentication → Register User
```
Update the request body with your tenant_id and outlet_id (or use the variables).
The `access_token` is auto-saved.

### 4. Login
```
POST Authentication → Login
```
Login with your credentials. Token is auto-saved.

### 5. Create Category
```
POST Categories → Create Category
```
Create menu categories. The `category_id` is auto-saved.

### 6. Create Dish
```
POST Dishes → Create Dish
```
Add dishes to your menu. The `dish_id` is auto-saved.

### 7. Create Table
```
POST Tables → Create Table
```
Set up tables. The `table_id` is auto-saved.

### 8. Create Order
```
POST Orders → Create Order
```
Place an order. The `order_id` is auto-saved.

### 9. Generate KOT
```
POST Orders → Generate KOT
```
Send order to kitchen.

### 10. Process Payment
```
POST Payments → Create Payment (Cash)
```
Complete the transaction. The `payment_id` is auto-saved.

### 11. Get Receipt
```
GET Payments → Get Receipt
```
Retrieve the payment receipt.

## Collection Structure

### 📁 Authentication
- Register User
- Login
- Logout
- Refresh Token
- Forgot Password
- Enable 2FA

### 📁 Tenants
- Create Tenant (Company)
- Create Tenant (Outlet)
- Get Tenant
- Get Tenant Hierarchy

### 📁 Categories
- Create Category
- Get All Categories
- Get Category
- Update Category

### 📁 Dishes
- Create Dish
- Get All Dishes
- Search Dishes
- Get Dish
- Update Dish
- Update Stock

### 📁 Tables
- Create Table
- Get All Tables
- Get Table
- Get Table QR Code
- Update Table Status
- Transfer Order

### 📁 Orders
- Create Order
- Get All Orders
- Get Order
- Update Order Status
- Generate KOT
- Get Orders by Table

### 📁 KOT
- Get All KOTs
- Update KOT Status

### 📁 Payments
- Create Payment (Cash)
- Create Split Payment
- Create Razorpay Order
- Verify Razorpay Payment
- Get Payment
- Get Payments by Order
- Get Receipt
- Process Refund

## Testing Different Scenarios

### Scenario 1: Dine-in Order Flow

1. **Create Order** (dine-in)
2. **Generate KOT**
3. **Update KOT Status** (preparing → ready)
4. **Update Order Status** (confirmed → completed)
5. **Create Payment**
6. **Get Receipt**

### Scenario 2: Split Payment

1. Create order
2. Use **Create Split Payment** with multiple payment methods
3. Get receipt

### Scenario 3: Table Transfer

1. Create two tables
2. Create order on first table
3. Use **Transfer Order** to move to second table

### Scenario 4: Stock Management

1. Create dish with stock
2. Create order (stock decrements automatically)
3. Use **Update Stock** to replenish

### Scenario 5: Search & Filter

1. Create multiple dishes with different dietary tags
2. Use **Search Dishes** with filters:
   - `?query=paneer`
   - `?dietaryTags=veg`
   - `?maxPrepTime=30`
   - `?availableOnly=true`

## Authentication

Most endpoints require authentication. The collection automatically:

1. Saves the `access_token` after login
2. Includes it in the `Authorization` header for all requests
3. Uses the format: `Bearer {{access_token}}`

If you get a 401 error:
1. Run the **Login** request again
2. Check that the token is saved in environment variables

## Tips & Tricks

### 1. Auto-save IDs

The collection includes test scripts that automatically save IDs:

```javascript
// Example: After creating a dish
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('dish_id', response.data._id);
}
```

### 2. View Saved Variables

Click the eye icon (👁️) next to the environment dropdown to see all saved variables.

### 3. Manual Variable Update

If needed, you can manually set variables:
1. Click environment dropdown
2. Select your environment
3. Click the edit icon
4. Update values

### 4. Duplicate Requests

To test with different data:
1. Right-click a request
2. Select **Duplicate**
3. Modify the request body

### 5. Run Collection

To test all endpoints:
1. Click the collection name
2. Click **Run**
3. Select requests to run
4. Click **Run Berry & Blocks POS API**

## Common Issues

### Issue: 401 Unauthorized

**Solution:** 
- Run the Login request
- Check that `access_token` is set in environment

### Issue: 404 Not Found

**Solution:**
- Verify the server is running
- Check the `base_url` in environment
- Ensure you're using the correct IDs

### Issue: 400 Validation Error

**Solution:**
- Check the request body format
- Ensure all required fields are present
- Verify data types (strings, numbers, arrays)

### Issue: Variables not auto-filling

**Solution:**
- Ensure you've selected the environment (top right)
- Check that test scripts are enabled
- Manually set variables if needed

## Testing with Different Roles

### Admin User
- Has access to all endpoints
- Can create tenants, manage users

### Manager User
- Can manage menu, orders, staff
- Cannot create tenants

### Captain User
- Can create orders, manage tables
- Cannot access payments or reports

### Cashier User
- Can process payments
- Cannot modify orders or menu

To test different roles:
1. Register users with different roles
2. Login with each user
3. Test their permitted endpoints

## Production Environment

To test against production:

1. Duplicate the environment
2. Rename to "Berry & Blocks POS - Production"
3. Update `base_url` to production URL
4. Update credentials

## Export Results

To share test results:

1. Run the collection
2. Click **Export Results**
3. Save as JSON or HTML

## Support

For issues or questions:
- Check the [Getting Started Guide](GETTING_STARTED.md)
- Review the [README](README.md)
- Check API documentation at `http://localhost:3000/api-docs`

---

Happy Testing! 🚀
