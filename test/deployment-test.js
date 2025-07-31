#!/usr/bin/env node

/**
 * Quick deployment test for ClickUp MCP Server
 * This script validates that the server can start and respond to basic requests
 */

const { ClickUpAPI } = require('../dist/clickup-api.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🧪 Testing ClickUp MCP Server...\n');

  const token = process.env.CLICKUP_PERSONAL_TOKEN;
  
  if (!token) {
    console.error('❌ CLICKUP_PERSONAL_TOKEN not found in environment');
    console.log('💡 Copy .env.example to .env and add your ClickUp token');
    process.exit(1);
  }

  try {
    console.log('🔑 Token found, testing API connection...');
    const clickup = new ClickUpAPI(token, 'info');

    // Test basic API connectivity
    const teams = await clickup.getTeams();
    console.log(`✅ Successfully connected to ClickUp API`);
    console.log(`📊 Found ${teams.length} teams:`);
    
    teams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
    });

    if (teams.length > 0) {
      const teamId = teams[0].id;
      console.log(`\n🏢 Testing spaces for team: ${teams[0].name}`);
      
      try {
        const spaces = await clickup.getSpaces(teamId);
        console.log(`✅ Found ${spaces.length} spaces`);
        
        spaces.slice(0, 3).forEach((space, index) => {
          console.log(`   ${index + 1}. ${space.name} (ID: ${space.id})`);
        });
      } catch (error) {
        console.log(`⚠️  Could not fetch spaces: ${error.message}`);
      }
    }

    console.log('\n🎉 Basic API test completed successfully!');
    console.log('🚀 Server is ready for deployment to Railway');
    
    return true;

  } catch (error) {
    console.error(`❌ API Test Failed: ${error.message}`);
    
    if (error.response?.status === 401) {
      console.log('💡 Check your CLICKUP_PERSONAL_TOKEN - it may be invalid or expired');
    } else if (error.response?.status === 403) {
      console.log('💡 Token is valid but may lack required permissions');
    } else {
      console.log('💡 Check your internet connection and ClickUp API status');
    }
    
    return false;
  }
}

async function testServerModes() {
  console.log('\n🔧 Testing server startup modes...');
  
  // Test that our index file can be required without errors
  try {
    console.log('📦 Testing module imports...');
    
    // This will test if our TypeScript compiles and imports work
    delete require.cache[require.resolve('../dist/index.js')];
    const serverModule = require('../dist/index.js');
    
    console.log('✅ Server module loads successfully');
    return true;
  } catch (error) {
    console.error(`❌ Module loading failed: ${error.message}`);
    console.log('💡 Run "npm run build" to compile TypeScript');
    return false;
  }
}

async function main() {
  console.log('🔥 ClickUp MCP Server - Deployment Test\n');
  
  let allTestsPassed = true;

  // Test 1: API Connection
  const apiTest = await testConnection();
  allTestsPassed = allTestsPassed && apiTest;

  // Test 2: Server Module Loading  
  const moduleTest = await testServerModes();
  allTestsPassed = allTestsPassed && moduleTest;

  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Ready for production deployment.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Push code to GitHub');
    console.log('   2. Connect repo to Railway');
    console.log('   3. Set CLICKUP_PERSONAL_TOKEN in Railway env vars');
    console.log('   4. Deploy and test health endpoint');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please fix issues before deploying.');
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}
