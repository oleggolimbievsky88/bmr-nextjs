# OAuth Setup Guide - Google & Facebook

This guide will walk you through setting up Google and Facebook OAuth for your authentication system.

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `BMR Suspension` (or any name)
5. Click **"Create"**
6. Wait for the project to be created, then select it

### Step 2: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: `BMR Suspension`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On **Scopes** page, click **"Save and Continue"** (default scopes are fine)
7. On **Test users** page (if in testing), you can add test emails, then click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. Choose **"Web application"** as the application type
5. Give it a name: `BMR Suspension Web Client`
6. **Authorized JavaScript origins** - Add:
   ```
   http://localhost:3000
   https://dev.bmrsuspension.com
   https://www.bmrsuspension.com
   ```
7. **Authorized redirect URIs** - Add:
   ```
   http://localhost:3000/api/auth/callback/google
   https://dev.bmrsuspension.com/api/auth/callback/google
   https://www.bmrsuspension.com/api/auth/callback/google
   ```
8. Click **"Create"**
9. **Copy your Client ID and Client Secret** - You'll need these!

### Step 5: Add to Environment Variables

Add to your `.env.local` or Vercel:
```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top right
3. Click **"Create App"**
4. Choose **"Consumer"** as the app type (or "Business" if you prefer)
5. Fill in:
   - **App Display Name**: `BMR Suspension`
   - **App Contact Email**: Your email
6. Click **"Create App"**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **"Add Products to Your App"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** as the platform
4. You'll be taken to the Facebook Login settings

### Step 3: Configure Facebook Login

1. In the left sidebar, go to **"Settings"** → **"Basic"**
2. Note your **App ID** and **App Secret** (you'll need these!)
3. Add **App Domains**:
   ```
   bmrsuspension.com
   dev.bmrsuspension.com
   ```
4. Add **Privacy Policy URL** (required):
   ```
   https://www.bmrsuspension.com/privacy-policy
   ```
   (You'll need to create this page or use an existing one)

### Step 4: Configure Valid OAuth Redirect URIs

1. In the left sidebar, go to **"Facebook Login"** → **"Settings"**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://dev.bmrsuspension.com/api/auth/callback/facebook
   https://www.bmrsuspension.com/api/auth/callback/facebook
   ```
3. Click **"Save Changes"**

### Step 5: Get App Secret

1. Go to **"Settings"** → **"Basic"**
2. Click **"Show"** next to App Secret
3. Enter your Facebook password to reveal it
4. **Copy the App Secret** - You'll need this!

### Step 6: Add to Environment Variables

Add to your `.env.local` or Vercel:
```
FACEBOOK_CLIENT_ID=your-app-id-here
FACEBOOK_CLIENT_SECRET=your-app-secret-here
```

---

## Testing Your OAuth Setup

### Local Testing

1. Make sure your `.env.local` has:
   ```
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_CLIENT_ID=your-facebook-app-id
   FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
   ```

2. Start your dev server:
   ```bash
   pnpm dev
   ```

3. Go to `/login` or `/register`
4. Click "Sign in with Google" or "Sign in with Facebook"
5. You should be redirected to the OAuth provider's login page

### Production Testing

1. Make sure your Vercel environment variables are set
2. Set `NEXTAUTH_URL` to your production domain
3. Make sure the redirect URIs in Google/Facebook match your production domain
4. Test the OAuth buttons on your live site

---

## Important Notes

### Google OAuth

- **Testing Mode**: Your app starts in testing mode. Only you and test users can sign in
- **Publishing**: To allow all users, you need to submit your app for verification (not required for basic email/name access)
- **Quota Limits**: Free tier has generous limits for OAuth

### Facebook OAuth

- **App Review**: For production use, you may need to submit for App Review
- **Basic Permissions**: Email and public profile don't require review
- **Privacy Policy**: Required - make sure you have one
- **Terms of Service**: Also recommended

### Security

- **Never commit** your Client IDs or Secrets to git
- **Use environment variables** only
- **Rotate secrets** if they're ever exposed
- **Use different apps** for development and production (recommended)

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Console exactly matches: `https://yourdomain.com/api/auth/callback/google`
- Check for trailing slashes, http vs https, etc.

**Error: "access_denied"**
- Make sure your OAuth consent screen is configured
- Check if you're in testing mode and the user is added as a test user

### Facebook OAuth Issues

**Error: "Invalid OAuth access token"**
- Make sure your App ID and App Secret are correct
- Check that your redirect URIs are added in Facebook settings

**Error: "App Not Setup"**
- Make sure Facebook Login product is added to your app
- Verify your app is not in development mode restrictions (if needed)

### General Issues

**OAuth buttons not showing**
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure NextAuth is properly configured

**Redirect loops**
- Check `NEXTAUTH_URL` matches your actual domain
- Verify callback URLs are correct in provider settings

---

## Quick Reference

### Google OAuth URLs
- Console: https://console.cloud.google.com/
- OAuth Consent: APIs & Services → OAuth consent screen
- Credentials: APIs & Services → Credentials

### Facebook OAuth URLs
- Developers: https://developers.facebook.com/
- App Dashboard: https://developers.facebook.com/apps/
- Settings: Your App → Settings → Basic

### Required Redirect URIs

**Google:**
- `http://localhost:3000/api/auth/callback/google`
- `https://dev.bmrsuspension.com/api/auth/callback/google`
- `https://www.bmrsuspension.com/api/auth/callback/google`

**Facebook:**
- `http://localhost:3000/api/auth/callback/facebook`
- `https://dev.bmrsuspension.com/api/auth/callback/facebook`
- `https://www.bmrsuspension.com/api/auth/callback/facebook`

### If Google or Facebook login doesn't work

1. **Environment variables** – In production (e.g. Vercel → Settings → Environment Variables), ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, and `FACEBOOK_CLIENT_SECRET` are set and enabled for the Production environment.
2. **Callback URLs** – In Google Cloud Console and Facebook App settings, the redirect URIs must use your live domain (e.g. `https://www.bmrsuspension.com/api/auth/callback/google`).
3. **NextAuth URL** – Set `NEXTAUTH_URL` to your production URL (e.g. `https://www.bmrsuspension.com`) so OAuth redirects back to the correct site.
