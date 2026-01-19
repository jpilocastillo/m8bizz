# Email Configuration Guide for Password Reset

## Issue: Password Reset Emails Not Sending

If password reset emails are not being sent, you need to configure email settings in your Supabase project.

## Steps to Fix

### 1. Configure Email Templates in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Email Templates**
3. Find the **Reset Password** template
4. Ensure it's enabled and properly configured
5. The template should include a link like: `{{ .ConfirmationURL }}`

### 2. Configure SMTP Settings (Optional but Recommended)

If you want to use a custom SMTP server instead of Supabase's default email service:

1. Go to **Settings** > **Auth** > **SMTP Settings**
2. Configure your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
3. Enter your SMTP credentials
4. Test the connection

**Note:** Supabase provides a default email service, but it has rate limits. For production, consider using a custom SMTP provider.

### 3. Whitelist Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add your reset password URL to **Redirect URLs**:
   - `http://localhost:3000/reset-password` (for development)
   - `https://yourdomain.com/reset-password` (for production)

### 4. Enable Email Auth Provider

1. Go to **Authentication** > **Providers**
2. Ensure **Email** provider is enabled
3. Check that **Enable email confirmations** is configured as needed

### 5. Check Rate Limits

Supabase has rate limits on email sending:
- Free tier: Limited emails per hour
- Check your usage in the Supabase dashboard

### 6. Verify Email Service Status

1. Check Supabase status page for any email service outages
2. Review your Supabase project logs for email-related errors

## Testing

After configuration:

1. Try the forgot password flow again
2. Check the browser console for any errors
3. Check your email inbox (and spam folder)
4. Review Supabase logs in the dashboard

## Common Issues

### Issue: "Email rate limit exceeded"
**Solution:** Wait a few minutes and try again, or upgrade your Supabase plan

### Issue: "Invalid redirect URL"
**Solution:** Add the redirect URL to the whitelist in Supabase settings

### Issue: "Email template not found"
**Solution:** Ensure the Reset Password email template is enabled in Supabase

### Issue: Emails going to spam
**Solution:** 
- Configure SPF/DKIM records if using custom domain
- Use a reputable SMTP provider
- Check email content for spam triggers

## Alternative: Manual Password Reset (Admin)

If email configuration is not possible, you can reset passwords manually through the admin panel:

1. Go to Admin Dashboard
2. Navigate to User Management
3. Find the user
4. Use the "Reset Password" function

## Need Help?

If issues persist:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth
2. Review Supabase project logs
3. Contact Supabase support if you're on a paid plan

