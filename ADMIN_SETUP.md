# Admin Setup Guide

This guide explains how to set up and use the admin functionality for the M8BS Dashboard.

## Overview

The admin system allows authorized administrators to:
- View all user data
- Monitor system usage
- Access user advisor basecamp data
- Manage user accounts

## Setup Instructions

### 1. Create Admin User

First, create an admin user using the provided script:

```bash
npm run create-admin admin@example.com yourpassword123
```

This will:
- Create a user in Supabase Auth
- Create a profile with admin role
- Enable access to the admin dashboard

### 2. Access Admin Panel

Navigate to `/admin/login` and sign in with your admin credentials.

### 3. Admin Dashboard Features

#### User Management
- View all registered users
- Search and filter users by role
- View user statistics (events, clients, revenue)
- Access individual user data

#### User Data Viewing
- **Overview**: Basic user statistics
- **Advisor Data**: View user's advisor basecamp data including:
  - Business goals
  - Current values
  - Client metrics
  - Marketing campaigns
  - Commission rates
  - Financial book data

#### Security Features
- Role-based access control
- Admin-only routes protected by middleware
- Session management
- Secure authentication

## Admin Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main admin dashboard

## Security Considerations

1. **Role Verification**: The system checks for admin role on every admin route access
2. **Middleware Protection**: All admin routes are protected by middleware
3. **Session Management**: Proper session handling and logout functionality
4. **Data Access**: Admins can view but not modify user data (read-only access)

## Database Schema

The admin system uses the existing `profiles` table with a `role` field:
- `user`: Regular user access
- `admin`: Full admin access

## Troubleshooting

### Common Issues

1. **"Access denied" error**
   - Ensure the user has `role: "admin"` in the profiles table
   - Check that the user exists in both auth and profiles tables

2. **Middleware errors**
   - Verify Supabase environment variables are set
   - Check that the middleware is properly configured

3. **Cannot create admin user**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
   - Verify the script has proper permissions

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage Examples

### Viewing User Data

1. Log in to admin dashboard
2. Select a user from the list
3. View their data in the tabs:
   - Overview: Basic stats
   - Advisor Data: Detailed advisor basecamp information
   - Events: Marketing events (future feature)
   - Financial: Financial data (future feature)

### Managing Users

The admin dashboard provides:
- User search and filtering
- Role-based user lists
- User statistics overview
- Individual user data access

## Future Enhancements

- User account management (suspend, delete)
- System-wide analytics
- Bulk data export
- User activity monitoring
- Advanced filtering and search 