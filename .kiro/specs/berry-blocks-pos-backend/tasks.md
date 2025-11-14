# Implementation Plan

- [x] 1. Project setup and core infrastructure



  - Initialize Node.js project with package.json
  - Set up folder structure following modular architecture
  - Configure environment variables and configuration files
  - Set up MongoDB connection with Mongoose
  - Set up Redis connection for caching and queues
  - Configure Winston logger with daily rotation
  - Set up Express server with basic middleware
  - _Requirements: 1, 25, 26, 30_

- [x] 2. Implement shared utilities and middleware



  - [x] 2.1 Create error handling utilities


    - Implement custom error classes (AppError, ValidationError, AuthenticationError, etc.)
    - Create global error handler middleware
    - Implement response formatter utility
    - _Requirements: 26_
  
  - [x] 2.2 Create authentication middleware


    - Implement JWT service for token generation and validation
    - Create authMiddleware for JWT validation
    - Implement rate limiting middleware
    - _Requirements: 25, 30_
  
  - [x] 2.3 Create tenant middleware


    - Implement tenantMiddleware for tenant context injection
    - Create tenant isolation utilities
    - _Requirements: 1_
  
  - [x] 2.4 Create RBAC middleware


    - Implement role-based access control middleware
    - Define permission matrix for different roles
    - _Requirements: 15, 25_
  
  - [x] 2.5 Create validation middleware


    - Set up Joi validation middleware
    - Create common validation schemas
    - _Requirements: 26_

- [x] 3. Implement database models



  - [x] 3.1 Create Tenant model


    - Define Tenant schema with hierarchy support
    - Add indexes for performance
    - Implement soft delete functionality
    - _Requirements: 1_
  
  - [x] 3.2 Create User model


    - Define User schema with role and tenant reference
    - Implement password hashing with bcrypt
    - Add 2FA fields
    - _Requirements: 15, 25_
  
  - [x] 3.3 Create Customer model


    - Define Customer schema with taste profile
    - Add loyalty points tracking
    - Implement customer segmentation fields
    - _Requirements: 7, 8_
  
  - [x] 3.4 Create Dish model


    - Define Dish schema with AI-generated fields
    - Add dietary tags and allergen fields
    - Implement stock tracking
    - Add portion sizes support
    - _Requirements: 2, 3_
  
  - [x] 3.5 Create Category model


    - Define Category schema with kitchen section mapping
    - Add display order field
    - _Requirements: 2_
  
  - [x] 3.6 Create Order model


    - Define Order schema with items array
    - Add multi-channel source tracking
    - Implement order status workflow
    - _Requirements: 4, 5_
  
  - [x] 3.7 Create KOT model


    - Define KOT schema with kitchen section routing
    - Add status tracking fields
    - _Requirements: 13_
  
  - [x] 3.8 Create Payment model


    - Define Payment schema with multiple payment methods
    - Add split payment support
    - _Requirements: 10_
  
  - [x] 3.9 Create additional models


    - Create Table model with QR code support
    - Create Reservation model with pre-order support
    - Create Coupon model with validation rules
    - Create Feedback model with sentiment field
    - Create LoyaltyTransaction model
    - Create ValetRequest model
    - Create StaffPerformance model
    - Create Campaign model
    - Create SyncQueue model
    - Create AuditLog model
    - Create SupportTicket model
    - Create Subscription model
    - _Requirements: 8, 9, 11, 12, 14, 19, 28, 29, 23, 24, 21_

- [x] 4. Implement Authentication module



  - [x] 4.1 Create auth service


    - Implement user registration logic
    - Implement login with JWT generation
    - Implement password reset flow
    - Implement 2FA enable/verify logic
    - Implement refresh token logic
    - _Requirements: 25_
  
  - [x] 4.2 Create auth controller and routes


    - Implement POST /api/v1/auth/register endpoint
    - Implement POST /api/v1/auth/login endpoint
    - Implement POST /api/v1/auth/logout endpoint
    - Implement POST /api/v1/auth/refresh-token endpoint
    - Implement POST /api/v1/auth/forgot-password endpoint
    - Implement POST /api/v1/auth/reset-password endpoint
    - Implement POST /api/v1/auth/enable-2fa endpoint
    - Implement POST /api/v1/auth/verify-2fa endpoint
    - Add Joi validation schemas for all endpoints
    - _Requirements: 25_

