import { VendorLayout } from "@/components/vendor/VendorLayout";
import VendorOverview from "@/pages/vendor/VendorOverview";
import VendorProducts from "@/pages/vendor/VendorProducts";
import VendorProductDetail from "@/pages/vendor/VendorProductDetail";
import VendorSales from "@/pages/vendor/VendorSales";
import VendorCommissions from "@/pages/vendor/VendorCommissions";
import VendorCodes from "@/pages/vendor/VendorCodes";
import VendorProfile from "@/pages/vendor/VendorProfile";
import VendorClients from "@/pages/vendor/VendorClients";
import VendorTrainings from "@/pages/vendor/VendorTrainings";

const ROUTES = [
  { path: "", element: <VendorOverview /> },
  { path: "products", element: <VendorProducts /> },
  { path: "products/:id", element: <VendorProductDetail /> },
  { path: "sales", element: <VendorSales /> },
  { path: "commissions", element: <VendorCommissions /> },
  { path: "codes", element: <VendorCodes /> },
  { path: "profile", element: <VendorProfile /> },
  { path: "clients", element: <VendorClients /> },
  { path: "trainings", element: <VendorTrainings /> },
];

export default function VendorDashboard() {
  return <VendorLayout routes={ROUTES} />;
}
