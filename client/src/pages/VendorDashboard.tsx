import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag } from "lucide-react";

export default function VendorDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold">
          Hola, {user?.full_name}
        </h1>
        <div className="rounded-xl border bg-card p-12 text-center space-y-4">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h2 className="text-lg font-semibold text-muted-foreground">
            Panel del Vendedor
          </h2>
          <p className="text-sm text-muted-foreground">
            No hay datos todavia. Cuando se configuren servicios y ventas, aparecerán aqui.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
