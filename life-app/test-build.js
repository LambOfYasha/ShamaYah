const { execSync } = require('child_process');

console.log('Testing TypeScript compilation...');

try {
  // Test TypeScript compilation without building
  execSync('npx tsc --noEmit', { 
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
} 