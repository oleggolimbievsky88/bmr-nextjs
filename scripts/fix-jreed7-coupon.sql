-- Quick fix for JREED7 coupon discount value
-- Run this in MySQL Workbench

USE bmrsuspension;

-- Step 1: Check current JREED7 coupon data
SELECT
    cn.id,
    cn.code,
    cn.name,
    cn.discount_type,
    cn.discount_value,
    c.Value as old_coupons_value,
    c.ValueType as old_value_type,
    c.CouponName as old_name,
    cr.value as rule_value
FROM coupons_new cn
LEFT JOIN coupons c ON cn.code = TRIM(c.CouponCode)
LEFT JOIN couponrules cr ON cr.couponId = c.CouponID AND cr.value != '0'
WHERE cn.code = 'JREED7';

-- Step 2: Try to fix from old coupons.Value field
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(c.Value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.code = 'JREED7'
  AND cn.discount_value = 0.00
  AND c.Value != '0'
  AND c.Value IS NOT NULL
  AND c.Value != ''
  AND TRIM(c.Value) != '';

-- Step 3: Try to fix from couponrules table
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
INNER JOIN couponrules cr ON cr.couponId = c.CouponID
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(cr.value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.code = 'JREED7'
  AND cn.discount_value = 0.00
  AND cr.value != '0'
  AND cr.value IS NOT NULL
  AND cr.value != '';

-- Step 4: Extract from coupon name (e.g., "7% OFF" -> 7)
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
WHERE cn.code = 'JREED7'
  AND cn.discount_value = 0.00
  AND c.CouponName LIKE '%\%%'
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.CouponName, '%', 1), ' ', -1) REGEXP '^[0-9]+\.?[0-9]*$';

-- Step 5: Manual fix - if the coupon name contains "7%", set it to 7
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = 7.00,
    cn.updated_at = NOW()
WHERE cn.code = 'JREED7'
  AND cn.discount_value = 0.00
  AND (c.CouponName LIKE '%7%' OR cn.name LIKE '%7%');

-- Step 6: Verify the fix
SELECT
    cn.id,
    cn.code,
    cn.name,
    cn.discount_type,
    cn.discount_value,
    cn.free_shipping,
    cn.updated_at
FROM coupons_new cn
WHERE cn.code = 'JREED7';

