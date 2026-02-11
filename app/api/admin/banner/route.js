import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getBannerWithImagesAdmin,
  getBannerByIdWithImagesAdmin,
  getAllBannersAdmin,
  updateBannerImageUrl,
  updateBannerAdmin,
  createBannerAdmin,
  deleteBannerAdmin,
  checkBannerOverlapAdmin,
  addBannerImageAdmin,
  getBannerImageCount,
  updateBannerImageAdmin,
  deleteBannerImageAdmin,
  MAX_BANNER_IMAGES,
} from "@/lib/queries";

function requireAdmin(session) {
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id != null && id !== "") {
      const data = await getBannerByIdWithImagesAdmin(Number(id));
      return NextResponse.json(data || { banner: null, images: [] });
    }
    const list = await getAllBannersAdmin();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching banner(s):", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (auth) return auth;

    const body = await request.json().catch(() => ({}));
    const bannerId = await createBannerAdmin(body);
    return NextResponse.json({ success: true, bannerid: bannerId });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create banner" },
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

    if (Array.isArray(body.updates) && body.updates.length > 0) {
      for (const u of body.updates) {
        const imageId = u.imageId ?? u.ImageId;
        const imageUrl = u.imageUrl ?? u.ImageUrl ?? "";
        if (imageId != null) {
          await updateBannerImageUrl(imageId, String(imageUrl).trim() || null);
        }
      }
    }
    if (Array.isArray(body.imageOrder) && body.imageOrder.length > 0) {
      for (const item of body.imageOrder) {
        const imageId = item.imageId ?? item.ImageId;
        const imagePosition = item.imagePosition ?? item.ImagePosition;
        if (imageId != null && imagePosition !== undefined) {
          await updateBannerImageAdmin(Number(imageId), {
            imagePosition: Number(imagePosition),
          });
        }
      }
    }
    if (
      (Array.isArray(body.updates) && body.updates.length > 0) ||
      (Array.isArray(body.imageOrder) && body.imageOrder.length > 0)
    ) {
      return NextResponse.json({ success: true });
    }

    const bannerId = body.bannerid ?? body.id ?? body.bannerId;
    if (bannerId != null) {
      const overlap = await checkBannerOverlapAdmin(
        bannerId,
        body.display_start || null,
        body.display_end || null,
      );
      if (overlap) {
        return NextResponse.json(
          {
            error: `Scheduled range overlaps with banner "${overlap.bannername}" (ID ${overlap.bannerid}). End other at 11:59 PM before this one starts.`,
          },
          { status: 400 },
        );
      }
      await updateBannerAdmin(Number(bannerId), body);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Provide updates array or bannerid + banner fields" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update" },
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
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await deleteBannerAdmin(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 },
    );
  }
}
