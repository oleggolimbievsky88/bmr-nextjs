/**
 * Shared order confirmation email template.
 * Matches the order confirmation page design with BMR-Logo.jpg at top (JPG for email client compatibility).
 * Subject: "BMR Suspension - Order Confirmation Receipt - {orderNumber}"
 */

export const ORDER_CONFIRMATION_SUBJECT = (orderNumber) =>
  `BMR Suspension - Order Confirmation Receipt - ${orderNumber}`;

export function generateOrderConfirmationHTML(orderData) {
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
    if (!colorName || typeof colorName !== "string") return "color-default";
    const color = colorName.toLowerCase();
    if (
      color.includes("black") ||
      color.includes("hammertone") ||
      color.includes("dark")
    ) {
      return "color-black";
    }
    if (color.includes("red")) return "color-red";
    return "color-default";
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

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "https://bmrsuspension.com";
  const siteOrigin = /^https?:/.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
  const base = siteOrigin.replace(/\/$/, "");
  // Use JPG for logo: better support in email clients (many block or don't display WebP)
  const logoUrl = `${base}/images/logo/BMR-Logo.jpg`;

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
          background-color: #fafafa;
        }
        .email-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 16px;
          background-color: #fafafa;
        }
        .email-container {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }
        .receipt-header {
          background: #ffffff;
          padding: 2rem 1.5rem;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
        }
        .receipt-header img {
          max-width: 320px;
          width: 100%;
          height: auto;
          object-fit: contain;
          margin: 0 auto 1.5rem;
          display: block;
        }
        .success-strip {
          text-align: center;
          padding: 1.5rem 24px;
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
          table-layout: fixed;
        }
        .items-table col.product-col { width: 32%; min-width: 180px; }
        .items-table col.part-col { width: 12%; }
        .items-table col.color-col { width: 14%; }
        .items-table col.qty-col { width: 10%; }
        .items-table col.price-col { width: 14%; }
        .items-table col.total-col { width: 18%; }
        .items-table thead { background: #f8f9fa; }
        .items-table th {
          color: #475569;
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #dc3545;
        }
        .items-table th.text-end { text-align: right; }
        .items-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          vertical-align: middle;
        }
        .items-table td.product-cell {
          word-wrap: break-word;
          min-width: 0;
        }
        .items-table td.text-end { text-align: right; }
        .product-info { display: flex; align-items: center; }
        .product-image {
          width: 48px;
          min-width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 12px;
        }
        .product-details {
          min-width: 0;
          flex: 1;
        }
        .product-details h6 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          word-wrap: break-word;
          white-space: normal;
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
          padding: 2px 6px;
          margin-top: 2px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 10px;
          display: inline-block;
        }
        .color-badge.color-black { background: #1a1a1a !important; color: #fff !important; }
        .color-badge.color-red { background: #dc3545 !important; color: #fff !important; }
        .color-badge.color-default { background: #6c757d !important; color: #fff !important; }
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
          background: #fff5f5;
          border: 1px solid #dc3545;
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
          <div class="receipt-header">
            <img src="${logoUrl}" alt="BMR Suspension" width="320" height="137" style="display:block; max-width:320px; height:auto; border:0; outline:none; text-decoration:none;" />
          </div>

          <div class="success-strip">
            <div class="success-icon">✓</div>
            <h1 class="success-title">Order Confirmed!</h1>
            <p class="success-message">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

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
                      <span>${
                        orderData.paymentMethod === "PayPal" &&
                        orderData.paypalEmail
                          ? "🅿️"
                          : "💳"
                      }</span>
                      <span>${
                        orderData.paymentMethod === "PayPal" &&
                        orderData.paypalEmail
                          ? `PayPal (${orderData.paypalEmail})`
                          : `${orderData.cardType || "Card"} ending in ${
                              orderData.cardLastFour || "••••"
                            }`
                      }</span>
                    </div>
                    <div>
                      <span>🚚</span>
                      <span>${
                        (orderData.freeShipping ||
                          parseFloat(orderData.shippingCost || 0) === 0) &&
                        orderData.couponCode
                          ? `Standard Free Shipping (from coupon: ${orderData.couponCode})`
                          : orderData.freeShipping ||
                            parseFloat(orderData.shippingCost || 0) === 0
                          ? "Standard Free Shipping"
                          : orderData.shippingMethod || "—"
                      }${
    orderData.freeShipping || parseFloat(orderData.shippingCost || 0) === 0
      ? ""
      : ` — $${parseFloat(orderData.shippingCost || 0).toFixed(2)}`
  }</span>
                    </div>
                    ${
                      orderData.couponCode
                        ? `<div><span>🏷️</span><span>Coupon: ${orderData.couponCode}</span></div>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 style="margin: 0;">Order Items</h3>
            </div>
            <div class="card-body" style="padding: 0;">
              <table class="items-table">
                <colgroup>
                  <col class="product-col" />
                  <col class="part-col" />
                  <col class="color-col" />
                  <col class="qty-col" />
                  <col class="price-col" />
                  <col class="total-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th style="width:32%; min-width:200px;">Product</th>
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
                      <td class="product-cell">
                        <div class="product-info">
                          ${
                            item.image
                              ? `<img src="${item.image}" alt="${item.name}" class="product-image" />`
                              : ""
                          }
                          <div class="product-details">
                            <h6>${item.name}</h6>
                            <small>${item.platform || ""} (${
                        item.yearRange || ""
                      })</small>
                          </div>
                        </div>
                      </td>
                      <td><code class="part-number">${
                        item.partNumber
                      }</code></td>
                      <td>
                        <span class="color-badge ${getEmailColorClass(
                          item.color
                        )}">${
                        item.color != null && String(item.color).trim() !== ""
                          ? item.color
                          : "—"
                      }</span>
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
                    <span>${
                      orderData.isDealer
                        ? "Dealer:"
                        : `Discount (${orderData.couponCode || "Coupon"}):`
                    }</span>
                    <span>-$${parseFloat(orderData.discount).toFixed(2)}</span>
                  </div>
                `
                    : ""
                }
                <div class="total-row">
                  <span>Shipping${
                    orderData.freeShipping ||
                    parseFloat(orderData.shippingCost || 0) === 0
                      ? orderData.couponCode
                        ? ` (Standard Free Shipping, from coupon: ${orderData.couponCode})`
                        : " (Standard Free Shipping)"
                      : ""
                  }:</span>
                  <span>$${
                    orderData.freeShipping ||
                    parseFloat(orderData.shippingCost || 0) === 0
                      ? "0.00"
                      : parseFloat(orderData.shippingCost || 0).toFixed(2)
                  }</span>
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

          <div class="action-buttons">
            <a href="${base}" class="btn btn-primary">Continue Shopping</a>
            <a href="${base}/contact" class="btn btn-outline">Contact Us</a>
          </div>

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
