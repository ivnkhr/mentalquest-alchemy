# Testing & CI/CD Documentation

## Overview

MentalQuest Alchemy uses automated testing and continuous integration/deployment to ensure code quality and reliability.

## Test Coverage

### Backend Tests (Jest)

**Current Status:** 35 tests passing, 5 test suites

**Covered Services:**
- `AuthService` - Authentication logic, JWT generation, password hashing
- `UsersService` - User CRUD operations, password validation
- `RocksService` - Rock management, progress calculation
- `EdgesService` - Edge management, auto-progress updates
- `AppController` - Basic application health check

**Running Backend Tests:**
```bash
cd backend
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
npm test -- --watch       # Watch mode for development
```

**Test Database:**
- Tests use an in-memory mock database
- MySQL connection is mocked in test environment
- No external database required for unit tests

### Frontend Tests (Jasmine/Karma)

**Test Framework:** Jasmine with Karma test runner
**Browser:** ChromeHeadless for CI, Chrome for local development

**Running Frontend Tests:**
```bash
cd frontend
npm test                              # Interactive watch mode
npm test -- --watch=false             # Single run
npm test -- --code-coverage           # With coverage
npm test -- --browsers=ChromeHeadless # Headless mode for CI
```

**Note:** Tests require Chrome browser. In CI, ChromeHeadless is used automatically.

## Continuous Integration

### GitHub Actions Workflows

We use GitHub Actions for automated testing and deployment:

#### 1. Backend CI (`backend-ci.yml`)

**Triggers:**
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`
- Only runs when backend or shared code changes

**Steps:**
1. Setup MySQL 8.0 service container
2. Install Node.js 20 and dependencies
3. Run ESLint (if configured)
4. Run Jest tests with coverage
5. Upload coverage to Codecov
6. Build application
7. Archive build artifacts

**Environment Variables:**
- `DB_HOST`: localhost
- `DB_PORT`: 3306
- `DB_USERNAME`: root
- `DB_PASSWORD`: test_password
- `DB_DATABASE`: test_db
- `JWT_SECRET`: test-secret-key-for-ci
- `NODE_ENV`: test

#### 2. Frontend CI (`frontend-ci.yml`)

**Triggers:**
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`
- Only runs when frontend or shared code changes

**Steps:**
1. Install Node.js 20 and dependencies
2. Run ESLint (if configured)
3. Run Karma/Jasmine tests with ChromeHeadless
4. Upload coverage to Codecov
5. Build application (production mode)
6. Generate service worker
7. Archive build artifacts
8. Report bundle size in PR summary

#### 3. Deployment (`deploy.yml`)

**Triggers:**
- Push to `main` branch (automatic)
- Manual workflow dispatch with environment selection

**Environments:**
- Production
- Staging

**Deployment Steps:**

**Backend Deployment:**
1. Build backend application
2. SSH into DigitalOcean droplet
3. Pull latest code
4. Install production dependencies
5. Run database migrations
6. Restart PM2 process
7. Perform health check

**Frontend Deployment:**
1. Build frontend (production mode)
2. Deploy to hosting (options):
   - DigitalOcean Spaces (S3-compatible)
   - Same droplet with Nginx
   - Vercel/Netlify
3. Purge CDN cache (if applicable)

**Notification:**
- Sends deployment status to team
- Reports success/failure for both services

### Required Secrets

Configure these in GitHub repository settings:

```
DO_SSH_KEY      # SSH private key for DigitalOcean droplet
DO_HOST         # Droplet IP address or hostname
DO_USER         # SSH username (usually 'root' or 'deploy')
CODECOV_TOKEN   # Token for Codecov (optional)
```

## Code Coverage

### Current Coverage

**Backend:**
- Statements: ~80%
- Branches: ~75%
- Functions: ~80%
- Lines: ~80%

**Frontend:**
- Statements: TBD (run tests to generate)
- Branches: TBD
- Functions: TBD
- Lines: TBD

### Coverage Reports

