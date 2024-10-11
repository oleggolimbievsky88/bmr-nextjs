export const allHomepages = [
  {
    href: "/",
    imgSrc: "/images/demo/home-01.jpg",
    alt: "home-01",
    name: "Home Fashion 01",
    labels: ["New", "Trend"],
  },
];

export const demoItems = [
  {
    href: "/",
    src: "/images/demo/home-01.jpg",
    alt: "home-01",
    name: "Home Fashion 01",
    labels: [{ className: "demo-new", text: "New" }, { text: "Trend" }],
  },
];

export const productsPages = [
  {
    heading: "Shop layouts",
    links: [
      { href: "/shop-default", text: "Default" },
      { href: "/shop-left-sidebar", text: "Left sidebar" },
      { href: "/shop-right-sidebar", text: "Right sidebar" },
      { href: "/shop-fullwidth", text: "Fullwidth" },
      { href: "/shop-collection-sub", text: "Sub collection" },
      { href: "/shop-collection-list", text: "Collections list" },
    ],
  },
  {
    heading: "Features",
    links: [
      { href: "/shop-link", text: "Pagination links" },
      { href: "/shop-loadmore", text: "Pagination loadmore" },
      {
        href: "/shop-infinite-scrolling",
        text: "Pagination infinite scrolling",
      },
      { href: "/shop-filter-sidebar", text: "Filter sidebar" },
      { href: "/shop-filter-hidden", text: "Filter hidden" },
    ],
  },
  {
    heading: "Product styles",
    links: [
      { href: "/product-style-list", text: "Product style list" },
      { href: "/product-style-01", text: "Product style 01" },
      { href: "/product-style-02", text: "Product style 02" },
      { href: "/product-style-03", text: "Product style 03" },
      { href: "/product-style-04", text: "Product style 04" },
      { href: "/product-style-05", text: "Product style 05" },
      { href: "/product-style-06", text: "Product style 06" },
      { href: "/product-style-07", text: "Product style 07" },
    ],
  },
];

export const productDetailPages = [
  {
    heading: "Product layouts",
    links: [
      { href: "/product-detail/1", text: "Product default" },
      { href: "/product-grid-1", text: "Product grid 1" },
      { href: "/product-grid-2", text: "Product grid 2" },
      { href: "/product-stacked", text: "Product stacked" },
      { href: "/product-right-thumbnails", text: "Product right thumbnails" },
      { href: "/product-bottom-thumbnails", text: "Product bottom thumbnails" },
      { href: "/product-drawer-sidebar", text: "Product drawer sidebar" },
      {
        href: "/product-description-accordion",
        text: "Product description accordion",
      },
      { href: "/product-description-list", text: "Product description list" },
      {
        href: "/product-description-vertical",
        text: "Product description vertical",
      },
    ],
  },
  {
    heading: "Product details",
    links: [
      { href: "/product-inner-zoom", text: "Product inner zoom" },
      { href: "/product-zoom-magnifier", text: "Product zoom magnifier" },
      { href: "/product-no-zoom", text: "Product no zoom" },
      { href: "/product-photoswipe-popup", text: "Product photoswipe popup" },
      {
        href: "/product-zoom-popup",
        text: "Product external zoom and photoswipe popup",
      },
      { href: "/product-video", text: "Product video" },
      { href: "/product-3d", text: "Product 3D, AR models" },
      {
        href: "/product-options-customizer",
        text: "Product options & customizer",
      },
      { href: "/product-advanced-types", text: "Advanced product types" },
      {
        href: "/product-giftcard",
        text: "Recipient information form for gift card products",
      },
    ],
  },
  {
    heading: "Product swatches",
    links: [
      { href: "/product-color-swatch", text: "Product color swatch" },
      { href: "/product-rectangle", text: "Product rectangle" },
      { href: "/product-rectangle-color", text: "Product rectangle color" },
      { href: "/product-swatch-image", text: "Product swatch image" },
      {
        href: "/product-swatch-image-rounded",
        text: "Product swatch image rounded",
      },
      { href: "/product-swatch-dropdown", text: "Product swatch dropdown" },
      {
        href: "/product-swatch-dropdown-color",
        text: "Product swatch dropdown color",
      },
    ],
  },
  {
    heading: "Product features",
    links: [
      {
        href: "/product-frequently-bought-together",
        text: "Frequently bought together",
      },
      {
        href: "/product-frequently-bought-together-2",
        text: "Frequently bought together 2",
      },
      { href: "/product-upsell-features", text: "Product upsell features" },
      { href: "/product-pre-orders", text: "Product pre-orders" },
      { href: "/product-notification", text: "Back in stock notification" },
      { href: "/product-pickup", text: "Product pickup" },
      { href: "/product-images-grouped", text: "Variant images grouped" },
      { href: "/product-complimentary", text: "Complimentary products" },
      {
        href: "/product-quick-order-list",
        text: "Quick order list",
        extra: (
          <div className="demo-label">
            <span className="demo-new">New</span>
          </div>
        ),
      },
    ],
  },
];

