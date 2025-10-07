# Vercel Deployment Checklist

## Environment Variables
Ensure these are set in your Vercel project for **Preview AND Production**:
- `MYSQL_HOST` - Your database hostname
- `MYSQL_USER` - Database username
- `MYSQL_PASSWORD` - Database password
- `MYSQL_DATABASE` - bmrsuspension
- `MYSQL_PORT` - 3306 (if different)
- `MYSQL_SSL` - true (for production databases)

## Database Configuration
- ✅ Use connection pooling (already implemented)
- ✅ Fixed direct connection creation (updated to use pool)
- ⚠️  Consider adding connection timeout settings for Vercel

## API Route Best Practices
- ✅ Added `export const dynamic = "force-dynamic"` to all routes
- ✅ Fixed async params destructuring
- ✅ Consistent error handling with NextResponse
- ✅ Proper parameter validation

## Template Data Cleanup
- ✅ Removed template demo data from Context provider
- ✅ Updated cart functionality to use dynamic API calls
- ✅ Fixed product ID references (ProductID vs id)
- ✅ Enhanced individual product API route

## Common Vercel Issues & Solutions

### 1. Serverless Function Timeout
```javascript
// Add to your database pool config in lib/db.js
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "bmrsuspension",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timeout: 60000,         // Add this
  reconnect: true         // Add this
});
```

### 2. Cold Start Issues
- Database connections might timeout on cold starts
- Consider implementing connection retry logic

### 3. Memory Limits
- Vercel has memory limits for serverless functions
- Monitor function execution time in Vercel dashboard

### 4. Debug Logging
- Use `console.log` statements to debug on Vercel
- Check Vercel function logs for specific errors

## Testing Steps
1. Deploy to Vercel preview
2. Test each API endpoint:
   - `/api/categories?bodyId=1`
   - `/api/categories/[catId]`
   - `/api/categories/by-maincat/[mainCatId]`
3. Check Vercel function logs for any errors
4. Verify database connection in production

## Next Steps if Issues Persist
1. Check Vercel function logs specifically
2. Verify environment variables are set correctly
3. Test database connectivity from Vercel
4. Consider adding connection retry logic
5. Check if your database allows connections from Vercel IPs