import { Card, Row, Col, Statistic, Typography, Tag } from "antd";
import {
    CalendarOutlined, ShoppingCartOutlined,
    UserOutlined, DollarOutlined, RiseOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../../contexts/useAuth";

const { Title, Text } = Typography;
const PRIMARY = "#f97316";

const STATS = [
    { title: "Lịch hẹn hôm nay",  value: 12,        icon: <CalendarOutlined />,      color: "#f97316", bg: "#fff7ed" },
    { title: "Đơn hàng mới",       value: 8,         icon: <ShoppingCartOutlined />,  color: "#3b82f6", bg: "#eff6ff" },
    { title: "Khách hàng mới",     value: 5,         icon: <UserOutlined />,          color: "#22c55e", bg: "#f0fdf4" },
    { title: "Doanh thu hôm nay",  value: "2.4M₫",   icon: <DollarOutlined />,        color: "#a855f7", bg: "#fdf4ff" },
];

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div>
            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
                <Title level={3} style={{ margin: 0, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    Xin chào, {user?.fullName} 👋
                </Title>
                <Text style={{ color: "#6b7280" }}>
                    Đây là tổng quan hoạt động hôm nay của PooGi
                </Text>
            </div>

            {/* Stat cards */}
            <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
                {STATS.map((s) => (
                    <Col xs={12} lg={6} key={s.title}>
                        <Card bordered={false} style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Statistic
                                    title={<span style={{ fontSize: 13, color: "#6b7280", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{s.title}</span>}
                                    value={s.value}
                                    valueStyle={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'Be Vietnam Pro', sans-serif" }}
                                />
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: s.color }}>
                                    {s.icon}
                                </div>
                            </div>
                            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                <RiseOutlined style={{ color: "#22c55e", fontSize: 12 }} />
                                <Text style={{ fontSize: 12, color: "#22c55e" }}>+12% so với hôm qua</Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Placeholder for charts - sẽ hoàn thiện tuần 6 */}
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<span style={{ fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif" }}>Doanh thu theo tuần</span>}
                        bordered={false}
                        style={{ borderRadius: 16, border: "1.5px solid #f3f4f6" }}
                    >
                        <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
                            📊 Biểu đồ doanh thu sẽ được tích hợp ở Tuần 6
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card
                        title={<span style={{ fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif" }}>Lịch hẹn gần đây</span>}
                        bordered={false}
                        style={{ borderRadius: 16, border: "1.5px solid #f3f4f6", height: "100%" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                { name: "Milo 🐶", owner: "Ngọc Anh", time: "09:00", status: "Confirmed" },
                                { name: "Luna 🐱", owner: "Minh Tuấn", time: "10:30", status: "Pending" },
                                { name: "Bông 🐩", owner: "Thu Hương", time: "14:00", status: "Pending" },
                            ].map((apt, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#fafafa", borderRadius: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{apt.name}</div>
                                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{apt.owner} · {apt.time}</div>
                                    </div>
                                    <Tag color={apt.status === "Confirmed" ? "green" : "orange"} style={{ borderRadius: 6 }}>
                                        {apt.status === "Confirmed" ? "Xác nhận" : "Chờ duyệt"}
                                    </Tag>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}