import nodemailer from "nodemailer";
import { getBrandConfig } from "@/lib/brandConfig";

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
  const { name, email, message, departmentEmail } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(
      JSON.stringify({ error: "Name, email, and message are required" }),
      { status: 400 },
    );
  }

  try {
    const brand = await getBrandConfig().catch(() => null);
    const companyName =
      brand?.companyName || brand?.name || brand?.companyNameShort || "BMR";
    const brandEmail = brand?.contact?.email || CONTACT_TO;
    const departments = Array.isArray(brand?.contact?.departments)
      ? brand.contact.departments
      : [];
    const requested = String(departmentEmail || "")
      .trim()
      .toLowerCase();
    const deptMatch = requested
      ? departments.find(
          (d) =>
            String(d?.email || "")
              .trim()
              .toLowerCase() === requested,
        )
      : null;
    const to = deptMatch?.email || brandEmail || CONTACT_TO;

    const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || companyName}" <${fromAddr}>`,
      to,
      replyTo: email,
      subject: `${companyName} Contact: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
				<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
				${
          deptMatch?.label
            ? `<p><strong>Department:</strong> ${deptMatch.label}</p>`
            : ""
        }
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
