# Design Document

## Overview

The Berry & Blocks POS Backend is a multi-tenant, microservices-oriented Node.js application built with Express.js and MongoDB. The system follows a modular monolith architecture that can be decomposed into microservices as scale demands. The design prioritizes offline-first capabilities, real-time synchronization, role-based access control, and extensibility for third-party integrations.

### Key Design Principles

1. **Multi-tenancy**: Tenant isolation at the database level using tenant identifiers in all collections
2. **Offline-First**: Local-first architecture with background synchronization
3. **Event-Driven**: Asynchronous event processing for notifications, analytics, and integrations
4. **Modular**: Clear separation of concerns with domain-driven design
5. **Scalable**: Horizontal scaling support with stateless API design
6. **Secure**: JWT-based authentication, role-based authorization, and data encryption

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  (Customer App, Kiosk, Captain App, Owner App, Valet App, POS)  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway / Load Balancer                 │
│                    (Rate Limiting, Auth Validation)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  Auth Service  │  │  Core API      │  │  Admin API     │
│                │  │  Service       │  │  Service       │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
│  Event Queue   │  │   MongoDB    │  │  Redis Cache   │
│  (Bull/Redis)  │  │   Database   │  │                │
└───────┬────────┘  └──────────────┘  └────────────────┘
        │
┌───────▼────────────────────────────────────────────────┐
│              Background Workers                         │
│  - Sync Worker                                         │
│  - Notification Worker (WhatsApp, SMS, Email, Push)   │
│  - Analytics Worker                                    │
│  - AI Processing Worker                                │
│  - Integration Worker (Swiggy, Zomato, Tally)         │
└────────────────────────────────────────────────────────┘
```


### Technology Stack

- **Runtime**: Node.js 18+ with JavaScript (ES6+)
- **Web Framework**: Express.js 4.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Cache**: Redis 7.x for session management and caching
- **Queue**: Bull (Redis-based) for background job processing
- **Authentication**: JWT (jsonwebtoken) with bcrypt for password hashing
- **Validation**: Joi for request validation
- **File Storage**: AWS S3 or compatible object storage for images
- **Real-time**: Socket.io for live updates (KOT status, order tracking)
- **Logging**: Winston with daily rotate file transport
- **Monitoring**: PM2 for process management
- **API Documentation**: Swagger/OpenAPI 3.0

### Deployment Architecture

```
Production Environment:
- Load Balancer (Nginx/AWS ALB)
- 3+ API Server Instances (PM2 cluster mode)
- MongoDB Replica Set (3 nodes)
- Redis Cluster (3 nodes)
- Worker Instances (separate from API servers)
- S3 for static assets and backups
```

## Components and Interfaces

### 1. Core Modules

#### 1.1 Authentication Module (`/src/modules/auth`)

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Password reset and email verification
- Two-factor authentication (2FA)
- Session management
- Role-based access control (RBAC)

**Key Components:**
- `authController.js`: Handles auth endpoints
- `authService.js`: Business logic for authentication
- `jwtService.js`: Token generation and validation
- `authMiddleware.js`: JWT validation middleware
- `rbacMiddleware.js`: Role-based authorization

**API Endpoints:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/enable-2fa
POST   /api/v1/auth/verify-2fa
```

#### 1.2 Tenant Module (`/src/modules/tenant`)

**Responsibilities:**
- Multi-tenant data isolation
- Tenant hierarchy management (Company → Brand → Outlet)
- Tenant onboarding and configuration
- Subscription management

**Key Components:**
- `tenantController.js`: Tenant CRUD operations
- `tenantService.js`: Tenant business logic
- `tenantMiddleware.js`: Tenant context injection
- `hierarchyService.js`: Manages tenant relationships

**API Endpoints:**
```
POST   /api/v1/tenants
GET    /api/v1/tenants/:id
PUT    /api/v1/tenants/:id
DELETE /api/v1/tenants/:id
GET    /api/v1/tenants/:id/hierarchy
POST   /api/v1/tenants/:id/outlets
GET    /api/v1/tenants/:id/subscription
PUT    /api/v1/tenants/:id/subscription
```

#### 1.3 Menu Module (`/src/modules/menu`)

**Responsibilities:**
- Dish CRUD operations
- Dietary tags and allergen management
- Portion size management
- Menu categorization
- Stock availability tracking

**Key Components:**
- `dishController.js`: Dish endpoints
- `dishService.js`: Dish business logic
- `categoryController.js`: Category management
- `stockService.js`: Real-time stock tracking

**API Endpoints:**
```
POST   /api/v1/dishes
GET    /api/v1/dishes
GET    /api/v1/dishes/:id
PUT    /api/v1/dishes/:id
DELETE /api/v1/dishes/:id
PATCH  /api/v1/dishes/:id/stock
GET    /api/v1/dishes/search
POST   /api/v1/categories
GET    /api/v1/categories
```

#### 1.4 AI Module (`/src/modules/ai`)

**Responsibilities:**
- Dish description generation
- Nutritional analysis
- Taste factor analysis
- Allergen detection
- Customer taste profile generation
- Personalized recommendations

**Key Components:**
- `aiService.js`: AI orchestration service
- `dishProfileService.js`: Dish profiling logic
- `recommendationService.js`: Recommendation engine
- `tasteProfileService.js`: Customer taste analysis

**API Endpoints:**
```
POST   /api/v1/ai/generate-dish-profile
POST   /api/v1/ai/analyze-nutrition
GET    /api/v1/ai/recommendations/:customerId
POST   /api/v1/ai/update-taste-profile
```

#### 1.5 Order Module (`/src/modules/order`)

**Responsibilities:**
- Order creation and management
- Order status tracking
- KOT generation and routing
- Order modifications and cancellations
- Multi-channel order handling

