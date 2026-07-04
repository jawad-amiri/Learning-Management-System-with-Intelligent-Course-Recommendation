import { useEffect, useState, type ReactNode } from "react";
import { getErrorMessage, setUnauthorizedHandler } from "@/services/api";
import {
  loginRequest,
  meRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from "@/features/auth/api/auth.api";
import type { User } from "@/types/user";
import { AuthContext } from "@/features/auth/context/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const nextUser = await meRequest();
      setUser(nextUser);
      return nextUser;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem("token");
      setUser(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    try {
      const data = await loginRequest(payload);

      localStorage.setItem("token", data.token);
      const nextUser = await meRequest();
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      await registerRequest(payload);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
