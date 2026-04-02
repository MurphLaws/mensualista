import { NavLink } from "react-router-dom";
import { Home, Package, GraduationCap, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { label: string; icon: LucideIcon; path: string }[] = [
  { label: "Inicio", icon: Home, path: "/vendor" },
  { label: "Productos", icon: Package, path: "/vendor/products" },
  { label: "Ventas", icon: DollarSign, path: "/vendor/sales" },
  { label: "Capacitaciones", icon: GraduationCap, path: "/vendor/trainings" },
  { label: "Perfil", icon: User, path: "/vendor/profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-30 flex items-center justify-around px-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/vendor"}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors", isActive ? "text-primary font-medium" : "text-muted-foreground")
            }
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
