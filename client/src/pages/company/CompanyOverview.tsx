import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, ShoppingCart, RefreshCw, Package, Users, Tag, MessageCircle,
  ChevronRight, TrendingUp, ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";

interface CompanyStats {
  active_vendors: number;
  monthly_sales: number;
  revenue: number;
  products: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  image_url: string;
  active: boolean;
}

interface Sale {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
  product_name: string;
  vendor_name: string;
}

export default function CompanyOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CompanyStats>("/api/company/dashboard"),
      api.get<{ products: Product[] }>("/api/products"),
      api.get<{ sales: Sale[] }>("/api/company/sales"),
    ]).then(([statsData, prodData, salesData]) => {
      setStats(statsData);
      setProducts(prodData.products);
      setSales(salesData.sales.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { icon: DollarSign, label: "Ventas este mes", value: formatCOP(stats?.revenue || 0) + " COP", sub: `${stats?.monthly_sales || 0} transacciones`, highlight: true },
    { icon: RefreshCw, label: "Suscripciones activas", value: String(stats?.monthly_sales || 0), sub: "recurrentes" },
    { icon: Package, label: "Productos activos", value: String(stats?.products || 0), sub: "ilimitados" },
    { icon: Users, label: "Vendedores", value: String(stats?.active_vendors || 0), sub: "en tu red" },
  ];

  const quickLinks = [
    { icon: Users, label: "Vendedores", value: stats?.active_vendors || 0, path: "/company/vendors" },
    { icon: Tag, label: "Cupones activos", value: 0, path: "/company/coupons" },
    { icon: MessageCircle, label: "Chats activos", value: 0, path: "/company/chat" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className={`rounded-xl border p-4 ${kpi.highlight ? "bg-primary/5 border-primary/20" : "bg-white"}`}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.highlight ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        {quickLinks.map((link, i) => (
          <button
            key={i}
            onClick={() => navigate(link.path)}
            className="rounded-xl border bg-white p-4 text-left hover:bg-gray-50 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{link.value}</p>
                  <p className="text-xs text-muted-foreground">{link.label}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Products Section */}
      {products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Mis Productos</h2>
            <button onClick={() => navigate("/company/products")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.slice(0, 3).map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/company/products/${p.id}`)}
                className="rounded-xl border bg-white overflow-hidden cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="relative h-36 bg-gray-200 overflow-hidden">
                  <img src={p.image_url || "https://picsum.photos/400/200"} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-semibold">{p.name}</p>
                    <p className="text-white/70 text-[10px]">{formatCOP(p.price)} COP{p.type === "mensual" ? "/mes" : ""}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>0 Suscritos</span>
                    <span>0 Ventas</span>
                  </div>
                  <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    Gestionar <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Ventas recientes</h2>
            <button onClick={() => navigate("/company/sales")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Status guide */}
          <div className="rounded-xl border bg-primary/5 border-primary/20 p-4 mb-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Estados de transaccion</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pendiente</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completada</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Devuelta</div>
            </div>
          </div>

          <div className="space-y-2">
            {sales.map(sale => (
              <div key={sale.id} className="rounded-xl border bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    sale.status === "completed" ? "bg-emerald-500" :
                    sale.status === "pending" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sale.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{sale.product_name} · {sale.vendor_name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-bold">{formatCOP(sale.amount)} COP</p>
                  <p className={`text-[10px] font-medium ${
                    sale.status === "completed" ? "text-emerald-600" :
                    sale.status === "pending" ? "text-amber-600" : "text-red-600"
                  }`}>
                    {sale.status === "completed" ? "Completada" :
                     sale.status === "pending" ? "Esperando pago" : "Devuelta"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
