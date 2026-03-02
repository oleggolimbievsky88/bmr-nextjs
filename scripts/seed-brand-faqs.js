/**
 * Seed brand_faqs for BMR and Control Freak with the same content as the current FAQ page.
 * Run from project root: node scripts/seed-brand-faqs.js
 * Requires: DATABASE_BRAND_CORE_URL (or DATABASE_URL if same DB) in .env.local or .env
 * Run database/brand_faqs.sql and database/brand_faq_sections.sql first (and brand_faqs_add_section.sql if section column was missing).
 */

const mysql = require("mysql2/promise");
const path = require("path");
// Load .env.local then .env so local overrides work when running: node scripts/seed-brand-faqs.js
try {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
} catch (e) {
  console.error(
    "Could not load dotenv (install with: pnpm add -D dotenv). Env vars must be set in the shell or in .env files.",
  );
  throw e;
}

const BRANDS = ["bmr", "controlfreak"];

const FAQ_DATA = [
  {
    section: "shopping",
    title: "Shopping & product information",
    faqs: [
      {
        question: "What vehicles does BMR Suspension support?",
        answer:
          "BMR Suspension manufactures performance suspension and chassis parts for American muscle cars. We support currently support Ford platforms, GM platforms (Late Model, Mid Muscle, and Classic Muscle cars), Mopar platforms, and more coming soon. Use our vehicle search or product filters on the site to see all supported platforms and find parts that fit your year, make, and model.",
      },
      {
        question: "How do I know if a part fits my car?",
        answer:
          "Each product detail page lists compatible years, makes, and models. Use the vehicle search on our site to filter parts by your vehicle, or check the fitment information on the product detail page. If you're unsure, contact our helpful techs with your vehicle info and the part number for confirmation before ordering.",
      },
      {
        question:
          "Do you offer technical specifications and installation guides?",
        answer:
          "Yes, many product detail pages include installation instructions. You can also click on the Installation link in the main menu and search by Part Number or by vehicle to find your product and installation instructions. Contact us if you need additional technical information for a specific product.",
      },
      {
        question:
          "I placed an order but my payment method has not been charged. Is there something wrong?",
        answer:
          "BMR Suspension only charges for orders that are in stock and ready to ship. If your order contains backordered items, your card will not be charged until those items are back in stock and ready to ship. Orders that contain both in-stock and backordered items will be partially charged for the in-stock items and shipped out. The remaining backordered items will be charged and shipped as they become available.",
      },
      {
        question: "Where can I get technical help on BMR parts?",
        answer:
          "Our BMR Suspension techs are available via email or phone from 8:30 AM to 5:30 PM ET, Monday through Friday. You can contact us by email at fordtech@bmrsuspension.com or gmtech@bmrsuspension.com, or by phone at (813) 986-9302.",
      },
    ],
  },
  {
    section: "payment",
    title: "Payment",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept American Express, Discover, Mastercard, and Visa by credit card for orders from the United States and Canada only. For all other orders (international and elsewhere), payment is through PayPal only; arrangements can be made over the phone or via email so that a PayPal invoice can be sent.",
      },
    ],
  },
  {
    section: "shipping",
    title: "Shipping",
    faqs: [
      {
        question: "How do I qualify for free shipping?",
        answer:
          "All orders shipped within the 48 contiguous United States qualify for free UPS Ground shipping on BMR Suspension products. Expedited shipping options such as UPS Next Day Air, 2nd Day Air, and 3 Day Select are available for an additional charge. USPS may be used for smaller orders.",
      },
      {
        question:
          "If I use a coupon code, do I still qualify for free shipping?",
        answer:
          "Yes. Orders that use a coupon code on BMR Suspension products still qualify for free UPS Ground shipping within the 48 contiguous United States.",
      },
      {
        question:
          "I'm shipping to a different address than my billing address. Is that okay?",
        answer:
          "Yes, that is fine. Due to increased fraud prevention measures, if your shipping address differs from your billing address, we will send a PayPal invoice via email for payment to help protect both BMR Suspension and the customer.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship internationally using UPS or USPS. All international orders must be prepaid, and the buyer is responsible for all shipping costs, duties, and taxes. International shipments are fully insured and declared at full value.",
      },
    ],
  },
  {
    section: "returns",
    title: "Returns & warranty",
    faqs: [
      {
        question: "Do you accept returns?",
        answer:
          "Yes, we accept returns on non-warranty items within 90 days of the shipment date. All returns are subject to a 15% restocking fee, excluding shipping costs. Items that have been installed, used, modified, or damaged are not eligible for return. Returned items must be in original packaging and original condition. To start a return, call (813) 986-9302 or email us for assistance.",
      },
      {
        question: "I received the wrong part. What should I do?",
        answer:
          "If an incorrect product was shipped due to a BMR error, the item will be replaced at no charge. The issue must be reported within 14 days of receiving the shipment. If reported after 14 days, the customer may be responsible for a portion of the replacement cost. Replacement items are shipped using the original shipping method at no charge. If an upgraded shipping method is requested, the customer will be charged the difference. Replacement products will not be shipped until the original item has been returned.",
      },
      {
        question: "What is your warranty policy?",
        answer:
          "Warranty information varies by product. Please refer to our full warranty policy page for detailed coverage and terms. If you have questions about warranty coverage for a specific part, contact our customer service team for assistance.",
      },
    ],
  },
];

function parseDatabaseUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: parsed.pathname
        ? parsed.pathname.slice(1).replace(/%2f/gi, "/")
        : "",
    };
  } catch {
    return null;
  }
}

async function main() {
  const url = process.env.DATABASE_BRAND_CORE_URL || process.env.DATABASE_URL;
  const config = parseDatabaseUrl(url);
  if (!config || !config.database) {
    console.error(
      "Missing DATABASE_BRAND_CORE_URL or DATABASE_URL with database name.",
    );
    console.error(
      "Set one of them in .env.local or .env in the project root, then run: node scripts/seed-brand-faqs.js",
    );
    console.error(
      "(Vercel env vars are not available when running scripts locally.)",
    );
    process.exit(1);
  }

  const conn = await mysql.createConnection(config);
  let sortOrder = 0;
  const rows = [];
  for (const section of FAQ_DATA) {
    for (const faq of section.faqs) {
      rows.push({
        section: section.section,
        question: faq.question,
        answer: faq.answer,
        sortOrder: sortOrder++,
      });
    }
  }

  for (const brandKey of BRANDS) {
    await conn.execute("DELETE FROM brand_faqs WHERE brand_key = ?", [
      brandKey,
    ]);
    console.log(`Cleared existing FAQs for ${brandKey}`);
    for (const row of rows) {
      await conn.execute(
        "INSERT INTO brand_faqs (brand_key, question, answer, sort_order, section) VALUES (?, ?, ?, ?, ?)",
        [brandKey, row.question, row.answer, row.sortOrder, row.section],
      );
    }
    console.log(`Inserted ${rows.length} FAQs for ${brandKey}`);
  }

  // Seed brand_faq_sections so the FAQ page uses editable section headings
  for (const brandKey of BRANDS) {
    await conn.execute("DELETE FROM brand_faq_sections WHERE brand_key = ?", [
      brandKey,
    ]);
    let so = 0;
    for (const section of FAQ_DATA) {
      await conn.execute(
        "INSERT INTO brand_faq_sections (brand_key, section_key, title, sort_order) VALUES (?, ?, ?, ?)",
        [brandKey, section.section, section.title, so++],
      );
    }
    console.log(`Inserted ${FAQ_DATA.length} FAQ sections for ${brandKey}`);
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
