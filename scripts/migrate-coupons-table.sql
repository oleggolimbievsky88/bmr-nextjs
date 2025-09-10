-- Migration script to move from old coupons table to new modern structure
-- Run this after creating the new table structure

-- Step 1: Create the new tables (run create-modern-coupons-table.sql first)

-- Step 2: Migrate existing data from old coupons table to new structure
INSERT INTO coupons_new (
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_cart_amount,
    start_date,
    end_date,
    start_time,
    end_time,
    usage_limit,
    times_used,
    free_shipping,
    is_active,
    is_public,
    created_at
)
SELECT
    CouponCode as code,
    CouponName as name,
    '' as description,
    CASE
        WHEN ValueType = '%' OR ValueType = 'percentage' THEN 'percentage'
        WHEN ValueType = '$' OR ValueType = 'fixed' THEN 'fixed_amount'
        ELSE 'percentage'
    END as discount_type,
    CASE
        WHEN Value != '0' AND Value IS NOT NULL THEN CAST(Value AS DECIMAL(10,2))
        ELSE 0.00
    END as discount_value,
    0.00 as min_cart_amount,
    CASE
        WHEN StartDate != '0' AND StartDate IS NOT NULL THEN STR_TO_DATE(StartDate, '%Y-%m-%d')
        ELSE CURDATE()
    END as start_date,
    CASE
        WHEN EndDate != '0' AND EndDate IS NOT NULL THEN STR_TO_DATE(EndDate, '%Y-%m-%d')
        ELSE DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
    END as end_date,
    CASE
        WHEN StartTime != '0' AND StartTime IS NOT NULL THEN StartTime
        ELSE '00:00:00'
    END as start_time,
    CASE
        WHEN EndTime != '0' AND EndTime IS NOT NULL THEN EndTime
        ELSE '23:59:59'
    END as end_time,
    CASE
        WHEN maxuses > 0 THEN maxuses
        ELSE NULL
    END as usage_limit,
    currentuses as times_used,
    CASE
        WHEN freecshipping = '1' THEN TRUE
        ELSE FALSE
    END as free_shipping,
    TRUE as is_active,
    TRUE as is_public,
    NOW() as created_at
FROM coupons
WHERE CouponCode IS NOT NULL
  AND CouponCode != ''
  AND CouponCode != '0';

-- Step 3: Migrate coupon usage history
INSERT INTO coupon_usage (
    coupon_id,
    customer_id,
    order_id,
    discount_amount,
    cart_total,
    used_at
)
SELECT
    cn.id as coupon_id,
    ch.CustomerID as customer_id,
    ch.InvoiceID as order_id,
    CAST(ch.Value AS DECIMAL(10,2)) as discount_amount,
    0.00 as cart_total, -- We don't have this data in old table
    NOW() as used_at
FROM couponhistory ch
JOIN coupons c ON ch.CouponID = c.CouponID
JOIN coupons_new cn ON c.CouponCode = cn.code
WHERE ch.CustomerID IS NOT NULL;

-- Step 4: Update the times_used count based on actual usage
UPDATE coupons_new cn
SET times_used = (
    SELECT COUNT(*)
    FROM coupon_usage cu
    WHERE cu.coupon_id = cn.id
);

-- Step 5: Verify the migration
SELECT
    'Old Table Count' as source,
    COUNT(*) as count
FROM coupons
UNION ALL
SELECT
    'New Table Count' as source,
    COUNT(*) as count
FROM coupons_new
UNION ALL
SELECT
    'Usage History Count' as source,
    COUNT(*) as count
FROM coupon_usage;

-- Step 6: Show sample migrated data
SELECT
    code,
    name,
    discount_type,
    discount_value,
    min_cart_amount,
    start_date,
    end_date,
    times_used,
    usage_limit,
    free_shipping,
    is_active
FROM coupons_new
ORDER BY created_at DESC
LIMIT 10;
