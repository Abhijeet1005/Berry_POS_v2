# Berry & Blocks POS API Documentation

## Overview

The Berry & Blocks POS API is a comprehensive RESTful API for managing restaurant operations including orders, payments, menu, staff, customers, and more.

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.berryblocks.com/api/v1
```

## Interactive Documentation

Access the interactive Swagger UI documentation at:
```
http://localhost:3000/api-docs
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of authentication:

### 1. Staff/Admin Authentication
Used for staff, managers, and admin users.

**Headers:**
```
Authorization: Bearer <jwt_token>
X-Tenant-ID: <tenant_id>
```

### 2. Customer Authentication
Used for customer self-service features.

**Headers:**
```
Authorization: Bearer <customer_jwt_token>
X-Tenant-ID: <tenant_id>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "role": "manager",
  "tenantId": "tenant_id",
  "outletId": "outlet_id"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": { ... }
  }
}
```

### Customer Self-Service

#### Register Customer
```http
POST /customer/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com"
}

Response: OTP sent to phone
```

#### Verify OTP
```http
POST /customer/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}

Response:
{
  "success": true,
  "data": {
    "token": "customer_jwt_token",
    "customer": { ... }
  }
}
```

#### Browse Menu
```http
GET /customer/menu?outletId=xxx&category=Pizza&dietaryTags=Veg

Response:
{
  "success": true,
  "data": {
    "dishes": [
      {
        "_id": "dish_id",
        "name": "Margherita Pizza",
        "price": 299,
        "category": "Pizza",
        "dietaryTags": ["Veg"],
        "isRecommended": true
      }
    ]
  }
}
```

#### Add to Cart
```http
POST /customer/cart
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "dishId": "dish_id",
  "quantity": 2,
  "specialInstructions": "Extra cheese"
}
```

#### Place Order
```http
POST /customer/orders
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "outletId": "outlet_id",
  "orderType": "dine-in",
  "tableId": "table_id",
  "paymentMethod": "upi"
}
```

### Menu Management

#### Create Dish
```http
POST /dishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic Italian pizza",
  "price": 299,
  "category": "Pizza",
  "dietaryTags": ["Veg"],
  "ingredients": ["Tomato", "Mozzarella", "Basil"],
  "preparationTime": 15,
  "outletId": "outlet_id"
}
```

#### Get All Dishes
```http
GET /dishes?page=1&limit=20&category=Pizza&dietaryTags=Veg
Authorization: Bearer <token>
```

#### Search Dishes
```http
GET /dishes/search?q=pizza&outletId=xxx
Authorization: Bearer <token>
```

### Order Management

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "outletId": "outlet_id",
  "customerId": "customer_id",
  "orderType": "dine-in",
  "tableId": "table_id",
  "items": [
    {
      "dishId": "dish_id",
      "quantity": 2,
      "specialInstructions": "Extra spicy"
    }
  ],
  "paymentMethod": "card"
}
```

#### Update Order Status
```http
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing"
}
```

#### Generate KOT
```http
POST /orders/:id/kot
Authorization: Bearer <token>
```

### Payment Processing

#### Process Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "amount": 599,
  "paymentMethod": "card",
  "paymentGateway": "razorpay"
}
```

#### Split Payment
```http
POST /payments/split
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "splits": [
    {
      "amount": 300,
      "paymentMethod": "cash"
    },
    {
      "amount": 299,
      "paymentMethod": "card"
    }
  ]
}
```

### AI Features

#### Generate Dish Profile
```http
POST /ai/generate-dish-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Butter Chicken",
  "ingredients": ["Chicken", "Butter", "Tomato", "Cream"],
  "category": "Main Course",
  "dietaryTags": ["Non-Veg"]
}

Response: AI-generated description, nutrition, taste factors
```

#### Get Recommendations
```http
GET /ai/recommendations/:customerId?outletId=xxx
Authorization: Bearer <token>

Response: Personalized dish recommendations
```

### Loyalty Program

#### Get Loyalty Balance
```http
GET /loyalty/customer/:customerId
Authorization: Bearer <token>
```

#### Earn Points
```http
POST /loyalty/earn
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer_id",
  "orderId": "order_id",
  "outletId": "outlet_id",
  "amount": 599,
  "reason": "order"
}
```

#### Redeem Points
```http
POST /loyalty/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer_id",
  "orderId": "order_id",
  "outletId": "outlet_id",
  "points": 100
}
```

### Feedback

#### Submit Feedback
```http
POST /feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "customerId": "customer_id",
  "rating": 5,
  "comment": "Excellent food and service!",
  "categories": ["food", "service"]
}
```

#### Get Feedback Analytics
```http
GET /feedback/analytics?outletId=xxx&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Coupons

#### Create Coupon
```http
POST /coupons
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "minOrderValue": 500,
  "maxDiscount": 100,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "usageLimit": 1000,
  "perUserLimit": 1
}
```

#### Validate Coupon
```http
POST /coupons/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SAVE20",
  "customerId": "customer_id",
  "outletId": "outlet_id",
  "orderTotal": 600
}
```

### Analytics

#### Get Sales Analytics
```http
GET /analytics/sales?outletId=xxx&startDate=2024-01-01&endDate=2024-12-31&groupBy=day
Authorization: Bearer <token>
```

#### Get Dish Analytics
```http
GET /analytics/dishes?outletId=xxx&limit=10
Authorization: Bearer <token>
```

#### Export Report
```http
POST /analytics/reports/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportType": "sales",
  "format": "csv",
  "outletId": "outlet_id",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Admin

#### Get All Tenants
```http
GET /admin/tenants
Authorization: Bearer <admin_token>
```

#### Create Subscription
```http
POST /admin/subscriptions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "tenantId": "tenant_id",
  "plan": "premium",
  "billingCycle": "monthly",
  "startDate": "2024-01-01"
}
```

#### Create Support Ticket
```http
POST /admin/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Payment issue",
  "description": "Unable to process payment",
  "priority": "high",
  "category": "technical"
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Admin**: 200 requests per 15 minutes
- **Payment**: 10 requests per 15 minutes

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## Webhooks

### Razorpay Payment Webhook
```http
POST /integrations/razorpay/webhook
Content-Type: application/json
X-Razorpay-Signature: <signature>

{
  "event": "payment.captured",
  "payload": { ... }
}
```

## Best Practices

1. **Always include tenant ID** in headers for multi-tenant operations
2. **Use pagination** for list endpoints to improve performance
3. **Implement retry logic** for failed requests with exponential backoff
4. **Cache frequently accessed data** like menu items
5. **Validate input** on client side before sending requests
6. **Handle errors gracefully** and show user-friendly messages
7. **Use HTTPS** in production for secure communication
8. **Store tokens securely** - never in localStorage for sensitive apps
9. **Implement token refresh** before expiration
10. **Log API errors** for debugging and monitoring

## SDKs and Libraries

Coming soon:
- JavaScript/TypeScript SDK
- React Native SDK
- Flutter SDK
- Python SDK

## Support

- **Email**: support@berryblocks.com
- **Documentation**: https://docs.berryblocks.com
- **Status Page**: https://status.berryblocks.com

## Changelog

### Version 1.0.0 (Current)
- Initial release with complete POS functionality
- Customer self-service module
- AI-powered recommendations
- Comprehensive analytics
- Multi-tenant support
