import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCategoryAttributesByAttributeCategoryId,
  createCategoryAttribute,
  updateCategoryAttribute,
  getAllColors,
} from "@/lib/queries";

const normalizeLabel = (label) =>
  String(label || "")
    .trim()
    .replace(/:$/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const slugFromLabel = (label) =>
  String(label || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 100);

const parseBooleanValue = (value) => {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (["yes", "true", "1"].includes(v)) return "1";
  if (["no", "false", "0"].includes(v)) return "0";
  return null;
};

const isBooleanLike = (value) => parseBooleanValue(value) !== null;

const splitValues = (value) =>
  String(value || "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const mergeOptions = (existing, values) => {
  const current = String(existing || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const currentKeys = new Set(current.map((v) => v.toLowerCase()));
  const incoming = values.map((v) => String(v || "").trim()).filter(Boolean);
  for (const value of incoming) {
    const key = value.toLowerCase();
    if (!currentKeys.has(key)) {
      current.push(value);
      currentKeys.add(key);
    }
  }
  return current.length ? current.join("\n") : null;
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const attributeCategoryId = Number(
      body.attributeCategoryId || body.attribute_category_id,
    );
    if (!attributeCategoryId) {
      return NextResponse.json(
        { error: "attributeCategoryId is required" },
        { status: 400 },
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const promoteTextToSelect = body.promoteTextToSelect !== false;
    const cleanedItems = items
      .map((item) => ({
        label: String(item?.label || "")
          .trim()
          .replace(/:$/, ""),
        value: String(item?.value || "").trim(),
      }))
      .filter((item) => item.label && item.value);

    if (cleanedItems.length === 0) {
      return NextResponse.json(
        { error: "No attribute labels/values provided" },
        { status: 400 },
      );
    }

    const existing =
      await getCategoryAttributesByAttributeCategoryId(attributeCategoryId);
    const slugMap = new Map();
    const labelMap = new Map();
    for (const attr of existing) {
      if (attr?.slug) slugMap.set(attr.slug, attr);
      if (attr?.label) labelMap.set(normalizeLabel(attr.label), attr);
    }

    let colorsMap = null;
    const ensureColors = async () => {
      if (colorsMap) return;
      const rows = await getAllColors();
      colorsMap = new Map();
      (rows || []).forEach((row) => {
        if (row?.ColorID != null) {
          const id = String(row.ColorID);
          colorsMap.set(id, id);
        }
        if (row?.ColorName) {
          colorsMap.set(
            String(row.ColorName).trim().toLowerCase(),
            String(row.ColorID),
          );
        }
      });
    };

    const attributeValues = {};
    let createdCount = 0;
    let updatedCount = 0;

    for (const item of cleanedItems) {
      const label = item.label;
      const value = item.value;
      const labelKey = normalizeLabel(label);
      const slug = slugFromLabel(label);
      if (!slug) continue;

      let attr = slugMap.get(slug) || labelMap.get(labelKey);

      if (!attr) {
        const newType = isBooleanLike(value) ? "boolean" : "text";
        const id = await createCategoryAttribute({
          attribute_category_id: attributeCategoryId,
          slug,
          label,
          type: newType,
          options: null,
          sort_order: 0,
        });
        attr = {
          id,
          attribute_category_id: attributeCategoryId,
          slug,
          label,
          type: newType,
          options: null,
          sort_order: 0,
        };
        slugMap.set(slug, attr);
        labelMap.set(labelKey, attr);
        createdCount += 1;
      }

      let nextType = attr.type || "text";
      let nextOptions = attr.options ?? null;
      const isColorOptions =
        String(nextOptions || "").trim() === "__product_colors__";

      if (nextType === "select" || nextType === "multiselect") {
        if (!isColorOptions) {
          const valuesToAdd =
            nextType === "multiselect" ? splitValues(value) : [value];
          const merged = mergeOptions(nextOptions, valuesToAdd);
          if (merged !== (nextOptions != null ? String(nextOptions) : null)) {
            await updateCategoryAttribute(attr.id, { options: merged });
            nextOptions = merged;
            updatedCount += 1;
          }
        }
      } else if (nextType === "text" && promoteTextToSelect) {
        if (!isColorOptions) {
          const merged = mergeOptions(nextOptions, [value]);
          await updateCategoryAttribute(attr.id, {
            type: "select",
            options: merged,
          });
          nextType = "select";
          nextOptions = merged;
          updatedCount += 1;
        }
      }

      attr.type = nextType;
      attr.options = nextOptions;

      let normalizedValue = value;
      if (nextType === "boolean") {
        const boolValue = parseBooleanValue(value);
        normalizedValue = boolValue !== null ? boolValue : value;
      } else if (nextType === "multiselect") {
        normalizedValue = splitValues(value).join(",");
      }

      if (String(nextOptions || "").trim() === "__product_colors__") {
        await ensureColors();
        const mapped = colorsMap.get(
          String(value || "")
            .trim()
            .toLowerCase(),
        );
        if (mapped) normalizedValue = mapped;
      }

      attributeValues[attr.slug] = normalizedValue;
    }

    const categoryAttributes =
      await getCategoryAttributesByAttributeCategoryId(attributeCategoryId);
    return NextResponse.json({
      success: true,
      created: createdCount,
      updated: updatedCount,
      attributeValues,
      categoryAttributes,
    });
  } catch (error) {
    console.error("Error importing category attributes:", error);
    return NextResponse.json(
      { error: "Failed to import category attributes" },
      { status: 500 },
    );
  }
}
