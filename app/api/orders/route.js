import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import pool from "@/lib/db";
import nodemailer from "nodemailer";

async function getNextOrderNumber() {
  try {
    // Get the highest order number from the database
    const sql = `
      SELECT order_number
      FROM new_orders
      ORDER BY new_order_id DESC
      LIMIT 100
    `;

    const rows = await query(sql);
    let nextOrderNumber = 660000;
    let maxFound = 0;

    // Extract numbers from order numbers (handles both "BMR-660001" and "660001" formats)
    if (rows && rows.length > 0) {
      for (const row of rows) {
        const orderNum = row.order_number || "";
        // Extract number from "BMR-660001" format or just number
        const match = orderNum.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num >= 660000 && num > maxFound) {
            maxFound = num;
          }
        }
      }

      if (maxFound >= 660000) {
        nextOrderNumber = maxFound + 1;
      }
    }

    return nextOrderNumber;
  } catch (error) {
    console.error("Error getting next order number:", error);
    // Fallback to 660000
    return 660000;
  }
}

export async function POST(request) {
  try {
    // Check if database connection is available
    if (!process.env.MYSQL_HOST) {
      return NextResponse.json(
        { success: false, message: "Database configuration missing" },
        { status: 500 }
      );
    }

    // Ensure tables exist
    await ensureOrderTablesExist();

    const orderData = await request.json();

    // Generate order number (sequential starting from 660000)
    const orderNumberValue = await getNextOrderNumber();
    const orderNumber = `BMR-${orderNumberValue}`;
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
      notes: orderData.notes || "",
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: "Order processed successfully",
    });
  } catch (error) {
    console.error("Error processing order:", {
      error: error.message,
      stack: error.stack,
      orderData: orderData
        ? {
            itemsCount: orderData.items?.length,
            billingEmail: orderData.billing?.email,
          }
        : null,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process order",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
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
      status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    orderData.notes || "",
  ];

  try {
    // Use pool.query() which returns [result, fields] for INSERT statements
    const [result] = await pool.query(sql, values);
    if (!result || !result.insertId) {
      throw new Error("Failed to insert order - no insertId returned");
    }
    return result.insertId;
  } catch (error) {
    console.error("Error creating order:", {
      error: error.message,
      sql: sql.substring(0, 100),
      valuesCount: values.length,
    });
    throw error;
  }
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
      item.productId || null,
      item.name,
      item.partNumber,
      item.quantity,
      item.price,
      item.color || "",
      item.platform || "",
      item.yearRange || "",
      item.image || "",
    ];

    try {
      await pool.query(sql, values);
    } catch (error) {
      console.error("Error creating order item:", {
        error: error.message,
        orderId,
        item: item.name,
      });
      throw error;
    }
  }
}

async function ensureOrderTablesExist() {
  try {
    // Check if new_orders table exists by trying to query it
    try {
      await query("SELECT 1 FROM new_orders LIMIT 1");
      // Table exists, return early
      return;
    } catch (error) {
      // Table doesn't exist, create it
      if (error.code === "ER_NO_SUCH_TABLE" || error.code === 1146) {
        console.log("Creating new_orders and new_order_items tables...");

        // Create new_orders table
        const createOrdersTable = `
          CREATE TABLE IF NOT EXISTS \`new_orders\` (
            \`new_order_id\` int unsigned NOT NULL AUTO_INCREMENT,
            \`order_number\` varchar(50) NOT NULL,
            \`customer_id\` int unsigned DEFAULT NULL,
            \`billing_first_name\` varchar(100) NOT NULL,
            \`billing_last_name\` varchar(100) NOT NULL,
            \`billing_address1\` varchar(255) NOT NULL,
            \`billing_address2\` varchar(255) DEFAULT '',
            \`billing_city\` varchar(100) NOT NULL,
            \`billing_state\` varchar(50) NOT NULL,
            \`billing_zip\` varchar(20) NOT NULL,
            \`billing_country\` varchar(100) NOT NULL DEFAULT 'United States',
            \`billing_phone\` varchar(20) DEFAULT '',
            \`billing_email\` varchar(100) NOT NULL,
            \`shipping_first_name\` varchar(100) NOT NULL,
            \`shipping_last_name\` varchar(100) NOT NULL,
            \`shipping_address1\` varchar(255) NOT NULL,
            \`shipping_address2\` varchar(255) DEFAULT '',
            \`shipping_city\` varchar(100) NOT NULL,
            \`shipping_state\` varchar(50) NOT NULL,
            \`shipping_zip\` varchar(20) NOT NULL,
            \`shipping_country\` varchar(100) NOT NULL DEFAULT 'United States',
            \`shipping_method\` varchar(100) DEFAULT 'Standard Shipping',
            \`shipping_cost\` decimal(10,2) DEFAULT 0.00,
            \`tax\` decimal(10,2) DEFAULT 0.00,
            \`discount\` decimal(10,2) DEFAULT 0.00,
            \`subtotal\` decimal(10,2) DEFAULT 0.00,
            \`total\` decimal(10,2) NOT NULL,
            \`coupon_code\` varchar(50) DEFAULT '',
            \`payment_method\` varchar(50) DEFAULT 'Credit Card',
            \`payment_status\` varchar(50) DEFAULT 'pending',
            \`order_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`status\` varchar(50) DEFAULT 'pending',
            \`notes\` text DEFAULT NULL,
            PRIMARY KEY (\`new_order_id\`),
            UNIQUE KEY \`order_number\` (\`order_number\`),
            KEY \`customer_id\` (\`customer_id\`),
            KEY \`order_date\` (\`order_date\`),
            KEY \`status\` (\`status\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await query(createOrdersTable);

        // Create new_order_items table
        const createOrderItemsTable = `
          CREATE TABLE IF NOT EXISTS \`new_order_items\` (
            \`new_order_item_id\` int unsigned NOT NULL AUTO_INCREMENT,
            \`new_order_id\` int unsigned NOT NULL,
            \`product_id\` int unsigned DEFAULT NULL,
            \`product_name\` varchar(255) NOT NULL,
            \`part_number\` varchar(100) NOT NULL,
            \`quantity\` int unsigned NOT NULL DEFAULT 1,
            \`price\` decimal(10,2) NOT NULL,
            \`color\` varchar(50) DEFAULT '',
            \`platform\` varchar(100) DEFAULT '',
            \`year_range\` varchar(50) DEFAULT '',
            \`image\` varchar(255) DEFAULT '',
            PRIMARY KEY (\`new_order_item_id\`),
            KEY \`new_order_id\` (\`new_order_id\`),
            KEY \`product_id\` (\`product_id\`),
            CONSTRAINT \`new_order_items_ibfk_1\` FOREIGN KEY (\`new_order_id\`) REFERENCES \`new_orders\` (\`new_order_id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        await query(createOrderItemsTable);

        console.log("Order tables created successfully");
      } else {
        // Some other error occurred, log it
        console.error("Error checking for new_orders table:", error);
      }
    }
  } catch (error) {
    console.error("Error ensuring order tables exist:", error);
    // Don't throw - tables might already exist with different structure
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
