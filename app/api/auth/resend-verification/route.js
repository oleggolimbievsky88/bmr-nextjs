// app/api/auth/resend-verification/route.js
// Resend email verification link for unverified accounts

import { NextResponse } from "next/server";
import { getUserByEmail, createVerificationToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (user && !user.emailVerified) {
      // Invalidate previous email_verification tokens for this user
      await pool.query(
        "DELETE FROM verification_tokens WHERE customerId = ? AND type = ?",
        [user.CustomerID, "email_verification"],
      );

      const token = await createVerificationToken(
        user.CustomerID,
        "email_verification",
      );
      await sendVerificationEmail(email, token, user.firstname || "User");
    }

    // Same response whether or not we sent (prevent email enumeration)
    return NextResponse.json({
      message:
        "If an account with that email exists and hasn't been verified, " +
        "we've sent a new verification link. Check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 },
    );
  }
}
