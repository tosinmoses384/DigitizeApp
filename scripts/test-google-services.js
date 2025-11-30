#!/usr/bin/env node

/**
 * Test script to verify the Google Services configuration locally
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Google Services configuration...\n');

// Test each variant
const variants = ['preview', 'production', 'development'];

variants.forEach(variant => {
  console.log(`Testing variant: ${variant}`);
  
  try {
    // Set the environment variable and run the copy script
    const env = { ...process.env, APP_VARIANT: variant };
    execSync('node scripts/copy-google-services.js', { 
      stdio: 'inherit',
      env: env,
      cwd: path.join(__dirname, '..')
    });
    
    // Check Android file
    const androidPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
    if (fs.existsSync(androidPath)) {
      const androidContent = fs.readFileSync(androidPath, 'utf8');
      try {
        const config = JSON.parse(androidContent);
        console.log(`  🤖 Android: ✅ File created successfully`);
        console.log(`     📱 Project ID: ${config.project_info?.project_id || 'Not found'}`);
        console.log(`     📦 Package Name: ${config.client?.[0]?.client_info?.android_client_info?.package_name || 'Not found'}`);
      } catch (parseError) {
        console.log(`  🤖 Android: ✅ File created (${fs.statSync(androidPath).size} bytes) but couldn't parse JSON`);
      }
    } else {
      console.log(`  🤖 Android: ❌ File was not created`);
    }
    
    // Check iOS file
    const iosPath = path.join(__dirname, '..', 'ios', 'GoogleService-Info.plist');
    if (fs.existsSync(iosPath)) {
      const iosStats = fs.statSync(iosPath);
      console.log(`  🍎 iOS: ✅ File created successfully (${iosStats.size} bytes)`);
      
      // Try to read some basic info from plist
      const iosContent = fs.readFileSync(iosPath, 'utf8');
      const bundleIdMatch = iosContent.match(/<key>BUNDLE_ID<\/key>\s*<string>([^<]+)<\/string>/);
      const projectIdMatch = iosContent.match(/<key>PROJECT_ID<\/key>\s*<string>([^<]+)<\/string>/);
      
      if (bundleIdMatch) console.log(`     📦 Bundle ID: ${bundleIdMatch[1]}`);
      if (projectIdMatch) console.log(`     📱 Project ID: ${projectIdMatch[1]}`);
    } else {
      console.log(`  🍎 iOS: ⚠️  File was not created (this is okay if iOS files don't exist)`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}\n`);
  }
});

console.log('✅ Test completed!');
