# Deployment Guide

This guide will help you deploy your M8BS Dashboard to production and ensure the login is properly connected.

## Quick Overview

Your login is **already linked** to the site! Here's how it works:
- Login page: `/login`
- After successful login: Redirects to `/` (dashboard)
- Protected routes: Middleware automatically redirects unauthenticated users to `/login`
- Root page (`/`): Redirects to `/login` if not authenticated

## Deployment Options

### Option 1: Deploy to Vercel (Recommended - Easiest for Next.js)

Vercel is the easiest way to deploy Next.js applications.

#### Step 1: Prepare Your Code

1. Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. Commit all your changes:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

#### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Important:** Replace `NEXT_PUBLIC_SITE_URL` with your actual Vercel deployment URL after the first deploy.

#### Step 4: Configure Supabase for Production

1. Go to your Supabase project dashboard
2. Navigate to **Settings > Authentication > URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: 
     - `https://your-domain.vercel.app/**`
     - `https://your-domain.vercel.app/login`
     - `https://your-domain.vercel.app/`

4. Save the changes

#### Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your site will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy to Other Platforms

#### Netlify

1. Connect your Git repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add the same environment variables as above
4. Configure Supabase redirect URLs with your Netlify domain

#### Self-Hosted (VPS/Server)

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Use a reverse proxy (nginx) to serve on port 80/443
4. Set up SSL with Let's Encrypt
5. Configure environment variables in your hosting environment

---

## Verifying Login Connection

After deployment, test the login flow:

1. **Visit your site**: `https://your-domain.com`
   - Should redirect to `/login` if not authenticated

2. **Login**: Enter credentials at `/login`
   - Should redirect to `/` (dashboard) after successful login

3. **Protected Routes**: Try accessing `/business-dashboard` without logging in
   - Should redirect to `/login`

4. **Session Persistence**: Refresh the page after logging in
   - Should stay logged in

## Troubleshooting

### Login Not Working After Deployment

1. **Check Environment Variables**
   - Verify all Supabase variables are set in your hosting platform
   - Make sure `NEXT_PUBLIC_SITE_URL` matches your actual domain

2. **Check Supabase Configuration**
   - Verify redirect URLs in Supabase dashboard
   - Ensure Site URL matches your deployment URL

3. **Check Browser Console**
   - Look for CORS errors
   - Check for missing environment variables

4. **Verify Middleware**
   - The middleware in `middleware.ts` handles route protection
   - It should automatically redirect unauthenticated users

### Common Issues

**Issue**: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- **Solution**: Add environment variables to your hosting platform

**Issue**: Login redirects but shows error
- **Solution**: Check Supabase redirect URLs include your production domain

**Issue**: Session not persisting
- **Solution**: Ensure cookies are enabled and not blocked by browser settings

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase redirect URLs updated
- [ ] Site URL matches deployment URL
- [ ] SSL certificate installed (HTTPS)
- [ ] Test login flow works
- [ ] Test protected routes redirect properly
- [ ] Test session persistence
- [ ] Database migrations applied to production Supabase

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase project is active
3. Ensure database tables and RLS policies are set up
4. Review the `SETUP.md` file for local development setup




