# Requirements Document

## Introduction

The Berry & Blocks POS System is a comprehensive multi-tenant restaurant management platform that enables restaurants, brands, and multi-brand companies to manage their operations including orders, inventory, staff, customer engagement, loyalty programs, and analytics. The system supports multiple client applications (web, mobile, kiosk, captain app, owner app, valet app) and provides a centralized admin panel for platform management. The backend will be built using Node.js with JavaScript and MongoDB as the database.

## Glossary

- **POS System**: The Point of Sale backend system that manages all restaurant operations
- **Customer App**: Web and mobile applications used by restaurant customers
- **Kiosk Software**: Self-service ordering terminals in restaurants
- **Captain App**: Mobile application used by waitstaff
- **Owner App**: Mobile application for restaurant owners and managers
- **Valet App**: Mobile application for valet parking management
- **Admin Panel**: Platform management dashboard for Buzzing Software
- **KOT**: Kitchen Order Ticket - order slip sent to kitchen/bar sections
- **Multi-tenant**: Architecture supporting multiple independent restaurant organizations
- **Outlet**: A single restaurant location
- **Brand**: A restaurant chain with multiple outlets
- **Company**: An organization managing multiple brands
- **QR Code**: Quick Response code for contactless ordering
- **Loyalty Points**: Reward points earned by customers for purchases
- **Dish Profile**: AI-generated metadata including nutrition, allergens, taste factors
- **Token Slip**: Order receipt with tracking number
- **Sync Service**: Background service for data synchronization between offline and online modes

## Requirements

### Requirement 1: Multi-tenant Architecture

**User Story:** As a platform administrator, I want to support multiple independent restaurant organizations with isolated data, so that each client's data remains secure and separate.

#### Acceptance Criteria

1. THE POS System SHALL store data for each tenant in isolated collections with tenant identifiers
2. WHEN a user authenticates, THE POS System SHALL validate tenant membership and restrict data access to the user's tenant
3. THE POS System SHALL support three hierarchy levels: standalone outlet, brand with multiple outlets, and company with multiple brands
4. THE POS System SHALL prevent cross-tenant data access through API endpoints
5. WHEN a tenant is deleted, THE POS System SHALL retain data for 30 days before permanent deletion

### Requirement 2: Menu Management

**User Story:** As a restaurant manager, I want to manage my menu with detailed dish information, so that customers receive accurate and comprehensive dish details.

#### Acceptance Criteria

1. THE POS System SHALL store dish records with name, price, images, ingredients, dietary tags, and preparation time
2. WHEN a dish is created or updated, THE POS System SHALL validate required fields and data formats
3. THE POS System SHALL support dietary classification tags including Veg, Non-Veg, Vegan, Jain, and Eggetarian
4. THE POS System SHALL store allergen information for each dish
5. THE POS System SHALL support multiple portion sizes per dish with individual pricing
6. WHEN a dish stock reaches zero, THE POS System SHALL mark the dish as out-of-stock across all client applications

### Requirement 3: AI-Powered Dish Profiling

**User Story:** As a restaurant manager, I want AI to generate dish descriptions and nutritional information, so that I can provide detailed information without manual data entry.

#### Acceptance Criteria

1. WHEN a dish is created with basic information, THE POS System SHALL generate a one-line description and detailed description
2. THE POS System SHALL analyze and store nutritional information including calories, protein, carbohydrates, and fats
3. THE POS System SHALL generate taste factor analysis with ratings for spicy, sweet, tangy, salty, and bitter attributes
4. THE POS System SHALL identify and flag allergens based on ingredients
5. THE POS System SHALL store portion sharing recommendations based on dish size and type

### Requirement 4: Order Management

**User Story:** As a restaurant staff member, I want to process orders from multiple channels, so that all orders are tracked and fulfilled efficiently.

#### Acceptance Criteria

