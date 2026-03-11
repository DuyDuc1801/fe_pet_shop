import LayoutDefault from "../layouts/Client/LayoutDefault";
import LayoutAdmin from "../layouts/Admin/LayoutAdmin";
import Home from "../pages/Client/Home";
import LoginPage from "../pages/Client/Login";
import RegisterPage from "../pages/Client/Register";
import ProfilePage from "../pages/Client/Profile";
import AdminDashboard from "../pages/Admin/Dashboard";
import PrivateRoute from "../components/common/PrivateRoute";
import RoleRoute from "../components/common/RoleRoute";

export const routers = [
  // ── Client layout ──────────────────────────────────────────────
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      { index: true, element: <Home /> },
      { path: "login",    element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      // Protected: cần đăng nhập
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "lich-cua-toi",
        element: (
          <PrivateRoute>
            {/* Tuần 2 sẽ thêm MyBookings */}
            <div style={{ padding: 40, textAlign: "center" }}>🗓️ Lịch của tôi — Coming tuần 2</div>
          </PrivateRoute>
        ),
      },
      {
        path: "dat-lich-kham",
        element: (
          <PrivateRoute>
            {/* Tuần 2 */}
            <div style={{ padding: 40, textAlign: "center" }}>📅 Đặt lịch khám — Coming tuần 2</div>
          </PrivateRoute>
        ),
      },
      {
        path: "gio-hang",
        element: (
          <PrivateRoute>
            {/* Tuần 4 */}
            <div style={{ padding: 40, textAlign: "center" }}>🛒 Giỏ hàng — Coming tuần 4</div>
          </PrivateRoute>
        ),
      },
    ],
  },

  // ── Admin layout ───────────────────────────────────────────────
  {
    path: "/admin",
    element: (
      <RoleRoute roles={["Admin", "Staff", "Doctor"]}>
        <LayoutAdmin />
      </RoleRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      {
        path: "appointments",
        element: (
          // Tuần 3
          <div style={{ padding: 20, textAlign: "center" }}>📅 Quản lý lịch hẹn — Coming tuần 3</div>
        ),
      },
      {
        path: "products",
        element: (
          // Tuần 6
          <div style={{ padding: 20, textAlign: "center" }}>📦 Quản lý sản phẩm — Coming tuần 6</div>
        ),
      },
      {
        path: "orders",
        element: (
          // Tuần 6
          <div style={{ padding: 20, textAlign: "center" }}>🛒 Quản lý đơn hàng — Coming tuần 6</div>
        ),
      },
      {
        path: "users",
        element: (
          <RoleRoute roles={["Admin"]}>
            {/* Tuần 6 */}
            <div style={{ padding: 20, textAlign: "center" }}>👥 Quản lý người dùng — Coming tuần 6</div>
          </RoleRoute>
        ),
      },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────────
  {
    path: "*",
    element: (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <div style={{ fontSize: 80 }}>🐾</div>
        <h2 style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>404 — Trang không tồn tại</h2>
        <a href="/" style={{ color: "#f97316" }}>← Về trang chủ</a>
      </div>
    ),
  },
];