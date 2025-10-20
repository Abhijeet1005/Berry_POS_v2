# 🎉 Berry & Blocks POS - Complete Postman Collection

## 📦 What's Included

This package contains a **comprehensive Postman collection** with **ALL** API endpoints for the Berry & Blocks POS System.

### Files in This Package

1. **Berry_Blocks_POS_Complete_Collection.json** - Main collection file (150+ endpoints)
2. **Berry_Blocks_POS_Environment.postman_environment.json** - Pre-configured environment
3. **POSTMAN_COLLECTION_GUIDE.md** - Complete documentation
4. **POSTMAN_QUICK_REFERENCE.md** - Quick reference card
5. **POSTMAN_WORKFLOWS.md** - Step-by-step workflow diagrams

## 🚀 Quick Start (3 Steps)

### Step 1: Import Collection
```
1. Open Postman
2. Click "Import"
3. Select "Berry_Blocks_POS_Complete_Collection.json"
```

### Step 2: Import Environment
```
1. Click "Import"
2. Select "Berry_Blocks_POS_Environment.postman_environment.json"
3. Select the environment from dropdown
```

### Step 3: Start Testing
```
1. Start your server: npm start
2. Run "Health Check" request
3. Run "Login" request
4. Start testing! 🎯
```

## 📊 Collection Statistics

| Metric | Count |
|--------|-------|
| **Total Endpoints** | 150+ |
| **Modules** | 19 |
| **Folders** | 19 |
| **Auto-Saved Variables** | 15 |
| **Public Endpoints** | 5 |
| **Authenticated Endpoints** | 145+ |

## 🎯 What's Covered

### ✅ Core Features (45 endpoints)
- Authentication & Authorization
- Multi-tenant Management
- Menu Management (Categories & Dishes)
- Table Management
- Order Processing
- Kitchen Order Tickets (KOT)
- Payment Processing (Cash, Card, Split, Razorpay)

### ✅ Customer Features (33 endpoints)
- Customer Self-Service Portal
- Cart Management
- Order Tracking
- Loyalty Program
- Coupon System
- Feedback & Ratings
- Reservations with Pre-Orders

### ✅ Management Features (27 endpoints)
- Staff Management
- Performance Tracking
- Analytics & Reports
- Audit Logging
- Admin Dashboard

### ✅ Advanced Features (45+ endpoints)
- AI-Powered Recommendations
- Valet Service Management
- Real-time Notifications
- Offline Sync Support
- Subscription Management
- Support Ticket System
- Feature Toggle Management

## 🔑 Key Features

### 🤖 Auto-Save Variables
The collection automatically saves important IDs after creation:
- `access_token` after login
- `tenant_id`, `outlet_id` after tenant creation
- `order_id`, `payment_id`, `customer_id`, etc.

### 🔐 Auto-Authentication
- Bearer token automatically applied to all authenticated requests
- Token saved after login
- No manual token management needed

### 📝 Test Scripts
Many requests include test scripts that:
- Validate responses
- Save variables automatically
- Check status codes
- Parse and store data

### 📂 Organized Structure
Requests organized in logical folders:
- By module (Auth, Orders, Payments, etc.)
- By feature (Customer, Staff, Admin, etc.)
- By workflow (Setup, Operations, Analytics, etc.)

## 🎓 Learning Resources

### For Beginners
1. Start with **POSTMAN_QUICK_REFERENCE.md**
2. Follow **Workflow 1** in POSTMAN_WORKFLOWS.md
3. Test basic endpoints (Health, Login, Get Menu)

### For Developers
1. Read **POSTMAN_COLLECTION_GUIDE.md**
2. Explore all modules
3. Test integration workflows
4. Use Collection Runner for automation

### For Testers
1. Use **POSTMAN_WORKFLOWS.md** for test scenarios
2. Run complete workflows
3. Test edge cases
4. Generate test reports

## 🔧 Configuration

### Environment Variables
```
base_url: http://localhost:3000/api/v1
access_token: (auto-saved)
tenant_id: (auto-saved)
outlet_id: (auto-saved)
... and 10 more auto-saved variables
```

### Server Configuration
Make sure your `.env` file is configured:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/berry-pos
JWT_SECRET=your-secret-key
```

## 📚 Documentation

### API Documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **API Docs**: API_DOCUMENTATION.md
- **Getting Started**: GETTING_STARTED.md

### Postman Documentation
- **Complete Guide**: POSTMAN_COLLECTION_GUIDE.md
- **Quick Reference**: POSTMAN_QUICK_REFERENCE.md
- **Workflows**: POSTMAN_WORKFLOWS.md

## 🎯 Common Use Cases

### 1. Restaurant Setup
Use Workflow 1 to set up a new restaurant with menu, tables, and staff.

### 2. Daily Operations
Use Workflow 2 for processing dine-in orders from creation to payment.

### 3. Customer Self-Service
Use Workflow 3 to test the complete customer ordering journey.

### 4. Analytics & Reporting
Use Workflow 9 to generate sales, dish, and customer analytics.

### 5. Admin Management
Use Admin Panel endpoints for subscription and support management.

## 🐛 Troubleshooting

### Collection Not Importing
- Ensure you're using Postman v9.0 or higher
- Check JSON file is not corrupted
- Try importing as "File" instead of "Link"

### Requests Failing
- Verify server is running (`npm start`)
- Check environment is selected
- Ensure you're logged in (run Login request)
- Check MongoDB is running

### Variables Not Saving
- Check test scripts in request
- Verify environment is selected (not "No Environment")
- Look for errors in Postman Console

## 💡 Pro Tips

1. **Use Collection Runner**: Automate entire workflows
2. **Save Examples**: Keep successful responses as examples
3. **Use Pre-request Scripts**: Add dynamic data generation
4. **Monitor API**: Use Postman Monitor for uptime checks
5. **Generate Documentation**: Use Postman's doc generator

## 🎉 What Makes This Collection Special

✨ **Complete Coverage**: Every single endpoint included
✨ **Auto-Variables**: No manual ID management
✨ **Well-Organized**: Logical folder structure
✨ **Production-Ready**: Real-world workflows
✨ **Documented**: Comprehensive guides included
✨ **Tested**: All endpoints verified working
✨ **Maintained**: Updated with latest features

## 📞 Support

### Need Help?
- Check **POSTMAN_COLLECTION_GUIDE.md** for detailed docs
- Review **POSTMAN_WORKFLOWS.md** for step-by-step guides
- Check server logs in `logs/` directory
- Review API documentation at `/api-docs`

### Found an Issue?
- Check server is running
- Verify environment variables
- Review request body format
- Check authentication token

## 🚀 Next Steps

1. ✅ Import collection and environment
2. ✅ Start server
3. ✅ Run Health Check
4. ✅ Complete Workflow 1 (Setup)
5. ✅ Test your use cases
6. ✅ Explore advanced features
7. ✅ Automate with Collection Runner

## 📈 Version History

### Version 2.0.0 (Current)
- ✅ 150+ endpoints
- ✅ 19 modules
- ✅ Complete documentation
- ✅ All workflows included
- ✅ Auto-save variables
- ✅ Test scripts

---

**Happy Testing! 🎊**

Made with ❤️ for Berry & Blocks POS System
