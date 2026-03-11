import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Spin } from "antd";

/**
 * PrivateRoute — bảo vệ route cần đăng nhập
 *
 * Dùng:
 *   <Route path="/lich-cua-toi" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
 */
export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        // Lưu lại URL để sau login redirect về đúng trang
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}