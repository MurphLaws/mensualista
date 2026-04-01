import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ROLE_HOME: Record<string, string> = {
  vendor: "/vendor",
  admin: "/admin",
  company: "/company",
};

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) return;

    setLoading(true);
    try {
      const role = await signIn(username, password);
      toast.success(`Bienvenido, ${username}`);
      navigate(ROLE_HOME[role] || "/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — white form panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold">Mensualista</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold">Iniciar sesion</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
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
                placeholder="usuario"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                placeholder="contrasena"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white h-10 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Right — video panel with purple overlay */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Purple overlay */}
        <div className="absolute inset-0 bg-primary/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-900/70" />

        {/* Brand text */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center text-white space-y-4 max-w-md px-8">
            <h2 className="text-4xl font-bold">Mensualista</h2>
            <p className="text-lg text-white/80">
              Plataforma de distribucion y comisiones para servicios SaaS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
