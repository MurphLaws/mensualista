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
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Video background */}
      {/* Cambia esta URL por tu video preferido de Pexels/Pixabay */}
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

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8"
      >
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-lg">M</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center">
          Iniciar sesion
        </h1>
        <p className="text-sm text-white/60 text-center mt-1 mb-6">
          Ingresa tus credenciales para continuar
        </p>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-lg h-10 px-3 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80" htmlFor="password">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contrasena"
              className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-lg h-10 px-3 w-full focus:outline-none focus:ring-2 focus:ring-primary"
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
  );
}
