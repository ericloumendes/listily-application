import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { connection_urls } from "../config/api";

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from SecureStore on startup
    const loadToken = async () => {
      const savedToken = await SecureStore.getItemAsync("jwt");
      if (savedToken) setToken(savedToken);
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const res = await fetch(`${connection_urls.BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      const jwt = data.token;

      await SecureStore.setItemAsync("jwt", jwt);
      setToken(jwt);
      router.replace("/(tabs)"); // ✅ go to main app after login
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("jwt");
    setToken(null);
    router.replace("/login"); // ✅ back to login
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}
