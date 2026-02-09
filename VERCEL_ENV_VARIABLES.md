# Vercel Environment Variables

Copy and paste these into your Vercel project settings under **Settings → Environment Variables**.

## ⚠️ Required in production: NEXTAUTH_SECRET

If you see **`[next-auth][error][NO_SECRET]`** or "Please define a `secret` in production" in Vercel logs, add **`NEXTAUTH_SECRET`**:

1. **Vercel** → your project → **Settings** → **Environment Variables**
2. **Add**: Name `NEXTAUTH_SECRET`, Value = a random string (see below)
3. **Environments**: check **Production** (and Preview if you use auth there)
4. **Save** and **redeploy** the project

Generate a value (run locally):
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32 — then paste the result as the value. Do not use a placeholder like `your-secret-key-here` in production.

## SMTP Configuration Notes

**You can use any SMTP server** - it doesn't have to be Gmail! Common options:
- **Custom domain SMTP** (recommended): `mail.yourdomain.com` or `smtp.yourdomain.com`
- **Gmail**: `smtp.gmail.com` (requires app password)
- **SendGrid**: `smtp.sendgrid.net`
- **Mailgun**: `smtp.mailgun.org`
- **AWS SES**: `email-smtp.region.amazonaws.com`

**Common SMTP ports:**
- `587` - STARTTLS (set `SMTP_SECURE=false`)
- `465` - SSL/TLS (set `SMTP_SECURE=true`)
- `25` - Usually blocked by hosting providers

## Required Variables

```
NEXTAUTH_URL=https://dev.bmrsuspension.com
NEXTAUTH_SECRET=your-secret-key-here
MYSQL_HOST=your_host
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=bmrsuspension
MYSQL_SSL=true
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@bmrsuspension.com
SMTP_FROM_NAME=BMR Suspension
```

## PayPal (for checkout)

```
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_SANDBOX=false
```

- Set `PAYPAL_SANDBOX=true` only for sandbox/testing. Use `false` or leave unset for live payments.
- **Production:** ensure these are set for the **Production** environment in Vercel (not only Preview).

## Optional OAuth Variables (if using Google/Facebook login)

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## Instructions for Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable above:
   - Click **Add New**
   - Paste the variable name (left side)
   - Paste the variable value (right side)
   - Select the environments (Production, Preview, Development)
   - Click **Save**

## Environment-Specific Values

### For Production
Set `NEXTAUTH_URL` to:
```
NEXTAUTH_URL=https://www.bmrsuspension.com
```

### For Preview/Dev
Set `NEXTAUTH_URL` to:
```
NEXTAUTH_URL=https://dev.bmrsuspension.com
```

**Note:** You can set different values for Production, Preview, and Development environments in Vercel by selecting the appropriate environment when adding each variable.

## Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Quick Copy Format (One Variable Per Line)

```
NEXTAUTH_URL=https://dev.bmrsuspension.com
NEXTAUTH_SECRET=your-secret-key-here
MYSQL_HOST=your_host
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=bmrsuspension
MYSQL_SSL=true
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@bmrsuspension.com
SMTP_FROM_NAME=BMR Suspension
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```
