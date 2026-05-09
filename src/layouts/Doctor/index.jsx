import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Typography, ConfigProvider, Badge } from "antd";
import {
    DashboardOutlined, CalendarOutlined, ScheduleOutlined,
    LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
    StarOutlined, HomeOutlined,
    FileTextOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/useAuth";
import PoogiIcon from "../../components/common/IconPoogi";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const DOCTOR_COLOR = "#0ea5e9"; // màu xanh dương cho doctor


// Menu chỉ dành cho Doctor
const MENU_ITEMS = [
    { key: "/doctor", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/doctor/appointments", icon: <CalendarOutlined />, label: "Lịch hẹn của tôi" },
    { key: "/doctor/leave-request", icon: <FileTextOutlined />, label: "Yêu cầu nghỉ phép"},
    { key: "/doctor/profile", icon: <UserOutlined />, label: "Hồ sơ của tôi" }
];

export default function LayoutDoctor() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate   = useNavigate();
    const location   = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        ...MENU_ITEMS.map(m => ({
            key:     m.key,
            icon:    m.icon,
            label:   m.label,
            onClick: () => navigate(m.key),
        })),
        { type: "divider" },
        {
            key:     "home",
            icon:    <HomeOutlined />,
            label:   "Về trang chủ",
            onClick: () => navigate("/"),
        },
        {
            key:     "logout",
            icon:    <LogoutOutlined />,
            label:   "Đăng xuất",
            danger:  true,
            onClick: () => { logout(); navigate("/login"); },
        },
    ];

    // Sắp xếp ưu tiên các key dài trước để tránh bị nuốt bởi thư mục cha (/doctor)
    const currentLabel = [...MENU_ITEMS]
        .sort((a, b) => b.key.length - a.key.length)
        .find(m => 
            location.pathname === m.key || location.pathname.startsWith(m.key + "/")
        )?.label || "Dashboard";

    return (
        <ConfigProvider theme={{ token: { colorPrimary: DOCTOR_COLOR, fontFamily: "'Be Vietnam Pro',sans-serif" } }}>
            <Layout style={{ minHeight: "100vh" }}>
                {/* ── Sidebar ── */}
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} trigger={null}
                    style={{ background: "#0c1a2e", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100, overflowY: "auto" }}
                    width={230}>

                    {/* Logo */}
                    <div style={{ padding: collapsed ? "18px 0" : "18px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: DOCTOR_COLOR, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: collapsed ? "0 auto" : 0 }}>
                            <PoogiIcon size={20} color="#fff" />
                        </div>
                        {!collapsed && (
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1.1 }}>PooGi</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Doctor Portal</div>
                            </div>
                        )}
                    </div>

                    {/* Doctor info card */}
                    {!collapsed && (
                        <div style={{ margin: "0 12px 8px", padding: "10px 12px", background: "rgba(14,165,233,0.12)", borderRadius: 10, border: "1px solid rgba(14,165,233,0.25)" }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Xin chào, bác sĩ</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>BS. {user?.fullName}</div>
                            <div style={{ fontSize: 11, color: DOCTOR_COLOR, marginTop: 2 }}>👨‍⚕️ Bác sĩ thú y</div>
                        </div>
                    )}

                    <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems}
                        style={{ background: "transparent", border: "none" }} theme="dark" />
                </Sider>

                <Layout style={{ marginLeft: collapsed ? 80 : 230, transition: "margin-left 0.2s" }}>
                    {/* ── Header ── */}
                    <Header style={{ background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #f3f4f6", position: "sticky", top: 0, zIndex: 99, height: 64 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div onClick={() => setCollapsed(c => !c)} style={{ cursor: "pointer", fontSize: 18, color: "#6b7280" }}>
                                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </div>
                            <div style={{ width: 3, height: 20, background: DOCTOR_COLOR, borderRadius: 2 }} />
                            <Text style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{currentLabel}</Text>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/doctor/profile")}>
                            {user?.avatar
                                ? <img src={user.avatar} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `2px solid ${DOCTOR_COLOR}` }} />
                                : <Avatar size={34} style={{ background: DOCTOR_COLOR, fontWeight: 700 }}>{user?.fullName?.charAt(0)}</Avatar>
                            }
                            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, justifyContent: "center" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>BS. {user?.fullName}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{user?.email}</div>
                            </div>
                        </div>
                    </Header>

                    {/* ── Content ── */}
                    <Content style={{ margin: 24, background: "#f0f9ff", borderRadius: 16, padding: 24, minHeight: "calc(100vh - 112px)" }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}