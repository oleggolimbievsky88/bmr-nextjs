import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: {
    template: "BMR Admin | %s",
    default: "BMR Admin | Dashboard",
  },
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