- [x] 5. Implement Tenant module



  - [x] 5.1 Create tenant service


    - Implement tenant creation with hierarchy support
    - Implement tenant update and soft delete
    - Implement hierarchy management (company → brand → outlet)
    - _Requirements: 1_
  
  - [x] 5.2 Create tenant controller and routes


    - Implement POST /api/v1/tenants endpoint
    - Implement GET /api/v1/tenants/:id endpoint
    - Implement PUT /api/v1/tenants/:id endpoint
    - Implement DELETE /api/v1/tenants/:id endpoint
    - Implement GET /api/v1/tenants/:id/hierarchy endpoint
    - Implement POST /api/v1/tenants/:id/outlets endpoint
    - Add validation and RBAC middleware
    - _Requirements: 1_

- [x] 6. Implement Menu module



  - [x] 6.1 Create dish service


    - Implement dish CRUD operations with tenant isolation
    - Implement stock management logic
    - Implement dish search with filters
    - Implement availability tracking
    - _Requirements: 2, 6, 12_
  
  - [x] 6.2 Create category service


    - Implement category CRUD operations
    - Implement kitchen section mapping
    - _Requirements: 2_
  
  - [x] 6.3 Create menu controller and routes


    - Implement POST /api/v1/dishes endpoint
    - Implement GET /api/v1/dishes endpoint with pagination
    - Implement GET /api/v1/dishes/:id endpoint
    - Implement PUT /api/v1/dishes/:id endpoint
    - Implement DELETE /api/v1/dishes/:id endpoint
    - Implement PATCH /api/v1/dishes/:id/stock endpoint
    - Implement GET /api/v1/dishes/search endpoint with filters
    - Implement POST /api/v1/categories endpoint
    - Implement GET /api/v1/categories endpoint
    - Add validation schemas
    - _Requirements: 2, 6, 12_

