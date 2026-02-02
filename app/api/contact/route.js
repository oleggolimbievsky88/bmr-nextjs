import nodemailer from "nodemailer";

const CONTACT_TO = process.env.CONTACT_EMAIL || "sales@bmrsuspension.com";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req) {
  const { name, email, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(
      JSON.stringify({ error: "Name, email, and message are required" }),
      { status: 400 }
    );
  }

  try {
    const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "BMR Suspension"}" <${fromAddr}>`,
      to: CONTACT_TO,
      replyTo: email,
      subject: `BMR Suspension Contact: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
				<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
				<p><strong>Message:</strong></p>
				<p>${message.replace(/\n/g, "<br>")}</p>
			`,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Contact form send error:", err);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
    });
  }
}
