# Berry & Blocks POS - Features Deep Dive

## Table of Contents

1. [Valet Service](#valet-service)
2. [Notification System](#notification-system)
3. [Offline Sync](#offline-sync)
4. [Feedback System](#feedback-system)
5. [Staff Management](#staff-management)
6. [Admin Panel](#admin-panel)
7. [Audit Logging](#audit-logging)
8. [Security Features](#security-features)

---

## Valet Service

**Location**: `src/modules/valet/`

### How It Works

```
Customer Arrives → Park Request → Valet Parks → Token Given
                                                      ↓
Customer Leaves ← Vehicle Retrieved ← Retrieve Request
```

### Implementation

```javascript
// valetService.js
async createValetRequest(data) {
  const { customerId, outletId, vehicleNumber, vehicleType, requestType } = data;
  
  // 1. Generate token
  const token = await this.generateValetToken();
  
  // 2. Create request
  const request = await ValetRequest.create({
    customerId,
    outletId,
    vehicleNumber,
    vehicleType,
    requestType, // 'park' or 'retrieve'
    token,
    status: 'pending',
    requestTime: new Date()
  });
  
  // 3. Notify valet staff
  socketService.emitToValetStaff(outletId, 'new-valet-request', request);
  
  // 4. Send SMS to customer with token
  await smsService.send(
    customer.phone,
    `Your valet token: ${token}. Show this when retrieving your vehicle.`
  );
  
  return request;
}

async updateValetStatus(requestId, status, valetStaffId) {
  const request = await ValetRequest.findById(requestId);
  
  const statusFlow = {
    'pending': ['assigned'],
    'assigned': ['parked', 'retrieving'],
    'parked': ['retrieving'],
    'retrieving': ['completed']
  };
  
  // Validate status transition
  if (!statusFlow[request.status].includes(status)) {
    throw new Error('Invalid status transition');
  }
  
  // Update status
  request.status = status;
  request.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: valetStaffId
  });
  
  // Track timing
  if (status === 'parked') {
    request.parkTime = new Date();
    request.parkDuration = request.parkTime - request.requestTime;
  }
  
  if (status === 'completed') {
    request.completionTime = new Date();
    request.totalDuration = request.completionTime - request.requestTime;
  }
  
  await request.save();
  
  // Notify customer
  socketService.emitToCustomer(request.customerId, 'valet-status-update', {
    status,
    message: this.getStatusMessage(status)
  });
  
  return request;
}
```

### Performance Tracking

```javascript
async getValetPerformance(outletId, startDate, endDate) {
  const requests = await ValetRequest.find({
    outletId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'completed'
  });
  
  const stats = {
    totalRequests: requests.length,
    avgParkTime: this.calculateAverage(requests, 'parkDuration'),
    avgRetrieveTime: this.calculateAverage(requests, 'retrieveDuration'),
    avgTotalTime: this.calculateAverage(requests, 'totalDuration'),
    peakHours: this.analyzePeakHours(requests),
    staffPerformance: this.analyzeStaffPerformance(requests)
  };
  
  return stats;
}
```

---

## Notification System

**Location**: `src/modules/notification/`, `src/services/`

### Multi-Channel Notifications

```javascript
// Supported channels
const CHANNELS = {
  PUSH: 'push',      // Mobile push notifications
  SMS: 'sms',        // Text messages
  EMAIL: 'email',    // Email
  IN_APP: 'in_app',  // In-app notifications
  SOCKET: 'socket'   // Real-time via Socket.io
};
```

### Notification Flow

```javascript
// notificationService.js
async sendNotification(data) {
  const { userId, type, title, message, channels, data: metadata } = data;
  
  // 1. Create notification record
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data: metadata,
    channels,
    status: 'pending'
  });
  
  // 2. Send via each channel
  const results = await Promise.allSettled(
    channels.map(channel => this.sendViaChannel(channel, notification))
  );
  
  // 3. Update status
  notification.status = results.every(r => r.status === 'fulfilled') 
    ? 'sent' 
    : 'partial';
  notification.sentAt = new Date();
  await notification.save();
  
  return notification;
}

async sendViaChannel(channel, notification) {
  switch (channel) {
    case 'push':
      return await this.sendPushNotification(notification);
    
    case 'sms':
      return await smsService.send(
        notification.user.phone,
        notification.message
      );
    
    case 'email':
      return await emailService.send({
        to: notification.user.email,
        subject: notification.title,
        body: notification.message
      });
    
    case 'socket':
      return socketService.emitToUser(
        notification.userId,
        'notification',
        notification
      );
    
    case 'in_app':
      // Already stored in DB, just mark as delivered
      return true;
  }
}
```

### Template System

```javascript
// templateService.js
async renderTemplate(templateId, variables) {
  const template = await NotificationTemplate.findById(templateId);
  
  // Replace variables in template
  let subject = template.subject;
  let body = template.body;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });
  
  return { subject, body };
}

// Usage
const { subject, body } = await templateService.renderTemplate(
  'order_confirmation',
  {
    customerName: 'John',
    orderId: 'ORD123',
    total: '₹500'
  }
);
// Result: "Hi John, your order ORD123 for ₹500 has been confirmed"
```



---

## Offline Sync

**Location**: `src/modules/sync/`

### How Offline Sync Works

```
Device Online → Sync Data → Device Goes Offline
                                    ↓
                          Store Changes Locally
                                    ↓
                          Device Back Online
                                    ↓
                          Push Changes (Sync)
                                    ↓
                          Pull Updates (Sync)
                                    ↓
                          Resolve Conflicts
```

### Sync Architecture

```javascript
// syncService.js
async pushSync(deviceId, changes) {
  const results = [];
  
  for (const change of changes) {
    try {
      // 1. Validate change
      await this.validateChange(change);
      
      // 2. Check for conflicts
      const conflict = await this.detectConflict(change);
      
      if (conflict) {
        // Store conflict for resolution
        await SyncConflict.create({
          deviceId,
          collection: change.collection,
          documentId: change.documentId,
          localVersion: change.data,
          serverVersion: conflict.serverData,
          status: 'pending'
        });
        
        results.push({
          success: false,
          conflict: true,
          conflictId: conflict._id
        });
        continue;
      }
      
      // 3. Apply change
      await this.applyChange(change);
      
      // 4. Record sync
      await SyncLog.create({
        deviceId,
        collection: change.collection,
        operation: change.operation,
        documentId: change.documentId,
        timestamp: new Date(),
        status: 'success'
      });
      
      results.push({ success: true });
      
    } catch (error) {
      results.push({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return results;
}

async pullSync(deviceId, lastSyncTimestamp) {
  // 1. Get all changes since last sync
  const changes = await SyncLog.find({
    timestamp: { $gt: lastSyncTimestamp },
    deviceId: { $ne: deviceId } // Exclude own changes
  }).populate('documentId');
  
  // 2. Group by collection
  const groupedChanges = this.groupByCollection(changes);
  
  // 3. Get full documents
  const updates = await Promise.all(
    Object.entries(groupedChanges).map(async ([collection, ids]) => {
      const Model = mongoose.model(collection);
      const documents = await Model.find({ _id: { $in: ids } });
      return { collection, documents };
    })
  );
  
  return {
    changes: updates,
    timestamp: new Date()
  };
}
```

### Conflict Resolution

```javascript
async resolveConflict(conflictId, resolution) {
  const conflict = await SyncConflict.findById(conflictId);
  
  let finalData;
  
  switch (resolution) {
    case 'server':
      // Use server version
      finalData = conflict.serverVersion;
      break;
    
    case 'client':
      // Use client version
      finalData = conflict.localVersion;
      break;
    
    case 'merge':
      // Merge both versions
      finalData = this.mergeVersions(
        conflict.localVersion,
        conflict.serverVersion
      );
      break;
    
    case 'manual':
      // User provides merged version
      finalData = resolution.data;
      break;
  }
  
  // Apply resolution
  const Model = mongoose.model(conflict.collection);
  await Model.findByIdAndUpdate(conflict.documentId, finalData);
  
  // Mark conflict as resolved
  conflict.status = 'resolved';
  conflict.resolution = resolution;
  conflict.resolvedAt = new Date();
  await conflict.save();
  
  return finalData;
}
```

---

## Feedback System

**Location**: `src/modules/feedback/`

### Feedback Collection

```javascript
// feedbackService.js
async createFeedback(data) {
  const { orderId, customerId, rating, comment, categories } = data;
  
  // 1. Validate order
  const order = await Order.findById(orderId);
  if (order.customerId.toString() !== customerId) {
    throw new Error('Unauthorized');
  }
  
  // 2. Check if feedback already exists
  const existing = await Feedback.findOne({ orderId });
  if (existing) {
    throw new Error('Feedback already submitted');
  }
  
  // 3. Create feedback
  const feedback = await Feedback.create({
    orderId,
    customerId,
    outletId: order.outletId,
    rating,
    comment,
    categories: {
      food: categories.food || rating,
      service: categories.service || rating,
      ambiance: categories.ambiance || rating,
      value: categories.value || rating
    },
    submittedAt: new Date()
  });
  
  // 4. Update order
  await Order.findByIdAndUpdate(orderId, {
    feedbackId: feedback._id,
    feedbackRating: rating
  });
  
  // 5. Update dish ratings
  await this.updateDishRatings(order.items, rating);
  
  // 6. Notify management if low rating
  if (rating <= 2) {
    await notificationService.sendNotification({
      userId: order.outletId.managerId,
      type: 'low_rating_alert',
      title: 'Low Rating Alert',
      message: `Order ${order.orderNumber} received ${rating} stars`,
      channels: ['push', 'email']
    });
  }
  
  return feedback;
}
```

### Feedback Analytics

```javascript
async getFeedbackAnalytics(outletId, startDate, endDate) {
  const feedbacks = await Feedback.find({
    outletId,
    submittedAt: { $gte: startDate, $lte: endDate }
  });
  
  // Overall metrics
  const totalFeedbacks = feedbacks.length;
  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;
  
  // Rating distribution
  const distribution = {
    5: feedbacks.filter(f => f.rating === 5).length,
    4: feedbacks.filter(f => f.rating === 4).length,
    3: feedbacks.filter(f => f.rating === 3).length,
    2: feedbacks.filter(f => f.rating === 2).length,
    1: feedbacks.filter(f => f.rating === 1).length
  };
  
  // Category averages
  const categoryAvg = {
    food: this.calculateCategoryAvg(feedbacks, 'food'),
    service: this.calculateCategoryAvg(feedbacks, 'service'),
    ambiance: this.calculateCategoryAvg(feedbacks, 'ambiance'),
    value: this.calculateCategoryAvg(feedbacks, 'value')
  };
  
  // Sentiment analysis
  const sentiments = await this.analyzeSentiments(feedbacks);
  
  // Common issues
  const issues = await this.extractCommonIssues(feedbacks);
  
  return {
    summary: {
      totalFeedbacks,
      avgRating,
      distribution
    },
    categories: categoryAvg,
    sentiments,
    issues
  };
}
```

---

## Staff Management

**Location**: `src/modules/staff/`

### Staff Hierarchy

```
Admin
  ├── Manager
  │   ├── Captain
  │   │   ├── Waiter
  │   │   └── Cashier
  │   └── Kitchen Manager
  │       ├── Chef
  │       └── Kitchen Staff
  └── Valet Manager
      └── Valet Staff
```

### Staff Performance Tracking

```javascript
// staffService.js
async getStaffPerformance(staffId, startDate, endDate) {
  const staff = await Staff.findById(staffId).populate('userId');
  
  // 1. Orders handled
  const orders = await Order.find({
    assignedTo: staffId,
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // 2. Calculate metrics
  const metrics = {
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.reduce((sum, o) => sum + o.total, 0) / orders.length,
    
    // Service time
    avgServiceTime: this.calculateAvgServiceTime(orders),
    
    // Customer satisfaction
    avgRating: await this.getStaffRating(staffId, startDate, endDate),
    
    // Efficiency
    ordersPerHour: this.calculateOrdersPerHour(orders, staff.workingHours),
    
    // Upselling
    upsellRate: this.calculateUpsellRate(orders)
  };
  
  // 3. Attendance
  const attendance = await Attendance.find({
    staffId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  metrics.attendance = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length
  };
  
  // 4. Feedback
  const feedback = await Feedback.find({
    'staffMentioned': staffId,
    submittedAt: { $gte: startDate, $lte: endDate }
  });
  
  metrics.feedback = {
    positive: feedback.filter(f => f.rating >= 4).length,
    negative: feedback.filter(f => f.rating <= 2).length,
    comments: feedback.map(f => f.comment)
  };
  
  return metrics;
}
```

### Shift Management

```javascript
async assignShift(staffId, shiftData) {
  const { date, startTime, endTime, role } = shiftData;
  
  // 1. Check availability
  const existingShift = await Shift.findOne({
    staffId,
    date,
    status: 'active'
  });
  
  if (existingShift) {
    throw new Error('Staff already has a shift on this date');
  }
  
  // 2. Check outlet capacity
  const outletShifts = await Shift.find({
    outletId: staff.outletId,
    date,
    startTime: { $lte: endTime },
    endTime: { $gte: startTime }
  });
  
  const requiredStaff = await this.getRequiredStaff(date, startTime);
  if (outletShifts.length >= requiredStaff) {
    throw new Error('Shift capacity reached');
  }
  
  // 3. Create shift
  const shift = await Shift.create({
    staffId,
    outletId: staff.outletId,
    date,
    startTime,
    endTime,
    role,
    status: 'scheduled'
  });
  
  // 4. Notify staff
  await notificationService.sendNotification({
    userId: staff.userId,
    type: 'shift_assigned',
    title: 'New Shift Assigned',
    message: `You have been assigned a ${role} shift on ${date}`,
    channels: ['push', 'sms']
  });
  
  return shift;
}
```



---

## Admin Panel

**Location**: `src/modules/admin/`

### Subscription Management

```javascript
// subscriptionService.js
async createSubscription(data) {
  const { tenantId, plan, billingCycle, startDate } = data;
  
  // 1. Get plan details
  const planDetails = this.getPlanDetails(plan);
  
  // 2. Calculate pricing
  const pricing = this.calculatePricing(planDetails, billingCycle);
  
  // 3. Create subscription
  const subscription = await Subscription.create({
    tenantId,
    plan,
    billingCycle,
    startDate,
    nextBillingDate: this.calculateNextBilling(startDate, billingCycle),
    amount: pricing.amount,
    features: planDetails.features,
    limits: planDetails.limits,
    status: 'active'
  });
  
  // 4. Enable features for tenant
  await this.enableFeaturesForTenant(tenantId, planDetails.features);
  
  // 5. Schedule billing
  await this.scheduleBilling(subscription);
  
  return subscription;
}

getPlanDetails(plan) {
  const plans = {
    basic: {
      features: ['orders', 'menu', 'payments'],
      limits: {
        outlets: 1,
        staff: 5,
        orders: 1000
      },
      price: {
        monthly: 999,
        yearly: 9999
      }
    },
    premium: {
      features: ['orders', 'menu', 'payments', 'analytics', 'loyalty', 'reservations'],
      limits: {
        outlets: 5,
        staff: 25,
        orders: 10000
      },
      price: {
        monthly: 2999,
        yearly: 29999
      }
    },
    enterprise: {
      features: ['*'], // All features
      limits: {
        outlets: -1, // Unlimited
        staff: -1,
        orders: -1
      },
      price: {
        monthly: 9999,
        yearly: 99999
      }
    }
  };
  
  return plans[plan];
}
```

### Feature Toggle System

```javascript
// featureToggleService.js
async enableFeatureForTenant(featureKey, tenantId) {
  // 1. Get feature
  const feature = await Feature.findOne({ key: featureKey });
  
  if (!feature.enabled) {
    throw new Error('Feature is globally disabled');
  }
  
  // 2. Check subscription
  const subscription = await Subscription.findOne({ 
    tenantId, 
    status: 'active' 
  });
  
  if (!subscription.features.includes(featureKey)) {
    throw new Error('Feature not included in subscription plan');
  }
  
  // 3. Enable for tenant
  await TenantFeature.findOneAndUpdate(
    { tenantId, featureKey },
    { enabled: true, enabledAt: new Date() },
    { upsert: true }
  );
  
  // 4. Log change
  await AuditLog.create({
    action: 'feature_enabled',
    resource: 'feature',
    resourceId: feature._id,
    tenantId,
    metadata: { featureKey }
  });
  
  return { success: true };
}

async getTenantFeatures(tenantId) {
  const subscription = await Subscription.findOne({ 
    tenantId, 
    status: 'active' 
  });
  
  const features = await Feature.find({
    key: { $in: subscription.features }
  });
  
  const tenantFeatures = await TenantFeature.find({ tenantId });
  
  return features.map(feature => ({
    ...feature.toObject(),
    enabled: tenantFeatures.find(
      tf => tf.featureKey === feature.key
    )?.enabled || false
  }));
}
```

### Support Ticket System

```javascript
// ticketService.js
async createTicket(data) {
  const { tenantId, subject, description, priority, category } = data;
  
  // 1. Generate ticket number
  const ticketNumber = await this.generateTicketNumber();
  
  // 2. Create ticket
  const ticket = await Ticket.create({
    ticketNumber,
    tenantId,
    subject,
    description,
    priority,
    category,
    status: 'open',
    createdAt: new Date()
  });
  
  // 3. Auto-assign based on category
  const assignee = await this.getAssigneeForCategory(category);
  if (assignee) {
    await this.assignTicket(ticket._id, assignee._id);
  }
  
  // 4. Notify support team
  await notificationService.sendNotification({
    userId: assignee._id,
    type: 'new_ticket',
    title: 'New Support Ticket',
    message: `${priority} priority ticket: ${subject}`,
    channels: ['push', 'email']
  });
  
  // 5. Send confirmation to tenant
  const tenant = await Tenant.findById(tenantId);
  await emailService.send({
    to: tenant.contactInfo.email,
    subject: `Ticket Created: ${ticketNumber}`,
    body: `Your support ticket has been created. We'll respond within ${this.getSLA(priority)}.`
  });
  
  return ticket;
}

async updateTicketStatus(ticketId, status, userId) {
  const ticket = await Ticket.findById(ticketId);
  
  // Status flow validation
  const validTransitions = {
    'open': ['in_progress', 'closed'],
    'in_progress': ['waiting_customer', 'resolved', 'closed'],
    'waiting_customer': ['in_progress', 'closed'],
    'resolved': ['closed', 'reopened'],
    'closed': ['reopened']
  };
  
  if (!validTransitions[ticket.status].includes(status)) {
    throw new Error('Invalid status transition');
  }
  
  // Update ticket
  ticket.status = status;
  ticket.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId
  });
  
  if (status === 'resolved') {
    ticket.resolvedAt = new Date();
    ticket.resolutionTime = ticket.resolvedAt - ticket.createdAt;
  }
  
  await ticket.save();
  
  // Notify tenant
  const tenant = await Tenant.findById(ticket.tenantId);
  await notificationService.sendNotification({
    userId: tenant.ownerId,
    type: 'ticket_update',
    title: 'Ticket Status Updated',
    message: `Ticket ${ticket.ticketNumber} is now ${status}`,
    channels: ['email']
  });
  
  return ticket;
}
```

---

## Audit Logging

**Location**: `src/modules/audit/`, `src/middleware/auditMiddleware.js`

### What Gets Logged

```javascript
const AUDITABLE_ACTIONS = {
  // Authentication
  'user.login': { level: 'info', retention: 90 },
  'user.logout': { level: 'info', retention: 90 },
  'user.failed_login': { level: 'warning', retention: 180 },
  
  // Data modifications
  'order.created': { level: 'info', retention: 365 },
  'order.updated': { level: 'info', retention: 365 },
  'order.cancelled': { level: 'warning', retention: 365 },
  
  'payment.created': { level: 'info', retention: 2555 }, // 7 years
  'payment.refunded': { level: 'warning', retention: 2555 },
  
  // Security events
  'permission.denied': { level: 'warning', retention: 180 },
  'data.exported': { level: 'warning', retention: 365 },
  
  // Admin actions
  'feature.enabled': { level: 'info', retention: 365 },
  'subscription.changed': { level: 'info', retention: 365 }
};
```

### Audit Middleware

```javascript
// auditMiddleware.js
exports.auditLog = (action) => {
  return async (req, res, next) => {
    // Store original send
    const originalSend = res.send;
    
    // Override send
    res.send = function(data) {
      // Log after response
      setImmediate(async () => {
        try {
          await AuditLog.create({
            action,
            userId: req.user?._id,
            tenantId: req.tenantId,
            resource: req.baseUrl,
            resourceId: req.params.id,
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            requestBody: this.sanitizeBody(req.body),
            responseStatus: res.statusCode,
            timestamp: new Date()
          });
        } catch (error) {
          logger.error('Audit log failed:', error);
        }
      });
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Usage in routes
router.post('/orders',
  authenticate,
  auditLog('order.created'),
  orderController.createOrder
);
```

### Audit Query & Export

```javascript
// auditController.js
async getAuditLogs(req, res) {
  const { 
    startDate, 
    endDate, 
    action, 
    userId, 
    resource 
  } = req.query;
  
  const query = {
    tenantId: req.tenantId,
    timestamp: { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    }
  };
  
  if (action) query.action = action;
  if (userId) query.userId = userId;
  if (resource) query.resource = resource;
  
  const logs = await AuditLog.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(1000);
  
  res.json({ data: logs });
}

async exportAuditLogs(req, res) {
  const logs = await this.getAuditLogs(req);
  
  // Convert to CSV
  const csv = this.convertToCSV(logs);
  
  // Log export action
  await AuditLog.create({
    action: 'data.exported',
    userId: req.user._id,
    tenantId: req.tenantId,
    resource: 'audit_logs',
    metadata: {
      recordCount: logs.length,
      dateRange: { startDate, endDate }
    }
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
  res.send(csv);
}
```

---

## Security Features

### 1. Rate Limiting

```javascript
// rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

// General API rate limit
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limit for auth endpoints
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later'
});

// Usage
router.post('/login', authLimiter, authController.login);
```

### 2. Input Sanitization

```javascript
// validationMiddleware.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Sanitize MongoDB queries
app.use(mongoSanitize());

// Sanitize XSS
app.use(xss());

// Custom validation
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    
    req.body = value;
    next();
  };
};
```

### 3. Security Headers

```javascript
// app.js
const helmet = require('helmet');
const hpp = require('hpp');

// Set security headers
app.use(helmet());

// Prevent HTTP parameter pollution
app.use(hpp());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Data Encryption

```javascript
// Encrypt sensitive data before storing
const crypto = require('crypto');

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY),
    Buffer.from(process.env.ENCRYPTION_IV)
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY),
    Buffer.from(process.env.ENCRYPTION_IV)
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage in models
userSchema.pre('save', function(next) {
  if (this.isModified('cardNumber')) {
    this.cardNumber = encrypt(this.cardNumber);
  }
  next();
});
```

### 5. Password Security

```javascript
// Password hashing with bcrypt
const bcrypt = require('bcrypt');

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Hash password with salt rounds = 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password validation
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Password strength validation
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
  });
```