**Key Components:**
- `orderController.js`: Order endpoints
- `orderService.js`: Order business logic
- `kotService.js`: KOT generation and management
- `orderStatusService.js`: Status tracking
- `orderValidationService.js`: Order validation

**API Endpoints:**
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id
DELETE /api/v1/orders/:id/items/:itemId
PATCH  /api/v1/orders/:id/status
POST   /api/v1/orders/:id/kot
GET    /api/v1/orders/table/:tableId
GET    /api/v1/orders/customer/:customerId
```


#### 1.6 Payment Module (`/src/modules/payment`)

**Responsibilities:**
- Payment processing
- Multiple payment method support
- Split payment handling
- Refund processing
- Receipt generation

**Key Components:**
- `paymentController.js`: Payment endpoints
- `paymentService.js`: Payment processing logic
- `paymentGatewayService.js`: Gateway integrations
- `receiptService.js`: Receipt generation

**API Endpoints:**
```
POST   /api/v1/payments
GET    /api/v1/payments/:id
POST   /api/v1/payments/:id/refund
GET    /api/v1/payments/order/:orderId
POST   /api/v1/payments/split
GET    /api/v1/payments/:id/receipt
```

#### 1.7 Loyalty Module (`/src/modules/loyalty`)

**Responsibilities:**
- Loyalty point calculation and tracking
- Point earning and redemption
- Loyalty rule configuration
- Customer tier management

**Key Components:**
- `loyaltyController.js`: Loyalty endpoints
- `loyaltyService.js`: Point calculation logic
- `loyaltyRuleService.js`: Rule management
- `tierService.js`: Customer tier logic

**API Endpoints:**
```
GET    /api/v1/loyalty/customer/:customerId
POST   /api/v1/loyalty/earn
POST   /api/v1/loyalty/redeem
GET    /api/v1/loyalty/rules
PUT    /api/v1/loyalty/rules/:outletId
GET    /api/v1/loyalty/history/:customerId
```

#### 1.8 Feedback Module (`/src/modules/feedback`)

**Responsibilities:**
- Feedback collection
- Automated response handling
- Sentiment analysis
- Google review redirection
- Feedback analytics

**Key Components:**
- `feedbackController.js`: Feedback endpoints
- `feedbackService.js`: Feedback processing
- `sentimentService.js`: Sentiment analysis
- `feedbackResponseService.js`: Automated responses

**API Endpoints:**
```
POST   /api/v1/feedback
GET    /api/v1/feedback/:id
GET    /api/v1/feedback/order/:orderId
POST   /api/v1/feedback/:id/respond
GET    /api/v1/feedback/analytics
```

#### 1.9 Coupon Module (`/src/modules/coupon`)

**Responsibilities:**
- Coupon creation and management
- Coupon validation and application
- Usage tracking
- Campaign linking

**Key Components:**
- `couponController.js`: Coupon endpoints
- `couponService.js`: Coupon logic
- `couponValidationService.js`: Validation rules

**API Endpoints:**
```
POST   /api/v1/coupons
GET    /api/v1/coupons
GET    /api/v1/coupons/:code
PUT    /api/v1/coupons/:id
DELETE /api/v1/coupons/:id
POST   /api/v1/coupons/validate
GET    /api/v1/coupons/:id/usage
```

#### 1.10 Table Module (`/src/modules/table`)

**Responsibilities:**
- Table management
- Table status tracking
- Table assignment and transfer
- Table merging
- QR code generation

**Key Components:**
- `tableController.js`: Table endpoints
- `tableService.js`: Table management logic
- `qrService.js`: QR code generation

**API Endpoints:**
```
POST   /api/v1/tables
GET    /api/v1/tables
GET    /api/v1/tables/:id
PUT    /api/v1/tables/:id
PATCH  /api/v1/tables/:id/status
POST   /api/v1/tables/transfer
POST   /api/v1/tables/merge
GET    /api/v1/tables/:id/qr
```

#### 1.11 Staff Module (`/src/modules/staff`)

**Responsibilities:**
- Staff management
- Performance tracking
- Role assignment
- Activity logging

**Key Components:**
- `staffController.js`: Staff endpoints
- `staffService.js`: Staff management
- `performanceService.js`: Performance metrics

**API Endpoints:**
```
POST   /api/v1/staff
GET    /api/v1/staff
GET    /api/v1/staff/:id
PUT    /api/v1/staff/:id
DELETE /api/v1/staff/:id
GET    /api/v1/staff/:id/performance
GET    /api/v1/staff/outlet/:outletId
```

#### 1.12 Valet Module (`/src/modules/valet`)

**Responsibilities:**
- Valet request management
- Parking spot assignment
- Status tracking
- Performance metrics

**Key Components:**
- `valetController.js`: Valet endpoints
- `valetService.js`: Valet request logic
- `parkingService.js`: Parking management

**API Endpoints:**
```
POST   /api/v1/valet/requests
GET    /api/v1/valet/requests/:id
PATCH  /api/v1/valet/requests/:id/status
GET    /api/v1/valet/requests/customer/:customerId
GET    /api/v1/valet/performance
```

#### 1.13 Reservation Module (`/src/modules/reservation`)

**Responsibilities:**
- Table reservation management
- Pre-order handling
- Availability checking
- Reminder notifications

**Key Components:**
- `reservationController.js`: Reservation endpoints
- `reservationService.js`: Reservation logic
- `availabilityService.js`: Table availability

**API Endpoints:**
```
POST   /api/v1/reservations
GET    /api/v1/reservations/:id
PUT    /api/v1/reservations/:id
DELETE /api/v1/reservations/:id
GET    /api/v1/reservations/availability
POST   /api/v1/reservations/:id/pre-order
```

#### 1.14 Analytics Module (`/src/modules/analytics`)

**Responsibilities:**
- Sales analytics
- Customer analytics
- Staff performance analytics
- Dish performance tracking
- Campaign analytics

**Key Components:**
- `analyticsController.js`: Analytics endpoints
- `salesAnalyticsService.js`: Sales metrics
- `customerAnalyticsService.js`: Customer insights
- `reportService.js`: Report generation

**API Endpoints:**
```
GET    /api/v1/analytics/sales
GET    /api/v1/analytics/dishes
GET    /api/v1/analytics/customers
GET    /api/v1/analytics/staff
GET    /api/v1/analytics/campaigns
POST   /api/v1/analytics/reports/export
```


#### 1.15 Integration Module (`/src/modules/integration`)

**Responsibilities:**
- Third-party API integrations
- Swiggy/Zomato order sync
- Tally accounting export
- WhatsApp Business API
- Payment gateway integrations

**Key Components:**
- `swiggyService.js`: Swiggy integration
- `zomatoService.js`: Zomato integration
- `tallyService.js`: Tally export
- `whatsappService.js`: WhatsApp messaging
- `paymentGatewayService.js`: Payment gateways

**API Endpoints:**
```
POST   /api/v1/integrations/swiggy/webhook
POST   /api/v1/integrations/zomato/webhook
POST   /api/v1/integrations/tally/export
POST   /api/v1/integrations/whatsapp/send
GET    /api/v1/integrations/status
```

#### 1.16 Notification Module (`/src/modules/notification`)

**Responsibilities:**
- Multi-channel notification delivery
- Notification templates
- Delivery tracking
- Push notification management

**Key Components:**
- `notificationController.js`: Notification endpoints
- `notificationService.js`: Notification orchestration
- `pushService.js`: Push notifications
- `smsService.js`: SMS delivery
- `emailService.js`: Email delivery

**API Endpoints:**
```
POST   /api/v1/notifications/send
GET    /api/v1/notifications/:id
GET    /api/v1/notifications/user/:userId
POST   /api/v1/notifications/templates
```

#### 1.17 Sync Module (`/src/modules/sync`)

**Responsibilities:**
- Offline data synchronization
- Conflict resolution
- Delta sync optimization
- Sync status tracking

**Key Components:**
- `syncController.js`: Sync endpoints
- `syncService.js`: Sync orchestration
- `conflictResolver.js`: Conflict resolution logic
- `deltaService.js`: Delta calculation

**API Endpoints:**
```
POST   /api/v1/sync/push
POST   /api/v1/sync/pull
GET    /api/v1/sync/status
POST   /api/v1/sync/resolve-conflict
```

#### 1.18 Admin Module (`/src/modules/admin`)

**Responsibilities:**
- Platform administration
- Subscription management
- Support ticket management
- System monitoring
- Feature toggle management

**Key Components:**
- `adminController.js`: Admin endpoints
- `subscriptionService.js`: Subscription management
- `ticketService.js`: Support tickets
- `featureToggleService.js`: Feature flags

**API Endpoints:**
```
GET    /api/v1/admin/tenants
GET    /api/v1/admin/subscriptions
POST   /api/v1/admin/tickets
GET    /api/v1/admin/tickets/:id
PATCH  /api/v1/admin/tickets/:id/status
GET    /api/v1/admin/analytics
POST   /api/v1/admin/feature-toggles
```

### 2. Shared Components

#### 2.1 Middleware (`/src/middleware`)

- `authMiddleware.js`: JWT validation
- `tenantMiddleware.js`: Tenant context injection
- `rbacMiddleware.js`: Role-based authorization
- `rateLimitMiddleware.js`: API rate limiting
- `validationMiddleware.js`: Request validation
- `errorMiddleware.js`: Global error handling
- `loggingMiddleware.js`: Request/response logging

#### 2.2 Utilities (`/src/utils`)

- `logger.js`: Winston logger configuration
- `responseFormatter.js`: Standardized API responses
- `errorHandler.js`: Custom error classes
- `dateHelper.js`: Date manipulation utilities
- `encryptionHelper.js`: Encryption/decryption
- `fileUploadHelper.js`: S3 file upload
- `paginationHelper.js`: Pagination logic

#### 2.3 Configuration (`/src/config`)

- `database.js`: MongoDB connection
- `redis.js`: Redis connection
- `queue.js`: Bull queue configuration
- `aws.js`: AWS SDK configuration
- `constants.js`: Application constants
- `environment.js`: Environment variables

## Data Models

### Core Collections

#### 1. Tenants Collection

```javascript
{
  _id: ObjectId,
  type: String, // 'company', 'brand', 'outlet'
  name: String,
  parentId: ObjectId, // Reference to parent tenant
  contactInfo: {
    email: String,
    phone: String,
    address: Object
  },
  subscription: {
    tier: String,
    status: String, // 'active', 'paused', 'expired'
    startDate: Date,
    endDate: Date,
    billingCycle: String
  },
  settings: Object,
  isDeleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Users Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  email: String,
  password: String, // bcrypt hashed
  firstName: String,
  lastName: String,
  phone: String,
  role: String, // 'admin', 'manager', 'captain', 'cashier', 'kitchen'
  outletId: ObjectId,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Customers Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  phone: String,
  email: String,
  name: String,
  tasteProfile: {
    preferredDietaryTags: [String],
    tasteFactor: {
      spicy: Number,
      sweet: Number,
      tangy: Number,
      salty: Number,
      bitter: Number
    },
    allergens: [String],
    favoriteCategories: [String]
  },
  loyaltyPoints: Number,
  totalOrders: Number,
  totalSpent: Number,
  lastOrderDate: Date,
  segment: String, // 'new', 'returning', 'vip'
  whatsappOptIn: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```


#### 4. Dishes Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  name: String,
  description: {
    short: String,
    detailed: String
  },
  categoryId: ObjectId,
  images: [String], // S3 URLs
  price: Number,
  portionSizes: [{
    name: String,
    price: Number,
    servings: Number
  }],
  dietaryTags: [String], // 'veg', 'non-veg', 'vegan', 'jain', 'eggetarian'
  allergens: [String],
  ingredients: [String],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number
  },
  tasteFactor: {
    spicy: Number,
    sweet: Number,
    tangy: Number,
    salty: Number,
    bitter: Number
  },
  prepTime: Number, // minutes
  stock: Number,
  isAvailable: Boolean,
  tags: [String], // 'chef-special', 'seasonal', 'most-ordered'
  taxRate: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Categories Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  name: String,
  description: String,
  image: String,
  kitchenSection: String, // 'kitchen', 'bar', 'dessert'
  displayOrder: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. Orders Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  orderNumber: String,
  customerId: ObjectId,
  tableId: ObjectId,
  orderType: String, // 'dine-in', 'takeaway', 'delivery'
  source: String, // 'pos', 'customer-app', 'kiosk', 'swiggy', 'zomato'
  items: [{
    dishId: ObjectId,
    name: String,
    quantity: Number,
    price: Number,
    portionSize: String,
    customization: String,
    status: String, // 'pending', 'preparing', 'ready', 'served'
    kotId: ObjectId
  }],
  subtotal: Number,
  taxAmount: Number,
  discountAmount: Number,
  couponCode: String,
  loyaltyPointsUsed: Number,
  total: Number,
  status: String, // 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  staffId: ObjectId, // Captain who took the order
  specialInstructions: String,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

#### 7. KOT (Kitchen Order Tickets) Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  orderId: ObjectId,
  kotNumber: String,
  tableNumber: String,
  kitchenSection: String,
  items: [{
    dishId: ObjectId,
    name: String,
    quantity: Number,
    customization: String
  }],
  status: String, // 'pending', 'preparing', 'ready'
  priority: String, // 'normal', 'urgent'
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

#### 8. Payments Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  orderId: ObjectId,
  amount: Number,
  paymentMethods: [{
    method: String, // 'cash', 'card', 'upi', 'wallet'
    amount: Number,
    transactionId: String,
    status: String
  }],
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  receiptNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. Loyalty Transactions Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  customerId: ObjectId,
  type: String, // 'earn', 'redeem', 'bonus', 'expire'
  points: Number,
  orderId: ObjectId,
  reason: String,
  balance: Number, // Balance after transaction
  createdAt: Date
}
```

#### 10. Coupons Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  code: String,
  type: String, // 'flat', 'percentage', 'bogo'
  value: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usageCount: Number,
  perCustomerLimit: Number,
  validFrom: Date,
  validUntil: Date,
  applicableOutlets: [ObjectId],
  campaignId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 11. Feedback Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  orderId: ObjectId,
  customerId: ObjectId,
  rating: Number, // 1-5
  comment: String,
  sentiment: String, // 'positive', 'neutral', 'negative'
  response: {
    message: String,
    couponCode: String,
    loyaltyPoints: Number,
    respondedBy: ObjectId,
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 12. Tables Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  tableNumber: String,
  capacity: Number,
  status: String, // 'available', 'occupied', 'reserved', 'cleaning'
  qrCode: String,
  currentOrderId: ObjectId,
  section: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 13. Reservations Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  customerId: ObjectId,
  customerName: String,
  customerPhone: String,
  partySize: Number,
  reservationDate: Date,
  reservationTime: String,
  tableId: ObjectId,
  preOrders: [{
    dishId: ObjectId,
    quantity: Number
  }],
  status: String, // 'pending', 'confirmed', 'seated', 'completed', 'cancelled'
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 14. Valet Requests Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  customerId: ObjectId,
  orderId: ObjectId,
  vehicleNumber: String,
  vehicleType: String,
  parkingSection: String,
  parkingSpot: String,
  status: String, // 'requested', 'in-queue', 'dispatched', 'delivered'
  requestedAt: Date,
  dispatchedAt: Date,
  deliveredAt: Date,
  retrievalTime: Number, // seconds
  createdAt: Date,
  updatedAt: Date
}
```

#### 15. Staff Performance Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  outletId: ObjectId,
  staffId: ObjectId,
  date: Date,
  metrics: {
    ordersProcessed: Number,
    totalSales: Number,
    averageOrderValue: Number,
    upsellCount: Number,
    feedbackRating: Number,
    feedbackCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```


#### 16. Campaigns Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  name: String,
  description: String,
  type: String, // 'coupon', 'loyalty', 'whatsapp'
  targetAudience: {
    segment: [String],
    minOrders: Number,
    minSpent: Number
  },
  couponIds: [ObjectId],
  validFrom: Date,
  validUntil: Date,
  metrics: {
    reach: Number,
    redemptions: Number,
    revenue: Number
  },
  status: String, // 'draft', 'active', 'completed'
  createdAt: Date,
  updatedAt: Date
}
```

#### 17. Sync Queue Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  deviceId: String,
  collection: String,
  operation: String, // 'create', 'update', 'delete'
  documentId: ObjectId,
  data: Object,
  timestamp: Date,
  synced: Boolean,
  syncedAt: Date,
  conflictResolved: Boolean,
  createdAt: Date
}
```

