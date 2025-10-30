# 🧪 Complete Restaurant Workflow Testing Guide

## Overview
This guide will walk you through testing the complete restaurant workflow from table reservation to order completion, covering all major POS functionality.

## Prerequisites
- Server running on `http://localhost:3000`
- Postman collection imported
- Admin user created with JWT token
- Tenant, categories, and dishes already set up

## 🔄 Complete Workflow Steps

### Step 1: Create a Table
First, let's create a table for our test.

**Endpoint:** `POST /api/v1/tables`
```json
{
  "tableNumber": "T001",
  "capacity": 4,
  "section": "Main Hall"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "table_id_here",
    "tableNumber": "T001",
    "capacity": 4,
    "status": "available",
    "qrCode": "generated_qr_code_string"
  }
}
```

### Step 2: Create a Customer (Optional)
Create a customer for the order.

**Endpoint:** `POST /api/v1/customer/auth/register`
```json
{
  "phone": "+919876543210",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Step 3: Make a Table Reservation (Optional)
Reserve the table for a specific time.

**Endpoint:** `POST /api/v1/reservations`
```json
{
  "customerId": "customer_id_from_step_2",
  "customerName": "John Doe",
  "customerPhone": "+919876543210",
  "partySize": 2,
  "reservationDate": "2024-12-01",
  "reservationTime": "19:00",
  "tableId": "table_id_from_step_1",
  "specialRequests": "Window seat preferred"
}
```

### Step 4: Create an Order
Now create an order for the table.

**Endpoint:** `POST /api/v1/orders`
```json
{
  "customerId": "customer_id_from_step_2",
  "tableId": "table_id_from_step_1",
  "orderType": "dine-in",
  "source": "pos",
  "items": [
    {
      "dishId": "your_dish_id_1",
      "quantity": 2,
      "customization": "Extra spicy"
    },
    {
      "dishId": "your_dish_id_2", 
      "quantity": 1,
      "customization": "No onions"
    }
  ],
  "specialInstructions": "Serve hot"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order_id_here",
    "orderNumber": "ORD-001",
    "status": "pending",
    "subtotal": 450,
    "taxAmount": 81,
    "total": 531,
    "items": [...]
  }
}
```

### Step 5: Generate KOT (Kitchen Order Ticket)
Generate KOT for the kitchen.

**Endpoint:** `POST /api/v1/orders/{order_id}/kot`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "kot_id_here",
      "kotNumber": "KOT-001",
      "kitchenSection": "kitchen",
      "status": "pending",
      "items": [...]
    }
  ]
}
```

### Step 6: Check Order Status
Verify the order status has been updated.

**Endpoint:** `GET /api/v1/orders/{order_id}`

**Expected:** Status should be "confirmed" after KOT generation.

### Step 7: Update KOT Status (Kitchen Operations)
Simulate kitchen operations by updating KOT status.

**Endpoint:** `PATCH /api/v1/orders/{order_id}/kot/{kot_id}/status`
```json
{
  "status": "preparing"
}
```

Then update to ready:
```json
{
  "status": "ready"
}
```

### Step 8: Update Order Status
Update the overall order status.

**Endpoint:** `PATCH /api/v1/orders/{order_id}/status`
```json
{
  "status": "ready"
}
```

### Step 9: Process Payment
Process payment for the order.

**Endpoint:** `POST /api/v1/payments`
```json
{
  "orderId": "order_id_from_step_4",
  "amount": 531,
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 531
    }
  ]
}
```

**For Razorpay Payment:**
```json
{
  "orderId": "order_id_from_step_4", 
  "amount": 531,
  "paymentMethods": [
    {
      "method": "razorpay",
      "amount": 531,
      "razorpayOrderId": "order_razorpay_id",
      "razorpayPaymentId": "pay_razorpay_id"
    }
  ]
}
```

### Step 10: Complete Order
Mark order as completed.

**Endpoint:** `PATCH /api/v1/orders/{order_id}/status`
```json
{
  "status": "completed"
}
```

### Step 11: Generate Receipt
Get the payment receipt.

**Endpoint:** `GET /api/v1/payments/{payment_id}/receipt`

### Step 12: Free Up Table
Update table status back to available.

**Endpoint:** `PATCH /api/v1/tables/{table_id}/status`
```json
{
  "status": "available"
}
```

### Step 13: Collect Feedback (Optional)
Submit customer feedback.

