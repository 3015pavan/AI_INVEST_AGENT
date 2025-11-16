# Authentication Tests

## Running Tests

```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

## Test Coverage

The auth tests cover:
- User registration with validation
- User login with credential verification
- Password hashing verification
- Error handling for invalid inputs
- Google OAuth skeleton (returns 501 - not implemented)

## Test Environment

Tests use a separate test database. Make sure to set `MONGODB_URI_TEST` in `.env.test` or use the default test database.

## Security Features Tested

- ✅ Passwords are hashed with bcrypt (12 salt rounds)
- ✅ Passwords are never returned in responses
- ✅ JWT tokens are generated with proper expiration
- ✅ Email validation and case-insensitive handling
- ✅ Duplicate user prevention

