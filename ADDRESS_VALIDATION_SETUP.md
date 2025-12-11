# Address Validation & UPS Shipping Integration Setup

## Overview
This guide will help you set up address validation and UPS shipping rate calculation for your checkout process.

## 1. Google Maps API Setup (Address Validation)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing for the project

### Step 2: Enable Required APIs
1. Navigate to [API Library](https://console.cloud.google.com/apis/library)
2. Enable the following APIs:
   - **Address Validation API** (for address validation)
   - **Places API** (for address autocomplete)
3. Click "Enable" for each API

### Step 3: Get API Key
1. Go to [Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "API Key"
3. Copy the API key

### Step 4: Configure Environment Variables
Add to your `.env.local` file:
```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 2. UPS API Setup (Shipping Rates)

### Step 1: Create UPS Developer Account
1. Visit [UPS Developer Portal](https://www.ups.com/upsdeveloperkit)
2. Sign up or log in to your existing UPS account
3. Create a new application

### Step 2: Request API Access
1. Navigate to API Catalog
2. Select "Rating API" for shipping rates
3. Apply for access
4. Wait for approval (usually 1-2 business days)

### Step 3: Get Credentials
Once approved, you'll receive:
- Username
- Password
- Access Key
- Account Number

### Step 4: Configure Environment Variables
Add to your `.env.local` file:
```
UPS_USERNAME=your_ups_username
UPS_PASSWORD=your_ups_password
UPS_ACCESS_KEY=your_ups_access_key
UPS_ACCOUNT_NUMBER=your_ups_account_number
```

**⚠️ SECURITY WARNING**: Never commit actual UPS credentials to version control. If credentials were previously exposed, immediately rotate them in your UPS Developer Portal account.

## 3. Features Implemented

### Address Validation & Autocomplete
- ✅ Real-time address validation using Google Address Validation API
- ✅ Address autocomplete with Google Places API
- ✅ Visual feedback with color-coded borders (yellow=validating, green=valid, red=invalid)
- ✅ Address correction suggestions
- ✅ One-click address correction
- ✅ Prevents checkout progression with invalid addresses
- ✅ Debounced autocomplete suggestions (300ms delay)
- ✅ Click outside to close suggestions

### UPS Shipping Rates
- ✅ Real-time shipping rate calculation
- ✅ Multiple shipping options display
- ✅ Free shipping option for BMR products
- ✅ Dynamic shipping cost in order totals
- ✅ Fallback to free shipping if UPS API fails
- ✅ Loading states and error handling

### User Experience
- ✅ Address autocomplete component
- ✅ Validation status indicators
- ✅ Smooth checkout flow with address validation gates
- ✅ Professional shipping options UI
- ✅ Responsive design

## 4. API Endpoints Created

### `/api/validate-address`
- Validates addresses using Google Address Validation API
- Returns validation status and corrected addresses
- Handles errors gracefully

### `/api/places-autocomplete`
- Provides address suggestions using Google Places API
- Debounced requests for better performance
- Returns structured address predictions

### `/api/place-details`
- Fetches detailed address information from Google Places API
- Parses address components (street, city, state, zip)
- Returns formatted address data

### `/api/ups-shipping-rates`
- Calculates UPS shipping rates
- Uses OAuth 2.0 authentication
- Returns multiple shipping options
- Includes fallback handling

## 5. Custom Hooks Created

### `useAddressValidation`
- Manages address validation state
- Provides validation functions
- Handles loading states

### `useShippingRates`
- Manages shipping rate calculation
- Provides shipping options
- Handles selection state

## 6. Components Created

### `AddressAutocomplete`
- Address input with validation and autocomplete
- Visual feedback indicators
- Address correction suggestions
- Debounced validation and autocomplete
- Google Places API integration
- Click outside to close suggestions

## 7. Testing

### Address Validation & Autocomplete Testing
1. Start typing an address (e.g., "123 Main St")
2. Verify autocomplete suggestions appear after 3+ characters
3. Click on a suggestion to auto-fill the address
4. Enter invalid addresses (e.g., "123 Fake Street")
5. Verify red border and error message
6. Enter valid addresses
7. Verify green border and success message
8. Test address correction suggestions
9. Test clicking outside to close suggestions

### Shipping Rates Testing
1. Complete billing information
2. Proceed to shipping step
3. Verify shipping rates load
4. Test different shipping options
5. Verify costs update in order summary

## 8. Cost Considerations

### Google APIs
- **Address Validation API**: First 1,000 requests per month: Free, Additional: $0.50 per 1,000 requests
- **Places API**: First 1,000 requests per month: Free, Additional: $2.83 per 1,000 requests
- Typical usage: ~$10-30/month for small to medium sites

### UPS API
- Free to use (no per-request charges)
- Requires UPS account
- May require minimum shipping volume

## 9. Troubleshooting

### Common Issues
1. **API Key not working**: Check Google Cloud Console billing
2. **UPS rates not loading**: Verify UPS credentials and account status
3. **Address validation slow**: Check network connection and API limits

### Fallback Behavior
- If Google Places API fails: Autocomplete suggestions are hidden
- If Google Address Validation API fails: Address validation is skipped
- If UPS API fails: Free shipping is used as fallback
- All errors are logged for debugging

## 10. Security Notes

- All API keys are stored in environment variables
- API calls are made server-side only
- No sensitive data is exposed to client
- Rate limiting is handled by API providers

## 11. Future Enhancements

- ✅ Google Places Autocomplete for address suggestions (COMPLETED)
- Multiple carrier support (FedEx, USPS)
- Package weight/dimension calculation from product data
- Address validation for international addresses
- Shipping insurance options
- Keyboard navigation for autocomplete suggestions
- Recent addresses history
