import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (user?: string, pass?: string) => {
    const u = user || username;
    const p = pass || password;
    if (!u || !p) return;

    setLoading(true);
    try {
      const role = await signIn(u, p);
      toast.success(`Bienvenido, ${u}`);
      navigate(ROLE_HOME[role] || "/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Iniciar sesion</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vendor, admin o empresa"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center w-full h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Acceso rapido
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LOGINS.map((q) => (
                <button
                  key={q.username}
                  onClick={() => handleLogin(q.username, "123")}
                  disabled={loading}
                  className={`h-9 rounded-md text-white text-xs font-medium ${q.color} disabled:opacity-50 transition-colors`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Brand panel */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="text-center text-white space-y-4 max-w-md">
          <h2 className="text-4xl font-bold">Mensualista</h2>
          <p className="text-lg text-white/80">
            Plataforma de distribucion y comisiones para servicios SaaS
          </p>
        </div>
      </div>
    </div>
  );
}
