import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Bug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_HOME: Record<string, string> = {
  vendor: "/vendor",
  admin: "/admin",
  company: "/company",
};

const QUICK_LOGINS = [
  { username: "vendor", label: "Vendedor", color: "bg-blue-500 hover:bg-blue-600" },
  { username: "admin", label: "Admin", color: "bg-purple-500 hover:bg-purple-600" },
  { username: "empresa", label: "Empresa", color: "bg-green-500 hover:bg-green-600" },
];

function DebugPanelInner() {
  const [open, setOpen] = useState(false);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (username: string) => {
    try {
      const role = await signIn(username, "123");
      toast.success(`Bienvenido, ${username}`);
      navigate(ROLE_HOME[role] || "/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesion");
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-foreground/80 text-white opacity-40 hover:opacity-100 transition-opacity"
      >
        <Bug className="h-4 w-4" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-16 right-4 z-50 bg-white rounded-xl shadow-2xl border p-4 w-64"
          >
            <p className="text-sm font-semibold mb-3">Debug Panel</p>

            {/* Auth status */}
            <p className="text-xs text-muted-foreground">
              {user
                ? `${user.role} — ${user.full_name || user.username}`
                : "Sin sesion"}
            </p>

            <div className="border-t my-2" />

            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Acceso rapido
            </p>

            <div className="flex flex-col gap-1.5">
              {QUICK_LOGINS.map((q) => (
                <button
                  key={q.username}
                  onClick={() => handleQuickLogin(q.username)}
                  className={`w-full h-8 rounded-md text-xs font-medium text-white transition-colors ${q.color}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function DebugPanel() {
  if (!import.meta.env.DEV) return null;
  return <DebugPanelInner />;
}
