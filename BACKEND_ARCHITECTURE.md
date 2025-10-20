# Berry & Blocks POS - Complete Backend Architecture

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Project Structure](#project-structure)
4. [Core Systems](#core-systems)
5. [Module Deep Dive](#module-deep-dive)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Integration Points](#integration-points)

---

## System Overview

### What is Berry & Blocks POS?

A **production-ready, enterprise-grade Point of Sale (POS) system** designed for restaurants with:
- Multi-tenant architecture (support multiple restaurant chains)
- Customer self-service ordering
- Real-time kitchen management
- Advanced analytics and reporting
- AI-powered recommendations
- Offline-first capabilities

### Technology Stack

```
Runtime:        Node.js v18+
Framework:      Express.js
Database:       MongoDB (with Mongoose ODM)
Cache:          Redis (optional)
Queue:          Bull (Redis-based)
Auth:           JWT + 2FA (Speakeasy)
Payments:       Razorpay
AI:             OpenAI GPT
Real-time:      Socket.io
Documentation:  Swagger/OpenAPI
Testing:        Jest + Supertest
```

### Key Metrics

- **26 Completed Tasks** (87% of roadmap)
- **19 Modules** (fully functional)
- **150+ API Endpoints**
- **15+ Database Models**
- **Production-Ready** with security, caching, logging

---

## Architecture Patterns

### 1. Multi-Tenant Architecture

```
Company (Tenant)
    ├── Outlet 1 (Sub-Tenant)
    │   ├── Staff
    │   ├── Tables
    │   ├── Menu Items
    │   └── Orders
    ├── Outlet 2 (Sub-Tenant)
    └── Outlet 3 (Sub-Tenant)
```

**How it works:**
- Each company is a **parent tenant**
- Each outlet is a **child tenant**
- Data is isolated by `tenantId` and `outletId`
- Middleware automatically injects tenant context
- Queries are automatically scoped to tenant

**Implementation:**
```javascript
// Middleware: src/middleware/tenantMiddleware.js
exports.injectTenantContext = (req, res, next) => {
  req.tenantId = req.user.tenantId;
  req.outletId = req.user.outletId;
  next();
};

// Usage in queries
const orders = await Order.find({ 
  tenantId: req.tenantId,
  outletId: req.outletId 
});
```

### 2. Role-Based Access Control (RBAC)

```
Roles Hierarchy:
    admin > manager > captain > cashier > waiter > kitchen_staff
```

**Permissions Matrix:**
```javascript
{
  admin: ['*'],  // All permissions
  manager: ['orders.*', 'menu.*', 'staff.read', 'analytics.*'],
  captain: ['orders.*', 'tables.*', 'reservations.*'],
  cashier: ['orders.read', 'payments.*'],
  waiter: ['orders.create', 'orders.read', 'tables.read'],
  kitchen_staff: ['orders.read', 'kots.*']
}
```

**Implementation:**
```javascript
// Middleware: src/middleware/rbacMiddleware.js
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (hasPermission(req.user.role, permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
};

// Usage in routes
router.post('/orders', 
  authenticate,
  requirePermission('orders.create'),
  orderController.createOrder
);
```

### 3. Service Layer Pattern

```
Request Flow:
Client → Route → Middleware → Controller → Service → Model → Database
                                              ↓
                                         Cache/Queue
```

**Separation of Concerns:**
- **Routes**: Define endpoints and apply middleware
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data operations
- **Models**: Database schema and validation
- **Middleware**: Cross-cutting concerns (auth, logging, etc.)

### 4. Event-Driven Architecture

```javascript
// Event emitter for order updates
orderService.on('order.created', async (order) => {
  await notificationService.notifyKitchen(order);
  await loyaltyService.calculatePoints(order);
  await analyticsService.trackOrder(order);
});
```

---

## Project Structure

```
berry-pos/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   │
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   ├── redis.js           # Redis connection
│   │   ├── swagger.js         # API documentation
│   │   └── queue.js           # Bull queue setup
│   │
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.js          # JWT authentication
│   │   ├── customerAuthMiddleware.js  # Customer auth
│   │   ├── tenantMiddleware.js        # Multi-tenant
│   │   ├── rbacMiddleware.js          # Permissions
│   │   ├── validationMiddleware.js    # Request validation
│   │   ├── errorMiddleware.js         # Error handling
│   │   ├── rateLimitMiddleware.js     # Rate limiting
│   │   └── auditMiddleware.js         # Audit logging
│   │
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── Tenant.js
│   │   ├── Category.js
│   │   ├── Dish.js
│   │   ├── Table.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Customer.js
│   │   ├── Staff.js
│   │   ├── Reservation.js
│   │   ├── Coupon.js
│   │   ├── Feedback.js
│   │   └── ... (15+ models)
│   │
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   │   ├── authController.js
│   │   │   ├── authService.js
│   │   │   ├── authRoutes.js
│   │   │   └── authValidation.js
│   │   │
│   │   ├── order/             # Order management
│   │   │   ├── orderController.js
│   │   │   ├── orderService.js
│   │   │   ├── kotService.js
│   │   │   ├── orderRoutes.js
│   │   │   └── orderValidation.js
│   │   │
│   │   ├── payment/           # Payment processing
│   │   ├── customer/          # Customer portal
│   │   ├── menu/              # Menu management
│   │   ├── analytics/         # Analytics & reports
│   │   ├── ai/                # AI features
│   │   └── ... (19 modules)
│   │
│   ├── services/              # Shared services
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── cacheService.js
│   │   ├── queueService.js
│   │   └── socketService.js
│   │
│   └── utils/                 # Utility functions
│       ├── logger.js
│       ├── validators.js
│       ├── helpers.js
│       └── constants.js
│
├── logs/                      # Application logs
├── tests/                     # Test files
├── .env                       # Environment variables
├── package.json
└── README.md
```



---

## Core Systems

### 1. Authentication System

**Location**: `src/modules/auth/`

#### How It Works

**JWT Token Flow:**
```
1. User Login
   ↓
2. Validate Credentials (bcrypt)
   ↓
3. Generate Access Token (15min) + Refresh Token (7 days)
   ↓
4. Store Refresh Token in DB
   ↓
5. Return Tokens to Client
   ↓
6. Client Stores Tokens
   ↓
7. Client Sends Access Token in Header: Authorization: Bearer <token>
   ↓
8. Server Validates Token (JWT verify)
   ↓
9. Extract User Info from Token
   ↓
10. Attach to req.user
```

**Implementation Details:**

```javascript
// authService.js - Login
async login(email, password) {
  // 1. Find user
  const user = await User.findOne({ email }).select('+password');
  
  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.password);
  
  // 3. Generate tokens
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // 4. Store refresh token
  user.refreshToken = refreshToken;
  await user.save();
  
  return { user, accessToken, refreshToken };
}
```

**2FA (Two-Factor Authentication):**
```javascript
// Enable 2FA
async enable2FA(userId) {
  const secret = speakeasy.generateSecret();
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  // Save secret to user
  await User.findByIdAndUpdate(userId, {
    twoFactorSecret: secret.base32,
    twoFactorEnabled: true
  });
  
  return { secret: secret.base32, qrCode };
}

// Verify 2FA token
async verify2FA(userId, token) {
  const user = await User.findById(userId);
  
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });
  
  return verified;
}
```

### 2. Multi-Tenant System

**Location**: `src/models/Tenant.js`, `src/middleware/tenantMiddleware.js`

#### Tenant Hierarchy

```javascript
// Tenant Model
const tenantSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['company', 'outlet'],
    required: true
  },
  name: String,
  parentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  // Company-specific fields
  subscriptionPlan: String,
  subscriptionStatus: String,
  // Outlet-specific fields
  location: Object,
  operatingHours: Object
});
```

#### Data Isolation

**Automatic Tenant Scoping:**
```javascript
// tenantMiddleware.js
exports.injectTenantContext = (req, res, next) => {
  // Extract from authenticated user
  req.tenantId = req.user.tenantId;
  req.outletId = req.user.outletId;
  
  // Inject into all queries
  mongoose.plugin((schema) => {
    schema.pre(/^find/, function() {
      if (this.getQuery().tenantId === undefined) {
        this.where({ tenantId: req.tenantId });
      }
    });
  });
  
  next();
};
```

**Usage Example:**
```javascript
// This query automatically filters by tenant
const dishes = await Dish.find({ categoryId: 'xxx' });
// Actual query: { categoryId: 'xxx', tenantId: 'current-tenant' }
```

### 3. Order Management System

**Location**: `src/modules/order/`

#### Order Lifecycle

```
1. PENDING      → Order created, awaiting confirmation
2. CONFIRMED    → Order confirmed by staff
3. PREPARING    → Kitchen is preparing
4. READY        → Food is ready
5. SERVED       → Food served to customer
6. COMPLETED    → Payment done, order closed
7. CANCELLED    → Order cancelled
```

#### Order Creation Flow

```javascript
// orderService.js
async createOrder(orderData) {
  // 1. Validate items and calculate totals
  const items = await this.validateOrderItems(orderData.items);
  const subtotal = this.calculateSubtotal(items);
  const tax = this.calculateTax(subtotal);
  const total = subtotal + tax;
  
  // 2. Check table availability
  if (orderData.tableId) {
    await this.checkTableAvailability(orderData.tableId);
  }
  
  // 3. Check stock availability
  await this.checkStockAvailability(items);
  
  // 4. Create order
  const order = await Order.create({
    ...orderData,
    items,
    subtotal,
    tax,
    total,
    status: 'pending',
    orderNumber: await this.generateOrderNumber()
  });
  
  // 5. Update table status
  if (orderData.tableId) {
    await Table.findByIdAndUpdate(orderData.tableId, {
      status: 'occupied',
      currentOrder: order._id
    });
  }
  
  // 6. Reduce stock
  await this.reduceStock(items);
  
  // 7. Emit events
  this.emit('order.created', order);
  
  return order;
}
```

#### Kitchen Order Ticket (KOT) System

```javascript
// kotService.js
async generateKOT(orderId) {
  const order = await Order.findById(orderId).populate('items.dishId');
  
  // Group items by kitchen section
  const sections = this.groupByKitchenSection(order.items);
  
  // Create KOT for each section
  const kots = await Promise.all(
    Object.entries(sections).map(([section, items]) =>
      KOT.create({
        orderId: order._id,
        tableNumber: order.tableId.tableNumber,
        section,
        items,
        status: 'pending',
        kotNumber: await this.generateKOTNumber()
      })
    )
  );
  
  // Notify kitchen via Socket.io
  socketService.emitToKitchen('new-kot', kots);
  
  return kots;
}
```

### 4. Payment System

**Location**: `src/modules/payment/`

#### Payment Methods Supported

1. **Cash**
2. **Card** (Credit/Debit)
3. **UPI**
4. **Digital Wallets**
5. **Split Payment** (Multiple methods)

#### Payment Flow

```javascript
// paymentService.js
async processPayment(paymentData) {
  const { orderId, paymentMethods, amount } = paymentData;
  
  // 1. Validate order
  const order = await Order.findById(orderId);
  if (order.paymentStatus === 'paid') {
    throw new Error('Order already paid');
  }
  
  // 2. Validate amount
  if (amount !== order.total) {
    throw new Error('Amount mismatch');
  }
  
  // 3. Process each payment method
  const transactions = await Promise.all(
    paymentMethods.map(method => 
      this.processPaymentMethod(method)
    )
  );
  
  // 4. Create payment record
  const payment = await Payment.create({
    orderId,
    amount,
    paymentMethods: transactions,
    status: 'completed',
    paymentDate: new Date()
  });
  
  // 5. Update order
  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: 'paid',
    paymentId: payment._id,
    status: 'completed'
  });
  
  // 6. Update table
  if (order.tableId) {
    await Table.findByIdAndUpdate(order.tableId, {
      status: 'available',
      currentOrder: null
    });
  }
  
  // 7. Generate receipt
  const receipt = await this.generateReceipt(payment);
  
  // 8. Emit events
  this.emit('payment.completed', { payment, order });
  
  return { payment, receipt };
}
```

#### Razorpay Integration

```javascript
// razorpayService.js
async createRazorpayOrder(orderId, amount) {
  const order = await Order.findById(orderId);
  
  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: `order_${orderId}`,
    notes: {
      orderId: orderId.toString(),
      outletId: order.outletId.toString()
    }
  });
  
  return razorpayOrder;
}

async verifyPayment(razorpayOrderId, razorpayPaymentId, signature) {
  // Verify signature
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  if (generated !== signature) {
    throw new Error('Invalid signature');
  }
  
  // Fetch payment details
  const payment = await razorpay.payments.fetch(razorpayPaymentId);
  
  return payment;
}
```

### 5. Customer Self-Service System

**Location**: `src/modules/customer/`

#### Customer Authentication (OTP-based)

```javascript
// customerAuthService.js
async sendOTP(phone) {
  // 1. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  
  // 2. Store in Redis (5 min expiry)
  await redis.setex(`otp:${phone}`, 300, otp);
  
  // 3. Send SMS
  await smsService.send(phone, `Your OTP is: ${otp}`);
  
  return { message: 'OTP sent successfully' };
}

async verifyOTP(phone, otp) {
  // 1. Get stored OTP
  const storedOTP = await redis.get(`otp:${phone}`);
  
  // 2. Verify
  if (storedOTP !== otp) {
    throw new Error('Invalid OTP');
  }
  
  // 3. Find or create customer
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = await Customer.create({ phone });
  }
  
  // 4. Generate token
  const token = jwt.sign(
    { customerId: customer._id, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // 5. Delete OTP
  await redis.del(`otp:${phone}`);
  
  return { customer, token };
}
```

#### Cart Management

```javascript
// customerOrderService.js
async addToCart(customerId, item) {
  let customer = await Customer.findById(customerId);
  
  // Initialize cart if empty
  if (!customer.cart) {
    customer.cart = { items: [] };
  }
  
  // Check if item exists
  const existingItem = customer.cart.items.find(
    i => i.dishId.toString() === item.dishId
  );
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += item.quantity;
  } else {
    // Add new item
    customer.cart.items.push(item);
  }
  
  // Calculate totals
  customer.cart = await this.calculateCartTotals(customer.cart);
  
  await customer.save();
  return customer.cart;
}

async placeOrder(customerId, orderData) {
  const customer = await Customer.findById(customerId);
  
  // Create order from cart
  const order = await Order.create({
    customerId,
    outletId: orderData.outletId,
    tableId: orderData.tableId,
    items: customer.cart.items,
    subtotal: customer.cart.subtotal,
    tax: customer.cart.tax,
    total: customer.cart.total,
    orderType: 'dine-in',
    status: 'pending'
  });
  
  // Clear cart
  customer.cart = { items: [] };
  await customer.save();
  
  // Generate KOT
  await kotService.generateKOT(order._id);
  
  // Notify staff
  socketService.emitToOutlet(orderData.outletId, 'new-order', order);
  
  return order;
}
```



### 6. Loyalty Program System

**Location**: `src/modules/loyalty/`

#### How Loyalty Works

```javascript
// Loyalty Rules (per outlet)
{
  pointsPerRupee: 1,        // Earn 1 point per ₹1 spent
  redemptionRate: 0.5,      // 1 point = ₹0.50
  minOrderAmount: 100,      // Minimum order for points
  expiryDays: 365          // Points expire after 1 year
}
```

#### Earning Points

```javascript
// loyaltyService.js
async earnPoints(customerId, orderId, amount) {
  // 1. Get loyalty rules
  const rules = await this.getLoyaltyRules(outletId);
  
  // 2. Check minimum order
  if (amount < rules.minOrderAmount) {
    return { points: 0, message: 'Below minimum order' };
  }
  
  // 3. Calculate points
  const points = Math.floor(amount * rules.pointsPerRupee);
  
  // 4. Find or create loyalty account
  let loyalty = await Loyalty.findOne({ customerId, outletId });
  if (!loyalty) {
    loyalty = await Loyalty.create({ customerId, outletId });
  }
  
  // 5. Add points
  loyalty.points += points;
  loyalty.totalEarned += points;
  loyalty.transactions.push({
    type: 'earn',
    points,
    orderId,
    date: new Date(),
    expiryDate: new Date(Date.now() + rules.expiryDays * 86400000)
  });
  
  await loyalty.save();
  
  return { points, balance: loyalty.points };
}
```

#### Redeeming Points

```javascript
async redeemPoints(customerId, orderId, points) {
  const loyalty = await Loyalty.findOne({ customerId, outletId });
  
  // 1. Check balance
  if (loyalty.points < points) {
    throw new Error('Insufficient points');
  }
  
  // 2. Calculate discount
  const rules = await this.getLoyaltyRules(outletId);
  const discount = points * rules.redemptionRate;
  
  // 3. Deduct points
  loyalty.points -= points;
  loyalty.totalRedeemed += points;
  loyalty.transactions.push({
    type: 'redeem',
    points: -points,
    orderId,
    discount,
    date: new Date()
  });
  
  await loyalty.save();
  
  // 4. Apply discount to order
  await Order.findByIdAndUpdate(orderId, {
    $inc: { discount: discount, total: -discount },
    loyaltyPointsUsed: points
  });
  
  return { discount, remainingPoints: loyalty.points };
}
```

### 7. Coupon System

**Location**: `src/modules/coupon/`

#### Coupon Types

```javascript
{
  discountType: 'percentage' | 'fixed',
  discountValue: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usagePerCustomer: Number,
  validFrom: Date,
  validUntil: Date,
  applicableOn: ['all', 'category', 'dish'],
  firstOrderOnly: Boolean
}
```

#### Coupon Validation

```javascript
// couponService.js
async validateCoupon(code, customerId, orderAmount, outletId) {
  // 1. Find coupon
  const coupon = await Coupon.findOne({ 
    code, 
    outletId,
    isActive: true 
  });
  
  if (!coupon) {
    throw new Error('Invalid coupon');
  }
  
  // 2. Check validity period
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    throw new Error('Coupon expired');
  }
  
  // 3. Check usage limit
  if (coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }
  
  // 4. Check per-customer limit
  const customerUsage = await CouponUsage.countDocuments({
    couponId: coupon._id,
    customerId
  });
  
  if (customerUsage >= coupon.usagePerCustomer) {
    throw new Error('You have already used this coupon');
  }
  
  // 5. Check minimum order amount
  if (orderAmount < coupon.minOrderAmount) {
    throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
  }
  
  // 6. Check first order only
  if (coupon.firstOrderOnly) {
    const orderCount = await Order.countDocuments({ customerId });
    if (orderCount > 0) {
      throw new Error('Coupon valid for first order only');
    }
  }
  
  // 7. Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }
  
  return {
    valid: true,
    discount,
    coupon
  };
}
```

### 8. Analytics System

**Location**: `src/modules/analytics/`

#### Sales Analytics

```javascript
// analyticsService.js
async getSalesAnalytics(outletId, startDate, endDate) {
  const orders = await Order.aggregate([
    {
      $match: {
        outletId: mongoose.Types.ObjectId(outletId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
  
  // Calculate trends
  const totalRevenue = orders.reduce((sum, day) => sum + day.totalRevenue, 0);
  const totalOrders = orders.reduce((sum, day) => sum + day.totalOrders, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  
  // Peak hours analysis
  const peakHours = await this.analyzePeakHours(outletId, startDate, endDate);
  
  // Payment method breakdown
  const paymentMethods = await this.analyzePaymentMethods(outletId, startDate, endDate);
  
  return {
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue
    },
    dailyData: orders,
    peakHours,
    paymentMethods
  };
}
```

#### Dish Analytics

```javascript
async getDishAnalytics(outletId, startDate, endDate) {
  const dishStats = await Order.aggregate([
    {
      $match: {
        outletId: mongoose.Types.ObjectId(outletId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.dishId',
        totalOrders: { $sum: 1 },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    {
      $lookup: {
        from: 'dishes',
        localField: '_id',
        foreignField: '_id',
        as: 'dish'
      }
    },
    { $unwind: '$dish' },
    {
      $project: {
        dishName: '$dish.name',
        category: '$dish.categoryId',
        totalOrders: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        avgPrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
  
  return {
    topDishes: dishStats.slice(0, 10),
    allDishes: dishStats
  };
}
```

### 9. AI-Powered Features

**Location**: `src/modules/ai/`

#### Dish Profile Generation

```javascript
// aiService.js
async generateDishProfile(dishName, ingredients) {
  const prompt = `
    Generate a detailed profile for a dish called "${dishName}" 
    with ingredients: ${ingredients.join(', ')}.
    
    Include:
    1. Detailed description (2-3 sentences)
    2. Taste profile (sweet, spicy, tangy, etc.)
    3. Texture description
    4. Recommended pairings
    5. Dietary information
    6. Estimated preparation time
    
    Format as JSON.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  const profile = JSON.parse(response.choices[0].message.content);
  
  return profile;
}
```

#### Personalized Recommendations

```javascript
async getRecommendations(customerId) {
  // 1. Get customer order history
  const orders = await Order.find({ customerId })
    .populate('items.dishId')
    .sort({ createdAt: -1 })
    .limit(20);
  
  // 2. Extract preferences
  const preferences = this.analyzePreferences(orders);
  
  // 3. Get customer taste profile
  const tasteProfile = await Customer.findById(customerId)
    .select('tasteProfile');
  
  // 4. Find similar dishes
  const recommendations = await Dish.find({
    outletId: orders[0].outletId,
    isAvailable: true,
    $or: [
      { dietaryTags: { $in: preferences.dietaryTags } },
      { categoryId: { $in: preferences.favoriteCategories } },
      { 'tasteProfile.spiceLevel': tasteProfile.spiceLevel }
    ]
  })
  .limit(10);
  
  // 5. Use AI to rank recommendations
  const prompt = `
    Based on customer preferences: ${JSON.stringify(preferences)}
    And available dishes: ${JSON.stringify(recommendations)}
    
    Rank the dishes from most to least recommended.
    Consider: past orders, taste preferences, dietary restrictions.
    
    Return array of dish IDs in order.
  `;
  
  const ranking = await this.getAIRanking(prompt);
  
  return this.sortByRanking(recommendations, ranking);
}
```

### 10. Reservation System

**Location**: `src/modules/reservation/`

#### Availability Check

```javascript
// reservationService.js
async checkAvailability(outletId, date, time, partySize) {
  // 1. Get outlet capacity
  const outlet = await Tenant.findById(outletId);
  const totalCapacity = outlet.seatingCapacity;
  
  // 2. Get existing reservations for that time slot
  const timeSlotStart = new Date(`${date}T${time}`);
  const timeSlotEnd = new Date(timeSlotStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  
  const existingReservations = await Reservation.find({
    outletId,
    reservationDate: date,
    status: { $in: ['confirmed', 'seated'] },
    $or: [
      {
        reservationTime: {
          $gte: time,
          $lt: this.addHours(time, 2)
        }
      }
    ]
  });
  
  // 3. Calculate occupied capacity
  const occupiedCapacity = existingReservations.reduce(
    (sum, res) => sum + res.partySize, 0
  );
  
  // 4. Check availability
  const availableCapacity = totalCapacity - occupiedCapacity;
  const isAvailable = availableCapacity >= partySize;
  
  // 5. Suggest alternative times if not available
  let alternatives = [];
  if (!isAvailable) {
    alternatives = await this.findAlternativeTimes(
      outletId, date, partySize
    );
  }
  
  return {
    available: isAvailable,
    availableCapacity,
    alternatives
  };
}
```

#### Pre-Order Management

```javascript
async addPreOrder(reservationId, items) {
  const reservation = await Reservation.findById(reservationId);
  
  // 1. Validate items
  const validatedItems = await this.validateMenuItems(items);
  
  // 2. Calculate totals
  const subtotal = validatedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  
  // 3. Add to reservation
  reservation.preOrder = {
    items: validatedItems,
    subtotal,
    status: 'pending'
  };
  
  await reservation.save();
  
  // 4. Notify kitchen (for preparation timing)
  const prepTime = this.calculatePrepTime(validatedItems);
  const notifyTime = new Date(reservation.reservationDateTime - prepTime);
  
  await this.scheduleKitchenNotification(reservationId, notifyTime);
  
  return reservation;
}
```