export const allPagesLinks = [
  { href: "/about-us", text: "About us" },
  {
    href: "/brands",
    text: "Brands",
    extra: (
      <div className="demo-label">
        <span className="demo-new">New</span>
      </div>
    ),
  },
  { href: "/brands-v2", text: "Brand V2" },
  { href: "/contact-1", text: "Contact 1" },
  { href: "/contact-2", text: "Contact 2" },
  { href: "/faq-1", text: "FAQ 01" },
  { href: "/faq-2", text: "FAQ 02" },
  { href: "/our-store", text: "Our store" },
  { href: "/store-locations", text: "Store locator" },
  {
    href: "/timeline",
    text: "Timeline",
    extra: (
      <div className="demo-label">
        <span className="demo-new">New</span>
      </div>
    ),
  },
  { href: "/view-cart", text: "View cart" },
  { href: "/checkout", text: "Check out" },
  { href: "/payment-confirmation", text: "Payment Confirmation" },
  { href: "/payment-failure", text: "Payment Failure" },
  { href: "/my-account", text: "My Account" },
];

export const blogLinks = [
  { href: "/blog-grid", text: "Grid layout" },
  { href: "/blog-sidebar-left", text: "Left sidebar" },
  { href: "/blog-sidebar-right", text: "Right sidebar" },
  { href: "/blog-list", text: "Blog list" },
  { href: "/blog-detail/1", text: "Single Post" },
];

