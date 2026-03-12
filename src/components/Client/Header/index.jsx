import { useEffect, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import {
    PhoneOutlined, MailOutlined, CalendarOutlined, HeartOutlined,
    ShoppingOutlined, ShoppingCartOutlined, MenuOutlined, UserOutlined,
    LogoutOutlined, SettingOutlined, DashboardOutlined,
} from "@ant-design/icons";
import { Menu, Button, Badge, Drawer, Space, Divider, ConfigProvider, Grid, Layout, Avatar, Dropdown } from "antd";
import { useAuth } from "../../../../contexts/useAuth";

const { useBreakpoint } = Grid;
const PRIMARY = "#f97316";
const { Header: AntHeader } = Layout;

function TopBar() {
    return (
        <div style={{ background: PRIMARY, padding: "6px 24px", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
                { icon: <PhoneOutlined />, text: "1900 1234  (7:00 – 21:00)", href: "tel:19001234" },
                { icon: <MailOutlined />, text: "hello@poogi.vn", href: "mailto:hello@poogi.vn" },
            ].map((item) => (
                <a key={item.href} href={item.href}
                    style={{ color: "#fff", fontSize: 13, display: "flex", alignItems: "center", gap: 6, textDecoration: "none", opacity: 0.92, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    {item.icon} {item.text}
                </a>
            ))}
        </div>
    );
}

// ── AuthButton — đặt NGOÀI Header để tránh lỗi "created during render" ──
function AuthButton({ user, navigate, setDrawerOpen, screens, userDropdownItems, block = false }) {
    if (user) {
        return (
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" trigger={["click"]}>
                <div
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 10px", borderRadius: 10, transition: "border-color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = PRIMARY}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
                >
                    {screens.md && (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Be Vietnam Pro', sans-serif", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.fullName}
                        </span>
                    )}
                    <Avatar size={28} style={{ background: PRIMARY, fontSize: 13, fontWeight: 700 }}>
                        {user.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                </div>
            </Dropdown>
        );
    }
    return (
        <Button
            icon={<UserOutlined />} block={block}
            onClick={() => { navigate("/login"); setDrawerOpen(false); }}
            style={{ borderRadius: 10, height: 44, border: `1.5px solid ${PRIMARY}`, color: PRIMARY, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif" }}
        >
            Đăng nhập
        </Button>
    );
}

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const screens = useBreakpoint();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navItems = [
        { key: "/", label: "Trang chủ" },
        { key: "/dat-lich-kham", label: "Đặt lịch khám", icon: <CalendarOutlined /> },
        { key: "/san-pham", label: "Cửa hàng", icon: <ShoppingOutlined /> },
        { key: "/dich-vu", label: "Dịch vụ", icon: <HeartOutlined /> },
        { key: "/tin-tuc", label: "Tin tức" },
        { key: "/lien-he", label: "Liên hệ" },
    ];

    const selectedKey =
        navItems.find((n) => n.key !== "/" && location.pathname.startsWith(n.key))?.key ||
        (location.pathname === "/" ? "/" : "");

    // Dropdown menu cho user đã đăng nhập
    const userDropdownItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Hồ sơ cá nhân",
            onClick: () => navigate("/profile"),
        },
        {
            key: "my-bookings",
            icon: <CalendarOutlined />,
            label: "Lịch hẹn của tôi",
            onClick: () => navigate("/lich-cua-toi"),
        },
        ...(user?.role && ["Admin", "Staff", "Doctor"].includes(user.role) ? [{
            key: "admin",
            icon: <DashboardOutlined />,
            label: "Trang quản trị",
            onClick: () => navigate("/admin"),
        }] : []),
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
        <>
            <div className={`paw-header-wrap${scrolled ? " scrolled" : ""}`}>
                <TopBar />
                <AntHeader style={{
                    background: scrolled ? "#fff" : "rgba(255,255,255,.97)",
                    padding: "0 24px", height: 72,
                    display: "flex", alignItems: "center", gap: 16,
                    transition: "all .35s", justifyContent: "space-between",
                    boxShadow: "0 4px 15px rgba(0,0,0,.08)",
                    borderBottom: scrolled ? "none" : "1px solid rgba(0,0,0,.05)"
                }}>
                    {screens.lg && (
                        <ConfigProvider theme={{ components: { Menu: { itemColor: "#374151", itemHoverColor: PRIMARY, itemSelectedColor: PRIMARY, itemSelectedBg: "rgba(249,115,22,.09)", horizontalItemSelectedColor: PRIMARY, fontSize: 14.5 } } }}>
                            <Menu
                                className="paw-nav"
                                mode="horizontal"
                                selectedKeys={[selectedKey]}
                                onSelect={({ key }) => navigate(key)}
                                style={{ background: "transparent", border: "none", fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500 }}
                                items={navItems.map((n) => ({ key: n.key, icon: n.icon, label: n.label }))}
                            />
                        </ConfigProvider>
                    )}

                    <Space size={"large"}>
                        <Badge count={3} color={PRIMARY}>
                            <Button
                                icon={<ShoppingCartOutlined style={{ fontSize: 17 }} />}
                                onClick={() => navigate("/gio-hang")}
                                style={{ borderRadius: 10, width: 42, height: 42, border: "1.5px solid #e5e7eb", color: "#374151" }}
                            />
                        </Badge>

                        {screens.md && (
                            <Button
                                type="primary" icon={<CalendarOutlined />}
                                onClick={() => navigate("/dat-lich-kham")}
                                style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 10, height: 42, fontWeight: 600, boxShadow: "0 4px 14px rgba(249,115,22,.28)", fontFamily: "'Be Vietnam Pro', sans-serif" }}
                            >
                                Đặt lịch ngay
                            </Button>
                        )}

                        <AuthButton user={user} navigate={navigate} setDrawerOpen={setDrawerOpen} screens={screens} userDropdownItems={userDropdownItems} />

                        {!screens.lg && (
                            <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)}
                                style={{ borderRadius: 10, height: 42, border: "1.5px solid #e5e7eb", color: "#374151" }} />
                        )}
                    </Space>
                </AntHeader>
            </div>

            {/* Mobile Drawer */}
            <Drawer title={null} placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 16 } }}>
                {navItems.map((item) => (
                    <NavLink key={item.key} to={item.key} end={item.key === "/"} className="paw-drawer-link" onClick={() => setDrawerOpen(false)}>
                        {item.icon} {item.label}
                    </NavLink>
                ))}
                <Divider style={{ margin: "16px 0" }} />
                <AuthButton user={user} navigate={navigate} setDrawerOpen={setDrawerOpen} screens={screens} userDropdownItems={userDropdownItems} block />
                <Button type="primary" icon={<CalendarOutlined />} block size="large"
                    onClick={() => { navigate("/dat-lich-kham"); setDrawerOpen(false); }}
                    style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 12, fontWeight: 600, marginTop: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}
                >
                    Đặt lịch khám
                </Button>
            </Drawer>
        </>
    );
}

export default Header;