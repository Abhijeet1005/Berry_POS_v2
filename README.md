# Berry & Blocks POS Backend

## 🎉 Phase 1: Complete & Production-Ready!

A comprehensive multi-tenant restaurant management POS system backend built with Node.js, Express, and MongoDB.

**Status**: ✅ All Phase 1 features implemented | 🚀 Production-ready | 📚 Fully documented

## Features

### Core Functionality
- **Multi-Tenant Architecture** - Support for companies, brands, and outlets with complete data isolation
- **Authentication & Authorization** - JWT-based auth with 2FA, role-based access control (RBAC)
- **Menu Management** - Dishes, categories, stock tracking, dietary tags, portion sizes, **image uploads (Cloudinary)**
- **Order Management** - Multi-channel orders (dine-in, takeaway, delivery), KOT generation
- **Payment Processing** - Razorpay integration, split payments, multiple payment methods
- **Table Management** - QR code ordering, table transfer/merge, status tracking

### Advanced Features
- **AI-Powered** - Dish profiling, nutrition analysis, personalized recommendations
- **Loyalty Program** - Configurable earning/redemption rules, transaction history
- **Feedback System** - Sentiment analysis, automated responses, analytics
- **Coupon Management** - Validation, usage tracking, campaign linking
- **Staff Management** - Performance tracking, daily metrics, activity logging
- **Valet Services** - Request tracking, parking management, performance metrics
- **Reservations** - Table booking, availability checking, pre-order support
- **Analytics** - Sales, dishes, customers, staff, campaigns with export capabilities

### Platform Features
- **Notifications** - Multi-channel (Push, SMS, Email, WhatsApp) with templates
- **Offline Sync** - Push/pull sync with conflict resolution
- **Admin Panel** - Subscription management, support tickets, feature toggles
- **Caching** - Redis-based caching for performance optimization
- **Audit Logging** - Complete traceability for critical operations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Logging**: Winston with daily rotation
- **AI**: OpenAI GPT-3.5/4
- **Payments**: Razorpay
- **Image Storage**: Cloudinary (CDN + optimization)
- **File Upload**: Multer

## Prerequisites

- Node.js >= 18.x
- MongoDB >= 5.x
- Redis >= 6.x (optional - app works without it)
- npm or yarn

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Create Global Admin
```bash
npm run setup:admin
# Follow prompts to create super admin
```

### 4. Start Server
```bash
npm run dev
```

### 5. Access API Documentation
Open http://localhost:3000/api-docs

**📖 For detailed setup instructions, see [GETTING_STARTED.md](GETTING_STARTED.md)**

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd berry-blocks-pos-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB and Redis:
```bash
# MongoDB
mongod --dbpath /path/to/data

# Redis
redis-server
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

See `.env.example` for all required environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret

## API Documentation

### 🚀 Interactive Swagger UI (Recommended)
```
http://localhost:3000/api-docs
```
Complete interactive documentation with 150+ endpoints, try-it-out functionality, and real-time testing.

### Base URL
```
http://localhost:3000/api/v1
```

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with service status
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/enable-2fa` - Enable 2FA
- `POST /auth/verify-2fa` - Verify 2FA code

### Tenants
- `POST /tenants` - Create tenant
- `GET /tenants/:id` - Get tenant
- `PUT /tenants/:id` - Update tenant
- `DELETE /tenants/:id` - Delete tenant
- `GET /tenants/:id/hierarchy` - Get hierarchy
- `POST /tenants/:id/outlets` - Create outlet

### Menu
- `POST /dishes` - Create dish
- `GET /dishes` - List dishes
- `GET /dishes/:id` - Get dish
- `PUT /dishes/:id` - Update dish
- `DELETE /dishes/:id` - Delete dish
- `PATCH /dishes/:id/stock` - Update stock
- `GET /dishes/search` - Search dishes
- `POST /categories` - Create category
- `GET /categories` - List categories