Coverage reports are:
- Generated locally in `coverage/` directory
- Uploaded to Codecov in CI
- Available in PR comments (if Codecov configured)

### Viewing Coverage

**Local:**
```bash
# Backend
cd backend
npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend
npm test -- --code-coverage
open coverage/index.html
```

**CI:**
- Check GitHub Actions artifacts
- View on Codecov dashboard (if configured)

## Manual Testing

### Backend API Testing

Use REST client (Thunder Client, Postman, Insomnia):

1. **Start backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Test endpoints:**
   - `POST /api/auth/register` - Create user
   - `POST /api/auth/login` - Get JWT token
   - `GET /api/auth/profile` - Verify authentication
   - `GET /api/rocks` - List rocks
   - `POST /api/rocks` - Create rock
   - `POST /api/rocks/:id/edges` - Add edge

### Frontend Manual Testing

1. **Start development server:**
   ```bash
   cd frontend
   npm start
   ```

2. **Test flows:**
   - Registration → Dashboard
   - Login → Dashboard
   - Create rock → Add edges → Complete edges
   - Offline mode → Create rock → Go online → Verify sync
   - Install as PWA → Test offline

### E2E Testing (Future)

**Planned Framework:** Playwright or Cypress

**Critical Flows to Test:**
1. Complete registration and login flow
2. Create rock → Add edges → Mark complete → Verify gem
3. Offline creation → Online sync
4. PWA installation and offline usage

## Performance Testing

### Bundle Size Monitoring

Frontend CI automatically reports bundle sizes:
- Initial chunk size
- Lazy-loaded chunks
- Total size comparison

**Thresholds:**
- Initial bundle: < 500 KB (raw), < 150 KB (transferred)
- Lazy chunks: < 100 KB each (raw)

### Lighthouse Scores

Run Lighthouse audits for:
- Performance: Target 90+
- Accessibility: Target 95+
- Best Practices: Target 95+
- SEO: Target 100
- PWA: Target 100

**Run Lighthouse:**
```bash
npm install -g lighthouse
lighthouse https://mentalquest-alchemy.com --view
```

## Deployment Checklist

Before deploying to production:

- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Bundle size within acceptable range
- [ ] Database migrations reviewed
- [ ] Environment variables configured
- [ ] Health check endpoint responsive
- [ ] PWA manifest configured correctly
- [ ] Service worker caching validated
- [ ] HTTPS certificate valid
- [ ] CORS configured for production domain
- [ ] Error logging configured
- [ ] Monitoring alerts set up

## Troubleshooting

### Tests Failing Locally

**Backend:**
```bash
# Clear Jest cache
npx jest --clearCache

# Run specific test file
npm test -- users.service.spec.ts

# Run with verbose output
npm test -- --verbose
```

**Frontend:**
```bash
# Clear Karma cache
rm -rf .angular/cache

# Run specific test file
npm test -- --include='**/*auth*.spec.ts'

# Debug in browser
npm test -- --browsers=Chrome --no-single-run
```

### CI Failing

1. Check GitHub Actions logs for specific error
2. Verify secrets are configured
3. Check database connection (backend)
4. Verify Chrome installation (frontend)
5. Check for dependency conflicts

### Deployment Issues

1. Verify SSH key has correct permissions
2. Check environment variables on server
3. Verify database credentials
4. Check PM2 process status: `pm2 status`
5. View application logs: `pm2 logs`
6. Check Nginx configuration
7. Verify port bindings

## Best Practices

1. **Write tests for new features** before implementation (TDD)
2. **Run tests locally** before pushing
3. **Keep tests fast** - unit tests should run in seconds
4. **Mock external dependencies** in unit tests
5. **Use descriptive test names** - describe what is being tested
6. **Test edge cases** - not just happy paths
7. **Maintain >80% coverage** for critical code
8. **Review test failures** in CI before merging
9. **Update tests** when changing implementation
10. **Document complex test setups** in comments

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Angular Testing Guide](https://angular.dev/guide/testing)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [PWA Testing Guide](https://web.dev/articles/pwa-checklist)
