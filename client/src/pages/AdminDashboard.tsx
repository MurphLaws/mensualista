import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Building2, ArrowLeftRight, Settings } from "lucide-react";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCompanies from "@/pages/admin/AdminCompanies";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminSettings from "@/pages/admin/AdminSettings";

const NAV_ITEMS = [
  { label: "Inicio", icon: LayoutDashboard, path: "/admin" },
  { label: "Usuarios", icon: Users, path: "/admin/users" },
  { label: "Empresas", icon: Building2, path: "/admin/companies" },
  { label: "Transacciones", icon: ArrowLeftRight, path: "/admin/transactions" },
  { label: "Configuracion", icon: Settings, path: "/admin/settings" },
];

const ROUTES = [
  { path: "", element: <AdminOverview /> },
  { path: "users", element: <AdminUsers /> },
  { path: "companies", element: <AdminCompanies /> },
  { path: "transactions", element: <AdminTransactions /> },
  { path: "settings", element: <AdminSettings /> },
];

export default function AdminDashboard() {
  return <DashboardLayout navItems={NAV_ITEMS} routes={ROUTES} />;
}
