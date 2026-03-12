import { useState, useEffect } from "react";
import fetchApi from "../utils/fetchApi";
import { AuthContext } from "./AuthContext.js";

// Kiểm tra token ngay lúc khởi tạo state
// → nếu không có token thì loading = false luôn, tránh setLoading trong effect
const hasToken = () => !!localStorage.getItem("token");

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(hasToken); // true nếu có token, false nếu không

    const logout = (redirect = true) => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        setUser(null);
        if (redirect) window.location.href = "/";
    };

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);
        setUser({
            fullName: userData.name,
            email:    userData.email,
            role:     userData.role,
            _id:      userData.id,
        });
    };

    const fetchProfile = async () => {
        setLoading(true);
        const { res, data } = await fetchApi("auth/profile", null, "GET");
        if (res.ok) {
            setUser(data);
        } else {
            logout(false);
        }
        setLoading(false);
    };

    // Chỉ chạy khi có token — không gọi setState ngoài async callback
    useEffect(() => {
        if (!hasToken()) return;
        (async () => {
            const { res, data } = await fetchApi("auth/profile", null, "GET");
            if (res.ok) {
                setUser(data);
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userName");
                setUser(null);
            }
            setLoading(false);
        })();
    }, []);

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
        localStorage.setItem("userName", updatedData.fullName || localStorage.getItem("userName"));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}