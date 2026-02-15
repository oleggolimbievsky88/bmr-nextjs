/**
 * Gift card generation and helpers.
 * When a customer purchases a gift certificate product, we generate unique codes
 * and store them as coupons with remaining_balance. They can be applied at checkout
 * until the balance is depleted.
 */

import pool from "@/lib/db";
import crypto from "crypto";
import { isGiftCertificateProduct } from "./giftCardUtils";

export { isGiftCertificateProduct };

/**
 * Generate a random gift card code (alphanumeric, e.g. BMR-XXXX-XXXX)
 */
export function generateGiftCardCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0,O,1,I to avoid confusion
  const segment = () =>
    Array.from(
      { length: 4 },
      () => chars[crypto.randomInt(0, chars.length)],
    ).join("");
  return `BMR-${segment()}-${segment()}`;
}

/**
 * Ensure code is unique in coupons_new
 */
async function ensureUniqueCode(code) {
  const [rows] = await pool.query(
    "SELECT id FROM coupons_new WHERE code = ? LIMIT 1",
    [code],
  );
  if (rows.length > 0) {
    return ensureUniqueCode(generateGiftCardCode());
  }
  return code;
}

/**
 * Create a gift card coupon and link to order
 */
export async function createGiftCardCoupon({
  orderId,
  orderItemId,
  amount,
  productName,
  partNumber,
}) {
  const code = await ensureUniqueCode(generateGiftCardCode());
  const now = new Date().toISOString().slice(0, 10);
  const yearLater = new Date();
  yearLater.setFullYear(yearLater.getFullYear() + 1);
  const endDate = yearLater.toISOString().slice(0, 10);

  const [result] = await pool.query(
    `INSERT INTO coupons_new (
      code, name, description, discount_type, discount_value,
      min_cart_amount, max_discount_amount, start_date, end_date,
      start_time, end_time, usage_limit, usage_limit_per_customer,
      free_shipping, shipping_discount, is_active, is_public,
      is_gift_card, remaining_balance, order_id
    ) VALUES (?, ?, ?, 'gift_card', ?, 0, NULL, ?, ?, '00:00:00', '23:59:59',
      NULL, NULL, 0, 0, 1, 1, 1, ?, ?)`,
    [
      code,
      `Gift Card $${parseFloat(amount).toFixed(2)}`,
      `BMR Suspension gift certificate`,
      parseFloat(amount),
      now,
      endDate,
      parseFloat(amount),
      orderId,
    ],
  );

  const couponId = result.insertId;

  await pool.query(
    `INSERT INTO order_gift_cards (new_order_id, new_order_item_id, coupon_id, initial_amount, product_name, part_number)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      orderItemId,
      couponId,
      parseFloat(amount),
      productName,
      partNumber,
    ],
  );

  return { couponId, code };
}

/**
 * Generate gift cards for all gift certificate items in an order
 */
export async function generateGiftCardsForOrder(orderId, items, orderItemIds) {
  const created = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!isGiftCertificateProduct(item)) continue;

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const faceValue = parseFloat(item.price || 0);
    const orderItemId =
      orderItemIds && orderItemIds[i] ? orderItemIds[i] : null;

    for (let j = 0; j < qty; j++) {
      const { code } = await createGiftCardCoupon({
        orderId,
        orderItemId,
        amount: faceValue,
        productName: item.name,
        partNumber: item.partNumber,
      });
      created.push({
        code,
        amount: faceValue,
        productName: item.name,
        partNumber: item.partNumber,
      });
    }
  }
  return created;
}

/**
 * Get gift cards for an order (for display on receipt/admin)
 */
export async function getGiftCardsForOrder(orderId) {
  const [rows] = await pool.query(
    `SELECT ogc.*, cn.code, cn.remaining_balance
     FROM order_gift_cards ogc
     INNER JOIN coupons_new cn ON ogc.coupon_id = cn.id
     WHERE ogc.new_order_id = ?
     ORDER BY ogc.id`,
    [orderId],
  );
  return rows || [];
}
