import { isGiftCertificateProduct } from "@/lib/giftCardUtils";
import { getAcPanelPowderCoatUnitPrice } from "@/lib/acPanelPowderCoat";

function resolveProductImage(product) {
  let productImage = null;
  if (product.selectedColor && product.images && product.images.length > 0) {
    let imageIndex = 0;
    if (product.selectedColor.ColorID === 1) {
      imageIndex = Math.min(1, product.images.length - 1);
    } else if (product.selectedColor.ColorID === 2) {
      imageIndex = 0;
    }
    const colorImageSrc =
      product.images[imageIndex]?.imgSrc || product.images[0]?.imgSrc;
    if (colorImageSrc && colorImageSrc.trim() !== "") {
      productImage = colorImageSrc;
    }
  }
  if (
    !productImage &&
    product.images?.[0]?.imgSrc &&
    product.images[0].imgSrc.trim() !== ""
  ) {
    productImage = product.images[0].imgSrc;
  }
  if (!productImage && product.ImageLarge && product.ImageLarge.trim() !== "") {
    productImage = product.ImageLarge;
  }
  return productImage;
}

/**
 * Order payload lines: main product, optional FP powder-coat line, then hardware packs.
 * Mirrors validateCouponForCart expandedLines order.
 */
export function buildOrderItemsFromCart(cartProducts, appliedCoupon) {
  const orderItems = [];
  let lineDiscountIndex = 0;

  for (const product of cartProducts || []) {
    const lineDiscount =
      (appliedCoupon?.lineItemDiscounts?.[lineDiscountIndex] ?? 0) || 0;
    lineDiscountIndex += 1;

    const isGiftCert = isGiftCertificateProduct({
      partNumber: product.PartNumber,
      name: product.ProductName,
    });
    const productImage = resolveProductImage(product);

    orderItems.push({
      productId: product.ProductID,
      name: product.ProductName,
      partNumber: product.PartNumber,
      quantity: product.quantity,
      price: product.Price,
      color: isGiftCert
        ? ""
        : product.selectedColor?.ColorName ||
          product.defaultColorName ||
          "Default",
      size: product.selectedSize || "",
      platform: product.PlatformName,
      yearRange: product.YearRange,
      image: productImage,
      Package: product.Package ?? 0,
      LowMargin: product.LowMargin ?? 0,
      ManufacturerName: product.ManufacturerName ?? "",
      lineDiscount,
    });

    const powderUnit = getAcPanelPowderCoatUnitPrice(
      product.selectedColor,
      product.PartNumber,
    );
    if (powderUnit > 0) {
      const powderLineDiscount =
        (appliedCoupon?.lineItemDiscounts?.[lineDiscountIndex] ?? 0) || 0;
      lineDiscountIndex += 1;
      orderItems.push({
        productId: null,
        name: `Powder coat — ${product.selectedColor?.ColorName || "finish"}`,
        partNumber: `POWDERCOAT-${product.PartNumber}`,
        quantity: product.quantity,
        price: String(powderUnit),
        color: product.selectedColor?.ColorName || "",
        size: "",
        platform: product.PlatformName || "",
        yearRange: product.YearRange || "",
        image: null,
        Package: 0,
        LowMargin: 0,
        ManufacturerName: product.ManufacturerName ?? "",
        lineDiscount: powderLineDiscount,
      });
    }

    if (
      product.selectedHardwarePacks &&
      Array.isArray(product.selectedHardwarePacks) &&
      product.selectedHardwarePacks.length > 0
    ) {
      for (const pack of product.selectedHardwarePacks) {
        const packLineDiscount =
          (appliedCoupon?.lineItemDiscounts?.[lineDiscountIndex] ?? 0) || 0;
        lineDiscountIndex += 1;
        orderItems.push({
          productId: pack.ProductID,
          name: pack.ProductName,
          partNumber: pack.PartNumber || "",
          quantity: product.quantity,
          price: pack.Price || "0",
          color: "",
          size: "",
          platform: product.PlatformName || "",
          yearRange: product.YearRange || "",
          image: null,
          Package: 0,
          LowMargin: 0,
          ManufacturerName: product.ManufacturerName ?? "",
          lineDiscount: packLineDiscount,
        });
      }
    }
  }

  return orderItems;
}
