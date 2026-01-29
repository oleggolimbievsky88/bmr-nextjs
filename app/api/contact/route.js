import nodemailer from 'nodemailer'

const CONTACT_TO = process.env.CONTACT_EMAIL || 'sales@bmrsuspension.com'

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
})

export async function POST(req) {
	const { name, email, message } = await req.json()

	if (!name?.trim() || !email?.trim() || !message?.trim()) {
		return new Response(
			JSON.stringify({ error: 'Name, email, and message are required' }),
			{ status: 400 }
		)
	}

	try {
		await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: CONTACT_TO,
			subject: `BMR Suspension Contact: ${name}`,
			text: `From: ${name} <${email}>\n\n${message}`,
			replyTo: email,
		})
		return new Response(JSON.stringify({ ok: true }), { status: 200 })
	} catch (err) {
		return new Response(
			JSON.stringify({ error: 'Failed to send message' }),
			{ status: 500 }
		)
	}
}