- [x] 7. Implement AI module



  - [x] 7.1 Create AI service


    - Implement OpenAI integration for dish description generation
    - Implement nutrition analysis logic
    - Implement taste factor analysis
    - Implement allergen detection from ingredients
    - _Requirements: 3_
  
  - [x] 7.2 Create recommendation service


    - Implement customer taste profile generation
    - Implement personalized recommendation algorithm
    - Implement dish highlighting logic (Most Ordered, Chef's Special, etc.)
    - _Requirements: 7_
  
  - [x] 7.3 Create AI controller and routes


    - Implement POST /api/v1/ai/generate-dish-profile endpoint
    - Implement POST /api/v1/ai/analyze-nutrition endpoint
    - Implement GET /api/v1/ai/recommendations/:customerId endpoint
    - Implement POST /api/v1/ai/update-taste-profile endpoint
    - _Requirements: 3, 7_

- [x] 8. Implement Order module



  - [x] 8.1 Create order service


    - Implement order creation with validation
    - Implement order status management
    - Implement order modification logic
    - Implement multi-channel order handling
    - Implement order cancellation with reason tracking
    - _Requirements: 4, 5_
  
  - [x] 8.2 Create KOT service


    - Implement KOT generation logic
    - Implement kitchen section routing
    - Implement KOT status tracking
    - _Requirements: 13_
  
  - [x] 8.3 Create order controller and routes


    - Implement POST /api/v1/orders endpoint
    - Implement GET /api/v1/orders endpoint with pagination
    - Implement GET /api/v1/orders/:id endpoint
    - Implement PUT /api/v1/orders/:id endpoint
    - Implement DELETE /api/v1/orders/:id/items/:itemId endpoint
    - Implement PATCH /api/v1/orders/:id/status endpoint
    - Implement POST /api/v1/orders/:id/kot endpoint
    - Implement GET /api/v1/orders/table/:tableId endpoint
    - Implement GET /api/v1/orders/customer/:customerId endpoint
    - Add validation and stock checking
    - _Requirements: 4, 5, 13_

- [x] 9. Implement Payment module



  - [x] 9.1 Create payment service


    - Implement payment processing logic
    - Implement split payment handling
    - Implement refund processing
    - Implement receipt generation
    - _Requirements: 10_
  
  - [x] 9.2 Create payment gateway service


    - Implement Razorpay integration
    - Implement payment order creation
    - Implement payment verification
    - Implement webhook handler for payment status
    - _Requirements: 10_
  
  - [x] 9.3 Create payment controller and routes


    - Implement POST /api/v1/payments endpoint
    - Implement GET /api/v1/payments/:id endpoint
    - Implement POST /api/v1/payments/:id/refund endpoint
    - Implement GET /api/v1/payments/order/:orderId endpoint
    - Implement POST /api/v1/payments/split endpoint
    - Implement GET /api/v1/payments/:id/receipt endpoint
    - Implement POST /api/v1/integrations/razorpay/webhook endpoint
    - _Requirements: 10_

- [x] 10. Implement Loyalty module



  - [x] 10.1 Create loyalty service


    - Implement loyalty point calculation logic
    - Implement point earning on order completion
    - Implement point redemption logic
    - Implement loyalty rule management
    - Implement bonus points for feedback
    - _Requirements: 8_
  
  - [x] 10.2 Create loyalty controller and routes


    - Implement GET /api/v1/loyalty/customer/:customerId endpoint
    - Implement POST /api/v1/loyalty/earn endpoint
    - Implement POST /api/v1/loyalty/redeem endpoint
    - Implement GET /api/v1/loyalty/rules endpoint
    - Implement PUT /api/v1/loyalty/rules/:outletId endpoint
    - Implement GET /api/v1/loyalty/history/:customerId endpoint
    - _Requirements: 8_

- [x] 11. Implement Feedback module



  - [x] 11.1 Create feedback service


    - Implement feedback collection logic
    - Implement sentiment analysis
    - Implement automated response logic
    - Implement Google review redirection for positive feedback
    - Implement owner alerts for negative feedback
    - _Requirements: 9_
  
  - [x] 11.2 Create feedback controller and routes


    - Implement POST /api/v1/feedback endpoint
    - Implement GET /api/v1/feedback/:id endpoint
    - Implement GET /api/v1/feedback/order/:orderId endpoint
    - Implement POST /api/v1/feedback/:id/respond endpoint
    - Implement GET /api/v1/feedback/analytics endpoint
    - _Requirements: 9_

- [x] 12. Implement Coupon module



  - [x] 12.1 Create coupon service


    - Implement coupon creation and validation
    - Implement coupon application logic
    - Implement usage tracking and limits
    - Implement campaign linking
    - _Requirements: 11, 29_
  
  - [x] 12.2 Create coupon controller and routes


    - Implement POST /api/v1/coupons endpoint
    - Implement GET /api/v1/coupons endpoint
    - Implement GET /api/v1/coupons/:code endpoint
    - Implement PUT /api/v1/coupons/:id endpoint
    - Implement DELETE /api/v1/coupons/:id endpoint
    - Implement POST /api/v1/coupons/validate endpoint
    - Implement GET /api/v1/coupons/:id/usage endpoint
    - _Requirements: 11, 29_

- [x] 13. Implement Table module



  - [x] 13.1 Create table service


    - Implement table CRUD operations
    - Implement table status management
    - Implement table transfer logic
    - Implement table merge logic
    - Implement QR code generation
    - _Requirements: 5, 14_
  
  - [x] 13.2 Create table controller and routes


    - Implement POST /api/v1/tables endpoint
    - Implement GET /api/v1/tables endpoint
    - Implement GET /api/v1/tables/:id endpoint
    - Implement PUT /api/v1/tables/:id endpoint
    - Implement PATCH /api/v1/tables/:id/status endpoint
    - Implement POST /api/v1/tables/transfer endpoint
    - Implement POST /api/v1/tables/merge endpoint
    - Implement GET /api/v1/tables/:id/qr endpoint
    - _Requirements: 5, 14_

- [x] 14. Implement Staff module



  - [x] 14.1 Create staff service


    - Implement staff CRUD operations
    - Implement performance tracking logic
    - Implement activity logging
    - _Requirements: 15_
  
  - [x] 14.2 Create staff controller and routes


    - Implement POST /api/v1/staff endpoint
    - Implement GET /api/v1/staff endpoint
    - Implement GET /api/v1/staff/:id endpoint
    - Implement PUT /api/v1/staff/:id endpoint
    - Implement DELETE /api/v1/staff/:id endpoint
    - Implement GET /api/v1/staff/:id/performance endpoint
    - Implement GET /api/v1/staff/outlet/:outletId endpoint
    - _Requirements: 15_

- [x] 15. Implement Valet module



  - [x] 15.1 Create valet service


    - Implement valet request creation
    - Implement parking spot assignment
    - Implement status tracking workflow
    - Implement performance metrics calculation
    - _Requirements: 19_
  
  - [x] 15.2 Create valet controller and routes


    - Implement POST /api/v1/valet/requests endpoint
    - Implement GET /api/v1/valet/requests/:id endpoint
    - Implement PATCH /api/v1/valet/requests/:id/status endpoint
    - Implement GET /api/v1/valet/requests/customer/:customerId endpoint
    - Implement GET /api/v1/valet/performance endpoint
    - _Requirements: 19_

- [x] 16. Implement Reservation module



  - [x] 16.1 Create reservation service


    - Implement reservation creation with availability checking
    - Implement pre-order handling
    - Implement reminder notification scheduling
    - _Requirements: 28_
  
  - [x] 16.2 Create reservation controller and routes


    - Implement POST /api/v1/reservations endpoint
    - Implement GET /api/v1/reservations/:id endpoint
    - Implement PUT /api/v1/reservations/:id endpoint
    - Implement DELETE /api/v1/reservations/:id endpoint
    - Implement GET /api/v1/reservations/availability endpoint
    - Implement POST /api/v1/reservations/:id/pre-order endpoint
    - _Requirements: 28_

- [x] 17. Implement Analytics module



  - [x] 17.1 Create analytics service


    - Implement sales analytics aggregation
    - Implement customer analytics and segmentation
    - Implement staff performance analytics
    - Implement dish performance tracking
    - Implement campaign analytics
    - _Requirements: 18_
  
  - [x] 17.2 Create report service


    - Implement report generation logic
    - Implement Excel export functionality
    - Implement PDF export functionality
    - Implement CSV export functionality
    - _Requirements: 18_
  
  - [x] 17.3 Create analytics controller and routes


    - Implement GET /api/v1/analytics/sales endpoint
    - Implement GET /api/v1/analytics/dishes endpoint
    - Implement GET /api/v1/analytics/customers endpoint
    - Implement GET /api/v1/analytics/staff endpoint
    - Implement GET /api/v1/analytics/campaigns endpoint
    - Implement POST /api/v1/analytics/reports/export endpoint
    - _Requirements: 18_

- [ ] 18. Implement Integration module
  - [ ] 18.1 Create Swiggy integration service
    - Implement Swiggy webhook handler
    - Implement menu sync to Swiggy
    - Implement order status updates to Swiggy
    - _Requirements: 16_
  
  - [ ] 18.2 Create Zomato integration service
    - Implement Zomato webhook handler
    - Implement menu sync to Zomato
    - Implement order status updates to Zomato
    - _Requirements: 16_
  
  - [ ] 18.3 Create Tally integration service
    - Implement Tally XML export generation
    - Implement scheduled export functionality
    - _Requirements: 17_
  
  - [ ] 18.4 Create WhatsApp integration service
    - Implement WhatsApp Business API integration
    - Implement message template management
    - Implement message sending logic
    - Implement credit tracking
    - _Requirements: 9, 27_
  
  - [ ] 18.5 Create integration controller and routes
    - Implement POST /api/v1/integrations/swiggy/webhook endpoint
    - Implement POST /api/v1/integrations/zomato/webhook endpoint
    - Implement POST /api/v1/integrations/tally/export endpoint
    - Implement POST /api/v1/integrations/whatsapp/send endpoint
    - Implement GET /api/v1/integrations/status endpoint
    - _Requirements: 16, 17, 27_

- [x] 19. Implement Notification module



  - [x] 19.1 Create notification service


    - Implement notification orchestration logic
    - Implement push notification service
    - Implement SMS service
    - Implement email service
    - Implement notification template management
    - _Requirements: 22_
  
  - [x] 19.2 Create notification controller and routes


    - Implement POST /api/v1/notifications/send endpoint
    - Implement GET /api/v1/notifications/:id endpoint
    - Implement GET /api/v1/notifications/user/:userId endpoint
    - Implement POST /api/v1/notifications/templates endpoint
    - _Requirements: 22_

- [x] 20. Implement Sync module



  - [x] 20.1 Create sync service


    - Implement push sync logic (client to server)
    - Implement pull sync logic (server to client)
    - Implement conflict resolution strategies
    - Implement delta sync optimization
    - _Requirements: 21_
  
  - [x] 20.2 Create sync controller and routes


    - Implement POST /api/v1/sync/push endpoint
    - Implement POST /api/v1/sync/pull endpoint
    - Implement GET /api/v1/sync/status endpoint
    - Implement POST /api/v1/sync/resolve-conflict endpoint
    - _Requirements: 21_

- [x] 21. Implement Admin module



  - [x] 21.1 Create subscription service


    - Implement subscription management logic
    - Implement billing and invoicing
    - Implement subscription pause/resume/extend
    - _Requirements: 23_
  
  - [x] 21.2 Create ticket service


    - Implement support ticket CRUD operations
    - Implement ticket assignment and escalation
    - Implement automated notifications
    - Implement ticket feedback collection
    - _Requirements: 24_
  
  - [x] 21.3 Create feature toggle service


    - Implement feature flag management
    - Implement tenant-specific feature access
    - _Requirements: 23_
  
  - [x] 21.4 Create admin controller and routes


    - Implement GET /api/v1/admin/tenants endpoint
    - Implement GET /api/v1/admin/subscriptions endpoint
    - Implement POST /api/v1/admin/tickets endpoint
    - Implement GET /api/v1/admin/tickets/:id endpoint
    - Implement PATCH /api/v1/admin/tickets/:id/status endpoint
    - Implement GET /api/v1/admin/analytics endpoint
    - Implement POST /api/v1/admin/feature-toggles endpoint
    - _Requirements: 23, 24_

- [ ] 22. Implement background workers
  - [ ] 22.1 Set up Bull queue infrastructure
    - Configure Bull queues for different job types
    - Set up queue monitoring and retry logic
    - _Requirements: 21, 27_
  
  - [ ] 22.2 Create sync worker
    - Implement background sync processing
    - Implement conflict resolution worker
    - _Requirements: 21_
  
  - [ ] 22.3 Create notification worker
    - Implement WhatsApp message sending worker
    - Implement SMS sending worker
    - Implement email sending worker
    - Implement push notification worker
    - _Requirements: 22, 27_
  
  - [ ] 22.4 Create analytics worker
    - Implement daily analytics aggregation worker
    - Implement performance metrics calculation worker
    - _Requirements: 18_
  
  - [ ] 22.5 Create AI processing worker
    - Implement dish profiling worker
    - Implement taste profile update worker
    - _Requirements: 3, 7_
  
  - [ ] 22.6 Create integration worker
    - Implement Swiggy/Zomato sync worker
    - Implement Tally export worker
    - _Requirements: 16, 17_

- [x] 23. Implement caching layer



  - [x] 23.1 Create cache service


    - Implement Redis cache wrapper
    - Implement cache-aside pattern
    - Implement cache invalidation logic
    - _Requirements: 30_
  
  - [x] 23.2 Add caching to frequently accessed endpoints


    - Add caching to menu endpoints
    - Add caching to dish endpoints
    - Add caching to category endpoints
    - Add caching to tenant endpoints
    - _Requirements: 30_

- [ ] 24. Implement real-time features
  - [ ] 24.1 Set up Socket.io
    - Configure Socket.io server
    - Implement authentication for socket connections
    - Implement room-based communication
    - _Requirements: 13, 22_
  
  - [ ] 24.2 Implement real-time order updates
    - Emit order status changes to connected clients
    - Emit KOT status updates to kitchen displays
    - _Requirements: 4, 13_
  
  - [ ] 24.3 Implement real-time notifications
    - Emit notifications to owner app
    - Emit table status updates to captain app
    - _Requirements: 22_

- [x] 25. Implement audit logging



  - [x] 25.1 Create audit service


    - Implement audit log creation logic
    - Implement audit log querying
    - _Requirements: 26_
  
  - [x] 25.2 Add audit logging to critical operations


    - Add audit logs for data modifications
    - Add audit logs for authentication events
    - Add audit logs for permission changes
    - _Requirements: 26_

- [x] 26. Set up API documentation



  - [x] 26.1 Configure Swagger


    - Set up swagger-jsdoc and swagger-ui-express
    - Configure Swagger definition
    - _Requirements: All_
  
  - [x] 26.2 Document all API endpoints


    - Add JSDoc comments to all route handlers
    - Document request/response schemas
    - Add example requests and responses
    - _Requirements: All_

- [x] 27. Implement security hardening



  - [x] 27.1 Add security middleware


    - Implement helmet for security headers
    - Implement CORS configuration
    - Implement request sanitization
    - _Requirements: 26_
  
  - [x] 27.2 Implement input validation


    - Add Joi validation to all endpoints
    - Implement file upload validation
    - _Requirements: 26_
  
  - [x] 27.3 Implement rate limiting


    - Add rate limiting to authentication endpoints
    - Add rate limiting to general API endpoints
    - Add rate limiting to admin endpoints
    - _Requirements: 30_

- [ ] 28. Set up deployment configuration
  - [ ] 28.1 Create Docker configuration
    - Create Dockerfile for API server
    - Create docker-compose.yml for local development
    - _Requirements: All_
  
  - [ ] 28.2 Create PM2 configuration
    - Create ecosystem.config.js for production deployment
    - Configure cluster mode for API servers
    - Configure worker processes
    - _Requirements: All_
  
  - [ ] 28.3 Create environment configuration
    - Create .env.example file
    - Document all environment variables
    - _Requirements: All_

- [x] 30. Implement Customer Self-Service Module



  - [x] 30.1 Create customer authentication service


    - Implement customer registration (phone/email)
    - Implement OTP-based login
    - Implement customer profile management
    - _Requirements: 5, 25_
  
  - [x] 30.2 Create customer ordering service


    - Implement browse menu with filters
    - Implement cart management (add, update, remove items)
    - Implement order placement
    - Implement order tracking
    - Implement order history
    - _Requirements: 4, 5, 6_
  
  - [x] 30.3 Create customer controller and routes


    - Implement POST /api/v1/customer/auth/register endpoint
    - Implement POST /api/v1/customer/auth/login endpoint
    - Implement POST /api/v1/customer/auth/verify-otp endpoint
    - Implement GET /api/v1/customer/profile endpoint
    - Implement PUT /api/v1/customer/profile endpoint
    - Implement GET /api/v1/customer/menu endpoint
    - Implement POST /api/v1/customer/cart endpoint
    - Implement GET /api/v1/customer/cart endpoint
    - Implement PUT /api/v1/customer/cart/:itemId endpoint
    - Implement DELETE /api/v1/customer/cart/:itemId endpoint
    - Implement POST /api/v1/customer/orders endpoint
    - Implement GET /api/v1/customer/orders endpoint
    - Implement GET /api/v1/customer/orders/:id endpoint
    - Implement POST /api/v1/customer/orders/:id/cancel endpoint
    - _Requirements: 4, 5, 6, 7, 8_

- [x] 29. Wire everything together



  - [x] 29.1 Create main application file


    - Set up Express app with all middleware
    - Register all routes
    - Set up error handling
    - Set up graceful shutdown
    - _Requirements: All_
  
  - [x] 29.2 Create server entry point


    - Initialize database connections
    - Initialize Redis connections
    - Start Express server
    - Start background workers
    - _Requirements: All_
  
  - [x] 29.3 Create health check endpoint


    - Implement health check for MongoDB
    - Implement health check for Redis
    - Implement health check for external services
    - _Requirements: 30_

- [x] 31. Inventory Management System (Phase 2)

  - [x] 31.1 Create inventory models

    - Create InventoryItem model (raw materials/ingredients)
    - Create Recipe model (links dishes to inventory items with quantities)
    - Create Supplier model (vendor management)
    - Create PurchaseOrder model (ordering from suppliers)
    - Create StockMovement model (track all inventory changes)
    - Create StockAdjustment model (wastage, damage, theft)
    - _Requirements: Inventory Management_

  - [x] 31.2 Create inventory module

    - Implement CRUD operations for inventory items
    - Implement stock level tracking
    - Implement low stock alerts
    - Implement inventory valuation
    - Implement stock movement history
    - _Requirements: Inventory Management_

  - [x] 31.3 Create recipe management module

    - Implement recipe creation and management
    - Link dishes to inventory items with quantities
    - Implement automatic inventory deduction on order
    - Calculate cost of goods sold (COGS)
    - Implement recipe costing
    - _Requirements: Recipe Management_

  - [x] 31.4 Create supplier management module

    - Implement supplier CRUD operations
    - Manage supplier contact information
    - Track supplier performance
    - Manage supplier pricing
    - _Requirements: Supplier Management_

  - [x] 31.5 Create purchase order module

    - Create purchase orders
    - Send orders to suppliers
    - Receive goods and update inventory
    - Track purchase costs
    - Implement PO approval workflow
    - _Requirements: Purchase Management_

  - [x] 31.6 Create inventory reports

    - Current stock levels report
    - Stock movement history
    - Low stock alerts
    - Inventory valuation report
    - Wastage and adjustment reports
    - Cost analysis reports
    - Supplier performance reports
    - _Requirements: Inventory Reporting_

  - [x] 31.7 Create inventory controller and routes

    - Implement POST /api/v1/inventory/items endpoint
    - Implement GET /api/v1/inventory/items endpoint
    - Implement PUT /api/v1/inventory/items/:id endpoint
    - Implement DELETE /api/v1/inventory/items/:id endpoint
    - Implement POST /api/v1/inventory/recipes endpoint
    - Implement GET /api/v1/inventory/recipes endpoint
    - Implement POST /api/v1/inventory/suppliers endpoint
    - Implement GET /api/v1/inventory/suppliers endpoint
    - Implement POST /api/v1/inventory/purchase-orders endpoint
    - Implement GET /api/v1/inventory/purchase-orders endpoint
    - Implement POST /api/v1/inventory/adjustments endpoint
    - Implement GET /api/v1/inventory/reports endpoint
    - _Requirements: Inventory Management_
