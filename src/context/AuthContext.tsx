import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";

export interface User {
  id: string;
  nome: string;
  isProfessor: boolean;
  nivel: "iniciante" | "intermediario" | "avancado";
  telefone: string;
}



interface AuthContextData {
  user: User | null;
  login: (telefone: string, senha: string) => Promise<boolean>;
  loading: boolean;
  logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function restoreSession() {
    try {
      const token = await SecureStore.getItemAsync("auth_token");

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await SecureStore.deleteItemAsync("auth_token");
        return;
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      console.error("[AUTH] Erro ao restaurar sessão:", error);
    } finally {
      setLoading(false);
    }
  }

  restoreSession();
}, []);

  const login = async (
    telefone: string,
    senha: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefone,
          senha,
        }),
      });
      console.log("[AUTH] Status do login:", response.status);

      if (!response.ok) {
        return false;
      }

      const data: {
        token: string;
        user: User;
      } = await response.json();

      console.log("[AUTH] Dados do usuário:", data);
      await SecureStore.setItemAsync("auth_token", data.token);

      
      const token = await SecureStore.getItemAsync("auth_token");
      console.log("[AUTH] Token persistido:", Boolean(token));
      
      setUser(data.user);

      return true;
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      return false;
    }
  };

  const logout = async () => {
  await SecureStore.deleteItemAsync("auth_token");
  setUser(null);
};


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
