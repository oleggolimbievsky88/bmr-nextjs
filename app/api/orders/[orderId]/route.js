import { NextResponse } from "next/server";
import { getOrderById, getOrderItems, getCustomerRole } from "@/lib/queries";
import { getGiftCardsForOrder } from "@/lib/giftCards";

export async function GET(request, { params }) {
  try {
    // Check if database connection is available
    if (!process.env.MYSQL_HOST) {
      return NextResponse.json(
        { success: false, message: "Database configuration missing" },
        { status: 500 },
      );
    }

    const { orderId } = await params;

    // Fetch order details - try by order_number first (e.g., "BMR-660000"), then by ID
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    const customerRole = order.customer_id
      ? await getCustomerRole(order.customer_id)
      : null;
    const isDealer = customerRole === "dealer" || customerRole === "admin";

    // Fetch order items and gift cards using the actual database ID
    // Handle both new_order_id (snake_case) and newOrderId (camelCase) from MySQL
    const orderIdNum = order.new_order_id ?? order.newOrderId;
    const [itemsResult, giftCards] = await Promise.all([
      getOrderItems(orderIdNum),
      getGiftCardsForOrder(orderIdNum).catch(() => []),
    ]);

    // Format the order data
    const orderData = {
      orderId: order.order_number, // Use order number (e.g., "BMR-660000") for consistency
      orderNumber: order.order_number,
      orderDate: order.order_date,
      status: order.status,
      cardLastFour: order.cc_last_four || "",
      cardType: order.cc_type || "",
      paypalEmail: order.paypal_email || "",
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
      shippingCost: parseFloat(order.shipping_cost) || 0,
      tax: parseFloat(order.tax) || 0,
      discount: parseFloat(order.discount) || 0,
      couponCode: order.coupon_code,
      paymentMethod: order.payment_method,
      notes: order.notes || "",
      total: parseFloat(order.total) || 0,
      isDealer: !!isDealer,
      items: itemsResult.map((item) => ({
        productId: item.product_id,
        name: item.product_name,
        partNumber: item.part_number,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        color: item.color,
        size: item.size || "",
        platform: item.platform,
        yearRange: item.year_range,
        image: item.image,
        lineDiscount: parseFloat(item.line_discount) || 0,
      })),
      giftCards: giftCards || [],
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 },
    );
  }
}
