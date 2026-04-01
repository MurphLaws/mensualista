import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Palette, Package, Users, TrendingUp, Key, Tag } from "lucide-react";
import CompanyOverview from "@/pages/company/CompanyOverview";
import CompanyBrand from "@/pages/company/CompanyBrand";
import CompanyProducts from "@/pages/company/CompanyProducts";
import CompanyVendors from "@/pages/company/CompanyVendors";
import CompanySales from "@/pages/company/CompanySales";
import CompanyCodes from "@/pages/company/CompanyCodes";
import CompanyCoupons from "@/pages/company/CompanyCoupons";

const NAV_ITEMS = [
  { label: "Inicio", icon: LayoutDashboard, path: "/company" },
  { label: "Marca", icon: Palette, path: "/company/brand" },
  { label: "Productos", icon: Package, path: "/company/products" },
  { label: "Vendedores", icon: Users, path: "/company/vendors" },
  { label: "Ventas", icon: TrendingUp, path: "/company/sales" },
  { label: "Codigos", icon: Key, path: "/company/codes" },
  { label: "Cupones", icon: Tag, path: "/company/coupons" },
];

const ROUTES = [
  { path: "", element: <CompanyOverview /> },
  { path: "brand", element: <CompanyBrand /> },
  { path: "products", element: <CompanyProducts /> },
  { path: "vendors", element: <CompanyVendors /> },
  { path: "sales", element: <CompanySales /> },
  { path: "codes", element: <CompanyCodes /> },
  { path: "coupons", element: <CompanyCoupons /> },
];

export default function CompanyDashboard() {
  return <DashboardLayout navItems={NAV_ITEMS} routes={ROUTES} />;
}
