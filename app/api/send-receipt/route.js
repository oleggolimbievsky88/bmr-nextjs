import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  generateOrderConfirmationHTML,
  ORDER_CONFIRMATION_SUBJECT,
} from "@/lib/order-confirmation-email";
import { getOrderById } from "@/lib/queries";
import { getGiftCardsForOrder } from "@/lib/giftCards";

export async function POST(request) {
  try {
    let { email, orderId, orderData } = await request.json();

    if (!email || !orderId || !orderData) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Re-fetch gift cards from DB when missing - client state may be stale after refresh
    const hasGiftCertItems =
      orderData.items?.some(
        (i) =>
          /gift\s*certificate/i.test(i.name || "") ||
          /^gc\d+/i.test(i.partNumber || ""),
      ) ?? false;
    const hasGiftCards =
      Array.isArray(orderData.giftCards) && orderData.giftCards.length > 0;
    if (hasGiftCertItems && !hasGiftCards && process.env.MYSQL_HOST) {
      try {
        const order = await getOrderById(orderId);
        if (order) {
          const orderIdNum = order.new_order_id ?? order.newOrderId;
          const giftCards = await getGiftCardsForOrder(orderIdNum).catch(
            () => [],
          );
          if (giftCards && giftCards.length > 0) {
            orderData = { ...orderData, giftCards };
          }
        }
      } catch (e) {
        console.warn("Could not re-fetch gift cards:", e?.message);
      }
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
        { status: 500 },
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
        { status: 500 },
      );
    }

    const htmlContent = generateOrderConfirmationHTML(orderData);
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "noreply@bmrsuspension.com",
      to: email,
      subject: ORDER_CONFIRMATION_SUBJECT(orderId),
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
      { status: 500 },
    );
  }
}
