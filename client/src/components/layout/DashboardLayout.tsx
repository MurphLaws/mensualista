import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  vendor: "Vendedor",
  admin: "Administrador",
  company: "Empresa",
};

const ROLE_COLORS: Record<string, string> = {
  vendor: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  company: "bg-green-100 text-green-700",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">Mensualista</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.full_name}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                ROLE_COLORS[user?.role || ""]
              }`}
            >
              {ROLE_LABELS[user?.role || ""]}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
