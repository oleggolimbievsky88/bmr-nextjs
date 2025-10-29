-- Improved Migration Script: Move data from coupons to coupons_new
-- This script safely migrates all data from the old coupons table to the new coupons_new table
-- Run this AFTER creating the coupons_new table structure

-- Step 1: Check if coupons_new table exists and has data
-- If it does, we'll use INSERT IGNORE or ON DUPLICATE KEY UPDATE to avoid duplicates

-- Step 2: Migrate existing data from old coupons table to new structure
-- Only migrate coupons that don't already exist in coupons_new (based on code)
INSERT INTO coupons_new (
    code,
    name,
    description,
    discount_type,
    discount_value,
    min_cart_amount,
    max_discount_amount,
    start_date,
    end_date,
    start_time,
    end_time,
    usage_limit,
    usage_limit_per_customer,
    times_used,
    free_shipping,
    shipping_discount,
    is_active,
    is_public,
    created_at
)
SELECT DISTINCT
    TRIM(c.CouponCode) as code,
    c.CouponName as name,
    COALESCE(NULLIF(c.Type, '0'), '') as description,
    CASE
        WHEN c.ValueType = '%' OR c.ValueType = 'percentage' OR c.ValueType = '0' THEN 'percentage'
        WHEN c.ValueType = '$' OR c.ValueType = 'fixed' OR c.ValueType = 'fixed_amount' THEN 'fixed_amount'
        WHEN c.freecshipping = '1' THEN 'free_shipping'
        ELSE 'percentage'
    END as discount_type,
    CASE
        WHEN c.Value != '0' AND c.Value IS NOT NULL AND c.Value != '' THEN CAST(c.Value AS DECIMAL(10,2))
        ELSE 0.00
    END as discount_value,
    0.00 as min_cart_amount,
    NULL as max_discount_amount,
    CASE
        WHEN c.StartDate = '0' OR c.StartDate IS NULL OR c.StartDate = '' THEN CURDATE()
        WHEN STR_TO_DATE(LEFT(TRIM(c.StartDate), 10), '%Y-%m-%d') IS NOT NULL
             AND YEAR(STR_TO_DATE(LEFT(TRIM(c.StartDate), 10), '%Y-%m-%d')) > 1900
        THEN DATE(STR_TO_DATE(LEFT(TRIM(c.StartDate), 10), '%Y-%m-%d'))
        WHEN STR_TO_DATE(TRIM(c.StartDate), '%m/%d/%Y') IS NOT NULL
             AND YEAR(STR_TO_DATE(TRIM(c.StartDate), '%m/%d/%Y')) > 1900
        THEN DATE(STR_TO_DATE(TRIM(c.StartDate), '%m/%d/%Y'))
        WHEN STR_TO_DATE(TRIM(c.StartDate), '%Y/%m/%d') IS NOT NULL
             AND YEAR(STR_TO_DATE(TRIM(c.StartDate), '%Y/%m/%d')) > 1900
        THEN DATE(STR_TO_DATE(TRIM(c.StartDate), '%Y/%m/%d'))
        ELSE CURDATE()
    END as start_date,
    CASE
        WHEN c.EndDate = '0' OR c.EndDate IS NULL OR c.EndDate = '' THEN DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
        WHEN STR_TO_DATE(LEFT(TRIM(c.EndDate), 10), '%Y-%m-%d') IS NOT NULL
             AND YEAR(STR_TO_DATE(LEFT(TRIM(c.EndDate), 10), '%Y-%m-%d')) > 1900
        THEN DATE(STR_TO_DATE(LEFT(TRIM(c.EndDate), 10), '%Y-%m-%d'))
        WHEN STR_TO_DATE(TRIM(c.EndDate), '%m/%d/%Y') IS NOT NULL
             AND YEAR(STR_TO_DATE(TRIM(c.EndDate), '%m/%d/%Y')) > 1900
        THEN DATE(STR_TO_DATE(TRIM(c.EndDate), '%m/%d/%Y'))
        WHEN STR_TO_DATE(TRIM(c.EndDate), '%Y/%m/%d') IS NOT NULL
             AND YEAR(STR_TO_DATE(TRIM(c.EndDate), '%Y/%m/%d')) > 1900
        THEN DATE(STR_TO_DATE(TRIM(c.EndDate), '%Y/%m/%d'))
        ELSE DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
    END as end_date,
    CASE
        WHEN c.StartTime != '0'
             AND c.StartTime IS NOT NULL
             AND c.StartTime != ''
             AND CAST(c.StartTime AS TIME) IS NOT NULL
        THEN CAST(c.StartTime AS TIME)
        ELSE '00:00:00'
    END as start_time,
    CASE
        WHEN c.EndTime != '0'
             AND c.EndTime IS NOT NULL
             AND c.EndTime != ''
             AND CAST(c.EndTime AS TIME) IS NOT NULL
        THEN CAST(c.EndTime AS TIME)
        ELSE '23:59:59'
    END as end_time,
    CASE
        WHEN c.maxuses > 0 THEN c.maxuses
        ELSE NULL
    END as usage_limit,
    1 as usage_limit_per_customer,
    COALESCE(c.currentuses, 0) as times_used,
    CASE
        WHEN c.freecshipping = '1' OR c.freecshipping = 1 THEN TRUE
        ELSE FALSE
    END as free_shipping,
    CASE
        WHEN c.domflatshipcost != '0'
             AND c.domflatshipcost IS NOT NULL
             AND c.domflatshipcost != ''
        THEN CAST(c.domflatshipcost AS DECIMAL(10,2))
        ELSE 0.00
    END as shipping_discount,
    TRUE as is_active,
    TRUE as is_public,
    NOW() as created_at
