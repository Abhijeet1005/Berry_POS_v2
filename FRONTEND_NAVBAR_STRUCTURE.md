# Frontend Navbar Structure with RBAC

## 🎯 **Complete Navbar Sections for POS System**

Based on the backend modules and RBAC permissions, here's the recommended navbar structure:

---

## 📱 **Main Navigation Sections**

### **1. 🏠 Dashboard** (Home)
**Roles**: All
**Icon**: Home/Dashboard
**Route**: `/dashboard`
**Description**: Overview, quick stats, recent activity

**Permissions**:
- Admin: Full dashboard with all metrics
- Manager: Outlet-level metrics
- Captain: Table status, active orders
- Cashier: Payment summary, pending bills
- Kitchen: Active KOTs, pending orders

---

### **2. 🍽️ Orders** (Order Management)
**Roles**: Admin, Manager, Captain, Cashier, Kitchen
**Icon**: Receipt/Order
**Route**: `/orders`

**Sub-sections**:
- **Active Orders** (All roles)
  - View current orders
  - Update order status
  - Captain: Create/modify orders
  - Kitchen: View KOTs only

- **Order History** (Admin, Manager, Cashier)
  - Past orders
  - Search & filter
  - Order details

- **KOT Management** (Kitchen, Captain, Manager, Admin)
  - View KOTs by kitchen section
  - Update KOT status (preparing, ready)
  - Kitchen display

**Permissions**:
- Admin/Manager: `orders.*`
- Captain: `orders.create`, `orders.read`, `orders.update`
- Cashier: `orders.read`
- Kitchen: `orders.read`, `kot.*`

---

### **3. 🍕 Menu Management**
**Roles**: Admin, Manager
**Icon**: Menu/Food
**Route**: `/menu`

**Sub-sections**:
- **Dishes**
  - Add/Edit/Delete dishes
  - Upload images
  - Manage pricing, portions
  - Stock management
  - AI-generated descriptions

- **Categories**
  - Manage categories
  - Kitchen section mapping
  - Display order

- **Availability**
  - Mark dishes available/unavailable
  - Stock alerts
  - Out of stock management

**Permissions**:
- Admin/Manager: `menu.*`, `dishes.*`, `categories.*`
- Others: Read-only or no access

---

### **4. 🪑 Tables**
**Roles**: Admin, Manager, Captain
**Icon**: Table/Grid
**Route**: `/tables`

**Sub-sections**:
- **Table Layout**
  - Visual table map
  - Table status (available, occupied, reserved)
  - Assign/transfer orders

- **Table Management** (Admin, Manager only)
  - Add/Edit/Delete tables
  - Generate QR codes
  - Table configuration

- **Table Operations** (Captain)
  - Merge tables
  - Transfer orders
  - Update status

**Permissions**:
- Admin/Manager: `tables.*`
- Captain: `tables.*`
- Others: No access

---

### **5. 💰 Payments**
**Roles**: Admin, Manager, Cashier
**Icon**: Money/Payment
**Route**: `/payments`

**Sub-sections**:
- **Process Payment**
  - Accept payments
  - Split bills
  - Multiple payment methods
  - Generate receipts

- **Payment History**
  - View transactions
  - Refunds
  - Payment reports

- **Coupons & Discounts** (Cashier can validate only)
  - Apply coupons
  - Validate codes
  - Discount management

**Permissions**:
- Admin/Manager: `payments.*`, `coupons.*`
- Cashier: `payments.*`, `coupons.validate`
- Others: No access

---

### **6. 👥 Customers**
**Roles**: Admin, Manager, Captain, Cashier
**Icon**: Users/People
**Route**: `/customers`

**Sub-sections**:
- **Customer List**
  - View all customers
  - Search & filter
  - Customer details

- **Loyalty Program**
  - View loyalty points
  - Redeem points
  - Loyalty transactions
  - Cashier: Can redeem points

