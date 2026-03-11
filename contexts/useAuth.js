import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
    return ctx;
}