#### 18. Audit Logs Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  userId: ObjectId,
  action: String,
  resource: String,
  resourceId: ObjectId,
  changes: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

#### 19. Support Tickets Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  ticketNumber: String,
  subject: String,
  description: String,
  priority: String, // 'low', 'medium', 'high', 'urgent'
  status: String, // 'open', 'in-progress', 'resolved', 'closed'
  category: String,
  assignedTo: ObjectId,
  createdBy: ObjectId,
  messages: [{
    senderId: ObjectId,
    message: String,
    timestamp: Date
  }],
  feedback: {
    rating: Number,
    comment: String
  },
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

#### 20. Subscriptions Collection

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,
  tier: String, // 'basic', 'pro', 'enterprise'
  billingCycle: String, // 'monthly', 'quarterly', 'annual'
  amount: Number,
  status: String, // 'active', 'paused', 'expired', 'cancelled'
  startDate: Date,
  endDate: Date,
  autoRenew: Boolean,
  paymentHistory: [{
    amount: Number,
    invoiceNumber: String,
    paidAt: Date,
    paymentMethod: String
  }],
  features: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Performance-critical indexes
Tenants: { parentId: 1 }, { type: 1 }
Users: { tenantId: 1, email: 1 }, { tenantId: 1, role: 1 }
Customers: { tenantId: 1, phone: 1 }, { tenantId: 1, email: 1 }
Dishes: { tenantId: 1, outletId: 1, isActive: 1 }, { tenantId: 1, categoryId: 1 }
Orders: { tenantId: 1, outletId: 1, status: 1 }, { tenantId: 1, customerId: 1 }, { orderNumber: 1 }
KOT: { tenantId: 1, outletId: 1, status: 1 }, { orderId: 1 }
Payments: { tenantId: 1, orderId: 1 }, { status: 1 }
Tables: { tenantId: 1, outletId: 1, status: 1 }
Reservations: { tenantId: 1, outletId: 1, reservationDate: 1 }
Feedback: { tenantId: 1, outletId: 1, rating: 1 }, { orderId: 1 }
SyncQueue: { tenantId: 1, deviceId: 1, synced: 1 }, { timestamp: 1 }
AuditLogs: { tenantId: 1, userId: 1, timestamp: -1 }
```

## Error Handling

### Error Response Format

```javascript
{
  success: false,
  error: {
    code: String, // 'VALIDATION_ERROR', 'AUTH_ERROR', 'NOT_FOUND', etc.
    message: String,
    details: Object, // Optional additional context
    timestamp: Date
  }
}
```

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401, 'AUTH_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}
```

