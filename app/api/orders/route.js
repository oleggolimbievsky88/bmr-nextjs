import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const orderData = await request.json();

    // Generate order number
    const orderNumber = generateOrderNumber();
    const orderDate = new Date().toISOString();

    // Calculate totals
    const subtotal = orderData.items.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);

    const total =
      subtotal +
      parseFloat(orderData.shippingCost || 0) +
      parseFloat(orderData.tax || 0) -
      parseFloat(orderData.discount || 0);

    // Create order record
    const orderId = await createOrder({
      ...orderData,
      orderNumber,
      orderDate,
      subtotal,
      total,
    });

    // Create order items
    await createOrderItems(orderId, orderData.items);

    // Send confirmation email
    await sendConfirmationEmail({
      orderNumber,
      orderDate,
      customerEmail: orderData.billing.email,
      customerName: `${orderData.billing.firstName} ${orderData.billing.lastName}`,
      orderData,
      subtotal,
      total,
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: "Order processed successfully",
    });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process order" },
      { status: 500 }
    );
  }
}

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `BMR-${timestamp.slice(-6)}-${random}`;
}

async function createOrder(orderData) {
  const sql = `
    INSERT INTO new_orders (
      order_number, customer_id, billing_first_name, billing_last_name,
      billing_address1, billing_address2, billing_city, billing_state,
      billing_zip, billing_country, billing_phone, billing_email,
      shipping_first_name, shipping_last_name, shipping_address1,
      shipping_address2, shipping_city, shipping_state, shipping_zip,
      shipping_country, shipping_method, subtotal, shipping_cost,
      tax, discount, total, coupon_code, payment_method, order_date,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    orderData.orderNumber,
    orderData.customerId || null,
    orderData.billing.firstName,
    orderData.billing.lastName,
    orderData.billing.address1,
    orderData.billing.address2 || "",
    orderData.billing.city,
    orderData.billing.state,
    orderData.billing.zip,
    orderData.billing.country,
    orderData.billing.phone || "",
    orderData.billing.email,
    orderData.shipping.firstName,
    orderData.shipping.lastName,
    orderData.shipping.address1,
    orderData.shipping.address2 || "",
    orderData.shipping.city,
    orderData.shipping.state,
    orderData.shipping.zip,
    orderData.shipping.country,
    orderData.shippingMethod || "Standard Shipping",
    orderData.subtotal,
    orderData.shippingCost || 0,
    orderData.tax || 0,
    orderData.discount || 0,
    orderData.total,
    orderData.couponCode || "",
    orderData.paymentMethod || "Credit Card",
    orderData.orderDate,
    "pending",
  ];

  const result = await query(sql, values);
  return result.insertId;
}

async function createOrderItems(orderId, items) {
  for (const item of items) {
    const sql = `
      INSERT INTO new_order_items (
        new_order_id, product_id, product_name, part_number, quantity,
        price, color, platform, year_range, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      orderId,
      item.productId,
      item.name,
      item.partNumber,
      item.quantity,
      item.price,
      item.color,
      item.platform,
      item.yearRange,
      item.image || "",
    ];

    await query(sql, values);
  }
}

async function sendConfirmationEmail(emailData) {
  try {
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
                  Part #: ${item.partNumber} | Color: ${item.color}<br>
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

    // Send email using your preferred email service
    // For now, we'll use a simple console log to simulate sending
    console.log("Email would be sent to:", emailData.customerEmail);
    console.log("Email content:", emailHtml);

    // TODO: Integrate with actual email service (SendGrid, Nodemailer, etc.)
    // Example with Nodemailer:
    /*
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransporter({
      // Your email configuration
    })

    await transporter.sendMail({
      from: 'WebSales@bmrsuspension.com',
      to: emailData.customerEmail,
      subject: `Order Confirmation - ${emailData.orderNumber}`,
      html: emailHtml
    })
    */
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't throw error here as we don't want to fail the order if email fails
  }
}
