const { execSync } = require('child_process');

console.log('🚀 Force Deploying to Vercel...');

try {
  // Clear any cached builds
  console.log('📦 Clearing cache...');
  execSync('vercel --prod --force --clear-cache', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Force deployment completed!');
} catch (error) {
  console.log('⚠️  Force deployment failed, trying alternative approach...');
  
  try {
    // Try with different build command
    console.log('🔧 Trying with alternative build command...');
    execSync('vercel --prod --force', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Alternative deployment completed!');
  } catch (secondError) {
    console.error('❌ All deployment attempts failed');
    console.error('Error:', secondError.message);
    process.exit(1);
  }
} 