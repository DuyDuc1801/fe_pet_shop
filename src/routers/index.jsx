import LayoutDefault from "../layouts/Client/LayoutDefault";
import LayoutAdmin from "../layouts/Admin/LayoutAdmin";
import Home from "../pages/Client/Home";
import LoginPage from "../pages/Client/Login";
import RegisterPage from "../pages/Client/Register";
import ProfilePage from "../pages/Client/Profile";
import BookingPage from "../pages/Client/Booking";
import MyBookingsPage from "../pages/Client/MyBookings";
import AdminDashboard from "../pages/Admin/Dashboard";
import PrivateRoute from "../components/common/PrivateRoute";
import RoleRoute from "../components/common/RoleRoute";
import AdminAppointments from "../pages/Admin/Appointments";
import ShopPage from "../pages/Client/Shop"; 
import ProductDetail from "../pages/Client/ProductDetail"; 
import CartPage from "../pages/Client/Cart"; 
import CheckoutPage from "../pages/Client/Checkout";
import MyOrdersPage from "../pages/Client/MyOrders";
import DoctorsPage from "../pages/Client/Doctors";
import DoctorDetail from "../pages/Client/DoctorDetail";
import ServicesPage from "../pages/Client/Services";
import ServiceDetail from "../pages/Client/ServiceDetail";
import AdminProducts from "../pages/Admin/Products";
import AdminOrders from "../pages/Admin/Orders";
import AdminUsers from "../pages/Admin/Users";
import AIDiagnosisPage from "../pages/Client/AIDiagnosis";
import DoctorDashboard from "../pages/Doctor/Dashboard";
import DoctorScheduleModel from "../pages/Doctor/Schedule";

export const routers = [
  // Client layout 
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "san-pham", element: <ShopPage /> },
      { path: "san-pham", element: <ShopPage /> },
      { path: "san-pham/:id", element: <ProductDetail /> },
      { path: "bac-si", element: <DoctorsPage /> },
      { path: "bac-si/:id", element: <DoctorDetail /> },
      { path: "dich-vu", element: <ServicesPage />  },
      { path: "dich-vu/:id", element: <ServiceDetail /> },
      { 
        path: "gio-hang", 
        element: <PrivateRoute><CartPage /></PrivateRoute>      
      },
      {
        path: "profile",
        element: <PrivateRoute><ProfilePage /></PrivateRoute>,
      },
      {
        path: "dat-lich-kham",
        element: <PrivateRoute><BookingPage /></PrivateRoute>,
      },
      {
        path: "lich-cua-toi",
        element: <PrivateRoute><MyBookingsPage /></PrivateRoute>,
      },
      { 
        path: "thanh-toan",
        element: <PrivateRoute><CheckoutPage /></PrivateRoute>
      },
      { 
        path: "don-hang-cua-toi", 
        element: <PrivateRoute><MyOrdersPage /></PrivateRoute>
      },
      { 
        path: "ai-chan-doan",
        element: <PrivateRoute><AIDiagnosisPage /></PrivateRoute> 
      }
    ],
  },

  //Admin layout
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
        element: <AdminAppointments />,
      },
      { 
        path: "products", 
        element: <AdminProducts /> 
      },
      { 
        path: "orders", 
        element: <AdminOrders /> 
      },
      { 
        path: "users", 
        element: <RoleRoute roles={["Admin"]}><AdminUsers /></RoleRoute> 
      }, 
      { 
        path: "doctor/dashboard", 
        element: <RoleRoute roles={["Doctor"]}><DoctorDashboard /></RoleRoute> 
      },
      { 
        path: "doctor/schedule",  
        element: <RoleRoute roles={["Doctor"]}><DoctorScheduleModel /></RoleRoute>  
      },  
    ],
  },

  // --- 404 ----
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