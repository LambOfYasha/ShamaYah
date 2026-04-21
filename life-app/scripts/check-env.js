console.log('=== ENVIRONMENT VARIABLES CHECK ===');

const requiredVars = [
  'SANITY_ADMIN_API_TOKEN',
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'NEXT_PUBLIC_SANITY_API_VERSION'
];

const optionalVars = [
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET'
];

console.log('\nRequired Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ MISSING';
  console.log(`${varName}: ${status}`);
  if (value) {
    console.log(`  Value: ${varName.includes('TOKEN') || varName.includes('SECRET') ? '***HIDDEN***' : value}`);
  }
});

console.log('\nOptional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '⚠️  NOT SET';
  console.log(`${varName}: ${status}`);
});

console.log('\n=== SANITY CONFIGURATION ===');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET');
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET');
console.log('API Version:', process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'NOT SET');
console.log('Admin Token:', process.env.SANITY_ADMIN_API_TOKEN ? 'SET' : 'NOT SET');

console.log('\n=== SUMMARY ===');
const missingRequired = requiredVars.filter(varName => !process.env[varName]);
if (missingRequired.length === 0) {
  console.log('✅ All required environment variables are set');
} else {
  console.log('❌ Missing required environment variables:');
  missingRequired.forEach(varName => console.log(`  - ${varName}`));
} 