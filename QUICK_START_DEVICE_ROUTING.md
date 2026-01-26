# Quick Start: Device-Based Routing

## What Was Implemented

✅ **Device Detection** - Automatically detects desktop vs mobile/tablet devices
✅ **Automatic Routing** - Desktop → CF site, Mobile/Tablet → NextJS site  
✅ **Toggle Links** - Users can switch between views on both sites
✅ **Cookie Preferences** - User preferences are saved for 1 year

## Files Created/Modified

### NextJS Files:
1. `lib/deviceDetection.js` - Device detection utility
2. `middleware.js` - Handles routing logic for NextJS
3. `components/common/ViewToggle.jsx` - Toggle link component
4. `components/header/Topbar4.jsx` - Added ViewToggle to header

### ColdFusion Files:
1. `Application.cfm` - Complete updated file with device detection
2. `COLD_FUSION_HEADER_SNIPPET.cfm` - Code snippet for CF header

## Setup Steps

### 1. Update Environment Variables

Add to your `.env.local` or deployment environment:

```bash
# NextJS site URL (where mobile/tablet users go)
NEXTJS_URL=https://dev.bmrsuspension.com

# ColdFusion site URL (where desktop users go)  
CF_SITE_URL=https://www.bmrsuspension.com

# For client-side components (needs NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CF_SITE_URL=https://www.bmrsuspension.com
```

### 2. Deploy NextJS Changes

The NextJS changes are ready to deploy:
- Middleware will automatically redirect desktop users
- ViewToggle component is already added to the header

### 3. Update ColdFusion Application.cfm

Replace your existing `Application.cfm` with the new version that includes:
- Device detection at the top
- Automatic redirect for mobile/tablet users
- Cookie preference handling

**Important:** The device detection code must be at the very top of `Application.cfm`, before any other CF code.

### 4. Add Mobile View Link to CF Site

Add the code from `COLD_FUSION_HEADER_SNIPPET.cfm` to your ColdFusion site's header/template where you want the "Mobile View" link to appear.

## How It Works

### Default Behavior:
- **Desktop user visits CF site** → Stays on CF site ✅
- **Desktop user visits NextJS site** → Redirected to CF site ✅
- **Mobile user visits CF site** → Redirected to NextJS site ✅
- **Mobile user visits NextJS site** → Stays on NextJS site ✅

### User Override:
- User clicks "Desktop View" on NextJS → Redirected to CF site with `?view=desktop`
- User clicks "Mobile View" on CF site → Redirected to NextJS site with `?view=mobile`
- Preference is saved in cookie for 1 year

## Testing Checklist

- [ ] Desktop user on NextJS → Should redirect to CF site
- [ ] Mobile user on CF site → Should redirect to NextJS site
- [ ] "Desktop View" link appears in NextJS topbar
- [ ] "Mobile View" link appears in CF header
- [ ] Clicking toggle links works correctly
- [ ] Query parameters are preserved during redirects
- [ ] Cookie preference persists after page reload

## Troubleshooting

**Desktop users not redirecting from NextJS:**
- Check `CF_SITE_URL` environment variable
- Verify `middleware.js` is in project root
- Check browser console for errors

**Mobile users not redirecting from CF:**
- Ensure device detection code is at top of `Application.cfm`
- Verify `nextjsUrl` variable is set correctly
- Check that redirect happens before session code

**Toggle links not working:**
- Verify `NEXT_PUBLIC_CF_SITE_URL` is set
- Check that both sites can access cookies
- Ensure paths are being converted correctly

## Path Conversion Examples

| ColdFusion Path | NextJS Path |
|----------------|-------------|
| `/index.cfm` | `/` |
| `/index.cfm?page=products&productid=123` | `/product/123` |
| `/index.cfm?page=home` | `/` |

| NextJS Path | ColdFusion Path |
|------------|----------------|
| `/` | `/index.cfm` |
| `/product/123` | `/index.cfm?page=products&productid=123` |

## Development / Localhost

Device routing is **automatically disabled** when running on:
- `localhost`
- `127.0.0.1`
- Local network IPs (192.168.x.x, 10.x.x.x)
- When `NODE_ENV=development`

This allows you to develop and test on localhost without being redirected to the production CF site.

You can also disable device routing in any environment by setting:
```bash
DISABLE_DEVICE_ROUTING=true
```

## Notes

- Cookies use `sameSite: 'lax'` for cross-subdomain compatibility
- Preferences persist for 1 year
- Query parameters are preserved during redirects
- Both sites should be on same domain/subdomain for cookies to work
- Device routing is automatically disabled in development/localhost
