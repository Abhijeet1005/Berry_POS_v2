#!/usr/bin/env node

/**
 * Create Global Admin Script
 * 
 * This script creates a global/super admin user that can create tenants
 * and manage the entire system.
 * 
 * Usage:
 *   node scripts/createGlobalAdmin.js
 * 
 * Or with custom credentials:
 *   EMAIL=admin@example.com PASSWORD=MyPassword123! node scripts/createGlobalAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Import User model
const User = require('../src/models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createGlobalAdmin() {
  try {
    console.log('\n🚀 Berry & Blocks POS - Global Admin Setup\n');
    console.log('This will create a super admin account that can manage the entire system.\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if global admin already exists
    const existingAdmin = await User.findOne({ 
      tenantId: 'global',
      role: 'admin' 
    });

    if (existingAdmin) {
      console.log('⚠️  Global admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);
      
      const overwrite = await question('Do you want to create another global admin? (yes/no): ');
      
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        console.log('\n❌ Cancelled. Existing global admin preserved.\n');
        process.exit(0);
      }
      console.log('');
    }

    // Get credentials from environment or prompt
    let email = process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;
    let firstName = process.env.ADMIN_FIRST_NAME || 'Super';
    let lastName = process.env.ADMIN_LAST_NAME || 'Admin';
    let phone = process.env.ADMIN_PHONE || '9999999999';

    // Prompt for missing credentials
    if (!email) {
      email = await question('Enter email (default: superadmin@berryblocks.com): ');
      email = email.trim() || 'superadmin@berryblocks.com';
    }

    if (!password) {
      password = await question('Enter password (min 8 characters): ');
      if (password.length < 8) {
        console.log('\n❌ Password must be at least 8 characters long.\n');
        process.exit(1);
      }
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      console.log('\n❌ Invalid email format.\n');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`\n❌ User with email ${email} already exists.\n`);
      process.exit(1);
    }

    // Create global admin
    console.log('\n🔨 Creating global admin...');
    
    const globalAdmin = new User({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      phone,
      role: 'admin',
      tenantId: 'global',
      outletId: 'global',
      isActive: true,
      isVerified: true
    });

    await globalAdmin.save();

    console.log('\n✅ Global admin created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:      ${email}`);
    console.log(`   Password:   ${password}`);
    console.log(`   Role:       admin (global)`);
    console.log(`   ID:         ${globalAdmin._id}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔐 IMPORTANT: Save these credentials securely!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Login with these credentials');
    console.log('   2. Create your first tenant/outlet');
    console.log('   3. Create outlet-specific admins');
    console.log('   4. Start managing your restaurant!\n');
    
    console.log('🔗 Login endpoint:');
    console.log(`   POST http://localhost:${process.env.PORT || 3000}/api/v1/auth/login`);
    console.log('   Body: { "email": "' + email + '", "password": "' + password + '" }\n');

  } catch (error) {
    console.error('\n❌ Error creating global admin:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the script
createGlobalAdmin();