### Global Error Handler

```javascript
// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    tenantId: req.tenantId,
    userId: req.userId
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date()
      }
    });
  }

  // Programming or unknown errors
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date()
    }
  });
});
```

### Validation Strategy

- Use Joi schemas for request validation
- Validate at controller level before service calls
- Return detailed validation errors with field-level messages
- Sanitize inputs to prevent injection attacks

```javascript
// Example validation schema
const createDishSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  price: Joi.number().required().positive(),
  categoryId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  dietaryTags: Joi.array().items(Joi.string().valid('veg', 'non-veg', 'vegan', 'jain', 'eggetarian')),
  allergens: Joi.array().items(Joi.string()),
  prepTime: Joi.number().positive()
});
```


## Testing Strategy

### Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /--------\
                /          \
               / Integration \
              /--------------\
             /                \
            /   Unit Tests     \
           /--------------------\
```

### 1. Unit Tests

**Scope**: Individual functions, services, and utilities

**Tools**: Jest

**Coverage Target**: 80%+ for business logic

**Focus Areas**:
- Service layer business logic
- Utility functions
- Validation schemas
- Data transformations
- Calculation logic (loyalty points, discounts, tax)

**Example**:
```javascript
describe('LoyaltyService', () => {
  describe('calculatePoints', () => {
    it('should calculate points based on order amount', () => {
      const points = loyaltyService.calculatePoints(1000, { pointsPerRupee: 0.1 });
      expect(points).toBe(100);
    });

    it('should apply bonus multiplier for special events', () => {
      const points = loyaltyService.calculatePoints(1000, { 
        pointsPerRupee: 0.1,
        bonusMultiplier: 2 
      });
      expect(points).toBe(200);
    });
  });
});
```

### 2. Integration Tests

**Scope**: API endpoints, database operations, external service integrations

**Tools**: Jest + Supertest + MongoDB Memory Server

**Focus Areas**:
- API endpoint responses
- Database CRUD operations
- Authentication and authorization flows
- Multi-tenant data isolation
- Transaction handling

**Example**:
```javascript
describe('POST /api/v1/orders', () => {
  it('should create order and return order details', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId: testCustomerId,
        tableId: testTableId,
        items: [{ dishId: testDishId, quantity: 2 }]
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.orderNumber).toBeDefined();
  });

  it('should enforce tenant isolation', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${otherTenantToken}`)
      .send({
        customerId: testCustomerId, // From different tenant
        tableId: testTableId,
        items: [{ dishId: testDishId, quantity: 2 }]
      });

    expect(response.status).toBe(403);
  });
});
```

### 3. End-to-End Tests

**Scope**: Complete user workflows

**Tools**: Jest + Supertest

**Focus Areas**:
- Complete order flow (create → KOT → payment → completion)
- Customer journey (browse → order → feedback)
- Multi-channel order processing
- Offline sync scenarios

**Example**:
```javascript
describe('Complete Order Flow', () => {
  it('should process order from creation to completion', async () => {
    // 1. Create order
    const orderResponse = await createOrder();
    const orderId = orderResponse.body.data._id;

    // 2. Generate KOT
    const kotResponse = await generateKOT(orderId);
    expect(kotResponse.status).toBe(201);

    // 3. Update KOT status
    await updateKOTStatus(kotResponse.body.data._id, 'ready');

    // 4. Process payment
    const paymentResponse = await processPayment(orderId, 1000);
    expect(paymentResponse.status).toBe(200);

    // 5. Verify order completion
    const finalOrder = await getOrder(orderId);
    expect(finalOrder.body.data.status).toBe('completed');
  });
});
```

### 4. Performance Tests

**Tools**: Artillery or k6

**Focus Areas**:
- API response times under load
- Database query performance
- Concurrent order processing
- Cache effectiveness

### 5. Security Tests

**Focus Areas**:
- SQL/NoSQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting effectiveness
- JWT token validation
- Role-based access control

### Test Data Management

- Use factories for test data generation
- Seed database with realistic test data
- Clean up test data after each test suite
- Use separate test database

### Continuous Integration

- Run unit tests on every commit
- Run integration tests on pull requests
- Generate coverage reports
- Block merges if coverage drops below threshold

## Security Considerations

### 1. Authentication & Authorization

**JWT Implementation**:
```javascript
// Token structure
{
  userId: ObjectId,
  tenantId: ObjectId,
  role: String,
  outletId: ObjectId,
  iat: Number,
  exp: Number
}

// Token expiration: 24 hours
// Refresh token expiration: 30 days
```

**Password Security**:
- Bcrypt with salt rounds: 12
- Minimum password length: 8 characters
- Password complexity requirements
- Password reset token expiration: 1 hour

**Two-Factor Authentication**:
- TOTP-based (Time-based One-Time Password)
- QR code generation for authenticator apps
- Backup codes for account recovery

### 2. Data Protection

**Encryption**:
- Passwords: bcrypt hashing
- Sensitive data at rest: AES-256 encryption
- Data in transit: TLS 1.3
- Payment information: PCI DSS compliant encryption

**Data Sanitization**:
- Input validation on all endpoints
- HTML escaping for user-generated content
- MongoDB query sanitization to prevent NoSQL injection

### 3. API Security

**Rate Limiting**:
```javascript
// Authentication endpoints: 5 requests/minute
// General API: 100 requests/minute
// Admin endpoints: 50 requests/minute
```

**CORS Configuration**:
- Whitelist allowed origins
- Restrict methods and headers
- Credentials support for authenticated requests

**Request Validation**:
- Joi schema validation
- File upload size limits
- Content-type validation

### 4. Multi-Tenant Security

**Tenant Isolation**:
- Tenant ID in all database queries
- Middleware to inject tenant context
- Prevent cross-tenant data access
- Separate encryption keys per tenant

**Access Control**:
```javascript
// Role hierarchy
Admin > Manager > Captain > Cashier > Kitchen Staff

// Permission matrix
{
  'admin': ['*'],
  'manager': ['orders.*', 'menu.*', 'staff.read', 'reports.*'],
  'captain': ['orders.create', 'orders.read', 'orders.update', 'tables.*'],
  'cashier': ['orders.read', 'payments.*'],
  'kitchen': ['kot.read', 'kot.update']
}
```

### 5. Audit & Monitoring

**Audit Logging**:
- Log all data modifications
- Track user actions
- Record authentication attempts
- Monitor suspicious activities

**Security Monitoring**:
- Failed login attempt tracking
- Unusual API usage patterns
- Data export activities
- Permission changes

### 6. Compliance

**CERT-IN Compliance**:
- Incident response procedures
- Data breach notification protocols
- Security audit trails
- Vulnerability management

**Future Compliance Readiness**:
- GDPR: Data portability, right to deletion
- PCI DSS: Payment card data handling
- ISO 27001: Information security management


## Offline Mode & Synchronization

### Offline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Device                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Local Storage (IndexedDB/SQLite)       │  │
│  │  - Orders                                        │  │
│  │  - Menu (cached)                                 │  │
│  │  - Tables                                        │  │
│  │  - KOT                                           │  │
│  └──────────────────────────────────────────────────┘  │
│                          ▲                              │
│                          │                              │
│  ┌──────────────────────┼──────────────────────────┐  │
│  │      Sync Service     │                          │  │
│  │  - Queue operations   │                          │  │
│  │  - Conflict detection │                          │  │
│  │  - Delta sync         │                          │  │
│  └──────────────────────┼──────────────────────────┘  │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                           │ When Online
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Cloud Backend                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Sync API Endpoints                   │  │
│  │  POST /api/v1/sync/push                          │  │
│  │  POST /api/v1/sync/pull                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Sync Strategy

**1. Push Sync (Client → Server)**

```javascript
// Client queues operations while offline
{
  operation: 'create',
  collection: 'orders',
  data: { /* order data */ },
  timestamp: Date,
  deviceId: String,
  localId: String
}

// When online, push to server
POST /api/v1/sync/push
{
  operations: [
    { operation: 'create', collection: 'orders', data: {...}, timestamp: ... },
    { operation: 'update', collection: 'tables', data: {...}, timestamp: ... }
  ]
}

// Server processes and returns results
{
  success: true,
  results: [
    { localId: 'local-123', serverId: '507f1f77bcf86cd799439011', status: 'success' },
    { localId: 'local-124', serverId: null, status: 'conflict', reason: 'version mismatch' }
  ]
}
```

**2. Pull Sync (Server → Client)**

```javascript
// Client requests updates since last sync
POST /api/v1/sync/pull
{
  lastSyncTimestamp: Date,
  collections: ['orders', 'dishes', 'tables']
}

// Server returns delta changes
{
  success: true,
  data: {
    orders: [
      { _id: '...', operation: 'update', data: {...} },
      { _id: '...', operation: 'delete' }
    ],
    dishes: [
      { _id: '...', operation: 'update', data: {...} }
    ]
  },
  timestamp: Date
}
```

**3. Conflict Resolution**

```javascript
// Conflict resolution strategies
const conflictStrategies = {
  // Server wins (default for most data)
  serverWins: (serverData, clientData) => serverData,
  
  // Client wins (for local POS operations)
  clientWins: (serverData, clientData) => clientData,
  
  // Last write wins (based on timestamp)
  lastWriteWins: (serverData, clientData) => {
    return serverData.updatedAt > clientData.updatedAt ? serverData : clientData;
  },
  
  // Merge (for specific fields like stock)
  merge: (serverData, clientData) => {
    return {
      ...serverData,
      stock: serverData.stock - clientData.stockDecrement
    };
  }
};

// Collection-specific strategies
const syncConfig = {
  orders: 'clientWins',      // POS orders take precedence
  dishes: 'serverWins',      // Menu updates from server
  tables: 'lastWriteWins',   // Table status
  stock: 'merge'             // Stock requires merging
};
```

### Offline Capabilities

**Supported Operations**:
- ✅ Create orders
- ✅ Generate KOT
- ✅ Update table status
- ✅ Process payments (cash only)
- ✅ View menu (cached)
- ✅ Update order status
- ❌ AI recommendations (requires online)
- ❌ Third-party integrations
- ❌ WhatsApp notifications

**Local Data Storage**:
- Menu data cached for 24 hours
- Orders stored until synced
- Table status maintained locally
- KOT queue persisted

## Performance Optimization

### 1. Database Optimization

**Indexing Strategy**:
- Compound indexes for common query patterns
- Partial indexes for filtered queries
- Text indexes for search functionality

**Query Optimization**:
```javascript
// Use projection to limit returned fields
db.dishes.find(
  { tenantId: ObjectId('...'), isActive: true },
  { name: 1, price: 1, images: 1, stock: 1 }
);

// Use aggregation for complex queries
db.orders.aggregate([
  { $match: { tenantId: ObjectId('...'), status: 'completed' } },
  { $group: { _id: '$dishId', totalSold: { $sum: '$quantity' } } },
  { $sort: { totalSold: -1 } },
  { $limit: 10 }
]);

// Use lean() for read-only queries
Order.find({ tenantId }).lean().exec();
```

**Connection Pooling**:
```javascript
mongoose.connect(mongoUri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

### 2. Caching Strategy

**Redis Caching**:
```javascript
// Cache frequently accessed data
const cacheConfig = {
  menu: { ttl: 300 },        // 5 minutes
  dishes: { ttl: 300 },      // 5 minutes
  categories: { ttl: 600 },  // 10 minutes
  outlets: { ttl: 3600 },    // 1 hour
  tenants: { ttl: 3600 }     // 1 hour
};

// Cache-aside pattern
async function getDish(dishId) {
  const cacheKey = `dish:${dishId}`;
  
  // Try cache first
  let dish = await redis.get(cacheKey);
  if (dish) return JSON.parse(dish);
  
  // Cache miss - fetch from DB
  dish = await Dish.findById(dishId);
  
  // Store in cache
  await redis.setex(cacheKey, 300, JSON.stringify(dish));
  
  return dish;
}
```

**Cache Invalidation**:
```javascript
// Invalidate on updates
async function updateDish(dishId, updates) {
  const dish = await Dish.findByIdAndUpdate(dishId, updates, { new: true });
  
  // Invalidate cache
  await redis.del(`dish:${dishId}`);
  await redis.del(`menu:${dish.outletId}`);
  
  return dish;
}
```

### 3. API Response Optimization

**Pagination**:
```javascript
// Cursor-based pagination for large datasets
async function getOrders(tenantId, cursor, limit = 20) {
  const query = { tenantId };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  
  const orders = await Order.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();
  
  const hasMore = orders.length > limit;
  const results = hasMore ? orders.slice(0, -1) : orders;
  const nextCursor = hasMore ? results[results.length - 1]._id : null;
  
  return { results, nextCursor, hasMore };
}
```

**Response Compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

**Field Selection**:
```javascript
// Allow clients to specify required fields
GET /api/v1/dishes?fields=name,price,images
```

### 4. Background Processing

**Job Queue**:
```javascript
// Use Bull for background jobs
const Queue = require('bull');

const notificationQueue = new Queue('notifications', {
  redis: redisConfig
});

const analyticsQueue = new Queue('analytics', {
  redis: redisConfig
});

// Process jobs in workers
notificationQueue.process(async (job) => {
  const { type, recipient, data } = job.data;
  await sendNotification(type, recipient, data);
});

// Add jobs from API
await notificationQueue.add({
  type: 'whatsapp',
  recipient: customer.phone,
  data: { orderId, feedbackLink }
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

### 5. Load Balancing

**Horizontal Scaling**:
- Stateless API design
- Session data in Redis
- Sticky sessions not required
- Load balancer distributes requests

**Health Checks**:
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: 'disconnected',
    redis: 'disconnected'
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    health.mongodb = 'connected';
  } catch (err) {
    health.status = 'degraded';
  }
  
  try {
    await redis.ping();
    health.redis = 'connected';
  } catch (err) {
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```


## Third-Party Integrations

### 1. Swiggy Integration

**Webhook Endpoint**:
```javascript
POST /api/v1/integrations/swiggy/webhook

// Incoming order payload
{
  orderId: String,
  restaurantId: String,
  customer: {
    name: String,
    phone: String,
    address: Object
  },
  items: [{
    dishId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  deliveryTime: Date
}

// Processing flow
1. Validate webhook signature
2. Map Swiggy dish IDs to internal dish IDs
3. Create order with source='swiggy'
4. Generate KOT
5. Send acknowledgment to Swiggy
6. Update order status to Swiggy as it progresses
```

**Menu Sync**:
```javascript
// Push menu updates to Swiggy
async function syncMenuToSwiggy(outletId) {
  const dishes = await Dish.find({ outletId, isActive: true });
  
  const swiggyMenu = dishes.map(dish => ({
    itemId: dish._id,
    name: dish.name,
    description: dish.description.short,
    price: dish.price,
    isVeg: dish.dietaryTags.includes('veg'),
    isAvailable: dish.stock > 0
  }));
  
  await swiggyAPI.updateMenu(outletId, swiggyMenu);
}
```

### 2. Zomato Integration

**Similar to Swiggy**:
- Webhook for incoming orders
- Menu synchronization
- Order status updates
- Stock availability sync

### 3. Tally Integration

**Export Format**:
```javascript
// Generate Tally XML export
async function generateTallyExport(outletId, startDate, endDate) {
  const orders = await Order.find({
    outletId,
    status: 'completed',
    completedAt: { $gte: startDate, $lte: endDate }
  }).populate('items.dishId');
  
  const vouchers = orders.map(order => ({
    voucherType: 'Sales',
    date: order.completedAt,
    voucherNumber: order.orderNumber,
    ledgerEntries: [
      {
        ledgerName: 'Sales',
        amount: -order.subtotal,
        isDeemedPositive: false
      },
      {
        ledgerName: 'CGST',
        amount: -order.taxAmount / 2,
        isDeemedPositive: false
      },
      {
        ledgerName: 'SGST',
        amount: -order.taxAmount / 2,
        isDeemedPositive: false
      },
      {
        ledgerName: order.paymentMethod,
        amount: order.total,
        isDeemedPositive: true
      }
    ]
  }));
  
  return generateTallyXML(vouchers);
}
```

### 4. WhatsApp Business API

**Message Templates**:
```javascript
const whatsappTemplates = {
  feedbackRequest: {
    name: 'feedback_request',
    language: 'en',
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: '{{customerName}}' },
        { type: 'text', text: '{{orderNumber}}' },
        { type: 'text', text: '{{feedbackLink}}' }
      ]
    }]
  },
  
  orderConfirmation: {
    name: 'order_confirmation',
    language: 'en',
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: '{{orderNumber}}' },
        { type: 'text', text: '{{estimatedTime}}' }
      ]
    }]
  },
  
  valetReady: {
    name: 'valet_ready',
    language: 'en',
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: '{{vehicleNumber}}' }
      ]
    }]
  }
};

