# Coupon System Migration Guide

## Overview
The coupon system has been updated to use the new `coupons_new` table instead of the old `coupons` table. This provides better data integrity with proper DATE/TIME fields and additional features.

## What Has Been Updated

### Code Changes
1. **`lib/queries.js`**
   - `getCouponByCode()` - Now queries `coupons_new` table
   - `validateCouponForCart()` - Updated to work with new table structure
   - `recordCouponUsage()` - Updated to use `coupons_new` and `coupon_usage` tables

2. **`app/api/validate-coupon/route.js`**
   - Improved error handling and response format

3. **`app/api/debug-coupon/route.js`**
   - Updated to query `coupons_new` table

4. **`components/othersPages/Checkout.jsx`**
   - Updated references from `CouponCode` to `code`

## Migration Steps

### Step 1: Ensure coupons_new Table Exists
The `coupons_new` table should already exist. If not, run:
```bash
mysql -u your_user -p your_database < scripts/create-modern-coupons-table.sql
```

### Step 2: Migrate Data
Run the migration script to move all data from the old `coupons` table to `coupons_new`:
```bash
mysql -u your_user -p your_database < scripts/migrate-coupons-to-new-table.sql
```

This script will:
- Migrate all valid coupons from `coupons` to `coupons_new`
- Convert date formats automatically
- Map discount types correctly
- Migrate usage history from `couponhistory` to `coupon_usage`
- Update usage counts
- Show verification reports

### Step 3: Verify Migration
After running the migration, check:
1. Count of coupons in old vs new table
2. Sample migrated data
3. Any coupons that failed to migrate (shown in the final query)

### Step 4: Test
1. Test applying a coupon code in the cart
2. Verify discount calculation
3. Test free shipping coupons
4. Verify minimum cart amount validation
5. Test customer usage limits

## Table Structure Differences

### Old Table (`coupons`)
- `CouponID` (INT) → `id` (INT)
- `CouponCode` (VARCHAR) → `code` (VARCHAR)
- `CouponName` (VARCHAR) → `name` (VARCHAR)
- `Value` (VARCHAR) → `discount_value` (DECIMAL)
- `ValueType` (VARCHAR) → `discount_type` (ENUM)
- `StartDate` (VARCHAR) → `start_date` (DATE)
- `EndDate` (VARCHAR) → `end_date` (DATE)
- `StartTime` (VARCHAR) → `start_time` (TIME)
- `EndTime` (VARCHAR) → `end_time` (TIME)
- `freecshipping` (VARCHAR) → `free_shipping` (BOOLEAN)
- `maxuses` (INT) → `usage_limit` (INT)
- `currentuses` (INT) → `times_used` (INT)

### New Features in `coupons_new`
- `min_cart_amount` - Minimum cart total required
- `max_discount_amount` - Maximum discount for percentage coupons
- `usage_limit_per_customer` - Limit per customer
- `is_active` - Enable/disable coupons
- `is_public` - Public vs private coupons
- `customer_segments` - Target specific customer groups
- `product_categories` - Limit to specific categories
- `excluded_products` - Exclude specific products
- `min_products` - Minimum number of products required

## Important Notes

1. **Backward Compatibility**: The old `coupons` table is NOT removed. You can keep it for reference or remove it later after verifying everything works.

2. **Usage History**: Usage history from `couponhistory` is migrated to `coupon_usage`. The mapping is done by coupon code, so make sure codes are unique.

3. **Date Format**: The migration handles multiple date formats:
   - `YYYY-MM-DD`
   - `MM/DD/YYYY`
   - `YYYY/MM/DD`

4. **Discount Types**:
   - `ValueType = '%'` or `'percentage'` → `discount_type = 'percentage'`
   - `ValueType = '$'` or `'fixed'` → `discount_type = 'fixed_amount'`
   - `freecshipping = '1'` → `discount_type = 'free_shipping'` (if no value)

5. **Duplicates**: The migration uses `ON DUPLICATE KEY UPDATE` to handle coupons that already exist in `coupons_new`.

## Troubleshooting

### If migration fails:
1. Check that `coupons_new` table exists
2. Verify database connection
3. Check for duplicate coupon codes in the old table
4. Review error messages in the migration script output

### If coupons don't validate:
1. Check that `is_active = 1` and `is_public = 1`
2. Verify date ranges are correct
3. Check time ranges if set
4. Verify usage limits haven't been exceeded

### If discount calculation is wrong:
1. Check `discount_type` is correct (percentage vs fixed_amount)
2. Verify `discount_value` is a valid number
3. Check `min_cart_amount` if set
4. Verify `max_discount_amount` for percentage coupons

## Next Steps

After successful migration:
1. Monitor coupon usage for a few days
2. Verify all existing coupons work correctly
3. Test creating new coupons in the new table
4. Once confident, you can archive or remove the old `coupons` table

## Support

If you encounter any issues during migration, check:
- Migration script output for detailed error messages
- Database logs for SQL errors
- Application logs for coupon validation errors