- **Feedback**
  - View customer feedback
  - Respond to feedback
  - Sentiment analysis
  - Captain: Can create feedback

**Permissions**:
- Admin/Manager: Full access
- Captain: `customers.read`, `feedback.create`
- Cashier: `loyalty.read`, `loyalty.redeem`
- Others: No access

---

### **7. 📅 Reservations**
**Roles**: Admin, Manager, Captain
**Icon**: Calendar/Booking
**Route**: `/reservations`

**Sub-sections**:
- **Reservation List**
  - View all reservations
  - Today's reservations
  - Upcoming bookings

- **Create Reservation**
  - Book tables
  - Pre-order management
  - Customer details

- **Manage Reservations**
  - Confirm/Cancel
  - Update status
  - Send reminders

**Permissions**:
- Admin/Manager: `reservations.*`
- Captain: `reservations.read`, `reservations.update`
- Others: No access

---

### **8. 🚗 Valet**
**Roles**: Admin, Manager, Captain
**Icon**: Car/Parking
**Route**: `/valet`

**Sub-sections**:
- **Valet Requests**
  - Active requests
  - Request queue
  - Assign parking spots

- **Valet Status**
  - Update status (dispatched, delivered)
  - Performance metrics

**Permissions**:
- Admin/Manager: `valet.*`
- Captain: `valet.create`, `valet.read`
- Others: No access

---

### **9. 📊 Analytics & Reports**
**Roles**: Admin, Manager
**Icon**: Chart/Analytics
**Route**: `/analytics`

**Sub-sections**:
- **Sales Analytics**
  - Daily/Weekly/Monthly sales
  - Revenue trends
  - Peak hours analysis

- **Dish Performance**
  - Most ordered dishes
  - Slow-moving items
  - Category-wise sales

- **Customer Analytics**
  - Customer segments
  - Repeat customers
  - Average order value

- **Staff Performance**
  - Orders per staff
  - Upselling metrics
  - Performance ratings

- **Reports**
  - Generate reports
  - Export (Excel, PDF, CSV)
  - Custom date ranges

**Permissions**:
- Admin/Manager: `analytics.*`, `reports.*`
- Others: No access

---

### **10. 🎯 Marketing**
**Roles**: Admin, Manager
**Icon**: Megaphone/Campaign
**Route**: `/marketing`

**Sub-sections**:
- **Coupons**
  - Create/Edit coupons
  - Coupon usage tracking
  - Campaign linking

- **Campaigns**
  - WhatsApp campaigns
  - Loyalty campaigns
  - Target customer segments

- **Notifications**
  - Send notifications
  - Notification templates
  - Delivery status

**Permissions**:
- Admin/Manager: `coupons.*`, `campaigns.*`
- Others: No access

---

### **11. 👨‍💼 Staff Management**
**Roles**: Admin, Manager
**Icon**: Users/Team
**Route**: `/staff`

**Sub-sections**:
- **Staff List**
  - View all staff
  - Staff details
  - Role assignment

- **Add/Edit Staff** (Admin only for sensitive operations)
  - Create staff accounts
  - Assign roles & permissions
  - Outlet assignment

- **Performance**
  - Staff metrics
  - Activity logs
  - Performance reviews

**Permissions**:
- Admin: Full access
- Manager: `staff.read`, `staff.create`, `staff.update`
- Others: No access

---

### **12. 🏢 Back Office** (Admin/Manager Only)
**Roles**: Admin, Manager
**Icon**: Settings/Office
**Route**: `/back-office`

**Sub-sections**:
- **Tenant Management** (Admin only)
  - Company/Brand/Outlet hierarchy
  - Tenant settings
  - Multi-outlet management

- **Subscriptions** (Admin only)
  - Subscription plans
  - Billing & invoicing
  - Feature toggles

- **Support Tickets** (Admin only)
  - View tickets
  - Ticket management
  - Customer support

