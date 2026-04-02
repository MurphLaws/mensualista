import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-lg">Mensualista</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {getInitials(user?.full_name || "")}
            </span>
          </div>
          <span className="text-sm font-medium hidden sm:block">{user?.full_name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
