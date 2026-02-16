"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Returns [gridItems, setGridItems] for shop product layout.
 * Defaults to list view (1) on mobile and desktopDefault (e.g. 4) on desktop.
 * Updates when viewport crosses the breakpoint (e.g. resize or rotation).
 * @param {number} desktopDefault - Grid columns when viewport is above breakpoint (e.g. 4 or 3).
 */
export function useShopGridItems(desktopDefault = 4) {
  const [gridItems, setGridItems] = useState(desktopDefault);

  useEffect(() => {
    const update = () => {
      setGridItems(
        typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
          ? 1
          : desktopDefault,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [desktopDefault]);

  return [gridItems, setGridItems];
}
