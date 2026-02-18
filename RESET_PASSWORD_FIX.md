# Fix: Password Reset Link Redirects to Login

## Issue
When clicking the password reset link from the email, it redirects to the login page instead of the reset password page.

## Root Cause
Supabase uses the **Site URL** configured in the Supabase dashboard settings, not just the `redirectTo` parameter. If the Site URL or Redirect URLs aren't configured correctly, Supabase will redirect to the default login page.

## Solution

### ⚠️ CRITICAL: Configure Supabase Dashboard Settings First

**This is the most important step!** Supabase uses the Site URL from dashboard settings, not just the `redirectTo` parameter.

Go to your Supabase project dashboard:

1. Navigate to **Authentication** > **URL Configuration**
2. Set the **Site URL** to your base URL (NOT `/login`):
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
   - ❌ **DO NOT** set it to `http://localhost:3000/login` or any specific page
3. Add **Redirect URLs** (add ALL of these - one per line):
   ```
   http://localhost:3000/reset-password
   https://yourdomain.com/reset-password
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
   Or use wildcards:
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

**After making these changes, wait 1-2 minutes for Supabase to update, then test again.**

### 2. Verify Environment Variable

Make sure `NEXT_PUBLIC_SITE_URL` is set correctly:

```env
# .env.local (development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production (Vercel/Netlify/etc.)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Test the Flow

1. Request a password reset from `/forgot-password`
2. Check your email for the reset link
3. Click the link - it should go to `/reset-password` (not `/login`)
4. The reset password page should show the form to enter a new password

## What Was Fixed

1. **Middleware**: Updated to explicitly allow `/reset-password` and `/forgot-password` routes
2. **Recovery Session Handling**: Added safeguards to prevent redirects during recovery session processing
3. **Route Protection**: Ensured recovery sessions are not redirected away from reset password page

## Troubleshooting

### Still redirecting to login?

1. **Check Supabase Dashboard**:
   - Go to Authentication > URL Configuration
   - Verify Site URL matches your actual domain
   - Verify Redirect URLs include `/reset-password`

2. **Check Environment Variables**:
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly
   - Restart your development server after changing env vars

3. **Check Browser Console**:
   - Open browser dev tools
   - Look for any redirect errors or warnings
   - Check the Network tab to see where the redirect is happening

4. **Check the Reset Link**:
   - The link in the email should contain `?code=...` or `#access_token=...`
   - The domain should match your `NEXT_PUBLIC_SITE_URL`

### Common Issues

**Issue**: Link goes to `localhost:3000/login` instead of `localhost:3000/reset-password`
- **Solution**: Add `http://localhost:3000/reset-password` to Redirect URLs in Supabase dashboard

**Issue**: Link works in development but not in production
- **Solution**: Make sure production Site URL and Redirect URLs are configured in Supabase dashboard

**Issue**: "Invalid or expired link" error
- **Solution**: Reset links expire after 1 hour. Request a new one.

## Additional Notes

- The middleware now explicitly allows `/reset-password` and `/forgot-password` routes
- Recovery sessions are properly handled and won't be redirected
- The reset password page processes both PKCE flow (code parameter) and hash fragment flow

