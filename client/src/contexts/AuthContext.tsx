import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getToken, setToken, clearToken } from "@/lib/api";

type AppRole = "vendor" | "admin" | "company";

interface AuthUser {
  id: string;
  username: string;
  role: AppRole;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<AppRole>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => "vendor",
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api
        .get<MeResponse>("/api/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => {
          clearToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    const data = await api.post<LoginResponse>("/api/auth/login", {
      username,
      password,
    });
    setToken(data.token);
    setUser(data.user);
    return data.user.role;
  };

  const signOut = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