**Endpoint:** `POST /api/v1/feedback`
```json
{
  "orderId": "order_id_from_step_4",
  "customerId": "customer_id_from_step_2",
  "rating": 5,
  "comment": "Excellent food and service!"
}
```

## 🧪 Advanced Testing Scenarios

### Scenario A: Split Payment
Test split payment between cash and card.

**Endpoint:** `POST /api/v1/payments/split`
```json
{
  "orderId": "order_id",
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 300
    },
    {
      "method": "card", 
      "amount": 231
    }
  ]
}
```

### Scenario B: Order Modification
Add items to existing order.

**Endpoint:** `PUT /api/v1/orders/{order_id}`
```json
{
  "items": [
    {
      "dishId": "new_dish_id",
      "quantity": 1,
      "customization": "Medium spicy"
    }
  ],
  "action": "add"
}
```

### Scenario C: Order Cancellation
Cancel an item from the order.

**Endpoint:** `DELETE /api/v1/orders/{order_id}/items/{item_id}`
```json
{
  "reason": "Customer changed mind"
}
```

### Scenario D: Table Transfer
Transfer order to different table.

**Endpoint:** `POST /api/v1/tables/transfer`
```json
{
  "fromTableId": "original_table_id",
  "toTableId": "new_table_id",
  "orderId": "order_id"
}
```

### Scenario E: Loyalty Points
Award loyalty points after order completion.

**Endpoint:** `POST /api/v1/loyalty/earn`
```json
{
  "customerId": "customer_id",
  "orderId": "order_id",
  "points": 53
}
```

## 📊 Verification Steps

After completing the workflow, verify:

1. **Order Status Progression:**
   - pending → confirmed → preparing → ready → completed

2. **Table Status Changes:**
   - available → occupied → available

3. **KOT Status Updates:**
   - pending → preparing → ready

4. **Payment Records:**
   - Payment created with correct amount
   - Receipt generated

5. **Customer Data:**
   - Order history updated
   - Loyalty points awarded (if applicable)

6. **Analytics Data:**
   - Sales recorded
   - Dish performance updated
   - Staff performance tracked

## 🔍 Monitoring & Logs

Check these during testing:

1. **Server Logs:**
   ```bash
   npm run dev
   # Watch for any errors or warnings
   ```

2. **Database Changes:**
   - Orders collection
   - KOT collection  
   - Payments collection
   - Tables collection
   - Customers collection

3. **API Response Times:**
   - All endpoints should respond within 500ms

## 🚨 Common Issues & Solutions

### Issue 1: "Dish not available"
**Solution:** Check dish stock and isAvailable status
```bash
GET /api/v1/dishes/{dish_id}
```

### Issue 2: "Table not found"
**Solution:** Verify table exists and belongs to correct tenant
```bash
GET /api/v1/tables/{table_id}
```

### Issue 3: "Invalid payment amount"
**Solution:** Ensure payment amount matches order total
```bash
GET /api/v1/orders/{order_id}
# Check total amount
```

### Issue 4: KOT not generating
**Solution:** Check if dishes have valid categories with kitchen sections

## 📱 Testing with Different Clients

### POS Terminal Flow:
1. Staff login → Create order → Generate KOT → Process payment

### Customer App Flow:
1. Customer register → Browse menu → Add to cart → Place order

### Kitchen Display Flow:
1. Receive KOT → Update status → Mark ready

### Captain App Flow:
1. View table status → Take orders → Update order status

## 🎯 Success Criteria

✅ **Complete workflow executes without errors**  
✅ **All status transitions work correctly**  
✅ **Payments process successfully**  
✅ **KOT generates and updates properly**  
✅ **Table status management works**  
✅ **Customer data is recorded accurately**  
✅ **Analytics data is captured**  

## 📝 Test Checklist

- [ ] Table creation and management
- [ ] Customer registration  
- [ ] Order creation with multiple items
- [ ] KOT generation and routing
- [ ] KOT status updates
- [ ] Order status progression
- [ ] Payment processing (cash)
- [ ] Payment processing (Razorpay)
- [ ] Split payment handling
- [ ] Receipt generation
- [ ] Order completion
- [ ] Table status reset
- [ ] Feedback collection
- [ ] Loyalty points award
- [ ] Analytics data capture

This comprehensive testing will validate that your Berry & Blocks POS system is working correctly end-to-end!