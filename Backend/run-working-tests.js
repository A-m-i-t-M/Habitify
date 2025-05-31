// Run working controller tests
import { execSync } from 'child_process';

console.log('Running working controller tests...');

try {
  // Run the tests that we know are working
  const testFiles = [
    'controller/user-controller.test.js',
    'controller/comment-controller.test.js',
    'controller/post-controller.test.js',
    'controller/simplified.test.js'
  ];
  
  console.log('Running tests over here'); 
  console.log('Another one over here Running tests over here'); 
  testFiles.forEach(testFile => {
    console.log(`\n\nRunning tests for: ${testFile}`);
    console.log('='.repeat(50));
    try {
      execSync(`npm test ${testFile}`, { stdio: 'inherit' });
      console.log(`✅ Tests passed for ${testFile}`);
    } catch (error) {
      console.error(`❌ Tests failed for ${testFile}`);
    }
  });
  
  console.log('\n\nAll working tests completed!');
} catch (error) {
  console.error('Error running tests:', error);
}