1. THE POS System SHALL accept orders from Customer App, Kiosk, Captain App, and third-party integrations
2. WHEN an order is placed, THE POS System SHALL assign a unique order identifier and timestamp
3. THE POS System SHALL support order types: dine-in, takeaway, and delivery
4. THE POS System SHALL route order items to appropriate kitchen sections based on dish category
5. WHEN an order is confirmed, THE POS System SHALL generate a KOT for each kitchen section
6. THE POS System SHALL track order status through states: pending, confirmed, preparing, ready, served, and completed
7. WHEN an order item is cancelled, THE POS System SHALL record the cancellation reason and update inventory

### Requirement 5: QR Code Ordering

**User Story:** As a customer, I want to scan a QR code to view the menu and place orders, so that I can order without waiting for staff.

#### Acceptance Criteria

1. WHEN a QR code is scanned, THE POS System SHALL identify the table and outlet
2. THE POS System SHALL return the complete menu with real-time stock availability
3. THE POS System SHALL accept orders linked to the scanned table identifier
4. THE POS System SHALL support customer requests through QR interface including call waiter, request water, and request bill
5. WHEN a customer requests payment through QR, THE POS System SHALL generate a payment link with order total

### Requirement 6: Smart Search and Filtering

**User Story:** As a customer, I want to search and filter dishes by dietary preferences and preparation time, so that I can quickly find suitable dishes.

#### Acceptance Criteria

1. THE POS System SHALL provide search functionality matching dish names with partial text input
2. THE POS System SHALL filter dishes by dietary tags: Veg, Non-Veg, Vegan, Jain, Eggetarian
3. THE POS System SHALL filter dishes by allergen exclusions
4. THE POS System SHALL filter dishes by maximum preparation time
5. THE POS System SHALL return search results sorted by relevance and availability

### Requirement 7: Customer Personalization

**User Story:** As a customer, I want personalized dish recommendations based on my order history, so that I can discover dishes matching my preferences.

#### Acceptance Criteria

1. WHEN a customer places an order, THE POS System SHALL record dish selections in the customer's order history
2. THE POS System SHALL analyze order history to generate a taste profile with preferred taste factors and dietary preferences
3. WHEN a customer views the menu, THE POS System SHALL return personalized recommendations based on taste profile
4. THE POS System SHALL highlight dishes marked as Most Ordered, Chef's Special, Staff Picks, and Seasonal Specials
5. THE POS System SHALL update taste profiles after each order completion

### Requirement 8: Loyalty Program

**User Story:** As a restaurant owner, I want to reward customers with loyalty points, so that I can encourage repeat visits.

#### Acceptance Criteria

1. THE POS System SHALL award loyalty points based on configurable earning rules per outlet
2. WHEN an order is completed, THE POS System SHALL calculate and credit loyalty points to the customer account
3. THE POS System SHALL support redemption of loyalty points with configurable point-to-currency conversion rates
4. THE POS System SHALL award bonus points when customers submit feedback
5. THE POS System SHALL track loyalty point balance, earned points, and redeemed points per customer
6. WHERE an outlet has custom loyalty rules, THE POS System SHALL apply outlet-specific rules instead of brand defaults

### Requirement 9: Feedback Collection and Management

**User Story:** As a restaurant owner, I want to collect and respond to customer feedback, so that I can improve service quality and customer satisfaction.

#### Acceptance Criteria

1. WHEN an order is completed, THE POS System SHALL send a feedback request link via WhatsApp or SMS
2. THE POS System SHALL store feedback with rating, comments, and associated order identifier
3. WHEN feedback with rating below 3 stars is received, THE POS System SHALL send an alert notification to the owner
4. WHEN feedback with rating 4 stars or above is received, THE POS System SHALL send a Google review request link to the customer
5. THE POS System SHALL support automated responses with coupon codes or loyalty points based on feedback rating
6. THE POS System SHALL provide feedback analytics including average rating, sentiment trends, and response rates

### Requirement 10: Payment Processing

**User Story:** As a cashier, I want to process payments through multiple methods, so that customers can pay using their preferred option.

#### Acceptance Criteria

1. THE POS System SHALL support payment methods: Cash, Card, UPI, Wallet, and mixed payments
2. WHEN a payment is processed, THE POS System SHALL record payment method, amount, timestamp, and transaction reference
3. THE POS System SHALL support split payments across multiple payment methods for a single order
4. THE POS System SHALL apply discounts and coupons before calculating final payment amount
5. WHEN payment is completed, THE POS System SHALL generate a receipt with itemized billing and tax breakdown
6. THE POS System SHALL track payment status: pending, completed, failed, and refunded

