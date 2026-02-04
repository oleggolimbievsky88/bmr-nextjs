import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  generateOrderConfirmationHTML,
  ORDER_CONFIRMATION_SUBJECT,
} from "@/lib/order-confirmation-email";
import {
  getNextOrderNumber,
  ensureOrderTablesExist,
  createOrder,
  createOrderItems,
  recordCouponUsage,
  insertOrderStatusHistory,
} from "@/lib/queries";
import { getTaxAmount } from "@/lib/tax";

export async function POST(request) {
  let orderData = null;

  try {
    // Check if database connection is available
    if (!process.env.MYSQL_HOST) {
      return NextResponse.json(
        { success: false, message: "Database configuration missing" },
        { status: 500 }
      );
    }

    // Ensure tables exist
    const tablesExist = await ensureOrderTablesExist();
    if (!tablesExist) {
      console.error("Failed to ensure order tables exist");
      // Continue anyway - tables might already exist
    }

    try {
      orderData = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          error: "Failed to parse request body",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !orderData.billing ||
      !orderData.shipping ||
      !orderData.items ||
      orderData.items.length === 0
    ) {
      console.error("Missing required fields:", {
        hasBilling: !!orderData.billing,
        hasShipping: !!orderData.shipping,
        hasItems: !!orderData.items,
        itemsLength: orderData.items?.length || 0,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Missing required order data",
          error: "Billing, shipping, and items are required",
        },
        { status: 400 }
      );
    }

    // Validate billing fields
    if (
      !orderData.billing.firstName ||
      !orderData.billing.lastName ||
      !orderData.billing.address1 ||
      !orderData.billing.city ||
      !orderData.billing.state ||
      !orderData.billing.zip ||
      !orderData.billing.email
    ) {
      console.error("Missing required billing fields");
      return NextResponse.json(
        {
          success: false,
          message: "Missing required billing information",
          error: "All billing fields are required",
        },
        { status: 400 }
      );
    }

    // Generate order number (sequential starting from 660000)
    const orderNumberValue = await getNextOrderNumber();
    const orderNumber = `BMR-${orderNumberValue}`;
    // Format date for MySQL datetime column (YYYY-MM-DD HH:MM:SS)
    const now = new Date();
    const orderDate = now.toISOString().slice(0, 19).replace("T", " ");

    // Calculate totals: 7% tax for Florida only; FL shipping tax when order has non-BMR / Package / Low Margin
    const subtotal = orderData.items.reduce((total, item) => {
      return total + parseFloat(item.price || 0) * (item.quantity || 1);
    }, 0);

    const shippingState =
      orderData.shipping?.state || orderData.billing?.state || "";
    const tax = getTaxAmount(subtotal, orderData.discount || 0, shippingState, {
      shippingCost: parseFloat(orderData.shippingCost || 0),
      items: orderData.items,
    });

    const total =
      subtotal +
      parseFloat(orderData.shippingCost || 0) +
      tax -
      parseFloat(orderData.discount || 0);

    console.log("Creating order:", {
      orderNumber,
      subtotal,
      total,
      itemsCount: orderData.items.length,
      hasBilling: !!orderData.billing,
      hasShipping: !!orderData.shipping,
      billingEmail: orderData.billing?.email,
      customerId: orderData.customerId,
    });

    // Create order record
    let orderId;
    try {
      orderId = await createOrder({
        ...orderData,
        orderNumber,
        orderDate,
        subtotal,
        total,
        tax,
      });
    } catch (createError) {
      console.error("Error in createOrder function:", {
        error: createError.message,
        code: createError.code,
        sqlState: createError.sqlState,
        sqlMessage: createError.sqlMessage,
        stack: createError.stack,
      });
      throw createError; // Re-throw to be caught by outer catch
    }

    console.log("Order created with ID:", orderId);

    // Seed audit history so every order has a timeline entry
    try {
      await insertOrderStatusHistory(
        orderId,
        orderData.customerId || null,
        orderData.billing.email,
        `${orderData.billing.firstName} ${orderData.billing.lastName}`,
        null,
        "pending",
        null
      );
    } catch (e) {
      // Do not block checkout if audit logging fails
      console.error(
        "Failed to insert initial order status history:",
        e.message
      );
    }

    // Create order items
    await createOrderItems(orderId, orderData.items);

    console.log("Order items created successfully");

    // Record coupon usage if a coupon was applied
    if (orderData.couponId && orderData.discount > 0) {
      try {
        await recordCouponUsage(
          orderData.couponId,
          orderData.customerId || null,
          orderId, // Using new_order_id as the order_id for coupon_usage
          orderData.discount,
          orderData.subtotal
        );
        console.log("Coupon usage recorded successfully:", {
          couponId: orderData.couponId,
          discount: orderData.discount,
        });
      } catch (couponError) {
        // Log error but don't fail the order if coupon recording fails
        console.error("Error recording coupon usage:", couponError);
      }
    }

    // Send single order confirmation email (matches order confirmation page design)
    try {
      const emailOrderData = {
        orderId: orderNumber,
        billing: orderData.billing,
        shipping: orderData.shipping || orderData.billing,
        items: orderData.items,
        shippingCost: parseFloat(orderData.shippingCost || 0),
        tax,
        discount: parseFloat(orderData.discount || 0),
        total,
        notes: orderData.notes || "",
        couponCode: orderData.couponCode || "",
        freeShipping: orderData.freeShipping ?? false,
        shippingMethod: orderData.shippingMethod || "Standard Shipping",
        paymentMethod: orderData.paymentMethod || "Credit Card",
        paypalEmail: orderData.paypalEmail || null,
        cardType: orderData.cardType || orderData.ccType || null,
        cardLastFour: orderData.cardLastFour || orderData.ccLastFour || null,
        isDealer: !!orderData.isDealer,
      };
      await sendOrderConfirmationEmail(
        orderData.billing.email,
        orderNumber,
        emailOrderData
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: "Order processed successfully",
    });
  } catch (error) {
    const errorDetails = {
      error: error.message || "Unknown error occurred",
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    };

    console.error("Error processing order:", {
      ...errorDetails,
      stack: error.stack,
      orderData: orderData
        ? {
            itemsCount: orderData.items?.length,
            billingEmail: orderData.billing?.email,
            orderNumber: orderData.orderNumber,
          }
        : null,
    });

    // Always return a valid JSON response
    try {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process order",
          error: error.message || "Unknown error occurred",
          ...(process.env.NODE_ENV === "development" && {
            details: errorDetails,
            stack: error.stack,
          }),
        },
        { status: 500 }
      );
    } catch (jsonError) {
      // Fallback if JSON serialization fails
      console.error("Failed to serialize error response:", jsonError);
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Failed to process order",
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
}

async function sendOrderConfirmationEmail(to, orderNumber, orderData) {
  try {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.warn("SMTP not configured - skipping email send");
      console.log("Email would be sent to:", to);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = generateOrderConfirmationHTML(orderData);
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "noreply@bmrsuspension.com",
      to,
      subject: ORDER_CONFIRMATION_SUBJECT(orderNumber),
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent:", {
      messageId: info.messageId,
      to,
      orderNumber,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}
