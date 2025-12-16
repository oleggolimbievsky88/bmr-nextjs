# How to Run the Coupon Migration Script in MySQL Workbench

## Option 1: Run Step-by-Step Script (Recommended)

1. **Open MySQL Workbench** and connect to your database (`bmrsuspension`)

2. **Open the step-by-step script**: `scripts/migrate-coupons-to-new-table-step-by-step.sql`

3. **Run each step separately**:
   - Select **Step 1** (the first INSERT statement) and click the Execute button (⚡) or press `Ctrl+Enter`
   - Wait for it to complete successfully
   - Check the "Action Output" tab at the bottom for any warnings
   - Repeat for **Step 2**, **Step 3**, **Step 4**, **Step 5**, **Step 6**, **Step 7**
   - Finally, run **Step 8** (verification queries) to check the results

4. **If you get an error**:
   - Check the error message
   - Make sure the `coupons_new` table exists (run `DESCRIBE coupons_new;` to verify)
   - Make sure you're connected to the correct database
   - Check if there are any duplicate coupon codes

## Option 2: Run Individual Steps Manually

If the step-by-step script still has issues, you can run these queries one at a time:

### Step 1: Check what needs to be migrated
```sql
SELECT COUNT(*) as old_coupons FROM coupons WHERE CouponCode IS NOT NULL AND CouponCode != '' AND CouponCode != '0';
SELECT COUNT(*) as new_coupons FROM coupons_new;
```

### Step 2: Migrate basic coupon data
Run the INSERT statement from Step 1 of the step-by-step script.

### Step 3: Fix discount values from couponrules
```sql
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
INNER JOIN couponrules cr ON cr.couponId = c.CouponID
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(cr.value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND cr.value != '0'
  AND cr.value IS NOT NULL
  AND cr.value != '';
```

### Step 4: Fix discount values from coupons.Value
```sql
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(c.Value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND c.Value != '0'
  AND c.Value IS NOT NULL
  AND c.Value != ''
  AND TRIM(c.Value) != '';
```

### Step 5: Extract percentage from coupon names
```sql
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = CAST(
        TRIM(
            SUBSTRING_INDEX(
                SUBSTRING_INDEX(c.CouponName, '%', 1),
                ' ',
                -1
            )
        ) AS DECIMAL(10,2)
    ),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND cn.discount_type = 'percentage'
  AND c.CouponName LIKE '%\%%'
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.CouponName, '%', 1), ' ', -1) REGEXP '^[0-9]+\.?[0-9]*$';
```

## Common Errors and Solutions

### Error: "Table 'coupons_new' doesn't exist"
**Solution**: Run the table creation script first:
```sql
-- Check if table exists
SHOW TABLES LIKE 'coupons_new';

-- If it doesn't exist, run the creation script
-- File: scripts/create-modern-coupons-table.sql
```

### Error: "Duplicate entry for key 'code'"
**Solution**: The coupon already exists. The script uses `ON DUPLICATE KEY UPDATE` to handle this, but if you're still getting errors, you can skip duplicates:
```sql
-- Check for duplicates
SELECT code, COUNT(*) as count
FROM coupons_new
GROUP BY code
HAVING count > 1;

-- If there are duplicates, you may need to clean them up first
```

### Error: "Unknown column 'discount_value'"
**Solution**: Make sure the `coupons_new` table structure matches what's expected. Check with:
```sql
DESCRIBE coupons_new;
```

### Error: REGEXP not working
**Solution**: If your MySQL version doesn't support REGEXP in UPDATE statements, you can skip Steps 4 and 5 and manually update the discount values later.

## Verification After Migration

Run these queries to verify everything worked:

```sql
-- Check total counts
SELECT COUNT(*) FROM coupons_new;

-- Check coupons with missing discount values
SELECT code, name, discount_type, discount_value
FROM coupons_new
WHERE discount_type = 'percentage'
  AND discount_value = 0.00;

-- Check sample data
SELECT code, name, discount_type, discount_value, start_date, end_date
FROM coupons_new
ORDER BY created_at DESC
LIMIT 10;
```

## If You Need to Start Over

If something goes wrong and you need to start fresh:

```sql
-- WARNING: This will delete all migrated data!
TRUNCATE TABLE coupon_usage;
TRUNCATE TABLE coupons_new;

-- Then run the migration script again
```

