// A basic test file that doesn't use imports
describe('Basic Test Suite', () => {
  test('should pass this simple test', () => {
    expect(true).toBe(true);
  });

  test('should handle basic math', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle string operations', () => {
    expect('hello ' + 'world').toBe('hello world');
  });
});
