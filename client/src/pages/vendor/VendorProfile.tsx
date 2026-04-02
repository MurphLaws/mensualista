import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ShoppingBag, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProfileData {
  user: { id: string; username: string; full_name: string; role: string; created_at: string };
  stats: { total_sales: number; total_commissions: number };
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function VendorProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ProfileData>("/api/vendor/profile")
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const p = profile?.user;
  const s = profile?.stats;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-6">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{getInitials(p?.full_name || user?.full_name || "")}</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">{p?.full_name || user?.full_name}</h1>
          <p className="text-sm text-muted-foreground">@{p?.username || user?.username}</p>
          <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Vendedor</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <ShoppingBag className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{s?.total_sales || 0}</p>
          <p className="text-xs text-muted-foreground">Ventas totales</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <DollarSign className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{formatCOP(s?.total_commissions || 0)}</p>
          <p className="text-xs text-muted-foreground">Comisiones totales</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border divide-y">
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Miembro desde</span>
          <span className="text-sm font-medium">{p?.created_at ? new Date(p.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long" }) : "-"}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Rol</span>
          <span className="text-sm font-medium">Vendedor</span>
        </div>
      </div>

      {/* Logout */}
      <Button onClick={handleLogout} variant="outline" className="w-full">
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar sesion
      </Button>
    </motion.div>
  );
}
