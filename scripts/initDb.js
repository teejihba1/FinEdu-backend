/**
 * Database Initialization Script
 * Sets up the FinEdu database and verifies connection
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const initDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📊 Database: ${process.env.MONGODB_URI.split('/').pop().split('?')[0]}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // List all collections in the database
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📋 Existing collections: ${collections.length}`);
    
    if (collections.length > 0) {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    } else {
      console.log('   (No collections yet - they will be created when you start using the app)');
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('💡 You can now start the FinEdu backend server.');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MONGODB_URI in .env file');
    console.log('2. Verify your MongoDB Atlas credentials');
    console.log('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check if the database name is correct');
    process.exit(1);
  }
};

// Run initialization if this script is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase; 