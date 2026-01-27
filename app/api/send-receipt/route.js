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

  // Get base URL for images and links (ensure https for email clients)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "https://bmrsuspension.com"
  const siteOrigin = /^https?:/.test(baseUrl)
    ? baseUrl
    : `https://${baseUrl}`
  const base = siteOrigin.replace(/\/$/, "")
  const logoUrl = `${base}/images/logo/logo-white.png`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation Receipt - BMR Suspension</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #2d3748;
          margin: 0;
          padding: 0;
          background-color: #edf2f7;
        }
        .email-wrapper {
          max-width: 620px;
          margin: 0 auto;
          padding: 24px 16px;
          background-color: #edf2f7;
        }
        .email-container {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .brand-header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 32px 24px;
          text-align: center;
          border-bottom: 4px solid #dc3545;
        }
        .brand-header img {
          max-width: 220px;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        .brand-tagline {
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 12px;
          font-weight: 600;
        }
        .success-strip {
          text-align: center;
          padding: 28px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }
        .success-icon {
          width: 56px;
          height: 56px;
          background: #198754;
          border-radius: 50%;
          color: #fff;
          font-size: 28px;
          line-height: 56px;
          margin: 0 auto 16px;
          font-weight: bold;
        }
        .success-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #1a1a1a;
        }
        .success-message {
          font-size: 15px;
          color: #64748b;
          margin: 0;
        }
        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin: 20px 24px;
          overflow: hidden;
        }
        .card-header {
          background: #f8fafc;
          padding: 18px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .card-header h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .card-header small {
          color: #64748b;
          font-size: 13px;
        }
        .card-body { padding: 20px; }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .info-item h5 {
          margin: 0 0 10px 0;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-item address, .payment-info {
          margin: 0;
          font-style: normal;
          font-size: 14px;
          color: #334155;
          line-height: 1.7;
        }
        .payment-info div { margin-bottom: 6px; }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }
        .items-table thead { background: #f8fafc; }
        .items-table th {
          color: #475569;
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        .items-table th.text-end { text-align: right; }
        .items-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          vertical-align: middle;
        }
        .items-table td.text-end { text-align: right; }
        .product-info { display: flex; align-items: center; }
        .product-image {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 12px;
        }
        .product-details h6 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .product-details small { color: #64748b; font-size: 12px; }
        .part-number {
          background: #f1f5f9;
          color: #1a1a1a;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          font-family: ui-monospace, monospace;
        }
        .color-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 11px;
          display: inline-block;
        }
        .color-badge.color-black { background: #1a1a1a !important; color: #fff !important; }
        .color-badge.color-red { background: #dc3545 !important; color: #fff !important; }
        .color-badge.color-default { background: #64748b !important; color: #fff !important; }
        .order-totals { text-align: right; max-width: 280px; margin-left: auto; }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #475569;
        }
        .total-row.final {
          font-weight: 700;
          font-size: 18px;
          color: #1a1a1a;
          border-top: 2px solid #e2e8f0;
          padding-top: 14px;
          margin-top: 12px;
        }
        .total-row.text-success { color: #198754; }
        .order-notes {
          background: #fffbeb;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #dc3545;
          white-space: pre-wrap;
          margin: 0;
          color: #334155;
          font-size: 14px;
        }
        .alert {
          padding: 16px 20px;
          border-radius: 8px;
          margin: 0;
        }
        .alert-info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0c4a6e;
        }
        .alert p { margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; }
        .alert p:last-child { margin-bottom: 0; }
        .alert a { color: #dc3545; font-weight: 600; text-decoration: none; }
        .action-buttons {
          text-align: center;
          padding: 28px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        .btn {
          display: inline-block;
          padding: 12px 28px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          margin: 4px 8px;
        }
        .btn-primary {
          background: #dc3545;
          color: #ffffff !important;
          border: 2px solid #dc3545;
        }
        .btn-outline {
          background: #ffffff;
          color: #1a1a1a !important;
          border: 2px solid #cbd5e1;
        }
        .footer {
          text-align: center;
          padding: 20px 24px;
          background: #1a1a1a;
          color: rgba(255,255,255,0.8);
          font-size: 12px;
        }
        .footer p { margin: 0 0 4px 0; }
        @media (max-width: 600px) {
          .email-wrapper { padding: 16px 12px; }
          .card { margin: 16px 16px; }
          .info-grid { grid-template-columns: 1fr; }
          .items-table th, .items-table td { padding: 10px 8px; font-size: 12px; }
          .success-title { font-size: 20px; }
          .btn { display: block; width: 100%; margin: 8px 0; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <!-- Brand Header with BMR Logo -->
          <div class="brand-header">
            <img src="${logoUrl}" alt="BMR Suspension" width="220" />
            <div class="brand-tagline">Order Confirmation</div>
          </div>

          <!-- Success Strip -->
          <div class="success-strip">
            <div class="success-icon">✓</div>
            <h1 class="success-title">Order Confirmed!</h1>
            <p class="success-message">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          <!-- Order Summary Card -->
          <div class="card">
            <div class="card-header">
              <h3>Order #${orderData.orderId}</h3>
              <small>Placed on ${formatDate(new Date())}</small>
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

          <!-- Customer Message -->
          <div class="card">
            <div class="card-body">
              <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">What's Next?</h3>
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
            <a href="${base}" class="btn btn-primary">Continue Shopping</a>
            <a href="${base}/contact" class="btn btn-outline">Contact Us</a>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>© ${new Date().getFullYear()} BMR Suspension. All Rights Reserved.</p>
            <p>1033 Pine Chase Ave, Lakeland, FL 33815</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
