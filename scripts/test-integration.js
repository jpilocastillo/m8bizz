const { exec } = require('child_process');
const path = require('path');

// Run the TypeScript test file using ts-node
const testFile = path.join(__dirname, '../lib/test-integration.ts');

console.log('Running integration tests...');
console.log('Make sure your .env.local file is properly configured with Supabase credentials');

exec(`npx ts-node ${testFile}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing test: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`Test stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
}); 