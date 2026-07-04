import { createContext } from "react";
import type { LoginPayload, RegisterPayload } from "@/features/auth/api/auth.api";
import type { User } from "@/types/user";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
