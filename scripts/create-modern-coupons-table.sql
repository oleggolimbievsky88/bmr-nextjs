-- Modern Coupons Table Structure
-- This replaces the existing coupons table with a more robust design

-- Drop existing table if it exists (be careful in production!)
-- DROP TABLE IF EXISTS coupons_new;

CREATE TABLE coupons_new (
    -- Primary identification
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Basic coupon information
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Discount configuration
    discount_type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    -- Usage constraints
    min_cart_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) DEFAULT NULL,

    -- Validity period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME DEFAULT '00:00:00',
    end_time TIME DEFAULT '23:59:59',

    -- Usage limits
    usage_limit INT UNSIGNED DEFAULT NULL,
    usage_limit_per_customer INT UNSIGNED DEFAULT 1,
    times_used INT UNSIGNED DEFAULT 0,

    -- Targeting (optional - for advanced targeting)
    customer_segments JSON DEFAULT NULL, -- ['new_customers', 'vip', 'loyalty_members']
    product_categories JSON DEFAULT NULL, -- ['electronics', 'clothing']
    excluded_products JSON DEFAULT NULL, -- [1, 2, 3] - product IDs to exclude
    min_products INT UNSIGNED DEFAULT 1,

    -- Shipping configuration
    free_shipping BOOLEAN DEFAULT FALSE,
    shipping_discount DECIMAL(10, 2) DEFAULT 0.00,

    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE, -- Can be used by anyone vs private codes
    created_by INT UNSIGNED DEFAULT NULL, -- Admin user who created it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_code (code),
    INDEX idx_active_dates (is_active, start_date, end_date),
    INDEX idx_usage_limits (usage_limit, times_used),
    INDEX idx_public_active (is_public, is_active)
);

-- Create coupon usage tracking table
CREATE TABLE coupon_usage (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED DEFAULT NULL,
    order_id INT UNSIGNED DEFAULT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    cart_total DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (coupon_id) REFERENCES coupons_new(id) ON DELETE CASCADE,
    INDEX idx_coupon_usage (coupon_id),
    INDEX idx_customer_usage (customer_id),
    INDEX idx_order_usage (order_id)
);

-- Create coupon rules table for complex conditions
CREATE TABLE coupon_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT UNSIGNED NOT NULL,
    rule_type ENUM('min_quantity', 'max_quantity', 'specific_products', 'exclude_products', 'customer_group') NOT NULL,
    rule_value JSON NOT NULL, -- Flexible JSON for different rule types
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (coupon_id) REFERENCES coupons_new(id) ON DELETE CASCADE,
    INDEX idx_coupon_rules (coupon_id)
);

-- Insert some sample coupons
INSERT INTO coupons_new (
    code, name, description, discount_type, discount_value,
    min_cart_amount, start_date, end_date, free_shipping,
    usage_limit, is_active, is_public
) VALUES
(
    'WELCOME10',
    'Welcome Discount',
    '10% off your first order',
    'percentage',
    10.00,
    50.00,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    FALSE,
    1000,
    TRUE,
    TRUE
),
(
    'FREESHIP',
    'Free Shipping',
    'Free shipping on orders over $75',
    'free_shipping',
    0.00,
    75.00,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    TRUE,
    NULL,
    TRUE,
    TRUE
),
(
    'SAVE20',
    'Save $20',
    '$20 off orders over $100',
    'fixed_amount',
    20.00,
    100.00,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 6 MONTH),
    FALSE,
    500,
    TRUE,
    TRUE
),
(
    'PEACOCK7',
    '7% OFF and FREE Shipping for Drew Peacock friends, customers and followers',
    'Special discount for Drew Peacock community',
    'percentage',
    7.00,
    0.00,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    TRUE,
    NULL,
    TRUE,
    TRUE
);

-- Create a view for easy coupon validation
CREATE VIEW valid_coupons AS
SELECT
    c.*,
    CASE
        WHEN c.usage_limit IS NULL THEN TRUE
        WHEN c.times_used < c.usage_limit THEN TRUE
        ELSE FALSE
    END as can_use,
    CASE
        WHEN c.discount_type = 'percentage' THEN CONCAT(c.discount_value, '% off')
        WHEN c.discount_type = 'fixed_amount' THEN CONCAT('$', c.discount_value, ' off')
        WHEN c.discount_type = 'free_shipping' THEN 'Free Shipping'
        ELSE 'Discount'
    END as discount_description
FROM coupons_new c
WHERE c.is_active = TRUE
  AND c.is_public = TRUE
  AND c.start_date <= CURDATE()
  AND c.end_date >= CURDATE()
  AND (c.start_time = '00:00:00' OR TIME(NOW()) >= c.start_time)
  AND (c.end_time = '23:59:59' OR TIME(NOW()) <= c.end_time);

-- Create indexes for better performance
CREATE INDEX idx_coupons_validation ON coupons_new (is_active, is_public, start_date, end_date, start_time, end_time);
CREATE INDEX idx_coupons_usage ON coupons_new (usage_limit, times_used);
