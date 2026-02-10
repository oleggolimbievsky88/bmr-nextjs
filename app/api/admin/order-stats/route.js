// app/api/admin/order-stats/route.js
// Admin API: order counts for dashboard (e.g. last 7 days)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrdersCountAdmin } from "@/lib/queries";

function pad(n) {
  return String(n).padStart(2, "0");
}

function getLast7DaysRange() {
  const now = new Date();
  const dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 7);
  dateFrom.setHours(0, 0, 0, 0);
  return {
    dateFrom: `${dateFrom.getFullYear()}-${pad(dateFrom.getMonth() + 1)}-${pad(dateFrom.getDate())} 00:00:00`,
    dateTo: `${dateTo.getFullYear()}-${pad(dateTo.getMonth() + 1)}-${pad(dateTo.getDate())} 23:59:59`,
  };
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dateFrom, dateTo } = getLast7DaysRange();

    const [totalOrders, pendingOrders, processedOrders, shippedOrders] = await Promise.all([
      getOrdersCountAdmin(null, null, null, dateFrom, dateTo),
      getOrdersCountAdmin("pending", null, null, dateFrom, dateTo),
      getOrdersCountAdmin("processed", null, null, dateFrom, dateTo),
      getOrdersCountAdmin("shipped", null, null, dateFrom, dateTo),
    ]);

    return NextResponse.json({
      success: true,
      totalOrders,
      pendingOrders,
      processedOrders,
      shippedOrders,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch order stats", detail: error?.message },
      { status: 500 },
    );
  }
}
