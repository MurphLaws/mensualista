import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Package, TrendingUp, Users, MessageCircle, Settings, Key, Tag } from "lucide-react";
import CompanyOverview from "@/pages/company/CompanyOverview";
import CompanyBrand from "@/pages/company/CompanyBrand";
import CompanyProducts from "@/pages/company/CompanyProducts";
import CompanyProductDetail from "@/pages/company/CompanyProductDetail";
import CompanyVendors from "@/pages/company/CompanyVendors";
import CompanySales from "@/pages/company/CompanySales";
import CompanyCodes from "@/pages/company/CompanyCodes";
import CompanyCoupons from "@/pages/company/CompanyCoupons";
import CompanyChat from "@/pages/company/CompanyChat";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/company" },
  { label: "Mis Productos", icon: Package, path: "/company/products" },
  { label: "Ventas", icon: TrendingUp, path: "/company/sales" },
  { label: "Mi Red", icon: Users, path: "/company/vendors" },
  { label: "Chat", icon: MessageCircle, path: "/company/chat" },
  { label: "Codigos", icon: Key, path: "/company/codes" },
  { label: "Cupones", icon: Tag, path: "/company/coupons" },
  { label: "Configuracion", icon: Settings, path: "/company/brand" },
];

const ROUTES = [
  { path: "", element: <CompanyOverview /> },
  { path: "brand", element: <CompanyBrand /> },
  { path: "products", element: <CompanyProducts /> },
  { path: "products/:id", element: <CompanyProductDetail /> },
  { path: "vendors", element: <CompanyVendors /> },
  { path: "sales", element: <CompanySales /> },
  { path: "codes", element: <CompanyCodes /> },
  { path: "coupons", element: <CompanyCoupons /> },
  { path: "chat", element: <CompanyChat /> },
];

export default function CompanyDashboard() {
  return <DashboardLayout navItems={NAV_ITEMS} routes={ROUTES} />;
}
