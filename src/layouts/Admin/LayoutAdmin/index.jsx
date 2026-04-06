import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Typography, Badge, ConfigProvider } from "antd";
import {
    DashboardOutlined, CalendarOutlined, ShoppingOutlined,
    ShoppingCartOutlined, UserOutlined, LogoutOutlined,
    MenuFoldOutlined, MenuUnfoldOutlined, MedicineBoxOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../../contexts/useAuth";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const PRIMARY = "#f97316";

const PawIcon = ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <ellipse cx="6"    cy="7"  rx="2"   ry="3"   />
        <ellipse cx="18"   cy="7"  rx="2"   ry="3"   />
        <ellipse cx="3.5"  cy="13" rx="1.5" ry="2.5" />
        <ellipse cx="20.5" cy="13" rx="1.5" ry="2.5" />
        <path d="M12 10c-3.5 0-7 2-7 5.5 0 2.5 2 4.5 7 4.5s7-2 7-4.5C19 12 15.5 10 12 10z" />
    </svg>
);

const MENU_ITEMS = [
    { key: "/admin",              icon: <DashboardOutlined />,    label: "Dashboard",       roles: ["Admin","Staff","Doctor"] },
    { key: "/admin/appointments", icon: <CalendarOutlined />,     label: "Lịch hẹn",        roles: ["Admin","Staff","Doctor"] },
    { key: "/admin/orders",       icon: <ShoppingCartOutlined />, label: "Đơn hàng",        roles: ["Admin","Staff"]          },
    { key: "/admin/products",     icon: <ShoppingOutlined />,     label: "Sản phẩm",        roles: ["Admin"]                  },
    { key: "/admin/users",        icon: <UserOutlined />,         label: "Người dùng",      roles: ["Admin"]                  },
];

export default function LayoutAdmin() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, logout } = useAuth();

    const filteredMenu = MENU_ITEMS.filter(m => m.roles.includes(user?.role));

    const menuItems = [
        ...filteredMenu.map(m => ({
            key:   m.key,
            icon:  m.icon,
            label: m.label,
            onClick: () => navigate(m.key),
        })),
        { type: "divider" },
        {
            key:  "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: () => { logout(); navigate("/login"); },
        },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            <Layout style={{ minHeight: "100vh" }}>
                {/* Sidebar */}
                <Sider
                    collapsible collapsed={collapsed} onCollapse={setCollapsed}
                    trigger={null}
                    style={{ background: "#111827", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100, overflowY: "auto" }}
                    width={220}
                >
                    {/* Logo */}
                    <div style={{ padding: collapsed ? "20px 0" : "20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: collapsed ? "0 auto" : 0 }}>
                            <PawIcon size={18} color="#fff" />
                        </div>
                        {!collapsed && (
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", fontFamily: "'Be Vietnam Pro',sans-serif", lineHeight: 1.1 }}>PooGi</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Admin Panel</div>
                            </div>
                        )}
                    </div>

                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", fontFamily: "'Be Vietnam Pro',sans-serif" }}
                        theme="dark"
                    />
                </Sider>

                <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: "margin-left 0.2s" }}>
                    {/* Header */}
                    <Header style={{ background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #f3f4f6", position: "sticky", top: 0, zIndex: 99, height: 64 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div onClick={() => setCollapsed(c => !c)} style={{ cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex" }}>
                                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </div>
                            <Text style={{ fontSize: 13, color: "#9ca3af" }}>
                                {MENU_ITEMS.find(m => m.key === location.pathname)?.label || "Dashboard"}
                            </Text>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/profile")}>
                            {user?.avatar
                                ? <img src={user.avatar} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
                                : <Avatar size={34} style={{ background: PRIMARY, fontWeight: 700, fontSize: 14 }}>{user?.fullName?.charAt(0)}</Avatar>
                            }
                            <div style={{ display: "none", flexDirection: "column" }} className="admin-user-info">
                                <Text style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{user?.fullName}</Text>
                                <Text style={{ fontSize: 11, color: "#9ca3af" }}>{user?.role}</Text>
                            </div>
                        </div>
                    </Header>

                    {/* Content */}
                    <Content style={{ margin: 24, background: "#f9fafb", borderRadius: 16, padding: 24, minHeight: "calc(100vh - 112px)" }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}