### Requirement 11: Coupon Management

**User Story:** As a restaurant manager, I want to create and track promotional coupons, so that I can run marketing campaigns.

#### Acceptance Criteria

1. THE POS System SHALL support coupon types: flat discount, percentage discount, and buy-one-get-one
2. WHEN a coupon is created, THE POS System SHALL validate coupon code uniqueness and store validity period
3. WHEN a coupon is applied to an order, THE POS System SHALL validate coupon eligibility and usage limits
4. THE POS System SHALL track coupon usage count and redemption history
5. THE POS System SHALL prevent coupon reuse beyond configured usage limits per customer

### Requirement 12: Inventory and Stock Management

**User Story:** As a restaurant manager, I want to track dish availability in real-time, so that customers cannot order out-of-stock items.

#### Acceptance Criteria

1. THE POS System SHALL maintain stock quantity for each dish at outlet level
2. WHEN an order is placed, THE POS System SHALL decrement stock quantity for ordered items
3. WHEN stock quantity reaches zero, THE POS System SHALL mark the dish as unavailable
4. WHEN stock is replenished, THE POS System SHALL update stock quantity and mark dish as available
5. THE POS System SHALL synchronize stock status across all client applications within 5 seconds

### Requirement 13: Kitchen Order Ticket (KOT) Management

**User Story:** As kitchen staff, I want to receive order tickets for my section, so that I can prepare dishes efficiently.

#### Acceptance Criteria

1. WHEN an order is confirmed, THE POS System SHALL generate separate KOTs for each kitchen section
2. THE POS System SHALL route dishes to sections based on dish category configuration
3. THE POS System SHALL include order identifier, table number, dish name, quantity, and special instructions on each KOT
4. THE POS System SHALL support KOT status updates: received, preparing, and ready
5. WHEN a KOT status changes to ready, THE POS System SHALL notify the captain app

### Requirement 14: Table Management

**User Story:** As a captain, I want to manage table assignments and transfers, so that I can optimize seating and service.

#### Acceptance Criteria

1. THE POS System SHALL maintain table records with table number, seating capacity, and current status
2. THE POS System SHALL support table states: available, occupied, reserved, and cleaning
3. WHEN a table is assigned to an order, THE POS System SHALL update table status to occupied
4. THE POS System SHALL support transferring orders between tables
5. THE POS System SHALL support merging multiple tables for a single order
6. WHEN an order is completed and paid, THE POS System SHALL update table status to available

### Requirement 15: Staff Management and Performance Tracking

**User Story:** As a restaurant owner, I want to track staff performance, so that I can identify top performers and training needs.

#### Acceptance Criteria

1. THE POS System SHALL store staff records with name, role, contact information, and assigned outlet
2. THE POS System SHALL support role-based access control with roles: Admin, Manager, Captain, Cashier, and Kitchen Staff
3. WHEN a staff member takes an order, THE POS System SHALL record the staff identifier with the order
4. THE POS System SHALL track staff metrics including orders taken, upselling success, and customer feedback ratings
5. THE POS System SHALL generate staff performance reports with configurable date ranges

### Requirement 16: Third-Party Integration

**User Story:** As a restaurant manager, I want to receive orders from Swiggy and Zomato, so that I can manage all orders in one system.

#### Acceptance Criteria

1. THE POS System SHALL integrate with Swiggy API to receive incoming orders
2. THE POS System SHALL integrate with Zomato API to receive incoming orders
3. WHEN a third-party order is received, THE POS System SHALL create an order record with source identifier
4. THE POS System SHALL synchronize menu and stock availability to third-party platforms
5. THE POS System SHALL send order status updates to third-party platforms

### Requirement 17: Accounting Integration

**User Story:** As an accountant, I want sales data synchronized to Tally, so that I can maintain accurate financial records.

#### Acceptance Criteria

