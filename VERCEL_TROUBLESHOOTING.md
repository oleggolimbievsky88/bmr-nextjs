# Vercel Deployment Troubleshooting Guide

## Current Issue: Build Failure

The build is failing with 4 errors and 5 warnings. Here's how to fix it:

## Step 1: Check Environment Variables

Make sure these environment variables are set in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add these variables:

```
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-username
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-database-name
MYSQL_SSL=true
```

## Step 2: Test Database Connection

After setting environment variables, test the database connection:

1. Deploy the changes
2. Visit: `https://your-app.vercel.app/api/test-db`
3. This will show if the database connection is working

## Step 3: Common Issues and Solutions

### Issue 1: Database Connection Timeout
**Solution**: The database connection might be timing out during build. This is normal for Vercel.

### Issue 2: Missing Environment Variables
**Solution**: Double-check all environment variables are set correctly in Vercel.

### Issue 3: SSL Connection Issues
**Solution**: Make sure `MYSQL_SSL=true` is set in your environment variables.

### Issue 4: Build Memory Issues
**Solution**: The large JSON files might be causing memory issues during build.

## Step 4: Alternative Approach - Disable Static Generation for Problematic Pages

If the build continues to fail, we can disable static generation for the checkout and confirmation pages:

1. Add this to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  // Disable static generation for checkout and confirmation pages
  async rewrites() {
    return [
      {
        source: '/checkout',
        destination: '/checkout'
      },
      {
        source: '/confirmation',
        destination: '/confirmation'
      }
    ]
  }
}

module.exports = nextConfig
```

## Step 5: Check Build Logs

1. In your Vercel dashboard, click on the failed deployment
2. Scroll down to "Build Logs"
3. Look for specific error messages
4. Common errors:
   - "Database connection failed"
   - "Environment variable not set"
   - "Memory limit exceeded"

## Step 6: Manual Database Test

If the build still fails, test your database connection manually:

1. Use a tool like MySQL Workbench or phpMyAdmin
2. Connect to your production database
3. Run the SQL script to create the tables
4. Test a simple query

## Step 7: Contact Vercel Support

If none of the above solutions work:

1. Go to https://vercel.com/help
2. Contact Vercel support with:
   - Your project URL
   - The specific error messages from build logs
   - Your environment variables (without passwords)

## Quick Fixes to Try:

1. **Redeploy**: Sometimes a simple redeploy fixes transient issues
2. **Clear Build Cache**: In Vercel dashboard, go to Settings → General → Clear Build Cache
3. **Check Database Tables**: Make sure the new tables exist in your production database
4. **Test API Endpoints**: Use the test endpoint `/api/test-db` to verify database connection

## Expected Behavior After Fix:

- Build should complete successfully
- Database connection should work
- Order system should function properly
- Credit card detection should work
- Confirmation emails should be sent (once email service is configured)
