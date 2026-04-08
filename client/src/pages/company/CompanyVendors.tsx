import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Star, CheckCircle2, BookOpen, Clock, Plus, Copy,
  Lightbulb, Crown, ShoppingCart, DollarSign, TrendingUp, Package, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/dashboard/Modal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { toast } from "sonner";

interface Vendor {
  id: string;
  full_name: string;
  username: string;
  total_sales: number;
  total_commission: number;
  created_at: string;
}

const tutorialSteps = [
  {
    title: "Tu red de vendedores",
    description: "Aqui ves todos los vendedores que estan vendiendo tus servicios. Puedes ver sus metricas, nivel de comision, y progreso de capacitacion.",
  },
  {
    title: "Invita vendedores",
    description: "Comparte tu enlace de invitacion para que nuevos vendedores se unan a tu red y empiecen a vender tus productos.",
  },
  {
    title: "Monitorea metricas",
    description: "Revisa las ventas, GMV y rendimiento de cada vendedor. Identifica a tus mejores vendedores y apoya a los que necesitan ayuda.",
  },
  {
    title: "Gestiona comisiones",
    description: "Asigna niveles de comision personalizados. Premia a los vendedores top con mejores tasas para motivar mas ventas.",
  },
];

type FilterType = "todos" | "activos" | "entrenando" | "inactivos";

function getVendorStatus(v: Vendor): "top" | "activo" | "entrenando" | "inactivo" {
  if (v.total_sales >= 3) return "top";
  if (v.total_sales > 0) return "activo";
  return "inactivo";
}

const statusConfig = {
  top: { label: "Top", cls: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Star },
  activo: { label: "Activo", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  entrenando: { label: "Entrenando", cls: "bg-blue-500/10 text-blue-600 border-blue-200", icon: BookOpen },
  inactivo: { label: "Inactivo", cls: "bg-gray-100 text-gray-500 border-gray-200", icon: Clock },
};

export default function CompanyVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const [showTutorial, setShowTutorial] = useState(() =>
    localStorage.getItem("mi-red-tutorial-dismissed") !== "true"
  );
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    api.get<{ vendors: Vendor[] }>("/api/company/vendors")
      .then(data => setVendors(data.vendors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("mi-red-tutorial-dismissed", "true");
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) setTutorialStep(s => s + 1);
    else dismissTutorial();
  };

  const vendorsWithStatus = vendors.map(v => ({ ...v, status: getVendorStatus(v) }));

  const filteredVendors = vendorsWithStatus.filter(v => {
    const matchesSearch = v.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "todos") return true;
    if (filter === "activos") return v.status === "top" || v.status === "activo";
    if (filter === "entrenando") return v.status === "entrenando";
    if (filter === "inactivos") return v.status === "inactivo";
    return true;
  }).sort((a, b) => b.total_sales - a.total_sales);

  const activeCount = vendorsWithStatus.filter(v => v.status === "top" || v.status === "activo").length;

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: "todos", label: "Todos", count: vendorsWithStatus.length },
    { id: "activos", label: "Activos", count: activeCount },
    { id: "entrenando", label: "Entrenando", count: vendorsWithStatus.filter(v => v.status === "entrenando").length },
    { id: "inactivos", label: "Inactivos", count: vendorsWithStatus.filter(v => v.status === "inactivo").length },
  ];

  const inviteLink = "https://app.mensualista.com/join/demo";
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Enlace copiado");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Tutorial Stepper */}
      {showTutorial && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex gap-1 mb-4">
            {tutorialSteps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                i <= tutorialStep ? "bg-primary" : "bg-gray-200"
              }`} />
            ))}
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                Paso {tutorialStep + 1} de {tutorialSteps.length}
              </p>
              <h3 className="text-sm font-bold mb-1">{tutorialSteps[tutorialStep].title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tutorialSteps[tutorialStep].description}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={dismissTutorial} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                  Saltar tutorial
                </button>
                <Button size="sm" className="h-7 text-xs px-4" onClick={nextTutorialStep}>
                  {tutorialStep < tutorialSteps.length - 1 ? "Siguiente" : "Entendido"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mi Red</h1>
          <p className="text-sm text-muted-foreground">
            {vendors.length} vendedores · {activeCount} activos este mes
          </p>
        </div>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <Plus className="w-4 h-4 mr-1" /> Invitar vendedor
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Buscar vendedor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVendors.map(vendor => {
            const sc = statusConfig[vendor.status];
            const nameParts = (vendor.full_name || vendor.username).split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ");
            const initials = nameParts.map(n => n[0]).join("").toUpperCase().slice(0, 2);
            const isTop = vendor.status === "top";
            const isPremium = vendor.total_sales >= 5;
            const StatusIcon = sc.icon;

            return (
              <div
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor)}
                className="rounded-xl border bg-white p-5 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all text-center"
              >
                {/* Avatar */}
                <div className="relative inline-block mb-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isTop ? "bg-amber-100 ring-2 ring-amber-300" : "bg-primary/10"
                  }`}>
                    <span className={`text-lg font-bold ${isTop ? "text-amber-600" : "text-primary"}`}>
                      {initials}
                    </span>
                  </div>
                  <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    vendor.total_sales > 0 ? "bg-emerald-500" : "bg-gray-300"
                  }`} />
                </div>

                {/* Name */}
                <p className="text-sm font-semibold">{firstName}</p>
                {lastName && <p className="text-xs text-muted-foreground">{lastName}</p>}

                {/* Badges */}
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.cls}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {sc.label}
                  </span>
                  {isPremium && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-purple-50 text-purple-600 border-purple-200">
                      <Crown className="w-2.5 h-2.5" />
                      Premium
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="text-center flex-1">
                    <p className="text-base font-bold">{vendor.total_sales}</p>
                    <p className="text-[9px] text-muted-foreground">ventas</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-base font-bold text-primary">{formatCOP(vendor.total_commission)}</p>
                    <p className="text-[9px] text-muted-foreground">GMV</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={searchQuery ? "Sin resultados" : "Sin vendedores"}
          description={searchQuery ? "Prueba otra busqueda" : "Invita al primer vendedor para empezar"}
        />
      )}

      {/* Vendor Detail Modal */}
      <Modal open={!!selectedVendor} onClose={() => setSelectedVendor(null)} title="Detalle del vendedor">
        {selectedVendor && (() => {
          const sc = statusConfig[getVendorStatus(selectedVendor)];
          const StatusIcon = sc.icon;
          const initials = (selectedVendor.full_name || selectedVendor.username)
            .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedVendor.full_name || selectedVendor.username}</p>
                  <p className="text-xs text-muted-foreground">@{selectedVendor.username}</p>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border mt-1 ${sc.cls}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {sc.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: ShoppingCart, label: "Total ventas", value: String(selectedVendor.total_sales) },
                  { icon: DollarSign, label: "Comision total", value: formatCOP(selectedVendor.total_commission) },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    </div>
                    <p className="text-sm font-bold">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Miembro desde {new Date(selectedVendor.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" })}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invitar vendedor">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Enlace de invitacion</label>
            <div className="flex gap-2">
              <input value={inviteLink} readOnly className="flex-1 rounded-lg border px-3 py-2 text-xs font-mono bg-gray-50" />
              <Button size="sm" variant="outline" onClick={copyInviteLink}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">O invita por email</label>
            <input
              placeholder="vendedor@email.com"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button className="w-full" onClick={() => { setShowInvite(false); toast.success("Invitacion enviada"); }}>
            Enviar invitacion
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