1. THE POS System SHALL export daily sales data in Tally-compatible format
2. THE POS System SHALL include itemized sales, tax breakdown, and payment method details in exports
3. THE POS System SHALL support configurable tax rates per dish
4. THE POS System SHALL generate export files on scheduled intervals
5. THE POS System SHALL maintain export history with timestamps and file references

### Requirement 18: Reporting and Analytics

**User Story:** As a restaurant owner, I want comprehensive sales and performance reports, so that I can make data-driven business decisions.

#### Acceptance Criteria

1. THE POS System SHALL generate dish-level sales reports with quantity sold, revenue, and profit margins
2. THE POS System SHALL generate staff performance reports with orders processed and customer ratings
3. THE POS System SHALL generate customer segmentation reports categorizing customers as new, returning, loyalty members, and high spenders
4. THE POS System SHALL support outlet comparison reports for multi-outlet brands
5. THE POS System SHALL export reports in Excel, PDF, and CSV formats
6. THE POS System SHALL support custom date range selection for all reports

### Requirement 19: Valet Management

**User Story:** As a customer, I want to request valet service through the app, so that my car is ready when I finish dining.

#### Acceptance Criteria

1. WHEN a customer requests valet service, THE POS System SHALL create a valet request with customer identifier and vehicle details
2. THE POS System SHALL assign parking section and spot identifier to each valet request
3. THE POS System SHALL track valet request status: requested, in queue, dispatched, and delivered
4. WHEN a valet request status changes to delivered, THE POS System SHALL send a notification to the customer
5. THE POS System SHALL track valet performance metrics including average retrieval time and peak request periods

### Requirement 20: Kiosk Self-Service

**User Story:** As a customer, I want to place orders through a self-service kiosk, so that I can order without waiting for staff.

#### Acceptance Criteria

1. THE POS System SHALL support guest checkout from kiosk without customer login
2. WHEN a kiosk order is placed, THE POS System SHALL generate a token slip with order identifier
3. THE POS System SHALL support optional customer login for loyalty points and recommendations
4. THE POS System SHALL accept order customization notes and allergen specifications from kiosk
5. THE POS System SHALL process kiosk payments through UPI, card, wallet, or pay-at-counter options

### Requirement 21: Offline Mode Support

**User Story:** As a restaurant manager, I want the POS to function during internet outages, so that operations continue without disruption.

#### Acceptance Criteria

1. WHILE internet connectivity is unavailable, THE POS System SHALL accept and process orders using local network
2. THE POS System SHALL store orders locally during offline periods
3. WHEN internet connectivity is restored, THE POS System SHALL synchronize local orders to cloud database within 60 seconds
4. THE POS System SHALL support offline functionality for POS desktop, KOT display, token display, and captain app
5. THE POS System SHALL prevent data conflicts during synchronization using timestamp-based conflict resolution

### Requirement 22: Owner Mobile Dashboard

**User Story:** As a restaurant owner, I want real-time business metrics on my mobile, so that I can monitor operations remotely.

#### Acceptance Criteria

1. THE POS System SHALL provide real-time sales data including total billing, order count, and average order value
2. THE POS System SHALL calculate and display profit and loss metrics with configurable cost inputs
3. THE POS System SHALL display table occupancy status with occupied and available counts
4. THE POS System SHALL provide inventory snapshot with low-stock alerts
5. THE POS System SHALL display staff performance metrics with top performers
6. THE POS System SHALL send push notifications for sales milestones, low stock, negative feedback, and payment issues

### Requirement 23: Subscription and Billing Management

**User Story:** As a platform administrator, I want to manage client subscriptions, so that I can control access and billing.

#### Acceptance Criteria

1. THE POS System SHALL store subscription records with tier, billing cycle, and payment status per tenant
2. THE POS System SHALL generate invoices at outlet, brand, or company level based on hierarchy
3. THE POS System SHALL support subscription actions: pause, resume, extend, and cancel
4. WHEN a subscription expires, THE POS System SHALL restrict tenant access to read-only mode
5. THE POS System SHALL track payment history with invoice references and payment dates

### Requirement 24: Support Ticket Management

**User Story:** As a support agent, I want to track and resolve client issues, so that clients receive timely assistance.

#### Acceptance Criteria

