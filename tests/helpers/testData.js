/**
 * Test Data Generators
 * Provides consistent test data across all tests
 */

const bcrypt = require('bcrypt');

module.exports = {
  // User test data
  validUser: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    phone: '9876543210',
    role: 'manager'
  },
  
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    phone: '9876543211',
    role: 'admin'
  },
  
  // Tenant test data
  validCompany: {
    name: 'Test Restaurant Group',
    type: 'company',
    contactEmail: 'contact@restaurant.com',
    contactPhone: '9876543212'
  },
  
  validBrand: {
    name: 'Test Brand',
    type: 'brand'
  },
  
  validOutlet: {
    name: 'Test Outlet',
    type: 'outlet',
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    }
  },
  
  // Dish test data
  validDish: {
    name: 'Paneer Tikka',
    description: 'Delicious paneer tikka',
    price: 250,
    dietaryTag: 'veg',
    isAvailable: true
  },
  
  // Category test data
  validCategory: {
    name: 'Starters',
    description: 'Appetizers and starters',
    isActive: true
  },
  
  // Order test data
  validOrder: {
    orderType: 'dine-in',
    items: [
      {
        quantity: 2,
        price: 250,
        subtotal: 500
      }
    ],
    subtotal: 500,
    tax: 50,
    total: 550,
    paymentMethod: 'cash'
  },
  
  // Inventory test data
  validInventoryItem: {
    name: 'Paneer',
    unit: 'kg',
    currentStock: 10,
    minStock: 2,
    maxStock: 50,
    unitPrice: 300
  },
  
  validSupplier: {
    name: 'Fresh Foods Supplier',
    contactPerson: 'Supplier Contact',
    phone: '9876543213',
    email: 'supplier@example.com',
    address: '456 Supply St, Mumbai'
  },
  
  validRecipe: {
    name: 'Paneer Tikka Recipe',
    servingSize: 1,
    ingredients: []
  },
  
  validPurchaseOrder: {
    items: [],
    subtotal: 1000,
    tax: 100,
    total: 1100,
    status: 'draft'
  },
  
  // Platform Integration test data
  validPlatformIntegration: {
    platform: 'swiggy',
    platformRestaurantId: 'swiggy-123',
    isActive: true,
    settings: {
      autoAcceptOrders: true,
      defaultPrepTime: 30,
      autoSyncItems: true
    }
  },
  
  // Customer test data
  validCustomer: {
    name: 'Customer Name',
    phone: '9876543214',
    email: 'customer@example.com'
  },
  
  // Table test data
  validTable: {
    tableNumber: 'T1',
    capacity: 4,
    status: 'available'
  },
  
  // Payment test data
  validPayment: {
    amount: 550,
    method: 'cash',
    status: 'completed'
  },
  
  // Helper to hash password
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
};
