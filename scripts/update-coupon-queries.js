// Updated coupon queries for the new modern coupons table structure

// Get coupon by code (updated for new table)
export async function getCouponByCodeNew(couponCode) {
  try {
    const query = `
      SELECT
        id,
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
        customer_segments,
        product_categories,
        excluded_products,
        min_products
      FROM coupons_new
      WHERE code = ?
        AND is_active = TRUE
        AND is_public = TRUE
        AND start_date <= CURDATE()
        AND end_date >= CURDATE()
        AND (start_time = '00:00:00' OR TIME(NOW()) >= start_time)
        AND (end_time = '23:59:59' OR TIME(NOW()) <= end_time)
        AND (usage_limit IS NULL OR times_used < usage_limit)
    `;

    const [rows] = await pool.query(query, [couponCode]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return null;
  }
}

// Validate coupon for cart (updated for new table)
export async function validateCouponForCartNew(
  couponCode,
  cartItems,
  customerId = null
) {
  try {
    const coupon = await getCouponByCodeNew(couponCode);

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid or expired coupon code",
      };
    }

    // Check minimum cart amount
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.Price) * item.quantity,
      0
    );
    if (cartTotal < coupon.min_cart_amount) {
      return {
        valid: false,
        message: `Minimum order amount of $${coupon.min_cart_amount} required`,
      };
    }

    // Check if customer has already used this coupon
    if (customerId && coupon.usage_limit_per_customer) {
      const usageQuery = `
        SELECT COUNT(*) as usageCount
        FROM coupon_usage
        WHERE coupon_id = ? AND customer_id = ?
      `;
      const [usageRows] = await pool.query(usageQuery, [coupon.id, customerId]);

      if (usageRows[0].usageCount >= coupon.usage_limit_per_customer) {
        return {
          valid: false,
          message: "You have already used this coupon",
        };
      }
    }

    // Calculate discount based on coupon type
    let discountAmount = 0;
    let freeShipping = coupon.free_shipping;

    if (coupon.discount_type === "percentage") {
      discountAmount = (cartTotal * coupon.discount_value) / 100;

      // Apply maximum discount limit if set
      if (
        coupon.max_discount_amount &&
        discountAmount > coupon.max_discount_amount
      ) {
        discountAmount = coupon.max_discount_amount;
      }
    } else if (coupon.discount_type === "fixed_amount") {
      discountAmount = coupon.discount_value;

      // Don't allow discount to exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountAmount: discountAmount,
        freeShipping: freeShipping,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        shippingDiscount: coupon.shipping_discount,
      },
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return {
      valid: false,
      message: "Error validating coupon",
    };
  }
}

// Record coupon usage (updated for new table)
export async function recordCouponUsageNew(
  couponId,
  customerId,
  orderId,
  discountAmount,
  cartTotal
) {
  try {
    // Start transaction
    await pool.query("START TRANSACTION");

    // Update coupon usage count
    await pool.query(
      "UPDATE coupons_new SET times_used = times_used + 1 WHERE id = ?",
      [couponId]
    );

    // Record in coupon usage table
    await pool.query(
      `
      INSERT INTO coupon_usage
      (coupon_id, customer_id, order_id, discount_amount, cart_total)
      VALUES (?, ?, ?, ?, ?)
    `,
      [couponId, customerId, orderId, discountAmount, cartTotal]
    );

    // Commit transaction
    await pool.query("COMMIT");
    return true;
  } catch (error) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error recording coupon usage:", error);
    return false;
  }
}

// Get coupon analytics
export async function getCouponAnalytics(couponId) {
  try {
    const query = `
      SELECT
        c.name,
        c.code,
        c.times_used,
        c.usage_limit,
        COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
        COALESCE(SUM(cu.cart_total), 0) as total_revenue,
        COUNT(cu.id) as total_uses
      FROM coupons_new c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.code, c.times_used, c.usage_limit
    `;

    const [rows] = await pool.query(query, [couponId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching coupon analytics:", error);
    return null;
  }
}

// Get all active coupons (for admin)
export async function getAllActiveCoupons() {
  try {
    const query = `
      SELECT
        id,
        code,
        name,
        discount_type,
        discount_value,
        min_cart_amount,
        start_date,
        end_date,
        times_used,
        usage_limit,
        is_active,
        created_at
      FROM coupons_new
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    return [];
  }
}
