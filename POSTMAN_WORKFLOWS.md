# Berry & Blocks POS - API Workflows

## 🎯 Complete Workflow Diagrams

### Workflow 1: Initial System Setup

```
Step 1: Health Check
   ↓
Step 2: Create Company Tenant
   ↓ (saves tenant_id)
Step 3: Create Outlet Tenant
   ↓ (saves outlet_id)
Step 4: Register Admin User
   ↓
Step 5: Login
   ↓ (saves access_token)
Step 6: Create Categories
   ↓ (saves category_id)
Step 7: Create Dishes
   ↓ (saves dish_id)
Step 8: Create Tables
   ↓ (saves table_id)
✅ System Ready!
```

### Workflow 2: Dine-In Order Processing

```
Step 1: Create Order
   ↓ (saves order_id)
Step 2: Generate KOT
   ↓
Step 3: Update Order Status → "preparing"
   ↓
Step 4: Update Order Status → "ready"
   ↓
Step 5: Update Order Status → "served"
   ↓
Step 6: Create Payment
   ↓ (saves payment_id)
Step 7: Get Receipt
   ↓
Step 8: Update Table Status → "available"
✅ Order Complete!
```

### Workflow 3: Customer Self-Service Journey

```
Step 1: Get Menu (Public - No Auth)
   ↓
Step 2: Customer Register
   ↓ (saves customer_id)
Step 3: Customer Login (Request OTP)
   ↓
Step 4: Verify OTP
   ↓ (saves access_token)
Step 5: Add Items to Cart
   ↓
Step 6: Update Cart Items
   ↓
Step 7: Place Order
   ↓ (saves order_id)
Step 8: Track Order Status
   ↓
Step 9: Provide Feedback
✅ Customer Journey Complete!
```

### Workflow 4: Reservation with Pre-Order

```
Step 1: Check Availability
   ↓
Step 2: Create Reservation
   ↓ (saves reservation_id)
Step 3: Add Pre-Order Items
   ↓
Step 4: Confirm Reservation
   ↓
[On Arrival Day]
Step 5: Update Reservation Status → "arrived"
   ↓
Step 6: Create Order from Pre-Order
   ↓
Step 7: Process as Normal Order
✅ Reservation Complete!
```


### Workflow 5: Split Payment Processing

```
Step 1: Create Order
   ↓ (saves order_id)
Step 2: Complete Order
   ↓
Step 3: Create Split Payment
   - Method 1: Cash (₹300)
   - Method 2: Card (₹200)
   ↓ (saves payment_id)
Step 4: Get Receipt
✅ Split Payment Complete!
```

### Workflow 6: Loyalty Points Management

```
Step 1: Customer Places Order
   ↓
Step 2: Process Payment
   ↓
Step 3: Earn Loyalty Points
   ↓
[Next Order]
Step 4: Get Customer Loyalty Balance
   ↓
Step 5: Redeem Points
   ↓
Step 6: Apply Discount
✅ Loyalty Applied!
```

### Workflow 7: Coupon Application

```
Step 1: Create Coupon (Admin)
   ↓ (saves coupon_id)
Step 2: Customer Adds Items to Cart
   ↓
Step 3: Validate Coupon
   ↓
Step 4: Apply Discount
   ↓
Step 5: Place Order with Coupon
   ↓
Step 6: Track Coupon Usage
✅ Coupon Applied!
```

### Workflow 8: Staff Performance Review

```
Step 1: Create Staff Member
   ↓ (saves staff_id)
Step 2: Staff Serves Orders (over time)
   ↓
Step 3: Get Staff Performance
   - Orders served
   - Average rating
   - Total sales
   ↓
Step 4: Generate Performance Report
✅ Review Complete!
```

### Workflow 9: Analytics & Reporting

```
Step 1: Get Sales Analytics
   ↓
Step 2: Get Dish Analytics
   ↓
Step 3: Get Customer Analytics
   ↓
Step 4: Get Staff Analytics
   ↓
Step 5: Export Report (PDF/CSV)
✅ Reports Generated!
```

### Workflow 10: Valet Service

```
Step 1: Customer Arrives
   ↓
Step 2: Create Valet Request (Park)
   ↓
Step 3: Update Status → "parked"
   ↓
[Customer Dining]
Step 4: Customer Requests Vehicle
   ↓
Step 5: Update Status → "retrieving"
   ↓
Step 6: Update Status → "completed"
✅ Valet Service Complete!
```


## 🔄 Advanced Workflows

### Workflow 11: Offline Sync

```
[Device Goes Offline]
Step 1: Store Changes Locally
   ↓
[Device Back Online]
Step 2: Push Sync (Upload Changes)
   ↓
Step 3: Pull Sync (Download Updates)
   ↓
Step 4: Resolve Conflicts (if any)
   ↓
Step 5: Verify Sync Status
✅ Data Synchronized!
```

### Workflow 12: AI-Powered Recommendations

```
Step 1: Customer Orders Multiple Times
   ↓
Step 2: Update Taste Profile
   ↓
Step 3: Get AI Recommendations
   ↓
Step 4: Display Personalized Menu
✅ Smart Recommendations!
```

### Workflow 13: Feedback Loop

```
Step 1: Customer Completes Order
   ↓
Step 2: Create Feedback
   ↓ (saves feedback_id)
Step 3: Get Feedback Analytics
   ↓
Step 4: Respond to Feedback (Admin)
   ↓
Step 5: Improve Based on Insights
✅ Continuous Improvement!
```

### Workflow 14: Admin Subscription Management

```
Step 1: Create Subscription
   ↓
Step 2: Monitor Usage
   ↓
Step 3: Get Subscription Analytics
   ↓
[If Needed]
Step 4: Pause/Resume/Cancel Subscription
   ↓
Step 5: Update Subscription Plan
✅ Subscription Managed!
```

### Workflow 15: Support Ticket Resolution

```
Step 1: Create Support Ticket
   ↓
Step 2: Assign Ticket to Admin
   ↓
Step 3: Add Ticket Response
   ↓
Step 4: Update Ticket Status
   ↓
Step 5: Close Ticket
✅ Issue Resolved!
```

## 📊 Testing Sequences

### Quick Test (5 minutes)
```
1. Health Check
2. Login
3. Get All Categories
4. Get All Dishes
5. Get All Orders
```

### Full Integration Test (30 minutes)
```
1. Complete Workflow 1 (Setup)
2. Complete Workflow 2 (Order)
3. Complete Workflow 3 (Customer)
4. Complete Workflow 6 (Loyalty)
5. Complete Workflow 9 (Analytics)
```

### Stress Test
```
1. Create 10 Categories
2. Create 50 Dishes
3. Create 20 Tables
4. Create 100 Orders
5. Process 100 Payments
6. Generate Analytics
```

---

**Pro Tip**: Use Postman's Collection Runner to automate these workflows!
