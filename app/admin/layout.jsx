import { getBrandConfig } from "@/lib/brandConfig";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export async function generateMetadata() {
  const config = await getBrandConfig();
  const brandName =
    config.companyNameShort || config.companyName || config.name || "Admin";
  return {
    title: {
      template: `${brandName} Admin | %s`,
      default: `${brandName} Admin | Dashboard`,
    },
  };
}

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
