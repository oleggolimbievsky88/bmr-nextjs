# Authentication System Setup Guide

This guide will help you set up the complete authentication system for your BMR Suspension e-commerce site.

## Features

- ✅ User registration with email verification
- ✅ Login with email/password
- ✅ OAuth login (Google & Facebook)
- ✅ Password reset functionality
- ✅ User roles (customer, dealer, admin)
- ✅ Dealer discount tiers
- ✅ Account management (orders, profile, addresses)
- ✅ Protected routes with middleware
- ✅ Session management with NextAuth.js

## Database Setup

1. Run the database migration to add authentication tables:

```bash
mysql -u your_user -p your_database < database/auth_schema.sql
```

Or manually execute the SQL file in your MySQL client.

This will create:
- Additional columns in the `customers` table (emailVerified, role, dealerTier, dealerDiscount, etc.)
- `verification_tokens` table for email verification and password resets
- `accounts` table for OAuth accounts
- `sessions` table for NextAuth sessions

## Environment Variables

### For Local Development

Add the following environment variables to your `.env.local` file:

### For Vercel Deployment

See `VERCEL_ENV_VARIABLES.md` for a copy-paste ready format for Vercel environment variables.

```env
# NextAuth Configuration
# IMPORTANT: Set this to match where your app is actually running
# - Local development: http://localhost:3000
# - Dev/staging: https://dev.bmrsuspension.com
# - Production: https://www.bmrsuspension.com
NEXTAUTH_URL=http://localhost:3000  # Change to match your environment
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32


# Database (if not already set)
MYSQL_HOST=your_host
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=bmrsuspension

# Email Configuration (for verification emails)
# Use your custom domain SMTP server or any SMTP provider
SMTP_HOST=mail.yourdomain.com  # or smtp.yourdomain.com, smtp.gmail.com, etc.
SMTP_PORT=587  # or 465 for SSL
SMTP_SECURE=false  # true for port 465, false for port 587
SMTP_USER=noreply@yourdomain.com  # or your-email@gmail.com for Gmail
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@bmrsuspension.com  # Should match your domain
SMTP_FROM_NAME=BMR Suspension

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (Optional - for Facebook Sign-In)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## Setting Up OAuth Providers

**📖 For detailed step-by-step instructions, see `OAUTH_SETUP_GUIDE.md`**

### Quick Overview

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth client ID (Web application)
5. Add redirect URIs: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

**Facebook OAuth:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Configure redirect URIs: `https://yourdomain.com/api/auth/callback/facebook`
5. Copy App ID and App Secret

**Note:** OAuth providers are optional. The system works without them using email/password authentication only.

See `OAUTH_SETUP_GUIDE.md` for complete step-by-step instructions with screenshots guidance.

## Email Configuration

You can use **any SMTP server** - it doesn't have to be Gmail. Common options include:

### Custom Domain SMTP (Recommended)
If you have your own domain email (e.g., `noreply@bmrsuspension.com`), use your domain's SMTP server:

```env
SMTP_HOST=mail.yourdomain.com  # or smtp.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_SECURE=false  # true for port 465
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@bmrsuspension.com
SMTP_FROM_NAME=BMR Suspension
```

**Common SMTP ports:**
- `587` - STARTTLS (SMTP_SECURE=false)
- `465` - SSL/TLS (SMTP_SECURE=true)
- `25` - Usually blocked by hosting providers

### Gmail Setup (Alternative)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS`

### Other SMTP Providers

You can also use third-party SMTP services:
- **SendGrid** - `smtp.sendgrid.net` (port 587)
- **Mailgun** - `smtp.mailgun.org` (port 587)
- **AWS SES** - `email-smtp.region.amazonaws.com` (port 587)
- **Postmark** - `smtp.postmarkapp.com` (port 587)

Just update the SMTP settings accordingly.

## User Roles

The system supports three user roles:

1. **customer** (default) - Regular customers
2. **dealer** - Dealers with discount tiers (1-5)
3. **admin** - Administrators

### Setting Dealer Tiers

Dealers can have different discount tiers (1-5) with corresponding discount percentages stored in `dealerDiscount`. You can manually set these in the database or create an admin interface to manage them.

## Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/verify-email?token=...` - Email verification
- `/reset-password?token=...` - Password reset

### Protected Routes (require authentication)
- `/my-account` - Account dashboard
- `/my-account-orders` - Order history
- `/my-account-orders/[orderNumber]` - Order details
- `/my-account-edit` - Edit profile and addresses
- `/my-account-address` - Manage addresses
- `/my-account-wishlist` - Wishlist

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify-email?token=...` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Data (Protected)
- `GET /api/auth/my-profile` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile
- `GET /api/auth/my-orders` - Get user's orders

## Environment-Specific Configuration

### Local Development
```env
NEXTAUTH_URL=http://localhost:3000
```

### Dev/Staging Server
```env
NEXTAUTH_URL=https://dev.bmrsuspension.com
```

### Production
```env
NEXTAUTH_URL=https://www.bmrsuspension.com
```

**Important:** Always ensure `NEXTAUTH_URL` matches the actual domain where your app is running. This is critical for:
- OAuth callback URLs
- Email verification links
- Password reset links

## Testing

1. **Registration:**
   - Go to `/register`
   - Fill in the form
   - Check your email for verification link
   - Click the link to verify your email

2. **Login:**
   - Go to `/login`
   - Enter your credentials
   - Or use OAuth buttons (if configured)

3. **Password Reset:**
   - Click "Forgot your password?" on login page
   - Enter your email
   - Check email for reset link
   - Set new password

4. **Account Management:**
   - Log in and go to `/my-account`
   - View orders, edit profile, manage addresses

## Troubleshooting

### Email Not Sending
- Check SMTP credentials
- Verify SMTP port and security settings
- Check spam folder
- Test with `/api/test-email` endpoint

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client ID and secret
- Ensure OAuth app is in production mode (for Facebook)

### Database Errors
- Ensure all migrations have been run
- Check database connection settings
- Verify foreign key constraints

### Session Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies if needed

## Security Notes

- Passwords are hashed using bcrypt
- Email verification tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- Sessions use JWT tokens
- Protected routes are secured with middleware
- OAuth tokens are stored securely in the database

## Next Steps

1. Set up email service
2. Configure OAuth providers (optional)
3. Test registration and login flows
4. Set up dealer accounts manually or create admin interface
5. Customize email templates in `lib/email.js`
6. Add tracking information integration for orders
