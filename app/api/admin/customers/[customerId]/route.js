// app/api/admin/customers/[customerId]/route.js
// Admin API for updating customer details

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateCustomerAdmin } from "@/lib/queries";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    const body = await request.json();
    const { role, dealerDiscount, dealerTier } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Valid roles
    const validRoles = ["customer", "admin", "vendor"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be customer, admin, or vendor" },
        { status: 400 },
      );
    }

    // Validate tier (0 = non-dealer, 1-8 = dealer tiers)
    if (dealerTier !== null && dealerTier !== undefined) {
      const tier = parseInt(dealerTier);
      if (isNaN(tier) || tier < 0 || tier > 8) {
        return NextResponse.json(
          { error: "Dealer tier must be between 0 and 8 (0 = non-dealer)" },
          { status: 400 },
        );
      }
    }

    // Validate discount (0-100)
    if (dealerDiscount !== null && dealerDiscount !== undefined) {
      const discount = parseFloat(dealerDiscount);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: "Dealer discount must be between 0 and 100" },
          { status: 400 },
        );
      }
    }

    const updated = await updateCustomerAdmin(customerId, {
      role,
      dealerDiscount: dealerDiscount || 0,
      dealerTier: dealerTier || 0,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}
