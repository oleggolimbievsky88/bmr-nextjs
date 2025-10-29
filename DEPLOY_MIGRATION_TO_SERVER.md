# Deploying Coupon Migration to Server

## Important: Backup First!

**⚠️ ALWAYS backup your database before running migrations on production!**

```bash
# On your server, backup the database first
mysqldump -u your_user -p bmrsuspension > backup_before_coupon_migration_$(date +%Y%m%d_%H%M%S).sql
```

## Option 1: SSH into Server and Run Directly

If you have SSH access to your server:

```bash
# 1. SSH into your server
ssh user@your-server.com

# 2. Navigate to your project directory (or upload the script)
cd /path/to/your/project

# 3. Run the migration
mysql -u your_db_user -p your_database_name < scripts/migrate-coupons-to-new-table.sql
```

## Option 2: Copy Script to Server First

If you want to copy the script to the server first:

```bash
# From your local machine, copy the script to the server
scp scripts/migrate-coupons-to-new-table.sql user@your-server.com:/tmp/

# Then SSH and run it
ssh user@your-server.com
mysql -u your_db_user -p your_database_name < /tmp/migrate-coupons-to-new-table.sql
```

## Option 3: Using MySQL Remote Connection

If you have remote MySQL access configured:

```bash
# From your local machine
mysql -h your-server.com -u your_db_user -p your_database_name < scripts/migrate-coupons-to-new-table.sql
```

**Note:** This requires MySQL remote access to be enabled and your IP whitelisted.

## Option 4: Using Database Management Tool

If you use tools like phpMyAdmin, MySQL Workbench, or TablePlus:

1. Open your database management tool
2. Connect to your production database
3. Navigate to the SQL query/command interface
4. Copy and paste the contents of `scripts/migrate-coupons-to-new-table.sql`
5. Execute the script

## Option 5: Run via Next.js API Route (Alternative)

You could also create a temporary admin API route to run the migration:

```javascript
// app/api/admin/migrate-coupons/route.js (TEMPORARY - DELETE AFTER USE!)
import pool from "@/lib/db";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Add authentication check here!
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = await readFile(
      "./scripts/migrate-coupons-to-new-table.sql",
      "utf-8"
    );

    // Execute each statement
    const statements = sql.split(";").filter((s) => s.trim());

    for (const statement of statements) {
      if (statement.trim() && !statement.trim().startsWith("--")) {
        await pool.query(statement);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

Then call it:
```bash
curl -X POST https://your-domain.com/api/admin/migrate-coupons \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

**⚠️ IMPORTANT:** Remove this route immediately after migration!

## Recommended Approach

For production, I recommend **Option 1 or 2** because:
- ✅ Direct database access is most secure
- ✅ You can see the output in real-time
- ✅ Easier to troubleshoot if issues arise
- ✅ No need to deploy temporary code

## Verification Steps

After running the migration, verify it worked:

1. **Check coupon counts match:**
```sql
SELECT COUNT(*) as old_count FROM coupons WHERE CouponCode != '0';
SELECT COUNT(*) as new_count FROM coupons_new;
```

2. **Check a sample coupon migrated correctly:**
```sql
SELECT code, name, discount_type, discount_value, start_date, end_date
FROM coupons_new
LIMIT 5;
```

3. **Test coupon validation in your app** - Try applying a known coupon code

## Troubleshooting

If the migration fails:

1. **Check the error message** - It will tell you exactly what went wrong
2. **Restore from backup** if needed:
   ```bash
   mysql -u your_db_user -p your_database_name < backup_before_coupon_migration_YYYYMMDD_HHMMSS.sql
   ```
3. **Check MySQL user permissions** - Ensure the user has INSERT, UPDATE, SELECT permissions
4. **Check if tables exist** - Verify `coupons_new` and `coupon_usage` tables exist

## Post-Migration

After successful migration:

1. ✅ Test coupon codes work in your application
2. ✅ Monitor for any issues for a few days
3. ✅ Once confident, you can optionally archive the old `coupons` table:
   ```sql
   -- Optional: Rename old table (keep as backup)
   RENAME TABLE coupons TO coupons_old_backup;
   RENAME TABLE couponhistory TO couponhistory_old_backup;
   ```

## Environment Variables

Make sure your production environment has the correct database credentials:

```env
MYSQL_HOST=your_db_host
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=bmrsuspension
```

