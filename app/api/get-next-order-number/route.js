import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Check if database connection is available
    if (!process.env.MYSQL_HOST) {
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    // Get the highest order number from the database
    // Try to extract numeric part from order_number field
    const sql = `
      SELECT order_number
      FROM new_orders
      ORDER BY new_order_id DESC
      LIMIT 100
    `;

    const rows = await query(sql);
    let nextOrderNumber = 660000;
    let maxFound = 0;

    // Extract numbers from order numbers (handles both "BMR-660001" and "660001" formats)
    if (rows && rows.length > 0) {
      for (const row of rows) {
        const orderNum = row.order_number || "";
        // Extract number from "BMR-660001" format or just number
        const match = orderNum.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num >= 660000 && num > maxFound) {
            maxFound = num;
          }
        }
      }

      if (maxFound >= 660000) {
        nextOrderNumber = maxFound + 1;
      }
    }

    return NextResponse.json({
      orderNumber: nextOrderNumber,
      orderId: `BMR-${nextOrderNumber}`,
    });
  } catch (error) {
    console.error("Error getting next order number:", error);

    // Default fallback
    return NextResponse.json({
      orderNumber: 660000,
      orderId: "BMR-660000",
    });
  }
}
