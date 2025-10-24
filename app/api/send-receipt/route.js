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

    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate HTML email content
    const htmlContent = generateReceiptHTML(orderData);

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@bmrsuspension.com",
      to: email,
      subject: `Order Confirmation Receipt - ${orderId}`,
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Receipt sent successfully" });
  } catch (error) {
    console.error("Error sending receipt:", error);
    return NextResponse.json(
      { message: "Failed to send receipt" },
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
    const tax = 0;
    const discount = parseFloat(orderData.discount || 0);
    return subtotal + shipping + tax - discount;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #dc3545;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
        }
        .order-number {
          font-size: 18px;
          color: #dc3545;
          font-weight: bold;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #dc3545;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
        }
        .info-item h4 {
          margin: 0 0 10px 0;
          color: #000;
          font-size: 14px;
        }
        .info-item p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th {
          background: #f8f9fa;
          color: #000;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #dc3545;
          font-size: 14px;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .part-number {
          background: none;
          color: #000;
          padding: 0;
          border-radius: 0;
          font-size: 12px;
          font-weight: bold;
        }
        .color-badge {
          padding: 4px 8px;
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
        .totals {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .total-row.final {
          font-weight: bold;
          font-size: 16px;
          color: #000;
          border-top: 2px solid #dc3545;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 12px;
        }
        .contact-info {
          background: #fff5f5;
          border: 1px solid #dc3545;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }
        .contact-info h4 {
          color: #dc3545;
          margin: 0 0 10px 0;
        }
        .contact-info p {
          margin: 5px 0;
          font-size: 13px;
        }
        .contact-info a {
          color: #dc3545;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .items-table {
            font-size: 12px;
          }
          .items-table th,
          .items-table td {
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">BMR SUSPENSION</div>
          <div class="order-number">Order #${orderData.orderId}</div>
          <div style="color: #666; font-size: 14px;">
            Placed on ${formatDate(new Date())}
          </div>
        </div>

        <div class="section">
          <div class="info-grid">
            <div class="info-item">
              <h4>Billing Information</h4>
              <p>
                ${orderData.billing.firstName} ${orderData.billing.lastName}<br>
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
              </p>
            </div>
            <div class="info-item">
              <h4>Shipping Information</h4>
              <p>
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
              </p>
            </div>
            <div class="info-item">
              <h4>Payment Information</h4>
              <p>
                Card ending in ${orderData.cardLastFour}<br>
                ${orderData.shippingMethod}
                ${
                  orderData.couponCode
                    ? "<br>Coupon: " + orderData.couponCode
                    : ""
                }
              </p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Part Number</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items
                .map(
                  (item) => `
                <tr>
                  <td>
                    ${
                      item.image
                        ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px; vertical-align: middle;">`
                        : ""
                    }
                    <strong>${item.name}</strong><br>
                    <small style="color: #666;">${item.platform} (${
                    item.yearRange
                  })</small>
                  </td>
                  <td><span class="part-number">${item.partNumber}</span></td>
                  <td><span class="color-badge ${getEmailColorClass(
                    item.color
                  )}">${item.color}</span></td>
                  <td>${item.quantity}</td>
                  <td>$${parseFloat(item.price).toFixed(2)}</td>
                  <td><strong>$${(
                    parseFloat(item.price) * item.quantity
                  ).toFixed(2)}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${calculateSubtotal().toFixed(2)}</span>
            </div>
            ${
              orderData.discount > 0
                ? `
              <div class="total-row">
                <span>Discount (${orderData.couponCode}):</span>
                <span style="color: #dc3545;">-$${parseFloat(
                  orderData.discount
                ).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            ${
              orderData.shippingCost > 0
                ? `
              <div class="total-row">
                <span>Shipping:</span>
                <span>$${parseFloat(orderData.shippingCost).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            ${
              orderData.tax > 0
                ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>$${parseFloat(orderData.tax).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div class="total-row final">
              <span>Total:</span>
              <span style="color: #dc3545;">$${
                orderData.total
                  ? orderData.total.toFixed(2)
                  : calculateTotal().toFixed(2)
              }</span>
            </div>
          </div>
        </div>

        <div class="contact-info">
          <h4>What's Next?</h4>
          <p><strong>Thank you for your purchase!</strong> We have received your order and will work on shipping it out as soon as possible. Once your order is processed through our system, you will receive tracking information.</p>
          <p><strong>Important:</strong> We will not charge your card until your part(s) are ready to ship out. All orders are manually entered to ensure all information is correct before shipment.</p>
          <p>If you have any questions or would like to change any part of your order, please contact us:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:WebSales@bmrsuspension.com">WebSales@bmrsuspension.com</a><br>
            <strong>Phone:</strong> <a href="tel:+18139869302">(813) 986-9302</a><br>
            <strong>Hours:</strong> 8:30 AM - 5:00 PM Eastern, Monday through Friday
          </p>
          <p><strong>Thank you for continuing to support American manufacturing!</strong></p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} BMR Suspension. All Rights Reserved.</p>
          <p>1033 Pine Chase Ave, Lakeland, FL 33815</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