// Send WhatsApp message
async function sendWhatsAppMessage(phone, template, params) {
  const response = await whatsappAPI.sendMessage({
    to: phone,
    type: 'template',
    template: {
      name: template.name,
      language: template.language,
      components: template.components.map(comp => ({
        ...comp,
        parameters: params
      }))
    }
  });
  
  return response;
}
```

### 5. Payment Gateway Integration

**Razorpay Integration**:
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
async function createPaymentOrder(orderId, amount) {
  const options = {
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: orderId,
    payment_capture: 1
  };
  
  const razorpayOrder = await razorpay.orders.create(options);
  return razorpayOrder;
}

// Verify payment signature
function verifyPaymentSignature(orderId, paymentId, signature) {
  const crypto = require('crypto');
  const text = orderId + '|' + paymentId;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  return generated === signature;
}

// Webhook handler
app.post('/api/v1/integrations/razorpay/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = verifyWebhookSignature(req.body, signature);
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const { event, payload } = req.body;
  
  if (event === 'payment.captured') {
    await handlePaymentSuccess(payload.payment.entity);
  } else if (event === 'payment.failed') {
    await handlePaymentFailure(payload.payment.entity);
  }
  
  res.json({ status: 'ok' });
});
```

### 6. AI Service Integration

**OpenAI Integration for Dish Profiling**:
```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate dish description
async function generateDishDescription(dishName, ingredients) {
  const prompt = `Generate a short (20 words) and detailed (50 words) description for a dish called "${dishName}" with ingredients: ${ingredients.join(', ')}. Return as JSON with keys "short" and "detailed".`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

// Analyze nutrition
async function analyzeNutrition(dishName, ingredients, portionSize) {
  const prompt = `Estimate nutritional information for "${dishName}" (${portionSize}g) with ingredients: ${ingredients.join(', ')}. Return as JSON with keys: calories, protein, carbs, fats, fiber (all in grams except calories).`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

// Analyze taste factors
async function analyzeTasteFactors(dishName, ingredients) {
  const prompt = `Rate the taste profile of "${dishName}" with ingredients: ${ingredients.join(', ')} on a scale of 0-10 for: spicy, sweet, tangy, salty, bitter. Return as JSON.`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

## Deployment Strategy

### Environment Configuration

```javascript
// .env.example
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/berry-blocks
MONGODB_TEST_URI=mongodb://localhost:27017/berry-blocks-test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=berry-blocks-assets

# OpenAI
OPENAI_API_KEY=

# WhatsApp
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=

# Payment Gateway
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Swiggy
SWIGGY_API_KEY=
SWIGGY_WEBHOOK_SECRET=

# Zomato
ZOMATO_API_KEY=
ZOMATO_WEBHOOK_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# SMS
SMS_API_KEY=
SMS_SENDER_ID=
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/berry-blocks
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  worker:
    build: .
    command: node src/workers/index.js
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/berry-blocks
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

volumes:
  mongo-data:
  redis-data:
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'berry-blocks-api',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'berry-blocks-worker',
      script: './src/workers/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log'
    }
  ]
};
```

### Monitoring & Logging

```javascript
// Winston logger configuration
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'berry-blocks-api' },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}
```

## API Documentation

### Swagger Configuration

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Berry & Blocks POS API',
      version: '1.0.0',
      description: 'Multi-tenant restaurant management system API'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.berryblocks.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### Example API Documentation

```javascript
/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               tableId:
 *                 type: string
 *               orderType:
 *                 type: string
 *                 enum: [dine-in, takeaway, delivery]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dishId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     customization:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
```

This comprehensive design document provides a solid foundation for implementing the Berry & Blocks POS Backend system with Node.js, JavaScript, and MongoDB.
