# Berry & Blocks POS - Database Schema Documentation

## Table of Contents

1. [Database Overview](#database-overview)
2. [Core Models](#core-models)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Data Validation](#data-validation)

---

## Database Overview

### Technology
- **Database**: MongoDB 5.0+
- **ODM**: Mongoose 7.0+
- **Connection**: Connection pooling with retry logic
- **Replication**: Supports replica sets for high availability

### Collections Summary

| Collection | Purpose | Avg Size | Indexes |
|------------|---------|----------|---------|
| users | Staff & admin accounts | ~100 docs | 5 |
| tenants | Companies & outlets | ~50 docs | 3 |
| customers | Customer accounts | ~10K docs | 4 |
| categories | Menu categories | ~50 docs | 2 |
| dishes | Menu items | ~500 docs | 6 |
| tables | Restaurant tables | ~100 docs | 3 |
| orders | Customer orders | ~100K docs | 8 |
| payments | Payment records | ~100K docs | 6 |
| kots | Kitchen order tickets | ~200K docs | 5 |
| reservations | Table reservations | ~5K docs | 4 |
| loyalty | Loyalty accounts | ~10K docs | 3 |
| coupons | Discount coupons | ~100 docs | 4 |
| feedback | Customer feedback | ~50K docs | 4 |
| staff | Staff records | ~100 docs | 3 |
| auditlogs | Audit trail | ~1M docs | 6 |

---

## Core Models

### 1. User Model

```javascript
// Location: src/models/User.js

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: 'Invalid email format'
    }
  },
  
  password: {
    type: String,
    required: true,
    select: false, // Don't return in queries by default
    minlength: 8
  },
  
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v),
      message: 'Phone must be 10 digits'
    }
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['admin', 'manager', 'captain', 'cashier', 'waiter', 'kitchen_staff'],
    default: 'waiter'
  },
  
  // Multi-tenant
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  
  // Security
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  refreshToken: {
    type: String,
    select: false
  },
  
  lastLogin: Date,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ outletId: 1, isActive: 1 });

// Virtual: Full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook: Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 2. Tenant Model

```javascript
// Location: src/models/Tenant.js

const tenantSchema = new mongoose.Schema({
  // Type
  type: {
    type: String,
    enum: ['company', 'outlet'],
    required: true
  },
  
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Hierarchy
  parentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  
  // Contact
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  
  // Company-specific
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise']
  },
  
  subscriptionStatus: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  
  // Outlet-specific
  seatingCapacity: Number,
  
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  cuisineTypes: [String],
  
  // Settings
  settings: {
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    taxRate: { type: Number, default: 5 },
    serviceCharge: { type: Number, default: 0 }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ type: 1, isActive: 1 });
tenantSchema.index({ parentTenant: 1 });

// Virtual: Child outlets (for companies)
tenantSchema.virtual('outlets', {
  ref: 'Tenant',
  localField: '_id',
  foreignField: 'parentTenant'
});

module.exports = mongoose.model('Tenant', tenantSchema);
```

### 3. Order Model

```javascript
// Location: src/models/Order.js

const orderSchema = new mongoose.Schema({
  // Identification
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Multi-tenant
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  // Customer
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  
  // Table
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    index: true
  },
  
  // Order Type
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    required: true
  },
  
  // Items
  items: [{
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    name: String, // Snapshot at order time
    price: Number, // Snapshot at order time
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customization: String,
    specialInstructions: String,
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served'],
      default: 'pending'
    }
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  
  serviceCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Discounts Applied
  couponCode: String,
  couponDiscount: Number,
  loyaltyPointsUsed: Number,
  loyaltyDiscount: Number,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // References
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  
  kotIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KOT'
  }],
  
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  },
  
  // Staff
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes
  specialInstructions: String,
  internalNotes: String,
  
  // Timestamps
  confirmedAt: Date,
  preparationStartedAt: Date,
  readyAt: Date,
  servedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  // Durations (in milliseconds)
  preparationTime: Number,
  totalDuration: Number
}, {
  timestamps: true
});

// Compound indexes for common queries
orderSchema.index({ outletId: 1, status: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ tableId: 1, status: 1 });
orderSchema.index({ createdAt: -1 }); // For date range queries

// Pre-save: Calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discount')) {
    this.total = this.subtotal + this.tax + this.serviceCharge - this.discount;
  }
  next();
});

