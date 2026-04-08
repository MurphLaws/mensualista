import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Info, ShoppingCart, Users, Crown, BookOpen, Tag, Key, Shield,
  RefreshCw, Sparkles, Check, X, DollarSign, TrendingUp, Clock, HelpCircle,
  MessageSquare, Download, ExternalLink, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Product {
  id: string; name: string; description: string; price: number; commission_pct: number;
  type: string; image_url: string; active: boolean; company_name: string;
  target_audience: string; features: string[]; not_included: string[];
  pitch_one_line: string; pitch_three_lines: string;
  objections: { objection: string; response: string }[] | string;
  ideal_client: string; sales_material_urls: string[];
  refund_window_days: number; refund_auto: boolean; website_url: string;
  training_type: string; training_duration_min: number;
}

interface ProductStats {
  total_sales: number; total_revenue: number; total_commissions: number;
  pending_count: number; completed_count: number; refunded_count: number;
  vendor_count: number;
}

type TabId = "resumen" | "ventas" | "vendedores" | "comisiones" | "entrenamiento" | "cupones" | "codigos" | "config";

export default function CompanyProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("resumen");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<{ product: Product }>(`/api/products/${id}`),
      api.get<ProductStats>(`/api/products/${id}/stats`),
    ]).then(([prodData, statsData]) => {
      setProduct(prodData.product);
      setStats(statsData);
    }).catch(() => {
      toast.error("Producto no encontrado");
      navigate("/company/products");
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading || !product || !stats) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-16 bg-muted rounded-xl animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  const isMensual = product.type === "mensual";
  const commissionAmount = Math.round(product.price * product.commission_pct / 100);
  const netCompany = product.price - commissionAmount;
  const objections: { objection: string; response: string }[] =
    typeof product.objections === "string" ? JSON.parse(product.objections || "[]") : (product.objections || []);

  const tabs: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "resumen", label: "Resumen", icon: Info },
    { id: "ventas", label: "Ventas", icon: ShoppingCart, badge: stats.total_sales },
    { id: "vendedores", label: "Vendedores", icon: Users, badge: stats.vendor_count },
    { id: "comisiones", label: "Comisiones", icon: Crown },
    { id: "entrenamiento", label: "Entrenamiento", icon: BookOpen },
    { id: "cupones", label: "Cupones", icon: Tag },
    { id: "codigos", label: "Codigos", icon: Key },
    { id: "config", label: "Config", icon: Shield },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate("/company/products")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Mis Productos
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <img src={product.image_url || "https://picsum.photos/80/80"} alt={product.name}
          className="w-16 h-16 rounded-xl object-cover shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{product.name}</h1>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
              isMensual ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600")}>
              {isMensual ? <RefreshCw className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {isMensual ? "Recurrente" : "Unico"}
            </span>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
              product.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
              {product.active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {product.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-px">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="ml-0.5 text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* RESUMEN TAB */}
      {tab === "resumen" && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: DollarSign, label: "GMV total", value: formatCOP(stats.total_revenue), highlight: true },
              { icon: ShoppingCart, label: "Ventas", value: String(stats.total_sales) },
              { icon: Users, label: "Vendedores", value: String(stats.vendor_count) },
              { icon: Check, label: "Liberadas", value: String(stats.completed_count) },
              { icon: Clock, label: "En retencion", value: String(stats.pending_count) },
              { icon: X, label: "Devueltas", value: String(stats.refunded_count) },
            ].map((kpi, i) => (
              <div key={i} className={cn("rounded-xl border p-3 text-center", kpi.highlight ? "bg-primary/5 border-primary/20" : "bg-white")}>
                <kpi.icon className={cn("w-4 h-4 mx-auto mb-1", kpi.highlight ? "text-primary" : "text-muted-foreground")} />
                <p className="text-lg font-bold">{kpi.value}</p>
                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4" /> Precio y comisiones</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border p-4">
                <p className="text-[10px] text-muted-foreground uppercase">Precio cliente</p>
                <p className="text-xl font-bold text-primary mt-1">{formatCOP(product.price)} COP</p>
                <p className="text-[10px] text-muted-foreground">{isMensual ? "mensual" : "unico"}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-[10px] text-muted-foreground uppercase">Comision vendedor</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{product.commission_pct}%</p>
                <p className="text-[10px] text-muted-foreground">{formatCOP(commissionAmount)} COP/venta</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-[10px] text-muted-foreground uppercase">Neto empresa</p>
                <p className="text-xl font-bold mt-1">{formatCOP(netCompany)} COP</p>
                <p className="text-[10px] text-muted-foreground">Fee plat. 0%</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="text-sm font-semibold mb-3">Descripcion</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || "Sin descripcion."}
            </p>
          </div>

          {/* Pitch */}
          {(product.pitch_one_line || product.pitch_three_lines || product.ideal_client) && (
            <div className="rounded-xl border bg-white p-5 space-y-4">
              {product.pitch_one_line && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Pitch</p>
                  <p className="text-sm font-medium mt-1">"{product.pitch_one_line}"</p>
                </div>
              )}
              {product.pitch_three_lines && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Guion corto</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{product.pitch_three_lines}</p>
                </div>
              )}
              {product.ideal_client && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Cliente ideal</p>
                  <p className="text-sm text-muted-foreground mt-1">{product.ideal_client}</p>
                </div>
              )}
            </div>
          )}

          {/* Objections */}
          {objections.length > 0 && (
            <div className="rounded-xl border bg-white p-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-3">Objeciones ({objections.length})</p>
              <div className="space-y-4">
                {objections.map((obj, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium">"{obj.objection}"</p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">→</span> {obj.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Includes */}
          {((product.features && product.features.length > 0) || (product.not_included && product.not_included.length > 0)) && (
            <div className="rounded-xl border bg-white p-5">
              <h3 className="text-sm font-semibold mb-3">Que incluye</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {product.features && product.features.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase mb-2">Incluye</p>
                    {product.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
                {product.not_included && product.not_included.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-500 uppercase mb-2">No incluye</p>
                    {product.not_included.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materials */}
          {product.sales_material_urls && product.sales_material_urls.length > 0 && (
            <div className="rounded-xl border bg-white p-5">
              <h3 className="text-sm font-semibold mb-3">Materiales de venta</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.sales_material_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="rounded-xl border p-4 text-center hover:bg-gray-50 transition-colors">
                    <Download className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-medium">Material {i + 1}</p>
                    <Download className="w-3 h-3 text-muted-foreground mx-auto mt-1" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OTHER TABS - Placeholder content */}
      {tab === "ventas" && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">{stats.total_sales} ventas registradas</p>
          <p className="text-xs text-muted-foreground mt-1">La tabla de ventas detallada esta en la seccion Ventas del menu</p>
        </div>
      )}

      {tab === "vendedores" && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">{stats.vendor_count} vendedores activos</p>
          <p className="text-xs text-muted-foreground mt-1">Gestiona tus vendedores desde Mi Red</p>
        </div>
      )}

      {tab === "comisiones" && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-sm font-semibold mb-4">Niveles de comision</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Basico</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Publico</span>
              </div>
              <p className="text-2xl font-bold">{product.commission_pct}%</p>
            </div>
            <div className="rounded-xl border p-4 opacity-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Premium</span>
                <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Proximamente</span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">—</p>
            </div>
            <div className="rounded-xl border p-4 opacity-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Elite</span>
                <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Proximamente</span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">—</p>
            </div>
          </div>
        </div>
      )}

      {tab === "entrenamiento" && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-sm font-semibold mb-3">Entrenamiento</h3>
          {product.training_type ? (
            <div className="space-y-2">
              <p className="text-sm">Tipo: <span className="font-medium capitalize">{product.training_type}</span></p>
              {product.training_duration_min > 0 && (
                <p className="text-sm">Duracion: <span className="font-medium">~{product.training_duration_min} min</span></p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin entrenamiento configurado</p>
          )}
        </div>
      )}

      {tab === "cupones" && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Gestiona cupones desde la seccion Cupones</p>
        </div>
      )}

      {tab === "codigos" && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <Key className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Gestiona codigos desde la seccion Codigos</p>
        </div>
      )}

      {tab === "config" && (
        <div className="rounded-xl border bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold">Configuracion</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Estado</p>
              <p className="text-sm font-medium mt-1">{product.active ? "Activo" : "Inactivo"}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Devolucion</p>
              <p className="text-sm font-medium mt-1">{product.refund_window_days} dias - {product.refund_auto ? "Automatica" : "Con aprobacion"}</p>
            </div>
          </div>
          {product.website_url && (
            <a href={product.website_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="w-4 h-4" /> {product.website_url}
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