1. WHEN a support ticket is created, THE POS System SHALL assign a unique ticket identifier and timestamp
2. THE POS System SHALL support ticket assignment to support staff with role-based routing
3. THE POS System SHALL track ticket status: open, in progress, resolved, and closed
4. WHEN a ticket status changes, THE POS System SHALL send notification to the client via WhatsApp, SMS, or email
5. THE POS System SHALL collect ticket feedback and link feedback to support staff performance metrics

### Requirement 25: Authentication and Authorization

**User Story:** As a system user, I want secure login with role-based permissions, so that I can access only authorized features.

#### Acceptance Criteria

1. THE POS System SHALL authenticate users with email and password credentials
2. WHEN a user logs in, THE POS System SHALL generate a JWT token with expiration time of 24 hours
3. THE POS System SHALL validate JWT tokens on all protected API endpoints
4. THE POS System SHALL enforce role-based access control restricting endpoints by user role
5. THE POS System SHALL support two-factor authentication for admin and owner roles
6. THE POS System SHALL log all authentication attempts with timestamp, IP address, and success status

### Requirement 26: Data Security and Compliance

**User Story:** As a platform administrator, I want the system to meet security standards, so that client data is protected.

#### Acceptance Criteria

1. THE POS System SHALL encrypt sensitive data including passwords, payment information, and customer contact details
2. THE POS System SHALL implement input validation on all API endpoints to prevent injection attacks
3. THE POS System SHALL implement rate limiting on authentication endpoints with maximum 5 attempts per minute per IP address
4. THE POS System SHALL maintain audit logs for data access, modifications, and deletions
5. THE POS System SHALL support data export for compliance with data portability requirements
6. THE POS System SHALL implement session monitoring with automatic logout after 30 minutes of inactivity

### Requirement 27: WhatsApp Integration

**User Story:** As a restaurant owner, I want to send promotions and feedback requests via WhatsApp, so that I can engage customers effectively.

#### Acceptance Criteria

1. THE POS System SHALL integrate with WhatsApp Business API for message delivery
2. THE POS System SHALL send feedback request messages after order completion
3. THE POS System SHALL send promotional messages to customers with opt-in consent
4. THE POS System SHALL track WhatsApp message credits per tenant
5. WHEN WhatsApp credits fall below 100, THE POS System SHALL send a low-credit alert to the owner

### Requirement 28: Table Reservation and Pre-ordering

**User Story:** As a customer, I want to reserve a table and pre-order dishes, so that my food is ready when I arrive.

#### Acceptance Criteria

1. THE POS System SHALL accept table reservations with date, time, party size, and customer contact information
2. WHEN a reservation is created, THE POS System SHALL validate table availability for the requested time slot
3. THE POS System SHALL support pre-ordering dishes linked to a reservation
4. WHEN reservation time approaches within 30 minutes, THE POS System SHALL send a reminder notification to the customer
5. THE POS System SHALL mark reserved tables as unavailable for the reservation time slot

### Requirement 29: Campaign Management and Tracking

**User Story:** As a marketing manager, I want to create and track promotional campaigns, so that I can measure marketing effectiveness.

#### Acceptance Criteria

1. THE POS System SHALL support campaign creation with name, description, target audience, and validity period
2. THE POS System SHALL link coupons to campaigns for redemption tracking
3. THE POS System SHALL track campaign metrics including reach, redemption count, and revenue generated
4. THE POS System SHALL support customer segmentation for targeted campaigns
5. THE POS System SHALL generate campaign performance reports with conversion rates

### Requirement 30: API Rate Limiting and Performance

**User Story:** As a platform administrator, I want API rate limiting, so that system performance remains stable under high load.

#### Acceptance Criteria

1. THE POS System SHALL implement rate limiting with maximum 100 requests per minute per client
2. WHEN rate limit is exceeded, THE POS System SHALL return HTTP 429 status code with retry-after header
3. THE POS System SHALL respond to API requests within 500 milliseconds for 95% of requests
4. THE POS System SHALL implement database query optimization with appropriate indexes
5. THE POS System SHALL implement caching for frequently accessed data with 5-minute cache expiration
