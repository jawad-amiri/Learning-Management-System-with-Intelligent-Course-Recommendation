// NEW - PROFILE PHOTO FEATURE: keeps the auth hook separate for clean Fast Refresh.
import { useContext } from "react";
import { AuthContext } from "@/features/auth/context/auth-context";

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
