-- Step-by-Step Migration Script for MySQL Workbench
-- Run each step separately and check for errors before proceeding
-- Make sure you're connected to the correct database (bmrsuspension)

-- Set the correct database
USE bmrsuspension;

-- ============================================================================
-- STEP 1: Migrate coupons from old table to new table
-- ============================================================================
-- This step migrates all coupons and extracts discount values from multiple sources

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
        -- First, try to get value from coupons.Value field
        WHEN c.Value != '0' AND c.Value IS NOT NULL AND c.Value != '' AND TRIM(c.Value) != '' THEN
            CAST(TRIM(REPLACE(REPLACE(REPLACE(c.Value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2))
        -- Default to 0.00 if empty (we'll fix this in Step 2)
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


-- ============================================================================
-- STEP 2: Update discount values from couponrules table
-- ============================================================================
-- This fixes coupons that have their discount value in the couponrules table

UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
INNER JOIN couponrules cr ON cr.couponId = c.CouponID
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(cr.value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND cr.value != '0'
  AND cr.value IS NOT NULL
  AND cr.value != '';


-- ============================================================================
-- STEP 3: Update discount values from coupons.Value field (if it was empty before)
-- ============================================================================
-- This fixes coupons where the Value field has data but wasn't captured in Step 1

UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(c.Value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND c.Value != '0'
  AND c.Value IS NOT NULL
  AND c.Value != ''
  AND TRIM(c.Value) != '';


-- ============================================================================
-- STEP 4: Extract percentage from coupon name (for names like "25% Off")
-- ============================================================================
-- This extracts percentages from coupon names when they contain patterns like "25%"

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
  AND c.CouponName LIKE '%[0-9]%'
  AND c.CouponName LIKE '%\%%'
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.CouponName, '%', 1), ' ', -1) REGEXP '^[0-9]+\.?[0-9]*$';


-- ============================================================================
-- STEP 5: Extract number from coupon name (for names like "25 Off" or "15 OFF")
-- ============================================================================
-- This extracts the first number from coupon names for percentage coupons

UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = CAST(
        TRIM(
            SUBSTRING_INDEX(
                SUBSTRING_INDEX(
                    CONCAT(c.CouponName, ' '),
                    ' ',
                    1
                ),
                '%',
                1
            )
        ) AS DECIMAL(10,2)
    ),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND cn.discount_type = 'percentage'
  AND (c.ValueType = '%' OR c.ValueType = 'percentage' OR c.ValueType = '0')
  AND c.CouponName REGEXP '^[0-9]+'
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT(c.CouponName, ' '), ' ', 1), '%', 1) REGEXP '^[0-9]+\.?[0-9]*$';


-- ============================================================================
-- STEP 6: Migrate coupon usage history
-- ============================================================================

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
    0.00 as cart_total,
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
INNER JOIN coupons c ON ch.CouponID = c.CouponID
INNER JOIN coupons_new cn ON TRIM(c.CouponCode) = cn.code
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


-- ============================================================================
-- STEP 7: Update times_used count
-- ============================================================================

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


-- ============================================================================
-- STEP 8: Verification queries (run these to check the migration)
-- ============================================================================

-- Check counts
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
FROM coupons_new;

-- Check coupons with 0.00 discount values (these might need manual review)
SELECT
    code,
    name,
    discount_type,
    discount_value
FROM coupons_new
WHERE discount_value = 0.00
  AND discount_type = 'percentage'
ORDER BY name;

-- Show sample migrated data
SELECT
    code,
    name,
    discount_type,
    discount_value,
    start_date,
    end_date,
    times_used,
    free_shipping,
    is_active
FROM coupons_new
ORDER BY created_at DESC
LIMIT 20;

