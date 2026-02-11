import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  addBannerImageAdmin,
  updateBannerImageAdmin,
  deleteBannerImageAdmin,
  getBannerImageCount,
  MAX_BANNER_IMAGES,
} from "@/lib/queries";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const body = await request.json().catch(() => ({}));
    const bannerId = body.bannerid ?? body.bannerId;
    if (bannerId == null) {
      return NextResponse.json({ error: "Missing bannerid" }, { status: 400 });
    }
    const count = await getBannerImageCount(Number(bannerId));
    if (count >= MAX_BANNER_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BANNER_IMAGES} images per banner` },
        { status: 400 },
      );
    }
    const imageSrc = body.imageSrc ?? body.ImageSrc ?? "";
    if (!imageSrc.trim()) {
      return NextResponse.json(
        { error: "Missing imageSrc (filename or path)" },
        { status: 400 },
      );
    }
    const imageId = await addBannerImageAdmin(
      Number(bannerId),
      imageSrc.trim(),
      body.imageUrl ?? body.ImageUrl ?? null,
      body.imagePosition ?? body.ImagePosition ?? null,
    );
    return NextResponse.json({ success: true, imageId });
  } catch (error) {
    console.error("Error adding banner image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add image" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const body = await request.json().catch(() => ({}));
    const imageId = body.imageId ?? body.ImageId;
    if (imageId == null) {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }
    const updates = {};
    if (body.imageSrc !== undefined)
      updates.imageSrc = body.imageSrc ?? body.ImageSrc ?? "";
    if (body.imageUrl !== undefined)
      updates.imageUrl = body.imageUrl ?? body.ImageUrl;
    if (body.imagePosition !== undefined)
      updates.imagePosition = body.imagePosition ?? body.ImagePosition;
    await updateBannerImageAdmin(Number(imageId), updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating banner image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id == null || id === "") {
      return NextResponse.json(
        { error: "Missing id (imageId)" },
        { status: 400 },
      );
    }
    await deleteBannerImageAdmin(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
