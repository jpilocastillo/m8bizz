# Admin Dashboard Quick Start

This guide will help you quickly set up and use the admin dashboard for the M8BS Dashboard.

## 🚀 Quick Setup (3 steps)

### 1. Configure Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Get these values from:** Supabase Dashboard → Settings → API

### 2. Create Admin User

Run the setup script to create an admin user:

```bash
npm run setup-admin admin@example.com yourpassword123 "Admin Name" "Your Company"
```

### 3. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000/admin/login` and sign in with your admin credentials.

## 🔧 What the Admin Dashboard Provides

### User Management
- ✅ View all registered users
- ✅ Search and filter users by role
- ✅ View user statistics (events, clients, revenue)
- ✅ Access individual user data
- ✅ Create new users
- ✅ Edit user information
- ✅ Reset user passwords
- ✅ Delete users

### User Data Access
- ✅ **Overview**: Basic user statistics
- ✅ **Advisor Data**: Complete advisor basecamp data including:
  - Business goals
  - Current values (AUM, annuity)
  - Client metrics
  - Marketing campaigns
  - Commission rates
  - Financial book data

### Security Features
- ✅ Role-based access control
- ✅ Admin-only routes protected by middleware
- ✅ Session management
- ✅ Secure authentication

## 🛠️ Troubleshooting

### "Configuration Required" Error
If you see this error, it means your environment variables aren't set up correctly:

1. Make sure you have a `.env.local` file in your project root
2. Verify your Supabase credentials are correct
3. Restart your development server after making changes

### "Access denied" Error
This means the user doesn't have admin privileges:

1. Make sure you created the user with admin role
2. Check that the user exists in both auth and profiles tables
3. Verify the role field in the profiles table is set to "admin"

### Database Connection Issues
If you can't connect to the database:

1. Verify your Supabase project is active
2. Check that your database tables exist
3. Ensure RLS policies are properly configured
4. Verify your service role key has the correct permissions

## 📋 Available Scripts

- `npm run setup-admin` - Complete admin setup with verification
- `npm run create-admin` - Create admin user only
- `npm run make-admin` - Convert existing user to admin
- `npm run check-users` - Verify user data

## 🔗 Admin Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main admin dashboard

## 🎯 Next Steps

Once you have the admin dashboard working:

1. **Explore User Data**: Click on users to view their advisor basecamp data
2. **Manage Users**: Use the action buttons to create, edit, or manage users
3. **Monitor System**: View user statistics and system usage
4. **Security**: Regularly review user roles and access

## 📞 Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Ensure all required database tables exist
4. Check that RLS policies are properly configured

The admin dashboard provides comprehensive user management capabilities while maintaining security and data integrity.




















