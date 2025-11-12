# Customer Module - Production Deployment Checklist

## ✅ Code Quality
- [x] No syntax errors
- [x] No linting errors
- [x] All validations in place
- [x] Error handling implemented
- [x] Input sanitization enabled

## 🚨 CRITICAL - Must Fix Before Production

### 1. OTP Storage (Redis Integration)
**Status**: ⚠️ BLOCKING
**File**: `src/modules/customer/customerAuthService.js`
**Current**: Using in-memory Map (data lost on restart)
**Required**: Implement Redis storage

```javascript
// Replace otpStore Map with Redis
const redis = require('../../config/redis');

// Store OTP
await redis.setex(`otp:${phone}`, 600, JSON.stringify({
  otp,
  customerId,
  expiresAt: Date.now() + 600000
}));

// Retrieve OTP
const otpData = await redis.get(`otp:${phone}`);
```

### 2. Cart Storage (Redis Integration)
**Status**: ⚠️ BLOCKING
**File**: `src/modules/customer/customerOrderService.js`
**Current**: Using in-memory Map (data lost on restart)
**Required**: Implement Redis storage with 24-hour expiry

```javascript
// Replace cartStore Map with Redis
const redis = require('../../config/redis');

// Store cart
await redis.setex(`cart:${customerId}`, 86400, JSON.stringify(cart));

// Retrieve cart
const cartData = await redis.get(`cart:${customerId}`);
const cart = cartData ? JSON.parse(cartData) : { items: [], total: 0 };
```

### 3. SMS Provider Integration
**Status**: ⚠️ BLOCKING
**File**: `src/modules/customer/customerAuthService.js`
**Current**: Console.log only (no real SMS sent)
**Required**: Integrate with SMS provider

**Recommended Providers**:
- **Twilio** (International): https://www.twilio.com/docs/sms
- **MSG91** (India): https://msg91.com/
- **AWS SNS**: https://aws.amazon.com/sns/
- **Gupshup** (India): https://www.gupshup.io/

```javascript
// Example with Twilio
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (phone, otp) => {
  await client.messages.create({
    body: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};
```

## ⚠️ HIGH PRIORITY - Recommended Before Production

### 4. Rate Limiting for OTP Endpoints
**Status**: ⚠️ RECOMMENDED
**Required**: Prevent OTP spam/abuse

```javascript
// Add to customerRoutes.js
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: 'Too many OTP requests, please try again later'
});

router.post('/auth/login', otpLimiter, ...);
router.post('/auth/register', otpLimiter, ...);
```

### 5. Payment Gateway Integration
**Status**: ⚠️ RECOMMENDED
**File**: `src/modules/customer/customerOrderService.js`
**Current**: Only accepts payment method, doesn't process payment
**Required**: Integrate Razorpay/Stripe for online payments

```javascript
// For non-cash payments, process payment before creating order
if (paymentMethod !== 'cash') {
  const paymentResult = await processPayment({
    amount: total,
    method: paymentMethod,
    customerId
  });
  
  if (!paymentResult.success) {
    throw new ValidationError('Payment failed');
  }
}
```

### 6. Order Notifications
**Status**: ⚠️ RECOMMENDED
**Required**: Notify restaurant when customer places order

```javascript
// Add real-time notification
const notificationService = require('../notification/notificationService');

await notificationService.sendNotification({
  type: 'new_order',
  recipientRole: 'manager',
  outletId,
  data: { orderId: order._id }
});
```

### 7. Delivery Address Validation
**Status**: ⚠️ RECOMMENDED
**File**: `src/modules/customer/customerValidation.js`
**Required**: Make deliveryAddress required when orderType is 'delivery'

```javascript
const placeOrder = Joi.object({
  outletId: Joi.string().required(),
  orderType: Joi.string().valid('dine-in', 'takeaway', 'delivery').required(),
  tableId: Joi.when('orderType', {
    is: 'dine-in',
    then: Joi.string().required(),
    otherwise: Joi.string()
  }),
  deliveryAddress: Joi.when('orderType', {
    is: 'delivery',
    then: Joi.object({
      address: Joi.string().required(),
      landmark: Joi.string(),
      city: Joi.string().required(),
      pincode: Joi.string().required()
    }).required(),
    otherwise: Joi.object()
  }),
  paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'wallet').required()
});
```