// Method: Calculate preparation time
orderSchema.methods.calculatePreparationTime = function() {
  if (this.readyAt && this.preparationStartedAt) {
    this.preparationTime = this.readyAt - this.preparationStartedAt;
  }
};

module.exports = mongoose.model('Order', orderSchema);
```



### 4. Dish Model

```javascript
// Location: src/models/Dish.js

const dishSchema = new mongoose.Schema({
  // Multi-tenant
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text' // Text search
  },
  
  description: {
    short: String,
    detailed: String
  },
  
  // Category
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  costPrice: Number, // For profit calculation
  
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  
  // Dietary Info
  dietaryTags: [{
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'gluten-free', 'dairy-free', 'nut-free']
  }],
  
  allergens: [String],
  
  spiceLevel: {
    type: Number,
    min: 0,
    max: 5
  },
  
  // Ingredients
  ingredients: [String],
  
  // Nutrition (per serving)
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  
  // Kitchen Info
  prepTime: {
    type: Number, // in minutes
    default: 15
  },
  
  kitchenSection: {
    type: String,
    enum: ['kitchen', 'bar', 'grill', 'tandoor', 'dessert'],
    default: 'kitchen'
  },
  
  // Inventory
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  trackInventory: {
    type: Boolean,
    default: false
  },
  
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  
  availabilitySchedule: {
    monday: { available: Boolean, timeSlots: [{ start: String, end: String }] },
    tuesday: { available: Boolean, timeSlots: [{ start: String, end: String }] },
    wednesday: { available: Boolean, timeSlots: [{ start: String, end: String }] },
    thursday: { available: Boolean, timeSlots: [{ start: String, end: String }] },
    friday: { available: Boolean, timeSlots: [{ start: String, end: String }] },
    saturday: { available: Boolean, timeSlots: [{ start: String, end: String }] },
    sunday: { available: Boolean, timeSlots: [{ start: String, end: String }] }
  },
  
  // Ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Tax
  taxRate: {
    type: Number,
    default: 5
  },
  
  // Display
  displayOrder: Number,
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isPopular: {
    type: Boolean,
    default: false
  },
  
  // AI-generated
  tasteProfile: {
    sweet: Number,
    spicy: Number,
    sour: Number,
    bitter: Number,
    umami: Number
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
dishSchema.index({ outletId: 1, categoryId: 1, isAvailable: 1 });
dishSchema.index({ outletId: 1, isAvailable: 1, displayOrder: 1 });
dishSchema.index({ dietaryTags: 1 });
dishSchema.index({ name: 'text', 'description.short': 'text' });

// Method: Check availability
dishSchema.methods.isAvailableNow = function() {
  if (!this.isAvailable) return false;
  
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const time = now.toTimeString().slice(0, 5);
  
  const schedule = this.availabilitySchedule[day];
  if (!schedule || !schedule.available) return false;
  
  if (!schedule.timeSlots || schedule.timeSlots.length === 0) return true;
  
  return schedule.timeSlots.some(slot => 
    time >= slot.start && time <= slot.end
  );
};

// Method: Update rating
dishSchema.methods.updateRating = function(newRating) {
  const totalScore = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (totalScore + newRating) / this.totalRatings;
};

module.exports = mongoose.model('Dish', dishSchema);
```

### 5. Payment Model

```javascript
// Location: src/models/Payment.js

const paymentSchema = new mongoose.Schema({
  // Multi-tenant
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  
  // Order Reference
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  
  // Customer
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  
  // Amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Methods (supports split payment)
  paymentMethods: [{
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet', 'razorpay'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionId: String,
    cardLast4: String,
    cardBrand: String,
    upiId: String,
    walletProvider: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    }
  }],
  
  // Razorpay specific
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Refund
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Staff
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Receipt
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  receiptUrl: String,
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ outletId: 1, paymentDate: -1 });
paymentSchema.index({ customerId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1, paymentDate: -1 });

