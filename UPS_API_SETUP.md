# UPS API Credentials Setup Guide

## New OAuth 2.0 Credentials

You've received new UPS API credentials using OAuth 2.0 (Client Credentials flow). Here's how to configure them:

## Credentials Received

- **Client ID**: `281ZfMGZtGIIoUDcOpvLHuoYrdVhyG68PEAUpdfy8k53MemE`
- **Client Secret**: `SrxbT15HqjMGbWMdXkr8phm6qpURdLcAG3f4AZqfzpaosxoFdrBgd3Qpaqen5hXR`
- **Billing Account Number**: `3A54E9`
- **Callback URL**: `https://preview.bmrsuspension.com/api/ups/callback` (registered but not used for Client Credentials flow)

## Step 1: Update Environment Variables

### Local Development (.env.local)

Create or update your `.env.local` file in the project root:

```bash
UPS_CLIENT_ID=281ZfMGZtGIIoUDcOpvLHuoYrdVhyG68PEAUpdfy8k53MemE
UPS_CLIENT_SECRET=SrxbT15HqjMGbWMdXkr8phm6qpURdLcAG3f4AZqfzpaosxoFdrBgd3Qpaqen5hXR
UPS_ACCOUNT_NUMBER=3A54E9
```

### Vercel Production Environment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update the following variables:

   - **UPS_CLIENT_ID**: `281ZfMGZtGIIoUDcOpvLHuoYrdVhyG68PEAUpdfy8k53MemE`
   - **UPS_CLIENT_SECRET**: `SrxbT15HqjMGbWMdXkr8phm6qpURdLcAG3f4AZqfzpaosxoFdrBgd3Qpaqen5hXR`
   - **UPS_ACCOUNT_NUMBER**: `3A54E9`

4. Make sure these are set for **Production**, **Preview**, and **Development** environments
5. Click **Save** and redeploy your application

## Step 2: Verify API Route Configuration

The API route at `app/api/ups-shipping-rates/route.js` is already configured to use OAuth 2.0. It will:

1. Use `UPS_CLIENT_ID` and `UPS_CLIENT_SECRET` for authentication
2. Fall back to `UPS_ACCESS_KEY` and `UPS_PASSWORD` if the new variables aren't set (for backward compatibility)
3. Use `UPS_ACCOUNT_NUMBER` for the billing account

## Step 3: Test the Integration

### Test Locally

1. Make sure your `.env.local` file has the new credentials
2. Start your development server: `pnpm dev`
3. Go through the checkout process and verify shipping rates load correctly
4. Check the browser console and server logs for any errors

### Test in Production

1. After updating Vercel environment variables, trigger a new deployment
2. Test the checkout flow on your preview/production site
3. Verify shipping rates are calculated correctly

## How It Works

The UPS integration uses **OAuth 2.0 Client Credentials flow**:

1. **Authentication**: The API route makes a request to UPS OAuth endpoint with Client ID and Client Secret
2. **Token**: UPS returns an access token
3. **Rating Request**: The access token is used to authenticate Rating API requests
4. **Response**: UPS returns shipping rates which are displayed to the user

## API Endpoints Used

- **OAuth Token**: `https://onlinetools.ups.com/security/v1/oauth/token` (Production)
- **Rating API**: `https://onlinetools.ups.com/api/rating/v1/Rate` (Production)
- **Test Environment**: `https://wwwcie.ups.com` (when `NODE_ENV=development` or `UPS_TEST_MODE=true`)

## Troubleshooting

### Shipping Rates Not Loading

1. **Check Environment Variables**: Verify all three variables are set correctly
2. **Check Logs**: Look for OAuth errors in server logs
3. **Verify Account Status**: Ensure your UPS account is active and billing is set up
4. **Test Mode**: If testing, ensure `UPS_TEST_MODE=true` is set for test environment

### Common Errors

- **401 Unauthorized**: Check that Client ID and Client Secret are correct
- **403 Forbidden**: Verify your UPS account has Rating API access approved
- **400 Bad Request**: Check that the account number format is correct (should be like `3A54E9`)

### Fallback Behavior

If the UPS API fails, the system will automatically fall back to free shipping. This ensures the checkout process continues even if UPS is temporarily unavailable.

## Security Notes

- ✅ Never commit credentials to version control
- ✅ Use environment variables for all sensitive data
- ✅ The callback URL is registered but not actively used (normal for Client Credentials flow)
- ✅ All API calls are made server-side only

## Next Steps

1. Update your `.env.local` file with the new credentials
2. Update Vercel environment variables
3. Test the shipping rates functionality
4. Monitor logs for any issues

If you encounter any issues, check the server logs for detailed error messages from the UPS API.

