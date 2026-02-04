// lib/email.js - Email sending utilities

import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email, token, firstName) {
  const verificationUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "BMR Suspension"}" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: "Verify your email address",
    html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Verify Your Email</title>
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
					<h1 style="color: #2c3e50; margin-top: 0;">Welcome to BMR Suspension!</h1>
					<p>Hi ${firstName || "there"},</p>
					<p>Thank you for creating an account with us. Please verify your email address by clicking the button below:</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${verificationUrl}"
						   style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
							Verify Email Address
						</a>
					</div>
					<p>Or copy and paste this link into your browser:</p>
					<p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
					<p>This link will expire in 24 hours.</p>
					<p>If you didn't create an account with us, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="font-size: 12px; color: #666;">
						BMR Suspension - Performance Racing Suspension & Chassis Parts<br>
						This is an automated message, please do not reply.
					</p>
				</div>
			</body>
			</html>
		`,
    text: `
			Welcome to BMR Suspension!

			Hi ${firstName || "there"},

			Thank you for creating an account with us. Please verify your email address by visiting:

			${verificationUrl}

			This link will expire in 24 hours.

			If you didn't create an account with us, please ignore this email.

			---
			BMR Suspension - Performance Racing Suspension & Chassis Parts
		`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, token, firstName) {
  const resetUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "BMR Suspension"}" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: "Reset your password",
    html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Reset Your Password</title>
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
					<h1 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h1>
					<p>Hi ${firstName || "there"},</p>
					<p>We received a request to reset your password. Click the button below to create a new password:</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}"
						   style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
							Reset Password
						</a>
					</div>
					<p>Or copy and paste this link into your browser:</p>
					<p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
					<p>This link will expire in 1 hour.</p>
					<p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="font-size: 12px; color: #666;">
						BMR Suspension - Performance Racing Suspension & Chassis Parts<br>
						This is an automated message, please do not reply.
					</p>
				</div>
			</body>
			</html>
		`,
    text: `
			Password Reset Request

			Hi ${firstName || "there"},

			We received a request to reset your password. Visit this link to create a new password:

			${resetUrl}

			This link will expire in 1 hour.

			If you didn't request a password reset, please ignore this email.

			---
			BMR Suspension - Performance Racing Suspension & Chassis Parts
		`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send newsletter sign-up confirmation email
 */
export async function sendNewsletterConfirmationEmail(email) {
  const siteName = process.env.SMTP_FROM_NAME || "BMR Suspension";

  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "You're subscribed – thanks for signing up!",
    html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>You're Subscribed</title>
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
					<h1 style="color: #2c3e50; margin-top: 0;">You're on the list!</h1>
					<p>Thanks for signing up for our emails. You'll get first dibs on:</p>
					<ul style="color: #555;">
						<li>New arrivals and product drops</li>
						<li>Sales and exclusive offers</li>
						<li>Events and news</li>
					</ul>
					<p>We'll only send you stuff we think you'll want to see – no spam.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="font-size: 12px; color: #666;">
						${siteName}<br>
						This is an automated message. If you didn't sign up, you can safely ignore this email.
					</p>
				</div>
			</body>
			</html>
		`,
    text: `
You're on the list!

Thanks for signing up for our emails. You'll get first dibs on new arrivals, sales, exclusive content, events and more. We'll only send you what we think you'll want – no spam.

—
${siteName}
This is an automated message. If you didn't sign up, you can safely ignore this email.
		`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending newsletter confirmation email:", error);
    return { success: false, error: error.message };
  }
}
