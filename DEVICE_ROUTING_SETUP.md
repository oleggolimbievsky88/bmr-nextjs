# Device-Based Routing Setup

This document explains how device-based routing works between the ColdFusion site and the NextJS site.

## Overview

- **Desktop users** → ColdFusion site (www.bmrsuspension.com)
- **Mobile/Tablet users** → NextJS site (dev.bmrsuspension.com)
- Users can override their preference with toggle links on both sites

## Implementation

### 1. NextJS Middleware (`middleware.js`)

The middleware automatically:
- Detects if a user is on desktop or mobile/tablet
- Redirects desktop users from NextJS to the ColdFusion site
- Allows mobile/tablet users to stay on NextJS
- Respects user preferences via cookies and query parameters

**Priority order:**
1. Query parameter (`?view=desktop` or `?view=mobile`)
2. Cookie preference (`viewPreference`)
3. Device detection (default behavior)

### 2. ColdFusion Application.cfm

The ColdFusion `Application.cfm` file:
- Detects mobile/tablet devices
- Redirects mobile/tablet users to the NextJS site
- Allows desktop users to stay on the ColdFusion site
- Respects user preferences via cookies and query parameters

**Priority order:**
1. Query parameter (`?view=desktop` or `?view=mobile`)
2. Cookie preference (`viewPreference`)
3. Device detection (default behavior)

### 3. View Toggle Components

#### NextJS ViewToggle Component

Located at `components/common/ViewToggle.jsx`, this component:
- Shows a "Desktop View" link in the topbar
- Converts NextJS paths to ColdFusion paths
- Preserves query parameters when switching

#### ColdFusion Header Snippet

See `COLD_FUSION_HEADER_SNIPPET.cfm` for code to add to your CF site header:
- Shows a "Mobile View" link
- Converts ColdFusion paths to NextJS paths
- Preserves query parameters when switching

## Environment Variables

Add these to your `.env.local` or deployment environment:

```bash
# NextJS site URL (where mobile/tablet users go)
NEXTJS_URL=https://dev.bmrsuspension.com

# ColdFusion site URL (where desktop users go)
CF_SITE_URL=https://www.bmrsuspension.com

# For client-side components
NEXT_PUBLIC_CF_SITE_URL=https://www.bmrsuspension.com
```

## Path Conversion

The system automatically converts paths between the two sites:

### ColdFusion → NextJS
- `/index.cfm` → `/`
- `/index.cfm?page=products&productid=123` → `/product/123`
- Other paths are preserved

### NextJS → ColdFusion
- `/` → `/index.cfm`
- `/product/123` → `/index.cfm?page=products&productid=123`
- Other paths are converted to `/index.cfm?[path]`

## Testing

1. **Desktop User on NextJS:**
   - Visit `https://dev.bmrsuspension.com` on desktop
   - Should be redirected to `https://www.bmrsuspension.com`

2. **Mobile User on ColdFusion:**
   - Visit `https://www.bmrsuspension.com` on mobile
   - Should be redirected to `https://dev.bmrsuspension.com`

3. **Override with Query Parameter:**
   - Desktop user: `https://dev.bmrsuspension.com?view=mobile` (stays on NextJS)
   - Mobile user: `https://www.bmrsuspension.com?view=desktop` (stays on CF)

4. **Cookie Preference:**
   - Once a user selects a preference, it's saved in a cookie
   - The preference persists for 1 year
   - Users can override by using the query parameter

## Troubleshooting

### Desktop users not being redirected from NextJS
- Check that `middleware.js` is in the root of your NextJS project
- Verify `CF_SITE_URL` environment variable is set correctly
- Check browser console for errors

### Mobile users not being redirected from ColdFusion
- Verify the device detection code is at the top of `Application.cfm`
- Check that the redirect happens before any other CF code
- Ensure `nextjsUrl` variable is set correctly

### Toggle links not working
- Verify environment variables are set (especially `NEXT_PUBLIC_CF_SITE_URL`)
- Check that cookies are being set correctly
- Ensure both sites are on the same domain or cookies are configured for cross-domain

## Notes

- The `viewPreference` cookie is set with `sameSite: 'lax'` to work across subdomains
- Path conversion is basic - you may need to add more conversion rules for specific routes
- The system preserves query parameters when redirecting
- Both sites should be on the same domain (or subdomain) for cookies to work properly
