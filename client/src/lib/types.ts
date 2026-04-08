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
  // Extended fields
  target_audience: string;
  features: string[];
  not_included: string[];
  pitch_one_line: string;
  pitch_three_lines: string;
  objections: { objection: string; response: string }[];
  ideal_client: string;
  sales_material_urls: string[];
  refund_window_days: number;
  refund_auto: boolean;
  website_url: string;
  training_type: string;
  training_duration_min: number;
  // Vendor-specific stats
  my_sales: number;
  my_earned: number;
  vendor_status: string;
  // Coupons
  coupons: {
    id: string;
    code: string;
    discount_pct: number;
    max_uses: number;
    used_count: number;
    expires_at: string | null;
  }[];
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
