// app/api/dealer/products/route.js
// Paginated products with dealer pricing (dealer only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getProductsForDealer,
  getProductsForDealerCount,
  getEffectiveDealerDiscount,
  getHardwarePackProducts,
} from "@/lib/queries";

function parsePrice(val) {
  if (val === null || val === undefined) return 0;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function applyDealerDiscount(price, discountPercent) {
  const p = parsePrice(price);
  const d = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
  return Math.round(p * (1 - d / 100) * 100) / 100;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "dealer" && role !== "admin") {
      return NextResponse.json(
        { error: "Dealer access required" },
        { status: 403 },
      );
    }

    const dealerTier = session.user.dealerTier ?? 0;
    const customerDiscount = session.user.dealerDiscount ?? 0;
    const discountPercent = await getEffectiveDealerDiscount(
      dealerTier,
      customerDiscount,
    );
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10)),
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const search = searchParams.get("search") || null;
    const bodyId = searchParams.get("bodyId") || null;
    const mainCatId = searchParams.get("mainCatId") || null;
    const catId = searchParams.get("catId") || null;
    const vendorId = searchParams.get("vendorId") || null;

    const filters = {
      search,
      bodyId: bodyId || null,
      mainCatId: mainCatId || null,
      catId: catId || null,
      manId: vendorId || null,
    };

    const [rows, total] = await Promise.all([
      getProductsForDealer(limit, offset, filters),
      getProductsForDealerCount(filters),
    ]);

    const packIdsSet = new Set();
    (rows || []).forEach((p) => {
      const raw = p.hardwarepacks;
      if (raw && typeof raw === "string" && raw.trim() !== "" && raw !== "0") {
        raw.split(",").forEach((id) => {
          const tid = id.trim();
          if (tid !== "" && tid !== "0") packIdsSet.add(tid);
        });
      }
    });
    const packIds = [...packIdsSet];
    const packsById = {};
    if (packIds.length > 0) {
      const packs = await getHardwarePackProducts(packIds);
      (packs || []).forEach((pack) => {
        packsById[String(pack.ProductID)] = {
          ...pack,
          dealerPrice: applyDealerDiscount(pack.Price, discountPercent),
        };
      });
    }

    const products = (rows || []).map((p) => {
      const price = parsePrice(p.Price);
      const dealerPrice = applyDealerDiscount(p.Price, discountPercent);
      const hardwarePackProducts = [];
      const raw = p.hardwarepacks;
      if (raw && typeof raw === "string" && raw.trim() !== "" && raw !== "0") {
        raw.split(",").forEach((id) => {
          const tid = id.trim();
          if (tid && tid !== "0" && packsById[tid]) {
            hardwarePackProducts.push(packsById[tid]);
          }
        });
      }
      return {
        ProductID: p.ProductID,
        PartNumber: p.PartNumber,
        ProductName: p.ProductName,
        Price: price,
        dealerPrice,
        ImageSmall: p.ImageSmall,
        ImageLarge: p.ImageLarge,
        BodyID: p.BodyID,
        ManID: p.ManID,
        ManName: p.ManName || null,
        Color: p.Color ?? null,
        Grease: p.Grease ?? null,
        AngleFinder: p.AngleFinder ?? null,
        Hardware: p.Hardware ?? null,
        hardwarePackProducts,
      };
    });

    return NextResponse.json({
      success: true,
      products,
      total: total ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching dealer products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