- **Audit Logs**
  - System activity
  - User actions
  - Security logs

- **Sync Management**
  - Offline sync status
  - Conflict resolution
  - Data synchronization

**Permissions**:
- Admin: Full access
- Manager: Limited access (audit logs only)
- Others: No access

---

### **13. 🤖 AI Features**
**Roles**: Admin, Manager
**Icon**: Brain/AI
**Route**: `/ai`

**Sub-sections**:
- **Dish Profiling**
  - Generate AI descriptions
  - Nutrition analysis
  - Taste factor analysis

- **Recommendations**
  - Customer taste profiles
  - Personalized recommendations
  - Dish highlighting

**Permissions**:
- Admin/Manager: Full access
- Others: No access

---

### **14. ⚙️ Settings**
**Roles**: All (different access levels)
**Icon**: Settings/Gear
**Route**: `/settings`

**Sub-sections**:
- **Profile** (All roles)
  - Update personal info
  - Change password
  - 2FA settings

- **Outlet Settings** (Admin, Manager)
  - Outlet details
  - Operating hours
  - Tax configuration

- **Integration Settings** (Admin only)
  - Swiggy/Zomato integration
  - Tally export
  - WhatsApp Business API
  - Payment gateway

- **Notification Preferences** (All roles)
  - Email notifications
  - Push notifications
  - SMS alerts

**Permissions**:
- Admin: Full access
- Manager: Outlet settings
- Others: Profile only

---

## 🎨 **Navbar Layout Recommendations**

### **Option 1: Sidebar Navigation (Recommended for Desktop)**

```
┌─────────────────────────────────────────┐
│ 🏠 Dashboard                            │
├─────────────────────────────────────────┤
│ 🍽️ Orders                               │
│   ├─ Active Orders                      │
│   ├─ Order History                      │
│   └─ KOT Management                     │
├─────────────────────────────────────────┤
│ 🍕 Menu Management                      │
│   ├─ Dishes                             │
│   ├─ Categories                         │
│   └─ Availability                       │
├─────────────────────────────────────────┤
│ 🪑 Tables                               │
├─────────────────────────────────────────┤
│ 💰 Payments                             │
├─────────────────────────────────────────┤
│ 👥 Customers                            │
│   ├─ Customer List                      │
│   ├─ Loyalty Program                    │
│   └─ Feedback                           │
├─────────────────────────────────────────┤
│ 📅 Reservations                         │
├─────────────────────────────────────────┤
│ 🚗 Valet                                │
├─────────────────────────────────────────┤
│ 📊 Analytics                            │
├─────────────────────────────────────────┤
│ 🎯 Marketing                            │
├─────────────────────────────────────────┤
│ 👨‍💼 Staff                               │
├─────────────────────────────────────────┤
│ 🏢 Back Office                          │
├─────────────────────────────────────────┤
│ 🤖 AI Features                          │
├─────────────────────────────────────────┤
│ ⚙️ Settings                             │
└─────────────────────────────────────────┘
```

### **Option 2: Top Navigation with Dropdowns (Mobile-Friendly)**

```
┌──────────────────────────────────────────────────────────┐
│ Logo  [Dashboard] [Orders▼] [Menu▼] [Tables] [More▼]    │
└──────────────────────────────────────────────────────────┘
```

### **Option 3: Hybrid (Top + Sidebar)**

```
┌──────────────────────────────────────────────────────────┐
│ Logo  [Outlet Selector▼]  [Notifications] [Profile▼]    │
└──────────────────────────────────────────────────────────┘
┌─────────┬────────────────────────────────────────────────┐
│ Sidebar │ Main Content Area                              │
│         │                                                │
│ 🏠 Dash │                                                │
│ 🍽️ Ord  │                                                │
│ 🍕 Menu │                                                │
│ ...     │                                                │
└─────────┴────────────────────────────────────────────────┘
```

---

## 📋 **Role-Based Navbar Examples**