FROM coupons c
WHERE c.CouponCode IS NOT NULL
  AND c.CouponCode != ''
  AND c.CouponCode != '0'
  AND TRIM(c.CouponCode) != ''
  AND NOT EXISTS (
    SELECT 1
    FROM coupons_new cn
    WHERE cn.code = TRIM(c.CouponCode)
  )
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    discount_type = VALUES(discount_type),
    discount_value = VALUES(discount_value),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    usage_limit = VALUES(usage_limit),
    times_used = GREATEST(coupons_new.times_used, VALUES(times_used)),
    free_shipping = VALUES(free_shipping),
    shipping_discount = VALUES(shipping_discount),
    updated_at = NOW();

-- Step 3: Migrate coupon usage history from couponhistory to coupon_usage
-- Map old coupon IDs to new coupon IDs based on coupon code
-- Note: couponhistory doesn't have CustomerID, so we get it from invoice table
INSERT INTO coupon_usage (
    coupon_id,
    customer_id,
    order_id,
    discount_amount,
    cart_total,
    used_at
)
SELECT DISTINCT
    cn.id as coupon_id,
    COALESCE(i.CustomerID, NULL) as customer_id,
    ch.InvoiceID as order_id,
    CASE
        WHEN ch.Value != '0'
             AND ch.Value IS NOT NULL
             AND ch.Value != ''
        THEN CAST(ch.Value AS DECIMAL(10,2))
        ELSE 0.00
    END as discount_amount,
    0.00 as cart_total, -- We don't have this data in old table
    CASE
        WHEN ch.StartDate = '0' OR ch.StartDate IS NULL OR ch.StartDate = '' THEN NOW()
        WHEN STR_TO_DATE(LEFT(TRIM(ch.StartDate), 10), '%Y-%m-%d') IS NOT NULL
             AND YEAR(STR_TO_DATE(LEFT(TRIM(ch.StartDate), 10), '%Y-%m-%d')) > 1900
        THEN STR_TO_DATE(LEFT(TRIM(ch.StartDate), 10), '%Y-%m-%d')
        WHEN STR_TO_DATE(TRIM(ch.StartDate), '%m/%d/%Y') IS NOT NULL
             AND YEAR(STR_TO_DATE(TRIM(ch.StartDate), '%m/%d/%Y')) > 1900
        THEN STR_TO_DATE(TRIM(ch.StartDate), '%m/%d/%Y')
        WHEN STR_TO_DATE(TRIM(ch.StartDate), '%Y/%m/%d') IS NOT NULL
             AND YEAR(STR_TO_DATE(TRIM(ch.StartDate), '%Y/%m/%d')) > 1900
        THEN STR_TO_DATE(TRIM(ch.StartDate), '%Y/%m/%d')
        ELSE NOW()
    END as used_at
FROM couponhistory ch
JOIN coupons c ON ch.CouponID = c.CouponID
JOIN coupons_new cn ON TRIM(c.CouponCode) = cn.code
LEFT JOIN invoice i ON ch.InvoiceID = i.InvoiceID
WHERE ch.InvoiceID IS NOT NULL
  AND ch.InvoiceID != '0'
  AND ch.InvoiceID != ''
  AND NOT EXISTS (
    SELECT 1
    FROM coupon_usage cu
    WHERE cu.coupon_id = cn.id
      AND cu.order_id = ch.InvoiceID
      AND (cu.customer_id = COALESCE(i.CustomerID, 0) OR (cu.customer_id IS NULL AND i.CustomerID IS NULL))
  );

-- Step 4: Update the times_used count based on actual usage from coupon_usage table
UPDATE coupons_new cn
SET times_used = (
    SELECT COUNT(*)
    FROM coupon_usage cu
    WHERE cu.coupon_id = cn.id
),
updated_at = NOW()
WHERE EXISTS (
    SELECT 1
    FROM coupon_usage cu
    WHERE cu.coupon_id = cn.id
);

-- Step 5: Verify the migration
SELECT
    'Old Table Count' as source,
    COUNT(*) as count,
    COUNT(DISTINCT CouponCode) as unique_codes
FROM coupons
WHERE CouponCode IS NOT NULL
  AND CouponCode != ''
  AND CouponCode != '0'
UNION ALL
SELECT
    'New Table Count' as source,
    COUNT(*) as count,
    COUNT(DISTINCT code) as unique_codes
FROM coupons_new
UNION ALL
SELECT
    'Old Usage History Count' as source,
    COUNT(*) as count,
    COUNT(DISTINCT CONCAT(CouponID, '-', InvoiceID)) as unique_usage
FROM couponhistory
WHERE InvoiceID IS NOT NULL
  AND InvoiceID != '0'
  AND InvoiceID != ''
UNION ALL
SELECT
    'New Usage History Count' as source,
    COUNT(*) as count,
    COUNT(DISTINCT CONCAT(coupon_id, '-', customer_id, '-', order_id)) as unique_usage
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
    is_active,
    created_at
FROM coupons_new
ORDER BY created_at DESC
LIMIT 20;

-- Step 7: Show any coupons that might have failed to migrate
SELECT
    c.CouponID,
    c.CouponCode,
    c.CouponName,
    c.StartDate,
    c.EndDate,
    CASE
        WHEN c.CouponCode IS NULL OR c.CouponCode = '' OR c.CouponCode = '0' THEN 'Empty code'
        WHEN TRIM(c.CouponCode) IN (SELECT code FROM coupons_new) THEN 'Already migrated'
        ELSE 'Failed to migrate - check dates'
    END as status
FROM coupons c
WHERE (c.CouponCode IS NULL OR c.CouponCode = '' OR c.CouponCode = '0')
   OR NOT EXISTS (
       SELECT 1
       FROM coupons_new cn
       WHERE cn.code = TRIM(c.CouponCode)
   );

