import { VendorLayout } from "@/components/vendor/VendorLayout";
import VendorOverview from "@/pages/vendor/VendorOverview";
import VendorProducts from "@/pages/vendor/VendorProducts";
import VendorSales from "@/pages/vendor/VendorSales";
import VendorCommissions from "@/pages/vendor/VendorCommissions";
import VendorCodes from "@/pages/vendor/VendorCodes";

const ROUTES = [
  { path: "", element: <VendorOverview /> },
  { path: "products", element: <VendorProducts /> },
  { path: "sales", element: <VendorSales /> },
  { path: "commissions", element: <VendorCommissions /> },
  { path: "codes", element: <VendorCodes /> },
];

export default function VendorDashboard() {
  return <VendorLayout routes={ROUTES} />;
}
