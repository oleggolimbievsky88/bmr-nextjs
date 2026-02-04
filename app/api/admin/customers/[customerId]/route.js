// app/api/admin/customers/[customerId]/route.js
// Admin API for customer details (GET) and updating (PATCH)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  updateCustomerRoleAndTierAdmin,
  updateCustomerProfileAdmin,
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
        phonenumber: customer.phonenumber,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        country: customer.country,
        shippingfirstname: customer.shippingfirstname,
        shippinglastname: customer.shippinglastname,
        shippingaddress1: customer.shippingaddress1,
        shippingaddress2: customer.shippingaddress2,
        shippingcity: customer.shippingcity,
        shippingstate: customer.shippingstate,
        shippingzip: customer.shippingzip,
        shippingcountry: customer.shippingcountry,
        role: customer.role,
        dealerTier: customer.dealerTier,
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
    const {
      role,
      dealerTier,
      firstname,
      lastname,
      email,
      phonenumber,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      shippingfirstname,
      shippinglastname,
      shippingaddress1,
      shippingaddress2,
      shippingcity,
      shippingstate,
      shippingzip,
      shippingcountry,
    } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const validRoles = ["customer", "admin", "vendor", "dealer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be customer, admin, vendor, or dealer" },
        { status: 400 }
      );
    }

    if (dealerTier !== null && dealerTier !== undefined) {
      const tier = parseInt(dealerTier);
      if (isNaN(tier) || tier < 0 || tier > 8) {
        return NextResponse.json(
          { error: "Dealer tier must be between 0 and 8 (0 = non-dealer)" },
          { status: 400 }
        );
      }
    }

    try {
      await updateCustomerProfileAdmin(customerId, {
        firstname,
        lastname,
        email,
        phonenumber,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        shippingfirstname,
        shippinglastname,
        shippingaddress1,
        shippingaddress2,
        shippingcity,
        shippingstate,
        shippingzip,
        shippingcountry,
      });
    } catch (profileError) {
      if (profileError?.code === "EMAIL_EXISTS") {
        return NextResponse.json(
          { error: "That email is already in use by another customer." },
          { status: 400 }
        );
      }
      throw profileError;
    }

    const roleUpdated = await updateCustomerRoleAndTierAdmin(customerId, {
      role,
      dealerTier: dealerTier ?? 0,
    });

    if (!roleUpdated) {
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
      { error: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}