export const navItems = [
  {
    id: "Home",
    label: "Home",
    links: [
      { href: "/", label: "Home" },
    ],
  },
  {
    id: "dropdown-menu-two",
    label: "Shop",
    links: [
      {
        id: "sub-shop-one",
        label: "Shop layouts",
        links: [
          { href: "/shop-default", label: "Default" },
          { href: "/shop-left-sidebar", label: "Left sidebar" },
          { href: "/shop-right-sidebar", label: "Right sidebar" },
          { href: "/shop-fullwidth", label: "Fullwidth" },
          { href: "/shop-collection-sub", label: "Sub collection" },
          { href: "/shop-collection-list", label: "Collections list" },
        ],
      },
      {
        id: "sub-shop-two",
        label: "Features",
        links: [
          { href: "/shop-link", label: "Pagination links" },
          { href: "/shop-loadmore", label: "Pagination loadmore" },
          {
            href: "/shop-infinite-scrolling",
            label: "Pagination infinite scrolling",
          },
          { href: "/shop-filter-sidebar", label: "Filter sidebar" },
          { href: "/shop-filter-hidden", label: "Filter hidden" },
        ],
      },
      {
        id: "sub-shop-three",
        label: "Product styles",
        links: [
          { href: "/product-style-list", label: "Product style list" },
          { href: "/product-style-01", label: "Product style 01" },
          { href: "/product-style-02", label: "Product style 02" },
          { href: "/product-style-03", label: "Product style 03" },
          { href: "/product-style-04", label: "Product style 04" },
          { href: "/product-style-05", label: "Product style 05" },
          { href: "/product-style-06", label: "Product style 06" },
          { href: "/product-style-07", label: "Product style 07" },
        ],
      },
    ],
  },
  {
    id: "dropdown-menu-three",
    label: "Products",
    links: [
      {
        id: "sub-product-one",
        label: "Product layouts",
        links: [
          { href: "/product-detail/1", label: "Product default" },
          { href: "/product-grid-1", label: "Product grid 1" },
          { href: "/product-grid-2", label: "Product grid 2" },
          { href: "/product-stacked", label: "Product stacked" },
          {
            href: "/product-right-thumbnails",
            label: "Product right thumbnails",
          },
          {
            href: "/product-bottom-thumbnails",
            label: "Product bottom thumbnails",
          },
          { href: "/product-drawer-sidebar", label: "Product drawer sidebar" },
          {
            href: "/product-description-accordion",
            label: "Product description accordion",
          },
          {
            href: "/product-description-list",
            label: "Product description list",
          },
          {
            href: "/product-description-vertical",
            label: "Product description vertical",
          },
        ],
      },
      {
        id: "sub-product-two",
        label: "Product details",
        links: [
          { href: "/product-inner-zoom", label: "Product inner zoom" },
          { href: "/product-zoom-magnifier", label: "Product zoom magnifier" },
          { href: "/product-no-zoom", label: "Product no zoom" },
          {
            href: "/product-photoswipe-popup",
            label: "Product photoswipe popup",
          },
          {
            href: "/product-zoom-popup",
            label: "Product external zoom and photoswipe popup",
          },
          { href: "/product-video", label: "Product video" },
          { href: "/product-3d", label: "Product 3D, AR models" },
          {
            href: "/product-options-customizer",
            label: "Product options & customizer",
          },
          { href: "/product-advanced-types", label: "Advanced product types" },
          {
            href: "/product-giftcard",
            label: "Recipient information form for gift card products",
          },
        ],
      },
      {
        id: "sub-product-three",
        label: "Product swatchs",
        links: [
          { href: "/product-color-swatch", label: "Product color swatch" },
          { href: "/product-rectangle", label: "Product rectangle" },
          {
            href: "/product-rectangle-color",
            label: "Product rectangle color",
          },
          { href: "/product-swatch-image", label: "Product swatch image" },
          {
            href: "/product-swatch-image-rounded",
            label: "Product swatch image rounded",
          },
          {
            href: "/product-swatch-dropdown",
            label: "Product swatch dropdown",
          },
          {
            href: "/product-swatch-dropdown-color",
            label: "Product swatch dropdown color",
          },
        ],
      },
      {
        id: "sub-product-four",
        label: "Product features",
        links: [
          {
            href: "/product-frequently-bought-together",
            label: "Frequently bought together",
          },
          {
            href: "/product-frequently-bought-together-2",
            label: "Frequently bought together 2",
          },
          {
            href: "/product-upsell-features",
            label: "Product upsell features",
          },
          { href: "/product-pre-orders", label: "Product pre-orders" },
          {
            href: "/product-notification",
            label: "Back in stock notification",
          },
          { href: "/product-pickup", label: "Product pickup" },
          { href: "/product-images-grouped", label: "Variant images grouped" },
          { href: "/product-complimentary", label: "Complimentary products" },
          {
            href: "/product-quick-order-list",
            label: "Quick order list",
            demoLabel: true,
          },
        ],
      },
    ],
  },
  {
    id: "dropdown-menu-four",
    label: "Pages",
    links: [
      { href: "/about-us", label: "About us" },
      { href: "/brands", label: "Brands", demoLabel: true },
      { href: "/brands-v2", label: "Brands V2" },
      { href: "/contact-1", label: "Contact 1" },
      { href: "/contact-2", label: "Contact 2" },
      { href: "/faq-1", label: "FAQ 01" },
      { href: "/faq-2", label: "FAQ 02" },
      { href: "/our-store", label: "Our store" },
      { href: "/store-locations", label: "Store locator" },
      { href: "/timeline", label: "Timeline", demoLabel: true },
      { href: "/view-cart", label: "View cart" },
      { href: "/my-account", label: "My account" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/terms", label: "Terms and conditions" },
      { href: "/404", label: "404 page" },
    ],
  },
];
