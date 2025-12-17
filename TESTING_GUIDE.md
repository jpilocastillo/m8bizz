# Multi-User Testing Guide

This guide explains how to test the application to ensure it's ready for multiple users.

## Overview

The application uses Supabase Row Level Security (RLS) policies to ensure data isolation between users. This testing guide covers:

1. **Unit/Integration Tests** - Automated tests for RLS and data isolation
2. **Multi-User Simulation** - Script to simulate concurrent user operations
3. **Manual Testing** - Steps for manual verification

## Prerequisites

1. Ensure test users are created:
   ```bash
   npm run create-test-users
   ```

2. Verify environment variables are set in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Running Tests

### 1. Install Dependencies

First, install the testing dependencies:

```bash
npm install
```

### 2. Run Integration Tests

Run the automated integration tests that verify RLS policies and data isolation:

```bash
npm test
```

Or run in watch mode:

```bash
npm run test:watch
```

The tests cover:
- ✅ Users can only access their own data
- ✅ Users cannot see other users' data
- ✅ Concurrent operations work correctly
- ✅ Data isolation across all tables (business_goals, campaigns, etc.)

### 3. Run Multi-User Simulation

Run the multi-user simulation script to test concurrent operations:

```bash
npm run test:multi-user
```

This script:
- Simulates 4 users performing operations simultaneously
- Tests data creation, retrieval, and isolation
- Verifies that each user can only see their own data
- Reports any data leakage or isolation failures

## What to Test

### Data Isolation

1. **Business Goals**
   - User A creates business goals
   - User B should NOT see User A's goals
   - User B can create their own goals
   - Both users' data should be separate

2. **Marketing Campaigns**
   - Each user can create campaigns
   - Users cannot see other users' campaigns
   - Campaign data is properly isolated

3. **Complete Data Sets**
   - Users can save complete advisor basecamp data
   - Each user's complete dataset is isolated
   - No cross-contamination between users

### Concurrent Operations

1. **Simultaneous Saves**
   - Multiple users saving data at the same time
   - No data corruption or mixing
   - Each user's data remains intact

2. **Concurrent Reads**
   - Multiple users reading their data simultaneously
   - No performance degradation
   - Data remains consistent

### Authentication

1. **Session Isolation**
   - Each user has their own session
   - Sessions don't interfere with each other
   - Logout doesn't affect other users

2. **Access Control**
   - Unauthenticated users cannot access data
   - Users cannot access admin routes
   - Proper redirects for unauthorized access

## Manual Testing Steps

### Test Scenario 1: Basic Data Isolation

1. **Setup**: Create two test users (or use existing ones)
   - User 1: `john.doe@example.com` / `password123`
   - User 2: `jane.smith@example.com` / `password123`

2. **Test Steps**:
   - Log in as User 1
   - Fill out the business dashboard form with unique values
   - Save the data
   - Log out
   - Log in as User 2
   - Verify User 2 does NOT see User 1's data
   - Fill out the form with different values
   - Save the data
   - Log out and log back in as User 1
   - Verify User 1 still sees their original data

### Test Scenario 2: Concurrent Operations

1. **Setup**: Open the application in two different browsers (or incognito windows)

2. **Test Steps**:
   - Browser 1: Log in as User 1
   - Browser 2: Log in as User 2
   - Simultaneously:
     - Browser 1: Save data for User 1
     - Browser 2: Save data for User 2
   - Verify both saves succeed
   - Verify each user only sees their own data

### Test Scenario 3: Campaign Isolation

1. **Test Steps**:
   - User 1: Create a campaign named "User 1 Campaign"
   - User 2: Create a campaign named "User 2 Campaign"
   - User 1: Verify they only see "User 1 Campaign"
   - User 2: Verify they only see "User 2 Campaign"

## Expected Results

### ✅ Success Indicators

- All integration tests pass
- Multi-user simulation completes without errors
- Each user can only see their own data
- No data leakage between users
- Concurrent operations complete successfully
- No performance issues with multiple users

### ❌ Failure Indicators

- Users can see other users' data
- Data from one user appears in another user's view
- Concurrent saves cause data corruption
- Tests fail with RLS policy errors
- Performance degrades significantly with multiple users

## Troubleshooting

### Tests Fail with "Missing Supabase environment variables"

- Ensure `.env.local` exists and contains all required variables
- Verify the variables are correctly named
- Check that the Supabase project is accessible

### Tests Fail with "User not found"

- Run `npm run create-test-users` to create test users
- Verify test users exist in Supabase dashboard
- Check that user emails match the test script

### RLS Policy Errors

- Verify RLS policies are enabled in Supabase
- Run `npm run setup-admin` to ensure policies are set up
- Check Supabase migration files are applied

### Data Isolation Failures

- Verify RLS policies are correctly configured
- Check that `user_id` is properly set on all inserts
- Ensure `auth.uid()` is used in RLS policies
- Review the `fix-rls-policies.ts` script output

## Continuous Testing

For continuous integration, add these tests to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run multi-user simulation
  run: npm run test:multi-user
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/)

## Support

If you encounter issues:
1. Check the test output for specific error messages
2. Verify environment variables are set correctly
3. Ensure test users exist in the database
4. Review Supabase logs for RLS policy violations



