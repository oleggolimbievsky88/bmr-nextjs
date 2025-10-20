# Vercel Deployment Steps

## 1. Database Setup
Run the following SQL script on your production MySQL database:

```sql
-- Create new_orders table (to avoid conflict with existing orders table)
CREATE TABLE IF NOT EXISTS `new_orders` (
  `new_order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_id` int unsigned DEFAULT NULL,
  `billing_first_name` varchar(100) NOT NULL,
  `billing_last_name` varchar(100) NOT NULL,
  `billing_address1` varchar(255) NOT NULL,
  `billing_address2` varchar(255) DEFAULT '',
  `billing_city` varchar(100) NOT NULL,
  `billing_state` varchar(50) NOT NULL,
  `billing_zip` varchar(20) NOT NULL,
  `billing_country` varchar(100) NOT NULL DEFAULT 'United States',
  `billing_phone` varchar(20) DEFAULT '',
  `billing_email` varchar(100) NOT NULL,
  `shipping_first_name` varchar(100) NOT NULL,
  `shipping_last_name` varchar(100) NOT NULL,
  `shipping_address1` varchar(255) NOT NULL,
  `shipping_address2` varchar(255) DEFAULT '',
  `shipping_city` varchar(100) NOT NULL,
  `shipping_state` varchar(50) NOT NULL,
  `shipping_zip` varchar(20) NOT NULL,
  `shipping_country` varchar(100) NOT NULL DEFAULT 'United States',
  `shipping_method` varchar(100) DEFAULT 'Standard Shipping',
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `coupon_code` varchar(50) DEFAULT '',
  `payment_method` varchar(50) DEFAULT 'Credit Card',
  `payment_status` varchar(50) DEFAULT 'pending',
  `order_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`new_order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  KEY `order_date` (`order_date`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create new_order_items table (to avoid conflict with existing system)
CREATE TABLE IF NOT EXISTS `new_order_items` (
  `new_order_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `new_order_id` int unsigned NOT NULL,
  `product_id` int unsigned DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `part_number` varchar(100) NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `color` varchar(50) DEFAULT '',
  `platform` varchar(100) DEFAULT '',
  `year_range` varchar(50) DEFAULT '',
  `image` varchar(255) DEFAULT '',
  PRIMARY KEY (`new_order_item_id`),
  KEY `new_order_id` (`new_order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `new_order_items_ibfk_1` FOREIGN KEY (`new_order_id`) REFERENCES `new_orders` (`new_order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 2. Environment Variables in Vercel
Make sure these environment variables are set in your Vercel dashboard:

- `MYSQL_HOST` - Your MySQL host
- `MYSQL_USER` - Your MySQL username
- `MYSQL_PASSWORD` - Your MySQL password
- `MYSQL_DATABASE` - Your MySQL database name

## 3. Build Script Warning (Optional)
The warning about build scripts is just informational and won't affect your deployment. If you want to suppress it, you can add this to your `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "postinstall": "echo 'Build complete'"
  }
}
```

## 4. Test the Deployment
After setting up the database tables and environment variables:

1. Go to your Vercel dashboard
2. Trigger a new deployment
3. Test the checkout flow on your live site
4. Check that orders are being saved to the `new_orders` table

## 5. Troubleshooting
If you encounter issues:

1. Check Vercel function logs for database connection errors
2. Verify environment variables are set correctly
3. Test database connection from your local environment
4. Check that the new tables exist in your production database

## 6. Email Integration (Future)
To enable email sending, you'll need to integrate with an email service like SendGrid or Nodemailer and add the appropriate API keys to your environment variables.
