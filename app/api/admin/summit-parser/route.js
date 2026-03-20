import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCategoryAttributesByAttributeCategoryId,
  createCategoryAttribute,
  updateCategoryAttribute,
  getAllColors,
  createAttributeCategory,
  getAttributeCategoryById,
  findAttributeCategoryByNormalizedName,
} from "@/lib/queries";
import {
  normalizeAttributeName,
  slugifyAttributeName,
} from "@/lib/attributeHelpers";

const normalizeLabel = (label) => normalizeAttributeName(label);

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

const getSummitValue = (items, label) => {
  const key = normalizeLabel(label);
  const match = (items || []).find(
    (item) => normalizeLabel(item?.label) === key,
  );
  return match?.value ? String(match.value).trim() : "";
};

const deriveAttributeCategoryName = (items, context = {}) => {
  const contextName = String(context.categoryName || "").trim();
  if (contextName) return contextName;
  const partType = getSummitValue(items, "Part Type");
  if (partType) return partType;
  const productLine = getSummitValue(items, "Product Line");
  if (productLine) return productLine;
  const fallback = String(
    context.productName || context.partNumber || "",
  ).trim();
  return fallback || "Summit Attributes";
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
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

    const attributeCategoryIdRaw = body.attributeCategoryId;
    const attributeCategoryId = attributeCategoryIdRaw
      ? Number(attributeCategoryIdRaw)
      : null;

    let attributeCategory = null;
    let attributeCategoryCreated = false;

    if (attributeCategoryId) {
      attributeCategory = await getAttributeCategoryById(attributeCategoryId);
      if (!attributeCategory) {
        return NextResponse.json(
          { error: "Selected attribute set was not found" },
          { status: 404 },
        );
      }
    } else {
      const desiredName = deriveAttributeCategoryName(
        cleanedItems,
        body.productContext || {},
      );
      const existing = await findAttributeCategoryByNormalizedName(desiredName);
      if (existing) {
        attributeCategory = existing;
      } else {
        let nameToUse = desiredName || "Summit Attributes";
        let slug = slugifyAttributeName(nameToUse);
        if (!slug) {
          nameToUse = "Summit Attributes";
          slug = slugifyAttributeName(nameToUse) || "summit-attributes";
        }
        const id = await createAttributeCategory({
          name: nameToUse,
          slug,
          sort_order: 0,
        });
        attributeCategory = { id, name: nameToUse, slug, sort_order: 0 };
        attributeCategoryCreated = true;
      }
    }

    const existingAttributes = await getCategoryAttributesByAttributeCategoryId(
      attributeCategory.id,
    );
    const slugMap = new Map();
    const labelMap = new Map();
    for (const attr of existingAttributes) {
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
    const existingCategories = new Map();
    const newCategories = new Map();
    const valuesAttached = [];

    for (const item of cleanedItems) {
      const label = item.label;
      const value = item.value;
      const labelKey = normalizeLabel(label);
      const slug = slugifyAttributeName(label);
      if (!slug) continue;

      let attr = slugMap.get(slug) || labelMap.get(labelKey);

      if (!attr) {
        const newType = isBooleanLike(value) ? "boolean" : "text";
        const id = await createCategoryAttribute({
          attribute_category_id: attributeCategory.id,
          slug,
          label,
          type: newType,
          options: null,
          sort_order: 0,
        });
        attr = {
          id,
          attribute_category_id: attributeCategory.id,
          slug,
          label,
          type: newType,
          options: null,
          sort_order: 0,
        };
        slugMap.set(slug, attr);
        labelMap.set(labelKey, attr);
        newCategories.set(labelKey, label);
      } else {
        existingCategories.set(labelKey, attr.label || label);
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
      valuesAttached.push({ label: attr.label || label, value });
    }

    const categoryAttributes = await getCategoryAttributesByAttributeCategoryId(
      attributeCategory.id,
    );

    return NextResponse.json({
      success: true,
      attributeCategoryId: attributeCategory.id,
      attributeCategoryName: attributeCategory.name,
      attributeCategoryCreated,
      attributeValues,
      categoryAttributes,
      summary: {
        attributeCategoryId: attributeCategory.id,
        attributeCategoryName: attributeCategory.name,
        attributeCategoryCreated,
        existingCategories: Array.from(existingCategories.values()),
        newCategories: Array.from(newCategories.values()),
        valuesAttached,
      },
    });
  } catch (error) {
    console.error("Error processing Summit parser:", error);
    return NextResponse.json(
      { error: "Failed to process Summit attributes" },
      { status: 500 },
    );
  }
}
