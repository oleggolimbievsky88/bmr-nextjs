import { getBrandConfig } from "@/lib/brandConfig";

export async function generateMetadata() {
  const config = await getBrandConfig();
  const name =
    config.companyNameShort || config.companyName || config.name || "Us";
  const siteTitle = config.defaultTitle || "";
  const titlePart = siteTitle.split("|")[1]?.trim() || name;
  return {
    title: `Installation | ${titlePart}`,
    description:
      config.defaultDescription ||
      `Installation instructions and support for ${config.companyName || config.name || "our"} products.`,
  };
}

export default function InstallationLayout({ children }) {
  return children;
}
