import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, orderId, orderData } = await request.json();

    if (!email || !orderId || !orderData) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate SMTP configuration
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error("SMTP configuration missing:", {
        hasHost: !!process.env.SMTP_HOST,
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
      });
      return NextResponse.json(
        {
          message:
            "Email service not configured. Please set SMTP environment variables.",
          error: "SMTP configuration missing",
        },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      return NextResponse.json(
        {
          message:
            "Email service configuration error. Please check your SMTP settings.",
          error: verifyError.message,
        },
        { status: 500 }
      );
    }

    // Generate HTML email content
    const htmlContent = generateReceiptHTML(orderData);

    // Email options
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "noreply@bmrsuspension.com",
      to: email,
      subject: `BMR Suspension - Order Confirmation Receipt - ${orderId}`,
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Receipt email sent successfully:", {
      messageId: info.messageId,
      to: email,
      orderId: orderId,
    });

    return NextResponse.json({
      message: "Receipt sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending receipt:", {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });
    return NextResponse.json(
      {
        message: "Failed to send receipt",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function generateReceiptHTML(orderData) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmailColorClass = (colorName) => {
    if (!colorName) return "color-default";

    const color = colorName.toLowerCase();
    if (color.includes("black") || color.includes("dark")) {
      return "color-black";
    } else if (color.includes("red")) {
      return "color-red";
    } else {
      return "color-default";
    }
  };

  const calculateSubtotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = parseFloat(orderData.shippingCost || 0);
    const tax = parseFloat(orderData.tax || 0);
    const discount = parseFloat(orderData.discount || 0);
    return subtotal + shipping + tax - discount;
  };

  // Get base URL for images
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "https://bmrsuspension.com";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation Receipt</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .email-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .success-header {
          text-align: center;
          padding: 40px 20px 30px;
          background: white;
        }
        .success-icon {
          font-size: 64px;
          color: #28a745;
          margin-bottom: 20px;
        }
        .success-title {
          font-size: 36px;
          font-weight: 300;
          margin: 0 0 15px 0;
          color: #000;
        }
        .success-message {
          font-size: 18px;
          color: #666;
          margin: 0;
        }
        .card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .card-header {
          background: #f8f9fa;
          padding: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        .card-header h3 {
          margin: 0 0 5px 0;
          font-size: 20px;
          font-weight: 600;
          color: #000;
        }
        .card-header small {
          color: #666;
          font-size: 14px;
        }
        .card-body {
          padding: 20px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 0;
        }
        .info-item h5 {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 600;
          color: #000;
        }
        .info-item address {
          margin: 0;
          font-style: normal;
          font-size: 14px;
          color: #333;
          line-height: 1.8;
        }
        .payment-info {
          font-size: 14px;
          color: #333;
        }
        .payment-info div {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .payment-info i {
          margin-right: 8px;
          color: #666;
          width: 20px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }
        .items-table thead {
          background: #f8f9fa;
        }
        .items-table th {
          color: #000;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid #dee2e6;
        }
        .items-table th.text-end {
          text-align: right;
        }
        .items-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #dee2e6;
          font-size: 14px;
          vertical-align: middle;
        }
        .items-table td.text-end {
          text-align: right;
        }
        .product-info {
          display: flex;
          align-items: center;
        }
        .product-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 12px;
        }
        .product-details h6 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #000;
        }
        .product-details small {
          color: #666;
          font-size: 12px;
        }
        .part-number {
          background: none;
          color: #000;
          padding: 0;
          font-size: 13px;
          font-weight: 600;
          font-family: monospace;
        }
        .color-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 12px;
          display: inline-block;
        }
        .color-badge.color-black {
          background: #000 !important;
          color: white !important;
        }
        .color-badge.color-red {
          background: #dc3545 !important;
          color: white !important;
        }
        .color-badge.color-default {
          background: #6c757d !important;
          color: white !important;
        }
        .order-totals {
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .total-row.final {
          font-weight: bold;
          font-size: 18px;
          color: #000;
          border-top: 2px solid #dee2e6;
          padding-top: 15px;
          margin-top: 15px;
        }
        .total-row.text-success {
          color: #28a745;
        }
        .order-notes {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #dc3545;
          white-space: pre-wrap;
          margin: 0;
          color: #333;
          font-size: 14px;
        }
        .alert {
          padding: 15px 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        .alert-info {
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          color: #0c5460;
        }
        .alert p {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        .alert p:last-child {
          margin-bottom: 0;
        }
        .alert strong {
          font-weight: 600;
        }
        .alert a {
          color: #cc0000;
          text-decoration: none;
        }
        .alert a:hover {
          text-decoration: underline;
        }
        .action-buttons {
          text-align: center;
          padding: 30px 20px;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 4px;
          margin: 0 10px 10px;
          transition: all 0.3s;
        }
        .btn-primary {
          background: #cc0000;
          color: white;
          border: 1px solid #cc0000;
        }
        .btn-primary:hover {
          background: #990000;
          border-color: #990000;
        }
        .btn-outline-primary {
          background: transparent;
          color: #cc0000;
          border: 1px solid #cc0000;
        }
        .btn-outline-primary:hover {
          background: #cc0000;
          color: white;
        }
        .footer {
          text-align: center;
          padding: 30px 20px;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
          color: #666;
          font-size: 12px;
        }
        @media (max-width: 768px) {
          .email-wrapper {
            padding: 10px;
          }
          .info-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .items-table {
            font-size: 12px;
          }
          .items-table th,
          .items-table td {
            padding: 8px 4px;
          }
          .success-title {
            font-size: 28px;
          }
          .btn {
            display: block;
            width: 100%;
            margin: 5px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <!-- Success Header -->
          <div class="success-header">
            <div class="success-icon">✓</div>
            <h1 class="success-title">Order Confirmed!</h1>
            <p class="success-message">
              Thank you for your purchase! Your order has been successfully placed.
            </p>
          </div>

          <!-- Order Summary Card -->
          <div class="card">
            <div class="card-header">
              <h3>📄 Order #${orderData.orderId}</h3>
              <small>
                Placed on ${formatDate(new Date())}
              </small>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <h5>Billing Information</h5>
                  <address>
                    ${orderData.billing.firstName} ${
    orderData.billing.lastName
  }<br>
                    ${orderData.billing.address1}<br>
                    ${
                      orderData.billing.address2
                        ? orderData.billing.address2 + "<br>"
                        : ""
                    }
                    ${orderData.billing.city}, ${orderData.billing.state} ${
    orderData.billing.zip
  }<br>
                    ${orderData.billing.country}
                  </address>
                </div>
                <div class="info-item">
                  <h5>Shipping Information</h5>
                  <address>
                    ${orderData.shipping.firstName} ${
    orderData.shipping.lastName
  }<br>
                    ${orderData.shipping.address1}<br>
                    ${
                      orderData.shipping.address2
                        ? orderData.shipping.address2 + "<br>"
                        : ""
                    }
                    ${orderData.shipping.city}, ${orderData.shipping.state} ${
    orderData.shipping.zip
  }<br>
                    ${orderData.shipping.country}
                  </address>
                </div>
                <div class="info-item">
                  <h5>Payment Information</h5>
                  <div class="payment-info">
                    <div>
                      <span>💳</span>
                      <span>Card ending in ${orderData.cardLastFour}</span>
                    </div>
                    <div>
                      <span>🚚</span>
                      <span>${orderData.shippingMethod}</span>
                    </div>
                    ${
                      orderData.couponCode
                        ? `
                      <div>
                        <span>🏷️</span>
                        <span>Coupon: ${orderData.couponCode}</span>
                      </div>
                    `
                        : ""
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card">
            <div class="card-header">
              <h3 style="margin: 0;">Order Items</h3>
            </div>
            <div class="card-body" style="padding: 0;">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Part Number</th>
                    <th>Color</th>
                    <th>Quantity</th>
                    <th class="text-end">Price</th>
                    <th class="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderData.items
                    .map(
                      (item) => `
                    <tr>
                      <td>
                        <div class="product-info">
                          ${
                            item.image
                              ? `<img src="${item.image}" alt="${item.name}" class="product-image" />`
                              : ""
                          }
                          <div class="product-details">
                            <h6>${item.name}</h6>
                            <small>${item.platform} (${item.yearRange})</small>
                          </div>
                        </div>
                      </td>
                      <td><code class="part-number">${
                        item.partNumber
                      }</code></td>
                      <td>
                        <span class="color-badge ${getEmailColorClass(
                          item.color
                        )}">${item.color || "N/A"}</span>
                      </td>
                      <td>${item.quantity}</td>
                      <td class="text-end">$${parseFloat(item.price).toFixed(
                        2
                      )}</td>
                      <td class="text-end" style="font-weight: bold;">$${(
                        parseFloat(item.price) * item.quantity
                      ).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Order Totals -->
          <div class="card">
            <div class="card-body">
              <div class="order-totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${calculateSubtotal().toFixed(2)}</span>
                </div>
                ${
                  orderData.discount > 0
                    ? `
                  <div class="total-row text-success">
                    <span>Discount (${orderData.couponCode || "Coupon"}):</span>
                    <span>-$${parseFloat(orderData.discount).toFixed(2)}</span>
                  </div>
                `
                    : ""
                }
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>$${parseFloat(orderData.shippingCost || 0).toFixed(
                    2
                  )}</span>
                </div>
                <div class="total-row">
                  <span>Tax:</span>
                  <span>$${parseFloat(orderData.tax || 0).toFixed(2)}</span>
                </div>
                <div class="total-row final">
                  <span>Total:</span>
                  <span>$${
                    orderData.total
                      ? orderData.total.toFixed(2)
                      : calculateTotal().toFixed(2)
                  }</span>
                </div>
              </div>
            </div>
          </div>

          ${
            orderData.notes && orderData.notes.trim()
              ? `
          <!-- Order Notes -->
          <div class="card">
            <div class="card-header">
              <h3 style="margin: 0;">📝 Order Notes</h3>
            </div>
            <div class="card-body">
              <div class="order-notes">${orderData.notes}</div>
            </div>
          </div>
        `
              : ""
          }

          <!-- Email Receipt Section -->
          <div class="card">
            <div class="card-body">
              <h3 style="margin: 0 0 15px 0; font-size: 18px;">✉️ Email Receipt</h3>
              <div class="alert alert-success">
                <p>
                  <strong>Receipt sent automatically!</strong> We've automatically sent a detailed receipt to <strong>${
                    orderData.billing.email
                  }</strong>. If you didn't receive it, check your spam folder.
                </p>
              </div>
            </div>
          </div>

          <!-- Customer Message -->
          <div class="card">
            <div class="card-body">
              <h3 style="margin: 0 0 15px 0; font-size: 18px;">ℹ️ What's Next?</h3>
              <div class="alert alert-info">
                <p>
                  Thank you for your purchase! We have received your order and will work on shipping it out as soon as possible. Once your order is processed through our system, you will receive tracking information. Please note, we will not charge your card until your part(s) are ready to ship out.
                </p>
                <p>
                  All orders are manually entered to ensure all information is correct before shipment.
                </p>
                <p style="margin-bottom: 0;">
                  If you have any questions or would like to change any part of your order, simply send us an email at <a href="mailto:WebSales@bmrsuspension.com">WebSales@bmrsuspension.com</a> or call us at <a href="tel:+18139869302">(813) 986-9302</a> between 8:30 - 5:00 pm Eastern time, Monday through Friday. We thank you for continuing to support American manufacturing!
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <a href="${baseUrl}" class="btn btn-primary">🏠 Continue Shopping</a>
            <a href="${baseUrl}/contact" class="btn btn-outline-primary">✉️ Contact Us</a>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} BMR Suspension. All Rights Reserved.</p>
            <p style="margin: 0;">1033 Pine Chase Ave, Lakeland, FL 33815</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
