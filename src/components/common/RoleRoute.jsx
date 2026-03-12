import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/useAuth";
import { Result, Button } from "antd";
import { Spin } from "antd";

/**
 * RoleRoute — chỉ cho phép các role được chỉ định
 *
 * Dùng:
 *   <Route path="/admin/*" element={
 *     <RoleRoute roles={["Admin"]}>
 *       <LayoutAdmin />
 *     </RoleRoute>
 *   } />
 *
 *   <Route path="/doctor/*" element={
 *     <RoleRoute roles={["Admin", "Doctor"]}>
 *       <DoctorDashboard />
 *     </RoleRoute>
 *   } />
 */
export default function RoleRoute({ children, roles = [] }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    // Chưa đăng nhập
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Đã đăng nhập nhưng không đủ quyền
    if (!roles.includes(user.role)) {
        return (
            <Result
                status="403"
                title="403 - Không có quyền truy cập"
                subTitle={`Trang này yêu cầu quyền: ${roles.join(', ')}. Tài khoản của bạn là: ${user.role}`}
                extra={
                    <Button type="primary" onClick={() => window.location.href = "/"} style={{ background: "#f97316", borderColor: "#f97316" }}>
                        Về trang chủ
                    </Button>
                }
            />
        );
    }

    return children;
}