## 📋 MEDIUM PRIORITY - Nice to Have

### 8. Cart Expiry
- Implement automatic cart cleanup after 24 hours
- Show cart expiry time to users

### 9. OTP Retry Limits
- Limit OTP resend to 3 attempts per hour
- Implement cooldown period between requests

### 10. Enhanced Error Logging
- Add structured logging for all customer actions
- Track failed login attempts
- Monitor cart abandonment rates

### 11. Customer Analytics
- Track customer behavior (views, cart additions, purchases)
- Implement conversion funnel tracking

### 12. Order Cancellation Refunds
- Implement automatic refund processing for cancelled orders
- Add refund status tracking

## 🔒 Security Checklist

- [x] JWT tokens with expiry (7 days)
- [x] OTP expiry (10 minutes)
- [x] Input validation on all endpoints
- [x] SQL injection prevention (Mongoose)
- [x] XSS prevention (sanitization middleware)
- [ ] Rate limiting on auth endpoints (TODO)
- [ ] HTTPS only in production (configure in deployment)
- [ ] Secure cookie settings (if using cookies)

## 🧪 Testing Checklist

### Manual Testing Required:
- [ ] Register new customer
- [ ] Login with OTP
- [ ] Browse menu
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] Place order (all order types)
- [ ] View order history
- [ ] Cancel order
- [ ] Update profile

### Load Testing:
- [ ] Test concurrent OTP requests
- [ ] Test concurrent cart operations
- [ ] Test order placement under load

## 📊 Monitoring Setup

### Metrics to Track:
- OTP success/failure rates
- Cart abandonment rate
- Order placement success rate
- Average order value
- Customer registration rate
- API response times

### Alerts to Configure:
- High OTP failure rate
- Payment processing failures
- Order creation failures
- API error rate spikes

## 🚀 Deployment Steps

1. **Environment Variables**
   ```env
   # Add to .env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_phone_number
   REDIS_URL=your_redis_url
   ```

2. **Redis Setup**
   - Ensure Redis is running and accessible
   - Configure Redis connection in `src/config/redis.js`
   - Test Redis connectivity

3. **SMS Provider Setup**
   - Create account with chosen SMS provider
   - Get API credentials
   - Test SMS sending in staging environment

4. **Database Migration**
   - Customer model has new fields (`isVerified`, `addresses`)
   - Existing customers will have default values
   - No migration script needed (Mongoose handles it)

5. **Rate Limiting**
   - Configure rate limits based on expected traffic
   - Test rate limiting in staging

6. **Monitoring**
   - Set up application monitoring (New Relic, DataDog, etc.)
   - Configure error tracking (Sentry, Rollbar, etc.)
   - Set up log aggregation (CloudWatch, ELK, etc.)

## ✅ Final Checklist Before Go-Live

- [ ] All CRITICAL issues fixed
- [ ] Redis integrated and tested
- [ ] SMS provider integrated and tested
- [ ] Rate limiting configured
- [ ] Payment gateway integrated (if applicable)
- [ ] All manual tests passed
- [ ] Load testing completed
- [ ] Monitoring and alerts configured
- [ ] Error tracking enabled
- [ ] Backup and recovery plan in place
- [ ] Rollback plan documented
- [ ] Team trained on new features
- [ ] Documentation updated

## 📞 Support Contacts

- **SMS Provider Support**: [Add contact]
- **Payment Gateway Support**: [Add contact]
- **Redis/Infrastructure**: [Add contact]
- **On-Call Engineer**: [Add contact]

---

**Last Updated**: 2025-11-06
**Reviewed By**: [Your Name]
**Status**: ⚠️ NOT READY FOR PRODUCTION - Critical issues must be fixed first