// Pre-save: Generate receipt number
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    const count = await this.constructor.countDocuments({
      outletId: this.outletId,
      paymentDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.receiptNumber = `RCP-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
```

### 6. Customer Model

```javascript
// Location: src/models/Customer.js

const customerSchema = new mongoose.Schema({
  // Basic Info
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  name: String,
  email: String,
  
  // Multi-tenant (customers can visit multiple outlets)
  visitedOutlets: [{
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant'
    },
    firstVisit: Date,
    lastVisit: Date,
    visitCount: Number
  }],
  
  // Cart (for self-service ordering)
  cart: {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant'
    },
    items: [{
      dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
      },
      quantity: Number,
      customization: String,
      price: Number
    }],
    subtotal: Number,
    tax: Number,
    total: Number,
    updatedAt: Date
  },
  
  // Preferences
  dietaryPreferences: [{
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'gluten-free']
  }],
  
  spicePreference: {
    type: Number,
    min: 0,
    max: 5
  },
  
  allergens: [String],
  
  // Taste Profile (AI-generated)
  tasteProfile: {
    favoriteCuisines: [String],
    favoriteCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    favoriteDishes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish'
    }],
    preferences: {
      sweet: Number,
      spicy: Number,
      sour: Number
    }
  },
  
  // Loyalty (per outlet)
  loyalty: [{
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant'
    },
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    totalEarned: Number,
    totalRedeemed: Number
  }],
  
  // Statistics
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    avgOrderValue: Number,
    lastOrderDate: Date
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ 'visitedOutlets.outletId': 1 });
customerSchema.index({ 'loyalty.outletId': 1 });

// Method: Get loyalty for outlet
customerSchema.methods.getLoyaltyForOutlet = function(outletId) {
  return this.loyalty.find(l => 
    l.outletId.toString() === outletId.toString()
  ) || { points: 0, tier: 'bronze' };
};

// Method: Update stats
customerSchema.methods.updateStats = async function(order) {
  this.stats.totalOrders += 1;
  this.stats.totalSpent += order.total;
  this.stats.avgOrderValue = this.stats.totalSpent / this.stats.totalOrders;
  this.stats.lastOrderDate = new Date();
  
  await this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
```

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  ENTITY RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────┘

Tenant (Company)
    │
    ├──< Tenant (Outlet) [1:N]
    │       │
    │       ├──< User [1:N]
    │       ├──< Category [1:N]
    │       ├──< Dish [1:N]
    │       ├──< Table [1:N]
    │       ├──< Order [1:N]
    │       ├──< Staff [1:N]
    │       └──< Reservation [1:N]
    │
    └──< Subscription [1:1]

Customer
    ├──< Order [1:N]
    ├──< Payment [1:N]
    ├──< Feedback [1:N]
    ├──< Reservation [1:N]
    └──< Loyalty [1:N] (per outlet)

Order
    ├──> Customer [N:1]
    ├──> Table [N:1]
    ├──> Payment [1:1]
    ├──> KOT [1:N]
    ├──> Feedback [1:1]
    └──< OrderItem [1:N]
            └──> Dish [N:1]

Category
    └──< Dish [1:N]

Dish
    ├──> Category [N:1]
    └──< OrderItem [1:N]

Table
    └──< Order [1:N]

Payment
    └──> Order [N:1]

KOT
    └──> Order [N:1]

Feedback
    └──> Order [N:1]

Reservation
    ├──> Customer [N:1]
    ├──> Table [N:1]
    └──> Order [1:1] (optional, created on arrival)

Coupon
    └──< CouponUsage [1:N]
            └──> Customer [N:1]

Staff
    ├──> User [1:1]
    └──< Shift [1:N]

AuditLog
    ├──> User [N:1]
    └──> Tenant [N:1]
```

### Relationship Types

**One-to-One (1:1)**
- Order → Payment
- Order → Feedback
- Staff → User
- Tenant → Subscription

**One-to-Many (1:N)**
- Tenant → Outlet
- Outlet → User
- Outlet → Order
- Category → Dish
- Order → KOT
- Customer → Order

**Many-to-Many (N:M)**
- Customer ↔ Outlet (via visitedOutlets)
- Dish ↔ Order (via OrderItem)
- Customer ↔ Coupon (via CouponUsage)



---

## Indexes

### Index Strategy

**Purpose of Indexes:**
1. Speed up queries
2. Enforce uniqueness
3. Support sorting
4. Enable text search

**Index Types Used:**
- **Single Field**: `{ field: 1 }`
- **Compound**: `{ field1: 1, field2: -1 }`
- **Text**: `{ field: 'text' }`
- **Geospatial**: `{ location: '2dsphere' }`
- **Unique**: `{ field: 1 }, { unique: true }`
- **Sparse**: `{ field: 1 }, { sparse: true }`

### Critical Indexes

```javascript
// User Model
User.index({ email: 1 }, { unique: true });
User.index({ tenantId: 1, role: 1 });
User.index({ outletId: 1, isActive: 1 });

// Order Model
Order.index({ orderNumber: 1 }, { unique: true });
Order.index({ outletId: 1, status: 1, createdAt: -1 });
Order.index({ customerId: 1, createdAt: -1 });
Order.index({ tableId: 1, status: 1 });
Order.index({ paymentStatus: 1 });
Order.index({ createdAt: -1 }); // For date range queries

// Dish Model
Dish.index({ outletId: 1, categoryId: 1, isAvailable: 1 });
Dish.index({ outletId: 1, isAvailable: 1, displayOrder: 1 });
Dish.index({ dietaryTags: 1 });
Dish.index({ name: 'text', 'description.short': 'text' });

// Payment Model
Payment.index({ receiptNumber: 1 }, { unique: true, sparse: true });
Payment.index({ outletId: 1, paymentDate: -1 });
Payment.index({ customerId: 1, paymentDate: -1 });
Payment.index({ status: 1, paymentDate: -1 });

// Customer Model
Customer.index({ phone: 1 }, { unique: true });
Customer.index({ 'visitedOutlets.outletId': 1 });
Customer.index({ 'loyalty.outletId': 1 });

// AuditLog Model
AuditLog.index({ tenantId: 1, timestamp: -1 });
AuditLog.index({ userId: 1, timestamp: -1 });
AuditLog.index({ action: 1, timestamp: -1 });
AuditLog.index({ resource: 1, resourceId: 1 });
AuditLog.index({ timestamp: -1 }); // For cleanup
```

### Index Performance

**Query Patterns Optimized:**

```javascript
// 1. Get active orders for outlet (uses compound index)
Order.find({
  outletId: 'xxx',
  status: { $in: ['pending', 'confirmed', 'preparing'] },
  createdAt: { $gte: startDate }
}).sort({ createdAt: -1 });
// Uses: { outletId: 1, status: 1, createdAt: -1 }

// 2. Get customer order history (uses compound index)
Order.find({
  customerId: 'xxx'
}).sort({ createdAt: -1 });
// Uses: { customerId: 1, createdAt: -1 }

// 3. Search dishes (uses text index)
Dish.find({
  $text: { $search: 'paneer tikka' },
  outletId: 'xxx',
  isAvailable: true
});
// Uses: text index + { outletId: 1, isAvailable: 1 }

// 4. Get payments for date range (uses compound index)
Payment.find({
  outletId: 'xxx',
  paymentDate: { $gte: startDate, $lte: endDate }
}).sort({ paymentDate: -1 });
// Uses: { outletId: 1, paymentDate: -1 }
```

### Index Maintenance

```javascript
// Check index usage
db.orders.aggregate([
  { $indexStats: {} }
]);

// Drop unused indexes
db.orders.dropIndex('old_index_name');

// Rebuild indexes
db.orders.reIndex();

// Monitor index size
db.orders.stats().indexSizes;
```

---

## Data Validation

### Schema-Level Validation

```javascript
// 1. Required Fields
{
  email: {
    type: String,
    required: [true, 'Email is required']
  }
}

// 2. Enum Validation
{
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'completed'],
      message: '{VALUE} is not a valid status'
    }
  }
}

