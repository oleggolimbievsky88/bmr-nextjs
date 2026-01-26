import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  getNextOrderNumber,
  ensureOrderTablesExist,
  createOrder,
  createOrderItems,
  recordCouponUsage,
} from "@/lib/queries";

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
    if (!orderData.billing || !orderData.shipping || !orderData.items || orderData.items.length === 0) {
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
    const orderDate = new Date().toISOString();

    // Calculate totals
    const subtotal = orderData.items.reduce((total, item) => {
      return total + parseFloat(item.price || 0) * (item.quantity || 1);
    }, 0);

    const total =
      subtotal +
      parseFloat(orderData.shippingCost || 0) +
      parseFloat(orderData.tax || 0) -
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

    // Send confirmation email
    try {
      await sendConfirmationEmail({
        orderNumber,
        orderDate,
        customerEmail: orderData.billing.email,
        customerName: `${orderData.billing.firstName} ${orderData.billing.lastName}`,
        orderData,
        subtotal,
        total,
        notes: orderData.notes || "",
      });
    } catch (emailError) {
      // Log email error but don't fail the order
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


async function sendConfirmationEmail(emailData) {
  try {
    // Check if SMTP is configured
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.warn("SMTP not configured - skipping email send");
      console.log("Email would be sent to:", emailData.customerEmail);
      return;
    }

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - BMR Suspension</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .order-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .item-row { border-bottom: 1px solid #eee; padding: 10px 0; }
          .totals { background-color: #e9ecef; padding: 15px; border-radius: 5px; }
          .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BMR Suspension</h1>
            <h2>Order Confirmation</h2>
          </div>

          <div class="content">
            <p>Dear ${emailData.customerName},</p>

            <p>Thank you for your purchase! We have received your order and will work on shipping it out as soon as possible. Once your order is processed through our system, you will receive tracking information. Please note, we will not charge your card until your part(s) are ready to ship out.</p>

            <p>All orders are manually entered to ensure all information is correct before shipment.</p>

            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${emailData.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(
                emailData.orderDate
              ).toLocaleDateString()}</p>

              <h4>Items Ordered:</h4>
              ${emailData.orderData.items
                .map(
                  (item) => `
                <div class="item-row">
                  <strong>${item.name}</strong><br>
                  Part #: ${item.partNumber} | Color: ${item.color || "N/A"}<br>
                  Quantity: ${item.quantity} | Price: $${parseFloat(
                    item.price
                  ).toFixed(2)}<br>
                  Total: $${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
              `
                )
                .join("")}

              <div class="totals">
                <p><strong>Subtotal:</strong> $${emailData.subtotal.toFixed(
                  2
                )}</p>
                ${
                  emailData.orderData.shippingCost > 0
                    ? `<p><strong>Shipping:</strong> $${parseFloat(
                        emailData.orderData.shippingCost
                      ).toFixed(2)}</p>`
                    : ""
                }
                ${
                  emailData.orderData.tax > 0
                    ? `<p><strong>Tax:</strong> $${parseFloat(
                        emailData.orderData.tax
                      ).toFixed(2)}</p>`
                    : ""
                }
                ${
                  emailData.orderData.discount > 0
                    ? `<p><strong>Discount:</strong> -$${parseFloat(
                        emailData.orderData.discount
                      ).toFixed(2)}</p>`
                    : ""
                }
                <p><strong>Total:</strong> $${emailData.total.toFixed(2)}</p>
              </div>
              ${
                emailData.notes && emailData.notes.trim()
                  ? `<div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #dc3545; border-radius: 4px;">
                    <h4 style="margin-top: 0; color: #000;">Order Notes:</h4>
                    <p style="margin-bottom: 0; white-space: pre-wrap;">${emailData.notes}</p>
                  </div>`
                  : ""
              }
            </div>

            <p>If you have any questions or would like to change any part of your order, simply send us an email at <a href="mailto:WebSales@bmrsuspension.com">WebSales@bmrsuspension.com</a> or call us at <a href="tel:+18139869302">(813) 986-9302</a> between 8:30 - 5:00 pm Eastern time, Monday through Friday.</p>

            <p>We thank you for continuing to support American manufacturing!</p>

            <p>Best regards,<br>BMR Suspension Team</p>
          </div>

          <div class="footer">
            <p>BMR Suspension - Performance Racing Suspension & Chassis Parts</p>
            <p>WebSales@bmrsuspension.com | (813) 986-9302</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "noreply@bmrsuspension.com",
      to: emailData.customerEmail,
      subject: `Order Confirmation - ${emailData.orderNumber}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully:", {
      messageId: info.messageId,
      to: emailData.customerEmail,
      orderNumber: emailData.orderNumber,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't throw error here as we don't want to fail the order if email fails
  }
}
