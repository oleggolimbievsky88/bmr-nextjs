import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { orderId } = params;

    // Fetch order details
    const orderSql = `
      SELECT * FROM new_orders WHERE new_order_id = ?
    `;
    const orderResult = await query(orderSql, [orderId]);

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Fetch order items
    const itemsSql = `
      SELECT * FROM new_order_items WHERE new_order_id = ?
    `;
    const itemsResult = await query(itemsSql, [orderId]);

    // Format the order data
    const orderData = {
      orderId: order.new_order_id,
      orderNumber: order.order_number,
      orderDate: order.order_date,
      status: order.status,
      billing: {
        firstName: order.billing_first_name,
        lastName: order.billing_last_name,
        address1: order.billing_address1,
        address2: order.billing_address2,
        city: order.billing_city,
        state: order.billing_state,
        zip: order.billing_zip,
        country: order.billing_country,
        phone: order.billing_phone,
        email: order.billing_email,
      },
      shipping: {
        firstName: order.shipping_first_name,
        lastName: order.shipping_last_name,
        address1: order.shipping_address1,
        address2: order.shipping_address2,
        city: order.shipping_city,
        state: order.shipping_state,
        zip: order.shipping_zip,
        country: order.shipping_country,
      },
      shippingMethod: order.shipping_method,
      shippingCost: order.shipping_cost,
      tax: order.tax,
      discount: order.discount,
      couponCode: order.coupon_code,
      paymentMethod: order.payment_method,
      items: itemsResult.map((item) => ({
        productId: item.product_id,
        name: item.product_name,
        partNumber: item.part_number,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        platform: item.platform,
        yearRange: item.year_range,
        image: item.image,
      })),
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
