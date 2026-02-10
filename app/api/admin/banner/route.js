import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getBannerWithImagesAdmin, updateBannerImageUrl } from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await getBannerWithImagesAdmin();
    if (!data) {
      return NextResponse.json({ error: "No banner found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const updates = body.updates || body.images || [];
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Provide updates array with { imageId, imageUrl }" },
        { status: 400 },
      );
    }
    for (const u of updates) {
      const imageId = u.imageId ?? u.ImageId;
      const imageUrl = u.imageUrl ?? u.ImageUrl ?? "";
      if (imageId != null) {
        await updateBannerImageUrl(imageId, String(imageUrl).trim() || null);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 },
    );
  }
}
