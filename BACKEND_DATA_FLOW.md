# Berry & Blocks POS - Data Flow Documentation

## Table of Contents

1. [Request-Response Flow](#request-response-flow)
2. [Order Processing Flow](#order-processing-flow)
3. [Payment Processing Flow](#payment-processing-flow)
4. [Customer Journey Flow](#customer-journey-flow)
5. [Real-Time Updates Flow](#real-time-updates-flow)
6. [Caching Strategy](#caching-strategy)
7. [Queue Processing](#queue-processing)

---

## Request-Response Flow

### Complete Request Lifecycle

```
1. Client Request
   ↓
2. Express Server (app.js)
   ↓
3. Global Middleware
   - CORS
   - Body Parser
   - Helmet (Security Headers)
   - Rate Limiting
   - Request Logging
   ↓
4. Route Matching
   ↓
5. Route-Specific Middleware
   - Authentication (JWT verification)
   - Tenant Context Injection
   - RBAC Permission Check
   - Input Validation
   - Audit Logging
   ↓
6. Controller
   - Extract request data
   - Call service layer
   - Handle response
   ↓
7. Service Layer
   - Business logic
   - Data validation
   - Database operations
   - Cache operations
   - Event emission
   ↓
8. Model Layer
   - Schema validation
   - Pre/Post hooks
   - Database query
   ↓
9. Database (MongoDB)
   ↓
10. Response Path (reverse)
    - Model → Service → Controller
    - Transform data
    - Add metadata
    ↓
11. Response Middleware
    - Error handling
    - Response formatting
    - Audit logging
    ↓
12. Client Response
```

### Example: Create Order Request

```javascript
// 1. Client sends request
POST /api/v1/orders
Headers: {
  Authorization: Bearer <token>
  Content-Type: application/json
}
Body: {
  tableId: "xxx",
  items: [{ dishId: "yyy", quantity: 2 }]
}

// 2. Express receives request
app.post('/api/v1/orders', ...)

// 3. Global middleware
- cors() → Allow request
- bodyParser() → Parse JSON body
- helmet() → Add security headers
- rateLimiter() → Check rate limit (pass)
- logger() → Log request

// 4. Route matching
router.post('/orders', ...)

// 5. Route middleware
- authenticate() → Verify JWT token
  - Extract token from header
  - Verify signature
  - Check expiration
  - Load user from DB
  - Attach to req.user
  
- injectTenantContext() → Add tenant info
  - Extract tenantId from req.user
  - Extract outletId from req.user
  - Attach to req.tenantId, req.outletId
  
- requirePermission('orders.create') → Check permission
  - Get user role from req.user
  - Check if role has permission
  - Allow or deny
  
- validate(orderValidation.create) → Validate input
  - Validate against Joi schema
  - Sanitize input
  - Transform data
  
- auditLog('order.created') → Prepare audit

// 6. Controller
orderController.createOrder(req, res, next)
  - Extract data from req.body
  - Call orderService.createOrder()
  - Handle success/error
  - Send response

// 7. Service
orderService.createOrder(orderData)
  - Validate items exist
  - Check stock availability
  - Calculate totals
  - Check table availability
  - Create order in DB
  - Update table status
  - Reduce stock
  - Emit 'order.created' event
  - Return order

// 8. Model
Order.create(orderData)
  - Validate against schema
  - Run pre-save hooks
  - Insert into MongoDB
  - Run post-save hooks
  - Return document

// 9. Database
MongoDB saves document and returns

// 10. Response path
Service → Controller → Response

// 11. Response middleware
- Audit log saved
- Response formatted
- Headers added

// 12. Client receives
Status: 201 Created
Body: {
  success: true,
  data: { order object }
}
```

---

## Order Processing Flow

### Complete Order Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. ORDER CREATION
   Customer/Staff → Create Order
   ↓
   - Validate items
   - Check stock
   - Calculate totals
   - Reserve table
   - Create order (status: pending)
   ↓
   Database: Order saved
   Cache: Order cached
   Event: 'order.created' emitted
   ↓
   Listeners:
   - Notification Service → Notify staff
   - Analytics Service → Track order
   - Loyalty Service → Prepare points calculation

2. ORDER CONFIRMATION
   Staff → Confirm Order
   ↓
   - Update status to 'confirmed'
   - Generate KOT
   ↓
   Database: Order updated
   Event: 'order.confirmed' emitted
   ↓
   Listeners:
   - KOT Service → Generate kitchen tickets
   - Socket Service → Real-time update to kitchen display

3. KOT GENERATION
   System → Generate KOT
   ↓
   - Group items by kitchen section
   - Create KOT documents
   - Assign KOT numbers
   ↓
   Database: KOT saved
   Socket: Emit to kitchen screens
   Printer: Send to kitchen printers
   ↓
   Kitchen Staff sees new orders

4. FOOD PREPARATION
   Kitchen → Update KOT Status
   ↓
   KOT Status: pending → preparing → ready
   ↓
   Database: KOT updated
   Socket: Real-time updates
   ↓
   Staff notified when ready

5. ORDER SERVING
   Waiter → Mark as Served
   ↓
   - Update order status to 'served'
   - Record serve time
   ↓
   Database: Order updated
   Event: 'order.served' emitted
   ↓
   Customer can now request bill

6. PAYMENT
   Cashier → Process Payment
   ↓
   - Create payment record
   - Update order status to 'completed'
   - Update table status to 'available'
   - Calculate loyalty points
   ↓
   Database: Payment & Order updated
   Event: 'payment.completed' emitted
   ↓
   Listeners:
   - Receipt Service → Generate receipt
   - Loyalty Service → Award points
   - Analytics Service → Update stats
   - Feedback Service → Request feedback

7. POST-ORDER
   System → Cleanup & Analytics
   ↓
   - Clear table
   - Update inventory
   - Calculate metrics
   - Archive order data
```

### Data Changes at Each Stage

```javascript
// Stage 1: Creation
{
  status: 'pending',
  items: [...],
  subtotal: 500,
  tax: 25,
  total: 525,
  tableId: 'xxx',
  createdAt: Date,
  createdBy: 'userId'
}

// Stage 2: Confirmation
{
  ...previous,
  status: 'confirmed',
  confirmedAt: Date,
  confirmedBy: 'userId',
  kotIds: ['kot1', 'kot2']
}

// Stage 3: Preparing
{
  ...previous,
  status: 'preparing',
  preparationStartedAt: Date
}

// Stage 4: Ready
{
  ...previous,
  status: 'ready',
  readyAt: Date,
  preparationTime: 1200000 // 20 minutes in ms
}

// Stage 5: Served
{
  ...previous,
  status: 'served',
  servedAt: Date,
  servedBy: 'waiterId'
}

// Stage 6: Completed
{
  ...previous,
  status: 'completed',
  paymentStatus: 'paid',
  paymentId: 'paymentId',
  completedAt: Date,
  totalDuration: 2400000 // 40 minutes
}
```

---

## Payment Processing Flow

### Cash Payment Flow

```
1. Cashier initiates payment
   ↓
2. System validates order
   - Check order exists
   - Check not already paid
   - Verify amount matches
   ↓
3. Create payment record
   {
     orderId: 'xxx',
     amount: 525,
     method: 'cash',
     status: 'completed',
     receivedAmount: 600,
     changeAmount: 75
   }
   ↓
4. Update order
   - paymentStatus: 'paid'
   - paymentId: 'paymentId'
   - status: 'completed'
   ↓
5. Update table
   - status: 'available'
   - currentOrder: null
   ↓
6. Generate receipt
   ↓
7. Award loyalty points
   ↓
8. Emit events
   - 'payment.completed'
   - 'order.completed'
   ↓
9. Return receipt to cashier
```

### Razorpay Payment Flow

```
1. Customer requests online payment
   ↓
2. Backend creates Razorpay order
   POST /payments/razorpay/create-order
   ↓
   razorpay.orders.create({
     amount: 52500, // in paise
     currency: 'INR',
     receipt: 'order_xxx'
   })
   ↓
   Returns: {
     id: 'order_razorpay_xxx',
     amount: 52500,
     currency: 'INR'
   }
   ↓
3. Frontend shows Razorpay checkout
   ↓
4. Customer completes payment
   ↓
5. Razorpay sends callback
   {
     razorpay_order_id: 'order_xxx',
     razorpay_payment_id: 'pay_xxx',
     razorpay_signature: 'signature_xxx'
   }
   ↓
6. Backend verifies signature
   POST /payments/razorpay/verify
   ↓
   - Generate expected signature
   - Compare with received signature
   - Verify payment status with Razorpay
   ↓
7. If valid:
   - Create payment record
   - Update order
   - Generate receipt
   - Award points
   ↓
8. Return success to frontend
```

### Split Payment Flow

```
1. Cashier initiates split payment
   {
     orderId: 'xxx',
     total: 1000,
     methods: [
       { method: 'cash', amount: 400 },
       { method: 'card', amount: 600 }
     ]
   }
   ↓
2. Validate split
   - Sum of amounts = order total ✓
   - All methods valid ✓
   ↓
3. Process each method
   ↓
   Method 1: Cash
   - Record cash transaction
   - Amount: 400
   - Status: completed
   ↓
   Method 2: Card
   - Process card payment
   - Amount: 600
   - Transaction ID: 'txn_xxx'
   - Status: completed
   ↓
4. Create payment record
   {
     orderId: 'xxx',
     amount: 1000,
     paymentMethods: [
       { method: 'cash', amount: 400, status: 'completed' },
       { method: 'card', amount: 600, transactionId: 'txn_xxx', status: 'completed' }
     ],
     status: 'completed'
   }
   ↓
5. Update order & table
   ↓
6. Generate receipt (shows split)
   ↓
7. Award loyalty points (on total)
```



---

## Customer Journey Flow

### Complete Customer Self-Service Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOMER SELF-SERVICE JOURNEY                  │
└─────────────────────────────────────────────────────────────┘

1. CUSTOMER ARRIVAL
   Customer scans QR code on table
   ↓
   QR Code contains: /menu?tableId=xxx&outletId=yyy
   ↓
   Frontend loads menu (public, no auth required)
   GET /api/v1/customer/menu?outletId=yyy
   ↓
   Backend returns:
   - Categories
   - Dishes (with images, prices, descriptions)
   - Outlet info
   - No authentication required

2. BROWSING MENU
   Customer browses dishes
   ↓
   Frontend displays:
   - Categories
   - Dishes with filters (veg/non-veg, spice level)
   - Dish details (ingredients, allergens)
   - Recommendations (if logged in)
   ↓
   Customer selects items
   - Add to local cart (frontend)
   - No backend calls yet

3. REGISTRATION (First Time)
   Customer wants to place order
   ↓
   POST /api/v1/customer/auth/register
   Body: { phone: '9876543210', name: 'John' }
   ↓
   Backend:
   - Check if customer exists
   - If new: Create customer record
   - Generate 6-digit OTP
   - Store OTP in Redis (5 min expiry)
   - Send SMS with OTP
   ↓
   Response: { message: 'OTP sent' }

4. OTP VERIFICATION
   Customer enters OTP
   ↓
   POST /api/v1/customer/auth/verify-otp
   Body: { phone: '9876543210', otp: '123456' }
   ↓
   Backend:
   - Get OTP from Redis
   - Compare with entered OTP
   - If valid:
     - Delete OTP from Redis
     - Generate JWT token (30 days)
     - Return customer data + token
   ↓
   Response: {
     customer: { id, name, phone, loyaltyPoints },
     token: 'jwt_token'
   }
   ↓
   Frontend stores token in localStorage

5. CART MANAGEMENT
   Customer adds items to cart
   ↓
   POST /api/v1/customer/cart
   Headers: { Authorization: Bearer <token> }
   Body: { dishId: 'xxx', quantity: 2, customization: 'Extra spicy' }
   ↓
   Backend:
   - Authenticate customer
   - Find customer document
   - Add item to customer.cart array
   - Calculate cart totals
   - Save customer document
   ↓
   Response: { cart: { items: [...], subtotal, tax, total } }
   ↓
   Customer can:
   - Update quantities: PUT /customer/cart/:itemId
   - Remove items: DELETE /customer/cart/:itemId
   - Clear cart: DELETE /customer/cart

6. APPLYING OFFERS
   Customer enters coupon code
   ↓
   POST /api/v1/coupons/validate
   Body: { 
     code: 'WELCOME20',
     orderAmount: 500,
     customerId: 'xxx',
     outletId: 'yyy'
   }
   ↓
   Backend validates:
   - Coupon exists and active
   - Within validity period
   - Usage limit not exceeded
   - Customer eligible
   - Minimum order met
   - Calculate discount
   ↓
   Response: {
     valid: true,
     discount: 100,
     finalAmount: 400
   }
   ↓
   OR check loyalty points:
   GET /api/v1/loyalty/customer/:customerId
   ↓
   Response: {
     points: 250,
     redemptionValue: 125 // ₹125 discount available
   }

7. PLACING ORDER
   Customer confirms order
   ↓
   POST /api/v1/customer/orders
   Headers: { Authorization: Bearer <token> }
   Body: {
     tableId: 'xxx',
     orderType: 'dine-in',
     couponCode: 'WELCOME20',
     usePoints: 100,
     specialInstructions: 'Less spicy'
   }
   ↓
   Backend:
   - Get items from customer cart
   - Validate all items available
   - Apply coupon discount
   - Redeem loyalty points
   - Calculate final total
   - Create order
   - Clear customer cart
   - Generate KOT
   - Update table status
   ↓
   Database transactions:
   1. Create Order document
   2. Create KOT documents
   3. Update Table status
   4. Update Customer cart (clear)
   5. Update Coupon usage
   6. Update Loyalty points (redeem)
   7. Reduce Dish stock
   ↓
   Events emitted:
   - 'order.created' → Notify kitchen
   - 'customer.order.placed' → Notify customer
   ↓
   Response: {
     order: {
       id: 'order_xxx',
       orderNumber: 'ORD-001',
       items: [...],
       total: 400,
       status: 'pending',
       estimatedTime: 25 // minutes
     }
   }

8. ORDER TRACKING
   Customer tracks order status
   ↓
   GET /api/v1/customer/orders/:orderId
   ↓
   Backend returns current status
   ↓
   Frontend shows progress:
   - Pending → Confirmed → Preparing → Ready → Served
   ↓
   Real-time updates via Socket.io:
   socket.on('order-status-update', (data) => {
     // Update UI in real-time
   })

9. PAYMENT
   Customer requests bill
   ↓
   Staff processes payment
   ↓
   Order status → 'completed'
   ↓
   Loyalty points awarded automatically
   ↓
   Customer receives notification:
   "Payment completed. You earned 40 points!"

10. FEEDBACK
    Customer receives feedback request
    ↓
    POST /api/v1/feedback
    Body: {
      orderId: 'xxx',
      rating: 5,
      comment: 'Excellent food!',
      categories: {
        food: 5,
        service: 5,
        ambiance: 4
      }
    }
    ↓
    Backend:
    - Save feedback
    - Update order with feedback
    - Update dish ratings
    - If low rating: Alert management
    ↓
    Response: { message: 'Thank you for your feedback!' }
```

---

## Real-Time Updates Flow

### Socket.io Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SOCKET.IO ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

Server Setup:
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

Namespaces:
- /kitchen  → Kitchen display screens
- /staff    → Staff tablets/devices
- /customer → Customer mobile apps
- /admin    → Admin dashboard

Rooms (within namespaces):
- outlet:{outletId}     → All devices in an outlet
- table:{tableId}       → Specific table
- user:{userId}         → Specific user
- kitchen:{section}     → Specific kitchen section
```

### Connection Flow

```javascript
// 1. Client connects
const socket = io('http://localhost:3000/kitchen', {
  auth: { token: 'jwt_token' }
});

// 2. Server authenticates
io.of('/kitchen').use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    
    socket.userId = decoded.userId;
    socket.outletId = decoded.outletId;
    next();
  });
});

// 3. Client joins rooms
socket.on('connection', (socket) => {
  // Join outlet room
  socket.join(`outlet:${socket.outletId}`);
  
  // Join kitchen section room
  socket.join(`kitchen:${socket.section}`);
  
  console.log(`Kitchen display connected: ${socket.id}`);
});
```

### Event Flow Examples

#### New Order Event

```javascript
// Service layer emits event
orderService.on('order.created', async (order) => {
  // Emit to kitchen displays
  socketService.emitToKitchen(order.outletId, 'new-order', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    tableNumber: order.tableId.tableNumber,
    items: order.items,
    timestamp: new Date()
  });
  
  // Emit to staff tablets
  socketService.emitToStaff(order.outletId, 'order-update', {
    type: 'new',
    order: order
  });
  
  // Emit to customer (if connected)
  if (order.customerId) {
    socketService.emitToCustomer(order.customerId, 'order-confirmed', {
      orderId: order._id,
      status: 'confirmed',
      estimatedTime: 25
    });
  }
});

// Socket service implementation
class SocketService {
  emitToKitchen(outletId, event, data) {
    io.of('/kitchen')
      .to(`outlet:${outletId}`)
      .emit(event, data);
  }
  
  emitToStaff(outletId, event, data) {
    io.of('/staff')
      .to(`outlet:${outletId}`)
      .emit(event, data);
  }
  
  emitToCustomer(customerId, event, data) {
    io.of('/customer')
      .to(`user:${customerId}`)
      .emit(event, data);
  }
}
```

#### KOT Status Update

```javascript
// Kitchen staff updates KOT
PUT /api/v1/kots/:kotId/status
Body: { status: 'preparing' }

// Controller
async updateKOTStatus(req, res) {
  const kot = await kotService.updateStatus(req.params.kotId, req.body.status);
  
  // Emit real-time update
  socketService.emitToStaff(kot.outletId, 'kot-status-update', {
    kotId: kot._id,
    orderId: kot.orderId,
    status: kot.status,
    section: kot.section
  });
  
  // If all KOTs ready, notify waiter
  if (await this.allKOTsReady(kot.orderId)) {
    const order = await Order.findById(kot.orderId);
    socketService.emitToUser(order.assignedTo, 'order-ready', {
      orderId: order._id,
      tableNumber: order.tableId.tableNumber
    });
  }
  
  res.json({ data: kot });
}
```

---

## Caching Strategy

### Redis Cache Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Application Memory (Node.js)
- Very fast (microseconds)
- Limited size
- Lost on restart
- Use for: Frequently accessed config

Layer 2: Redis Cache
- Fast (milliseconds)
- Larger size
- Persistent
- Use for: Session data, frequently queried data

Layer 3: Database (MongoDB)
- Slower (tens of milliseconds)
- Unlimited size
- Persistent
- Source of truth
```

### Cache Implementation

```javascript
// cacheService.js
class CacheService {
  constructor() {
    this.redis = require('redis').createClient();
  }
  
  // Get with fallback to database
  async get(key, fetchFunction, ttl = 3600) {
    // Try cache first
    const cached = await this.redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss - fetch from database
    const data = await fetchFunction();
    
    // Store in cache
    await this.redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
  }
  
  // Invalidate cache
  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in service
async getDish(dishId) {
  return await cacheService.get(
    `dish:${dishId}`,
    () => Dish.findById(dishId),
    3600 // 1 hour TTL
  );
}

// Invalidate on update
async updateDish(dishId, updates) {
  const dish = await Dish.findByIdAndUpdate(dishId, updates);
  
  // Invalidate cache
  await cacheService.invalidate(`dish:${dishId}`);
  await cacheService.invalidate(`menu:${dish.outletId}:*`);
  
  return dish;
}
```

### Cache Keys Strategy

```javascript
// Naming convention: resource:id:subresource
const CACHE_KEYS = {
  // Single resources
  dish: (id) => `dish:${id}`,
  category: (id) => `category:${id}`,
  order: (id) => `order:${id}`,
  
  // Collections
  menu: (outletId) => `menu:${outletId}`,
  categories: (outletId) => `categories:${outletId}`,
  tables: (outletId) => `tables:${outletId}`,
  
  // User-specific
  cart: (customerId) => `cart:${customerId}`,
  loyalty: (customerId) => `loyalty:${customerId}`,
  
  // Session data
  session: (sessionId) => `session:${sessionId}`,
  otp: (phone) => `otp:${phone}`
};

// TTL strategy
const CACHE_TTL = {
  static: 86400,      // 24 hours (menu, categories)
  dynamic: 3600,      // 1 hour (orders, tables)
  session: 1800,      // 30 minutes (user sessions)
  temporary: 300      // 5 minutes (OTP, temp data)
};
```

---

## Queue Processing

### Bull Queue Architecture

```javascript
// queueService.js
const Queue = require('bull');

// Create queues
const emailQueue = new Queue('email', {
  redis: { host: 'localhost', port: 6379 }
});

const notificationQueue = new Queue('notification');
const analyticsQueue = new Queue('analytics');

// Add job to queue
async function sendEmail(emailData) {
  await emailQueue.add('send-email', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

// Process jobs
emailQueue.process('send-email', async (job) => {
  const { to, subject, body } = job.data;
  
  await emailService.send({ to, subject, body });
  
  return { sent: true, timestamp: new Date() };
});

// Handle job events
emailQueue.on('completed', (job, result) => {
  console.log(`Email sent: ${job.id}`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email failed: ${job.id}`, err);
});
```

### Queue Usage Examples

```javascript
// 1. Send notification (async)
orderService.on('order.created', async (order) => {
  // Add to queue instead of sending immediately
  await notificationQueue.add('order-notification', {
    userId: order.customerId,
    type: 'order_created',
    orderId: order._id
  });
});

// 2. Process analytics (batch)
paymentService.on('payment.completed', async (payment) => {
  // Add to analytics queue
  await analyticsQueue.add('update-stats', {
    type: 'payment',
    data: payment
  }, {
    delay: 60000 // Process after 1 minute
  });
});

// 3. Scheduled jobs
// Send daily reports at 9 AM
analyticsQueue.add('daily-report', {}, {
  repeat: {
    cron: '0 9 * * *'
  }
});
```

