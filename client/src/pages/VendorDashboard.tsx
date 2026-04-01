import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Key } from "lucide-react";
import VendorOverview from "@/pages/vendor/VendorOverview";
import VendorProducts from "@/pages/vendor/VendorProducts";
import VendorSales from "@/pages/vendor/VendorSales";
import VendorCommissions from "@/pages/vendor/VendorCommissions";
import VendorCodes from "@/pages/vendor/VendorCodes";

const NAV_ITEMS = [
  { label: "Inicio", icon: LayoutDashboard, path: "/vendor" },
  { label: "Productos", icon: Package, path: "/vendor/products" },
  { label: "Ventas", icon: ShoppingBag, path: "/vendor/sales" },
  { label: "Comisiones", icon: DollarSign, path: "/vendor/commissions" },
  { label: "Codigos", icon: Key, path: "/vendor/codes" },
];

const ROUTES = [
  { path: "", element: <VendorOverview /> },
  { path: "products", element: <VendorProducts /> },
  { path: "sales", element: <VendorSales /> },
  { path: "commissions", element: <VendorCommissions /> },
  { path: "codes", element: <VendorCodes /> },
];

export default function VendorDashboard() {
  return <DashboardLayout navItems={NAV_ITEMS} routes={ROUTES} />;
}
