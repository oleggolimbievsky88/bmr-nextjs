// app/api/admin/customers/[customerId]/route.js
// Admin API for customer details (GET) and updating (PATCH)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  updateCustomerAdmin,
  getCustomerProfileByIdAdmin,
} from "@/lib/queries";

/** GET: fetch single customer by ID for edit form */
export async function GET(request, { params }) {
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
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      customer: {
        CustomerID: customer.CustomerID,
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        role: customer.role,
        dealerTier: customer.dealerTier,
        dealerDiscount: customer.dealerDiscount,
        datecreated: customer.createdAt || customer.datecreated,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

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
    const validRoles = ["customer", "admin", "vendor", "dealer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be customer, admin, vendor, or dealer" },
        { status: 400 }
      );
    }

    // Validate tier (0 = non-dealer, 1-8 = dealer tiers)
    if (dealerTier !== null && dealerTier !== undefined) {
      const tier = parseInt(dealerTier);
      if (isNaN(tier) || tier < 0 || tier > 8) {
        return NextResponse.json(
          { error: "Dealer tier must be between 0 and 8 (0 = non-dealer)" },
          { status: 400 }
        );
      }
    }

    // Validate discount (0-100)
    if (dealerDiscount !== null && dealerDiscount !== undefined) {
      const discount = parseFloat(dealerDiscount);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: "Dealer discount must be between 0 and 100" },
          { status: 400 }
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
        { status: 404 }
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
      { status: 500 }
    );
  }
}
