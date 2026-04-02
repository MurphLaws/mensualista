export interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  commission_pct: number;
  type: "mensual" | "unico";
  image_url: string;
  status: "active" | "inactive";
  company_name: string;
  company_logo_url: string | null;
  sales_count: number;
}

export interface VendorDashboardStats {
  greeting: string;
  stats: {
    total_sales: number;
    pending_return: number;
    available: number;
    total_commissions: number;
  };
}
