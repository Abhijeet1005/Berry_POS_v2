# Payment System - Complete Guide

## 🎯 Overview

Your Berry & Blocks POS Backend supports **multiple payment methods** with **split payment** capabilities and **Razorpay integration** for online payments.

---

## 💳 Supported Payment Methods

1. **Cash** - Instant completion
2. **Card** (Credit/Debit) - Via Razorpay
3. **UPI** - Via Razorpay
4. **Digital Wallets** - Via Razorpay
5. **Split Payment** - Combination of multiple methods

---

## 🔄 Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. ORDER CREATED
   ├── Customer places order
   ├── Order total calculated (subtotal + tax - discount)
   └── Order status: "pending" or "confirmed"

2. PAYMENT INITIATED
   ├── Cashier/Customer initiates payment
   ├── Choose payment method(s)
   └── System validates order exists and not already paid

3. PAYMENT PROCESSING
   │
   ├─── CASH PAYMENT
   │    ├── Amount entered
   │    ├── Payment status: "completed" immediately
   │    └── Receipt generated
   │
   ├─── ONLINE PAYMENT (Razorpay)
   │    ├── Create Razorpay order
   │    ├── Get payment link/QR
   │    ├── Customer completes payment
   │    ├── Razorpay webhook notification
   │    ├── Verify signature
   │    ├── Update payment status: "completed"
   │    └── Receipt generated
   │
   └─── SPLIT PAYMENT
        ├── Multiple payment methods
        ├── Validate total matches order amount
        ├── Process each method separately
        └── All methods completed → Payment "completed"

4. ORDER COMPLETION
   ├── Payment status: "completed"
   ├── Order status: "completed"
   ├── Table status: "available" (if dine-in)
   └── Receipt available

5. REFUND (if needed)
   ├── Manager initiates refund
   ├── Payment status: "refunded"
   ├── Order status: "cancelled"
   └── Razorpay refund processed (if online payment)
