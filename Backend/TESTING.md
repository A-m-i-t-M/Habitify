# Habitify Backend Testing Documentation

## Overview

This document provides information about the testing setup for the Habitify backend application. The tests are written using Jest and are designed to verify the functionality of the controllers without making actual database connections or external API calls.

## Test Structure

The tests are organized by controller, with each controller having its own test file:

- `user-controller.test.js` - Tests for user authentication and management
- `comment-controller.test.js` - Tests for comment creation, retrieval, and management
- `post-controller.test.js` - Tests for post creation, retrieval, and management
- `simplified.test.js` - Basic tests to verify Jest is working correctly

## Mock Files

All external dependencies are mocked to isolate tests from actual database connections and external services:

- `__mocks__/models/userModel.js` - Mock for the User model
- `__mocks__/models/postModel.js` - Mock for the Post model
- `__mocks__/models/goalModel.js` - Mock for the Goal model
- `__mocks__/utils/sendOTP.js` - Mock for the OTP sending utility
- `__mocks__/utils/error.js` - Mock for the error handling utility
- `__mocks__/bcrypt.js` - Mock for password hashing
- `__mocks__/jsonwebtoken.js` - Mock for JWT authentication
- `__mocks__/nodemailer.js` - Mock for email sending

**Important**: All mock files must import Jest from '@jest/globals' to avoid 'jest is not defined' errors:

```javascript
import { jest } from '@jest/globals';
```

## Running Tests

### Running All Working Tests

To run all the working tests at once, use:

```bash
node run-working-tests.js
```

This script will run each test file sequentially and report the results.

### Running Individual Test Files

To run a specific test file, use:

```bash
npm test <test-file-path>
```

For example:

```bash
npm test controller/user-controller.test.js
```

## CI/CD Pipeline Integration

The tests are integrated into the CI/CD pipeline using GitHub Actions. The workflow is defined in `.github/workflows/ci.yml` and includes the following steps:

1. **Backend Tests**: Runs the stable tests using the custom test runner script:
   ```yaml
   - name: Run Backend Jest Tests
     run: node run-working-tests.js
   ```

2. **Frontend Tests**: Runs the React component tests

3. **Linting and Formatting**: Checks code quality but continues on errors to ensure deployment can proceed

### Deployment Workflow

The deployment workflow (`.github/workflows/deploy.yml`) deploys the application to:
- Frontend: Vercel (https://habitify-frontend.vercel.app)
- Backend: Render (https://habitify-8qnw.onrender.com)

The deployment workflow is configured to continue even if there are linting or test issues to ensure visualization of the deployment process.

## Troubleshooting Common Test Issues

1. **'jest is not defined' errors**: Ensure all mock files import Jest from '@jest/globals'

2. **ESM compatibility issues**: The project uses ES Modules, so tests are run with the `--experimental-vm-modules` flag

3. **React Hook dependency warnings**: Ensure all dependencies used in useEffect hooks are included in the dependency array

## Test Configuration

The Jest configuration is in `jest.config.js` and includes:

- Support for ES modules via the `--experimental-vm-modules` flag
- Module name mapping for better import handling
- Global setup via `jest.setup.js`

## Mocking Strategy

The tests use a consistent mocking strategy:

1. **No Real Dependencies**: All external dependencies (mongoose, bcrypt, etc.) are mocked to prevent actual database connections or external API calls.

2. **Isolated Tests**: Each test is isolated and doesn't depend on the state of other tests.

3. **Mock Implementation**: Mock implementations closely mimic the behavior of real dependencies but in a controlled way.

## CI/CD Integration

These tests are integrated into the CI/CD pipeline via GitHub Actions. The workflow runs the tests on each push to ensure code quality.

## Monitoring

After tests pass, the application can be monitored using Prometheus and Grafana, which are configured in the `monitoring` directory. This provides real-time insights into application performance and health.

## Future Improvements

Potential areas for improvement in the testing setup:

1. Add integration tests with a test database
2. Increase test coverage for more controllers and edge cases
3. Add performance tests
4. Implement end-to-end tests for critical user flows