// 3. Min/Max Validation
{
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price too high']
  }
}

// 4. Custom Validators
{
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email`
    }
  }
}

// 5. Unique Validation
{
  email: {
    type: String,
    unique: true,
    index: true
  }
}
```

### Application-Level Validation (Joi)

```javascript
// orderValidation.js
const Joi = require('joi');

exports.createOrder = Joi.object({
  tableId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid table ID format'
    }),
  
  items: Joi.array()
    .items(
      Joi.object({
        dishId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        quantity: Joi.number()
          .integer()
          .min(1)
          .max(50)
          .required(),
        customization: Joi.string()
          .max(200)
          .optional()
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'Order must have at least 1 item',
      'array.max': 'Order cannot have more than 50 items'
    }),
  
  orderType: Joi.string()
    .valid('dine-in', 'takeaway', 'delivery')
    .required(),
  
  specialInstructions: Joi.string()
    .max(500)
    .optional()
});
```

### Data Sanitization

```javascript
// 1. MongoDB Query Sanitization
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// Prevents: { email: { $gt: "" } }
// Converts to: { email: "[object Object]" }

// 2. XSS Protection
const xss = require('xss-clean');
app.use(xss());

// Prevents: <script>alert('xss')</script>
// Converts to: &lt;script&gt;alert('xss')&lt;/script&gt;

// 3. Trim Whitespace
userSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

// 4. Lowercase Email
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});
```

### Business Logic Validation

```javascript
// orderService.js
async validateOrderItems(items) {
  // 1. Check all dishes exist
  const dishIds = items.map(item => item.dishId);
  const dishes = await Dish.find({ 
    _id: { $in: dishIds },
    isAvailable: true 
  });
  
  if (dishes.length !== dishIds.length) {
    throw new Error('Some dishes are not available');
  }
  
  // 2. Check stock availability
  for (const item of items) {
    const dish = dishes.find(d => d._id.toString() === item.dishId);
    
    if (dish.trackInventory && dish.stock < item.quantity) {
      throw new Error(`${dish.name} is out of stock`);
    }
  }
  
  // 3. Validate quantities
  for (const item of items) {
    if (item.quantity < 1 || item.quantity > 50) {
      throw new Error('Invalid quantity');
    }
  }
  
  return dishes;
}

async validateTableAvailability(tableId) {
  const table = await Table.findById(tableId);
  
  if (!table) {
    throw new Error('Table not found');
  }
  
  if (table.status !== 'available') {
    throw new Error('Table is not available');
  }
  
  return table;
}
```

---

## Database Best Practices

### 1. Connection Management

```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 5,
      
      // Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Retry
      retryWrites: true,
      retryReads: true,
      
      // Other options
      autoIndex: process.env.NODE_ENV !== 'production'
    });
    
    console.log('MongoDB connected');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 2. Query Optimization

```javascript
// Bad: N+1 query problem
const orders = await Order.find({ outletId });
for (const order of orders) {
  order.customer = await Customer.findById(order.customerId);
}

// Good: Use populate
const orders = await Order.find({ outletId })
  .populate('customerId')
  .populate('tableId')
  .populate('items.dishId');

// Better: Select only needed fields
const orders = await Order.find({ outletId })
  .populate('customerId', 'name phone')
  .populate('tableId', 'tableNumber')
  .populate('items.dishId', 'name price')
  .select('orderNumber status total createdAt')
  .lean(); // Returns plain JS objects (faster)
```

### 3. Aggregation Pipeline

```javascript
// Complex analytics query
const salesReport = await Order.aggregate([
  // Stage 1: Match
  {
    $match: {
      outletId: mongoose.Types.ObjectId(outletId),
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  
  // Stage 2: Group by date
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
  
  // Stage 3: Sort
  {
    $sort: { '_id.date': 1 }
  },
  
  // Stage 4: Project
  {
    $project: {
      _id: 0,
      date: '$_id.date',
      totalOrders: 1,
      totalRevenue: { $round: ['$totalRevenue', 2] },
      avgOrderValue: { $round: ['$avgOrderValue', 2] }
    }
  }
]);
```

### 4. Transactions

```javascript
// Use transactions for multi-document operations
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Create order
  const order = await Order.create([orderData], { session });
  
  // 2. Update table
  await Table.findByIdAndUpdate(
    tableId,
    { status: 'occupied', currentOrder: order[0]._id },
    { session }
  );
  
  // 3. Reduce stock
  for (const item of order[0].items) {
    await Dish.findByIdAndUpdate(
      item.dishId,
      { $inc: { stock: -item.quantity } },
      { session }
    );
  }
  
  // Commit transaction
  await session.commitTransaction();
  
  return order[0];
  
} catch (error) {
  // Rollback on error
  await session.abortTransaction();
  throw error;
  
} finally {
  session.endSession();
}
```

### 5. Data Archival

```javascript
// Archive old orders (older than 2 years)
const archiveOldOrders = async () => {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  // Move to archive collection
  const oldOrders = await Order.find({
    createdAt: { $lt: twoYearsAgo },
    status: 'completed'
  });
  
  if (oldOrders.length > 0) {
    await OrderArchive.insertMany(oldOrders);
    await Order.deleteMany({
      _id: { $in: oldOrders.map(o => o._id) }
    });
  }
  
  console.log(`Archived ${oldOrders.length} orders`);
};

// Run monthly
schedule.scheduleJob('0 0 1 * *', archiveOldOrders);
```