### **Admin Navbar (Full Access):**
```
Dashboard | Orders | Menu | Tables | Payments | Customers | 
Reservations | Valet | Analytics | Marketing | Staff | 
Back Office | AI Features | Settings
```

### **Manager Navbar:**
```
Dashboard | Orders | Menu | Tables | Payments | Customers | 
Reservations | Valet | Analytics | Marketing | Staff | Settings
```

### **Captain Navbar:**
```
Dashboard | Orders | Tables | Customers | Reservations | 
Valet | Settings
```

### **Cashier Navbar:**
```
Dashboard | Orders | Payments | Customers (Loyalty) | Settings
```

### **Kitchen Navbar:**
```
Dashboard | Orders (KOT View) | Menu (Read-only) | Settings
```

---

## 🔐 **Implementation Guide**

### **Frontend RBAC Check:**

```javascript
// Example: Check if user can access a section
const canAccess = (section, userRole) => {
  const accessMatrix = {
    dashboard: ['admin', 'manager', 'captain', 'cashier', 'kitchen'],
    orders: ['admin', 'manager', 'captain', 'cashier', 'kitchen'],
    menu: ['admin', 'manager'],
    tables: ['admin', 'manager', 'captain'],
    payments: ['admin', 'manager', 'cashier'],
    customers: ['admin', 'manager', 'captain', 'cashier'],
    reservations: ['admin', 'manager', 'captain'],
    valet: ['admin', 'manager', 'captain'],
    analytics: ['admin', 'manager'],
    marketing: ['admin', 'manager'],
    staff: ['admin', 'manager'],
    backOffice: ['admin', 'manager'],
    ai: ['admin', 'manager'],
    settings: ['admin', 'manager', 'captain', 'cashier', 'kitchen']
  };
  
  return accessMatrix[section]?.includes(userRole) || false;
};
```

### **Dynamic Navbar Component:**

```jsx
const Navbar = ({ userRole }) => {
  const navSections = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home', roles: ['all'] },
    { id: 'orders', label: 'Orders', icon: 'Receipt', roles: ['all'] },
    { id: 'menu', label: 'Menu', icon: 'Food', roles: ['admin', 'manager'] },
    { id: 'tables', label: 'Tables', icon: 'Table', roles: ['admin', 'manager', 'captain'] },
    // ... more sections
  ];
  
  const visibleSections = navSections.filter(section => 
    section.roles.includes('all') || section.roles.includes(userRole)
  );
  
  return (
    <nav>
      {visibleSections.map(section => (
        <NavItem key={section.id} {...section} />
      ))}
    </nav>
  );
};
```

---

## 🎯 **Quick Reference: Role Permissions**

| Section | Admin | Manager | Captain | Cashier | Kitchen |
|---------|-------|---------|---------|---------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ (Create/Update) | ✅ (Read) | ✅ (KOT) |
| Menu | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tables | ✅ | ✅ | ✅ | ❌ | ❌ |
| Payments | ✅ | ✅ | ❌ | ✅ | ❌ |
| Customers | ✅ | ✅ | ✅ (Read) | ✅ (Loyalty) | ❌ |
| Reservations | ✅ | ✅ | ✅ (Read/Update) | ❌ | ❌ |
| Valet | ✅ | ✅ | ✅ (Create/Read) | ❌ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ❌ | ❌ |
| Marketing | ✅ | ✅ | ❌ | ❌ | ❌ |
| Staff | ✅ | ✅ (Limited) | ❌ | ❌ | ❌ |
| Back Office | ✅ | ✅ (Limited) | ❌ | ❌ | ❌ |
| AI Features | ✅ | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ (Limited) | ✅ (Profile) | ✅ (Profile) | ✅ (Profile) |

---

**Last Updated**: 2025-11-06
**Total Sections**: 14
**Roles Supported**: 5 (Admin, Manager, Captain, Cashier, Kitchen)