```

---

## 📊 Payment Data Model

```javascript
Payment {
  tenantId: ObjectId,           // Multi-tenant isolation
  outletId: ObjectId,           // Specific outlet
  orderId: ObjectId,            // Linked order
  amount: Number,               // Total payment amount
  
  paymentMethods: [             // Array for split payments
    {
      method: String,           // 'cash', 'card', 'upi', 'wallet'
      amount: Number,           // Amount for this method
      transactionId: String,    // Razorpay transaction ID
      status: String            // 'pending', 'completed', 'failed', 'refunded'
    }
  ],
  
  status: String,               // Overall payment status
  receiptNumber: String,        // Auto-generated (e.g., RCP-20241025-0001)
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎬 Payment Scenarios

### Scenario 1: Cash Payment (Simple)

```javascript
// Customer orders food worth ₹500
// Cashier processes cash payment

POST /api/v1/payments
{
  "orderId": "order_123",
  "amount": 500,
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 500
    }
  ]
}

// Response: Payment completed immediately
{
  "success": true,
  "data": {
    "_id": "payment_456",
    "orderId": "order_123",
    "amount": 500,
    "status": "completed",
    "receiptNumber": "RCP-20241025-0001",
    "paymentMethods": [
      {
        "method": "cash",
        "amount": 500,
        "status": "completed"
      }
    ]
  }
}
```

**What Happens:**
1. ✅ Payment created with status "completed"
2. ✅ Order status updated to "completed"
3. ✅ Receipt number generated
4. ✅ Table freed (if dine-in)

---

### Scenario 2: Online Payment via Razorpay

```javascript
// Step 1: Create Razorpay Order
POST /api/v1/payments/razorpay/create-order
{
  "orderId": "order_123",
  "amount": 500
}

// Response: Razorpay order created
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_MNop1234567890",
    "amount": 50000,        // In paise (500 * 100)
    "currency": "INR"
  }
}

// Step 2: Customer pays on Razorpay
// (Frontend shows Razorpay checkout)
// Customer completes UPI/Card payment

// Step 3: Razorpay sends webhook
POST /api/v1/payments/razorpay/webhook
Headers: { "x-razorpay-signature": "abc123..." }
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_XYZ123",
        "order_id": "order_MNop1234567890",
        "amount": 50000,
        "status": "captured"
      }
    }
  }
}

// Step 4: System verifies signature and updates payment
// Payment status: "completed"
// Order status: "completed"

// Step 5: Verify payment (optional, for extra security)
POST /api/v1/payments/razorpay/verify
{
  "razorpayOrderId": "order_MNop1234567890",
  "razorpayPaymentId": "pay_XYZ123",
  "razorpaySignature": "abc123..."
}

// Response: Verified
{
  "success": true,
  "data": {
    "verified": true
  }
}
```

**What Happens:**
1. ✅ Razorpay order created with unique ID
2. ✅ Customer redirected to Razorpay checkout
3. ✅ Customer completes payment
4. ✅ Razorpay webhook notifies your backend
5. ✅ Signature verified for security
6. ✅ Payment status updated to "completed"
7. ✅ Order marked as completed

---

### Scenario 3: Split Payment

```javascript
// Customer wants to pay ₹500 order with:
// - ₹300 cash
// - ₹200 UPI

POST /api/v1/payments/split
{
  "orderId": "order_123",
  "paymentMethods": [
    {
      "method": "cash",
      "amount": 300
    },
    {
      "method": "upi",
      "amount": 200,
      "transactionId": "UPI123456"  // From UPI app
    }
  ]
}

// Response: Split payment created
{
  "success": true,
  "data": {
    "_id": "payment_789",
    "orderId": "order_123",
    "amount": 500,
    "status": "completed",
    "paymentMethods": [
      {
        "method": "cash",
        "amount": 300,
        "status": "completed"
      },
      {
        "method": "upi",
        "amount": 200,
        "transactionId": "UPI123456",
        "status": "completed"
      }
    ]
  }
}
```

**What Happens:**
1. ✅ System validates total (300 + 200 = 500)
2. ✅ Cash portion marked completed immediately
3. ✅ UPI portion marked completed with transaction ID
4. ✅ Overall payment status: "completed"
5. ✅ Order completed

---

### Scenario 4: Refund

```javascript
// Manager needs to refund a completed payment

POST /api/v1/payments/payment_456/refund
{
  "reason": "Customer complaint - food quality issue"
}

// Response: Refund processed
{
  "success": true,
  "data": {
    "_id": "payment_456",
    "orderId": "order_123",
    "amount": 500,
    "status": "refunded",
    "paymentMethods": [
      {
        "method": "card",
        "amount": 500,
        "status": "refunded",
        "transactionId": "pay_XYZ123"
      }
    ]
  }
}
```

**What Happens:**
1. ✅ Payment status changed to "refunded"
2. ✅ All payment methods marked as "refunded"
3. ✅ Order status changed to "cancelled"
4. ✅ If Razorpay payment, refund initiated on Razorpay
5. ✅ Customer receives refund in 5-7 business days

---

## 🔐 Security Features

### 1. Signature Verification

```javascript
// Razorpay payment verification
const text = razorpayOrderId + '|' + razorpayPaymentId;
const generated = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(text)
  .digest('hex');

if (generated === razorpaySignature) {
  // Payment is authentic
}
```

### 2. Webhook Verification

```javascript
// Verify webhook is from Razorpay
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(webhookBody))
  .digest('hex');

if (expectedSignature === receivedSignature) {
  // Webhook is authentic
}
```

### 3. Amount Validation

```javascript
// Ensure payment amount matches order total
if (Math.abs(paymentAmount - orderTotal) > 0.01) {
  throw new Error('Amount mismatch');
}

// For split payments, validate sum
const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
if (Math.abs(totalPaid - orderTotal) > 0.01) {
  throw new Error('Split payment total mismatch');
}
```

### 4. Duplicate Payment Prevention

```javascript
// Check if order is already paid
const existingPayment = await Payment.findOne({
  orderId,
  status: 'completed'
});

if (existingPayment) {
  throw new Error('Order is already paid');
}
```

---

## 📱 Receipt Generation

```javascript
// Get receipt for a payment
GET /api/v1/payments/payment_456/receipt

// Response: Detailed receipt
{
  "success": true,
  "data": {
    "receiptNumber": "RCP-20241025-0001",
    "orderNumber": "ORD-20241025-0001",
    "date": "2024-10-25T10:30:00Z",
    "customer": {
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com"
    },
    "table": "T-05",
    "items": [
      {
        "name": "Margherita Pizza",
        "quantity": 2,
        "price": 299,
        "total": 598
      },
      {
        "name": "Coke",
        "quantity": 2,
        "price": 50,
        "total": 100
      }
    ],
    "subtotal": 698,
    "taxAmount": 52.35,
    "discountAmount": 50,
    "total": 700.35,
    "paymentMethods": [
      {
        "method": "card",
        "amount": 700.35
      }
    ],
    "paidAmount": 700.35
  }
}
```

**Receipt includes:**
- ✅ Unique receipt number
- ✅ Order details
- ✅ Customer information
- ✅ Itemized list
- ✅ Tax breakdown
- ✅ Discount applied
- ✅ Payment method(s)
- ✅ Timestamp

---

## 🔄 Payment Status Flow

```
PENDING
   ↓
   ├─→ COMPLETED (successful payment)
   │      ↓
   │      └─→ REFUNDED (if refund requested)
   │
   └─→ FAILED (payment failed)
```

**Status Meanings:**
- **PENDING**: Payment initiated but not completed
- **COMPLETED**: Payment successful, order can be fulfilled
- **FAILED**: Payment failed, order remains unpaid
- **REFUNDED**: Payment was completed but later refunded

---

## 🎯 Integration Points

### Frontend Integration

```javascript
// Example: React/React Native payment flow

// 1. Create payment
const createPayment = async (orderId, amount, method) => {
  if (method === 'cash') {
    // Direct payment
    const response = await fetch('/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId,
        amount,
        paymentMethods: [{ method: 'cash', amount }]
      })
    });
    return response.json();
  } else {
    // Razorpay payment
    // Step 1: Create Razorpay order
    const orderResponse = await fetch('/api/v1/payments/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, amount })
    });
    const { razorpayOrderId } = await orderResponse.json();
    
    // Step 2: Open Razorpay checkout
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      order_id: razorpayOrderId,
      handler: async (response) => {
        // Step 3: Verify payment
        await fetch('/api/v1/payments/razorpay/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })
        });
      }
    };
    
    const razorpay = new Razorpay(options);
    razorpay.open();
  }
};
```

---

## 📊 Payment Analytics

Your system tracks:

1. **Payment Methods Distribution**
   - Cash vs Online payments
   - UPI vs Card vs Wallet

2. **Payment Success Rate**
   - Completed vs Failed payments
   - Average payment time

3. **Revenue Tracking**
   - Daily/Weekly/Monthly revenue
   - Per outlet revenue
   - Per payment method revenue

4. **Refund Analytics**
   - Refund rate
   - Refund reasons
   - Refund amount trends

---

## 🚀 Best Practices

### 1. Always Verify Razorpay Signatures
```javascript
// Never trust payment data without signature verification
const isValid = verifyPaymentSignature(orderId, paymentId, signature);
if (!isValid) {
  throw new Error('Invalid signature');
}
```

### 2. Handle Webhooks Idempotently
```javascript
// Webhooks may be sent multiple times
// Check if payment already processed
const existingPayment = await Payment.findOne({ 
  razorpayOrderId,
  status: 'completed' 
});
if (existingPayment) {
  return; // Already processed
}
```

### 3. Use Decimal Math Carefully
```javascript
// Use Math.abs for floating point comparison
if (Math.abs(amount1 - amount2) > 0.01) {
  throw new Error('Amount mismatch');
}
```

### 4. Log All Payment Events
```javascript
// Audit trail for payments
logger.info('Payment created', { 
  paymentId, 
  orderId, 
  amount, 
  method 
});
```

### 5. Handle Partial Payments
```javascript
// For split payments, track each method separately
paymentMethods.forEach(pm => {
  logger.info('Payment method processed', {
    method: pm.method,
    amount: pm.amount,
    status: pm.status
  });
});
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Payment Settings
PAYMENT_TIMEOUT=300000          # 5 minutes
AUTO_REFUND_ENABLED=true
REFUND_PROCESSING_DAYS=7
```

---

## 🐛 Troubleshooting

### Issue 1: Payment Not Completing

**Symptoms:** Payment stuck in "pending" status

**Solutions:**
1. Check Razorpay webhook is configured correctly
2. Verify webhook signature validation
3. Check network connectivity to Razorpay
4. Review webhook logs for errors

### Issue 2: Amount Mismatch

**Symptoms:** "Amount mismatch" error

**Solutions:**
1. Ensure frontend sends amount in rupees (not paise)
2. Check for rounding errors in calculations
3. Verify tax and discount calculations
4. Use `Math.abs()` for comparison with 0.01 tolerance

### Issue 3: Duplicate Payments

**Symptoms:** Multiple payments for same order

**Solutions:**
1. Check duplicate payment prevention logic
2. Verify order status before creating payment
3. Implement idempotent webhook handling
4. Add unique constraint on orderId + status

### Issue 4: Refund Not Processing

**Symptoms:** Refund fails or takes too long

**Solutions:**
1. Verify Razorpay credentials
2. Check payment is in "completed" status
3. Ensure sufficient balance in Razorpay account
4. Review Razorpay dashboard for refund status

---

## 📞 Support

For payment-related issues:
1. Check Razorpay dashboard for transaction status
2. Review application logs for errors
3. Verify webhook configuration
4. Contact Razorpay support if needed

---

## 🎓 Summary

Your payment system is **production-ready** with:

✅ **Multiple payment methods** (Cash, Card, UPI, Wallet)  
✅ **Split payment support** (Pay with multiple methods)  
✅ **Razorpay integration** (Secure online payments)  
✅ **Webhook handling** (Real-time payment updates)  
✅ **Signature verification** (Security against fraud)  
✅ **Refund processing** (Full refund support)  
✅ **Receipt generation** (Detailed receipts)  
✅ **Audit logging** (Complete payment trail)  
✅ **Multi-tenant isolation** (Data security)  

The system handles all payment scenarios from simple cash transactions to complex split payments with online payment gateways!
