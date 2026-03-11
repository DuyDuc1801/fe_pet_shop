import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    Layout, Menu, Avatar, Typography, Dropdown, ConfigProvider,
    Button, Badge,
} from "antd";
import {
    DashboardOutlined, CalendarOutlined, ShoppingOutlined,
    UserOutlined, ShoppingCartOutlined, MenuFoldOutlined,
    MenuUnfoldOutlined, LogoutOutlined, SettingOutlined,
    BellOutlined, FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/useAuth";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const PRIMARY = "#f97316";

const PawIcon = ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <ellipse cx="6" cy="7" rx="2" ry="3" />
        <ellipse cx="18" cy="7" rx="2" ry="3" />
        <ellipse cx="3.5" cy="13" rx="1.5" ry="2.5" />
        <ellipse cx="20.5" cy="13" rx="1.5" ry="2.5" />
        <path d="M12 10c-3.5 0-7 2-7 5.5 0 2.5 2 4.5 7 4.5s7-2 7-4.5C19 12 15.5 10 12 10z" />
    </svg>
);

const NAV_ITEMS = [
    {
        key: "/admin",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        roles: ["Admin", "Staff"],
    },
    {
        key: "/admin/appointments",
        icon: <CalendarOutlined />,
        label: "Lịch hẹn",
        roles: ["Admin", "Staff", "Doctor"],
    },
    {
        key: "/admin/products",
        icon: <ShoppingOutlined />,
        label: "Sản phẩm",
        roles: ["Admin", "Staff"],
    },
    {
        key: "/admin/orders",
        icon: <ShoppingCartOutlined />,
        label: "Đơn hàng",
        roles: ["Admin", "Staff"],
    },
    {
        key: "/admin/users",
        icon: <UserOutlined />,
        label: "Người dùng",
        roles: ["Admin"],
    },
];

export default function LayoutAdmin() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Chỉ hiển thị menu items phù hợp role
    const visibleItems = NAV_ITEMS.filter(item =>
        item.roles.includes(user?.role)
    );

    const selectedKey = visibleItems
        .slice()
        .reverse()
        .find(item => location.pathname.startsWith(item.key))?.key || "/admin";

    const userMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Hồ sơ cá nhân",
            onClick: () => navigate("/profile"),
        },
        { type: "divider" },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: logout,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: PRIMARY,
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    borderRadius: 10,
                },
                components: {
                    Menu: {
                        itemColor: "#9ca3af",
                        itemHoverColor: "#fff",
                        itemSelectedColor: "#fff",
                        itemSelectedBg: "rgba(249,115,22,.18)",
                        itemHoverBg: "rgba(255,255,255,.08)",
                        itemBg: "transparent",
                        subMenuItemBg: "transparent",
                    },
                },
            }}
        >
            <Layout style={{ minHeight: "100vh" }}>
                {/* ── Sidebar ── */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={240}
                    style={{ background: "#1a1a2e", position: "fixed", height: "100vh", left: 0, top: 0, zIndex: 100 }}
                >
                    {/* Logo */}
                    <div style={{
                        height: 64, display: "flex", alignItems: "center",
                        padding: collapsed ? "0 20px" : "0 24px",
                        borderBottom: "1px solid rgba(255,255,255,.06)",
                        overflow: "hidden", transition: "all .3s",
                    }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <PawIcon size={18} color="#fff" />
                        </div>
                        {!collapsed && (
                            <Text style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginLeft: 12, fontFamily: "'Playfair Display', serif", whiteSpace: "nowrap" }}>
                                PooGi
                            </Text>
                        )}
                    </div>

                    {/* Navigation */}
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        onSelect={({ key }) => navigate(key)}
                        style={{ border: "none", marginTop: 12, background: "transparent" }}
                        items={visibleItems.map(item => ({
                            key: item.key,
                            icon: item.icon,
                            label: item.label,
                            style: { borderRadius: 10, margin: "2px 12px", width: "calc(100% - 24px)" },
                        }))}
                    />

                    {/* Bottom: go to site */}
                    {!collapsed && (
                        <div style={{ position: "absolute", bottom: 24, left: 12, right: 12 }}>
                            <Button
                                block ghost
                                onClick={() => navigate("/")}
                                style={{ borderRadius: 10, borderColor: "rgba(255,255,255,.15)", color: "#9ca3af", fontSize: 13 }}
                            >
                                ← Về trang chủ
                            </Button>
                        </div>
                    )}
                </Sider>

                {/* ── Main content ── */}
                <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: "margin-left .3s" }}>
                    {/* Header */}
                    <Header style={{
                        background: "#fff", padding: "0 24px", height: 64,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        boxShadow: "0 1px 8px rgba(0,0,0,.06)", position: "sticky", top: 0, zIndex: 99,
                    }}>
                        <Button
                            type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: 18, color: "#374151" }}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Badge count={3} color={PRIMARY}>
                                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} style={{ color: "#374151" }} />
                            </Badge>

                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 12px", borderRadius: 10, transition: "background .2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <Avatar style={{ background: PRIMARY, fontWeight: 700 }} size={34}>
                                        {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                                    </Avatar>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1c1c", lineHeight: 1.2 }}>{user?.fullName}</div>
                                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{user?.role}</div>
                                    </div>
                                </div>
                            </Dropdown>
                        </div>
                    </Header>

                    {/* Page content */}
                    <Content style={{ margin: 24, minHeight: "calc(100vh - 112px)" }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}