### Orders
- `POST /orders` - Create order
- `GET /orders` - List orders
- `GET /orders/:id` - Get order
- `PUT /orders/:id` - Update order
- `PATCH /orders/:id/status` - Update status
- `POST /orders/:id/kot` - Generate KOT
- `GET /orders/table/:tableId` - Get table orders
- `GET /orders/customer/:customerId` - Get customer orders

### Payments
- `POST /payments` - Process payment
- `GET /payments/:id` - Get payment
- `POST /payments/:id/refund` - Refund payment
- `POST /payments/split` - Split payment
- `GET /payments/:id/receipt` - Get receipt

### AI
- `POST /ai/generate-dish-profile` - Generate dish profile
- `POST /ai/analyze-nutrition` - Analyze nutrition
- `GET /ai/recommendations/:customerId` - Get recommendations
- `POST /ai/update-taste-profile` - Update taste profile

### Loyalty
- `GET /loyalty/customer/:customerId` - Get loyalty balance
- `POST /loyalty/earn` - Earn points
- `POST /loyalty/redeem` - Redeem points
- `GET /loyalty/rules` - Get rules
- `PUT /loyalty/rules/:outletId` - Update rules
- `GET /loyalty/history/:customerId` - Get history

### Feedback
- `POST /feedback` - Submit feedback
- `GET /feedback` - List feedback
- `GET /feedback/:id` - Get feedback
- `GET /feedback/order/:orderId` - Get order feedback
- `POST /feedback/:id/respond` - Respond to feedback
- `GET /feedback/analytics` - Get analytics

### Coupons
- `POST /coupons` - Create coupon
- `GET /coupons` - List coupons
- `GET /coupons/:code` - Get coupon
- `PUT /coupons/:id` - Update coupon
- `DELETE /coupons/:id` - Delete coupon
- `POST /coupons/validate` - Validate coupon
- `GET /coupons/:id/usage` - Get usage stats

### Staff
- `POST /staff` - Create staff
- `GET /staff` - List staff
- `GET /staff/:id` - Get staff
- `PUT /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff
- `GET /staff/:id/performance` - Get performance
- `GET /staff/outlet/:outletId` - Get outlet staff

### Tables
- `POST /tables` - Create table
- `GET /tables` - List tables
- `GET /tables/:id` - Get table
- `PUT /tables/:id` - Update table
- `PATCH /tables/:id/status` - Update status
- `POST /tables/transfer` - Transfer table
- `POST /tables/merge` - Merge tables
- `GET /tables/:id/qr` - Get QR code

### Valet
- `POST /valet/requests` - Create request
- `GET /valet/requests` - List requests
- `GET /valet/requests/:id` - Get request
- `PATCH /valet/requests/:id/status` - Update status
- `GET /valet/requests/customer/:customerId` - Get customer requests
- `GET /valet/performance` - Get performance

### Reservations
- `POST /reservations` - Create reservation
- `GET /reservations` - List reservations
- `GET /reservations/:id` - Get reservation
- `PUT /reservations/:id` - Update reservation
- `DELETE /reservations/:id` - Cancel reservation
- `GET /reservations/availability` - Check availability
- `POST /reservations/:id/pre-order` - Add pre-order

### Analytics
- `GET /analytics/sales` - Sales analytics
- `GET /analytics/dishes` - Dish analytics
- `GET /analytics/customers` - Customer analytics
- `GET /analytics/staff` - Staff analytics
- `GET /analytics/campaigns` - Campaign analytics
- `POST /analytics/reports/export` - Export report

### Notifications
- `POST /notifications/send` - Send notification
- `GET /notifications/:id` - Get notification
- `GET /notifications/user/:userId` - Get user notifications
- `POST /notifications/templates` - Create template
- `GET /notifications/templates` - List templates

### Sync
- `POST /sync/push` - Push sync
- `POST /sync/pull` - Pull sync
- `GET /sync/status` - Get sync status
- `POST /sync/resolve-conflict` - Resolve conflict
- `POST /sync/retry/:syncId` - Retry sync

### Admin
- `GET /admin/tenants` - List all tenants
- `POST /admin/subscriptions` - Create subscription
- `GET /admin/subscriptions` - List subscriptions
- `GET /admin/subscriptions/:id` - Get subscription
- `PUT /admin/subscriptions/:id` - Update subscription
- `POST /admin/subscriptions/:id/pause` - Pause subscription
- `POST /admin/subscriptions/:id/resume` - Resume subscription
- `POST /admin/subscriptions/:id/cancel` - Cancel subscription
- `POST /admin/tickets` - Create ticket
- `GET /admin/tickets` - List tickets
- `GET /admin/tickets/:id` - Get ticket
- `PATCH /admin/tickets/:id/status` - Update ticket status
- `GET /admin/features` - List features
- `PUT /admin/features/:key` - Update feature
- `GET /admin/analytics` - Get admin analytics

### Audit
- `GET /audit/logs` - Get audit logs
- `GET /audit/statistics` - Get statistics
- `GET /audit/export` - Export logs

## Project Structure

```
src/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── models/          # Mongoose models
├── modules/         # Feature modules
│   ├── auth/
│   ├── tenant/
│   ├── menu/
│   ├── order/
│   ├── payment/
│   ├── staff/
│   ├── ai/
│   ├── loyalty/
│   ├── feedback/
│   ├── coupon/
│   ├── table/
│   ├── valet/
│   ├── reservation/
│   ├── analytics/
│   ├── notification/
│   ├── sync/
│   ├── admin/
│   └── audit/
├── services/        # Business logic services
├── utils/           # Utility functions
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## Security

