// app/api/admin/customers/[customerId]/send-password-reset/route.js
// Admin-only: send a password reset email to the given customer

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCustomerProfileByIdAdmin } from "@/lib/queries";
import { createVerificationToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    const id = parseInt(customerId, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await getCustomerProfileByIdAdmin(id);
    if (!customer || !customer.email) {
      return NextResponse.json(
        { error: "Customer not found or has no email" },
        { status: 404 }
      );
    }

    const token = await createVerificationToken(
      customer.CustomerID,
      "password_reset"
    );
    await sendPasswordResetEmail(
      customer.email,
      token,
      customer.firstname || "User"
    );

    return NextResponse.json({
      success: true,
      message:
        "If the customer has an email address, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Admin send password reset error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
