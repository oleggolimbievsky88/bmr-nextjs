// app/api/admin/dealer-pos/[poId]/route.js
// GET: PO detail with items (admin)

import { NextResponse } from "next/server";
import { getServerSession } from "next/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getDealerPOWithItems,
  getCustomerProfileByIdAdmin,
  getOrdersByCustomerId,
  getDealerTierByTier,
} from "@/lib/queries";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { poId: poIdParam } = await params;
    const poId = parseInt(poIdParam, 10);
    if (Number.isNaN(poId)) {
      return NextResponse.json({ error: "Invalid PO id" }, { status: 400 });
    }

    const po = await getDealerPOWithItems(poId, null);
    if (!po) {
      return NextResponse.json({ error: "PO not found" }, { status: 404 });
    }

    const customerId = po.customer_id;
    const [dealerProfile, pastOrders] = await Promise.all([
      customerId ? getCustomerProfileByIdAdmin(customerId) : null,
      customerId ? getOrdersByCustomerId(customerId, 10) : [],
    ]);
    const tierInfo =
      dealerProfile?.dealerTier != null
        ? await getDealerTierByTier(dealerProfile.dealerTier)
        : null;

    return NextResponse.json({
      success: true,
      po: {
        id: po.id,
        customer_id: po.customer_id,
        status: po.status,
        notes: po.notes,
        admin_notes: po.admin_notes,
        created_at: po.created_at,
        sent_at: po.sent_at,
        po_number: po.po_number,
        firstname: po.firstname,
        lastname: po.lastname,
        email: po.email,
      },
      dealer: dealerProfile
        ? {
            CustomerID: dealerProfile.CustomerID,
            firstname: dealerProfile.firstname,
            lastname: dealerProfile.lastname,
            email: dealerProfile.email,
            phonenumber: dealerProfile.phonenumber,
            role: dealerProfile.role,
            dealerTier: dealerProfile.dealerTier,
            dealerDiscount: dealerProfile.dealerDiscount,
            address1: dealerProfile.address1,
            address2: dealerProfile.address2,
            city: dealerProfile.city,
            state: dealerProfile.state,
            zip: dealerProfile.zip,
            country: dealerProfile.country,
            shippingfirstname: dealerProfile.shippingfirstname,
            shippinglastname: dealerProfile.shippinglastname,
            shippingaddress1: dealerProfile.shippingaddress1,
            shippingaddress2: dealerProfile.shippingaddress2,
            shippingcity: dealerProfile.shippingcity,
            shippingstate: dealerProfile.shippingstate,
            shippingzip: dealerProfile.shippingzip,
            shippingcountry: dealerProfile.shippingcountry,
          }
        : null,
      tierDiscount: tierInfo?.discount_percent ?? null,
      pastOrders: pastOrders || [],
      items: po.items || [],
    });
  } catch (error) {
    console.error("Error fetching dealer PO:", error);
    return NextResponse.json({ error: "Failed to load PO" }, { status: 500 });
  }
}
