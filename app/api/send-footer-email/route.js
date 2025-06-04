import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, message } = await req.json();

  // Configure your SMTP transport here
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL, // your receiving email
      subject: "Footer Contact Form",
      text: `From: ${email}\n\n${message}`,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to send" }), {
      status: 500,
    });
  }
}
