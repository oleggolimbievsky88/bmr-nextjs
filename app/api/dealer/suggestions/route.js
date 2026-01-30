// app/api/dealer/suggestions/route.js
// Dealer feature suggestions (Dealer Portal or website improvements)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  insertDealerSuggestion,
  getDealerSuggestionsByCustomerId,
} from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "dealer" && role !== "admin") {
      return NextResponse.json(
        { error: "Dealer access required" },
        { status: 403 },
      );
    }
    const customerId = parseInt(session.user.id, 10);
    if (Number.isNaN(customerId)) {
      return NextResponse.json(
        { error: "Customer ID not found" },
        { status: 400 },
      );
    }
    const suggestions = await getDealerSuggestionsByCustomerId(customerId);
    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("Error fetching dealer suggestions:", error);
    return NextResponse.json(
      { error: "Failed to load suggestions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "dealer" && role !== "admin") {
      return NextResponse.json(
        { error: "Dealer access required" },
        { status: 403 },
      );
    }
    const customerId = parseInt(session.user.id, 10);
    if (Number.isNaN(customerId)) {
      return NextResponse.json(
        { error: "Customer ID not found" },
        { status: 400 },
      );
    }
    const body = await request.json();
    const subject = (body.subject || "").trim();
    const suggestion = (body.suggestion || "").trim();
    if (!suggestion) {
      return NextResponse.json(
        { error: "Please describe your suggestion." },
        { status: 400 },
      );
    }
    const id = await insertDealerSuggestion(customerId, subject, suggestion);
    return NextResponse.json({
      success: true,
      id,
      message: "Thank you! Your suggestion has been submitted.",
    });
  } catch (error) {
    console.error("Error submitting dealer suggestion:", error);
    return NextResponse.json(
      { error: "Failed to submit suggestion" },
      { status: 500 },
    );
  }
}
