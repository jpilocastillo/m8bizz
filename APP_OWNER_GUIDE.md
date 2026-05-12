# App Owner Guide (Non-Technical)

This guide is for the business owner of this app.  
It explains what each platform does and how to make common updates safely.

---

## The 3 Platforms You Use

### 1) GitHub (your code library + change history)

Think of GitHub as:
- The **master folder** for your app files
- A **version history** of every change
- A place where developers collaborate safely

You use GitHub to:
- Store app code
- Track who changed what and when
- Restore older versions if needed
- Trigger automatic deploys to Vercel

---

## Coding Languages Used in This App (and Why)

### TypeScript (main app language)

What it does:
- Runs the app logic for pages, components, and business behavior
- Adds type safety (extra checks) on top of JavaScript

Why we use it:
- Reduces bugs before code goes live
- Makes future updates safer and faster for developers
- Improves maintainability as the app grows

---

### TSX (React component language)

What it does:
- Builds the screen layout and UI components (forms, dashboard cards, buttons)
- Combines TypeScript logic + UI structure in one component file

Why we use it:
- Keeps each feature's UI and logic together
- Makes component updates faster and more consistent

---

### SQL (for Supabase/Postgres)

What it does:
- Creates and updates database structure (tables, columns, indexes)
- Defines security rules (RLS policies) for who can view/edit data
- Handles controlled database changes through migrations

Why we use it:
- Supabase is built on Postgres, and SQL is the standard language for it
- Gives precise, reliable control of data and security
- Keeps database changes trackable and reversible through migration history

---

### JavaScript (tooling/runtime ecosystem)

What it does:
- Supports app runtime and package tooling around the TypeScript codebase
- Powers scripts and dependencies used by build/test workflows

Why we use it:
- It is the core web ecosystem language
- Most frontend and build tools are designed around JS/TS

---

### CSS (styling)

What it does:
- Controls visual design: spacing, colors, sizing, responsiveness

Why we use it:
- Keeps the app usable and consistent across devices
- Separates design styling from business logic

---

### 2) Supabase (your database + login system)

Think of Supabase as:
- Your app’s **data storage**
- The **user account/login** system
- Security rules for who can see/edit data

You use Supabase to:
- View and edit app records (tables)
- Manage users and access
- Run database updates (migrations)

---

### 3) Vercel (your live website hosting)

Think of Vercel as:
- The place that **publishes your app online**
- The service that **auto-updates** your website after approved code changes

You use Vercel to:
- Deploy new versions
- Check if deployments succeed or fail
- Set environment variables (private app settings)

---

## How Changes Flow (Simple)

1. A change is made in GitHub  
2. Vercel automatically builds and deploys it  
3. The live app updates  
4. Supabase continues providing data and login

If the build fails, Vercel keeps the previous working version live.

---

## What You Can Safely Adjust (Without Coding)

## A) Manage users (who can log in)

Use: **Supabase Dashboard**

1. Open Supabase project
2. Go to **Authentication** (Users)
3. Add, remove, or review users
4. If needed, ask developer to confirm role permissions in profile data

Best practice:
- Never share admin credentials
- Remove access immediately for departed staff

---

## B) Update app data (business numbers/content in tables)

Use: **Supabase Dashboard**

1. Go to **Table Editor**
2. Open the correct table
3. Edit only known fields
4. Save and verify in the live app

Best practice:
- Change one item at a time
- Keep a small changelog note (date, table, what changed)

---

## C) Publish code updates from developer

Use: **GitHub + Vercel**

Typical workflow:
1. Developer prepares change in GitHub
2. You review and approve (if your process requires it)
3. Merge approved change
4. Watch deployment in Vercel
5. Test key app pages

What to check in Vercel:
- Deployment status = **Ready**
- No build errors
- Production URL loads and login works

---

## D) Update private settings (keys/URLs)

Use: **Vercel Project Settings > Environment Variables**

Common examples:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Important:
- Never share secrets in email/chat
- After changing variables, redeploy and retest login

---

## E) Keep login working after domain changes

If your website domain changes:

1. Update domain in **Vercel**
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars
3. In Supabase, update:
   - **Site URL**
   - **Redirect URLs**
4. Redeploy and test login/logout flow

---

## Monthly Owner Checklist (15 minutes)

- Confirm site is online
- Confirm login works
- Review new users and remove old access
- Spot-check critical dashboard data
- Check latest Vercel deploy status
- Confirm no urgent Supabase warnings

---

## Before Any Big Change

Ask your developer for:
- What will change
- Rollback plan
- Test checklist
- ETA and expected downtime (if any)

---

## Red Flags (ask developer immediately)

- Users cannot log in
- Data is missing or looks incorrect
- Vercel deployments repeatedly fail
- Supabase security or policy warnings appear
- Unexpected permissions/access behavior

---

## Quick Glossary

- **Repository (GitHub):** The project folder with full version history  
- **Deploy (Vercel):** Publish an updated app version to the live site  
- **Environment Variable:** A private app setting (often a key or URL)  
- **Database Table (Supabase):** Structured rows/columns where app data lives  
- **Migration:** A controlled database update

---

## Suggested Access Setup

For safety, use least-access roles:
- **Owner Account:** Admin access to billing and project settings
- **Developer Account:** Technical access for code and database updates
- **Read-Only Stakeholder (optional):** View-only where possible

Use 2-factor authentication on GitHub, Supabase, and Vercel.
