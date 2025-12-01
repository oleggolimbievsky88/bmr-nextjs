import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Test email content
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "BMR Suspension - Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">BMR Suspension Email Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p>If you received this email, your SMTP settings are configured properly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            BMR Suspension - Performance Racing Suspension & Chassis Parts
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: "Test email sent successfully!",
    });
  } catch (error) {
    console.error("Email test error:", error);
    return Response.json(
      {
        error: "Failed to send test email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
