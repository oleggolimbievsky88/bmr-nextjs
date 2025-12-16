-- Fix coupon discount values that are 0.00 but should have a value
-- This script checks and fixes coupons that have missing discount values

USE bmrsuspension;

-- Step 1: Check coupons with 0.00 discount values
SELECT
    cn.id,
    cn.code,
    cn.name,
    cn.discount_type,
    cn.discount_value,
    c.Value as old_value,
    c.ValueType as old_value_type,
    cr.value as rule_value
FROM coupons_new cn
LEFT JOIN coupons c ON cn.code = TRIM(c.CouponCode)
LEFT JOIN couponrules cr ON cr.couponId = c.CouponID
WHERE cn.discount_value = 0.00
  AND cn.discount_type = 'percentage'
ORDER BY cn.code;

-- Step 2: Update from coupons.Value field
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(c.Value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND cn.discount_type = 'percentage'
  AND c.Value != '0'
  AND c.Value IS NOT NULL
  AND c.Value != ''
  AND TRIM(c.Value) != ''
  AND CAST(TRIM(REPLACE(REPLACE(REPLACE(c.Value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)) > 0;

-- Step 3: Update from couponrules table
UPDATE coupons_new cn
INNER JOIN coupons c ON cn.code = TRIM(c.CouponCode)
INNER JOIN couponrules cr ON cr.couponId = c.CouponID
SET cn.discount_value = CAST(TRIM(REPLACE(REPLACE(REPLACE(cr.value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)),
    cn.updated_at = NOW()
WHERE cn.discount_value = 0.00
  AND cn.discount_type = 'percentage'
  AND cr.value != '0'
  AND cr.value IS NOT NULL
  AND cr.value != ''
  AND CAST(TRIM(REPLACE(REPLACE(REPLACE(cr.value, '%', ''), '$', ''), ',', '')) AS DECIMAL(10,2)) > 0;

-- Step 4: Extract percentage from coupon name (e.g., "7% OFF" -> 7)
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
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.CouponName, '%', 1), ' ', -1) REGEXP '^[0-9]+\.?[0-9]*$'
  AND CAST(
        TRIM(
            SUBSTRING_INDEX(
                SUBSTRING_INDEX(c.CouponName, '%', 1),
                ' ',
                -1
            )
        ) AS DECIMAL(10,2)
    ) > 0;

-- Step 5: Extract first number from coupon name for percentage coupons
-- This handles cases like "7 OFF" or "15 OFF"
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
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT(c.CouponName, ' '), ' ', 1), '%', 1) REGEXP '^[0-9]+\.?[0-9]*$'
  AND CAST(
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
    ) > 0;

-- Step 6: Verify fixes - show coupons that still have 0.00
SELECT
    cn.code,
    cn.name,
    cn.discount_type,
    cn.discount_value,
    c.Value as old_value,
    c.CouponName as old_name
FROM coupons_new cn
LEFT JOIN coupons c ON cn.code = TRIM(c.CouponCode)
WHERE cn.discount_value = 0.00
  AND cn.discount_type = 'percentage'
ORDER BY cn.code;

-- Step 7: Show specific coupon (JREED7) details
SELECT
    cn.*,
    c.Value as old_value,
    c.ValueType as old_value_type,
    c.CouponName as old_name,
    cr.value as rule_value
FROM coupons_new cn
LEFT JOIN coupons c ON cn.code = TRIM(c.CouponCode)
LEFT JOIN couponrules cr ON cr.couponId = c.CouponID
WHERE cn.code = 'JREED7';

