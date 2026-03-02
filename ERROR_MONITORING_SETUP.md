# Error Monitoring Setup Guide

This application uses **Sentry** for comprehensive error monitoring and tracking in production.

## Overview

Sentry provides:
- **Real-time error tracking** - Get notified immediately when errors occur
- **Error context** - See user actions, stack traces, and environment details
- **Performance monitoring** - Track slow API calls and database queries
- **Session replay** - Watch user sessions to reproduce bugs
- **Release tracking** - Monitor errors by version/deployment

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (or use existing)
3. Create a new project
4. Select **Next.js** as your platform

### 2. Get Your DSN

1. In your Sentry project, go to **Settings** → **Projects** → **Client Keys (DSN)**
2. Copy your DSN (it looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Optional: Enable Sentry in development (default: disabled)
NEXT_PUBLIC_SENTRY_DEBUG=false

# Optional: Set app version for release tracking
NEXT_PUBLIC_APP_VERSION=1.0.0
```

For production, add these to your hosting platform's environment variables:
- **Vercel**: Add in Project Settings → Environment Variables
- **Netlify**: Add in Site Settings → Environment Variables
- **Other platforms**: Add via their respective environment variable configuration

### 4. Install Sentry Dependencies

The Sentry packages need to be installed. Run:

```bash
npm install @sentry/nextjs
```

Or if using pnpm:

```bash
pnpm add @sentry/nextjs
```

### 5. Run Sentry Wizard (Optional but Recommended)

Sentry provides a wizard to set up the configuration:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Install required packages
- Create configuration files
- Set up source maps
- Configure build process

**Note:** Since we've already created the configuration files, you can skip this step or let it update them.

### 6. Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Trigger a test error (you can add a test button temporarily):
   ```typescript
   <button onClick={() => { throw new Error("Test error") }}>
     Test Sentry
   </button>
   ```

3. Check your Sentry dashboard - you should see the error appear within seconds

## Configuration Files

The following files have been created for Sentry integration:

- **`sentry.client.config.ts`** - Client-side (browser) configuration
- **`sentry.server.config.ts`** - Server-side configuration
- **`sentry.edge.config.ts`** - Edge runtime configuration
- **`instrumentation.ts`** - Next.js instrumentation hook

## Features

### Automatic Error Tracking

Errors are automatically captured from:
- Unhandled exceptions
- Unhandled promise rejections
- React error boundaries
- Next.js error pages
- API route errors

### Logger Integration

The logger (`lib/logger.ts`) automatically sends errors to Sentry:

```typescript
import { logger } from "@/lib/logger"

// Errors are automatically sent to Sentry
logger.error("Something went wrong", error)

// Warnings are sent in production
logger.warn("Potential issue detected")

// Set user context for better error tracking
logger.setUser({ id: "user123", email: "user@example.com" })

// Add custom context
logger.setContext("checkout", { cartId: "cart123", amount: 99.99 })
logger.setTag("feature", "payment")
```

### Error Boundaries

React error boundaries are set up to catch component errors:
- **`components/error-boundary.tsx`** - Reusable error boundary component
- **`app/error.tsx`** - Next.js error page
- **`app/global-error.tsx`** - Global error handler

### User Context

User information is automatically attached to errors:
- User ID
- Email address
- Session information

This helps you:
- See which users are affected
- Filter errors by user
- Contact users if needed

### Performance Monitoring

Sentry automatically tracks:
- API route performance
- Database query times
- Page load times
- Component render times

### Session Replay

Session replay is enabled (with privacy settings):
- Text is masked by default
- Media is blocked by default
- Helps reproduce bugs by watching user sessions

## Best Practices

### 1. Don't Log Sensitive Information

Sentry will capture all error context. Avoid logging:
- Passwords
- Credit card numbers
- API keys
- Personal identifiable information (unless necessary)

### 2. Use Appropriate Log Levels

```typescript
// Use error for actual errors
logger.error("Database connection failed", error)

// Use warn for warnings
logger.warn("Rate limit approaching")

// Use info for important events
logger.info("User logged in", { userId })

// Use debug for development
logger.debug("Processing request", { requestId })
```

### 3. Add Context to Errors

```typescript
try {
  // Your code
} catch (error) {
  logger.error("Failed to process payment", error, {
    userId: user.id,
    amount: payment.amount,
    paymentMethod: payment.method,
  })
}
```

### 4. Filter Out Noise

Common errors that might be filtered:
- Browser extension errors
- Network errors from ad blockers
- Development-only errors

These are already configured in `sentry.client.config.ts`.

## Monitoring in Production

### Dashboard

1. Go to your Sentry project dashboard
2. View:
   - **Issues** - All errors grouped by type
   - **Performance** - Slow operations
   - **Releases** - Errors by version
   - **Users** - Affected users

### Alerts

Set up alerts in Sentry:
1. Go to **Alerts** → **Create Alert Rule**
2. Configure:
   - When error count exceeds threshold
   - When new error type appears
   - When error rate increases
3. Set notification channels:
   - Email
   - Slack
   - PagerDuty
   - Discord

### Release Tracking

Track errors by deployment:
1. Set `NEXT_PUBLIC_APP_VERSION` environment variable
2. Sentry will automatically group errors by version
3. See which deployments introduced bugs

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN is set:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Check Sentry is enabled:**
   - In development, errors are filtered unless `NEXT_PUBLIC_SENTRY_DEBUG=true`
   - In production, errors should always be sent

3. **Check browser console:**
   - Look for Sentry initialization messages
   - Check for network errors to Sentry API

4. **Verify configuration:**
   - Check `sentry.client.config.ts` and `sentry.server.config.ts`
   - Ensure `instrumentation.ts` exists

### Too Many Errors

1. **Adjust sample rate:**
   - Edit `tracesSampleRate` in config files
   - Lower value = fewer events (but still captures all errors)

2. **Filter specific errors:**
   - Add filters in `beforeSend` hook
   - Filter by error message, URL, etc.

### Performance Impact

Sentry has minimal performance impact:
- Errors are sent asynchronously
- Sample rates can be adjusted
- Client-side bundle size increase: ~50KB gzipped

## Next Steps

1. ✅ Set up Sentry account and get DSN
2. ✅ Add DSN to environment variables
3. ✅ Install Sentry packages
4. ✅ Test error tracking
5. ✅ Set up alerts
6. ✅ Configure release tracking
7. ✅ Set up team notifications

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Error Monitoring Guide](https://docs.sentry.io/product/issues/)

## Support

If you encounter issues:
1. Check Sentry status: https://status.sentry.io
2. Review Sentry documentation
3. Check application logs for Sentry initialization errors


