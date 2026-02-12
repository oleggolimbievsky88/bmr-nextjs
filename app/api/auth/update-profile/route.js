// app/api/auth/update-profile/route.js
// Update user profile

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const customerId = parseInt(session.user.id);

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (body.firstname !== undefined) {
      updates.push("firstname = ?");
      values.push(body.firstname);
    }

    if (body.lastname !== undefined) {
      updates.push("lastname = ?");
      values.push(body.lastname);
    }

    if (body.email !== undefined) {
      // Check if email is already taken by another user
      const [existing] = await pool.query(
        "SELECT CustomerID FROM customers WHERE email = ? AND CustomerID != ?",
        [body.email, customerId],
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 409 },
        );
      }

      // Only reset emailVerified when the email actually changed
      const [current] = await pool.query(
        "SELECT email FROM customers WHERE CustomerID = ? LIMIT 1",
        [customerId],
      );
      const currentEmail = current[0]?.email?.trim().toLowerCase();
      const newEmail = String(body.email).trim().toLowerCase();
      const emailChanged = currentEmail !== newEmail;

      updates.push("email = ?");
      values.push(body.email);
      if (emailChanged) {
        updates.push("emailVerified = NULL");
      }
    }

    if (body.password !== undefined && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 },
        );
      }
      const hashedPassword = await hashPassword(body.password);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    // Update address fields
    const addressFields = [
      "address1",
      "address2",
      "city",
      "state",
      "zip",
      "country",
      "phonenumber",
      "shippingfirstname",
      "shippinglastname",
      "shippingaddress1",
      "shippingaddress2",
      "shippingcity",
      "shippingstate",
      "shippingzip",
      "shippingcountry",
    ];

    addressFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field] || "");
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(customerId);

    const query = `UPDATE customers SET ${updates.join(", ")} WHERE CustomerID = ?`;

    await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