- JWT authentication with refresh tokens
- 2FA support with TOTP
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- Helmet security headers
- CORS configuration
- Audit logging for critical operations

## Performance

- Redis caching for frequently accessed data
- Database indexing
- Query optimization
- Compression middleware
- Connection pooling

## Error Handling

- Global error handler
- Custom error classes
- Structured error responses
- Error logging with Winston

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker
```bash
# Build image
docker build -t berry-blocks-pos .

# Run container
docker run -p 3000:3000 berry-blocks-pos
```

### PM2
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

### Complete Documentation Suite

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API overview and quick reference
- **[Swagger UI](http://localhost:3000/api-docs)** - Interactive API documentation (150+ endpoints)
- **[BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)** - System architecture and design patterns
- **[BACKEND_DATABASE_SCHEMA.md](BACKEND_DATABASE_SCHEMA.md)** - Complete database schemas
- **[BACKEND_DATA_FLOW.md](BACKEND_DATA_FLOW.md)** - Data flow and processing
- **[BACKEND_FEATURES_DEEP_DIVE.md](BACKEND_FEATURES_DEEP_DIVE.md)** - Advanced features explained
- **[PAYMENT_SYSTEM_EXPLAINED.md](PAYMENT_SYSTEM_EXPLAINED.md)** - Complete payment flow guide
- **[CLOUDINARY_IMAGE_UPLOAD_GUIDE.md](CLOUDINARY_IMAGE_UPLOAD_GUIDE.md)** - Image upload implementation
- **[POSTMAN_COLLECTION_GUIDE.md](POSTMAN_COLLECTION_GUIDE.md)** - Postman testing guide
- **[SETUP_FLOW_SUMMARY.md](SETUP_FLOW_SUMMARY.md)** - Quick setup reference

### Quick Links

- 🚀 **[Swagger API Docs](http://localhost:3000/api-docs)** - Test APIs interactively
- 📦 **[Postman Collection](Berry_Blocks_POS_Complete_Collection.json)** - Import and test
- 🎯 **[Getting Started](GETTING_STARTED.md)** - Setup in 30 minutes
- 🏗️ **[Architecture Guide](BACKEND_ARCHITECTURE.md)** - Understand the system

## License

ISC

## Support

For support, email support@berryblocks.com or create an issue in the repository.
